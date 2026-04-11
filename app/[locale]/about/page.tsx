'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/context';
import BrandText from '@/components/ui/BrandText';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import {
  Target,
  Heart,
  Globe,
  Lightbulb,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const VALUES = [
  { key: 'transparency', icon: Lightbulb, color: 'from-amber-400 to-orange-500' },
  { key: 'collaboration', icon: Users, color: 'from-indigo-500 to-violet-500' },
  { key: 'security', icon: Shield, color: 'from-emerald-500 to-teal-500' },
  { key: 'innovation', icon: Sparkles, color: 'from-rose-500 to-pink-500' },
] as const;

const STATS = [
  { value: '28', labelKey: 'languages' },
  { value: '0%', labelKey: 'serviceFee' },
  { value: 'GPT-4o', labelKey: 'aiEngine' },
  { value: '24/7', labelKey: 'support' },
] as const;

export default function AboutPage() {
  const t = useTranslations('aboutPage');
  const { user } = useAuth();

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/50 to-white py-24 dark:from-violet-950/20 dark:to-zinc-950">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
              <Target className="h-7 w-7 text-white" />
            </div>
            <BrandText as="h1" text={t('title')} className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl" />
            <BrandText as="p" text={t('intro')} className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl shadow-2xl shadow-violet-500/10"
          >
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop"
              alt="Team collaborating around a table with laptops"
              width={1200}
              height={600}
              className="h-auto w-full object-cover"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Heart className="h-3 w-3" />
                {t('missionBadge')}
              </span>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
                {t('missionTitle')}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                {t('missionText1')}
              </p>
              <BrandText as="p" text={t('missionText2')} className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {STATS.map((stat) => (
                <div
                  key={stat.labelKey}
                  className="rounded-2xl border border-slate-200/60 bg-white p-6 text-center dark:border-slate-800/60 dark:bg-zinc-900"
                >
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t(`stats.${stat.labelKey}`)}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('valuesTitle')}</h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">{t('valuesSubtitle')}</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-zinc-900"
                >
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${value.color} p-2.5 shadow-sm`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t(`values.${value.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {t(`values.${value.key}.desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Globe className="mx-auto h-10 w-10 text-indigo-500" />
            <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{t('globalTitle')}</h2>
            <BrandText as="p" text={t('globalText')} className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400" />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Link
            href="/auth/register"
            className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
          >
            {t('cta')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      )}
    </div>
    </LazyMotion>
  );
}
