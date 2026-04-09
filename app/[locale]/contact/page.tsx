'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-5">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('emailLabel')}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">support@venturenex.com</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('officeLabel')}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('officeAddress')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{t('hoursLabel')}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('hoursValue')}</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center dark:border-green-900 dark:bg-green-950/30">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">{t('successTitle')}</h3>
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">{t('successMessage')}</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('nameLabel')}</label>
                    <input required type="text" className="input-field w-full" placeholder={t('namePlaceholder')} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('emailFieldLabel')}</label>
                    <input required type="email" className="input-field w-full" placeholder="you@example.com" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('subjectLabel')}</label>
                  <input required type="text" className="input-field w-full" placeholder={t('subjectPlaceholder')} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('messageLabel')}</label>
                  <textarea required rows={5} className="input-field w-full resize-none" placeholder={t('messagePlaceholder')} />
                </div>

                <button
                  type="submit"
                  className="animated-gradient inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg"
                >
                  <Send className="h-4 w-4" />
                  {t('sendButton')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
