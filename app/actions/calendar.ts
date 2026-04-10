'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import type { Meeting, CalendarEvent, AvailableSlot } from '@/lib/types';

const meetingsCol = () => adminDb.collection('meetings');

// ─── CRUD ────────────────────────────────────────────────────────────────────

/** Create a meeting. Only the project leader (organiser) can create. */
export async function createMeeting(data: {
  projectId: string;
  projectTitle: string;
  title: string;
  description: string;
  type: Meeting['type'];
  startTime: string;
  endTime: string;
  timezone: string;
  attendeeIds: string[];
  location: string;
  locationType: Meeting['locationType'];
}): Promise<{ id: string } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { error: 'Not authenticated' };

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const meeting: Meeting = {
    id,
    ...data,
    organizerId: session.userId,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  };

  await meetingsCol().doc(id).set(meeting);
  return { id };
}

/** List meetings for the current user (organiser or attendee). */
export async function listMyMeetings(): Promise<Meeting[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  try {
    // Fetch meetings where user is organiser
    const orgSnap = await meetingsCol()
      .where('organizerId', '==', session.userId)
      .get();

    // Fetch meetings where user is attendee
    const attSnap = await meetingsCol()
      .where('attendeeIds', 'array-contains', session.userId)
      .get();

    const map = new Map<string, Meeting>();
    for (const doc of [...orgSnap.docs, ...attSnap.docs]) {
      const m = doc.data() as Meeting;
      map.set(m.id, m);
    }

    const meetings = Array.from(map.values());
    meetings.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return meetings;
  } catch (err) {
    console.error('listMyMeetings error:', err);
    return [];
  }
}

/** List meetings for a specific project. */
export async function listProjectMeetings(projectId: string): Promise<Meeting[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  try {
    const snap = await meetingsCol()
      .where('projectId', '==', projectId)
      .get();

    const meetings = snap.docs.map((d) => d.data() as Meeting);
    meetings.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return meetings;
  } catch (err) {
    console.error('listProjectMeetings error:', err);
    return [];
  }
}

/** Cancel a meeting. */
export async function cancelMeeting(meetingId: string): Promise<{ ok: true } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { error: 'Not authenticated' };

  const doc = await meetingsCol().doc(meetingId).get();
  if (!doc.exists) return { error: 'Meeting not found' };

  const meeting = doc.data() as Meeting;
  if (meeting.organizerId !== session.userId) return { error: 'Only the organiser can cancel' };

  await meetingsCol().doc(meetingId).update({
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}

// ─── Calendar Events ─────────────────────────────────────────────────────────

/** Build CalendarEvent list for the current user. */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const meetings = await listMyMeetings();
  return meetings
    .filter((m) => m.status !== 'cancelled')
    .map((m) => ({
      id: m.id,
      title: m.title,
      start: m.startTime,
      end: m.endTime,
      type: 'meeting' as const,
      meetingId: m.id,
      projectTitle: m.projectTitle,
    }));
}

// ─── Scan Calendar (find common free slots) ──────────────────────────────────

interface MemberAvailability {
  userId: string;
  timezone: string;
  events: { start: string; end: string }[];
}

/**
 * Scan calendars of multiple team members and find common free slots.
 *
 * @param attendeeIds - user IDs of team members to coordinate
 * @param rangeStartISO - start of the search window (ISO string)
 * @param rangeEndISO   - end of the search window (ISO string)
 * @param minDurationMin - minimum slot duration in minutes (default 30)
 * @param workingHoursStart - earliest hour in each member's local tz (default 9)
 * @param workingHoursEnd   - latest hour in each member's local tz (default 17)
 */
