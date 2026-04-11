'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import type { Notification } from '@/lib/types';

const notificationsCol = () => adminDb.collection('notifications');

// ─── Create ─────────────────────────────────────────────────────────────────

/** Create a notification for a specific user. */
export async function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'read'>,
): Promise<string> {
  const id = crypto.randomUUID();
  const notification: Notification = {
    ...data,
    id,
    read: false,
    createdAt: new Date().toISOString(),
  };
  await notificationsCol().doc(id).set(notification);
  return id;
}

/** Create meeting invite notifications for multiple attendees. */
export async function notifyMeetingAttendees(opts: {
  meetingId: string;
  projectId: string;
  projectTitle: string;
  meetingTitle: string;
  organizerName: string;
  attendeeIds: string[];
  accessCode: string;
  meetingLink: string;
  startTime: string;
  endTime: string;
}): Promise<void> {
  const promises = opts.attendeeIds.map((userId) =>
    createNotification({
      userId,
      type: 'meeting_invite',
      title: `Meeting: ${opts.meetingTitle}`,
      body: `${opts.organizerName} invited you to "${opts.meetingTitle}" for project "${opts.projectTitle}". Access code: ${opts.accessCode}`,
      meetingId: opts.meetingId,
      projectId: opts.projectId,
      accessCode: opts.accessCode,
      meetingLink: opts.meetingLink,
      meetingStartTime: opts.startTime,
      meetingEndTime: opts.endTime,
      href: '/dashboard/calendar',
    }),
  );
  await Promise.all(promises);
}

// ─── Read ───────────────────────────────────────────────────────────────────

/** List notifications for the current user, newest first. */
export async function listMyNotifications(limit = 30): Promise<Notification[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  try {
    const snap = await notificationsCol()
      .where('userId', '==', session.userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map((d) => d.data() as Notification);
  } catch (err) {
    console.error('listMyNotifications error:', err);
    return [];
  }
}

/** Get count of unread notifications. */
export async function getUnreadCount(): Promise<number> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return 0;

  try {
    const snap = await notificationsCol()
      .where('userId', '==', session.userId)
      .where('read', '==', false)
      .get();
    return snap.size;
  } catch (err) {
    console.error('getUnreadCount error:', err);
    return 0;
  }
}

/** Get upcoming meeting reminders (meetings starting within `withinMinutes`). */
export async function getUpcomingMeetingReminders(withinMinutes = 5): Promise<Notification[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  try {
    const now = new Date();
    const threshold = new Date(now.getTime() + withinMinutes * 60 * 1000);

    // Query meeting_invite notifications that have a meetingStartTime
    const snap = await notificationsCol()
      .where('userId', '==', session.userId)
      .where('type', 'in', ['meeting_invite', 'meeting_reminder'])
      .get();

    return snap.docs
      .map((d) => d.data() as Notification)
      .filter((n) => {
        if (!n.meetingStartTime) return false;
        const start = new Date(n.meetingStartTime);
        return start > now && start <= threshold;
      });
  } catch (err) {
    console.error('getUpcomingMeetingReminders error:', err);
    return [];
  }
}

// ─── Update ─────────────────────────────────────────────────────────────────

/** Mark a single notification as read. */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return;

  const doc = await notificationsCol().doc(notificationId).get();
  if (!doc.exists) return;
  const notif = doc.data() as Notification;
  if (notif.userId !== session.userId) return;

  await notificationsCol().doc(notificationId).update({ read: true });
}

/** Mark all notifications as read. */
export async function markAllRead(): Promise<void> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return;

  const snap = await notificationsCol()
    .where('userId', '==', session.userId)
    .where('read', '==', false)
    .get();

  const batch = adminDb.batch();
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}
