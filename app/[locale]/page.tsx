'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain,
  Globe,
  Users,
  Shield,
  FileCheck,
  Video,
  ArrowRight,
  Sparkles,
  Search,
  ClipboardCheck,
  Rocket,
} from 'lucide-react';

const FEATURES = [
  { key: 'aiPlanning', icon: Brain, gradient: 'from-blue-500 to-cyan-500' },
  { key: 'directory', icon: Globe, gradient: 'from-violet-500 to-purple-500' },
  { key: 'teamAssembly', icon: Users, gradient: 'from-amber-500 to-orange-500' },
  { key: 'workspace', icon: Shield, gradient: 'from-emerald-500 to-green-500' },
  { key: 'nda', icon: FileCheck, gradient: 'from-rose-500 to-pink-500' },
  { key: 'meetings', icon: Video, gradient: 'from-sky-500 to-indigo-500' },
] as const;

const STEPS = [
  { key: 'step1', icon: Sparkles, num: '01' },
  { key: 'step2', icon: ClipboardCheck, num: '02' },
  { key: 'step3', icon: Search, num: '03' },
  { key: 'step4', icon: Rocket, num: '04' },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function LandingPage() {
  const t = useTranslations('landing');

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                {t('badge')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl"
            >
              {t('headline')}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400"
            >
              {t('subheadline')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:opacity-90"
              >
                {t('cta')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/directory"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-8 py-3.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {t('ctaSecondary')}
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.p
              variants={fadeUp}
              custom={4}
              className="mt-10 text-sm text-zinc-500 dark:text-zinc-400"
            >
              {t('trustedBy', { count: '50' })}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group relative rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                  <div
                    className={`inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 text-white shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {t(`features.${feature.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {t(`features.${feature.key}.description`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-zinc-50 py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              {t('howItWorks.title')}
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="relative mt-16">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-500/20 via-violet-500/20 to-transparent lg:block" />

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="relative flex gap-6"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                        {step.num}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                        {t(`howItWorks.${step.key}.title`)}
                      </h3>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        {t(`howItWorks.${step.key}.description`)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-violet-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('cta2.title')}
          </h2>
          <p className="mt-4 text-lg text-blue-100">{t('cta2.subtitle')}</p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50"
          >
            {t('cta2.button')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
