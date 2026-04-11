'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import type { Meeting, CalendarEvent, AvailableSlot } from '@/lib/types';
import { notifyMeetingAttendees } from '@/app/actions/notifications';
import { sendEmail } from '@/lib/email/resend';

const meetingsCol = () => adminDb.collection('meetings');

/** Generate a one-time XXXX-XXXX access code. */
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

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
}): Promise<{ id: string; accessCode: string } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { error: 'Not authenticated' };

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const accessCode = generateAccessCode();

  const meeting: Meeting = {
    id,
    ...data,
    organizerId: session.userId,
    status: 'scheduled',
    accessCode,
    createdAt: now,
    updatedAt: now,
  };

  await meetingsCol().doc(id).set(meeting);

  // ── Notify attendees ──────────────────────────────────────────────────────
  // Resolve organiser name for the notification body
  let organizerName = 'A project leader';
  try {
    const orgProfile = await adminDb.collection('profiles').doc(session.userId).get();
    if (orgProfile.exists) organizerName = orgProfile.data()?.fullName || organizerName;
  } catch { /* fallback to default */ }

  // 1. In-app notifications (includes access code + meeting link)
  if (data.attendeeIds.length > 0) {
    await notifyMeetingAttendees({
      meetingId: id,
      projectId: data.projectId,
      projectTitle: data.projectTitle,
      meetingTitle: data.title,
      organizerName,
      attendeeIds: data.attendeeIds,
      accessCode,
      meetingLink: data.location,
      startTime: data.startTime,
      endTime: data.endTime,
    });
  }

  // 2. Create calendar events for each attendee (so meeting shows on their calendar)
  const calBatch = adminDb.batch();
  for (const uid of data.attendeeIds) {
    const evtId = crypto.randomUUID();
    calBatch.set(adminDb.collection('calendarEvents').doc(evtId), {
      id: evtId,
      userId: uid,
      title: data.title,
      start: data.startTime,
      end: data.endTime,
      type: 'meeting',
      meetingId: id,
      projectTitle: data.projectTitle,
      createdAt: now,
    });
  }
  // Also create one for the organiser
  const orgEvtId = crypto.randomUUID();
  calBatch.set(adminDb.collection('calendarEvents').doc(orgEvtId), {
    id: orgEvtId,
    userId: session.userId,
    title: data.title,
    start: data.startTime,
    end: data.endTime,
    type: 'meeting',
    meetingId: id,
    projectTitle: data.projectTitle,
    createdAt: now,
  });
  await calBatch.commit();

  // 3. Send email notifications (fire-and-forget — don't block on failure)
  const startDate = new Date(data.startTime);
  const dateStr = startDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  for (const uid of data.attendeeIds) {
    adminDb.collection('users').where('id', '==', uid).limit(1).get().then((snap) => {
      if (!snap.empty) {
        const email = snap.docs[0].data().email;
        if (email) {
          sendEmail({
            to: email,
            template: 'meeting_invite',
            data: {
              organizerName,
              meetingTitle: data.title,
              projectTitle: data.projectTitle,
              dateTime: `${dateStr} at ${timeStr}`,
              accessCode,
              meetingLink: data.location,
              calendarUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://venture-connect-nine.vercel.app'}/dashboard/calendar`,
            },
          });
        }
      }
    }).catch(() => {});
  }

  return { id, accessCode };
}

/** Verify a one-time access code for a project.
 *  Returns true if any non-cancelled meeting for this project has a matching code. */
export async function verifyProjectAccessCode(
  projectId: string,
  code: string
): Promise<boolean> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return false;

  try {
    const snap = await meetingsCol()
      .where('projectId', '==', projectId)
      .where('accessCode', '==', code.replace(/[\s-]/g, '').toUpperCase()
        .replace(/^(.{4})/, '$1-')) // normalise to XXXX-XXXX
      .limit(1)
      .get();

    if (snap.empty) return false;

    const meeting = snap.docs[0].data() as Meeting;
    return meeting.status !== 'cancelled';
  } catch (err) {
    console.error('verifyProjectAccessCode error:', err);
    return false;
  }
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

