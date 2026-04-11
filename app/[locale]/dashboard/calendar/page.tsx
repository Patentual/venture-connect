'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  CalendarDays,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Loader2,
  CheckCircle2,
  X,
  Sparkles,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { getWorkspaceData, type TeamMemberData } from '@/app/actions/workspace';
import {
  getCalendarEvents,
  listMyMeetings,
  createMeeting,
  cancelMeeting,
  scanCalendarSlots,
} from '@/app/actions/calendar';
import { listMyProjects, type ProjectSummary } from '@/app/actions/projects';
import type { Meeting, CalendarEvent, AvailableSlot } from '@/lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const t = useTranslations('calendar');

  // Data
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar navigation
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Modals / panels
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [showScanPanel, setShowScanPanel] = useState(false);

  // New meeting form
  type VideoProvider = 'venturenex' | 'zoom' | 'teams' | 'meet' | 'webex' | 'other';
  const providerPlaceholders: Record<VideoProvider, string> = {
    venturenex: '',
    zoom: 'https://zoom.us/j/...',
    teams: 'https://teams.microsoft.com/l/meetup-join/...',
    meet: 'https://meet.google.com/abc-defg-hij',
    webex: 'https://meet.webex.com/meet/...',
    other: 'https://...',
  };
  const generateMeetLink = () => `https://meet.venturenex.com/${crypto.randomUUID().slice(0, 8)}`;
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    type: 'team' as Meeting['type'],
    date: toInputDate(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: generateMeetLink(),
    locationType: 'virtual' as Meeting['locationType'],
    videoCallProvider: 'venturenex' as VideoProvider,
    attendeeIds: [] as string[],
  });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [lastAccessCode, setLastAccessCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch team members when project changes
  useEffect(() => {
    if (!form.projectId) {
      setTeamMembers([]);
      return;
    }
    let cancelled = false;
    setLoadingMembers(true);
    getWorkspaceData(form.projectId)
      .then((ws) => {
        if (!cancelled) {
          setTeamMembers(ws.teamMembers.filter((m) => m.status === 'active'));
        }
      })
      .catch(() => { if (!cancelled) setTeamMembers([]); })
      .finally(() => { if (!cancelled) setLoadingMembers(false); });
    return () => { cancelled = true; };
  }, [form.projectId]);

  // Scan calendar
  const [scanFrom, setScanFrom] = useState(toInputDate(new Date()));
  const [scanTo, setScanTo] = useState(toInputDate(new Date(Date.now() + 7 * 86400000)));
  const [scanMinDuration, setScanMinDuration] = useState(60);
  const [scanWorkStart, setScanWorkStart] = useState(9);
  const [scanWorkEnd, setScanWorkEnd] = useState(22);
  const [scanning, setScanning] = useState(false);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

  // ─── Fetch data ────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, e, p] = await Promise.all([
        listMyMeetings().catch(() => [] as Meeting[]),
        getCalendarEvents().catch(() => [] as CalendarEvent[]),
        listMyProjects().catch(() => [] as ProjectSummary[]),
      ]);
      setMeetings(m);
      setEvents(e);
      setProjects(p);
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Create meeting ────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.title || !form.projectId) return;
    setCreating(true);

    try {
      const proj = projects.find((p) => p.id === form.projectId);
      const startISO = new Date(`${form.date}T${form.startTime}`).toISOString();
      const endISO = new Date(`${form.date}T${form.endTime}`).toISOString();

      const result = await createMeeting({
        projectId: form.projectId,
        projectTitle: proj?.title || '',
        title: form.title,
        description: form.description,
        type: form.type,
        startTime: startISO,
        endTime: endISO,
        timezone: form.timezone,
        attendeeIds: form.attendeeIds,
        location: form.location,
        locationType: form.locationType,
      });

      if ('id' in result && 'accessCode' in result) {
        setCreated(true);
        setLastAccessCode(result.accessCode);
        fetchData();
      }
    } catch (err) {
      console.error('handleCreate error:', err);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setForm({
      projectId: '',
      title: '',
      description: '',
      type: 'team',
      date: toInputDate(new Date()),
      startTime: '09:00',
      endTime: '10:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: generateMeetLink(),
      locationType: 'virtual',
      videoCallProvider: 'venturenex',
      attendeeIds: [],
    });
  };

  // ─── Scan calendar ─────────────────────────────────────────────────────────

  const handleScan = async () => {
    setScanning(true);
    setSlotsLoaded(false);

    try {
      // Use attendees selected in the meeting form (if any)
      const attendeeIds = form.attendeeIds;

      const result = await scanCalendarSlots({
        attendeeIds,
        rangeStartISO: new Date(`${scanFrom}T00:00:00`).toISOString(),
        rangeEndISO: new Date(`${scanTo}T23:59:59`).toISOString(),
        minDurationMin: scanMinDuration,
        workingHoursStart: scanWorkStart,
        workingHoursEnd: scanWorkEnd,
        callerTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setSlots(result);
      setSlotsLoaded(true);
    } catch (err) {
      console.error('handleScan error:', err);
      setSlots([]);
      setSlotsLoaded(true);
    } finally {
      setScanning(false);
    }
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    const start = new Date(slot.start);
    setForm((prev) => ({
      ...prev,
      date: toInputDate(start),
      startTime: start.toTimeString().slice(0, 5),
      endTime: new Date(start.getTime() + Math.min(60, slot.durationMinutes) * 60000)
        .toTimeString()
        .slice(0, 5),
    }));
    setShowScanPanel(false);
    setShowNewMeeting(true);
  };

  // ─── Cancel meeting ────────────────────────────────────────────────────────

  const handleCancel = async (id: string) => {
    await cancelMeeting(id);
    fetchData();
  };

  // ─── Calendar grid helpers ─────────────────────────────────────────────────

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthNames = [
    t('months.january'), t('months.february'), t('months.march'),
    t('months.april'), t('months.may'), t('months.june'),
    t('months.july'), t('months.august'), t('months.september'),
    t('months.october'), t('months.november'), t('months.december'),
  ];
  const dayNames = [
    t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'),
    t('days.thu'), t('days.fri'), t('days.sat'),
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const [sy, sm, sd] = selectedDate.split('-').map(Number);
    return sd === day && sm - 1 === month && sy === year;
  };

  const dayHasEvent = (day: number) =>
    meetings.some((m) => {
      if (m.status === 'cancelled') return false;
      const d = new Date(m.startTime);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

  const getEventsForDate = (dateStr: string) =>
    meetings.filter((m) => {
      if (m.status === 'cancelled') return false;
      return m.startTime.startsWith(dateStr);
    });

  const upcomingMeetings = meetings
    .filter((m) => m.status !== 'cancelled' && m.startTime >= new Date().toISOString())
    .slice(0, 10);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowScanPanel(true); setShowNewMeeting(false); }}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
          >
            <Search className="h-4 w-4" />
            {t('scanCalendar')}
          </button>
          <button
            onClick={() => { setShowNewMeeting(true); setShowScanPanel(false); }}
            className="animated-gradient flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            {t('newMeeting')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left: Calendar + events ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Month calendar */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900">
              {/* Month nav */}
              <div className="mb-4 flex items-center justify-between">
                <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {monthNames[month]} {year}
                </h2>
                <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                {dayNames.map((d) => (
                  <div key={d} className="py-2">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-px">
                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    disabled={day === null}
                    onClick={() => day && setSelectedDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                    className={cn(
                      'relative flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                      day === null && 'cursor-default',
                      day !== null && 'hover:bg-slate-100 dark:hover:bg-slate-800',
                      isToday(day!) && 'bg-blue-500 text-white hover:bg-blue-600',
                      isSelected(day!) && !isToday(day!) && 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
                      !isToday(day!) && !isSelected(day!) && 'text-slate-700 dark:text-slate-300',
                    )}
                  >
                    {day}
                    {day && dayHasEvent(day) && (
                      <span className={cn(
                        'absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full',
                        isToday(day) ? 'bg-white' : 'bg-indigo-500'
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Events for selected date */}
            {selectedDate && (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900">
                <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                  {formatDateLong(selectedDate + 'T00:00:00')}
                </h3>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-xs text-slate-400">{t('noMeetings')}</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEvents.map((m) => (
                      <MeetingCard key={m.id} meeting={m} onCancel={handleCancel} t={t} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            {/* Scan Calendar Panel */}
            {showScanPanel && (
              <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-5 dark:border-blue-800/60 dark:bg-blue-900/10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300">{t('scanCalendar')}</h3>
                  </div>
                  <button onClick={() => setShowScanPanel(false)} className="rounded-lg p-1 text-blue-400 hover:text-blue-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mb-4 text-xs text-blue-700 dark:text-blue-400">{t('scanSubtitle')}</p>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('from')}</span>
                      <input type="date" value={scanFrom} onChange={(e) => setScanFrom(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('to')}</span>
                      <input type="date" value={scanTo} onChange={(e) => setScanTo(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('duration')}</span>
                    <select value={scanMinDuration} onChange={(e) => setScanMinDuration(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option value={30}>30 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                      <option value={120}>120 min</option>
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('workingHours')} (start)</span>
                      <select value={scanWorkStart} onChange={(e) => setScanWorkStart(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('workingHours')} (end)</span>
                      <select value={scanWorkEnd} onChange={(e) => setScanWorkEnd(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {scanning ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {t('scanning')}</>
                    ) : (
                      <><Search className="h-4 w-4" /> {t('scanCalendar')}</>
                    )}
                  </button>
                </div>

                {/* Scan results */}
                {slotsLoaded && (
                  <div className="mt-4">
                    {slots.length === 0 ? (
                      <p className="text-xs text-slate-500">{t('noSlotsFound')}</p>
                    ) : (
                      <>
                        <p className="mb-2 text-xs font-semibold text-green-700 dark:text-green-400">
                          {t('slotsFound', { count: slots.length })}
                        </p>
                        <p className="mb-3 text-xs text-slate-500">{t('selectSlot')}</p>
                        <div className="max-h-64 space-y-1.5 overflow-y-auto">
                          {slots.map((slot, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSlotSelect(slot)}
                              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                            >
                              <div>
                                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {formatDate(slot.start)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatTime(slot.start)} – {formatTime(slot.end)}
                                </p>
                              </div>
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                {slot.durationMinutes} min
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* New Meeting Form */}
            {showNewMeeting && (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('newMeeting')}</h3>
                  <button onClick={() => setShowNewMeeting(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Project */}
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('project')} <span className="text-red-500">*</span></span>
                    <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value, attendeeIds: [] })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option value="">{t('selectProject')}</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </label>

                  {/* Attendees */}
                  {form.projectId && (
                    <div className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        <Users className="mr-1 inline h-3 w-3" />
                        Attendees
                      </span>
                      {loadingMembers ? (
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <Loader2 className="h-3 w-3 animate-spin" /> Loading team…
                        </div>
                      ) : teamMembers.length === 0 ? (
                        <p className="mt-1 text-xs text-slate-400">No team members found.</p>
                      ) : (
                        <div className="mt-1.5 max-h-32 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/50">
                          {teamMembers.map((m) => (
                            <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
                              <input
                                type="checkbox"
                                checked={form.attendeeIds.includes(m.id)}
                                onChange={(e) => {
                                  const ids = e.target.checked
                                    ? [...form.attendeeIds, m.id]
                                    : form.attendeeIds.filter((id) => id !== m.id);
                                  setForm({ ...form, attendeeIds: ids });
                                }}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span
                                className={cn(
                                  'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white',
                                  `bg-gradient-to-br ${m.color}`
                                )}
                              >
                                {m.initials}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300">{m.name}</span>
                              <span className="ml-auto text-[10px] text-slate-400">{m.role}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('meetingTitle')} <span className="text-red-500">*</span></span>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('meetingTitlePlaceholder')} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </label>

                  {/* Description */}
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('description')} <span className="text-red-500">*</span></span>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('descriptionPlaceholder')} rows={2} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </label>

                  {/* Type */}
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('meetingType')}</span>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Meeting['type'] })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option value="team">{t('typeTeam')}</option>
                      <option value="investor">{t('typeInvestor')}</option>
                      <option value="external">{t('typeExternal')}</option>
                    </select>
                  </label>

                  {/* Date + Times */}
                  <div className="grid grid-cols-3 gap-2">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('date')}</span>
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('startTime')}</span>
                      <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('endTime')}</span>
                      <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                    </label>
                  </div>

                  {/* Location type */}
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('locationType')}</span>
                    <select value={form.locationType} onChange={(e) => {
                      const lt = e.target.value as Meeting['locationType'];
                      if (lt === 'physical') {
                        setForm({ ...form, locationType: lt, location: '', videoCallProvider: 'venturenex' });
                      } else {
                        setForm({ ...form, locationType: lt, location: generateMeetLink(), videoCallProvider: 'venturenex' });
                      }
                    }} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option value="virtual">{t('virtual')}</option>
                      <option value="physical">{t('physical')}</option>
                      <option value="hybrid">{t('hybrid')}</option>
                    </select>
                  </label>

                  {/* Virtual / Hybrid → provider + link */}
                  {(form.locationType === 'virtual' || form.locationType === 'hybrid') && (
                    <>
                      {/* Provider selector */}
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Video Call Provider</span>
                        <select
                          value={form.videoCallProvider}
                          onChange={(e) => {
                            const prov = e.target.value as VideoProvider;
                            const link = prov === 'venturenex' ? generateMeetLink() : '';
                            setForm({ ...form, videoCallProvider: prov, location: link });
                          }}
                          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="venturenex">VentureNex Video</option>
                          <option value="zoom">Zoom</option>
                          <option value="teams">Microsoft Teams</option>
                          <option value="meet">Google Meet</option>
                          <option value="webex">Webex</option>
                          <option value="other">Other</option>
                        </select>
                      </label>

                      {/* Auto-generated link info (VentureNex) */}
                      {form.videoCallProvider === 'venturenex' ? (
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                          <div className="flex items-start gap-2">
                            <Video className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                            <div>
                              <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Venture<em>Nex</em> Video Enabled</p>
                              <p className="mt-0.5 text-xs text-indigo-700 dark:text-indigo-400">A video meeting room will be automatically created. Attendees will receive a join link.</p>
                              <p className="mt-1 truncate text-xs text-indigo-500">{form.location}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Paste-your-own link */
                        <label className="block">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Meeting Link</span>
                          <input
                            type="url"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder={providerPlaceholders[form.videoCallProvider]}
                            className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </label>
                      )}

                      {/* Hybrid also needs physical address */}
                      {form.locationType === 'hybrid' && (
                        <div className="block">
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Physical Location</span>
                          <div className="mt-1">
                            <AddressAutocomplete
                              value=""
                              onChange={() => {}}
                              placeholder="Search for office address..."
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Physical → address autocomplete */}
                  {form.locationType === 'physical' && (
                    <div className="block">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('location')}</span>
                      <div className="mt-1">
                        <AddressAutocomplete
                          value={form.location}
                          onChange={(addr) => setForm({ ...form, location: addr })}
                          placeholder="Search for an address..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Access code display (after creation) */}
                  {created && lastAccessCode ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-semibold">Meeting Created!</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                        <div className="flex items-center gap-2 mb-2">
                          <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">One-Time Access Code</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 dark:bg-slate-800">
                          <code className="flex-1 text-center text-lg font-bold tracking-[0.2em] text-slate-900 dark:text-white">
                            {lastAccessCode}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(lastAccessCode);
                              setCodeCopied(true);
                              setTimeout(() => setCodeCopied(false), 2000);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            {codeCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-500">
                          Share this code with attendees so they can access the project workspace.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setCreated(false);
                          setLastAccessCode(null);
                          setCodeCopied(false);
                          setShowNewMeeting(false);
                          resetForm();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    /* Create button */
                    <button
                      onClick={handleCreate}
                      disabled={creating || !form.title || !form.projectId || !form.description}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {creating ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> {t('creating')}</>
                      ) : (
                        <><Plus className="h-4 w-4" /> {t('create')}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Upcoming meetings */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">{t('upcoming')}</h3>
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-6">
                  <CalendarDays className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-2 text-xs text-slate-400">{t('noMeetings')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingMeetings.map((m) => (
                    <MeetingCard key={m.id} meeting={m} onCancel={handleCancel} t={t} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Meeting Card ────────────────────────────────────────────────────────────

function MeetingCard({ meeting, onCancel, t }: { meeting: Meeting; onCancel: (id: string) => void; t: ReturnType<typeof useTranslations> }) {
  const typeColors: Record<string, string> = {
    team: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    investor: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    external: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  };

  return (
    <div className="group rounded-xl border border-slate-200/60 bg-slate-50 p-3 transition-colors hover:bg-white dark:border-slate-800/60 dark:bg-slate-800/50 dark:hover:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{meeting.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{meeting.projectTitle}</p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', typeColors[meeting.type])}>
          {meeting.type === 'team' ? t('typeTeam') : meeting.type === 'investor' ? t('typeInvestor') : t('typeExternal')}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(meeting.startTime)} · {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
        </span>
        {meeting.location && (
          <span className="flex items-center gap-1">
            {meeting.locationType === 'virtual' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            {meeting.location.length > 30 ? meeting.location.slice(0, 30) + '…' : meeting.location}
          </span>
        )}
        {meeting.attendeeIds.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {meeting.attendeeIds.length}
          </span>
        )}
      </div>
      <button
        onClick={() => onCancel(meeting.id)}
        className="mt-2 text-xs font-medium text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
      >
        {t('cancel')}
      </button>
    </div>
  );
}