export async function scanCalendarSlots(opts: {
  attendeeIds: string[];
  rangeStartISO: string;
  rangeEndISO: string;
  minDurationMin?: number;
  workingHoursStart?: number;
  workingHoursEnd?: number;
  callerTimezone?: string;
}): Promise<AvailableSlot[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  try {
  const {
    attendeeIds,
    rangeStartISO,
    rangeEndISO,
    minDurationMin = 30,
    workingHoursStart = 9,
    workingHoursEnd = 17,
    callerTimezone = 'UTC',
  } = opts;

  // "now" in absolute UTC ms — used to exclude past slots
  const nowMs = Date.now();

  // Include the current user
  const allIds = [...new Set([session.userId, ...attendeeIds])];

  // 1. Collect each member's timezone + existing meetings
  const memberData: MemberAvailability[] = [];

  for (const uid of allIds) {
    // Get profile timezone; fall back to callerTimezone for the requesting user
    const profileDoc = await adminDb.collection('profiles').doc(uid).get();
    const fallbackTz = uid === session.userId ? callerTimezone : 'UTC';
    const tz = profileDoc.exists ? profileDoc.data()?.timezone || fallbackTz : fallbackTz;

    // Get their meetings in the range
    const orgSnap = await meetingsCol()
      .where('organizerId', '==', uid)
      .get();
    const attSnap = await meetingsCol()
      .where('attendeeIds', 'array-contains', uid)
      .get();

    const evtMap = new Map<string, { start: string; end: string }>();
    for (const d of [...orgSnap.docs, ...attSnap.docs]) {
      const m = d.data() as Meeting;
      if (m.status === 'cancelled') continue;
      // Only include meetings in range
      if (m.endTime < rangeStartISO || m.startTime > rangeEndISO) continue;
      evtMap.set(m.id, { start: m.startTime, end: m.endTime });
    }

    memberData.push({ userId: uid, timezone: tz, events: Array.from(evtMap.values()) });
  }

  // 2. Build candidate 30-min intervals across the range
  const rangeStart = new Date(rangeStartISO).getTime();
  const rangeEnd = new Date(rangeEndISO).getTime();
  const INTERVAL = 30 * 60 * 1000; // 30 min

  const freeIntervals: { start: number; end: number }[] = [];

  for (let t = rangeStart; t + INTERVAL <= rangeEnd; t += INTERVAL) {
    const intervalStart = t;
    const intervalEnd = t + INTERVAL;

    let allFree = true;

    for (const member of memberData) {
      // Check working hours in member's timezone
      const localStart = toLocalHour(intervalStart, member.timezone);
      const localEnd = toLocalHour(intervalEnd, member.timezone);

      if (localStart < workingHoursStart || localEnd > workingHoursEnd) {
        allFree = false;
        break;
      }

      // Check day of week (skip weekends)
      const dayOfWeek = toLocalDayOfWeek(intervalStart, member.timezone);
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        allFree = false;
        break;
      }

      // Check clashes with existing meetings
      for (const evt of member.events) {
        const evtStart = new Date(evt.start).getTime();
        const evtEnd = new Date(evt.end).getTime();
        if (intervalStart < evtEnd && intervalEnd > evtStart) {
          allFree = false;
          break;
        }
      }
      if (!allFree) break;
    }

    if (allFree) {
      freeIntervals.push({ start: intervalStart, end: intervalEnd });
    }
  }

  // 3. Merge consecutive intervals into slots
  const slots: AvailableSlot[] = [];
  let i = 0;
  while (i < freeIntervals.length) {
    const slotStart = freeIntervals[i].start;
    let slotEnd = freeIntervals[i].end;
    while (i + 1 < freeIntervals.length && freeIntervals[i + 1].start === slotEnd) {
      i++;
      slotEnd = freeIntervals[i].end;
    }
    const durationMinutes = (slotEnd - slotStart) / (1000 * 60);
    if (durationMinutes >= minDurationMin) {
      slots.push({
        start: new Date(slotStart).toISOString(),
        end: new Date(slotEnd).toISOString(),
        durationMinutes,
      });
    }
    i++;
  }

  // 4. Filter out slots that are already in the past
  const futureSlots = slots.filter((s) => new Date(s.end).getTime() > nowMs);

  return futureSlots.slice(0, 50); // cap results
  } catch (err) {
    console.error('scanCalendarSlots error:', err);
    return [];
  }
}

// ─── Timezone helpers ────────────────────────────────────────────────────────

function toLocalHour(timestamp: number, tz: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23', // 0-23, avoids "24" for midnight
    }).formatToParts(new Date(timestamp));
    let hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    if (hour === 24) hour = 0; // safety fallback
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    return hour + minute / 60;
  } catch {
    return new Date(timestamp).getUTCHours();
  }
}

function toLocalDayOfWeek(timestamp: number, tz: string): number {
  try {
    // Get the full local date in the target timezone, then derive the day of week
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(timestamp));
    const y = parseInt(parts.find((p) => p.type === 'year')?.value || '2000', 10);
    const m = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10) - 1;
    const d = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
    return new Date(y, m, d).getDay();
  } catch {
    return new Date(timestamp).getUTCDay();
  }
}
