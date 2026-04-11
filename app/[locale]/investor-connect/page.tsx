'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import BrandText from '@/components/ui/BrandText';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import {
  Presentation,
  ShieldCheck,
  Brain,
  TrendingUp,
  Video,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  BarChart3,
  FileCheck,
  Coins,
  Crown,
} from 'lucide-react';

const PILLARS = [
  { key: 'pitchDeck', icon: Presentation, color: 'from-indigo-500 to-violet-500' },
  { key: 'dataRoom', icon: Lock, color: 'from-emerald-500 to-teal-500' },
  { key: 'roadmap', icon: TrendingUp, color: 'from-amber-400 to-orange-500' },
  { key: 'livePitch', icon: Video, color: 'from-rose-500 to-pink-500' },
] as const;

const DIFFERENTIATORS = [
  { key: 'verified', icon: ShieldCheck },
  { key: 'realData', icon: BarChart3 },
  { key: 'aiPowered', icon: Brain },
  { key: 'ndaProtected', icon: FileCheck },
  { key: 'teamRated', icon: Users },
  { key: 'multiPhase', icon: TrendingUp },
] as const;

export default function InvestorConnectPage() {
  const t = useTranslations('investorConnect');

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950 py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300">
              <Crown className="h-3.5 w-3.5" />
              {t('badge')}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <BrandText as="p" text={t('subtitle')} className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400" />
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
              >
                {t('ctaHero')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                {t('ctaPricing')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tagline band */}
      <section className="border-y border-indigo-500/20 bg-indigo-950/30 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-lg font-semibold text-indigo-300 sm:text-xl">
            &ldquo;{t('tagline')}&rdquo;
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('problemTitle')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {t('problemText')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('pillarsTitle')}</h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">{t('pillarsSubtitle')}</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-slate-200/60 bg-white p-7 transition-all hover:shadow-xl dark:border-slate-800/60 dark:bg-zinc-900"
                >
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${pillar.color} p-3 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t(`pillars.${pillar.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {t(`pillars.${pillar.key}.desc`)}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {[0, 1, 2].map((j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {t(`pillars.${pillar.key}.features.${j}`)}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What makes this different */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <BrandText as="h2" text={t('diffTitle')} className="text-3xl font-bold text-slate-900 dark:text-white" />
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">{t('diffSubtitle')}</p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map((diff, i) => {
              const Icon = diff.icon;
              return (
                <motion.div
                  key={diff.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-zinc-900"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t(`differentiators.${diff.key}.title`)}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {t(`differentiators.${diff.key}.desc`)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing hint */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Coins className="mx-auto h-10 w-10 text-amber-500" />
            <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{t('pricingTitle')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-slate-400">
              {t('pricingText')}
            </p>
            <div className="mt-8">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-zinc-900 dark:text-slate-300"
              >
                {t('pricingButton')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-indigo-500" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('ctaTitle')}</h2>
          <BrandText as="p" text={t('ctaSubtitle')} className="mt-3 text-base text-slate-500 dark:text-slate-400" />
          <div className="mt-8">
            <Link
              href="/auth/register"
              className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
            >
              {t('ctaButton')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
    </LazyMotion>
  );
}
