'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { key: 'directory', href: '/directory' },
  { key: 'projects', href: '/projects' },
  { key: 'feed', href: '/feed' },
  { key: 'pricing', href: '/pricing' },
] as const;

export default function Header() {
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Venture Connect
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Change language"
          >
            <Globe className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {t('signIn')}
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          >
            {t('getStarted')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-zinc-200 transition-all duration-200 dark:border-zinc-800 md:hidden',
          mobileMenuOpen ? 'max-h-96' : 'max-h-0 border-t-0'
        )}
      >
        <div className="space-y-1 px-4 pb-4 pt-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
          <hr className="my-2 border-zinc-200 dark:border-zinc-800" />
          <Link
            href="/auth/login"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('signIn')}
          </Link>
          <Link
            href="/auth/register"
            className="block rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-center text-sm font-medium text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('getStarted')}
          </Link>
        </div>
      </div>
    </header>
  );
}
