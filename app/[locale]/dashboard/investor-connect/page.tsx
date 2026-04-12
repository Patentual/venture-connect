'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import BrandText from '@/components/ui/BrandText';
import {
  Presentation,
  Lock,
  TrendingUp,
  Video,
  Sparkles,
  Download,
  Eye,
  Plus,
  Brain,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Shield,
  Play,
  Calendar,
  BarChart3,
  Loader2,
  FolderOpen,
  Link2,
  Crown,
  Send,
  Mail,
  KeyRound,
  FileSignature,
  Pencil,
  Save,
  ImageIcon,
  Palette,
  X,
  Type,
  Info,
} from 'lucide-react';
import HexLogo from '@/components/ui/HexLogo';
import { listMyProjects, updatePitchDeckSlides, updatePitchBranding } from '@/app/actions/projects';
import { getProject } from '@/app/actions/projects';
import type { Project } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';
import WorkspaceFiles from '@/components/workspace/WorkspaceFiles';
import { listPitchSessions, schedulePitch, cancelPitch, type PitchSession } from '@/app/actions/pitch';

const TABS = [
  { key: 'pitchDeck', icon: Presentation },
  { key: 'dataRoom', icon: Lock },
  { key: 'roadmap', icon: TrendingUp },
  { key: 'livePitch', icon: Video },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function InvestorConnectDashboard() {
  const t = useTranslations('investorDashboard');
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('pitchDeck');
  const [generating, setGenerating] = useState(false);
  const [deckGenerated, setDeckGenerated] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deckSlides, setDeckSlides] = useState<{ title: string; type: string; bullets: string[]; speakerNotes: string; imageUrl?: string; imagePrompt?: string }[]>([]);
  const [deckError, setDeckError] = useState('');
  const [editingSlideIdx, setEditingSlideIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{ title: string; bullets: string[]; speakerNotes: string }>({ title: '', bullets: [], speakerNotes: '' });
  const [saving, setSaving] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [branding, setBranding] = useState<{ logoUrl: string; companyName: string; accentColor: string; tagline: string }>({ logoUrl: '', companyName: '', accentColor: '#6366f1', tagline: '' });

  // Pitch scheduling state
  const [pitchSessions, setPitchSessions] = useState<PitchSession[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleEmails, setScheduleEmails] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    listMyProjects()
      .then(async (projects) => {
        if (projects.length > 0) {
          const full = await getProject(projects[0].id);
          setProject(full);
          // Load existing pitch deck
          if (full?.pitchDeck?.slides) {
            setDeckSlides(full.pitchDeck.slides);
            setDeckGenerated(true);
          }
          // Load existing branding
          if (full?.pitchBranding) {
            setBranding({
              logoUrl: full.pitchBranding.logoUrl || '',
              companyName: full.pitchBranding.companyName || '',
              accentColor: full.pitchBranding.accentColor || '#6366f1',
              tagline: full.pitchBranding.tagline || '',
            });
          }
          // Load pitch sessions
          const sessions = await listPitchSessions(projects[0].id);
          setPitchSessions(sessions);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const hasProject = !!project;
  const isLeader = useMemo(() => !!(user && project && project.creatorId === user.userId), [user, project]);
  const phases = project?.timeline?.phases || [];
  const allMilestones = phases.flatMap((p) => p.milestones || []);
  const completedMilestones = allMilestones.filter((m) => m.status === 'completed');

  const handleGenerate = async () => {
    if (!project) return;
    setGenerating(true);
    setDeckError('');
    try {
      const res = await fetch('/api/ai/pitch-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        setDeckError(err.error || 'Failed to generate');
        setGenerating(false);
        return;
      }
      const data = await res.json();
      setDeckSlides(data.slides || []);
      setDeckGenerated(true);
    } catch {
      setDeckError('Network error. Please try again.');
    }
    setGenerating(false);
  };

  const handleSchedulePitch = async () => {
    if (!project || !scheduleDate) return;
    setScheduling(true);
    const emails = scheduleEmails.split(',').map((e) => e.trim()).filter(Boolean);
    const session = await schedulePitch(project.id, {
      scheduledAt: new Date(scheduleDate).toISOString(),
      durationMinutes: 30,
      investorEmails: emails,
    });
    if (session) {
      setPitchSessions((prev) => [...prev, session]);
      setShowScheduleForm(false);
      setScheduleDate('');
      setScheduleEmails('');
    }
    setScheduling(false);
  };

  const handleCancelPitch = async (pitchId: string) => {
    if (!project) return;
    const ok = await cancelPitch(project.id, pitchId);
    if (ok) {
      setPitchSessions((prev) => prev.map((s) => s.id === pitchId ? { ...s, status: 'cancelled' as const } : s));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Crown className="h-3 w-3" />
              {t('premium')}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
        </div>
      ) : !hasProject ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
            <Presentation className="h-7 w-7 text-amber-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            No projects to pitch yet
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Create a project first, then come back here to generate an AI pitch deck, set up a data room, and connect with investors.
          </p>
        </div>
      ) : (
      <>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200/60 bg-slate-100/80 p-1 dark:border-slate-800/60 dark:bg-slate-800/50">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
                activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(`tabs.${tab.key}`)}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* ═══ PITCH DECK ═══ */}
          {activeTab === 'pitchDeck' && (
            <div className="space-y-6">
              {!deckGenerated ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                  <Brain className="mx-auto h-12 w-12 text-indigo-400" />
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{t('pitch.generateTitle')}</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    {t('pitch.generateDesc')}
                  </p>
                  {isLeader ? (
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="animated-gradient shine mx-auto mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:opacity-70"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('pitch.generating')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {t('pitch.generateButton')}
                      </>
                    )}
                  </button>
                  ) : (
                    <p className="mt-6 text-sm text-slate-400">Only the project leader can generate the pitch deck.</p>
                  )}
                  {deckError && (
                    <p className="mt-2 text-center text-sm text-red-500">{deckError}</p>
                  )}
                  <p className="mt-3 text-xs text-slate-400">{t('pitch.tokenCost')}</p>
                  <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-950/30">
                    <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <p className="text-left text-xs text-blue-700 dark:text-blue-300">
                      Project data is processed by a third-party AI service (OpenAI). Your data is <strong>not used for AI training</strong> and is <strong>not retained</strong> after processing.{' '}
                      <a href="/legal/privacy" className="underline hover:no-underline">Privacy Policy</a>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header with actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('pitch.deckTitle')}</h3>
                      <p className="text-xs text-slate-500">{deckSlides.length} slides{isLeader ? ' · click any slide to edit' : ' · read-only'}</p>
                    </div>
                    {isLeader && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBranding(!showBranding)}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
                          showBranding
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        )}
                      >
                        <Palette className="h-4 w-4" /> Branding
                      </button>
                      <button
                        onClick={async () => {
                          if (!project) return;
                          setSaving(true);
                          await updatePitchDeckSlides(project.id, deckSlides);
                          await updatePitchBranding(project.id, branding);
                          setSaving(false);
                        }}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                      </button>
                      <button
                        onClick={() => { setDeckGenerated(false); setDeckSlides([]); }}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <Sparkles className="h-4 w-4" /> Regenerate
                      </button>
                    </div>
                    )}
                  </div>

                  {/* Branding panel */}
                  {showBranding && (
                    <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/50 p-5 dark:border-indigo-800/40 dark:bg-indigo-950/20">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                          <Palette className="h-4 w-4 text-indigo-500" /> Custom Branding
                        </h4>
                        <p className="text-[11px] text-slate-500">Your logo appears on the cover &middot; Venture<em>Nex</em> watermark is always present</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                          <div className="relative">
                            <Type className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={branding.companyName}
                              onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                              placeholder={project?.title || 'Your Company'}
                              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Tagline</label>
                          <input
                            type="text"
                            value={branding.tagline}
                            onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                            placeholder="Your mission statement"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Logo URL</label>
                          <div className="relative">
                            <ImageIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                              type="url"
                              value={branding.logoUrl}
                              onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                              placeholder="https://..."
                              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Accent Colour</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={branding.accentColor}
                              onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                              className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                            <input
                              type="text"
                              value={branding.accentColor}
                              onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Slide grid — editable */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {deckSlides.map((slide, i) => {
                      const isCover = slide.type === 'cover';
                      const isVN = slide.type === 'venturenex';
                      const isEditing = editingSlideIdx === i;

                      return (
                        <div
                          key={i}
                          className={cn(
                            'group relative overflow-hidden rounded-xl border p-4 transition-all',
                            isVN
                              ? 'border-indigo-300/60 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-800/40 dark:from-indigo-950/30 dark:to-violet-950/30'
                              : 'border-slate-200/60 bg-white hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900'
                          )}
                        >
                          {/* AI-generated slide image */}
                          {slide.imageUrl && (
                            <div className="-mx-4 -mt-4 mb-3 overflow-hidden rounded-t-xl">
                              <img
                                src={slide.imageUrl}
                                alt={slide.title}
                                className="h-36 w-full object-cover"
                              />
                            </div>
                          )}

                          {/* VentureNex watermark on cover slide */}
                          {isCover && (
                            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-indigo-600/10 px-2 py-0.5">
                              <HexLogo className="h-4 w-4" />
                              <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">Venture<em>Nex</em></span>
                            </div>
                          )}

                          {/* Cover slide branding preview */}
                          {isCover && (branding.logoUrl || branding.companyName) && (
                            <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50">
                              {branding.logoUrl && (
                                <img src={branding.logoUrl} alt="" className="h-6 w-6 rounded object-contain" />
                              )}
                              {branding.companyName && (
                                <span className="text-xs font-bold" style={{ color: branding.accentColor }}>{branding.companyName}</span>
                              )}
                              {branding.tagline && (
                                <span className="text-[10px] text-slate-400">&mdash; {branding.tagline}</span>
                              )}
                            </div>
                          )}

                          {/* VentureNex closing slide branding */}
                          {isVN && (
                            <div className="mb-3 flex items-center gap-2">
                              <HexLogo className="h-8 w-8" />
                              <div>
                                <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Venture<em>Nex</em></p>
                                <p className="text-[10px] text-slate-500">This slide cannot be removed</p>
                              </div>
                            </div>
                          )}

                          <div className="mb-3 flex items-center gap-2">
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                              style={{ background: isVN ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : `linear-gradient(135deg, ${branding.accentColor}, ${branding.accentColor}dd)` }}
                            >
                              {i + 1}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {slide.type}
                            </span>
                            {isLeader && !isVN && !isEditing && (
                              <button
                                onClick={() => {
                                  setEditingSlideIdx(i);
                                  setEditDraft({ title: slide.title, bullets: [...slide.bullets], speakerNotes: slide.speakerNotes });
                                }}
                                className="ml-auto rounded-lg p-1 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                title="Edit slide"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            /* ─── Editing mode ─── */
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editDraft.title}
                                onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                                className="w-full rounded-lg border border-indigo-300 bg-white px-2 py-1 text-sm font-bold text-slate-900 focus:outline-none dark:border-indigo-700 dark:bg-slate-800 dark:text-white"
                              />
                              {editDraft.bullets.map((b, j) => (
                                <div key={j} className="flex gap-1">
                                  <span className="mt-1 text-xs text-slate-400">•</span>
                                  <input
                                    type="text"
                                    value={b}
                                    onChange={(e) => {
                                      const updated = [...editDraft.bullets];
                                      updated[j] = e.target.value;
                                      setEditDraft({ ...editDraft, bullets: updated });
                                    }}
                                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  />
                                  <button
                                    onClick={() => {
                                      const updated = editDraft.bullets.filter((_, k) => k !== j);
                                      setEditDraft({ ...editDraft, bullets: updated });
                                    }}
                                    className="rounded p-0.5 text-slate-400 hover:text-red-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => setEditDraft({ ...editDraft, bullets: [...editDraft.bullets, ''] })}
                                className="text-[11px] text-indigo-500 hover:underline"
                              >
                                + Add bullet
                              </button>
                              <textarea
                                value={editDraft.speakerNotes}
                                onChange={(e) => setEditDraft({ ...editDraft, speakerNotes: e.target.value })}
                                placeholder="Speaker notes..."
                                rows={2}
                                className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-[11px] italic text-slate-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    const updated = [...deckSlides];
                                    updated[i] = { ...updated[i], title: editDraft.title, bullets: editDraft.bullets.filter(Boolean), speakerNotes: editDraft.speakerNotes };
                                    setDeckSlides(updated);
                                    setEditingSlideIdx(null);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                                >
                                  <Save className="h-3 w-3" /> Apply
                                </button>
                                <button
                                  onClick={() => setEditingSlideIdx(null)}
                                  className="rounded-lg px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ─── View mode ─── */
                            <>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{slide.title}</p>
                              <ul className="mt-2 space-y-1">
                                {(slide.bullets || []).slice(0, 3).map((b, j) => (
                                  <li key={j} className="text-xs text-slate-500 dark:text-slate-400">• {b}</li>
                                ))}
                                {(slide.bullets || []).length > 3 && (
                                  <li className="text-[10px] text-slate-400">+{slide.bullets.length - 3} more</li>
                                )}
                              </ul>
                              {slide.speakerNotes && (
                                <p className="mt-2 border-t border-slate-100 pt-2 text-[10px] italic text-slate-400 dark:border-slate-800">
                                  {slide.speakerNotes.slice(0, 100)}{slide.speakerNotes.length > 100 ? '…' : ''}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {t('pitch.verifiedBadge')}
                      </p>
                    </div>
                    <BrandText as="p" text={t('pitch.verifiedDesc')} className="mt-1 ml-7 text-xs text-emerald-600 dark:text-emerald-400" />
                  </div>

                  {/* Secure Share */}
                  <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-slate-900">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md">
                        <KeyRound className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('pitch.shareTitle')}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('pitch.shareDesc')}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Email input */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            placeholder={t('pitch.sharePlaceholder')}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <button className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md">
                          <Send className="h-4 w-4" /> {t('pitch.shareSend')}
                        </button>
                      </div>

                      {/* Security features */}
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{t('pitch.shareAuth')}</p>
                            <p className="text-[11px] text-slate-500">{t('pitch.shareAuthDesc')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{t('pitch.shareEncrypt')}</p>
                            <p className="text-[11px] text-slate-500">{t('pitch.shareEncryptDesc')}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{t('pitch.shareTrack')}</p>
                            <p className="text-[11px] text-slate-500">{t('pitch.shareTrackDesc')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Recent shares */}
                      <div className="mt-2">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{t('pitch.recentShares')}</p>
                        <div className="space-y-2">
                          {[
                            { email: 'j.morrison@sequoia.vc', status: 'viewed', ndaSigned: true, date: 'Apr 7' },
                            { email: 'anna.k@a16z.com', status: 'sent', ndaSigned: false, date: 'Apr 8' },
                            { email: 'david.r@indexventures.com', status: 'viewed', ndaSigned: true, date: 'Apr 6' },
                          ].map((share) => (
                            <div key={share.email} className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-2.5 dark:border-slate-800/60 dark:bg-slate-800/30">
                              <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">{share.email}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={cn(
                                      'text-[11px] font-medium',
                                      share.status === 'viewed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                                    )}>
                                      {share.status === 'viewed' ? t('pitch.statusViewed') : t('pitch.statusSent')}
                                    </span>
                                    {share.ndaSigned && (
                                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                        <FileSignature className="h-3 w-3" />
                                        {t('pitch.ndaSigned')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-slate-400">{share.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ DATA ROOM ═══ */}
          {activeTab === 'dataRoom' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('room.title')}</h3>
                  <p className="text-xs text-slate-500">{t('room.subtitle')}</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Link2 className="h-4 w-4" /> {t('room.shareLink')}
                </button>
              </div>

              {project && <WorkspaceFiles projectId={project.id} />}

              {/* Investor NDA */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-md">
                    <FileSignature className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('room.ndaTitle')}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('room.ndaDesc')}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{t('room.ndaSameFlow')}</p>
                      <p className="text-[11px] text-slate-500">{t('room.ndaSameFlowDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{t('room.ndaEnforced')}</p>
                      <p className="text-[11px] text-slate-500">{t('room.ndaEnforcedDesc')}</p>
                    </div>
                  </div>
                </div>

                {/* Investor NDA status list */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">{t('room.ndaInvestors')}</p>
                  <div className="space-y-2">
                    {[
                      { name: 'James Morrison', firm: 'Sequoia Capital', status: 'signed', date: 'Apr 5' },
                      { name: 'David Richards', firm: 'Index Ventures', status: 'signed', date: 'Apr 6' },
                      { name: 'Anna Kovacs', firm: 'a16z', status: 'pending', date: 'Apr 8' },
                    ].map((inv) => (
                      <div key={inv.name} className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-2.5 dark:border-slate-800/60 dark:bg-slate-800/30">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{inv.name}</p>
                          <p className="text-xs text-slate-500">{inv.firm}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            inv.status === 'signed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          )}>
                            {inv.status === 'signed' && <CheckCircle2 className="h-3 w-3" />}
                            {inv.status === 'signed' ? t('room.ndaStatusSigned') : t('room.ndaStatusPending')}
                          </span>
                          <span className="text-xs text-slate-400">{inv.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Send className="h-4 w-4" /> {t('room.ndaSendButton')}
                </button>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-950/20">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{t('room.accessNote')}</p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{t('room.accessDesc')}</p>
              </div>
            </div>
          )}

          {/* ═══ ROADMAP ═══ */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('roadmap.title')}</h3>
                  <p className="text-xs text-slate-500">{t('roadmap.subtitle')}</p>
                </div>
                <button className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md">
                  <Sparkles className="h-4 w-4" /> {t('roadmap.regenerate')}
                </button>
              </div>

              {/* Completed Phase 1 */}
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-800/30 dark:bg-emerald-950/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-300">Phase 1 — {phases[0]?.name || 'Discovery'}</h4>
                  <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                    Complete
                  </span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  {completedMilestones.slice(0, 4).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Future phases */}
              <div className="relative">
                <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-indigo-500 via-violet-500 to-rose-500 opacity-20" />
                <div className="space-y-6">
                  {phases.slice(1).map((phase, i) => (
                    <div key={phase.id} className="relative ml-12">
                      <div className="absolute -left-[33px] top-5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white shadow-md">
                        {i + 2}
                      </div>
                      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Phase {i + 2}</span>
                          <span className="text-xs text-slate-400">{phase.startDate ? new Date(phase.startDate).toLocaleDateString('en-AU', { month: 'short' }) : ''} — {phase.endDate ? new Date(phase.endDate).toLocaleDateString('en-AU', { month: 'short' }) : ''}</span>
                        </div>
                        <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{phase.name}</h4>
                        <ul className="mt-3 space-y-1.5">
                          {(phase.milestones || []).map((ms) => (
                            <li key={ms.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {ms.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ LIVE PITCH ═══ */}
          {activeTab === 'livePitch' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('live.title')}</h3>
                  <p className="text-xs text-slate-500">{t('live.subtitle')}</p>
                </div>
                <button
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Plus className="h-4 w-4" /> {t('live.scheduleButton')}
                </button>
              </div>

              {/* Schedule form */}
              {showScheduleForm && (
                <div className="rounded-2xl border border-indigo-200 bg-white p-6 dark:border-indigo-800 dark:bg-slate-900">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('live.scheduleTitle')}</h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('live.scheduleDesc')}</p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Investor emails (comma-separated)</label>
                      <input
                        type="text"
                        value={scheduleEmails}
                        onChange={(e) => setScheduleEmails(e.target.value)}
                        placeholder="investor@vc.com, partner@fund.io"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSchedulePitch}
                        disabled={!scheduleDate || scheduling}
                        className="animated-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {scheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                        Schedule
                      </button>
                      <button
                        onClick={() => setShowScheduleForm(false)}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming / past pitches */}
              {pitchSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                  <Video className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <h4 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">No pitch sessions yet</h4>
                  <p className="mt-1 text-xs text-slate-400">Schedule your first investor pitch above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pitchSessions.map((ps) => {
                    const date = new Date(ps.scheduledAt);
                    const isPast = date.getTime() < Date.now();
                    const isCancelled = ps.status === 'cancelled';
                    return (
                      <div key={ps.id} className={cn(
                        'rounded-2xl border bg-white p-5 dark:bg-slate-900',
                        isCancelled ? 'border-slate-200/40 opacity-60 dark:border-slate-800/40' : 'border-slate-200/60 dark:border-slate-800/60'
                      )}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {ps.projectTitle} — Pitch
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {date.toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · {date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {ps.investorEmails.length} investor{ps.investorEmails.length !== 1 ? 's' : ''} invited · {ps.durationMinutes}min
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCancelled ? (
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800">Cancelled</span>
                            ) : isPast ? (
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800">Completed</span>
                            ) : (
                              <>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">Scheduled</span>
                                <button
                                  onClick={() => handleCancelPitch(ps.id)}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* How it works */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-slate-900">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('live.howTitle')}</h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t(`live.steps.${i}.title`)}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t(`live.steps.${i}.desc`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      </>
      )}
    </div>
  );
}
