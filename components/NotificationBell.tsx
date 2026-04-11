'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  CalendarDays,
  KeyRound,
  Video,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  getUpcomingMeetingReminders,
} from '@/app/actions/notifications';
import type { Notification } from '@/lib/types';

interface ReminderToast {
  id: string;
  title: string;
  minutesUntil: number;
  meetingLink?: string;
  accessCode?: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<ReminderToast[]>([]);
  const shownReminderIds = useRef(new Set<string>());
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Poll for unread count every 30s
  useEffect(() => {
    const fetchCount = () => getUnreadCount().then(setUnread).catch(() => {});
    fetchCount();
    const iv = setInterval(fetchCount, 30_000);
    return () => clearInterval(iv);
  }, []);

  // Poll for 5-min meeting reminders every 60s
  useEffect(() => {
    const checkReminders = async () => {
      try {
        const upcoming = await getUpcomingMeetingReminders(5);
        const newReminders: ReminderToast[] = [];
        for (const n of upcoming) {
          if (shownReminderIds.current.has(n.id)) continue;
          shownReminderIds.current.add(n.id);
          const minutesUntil = Math.max(
            1,
            Math.round(
              (new Date(n.meetingStartTime!).getTime() - Date.now()) / 60_000,
            ),
          );
          newReminders.push({
            id: n.id,
            title: n.title,
            minutesUntil,
            meetingLink: n.meetingLink,
            accessCode: n.accessCode,
          });
        }
        if (newReminders.length > 0) {
          setReminders((prev) => [...prev, ...newReminders]);
        }
      } catch {}
    };
    checkReminders();
    const iv = setInterval(checkReminders, 60_000);
    return () => clearInterval(iv);
  }, []);

  const dismissReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Load notifications when panel opens
  const handleOpen = useCallback(async () => {
    setOpen((v) => !v);
    if (!open) {
      setLoading(true);
      const notifs = await listMyNotifications(20);
      setNotifications(notifs);
      setLoading(false);
    }
  }, [open]);

  const handleRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <>
      {/* ── Meeting reminder toasts ── */}
      {reminders.length > 0 && (
        <div className="fixed right-4 top-20 z-[100] flex flex-col gap-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="animate-in slide-in-from-right w-80 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-lg dark:border-amber-700 dark:bg-amber-950"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Starting in {r.minutesUntil} min
                  </span>
                </div>
                <button
                  onClick={() => dismissReminder(r.id)}
                  className="rounded p-0.5 text-amber-400 hover:text-amber-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-amber-900 dark:text-amber-200">
                {r.title}
              </p>
              {r.accessCode && (
                <div className="mt-2 flex items-center gap-1.5">
                  <KeyRound className="h-3 w-3 text-amber-600" />
                  <code className="text-xs font-bold tracking-widest text-amber-800 dark:text-amber-300">
                    {r.accessCode}
                  </code>
                </div>
              )}
              {r.meetingLink && (
                <a
                  href={r.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <Video className="h-3 w-3" />
                  Join Meeting
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Bell + dropdown ── */}
      <div ref={panelRef} className="relative">
        <button
          onClick={handleOpen}
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:w-96">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Notifications
              </h3>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-xs text-slate-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30',
                      !n.read && 'bg-indigo-50/50 dark:bg-indigo-900/10',
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'meeting_invite' ? (
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                      ) : n.type === 'meeting_reminder' ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Bell className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {n.body}
                      </p>
                      {n.accessCode && (
                        <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 dark:bg-amber-900/30">
                          <KeyRound className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                          <code className="text-[10px] font-bold tracking-widest text-amber-800 dark:text-amber-300">
                            {n.accessCode}
                          </code>
                        </div>
                      )}
                      {n.meetingLink && (
                        <a
                          href={n.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          <Video className="h-2.5 w-2.5" />
                          {n.meetingLink}
                        </a>
                      )}
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {formatTime(n.createdAt)}
                        </span>
                        {n.href && (
                          <Link
                            href={n.href}
                            onClick={() => { handleRead(n.id); setOpen(false); }}
                            className="text-[10px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            View
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            onClick={() => handleRead(n.id)}
                            className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-slate-600"
                          >
                            <Check className="h-2.5 w-2.5" />
                            Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-4 py-2 dark:border-slate-800">
              <Link
                href="/dashboard/calendar"
                onClick={() => setOpen(false)}
                className="block text-center text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View Calendar
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
