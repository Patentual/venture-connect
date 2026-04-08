'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIERS = ['free', 'professional', 'creator', 'enterprise'] as const;

export default function PricingPage() {
  const t = useTranslations('pricing');
  const [annual, setAnnual] = useState(false);

  return (
    <div className="bg-zinc-50 py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {t('subtitle')}
          </p>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={cn(
                'text-sm font-medium',
                !annual ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400'
              )}
            >
              {t('monthly')}
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                annual ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                  annual ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span
              className={cn(
                'text-sm font-medium',
                annual ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400'
              )}
            >
              {t('yearly')}
              <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                -20%
              </span>
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-4">
          {TIERS.map((tier) => {
            const isCreator = tier === 'creator';
            const features = t.raw(`${tier}.features`) as string[];

            return (
              <div
                key={tier}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6 transition-all',
                  isCreator
                    ? 'border-blue-500 bg-white shadow-xl shadow-blue-500/10 dark:border-blue-400 dark:bg-zinc-900'
                    : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                )}
              >
                {isCreator && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {t(`${tier}.name`)}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {t(`${tier}.description`)}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                      {t(`${tier}.price`)}
                    </span>
                    {t(`${tier}.period`) && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        /{t(`${tier}.period`)}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier === 'enterprise' ? '/contact' : '/auth/register'}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                    isCreator
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm hover:opacity-90'
                      : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  )}
                >
                  {t(`${tier}.cta`)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
