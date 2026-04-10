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
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    attendeeIds: [] as string[],
  });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

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

      if ('id' in result) {
        setCreated(true);
        setTimeout(() => {
          setCreated(false);
          setShowNewMeeting(false);
          resetForm();
          fetchData();
        }, 1200);
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
      attendeeIds: [],
    });
  };

  // ─── Scan calendar ─────────────────────────────────────────────────────────

  const handleScan = async () => {
    setScanning(true);
    setSlotsLoaded(false);

    try {
      // Gather attendee IDs from all user's projects' teams (simplified: use empty → just scan for the user)
      const attendeeIds: string[] = [];

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
    events.some((e) => {
      const d = new Date(e.start);
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
                    {day && dayHasEvent(day) && !isToday(day) && (
                      <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-500" />
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
                    <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option value="">{t('selectProject')}</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </label>

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
                      const autoLink = (lt === 'virtual' || lt === 'hybrid')
                        ? `https://meet.venturenex.com/${crypto.randomUUID().slice(0, 8)}`
                        : '';
                      setForm({ ...form, locationType: lt, location: autoLink });
                    }} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <option value="virtual">{t('virtual')}</option>
                      <option value="physical">{t('physical')}</option>
                      <option value="hybrid">{t('hybrid')}</option>
                    </select>
                  </label>

                  {/* Location */}
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('location')}</span>
                    <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={t('locationPlaceholder')} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  </label>

                  {/* Create button */}
                  <button
                    onClick={handleCreate}
                    disabled={creating || !form.title || !form.projectId || !form.description}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {created ? (
                      <><CheckCircle2 className="h-4 w-4" /> {t('created')}</>
                    ) : creating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {t('creating')}</>
                    ) : (
                      <><Plus className="h-4 w-4" /> {t('create')}</>
                    )}
                  </button>
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
