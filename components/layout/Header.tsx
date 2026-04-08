'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Menu, X, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { key: 'directory', href: '/directory' },
  { key: 'projects', href: '/projects/planner' },
  { key: 'pricing', href: '/pricing' },
] as const;

export default function Header() {
  const t = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'glass border-b border-slate-200/50 shadow-sm dark:border-slate-800/50'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="animated-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Venture<span className="text-indigo-600 dark:text-indigo-400">Connect</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/80"
            aria-label="Change language"
          >
            <Globe className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
          <Link
            href="/auth/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/80"
          >
            {t('signIn')}
          </Link>
          <Link
            href="/auth/register"
            className="animated-gradient shine rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/30"
          >
            {t('getStarted')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 md:hidden',
          mobileMenuOpen ? 'max-h-96 border-t border-slate-200/50 dark:border-slate-800/50' : 'max-h-0'
        )}
      >
        <div className="glass space-y-1 px-4 pb-4 pt-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/80"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
          <hr className="my-2 border-slate-200/60 dark:border-slate-800/60" />
          <Link
            href="/auth/login"
            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/80"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('signIn')}
          </Link>
          <Link
            href="/auth/register"
            className="animated-gradient block rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('getStarted')}
          </Link>
        </div>
      </div>
    </header>
  );
}
