'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
            <span className="text-xl font-bold text-white">V</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('signIn')}
          </h1>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Social login */}
          <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
              <Globe className="h-5 w-5" />
              {t('google')}
            </button>
            <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {t('linkedin')}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          {/* Email login */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('email')}
              </label>
              <input
                type="email"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t('password')}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <input
                type="password"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t('signIn')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t('noAccount')}{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {t('signUpLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