/** Cancel a meeting. Notifies attendees & removes calendar markers. */
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

  // ── Resolve organiser name ─────────────────────────────────────────────
  let organizerName = 'The project leader';
  try {
    const orgProfile = await adminDb.collection('profiles').doc(session.userId).get();
    if (orgProfile.exists) organizerName = orgProfile.data()?.fullName || organizerName;
  } catch { /* fallback */ }

  // ── 1. Send cancellation notifications to all attendees ────────────────
  const { createNotification } = await import('@/app/actions/notifications');
  const notifPromises = meeting.attendeeIds.map((uid) =>
    createNotification({
      userId: uid,
      type: 'meeting_cancelled',
      title: `Meeting Cancelled: ${meeting.title}`,
      body: `${organizerName} cancelled "${meeting.title}" for project "${meeting.projectTitle}".`,
      meetingId: meeting.id,
      projectId: meeting.projectId,
      href: '/dashboard/calendar',
    }),
  );
  await Promise.all(notifPromises);

  // ── 2. Delete calendar events for all participants ─────────────────────
  try {
    const calSnap = await adminDb
      .collection('calendarEvents')
      .where('meetingId', '==', meetingId)
      .get();

    if (!calSnap.empty) {
      const batch = adminDb.batch();
      calSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.error('Failed to delete calendar events for cancelled meeting:', err);
  }

  // ── 3. Send cancellation emails (fire-and-forget) ─────────────────────
  const startDate = new Date(meeting.startTime);
  const dateStr = startDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  for (const uid of meeting.attendeeIds) {
    adminDb.collection('users').where('id', '==', uid).limit(1).get().then((snap) => {
      if (!snap.empty) {
        const email = snap.docs[0].data().email;
        if (email) {
          sendEmail({
            to: email,
            template: 'meeting_cancelled',
            data: {
              organizerName,
              meetingTitle: meeting.title,
              projectTitle: meeting.projectTitle,
              dateTime: `${dateStr} at ${timeStr}`,
              calendarUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://venture-connect-nine.vercel.app'}/dashboard/calendar`,
            },
          });
        }
      }
    }).catch(() => {});
  }

  return { ok: true };
}

// ─── Calendar Events ─────────────────────────────────────────────────────────

/** Build CalendarEvent list for the current user. */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  const events: CalendarEvent[] = [];

  // 1. From meetings collection (organiser or attendee)
  const meetings = await listMyMeetings();
  for (const m of meetings) {
    if (m.status === 'cancelled') continue;
    events.push({
      id: m.id,
      title: m.title,
      start: m.startTime,
      end: m.endTime,
      type: 'meeting' as const,
      meetingId: m.id,
      projectTitle: m.projectTitle,
    });
  }

  // 2. From calendarEvents collection (events created specifically for this user)
  try {
    const snap = await adminDb
      .collection('calendarEvents')
      .where('userId', '==', session.userId)
      .get();

    for (const doc of snap.docs) {
      const d = doc.data();
      // Avoid duplicates — skip if we already have this meetingId
      if (d.meetingId && events.some((e) => e.meetingId === d.meetingId)) continue;
      events.push({
        id: d.id,
        title: d.title,
        start: d.start,
        end: d.end,
        type: d.type || 'meeting',
        meetingId: d.meetingId,
        projectTitle: d.projectTitle,
      });
    }
  } catch (err) {
    console.error('getCalendarEvents calendarEvents error:', err);
  }

  events.sort((a, b) => a.start.localeCompare(b.start));
  return events;
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
    workingHoursEnd = 22,
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

  // 3. Merge consecutive free intervals into contiguous blocks, then
  //    slice each block into fixed-duration slots matching the requested length.
  const durationMs = minDurationMin * 60 * 1000;
  const slots: AvailableSlot[] = [];
  let i = 0;
  while (i < freeIntervals.length) {
    const blockStart = freeIntervals[i].start;
    let blockEnd = freeIntervals[i].end;
    while (i + 1 < freeIntervals.length && freeIntervals[i + 1].start === blockEnd) {
      i++;
      blockEnd = freeIntervals[i].end;
    }
    // Slice the block into fixed-duration slots
    for (let s = blockStart; s + durationMs <= blockEnd; s += durationMs) {
      slots.push({
        start: new Date(s).toISOString(),
        end: new Date(s + durationMs).toISOString(),
        durationMinutes: minDurationMin,
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

