'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Gift,
  Trophy,
  Globe,
  Zap,
  Star,
  Users,
  Sparkles,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';

const INCENTIVES = [
  {
    icon: Gift,
    titleKey: 'freeTokens',
    descKey: 'freeTokensDesc',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    icon: Trophy,
    titleKey: 'earlyAdopter',
    descKey: 'earlyAdopterDesc',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    icon: BadgeCheck,
    titleKey: 'verifiedBadge',
    descKey: 'verifiedBadgeDesc',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Star,
    titleKey: 'ratingsBoost',
    descKey: 'ratingsBoostDesc',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
  },
  {
    icon: Users,
    titleKey: 'referralRewards',
    descKey: 'referralRewardsDesc',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
  },
  {
    icon: Sparkles,
    titleKey: 'aiTokens',
    descKey: 'aiTokensDesc',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
];

export default function SignupIncentives() {
  const t = useTranslations('incentives');

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/20">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Incentive cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INCENTIVES.map((incentive) => {
            const Icon = incentive.icon;
            return (
              <div
                key={incentive.titleKey}
                className="group rounded-2xl border border-slate-200/60 bg-white p-6 transition-all hover:shadow-lg hover:shadow-slate-200/40 dark:border-slate-800/60 dark:bg-slate-900 dark:hover:shadow-slate-900/40"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-2.5 ${incentive.color} shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t(incentive.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {t(incentive.descKey)}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/auth/register"
            className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
          >
            {t('cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            {t('ctaSub')}
          </p>
        </div>
      </div>
    </section>
  );
}
