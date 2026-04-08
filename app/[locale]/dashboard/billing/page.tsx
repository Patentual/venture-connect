'use client';

import { useTranslations } from 'next-intl';
import { CreditCard, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
        <CreditCard className="h-5 w-5 text-indigo-500" />
        {t('nav.billing')}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t('billingSub')}
      </p>

      {/* Current plan */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900 dark:bg-indigo-950/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Current Plan
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Professional</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          $49/month · Next billing date: May 8, 2026
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View plans <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
