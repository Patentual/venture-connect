'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Venture Connect
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {t('tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t('product')}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/directory"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {t('product')}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {t('product')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t('company')}
            </h3>
            <ul className="mt-3 space-y-2">
              {(['about', 'blog', 'careers', 'contact'] as const).map((key) => (
                <li key={key}>
                  <Link
                    href={`/${key}`}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t('legal')}
            </h3>
            <ul className="mt-3 space-y-2">
              {(['privacy', 'terms', 'cookies'] as const).map((key) => (
                <li key={key}>
                  <Link
                    href={`/legal/${key}`}
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
            {t('copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
