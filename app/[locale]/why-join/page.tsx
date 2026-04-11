'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import {
  Gift,
  Trophy,
  Globe,
  Star,
  Users,
  Sparkles,
  BadgeCheck,
  ArrowRight,
  Zap,
  TrendingUp,
  CheckCircle2,
  Coins,
  Brain,
  Rocket,
  Search,
  PenTool,
  FileUp,
  Radio,
  UserCheck,
} from 'lucide-react';

const INCENTIVES = [
  { icon: Coins, titleKey: 'freeTokens', descKey: 'freeTokensDesc', color: 'from-emerald-500 to-green-500' },
  { icon: Trophy, titleKey: 'earlyAdopter', descKey: 'earlyAdopterDesc', color: 'from-amber-400 to-orange-500' },
  { icon: BadgeCheck, titleKey: 'verifiedBadge', descKey: 'verifiedBadgeDesc', color: 'from-blue-500 to-cyan-500' },
  { icon: Star, titleKey: 'ratingsBoost', descKey: 'ratingsBoostDesc', color: 'from-violet-500 to-purple-500' },
  { icon: Users, titleKey: 'referralRewards', descKey: 'referralRewardsDesc', color: 'from-rose-500 to-pink-500' },
  { icon: Sparkles, titleKey: 'aiTokens', descKey: 'aiTokensDesc', color: 'from-indigo-500 to-violet-500' },
] as const;

const TOKEN_USES = [
  { key: 'aiPlanning', icon: Brain, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
  { key: 'priorityListing', icon: Rocket, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' },
  { key: 'profileBoost', icon: Search, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30' },
  { key: 'aiProfileOpt', icon: Sparkles, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30' },
  { key: 'proposalBoost', icon: UserCheck, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  { key: 'aiSummaries', icon: PenTool, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  { key: 'extraStorage', icon: FileUp, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
  { key: 'referralBroadcast', icon: Radio, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30' },
] as const;

const REASONS = [
  { icon: Zap, key: 'reason1' },
  { icon: Globe, key: 'reason2' },
  { icon: TrendingUp, key: 'reason3' },
  { icon: CheckCircle2, key: 'reason4' },
] as const;

export default function WhyJoinPage() {
  const t = useTranslations('whyJoinPage');
  const tInc = useTranslations('incentives');

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white py-24 dark:from-emerald-950/20 dark:to-zinc-950">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/20">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl shadow-2xl shadow-emerald-500/10"
          >
            <Image
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80&auto=format&fit=crop"
              alt="Professionals networking and growing together"
              width={1200}
              height={600}
              className="h-auto w-full object-cover"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Why professionals choose VC */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('reasonsTitle')}</h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={reason.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-zinc-900"
                >
                  <Icon className="mb-3 h-6 w-6 text-indigo-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t(`reasons.${reason.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {t(`reasons.${reason.key}.desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Incentive cards — moved from landing */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {tInc('title')}
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              {tInc('subtitle')}
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INCENTIVES.map((incentive, i) => {
              const Icon = incentive.icon;
              return (
                <motion.div
                  key={incentive.titleKey}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-2xl border border-slate-200/60 bg-white p-6 transition-all hover:shadow-lg dark:border-slate-800/60 dark:bg-zinc-900"
                >
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${incentive.color} p-2.5 shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {tInc(incentive.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {tInc(incentive.descKey)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Tokens Unlock */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('tokensTitle')}</h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">{t('tokensSubtitle')}</p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOKEN_USES.map((use, i) => {
              const Icon = use.icon;
              return (
                <motion.div
                  key={use.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:shadow-lg dark:border-slate-800/60 dark:bg-zinc-900"
                >
                  <div className={`mb-3 inline-flex rounded-xl p-2.5 ${use.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t(`tokenUses.${use.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {t(`tokenUses.${use.key}.desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-xs text-slate-400 dark:text-slate-500">
            {tInc('tokenDisclaimer')}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('ctaTitle')}</h2>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400">{t('ctaSubtitle')}</p>
          <div className="mt-8">
            <Link
              href="/auth/register"
              className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
            >
              {tInc('cta')} <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-xs text-slate-400">{tInc('ctaSub')}</p>
          </div>
        </div>
      </section>
    </div>
    </LazyMotion>
  );
}
