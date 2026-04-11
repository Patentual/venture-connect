'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import BrandText from '@/components/ui/BrandText';
import { useAuth } from '@/lib/auth/context';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const COMPETITORS = [
  { key: 'ventureConnect', highlight: true },
  { key: 'linkedin', highlight: false },
  { key: 'upwork', highlight: false },
  { key: 'toptal', highlight: false },
  { key: 'fiverr', highlight: false },
] as const;

type FeatureRow = {
  key: string;
  values: [boolean, boolean, boolean, boolean, boolean];
};

const FEATURES: FeatureRow[] = [
  { key: 'aiProjectPlanning',     values: [true,  false, false, false, false] },
  { key: 'aiTalentMatching',      values: [true,  false, true,  true,  false] },
  { key: 'twoFactorAuth',         values: [true,  true,  true,  true,  false] },
  { key: 'projectAccessCodes',    values: [true,  false, false, false, false] },
  { key: 'ndaEsign',              values: [true,  false, false, false, false] },
  { key: 'builtInWhiteboard',     values: [true,  false, false, false, false] },
  { key: 'meetingTranscription',  values: [true,  false, false, false, false] },
  { key: 'teamRatings',           values: [true,  false, true,  true,  true ] },
  { key: 'aiReferralRequests',    values: [true,  false, false, false, false] },
  { key: 'globalDirectory',       values: [true,  true,  true,  true,  true ] },
  { key: 'fileSharing',           values: [true,  false, true,  true,  true ] },
  { key: 'multiLanguage',         values: [true,  false, false, false, false] },
  { key: 'projectWorkspace',      values: [true,  false, true,  false, false] },
  { key: 'milestoneTracking',     values: [true,  false, true,  false, false] },
  { key: 'aiWhiteboardSummary',   values: [true,  false, false, false, false] },
  { key: 'referralRewards',       values: [true,  false, true,  false, true ] },
  { key: 'freePlanAvailable',     values: [true,  true,  true,  false, true ] },
  { key: 'noServiceFee',          values: [true,  false, false, false, false] },
];

function FeatureCell({ value, highlight }: { value: boolean; highlight: boolean }) {
  if (value) {
    return (
      <div className={cn(
        'flex items-center justify-center',
        highlight ? 'text-emerald-500' : 'text-emerald-400/70'
      )}>
        <Check className={cn('h-5 w-5', highlight && 'h-6 w-6 stroke-[3]')} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center text-zinc-300 dark:text-zinc-700">
      <X className="h-4 w-4" />
    </div>
  );
}

export default function ComparePage() {
  const t = useTranslations('compare');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <BrandText as="h1" text={t('title')} className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl" />
          <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Comparison table */}
        <div className="mt-12 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[700px]">
            {/* Table header — competitor names */}
            <thead>
              <tr>
<th className="sticky left-0 z-20 bg-white px-5 py-4 text-left text-sm font-semibold text-zinc-900 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:bg-zinc-900 dark:text-white dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.3)]">
                  {t('features')}
                </th>
                {COMPETITORS.map((comp) => (
                  <th
                    key={comp.key}
                    className={cn(
                      'px-4 py-4 text-center text-sm font-semibold',
                      comp.highlight
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                        : 'text-zinc-600 dark:text-zinc-400'
                    )}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      {comp.highlight && (
                        <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                          <Sparkles className="h-3 w-3" />
                          {t('recommended')}
                        </span>
                      )}
                      {t(`competitors.${comp.key}`)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Feature rows */}
            <tbody>
              {FEATURES.map((feature, idx) => (
                <tr
                  key={feature.key}
                  className={cn(
                    'border-t border-zinc-100 dark:border-zinc-800',
                    idx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-950'
                  )}
                >
                  <td className={cn('sticky left-0 z-20 px-5 py-3.5 text-sm font-medium text-zinc-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:text-zinc-300 dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.3)]', idx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-zinc-950')}>
                    {t(`features_list.${feature.key}`)}
                  </td>
                  {feature.values.map((val, i) => (
                    <td
                      key={i}
                      className={cn(
                        'px-4 py-3.5',
                        COMPETITORS[i].highlight && 'bg-indigo-50/50 dark:bg-indigo-950/10'
                      )}
                    >
                      <FeatureCell value={val} highlight={COMPETITORS[i].highlight} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Score summary */}
        <div className="mt-8 grid gap-4 sm:grid-cols-5">
          {COMPETITORS.map((comp, i) => {
            const score = FEATURES.filter((f) => f.values[i]).length;
            const pct = Math.round((score / FEATURES.length) * 100);
            return (
              <div
                key={comp.key}
                className={cn(
                  'rounded-2xl border p-4 text-center',
                  comp.highlight
                    ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                )}
              >
                <div className={cn(
                  'text-2xl font-bold',
                  comp.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-600 dark:text-zinc-400'
                )}>
                  {score}/{FEATURES.length}
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {t(`competitors.${comp.key}`)}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      comp.highlight
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                        : 'bg-zinc-400 dark:bg-zinc-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {!user && (
        <div className="mt-12 text-center">
          <Link
            href="/auth/register"
            className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
          >
            {t('cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-zinc-400">
            {t('ctaSub')}
          </p>
        </div>
        )}
      </div>
    </div>
  );
}
