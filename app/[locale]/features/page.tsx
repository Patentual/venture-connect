'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import BrandText from '@/components/ui/BrandText';
import { useAuth } from '@/lib/auth/context';
import Image from 'next/image';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import {
  Brain,
  Globe,
  Users,
  Shield,
  FileCheck,
  Video,
  ArrowRight,
  Zap,
  PenTool,
  Mic,
  Star,
  Lock,
  Sparkles,
  MessageSquare,
  FolderOpen,
} from 'lucide-react';

const HERO_FEATURES = [
  { key: 'aiPlanning', icon: Brain, gradient: 'from-indigo-500 to-cyan-400', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop' },
  { key: 'directory', icon: Globe, gradient: 'from-violet-500 to-fuchsia-400', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop' },
  { key: 'teamAssembly', icon: Users, gradient: 'from-amber-500 to-orange-400', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop' },
  { key: 'workspace', icon: Shield, gradient: 'from-emerald-500 to-teal-400', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop' },
  { key: 'nda', icon: FileCheck, gradient: 'from-rose-500 to-pink-400', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop' },
  { key: 'meetings', icon: Video, gradient: 'from-sky-500 to-indigo-400', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop' },
] as const;

const EXTRA_FEATURES = [
  { key: 'whiteboard', icon: PenTool, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30' },
  { key: 'transcription', icon: Mic, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' },
  { key: 'ratings', icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  { key: 'accessCodes', icon: Lock, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30' },
  { key: 'aiReferrals', icon: Sparkles, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
  { key: 'discussions', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  { key: 'fileSharing', icon: FolderOpen, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' },
  { key: 'multiLang', icon: Globe, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30' },
] as const;

export default function FeaturesPage() {
  const t = useTranslations('featuresPage');
  const tLanding = useTranslations('landing');
  const { user } = useAuth();

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white py-20 dark:from-indigo-950/20 dark:to-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Zap className="h-3.5 w-3.5" />
              {t('badge')}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {t('title')}
            </h1>
            <BrandText as="p" text={t('subtitle')} className="mt-4 text-lg text-slate-600 dark:text-slate-400" />
          </motion.div>
        </div>
      </section>

      {/* Core Features — 6 cards from landing */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {HERO_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800/60 dark:bg-slate-900"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.key}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 text-white shadow-lg`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {tLanding(`features.${feature.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {tLanding(`features.${feature.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Extra Features Grid */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('moreTitle')}
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              {t('moreSubtitle')}
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXTRA_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:shadow-lg dark:border-slate-800/60 dark:bg-zinc-900"
                >
                  <div className={`mb-3 inline-flex rounded-xl p-2.5 ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t(`extra.${feature.key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {t(`extra.${feature.key}.desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {t('ctaTitle')}
          </h2>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400">{t('ctaSubtitle')}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="animated-gradient shine inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
            >
              {t('ctaButton')} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-8 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('ctaCompare')}
            </Link>
          </div>
        </div>
      </section>
      )}
    </div>
    </LazyMotion>
  );
}
