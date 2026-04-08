'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Globe, ChevronDown, Sparkles, LayoutDashboard, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
};

const PUBLIC_NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'features', href: '/features' },
  { key: 'compare', href: '/compare' },
  { key: 'whyJoin', href: '/why-join' },
  { key: 'about', href: '/about' },
  { key: 'investorConnect', href: '/investor-connect' },
  { key: 'pricing', href: '/pricing' },
] as const;

const AUTH_NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'dashboard', href: '/dashboard' },
  { key: 'features', href: '/features' },
  { key: 'compare', href: '/compare' },
  { key: 'about', href: '/about' },
  { key: 'pricing', href: '/pricing' },
] as const;

export default function Header() {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const NAV_ITEMS = user ? AUTH_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const switchLocale = (newLocale: string) => {
    // Strip current locale prefix from pathname if present
    const segments = pathname.split('/');
    const currentLocaleInPath = routing.locales.includes(segments[1] as any);
    const pathWithoutLocale = currentLocaleInPath ? '/' + segments.slice(2).join('/') : pathname;
    const newPath = newLocale === routing.defaultLocale ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;
    setLangOpen(false);
    router.push(newPath);
  };

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
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/80"
              aria-label="Change language"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{locale}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', langOpen && 'rotate-180')} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {routing.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-2 text-sm transition-colors',
                      loc === locale
                        ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    <span>{LOCALE_LABELS[loc] || loc}</span>
                    {loc === locale && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {user ? (
            <Link
              href="/dashboard"
              className="animated-gradient shine flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:shadow-indigo-500/30"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('dashboard')}
            </Link>
          ) : (
            <>
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
            </>
          )}
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
          {user ? (
            <Link
              href="/dashboard"
              className="animated-gradient block rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('dashboard')}
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
