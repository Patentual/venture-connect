'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/50 bg-slate-50 dark:border-slate-800/50 dark:bg-slate-950">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute -right-40 -top-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Newsletter bar */}
        <div className="glass-card mb-16 rounded-3xl p-8 sm:p-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Stay ahead of the curve</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Get weekly insights on remote teams, AI tools, and project management.</p>
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field w-full md:w-64"
              />
              <button className="animated-gradient shrink-0 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg">
                Subscribe <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="animated-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-indigo-500/20">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Venture<span className="text-indigo-600 dark:text-indigo-400">Connect</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {t('tagline')}
            </p>
            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              {['X', 'Li', 'Gh'].map((icon) => (
                <button
                  key={icon}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-xs font-bold text-slate-500 transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800/60 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('product')}
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: 'Directory', href: '/directory' },
                { label: 'AI Planner', href: '/projects/planner' },
                { label: 'Pricing', href: '/pricing' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('company')}
            </h3>
            <ul className="mt-4 space-y-3">
              {(['about', 'blog', 'careers', 'contact'] as const).map((key) => (
                <li key={key}>
                  <Link
                    href={`/${key}`}
                    className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              {(['privacy', 'terms', 'cookies'] as const).map((key) => (
                <li key={key}>
                  <Link
                    href={`/legal/${key}`}
                    className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-8 dark:border-slate-800/60 sm:flex-row">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t('copyright', { year })}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Designed with precision. Built for professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}
