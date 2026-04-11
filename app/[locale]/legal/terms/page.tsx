'use client';

import { useTranslations } from 'next-intl';

export default function TermsOfServicePage() {
  const t = useTranslations('legal.terms');

  const SECTIONS = [
    'acceptance',
    'eligibility',
    'accountResponsibility',
    'acceptableUse',
    'intellectualProperty',
    'userContent',
    'payments',
    'projectCollaboration',
    'compensation',
    'dataMinimization',
    'noProofOfWork',
    'termination',
    'disclaimers',
    'limitation',
    'governingLaw',
    'changes',
  ] as const;

  return (
    <div className="min-h-screen bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t('lastUpdated')}</p>

        <div className="mt-10 space-y-10">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t('intro')}</p>

          {SECTIONS.map((section) => (
            <section key={section}>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t(`${section}.title`)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {t(`${section}.content`)}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('contactNote')}</p>
        </div>
      </div>
    </div>
  );
}
