'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import Image from 'next/image';
import BrandText from '@/components/ui/BrandText';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
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
  Star,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

const FEATURES = [
  { key: 'aiPlanning', icon: Brain, gradient: 'from-indigo-500 to-cyan-400', glow: 'glow-indigo', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop' },
  { key: 'directory', icon: Globe, gradient: 'from-violet-500 to-fuchsia-400', glow: 'glow-violet', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop' },
  { key: 'teamAssembly', icon: Users, gradient: 'from-amber-500 to-orange-400', glow: 'glow-cyan', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop' },
  { key: 'workspace', icon: Shield, gradient: 'from-emerald-500 to-teal-400', glow: 'glow-cyan', image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop' },
  { key: 'nda', icon: FileCheck, gradient: 'from-rose-500 to-pink-400', glow: 'glow-violet', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop' },
  { key: 'meetings', icon: Video, gradient: 'from-sky-500 to-indigo-400', glow: 'glow-indigo', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop' },
] as const;

const STEPS = [
  { key: 'step1', icon: Sparkles, num: '01', color: 'from-indigo-500 to-violet-500' },
  { key: 'step2', icon: ClipboardCheck, num: '02', color: 'from-violet-500 to-fuchsia-500' },
  { key: 'step3', icon: Search, num: '03', color: 'from-fuchsia-500 to-pink-500' },
  { key: 'step4', icon: Rocket, num: '04', color: 'from-pink-500 to-rose-500' },
] as const;

const TESTIMONIAL_META = [
  { avatar: 'EV', color: 'from-indigo-500 to-cyan-500', rating: 5 },
  { avatar: 'RP', color: 'from-violet-500 to-fuchsia-500', rating: 5 },
  { avatar: 'SL', color: 'from-emerald-500 to-teal-500', rating: 5 },
];

const STAT_KEYS = [
  { valueKey: 'professionalsValue', labelKey: 'professionals', icon: Users },
  { valueKey: 'countriesValue', labelKey: 'countries', icon: Globe },
  { valueKey: 'projectsValue', labelKey: 'projects', icon: Rocket },
  { valueKey: 'satisfactionValue', labelKey: 'satisfaction', icon: Star },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(max-width: 768px)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(max-width: 768px)').matches,
    () => false,
  );
}

export default function LandingPage() {
  const t = useTranslations('landing');
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <LazyMotion features={domAnimation}>
    <div className="flex flex-col">

      {/* ══════════════ HERO ══════════════ */}
      <section className="noise relative -mt-16 min-h-[90vh] overflow-hidden">
        {/* Cinematic hero background video */}
        <div className="pointer-events-none absolute inset-0">
          {isMobile ? (
            <Image
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop&q=60"
              alt=""
              fill
              className="object-cover object-center"
              priority
            />
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              poster="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&h=1080&fit=crop&q=80"
              className="absolute inset-0 h-full w-full object-cover object-center"
            >
              <source src="/hero-bg.webm" type="video/webm" />
              <source src="/hero-bg.mp4" type="video/mp4" />
            </video>
          )}
          {/* Dark brand overlay — keeps video visible while ensuring readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/65 to-indigo-950/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/90" />
        </div>
        {/* Accent colour blurs on top of image — smaller on mobile for GPU perf */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <div className="absolute -top-40 right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/15 blur-[100px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 sm:hidden">
          <div className="absolute -top-20 right-0 h-[200px] w-[200px] rounded-full bg-indigo-600/15 blur-[60px]" />
          <div className="absolute -bottom-20 left-0 h-[200px] w-[200px] rounded-full bg-cyan-500/10 blur-[60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-36 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left — Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-indigo-300 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('badge')}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="mt-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg"
              >
                {t('headline')}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-6 max-w-xl text-lg leading-8 text-slate-300"
              >
                <BrandText text={t('subheadline')} />
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                {user ? (
                  <Link
                    href="/dashboard"
                    className="shine animated-gradient inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-2xl hover:shadow-indigo-500/30"
                  >
                    {t('dashboard')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                    <Link
                      href="/auth/register"
                      className="shine animated-gradient inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-2xl hover:shadow-indigo-500/30"
                    >
                      {t('cta')}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                )}
              </motion.div>

              {/* Trust logos / metrics */}
              <motion.div variants={fadeUp} custom={4} className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'].map((color, i) => (
                    <div
                      key={i}
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${color} text-xs font-bold text-white ring-2 ring-slate-900`}
                    >
                      {['SC', 'MR', 'AT', 'PS', 'JW'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {t('trustedBy', { count: '12,000' })}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — Floating Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateY: -5 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              {/* Main dashboard card */}
              <div className="glass-card float relative overflow-hidden rounded-3xl p-1">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=540&fit=crop"
                  alt="Dashboard preview"
                  width={800}
                  height={540}
                  className="rounded-2xl object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm font-semibold text-white">{t('hero.dashboardTitle')}</p>
                  <p className="text-xs text-white/70">{t('hero.dashboardSubtitle')}</p>
                </div>
              </div>

              {/* Floating stat card — top right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="float-delayed glass-card glow-indigo absolute -right-4 -top-4 rounded-2xl px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{t('hero.successRate')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('hero.successRateLabel')}</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card — bottom left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="float glass-card glow-cyan absolute -bottom-6 -left-6 rounded-2xl px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('hero.ndaSigned')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('hero.ndaSignedBy')}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS BAR ══════════════ */}
      <section className="relative -mt-8 z-20 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card grid grid-cols-2 gap-6 rounded-3xl px-8 py-8 sm:grid-cols-4">
          {STAT_KEYS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <Icon className="mx-auto mb-2 h-5 w-5 text-indigo-500" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{t(`stats.${stat.valueKey}`)}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(`stats.${stat.labelKey}`)}</p>
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="relative overflow-hidden bg-slate-50 py-32 dark:bg-slate-950/50">
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {t('howItWorks.title')}
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              {t('howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className="relative mt-20">
            {/* Animated connector line */}
            <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-indigo-500 via-violet-500 via-fuchsia-500 to-rose-500 opacity-20 md:block lg:left-1/2 lg:-translate-x-1/2" />

            <div className="space-y-16 md:space-y-24">
              {STEPS.map((step, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className={`relative flex flex-col gap-8 md:flex-row md:items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
                  >
                    {/* Number badge */}
                    <div className="flex shrink-0 items-center gap-4 md:w-1/2">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-xl font-black text-white shadow-xl`}>
                        {step.num}
                      </div>
                      <div className="md:max-w-sm">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {t(`howItWorks.${step.key}.title`)}
                        </h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                          {t(`howItWorks.${step.key}.description`)}
                        </p>
                      </div>
                    </div>
                    {/* Visual */}
                    <div className="md:w-1/2">
                      <div className="glass-card overflow-hidden rounded-2xl p-1">
                        <Image
                          src={[
                            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=340&fit=crop',
                            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=340&fit=crop',
                            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=340&fit=crop',
                            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop',
                          ][i]}
                          alt={step.key}
                          width={600}
                          height={340}
                          loading="lazy"
                          className="rounded-xl object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section className="relative overflow-hidden py-32">
        <div className="pointer-events-none absolute inset-0 mesh-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('testimonials.title')}
            </h2>
            <BrandText as="p" text={t('testimonials.subtitle')} className="mt-4 text-lg text-slate-600 dark:text-slate-400" />
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIAL_META.map((meta, i) => (
              <motion.div
                key={meta.avatar}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-3xl p-8"
              >
                <div className="flex items-center gap-1">
                  {[...Array(meta.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  &ldquo;{t(`testimonials.items.${i}.quote`)}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${meta.color} text-sm font-bold text-white`}>
                    {meta.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t(`testimonials.items.${i}.name`)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t(`testimonials.items.${i}.role`)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BOTTOM CTA ══════════════ */}
      {!user && (
      <section className="relative overflow-hidden">
        <div className="animated-gradient py-24 sm:py-32">
          <div className="noise pointer-events-none absolute inset-0" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {t('cta2.title')}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">{t('cta2.subtitle')}</p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="shine inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-indigo-700 shadow-xl transition-all hover:bg-indigo-50 hover:shadow-2xl"
                >
                  {t('cta2.button')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  {t('cta2.viewPricing')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      )}

    </div>
    </LazyMotion>
  );
}
