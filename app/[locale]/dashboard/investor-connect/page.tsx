'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

/* ────── mock project data (as if pulled from workspace) ────── */
const MOCK_PROJECT = {
  name: 'EcoTrack — Carbon Footprint Analytics Platform',
  status: 'Phase 1 Complete',
  team: [
    { name: 'Sarah Chen', role: 'Project Leader', rating: 4.9 },
    { name: 'Marcus Wright', role: 'Full-Stack Developer', rating: 4.8 },
    { name: 'Aisha Patel', role: 'UX Designer', rating: 5.0 },
    { name: 'Liam O\'Brien', role: 'Data Scientist', rating: 4.7 },
  ],
  milestones: [
    { name: 'Research & Planning', status: 'complete', date: 'Jan 2025' },
    { name: 'MVP Development', status: 'complete', date: 'Mar 2025' },
    { name: 'Beta Testing', status: 'complete', date: 'May 2025' },
    { name: 'Phase 1 Launch', status: 'complete', date: 'Jul 2025' },
  ],
  budget: { spent: 42000, total: 50000 },
  nda: true,
};

const MOCK_DECK_SLIDES = [
  { title: 'Cover', desc: 'EcoTrack — Built & delivered on Venture Connect' },
  { title: 'Problem', desc: 'Businesses lack real-time carbon footprint visibility' },
  { title: 'Solution', desc: 'AI-powered analytics platform for carbon tracking & reporting' },
  { title: 'Traction', desc: '4 milestones delivered on time · $42K of $50K budget used' },
  { title: 'Team', desc: '4 verified professionals · avg 4.85 rating' },
  { title: 'Market', desc: 'Global carbon management market: $15.2B by 2028' },
  { title: 'Business Model', desc: 'SaaS subscriptions · Enterprise API licensing' },
  { title: 'Phase 2 Roadmap', desc: 'Enterprise integrations · Mobile app · API marketplace' },
  { title: 'Financials', desc: 'Projected ARR: $2.4M by Year 2' },
  { title: 'The Ask', desc: 'Seeking $500K seed round for Phase 2 execution' },
];

const MOCK_ROADMAP = [
  {
    phase: 'Phase 2',
    title: 'Enterprise Expansion',
    timeline: 'Q4 2025 – Q1 2026',
    budget: '$120K',
    items: ['Enterprise SSO & RBAC', 'Salesforce & SAP integrations', 'SOC 2 compliance'],
  },
  {
    phase: 'Phase 3',
    title: 'Mobile & API',
    timeline: 'Q2 2026 – Q3 2026',
    budget: '$85K',
    items: ['iOS & Android apps', 'Public API marketplace', 'Partner SDK'],
  },
  {
    phase: 'Phase 4',
    title: 'Scale & Internationalise',
    timeline: 'Q4 2026 – Q1 2027',
    budget: '$200K',
    items: ['Multi-language support (10 locales)', 'Regional compliance (EU, APAC)', 'Series A preparation'],
  },
];

const MOCK_DATA_ROOM_FILES = [
  { name: 'AI-Generated Pitch Deck', type: 'PDF', size: '2.4 MB', icon: Presentation },
  { name: 'Phase 1 Milestone Report', type: 'PDF', size: '1.1 MB', icon: BarChart3 },
  { name: 'Financial Model', type: 'XLSX', size: '340 KB', icon: FileText },
  { name: 'Team Credentials & Ratings', type: 'PDF', size: '820 KB', icon: Users },
  { name: 'NDA Agreements (signed)', type: 'PDF', size: '560 KB', icon: Shield },
  { name: 'Technical Architecture', type: 'PDF', size: '1.8 MB', icon: FolderOpen },
];

const TABS = [
  { key: 'pitchDeck', icon: Presentation },
  { key: 'dataRoom', icon: Lock },
  { key: 'roadmap', icon: TrendingUp },
  { key: 'livePitch', icon: Video },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function InvestorConnectDashboard() {
  const t = useTranslations('investorDashboard');
  const [activeTab, setActiveTab] = useState<TabKey>('pitchDeck');
  const [generating, setGenerating] = useState(false);
  const [deckGenerated, setDeckGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setDeckGenerated(true);
    }, 3000);
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

      {/* Project selector */}
      <div className="mb-6 rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{t('activeProject')}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{MOCK_PROJECT.name}</h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                {MOCK_PROJECT.status}
              </span>
              <span>{MOCK_PROJECT.team.length} team members</span>
              <span>{MOCK_PROJECT.milestones.length} milestones</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Shield className="h-3 w-3" />
              NDA Protected
            </span>
          </div>
        </div>
      </div>

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
                  <p className="mt-3 text-xs text-slate-400">{t('pitch.tokenCost')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('pitch.deckTitle')}</h3>
                      <p className="text-xs text-slate-500">{t('pitch.deckSub')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Eye className="h-4 w-4" /> {t('pitch.preview')}
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Download className="h-4 w-4" /> {t('pitch.download')}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {MOCK_DECK_SLIDES.map((slide, i) => (
                      <div
                        key={slide.title}
                        className="group relative overflow-hidden rounded-xl border border-slate-200/60 bg-white p-4 transition-all hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900"
                      >
                        <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
                          <span className="text-2xl font-black text-indigo-200 dark:text-indigo-800">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{slide.title}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">{slide.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {t('pitch.verifiedBadge')}
                      </p>
                    </div>
                    <p className="mt-1 ml-7 text-xs text-emerald-600 dark:text-emerald-400">
                      {t('pitch.verifiedDesc')}
                    </p>
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

              <div className="rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900">
                {MOCK_DATA_ROOM_FILES.map((file, i) => {
                  const Icon = file.icon;
                  return (
                    <div
                      key={file.name}
                      className={cn(
                        'flex items-center justify-between px-5 py-4',
                        i < MOCK_DATA_ROOM_FILES.length - 1 && 'border-b border-slate-200/60 dark:border-slate-800/60'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <Icon className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-slate-400">{file.type} · {file.size}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

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
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-300">Phase 1 — {MOCK_PROJECT.name.split('—')[0].trim()}</h4>
                  <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                    Complete
                  </span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  {MOCK_PROJECT.milestones.map((m) => (
                    <div key={m.name} className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Future phases */}
              <div className="relative">
                <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-indigo-500 via-violet-500 to-rose-500 opacity-20" />
                <div className="space-y-6">
                  {MOCK_ROADMAP.map((phase, i) => (
                    <div key={phase.phase} className="relative ml-12">
                      <div className="absolute -left-[33px] top-5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white shadow-md">
                        {i + 2}
                      </div>
                      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">{phase.phase}</span>
                          <span className="text-xs text-slate-400">{phase.timeline}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Est. {phase.budget}
                          </span>
                        </div>
                        <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{phase.title}</h4>
                        <ul className="mt-3 space-y-1.5">
                          {phase.items.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {item}
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
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('live.title')}</h3>
                <p className="text-xs text-slate-500">{t('live.subtitle')}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Schedule a pitch */}
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-slate-900">
                  <Calendar className="mb-3 h-8 w-8 text-indigo-500" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('live.scheduleTitle')}</h4>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('live.scheduleDesc')}</p>
                  <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Plus className="h-4 w-4" /> {t('live.scheduleButton')}
                  </button>
                </div>

                {/* Upcoming pitches */}
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-slate-900">
                  <Video className="mb-3 h-8 w-8 text-rose-500" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{t('live.upcomingTitle')}</h4>
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">EcoTrack — Seed Round Pitch</p>
                    <p className="mt-1 text-xs text-slate-500">April 15, 2025 · 2:00 PM AEST</p>
                    <p className="mt-1 text-xs text-slate-400">3 investors confirmed</p>
                    <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                      <Play className="h-3 w-3" /> {t('live.joinRoom')}
                    </button>
                  </div>
                </div>
              </div>

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
    </div>
  );
}
