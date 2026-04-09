'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, Globe, ChevronDown, LayoutDashboard, Check } from 'lucide-react';
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

  // Only use transparent/white header on the landing page (has dark hero video)
  const strippedPath = pathname.replace(new RegExp(`^/(${routing.locales.join('|')})`), '') || '/';
  const isHeroPage = strippedPath === '/';
  const lightHeader = isHeroPage && !scrolled;

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
    const normalized = pathWithoutLocale || '/';
    const newPath = newLocale === routing.defaultLocale ? normalized : `/${newLocale}${normalized}`;
    setLangOpen(false);
    router.replace(newPath);
  };

  // Prefetch all nav routes so they're instant when tapped in the drawer
  useEffect(() => {
    const allRoutes = [...PUBLIC_NAV_ITEMS, ...AUTH_NAV_ITEMS, { href: '/auth/login' }, { href: '/auth/register' }];
    const seen = new Set<string>();
    allRoutes.forEach(({ href }) => {
      if (!seen.has(href)) {
        seen.add(href);
        router.prefetch(href);
      }
    });
  }, [router]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrolled(prev => {
            const next = window.scrollY > 20;
            return prev === next ? prev : next;
          });
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled || !isHeroPage
          ? 'border-b border-slate-200/50 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/95'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icon.svg" alt="VentureNex" width={36} height={36} className="h-9 w-9" />
          <span className={cn('text-lg font-bold tracking-tight transition-colors', lightHeader ? 'text-white' : 'text-slate-900 dark:text-white')}>
            Venture<span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text font-extrabold italic text-transparent">Nex</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all',
                lightHeader
                  ? 'text-white/80 hover:bg-white/10 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
              )}
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
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm transition-colors',
                lightHeader
                  ? 'text-white/70 hover:bg-white/10 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/80'
              )}
              aria-label="Change language"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{locale}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', langOpen && 'rotate-180')} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full z-[60] mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
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
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  lightHeader
                    ? 'text-white/80 hover:bg-white/10 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/80'
                )}
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
          className={cn(
            'rounded-xl p-2 transition-colors md:hidden',
            lightHeader
              ? 'text-white hover:bg-white/10'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

    </header>

      {/* Mobile drawer overlay — solid bg, no blur */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer — solid bg, no blur */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-slate-950 transition-transform duration-200 ease-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            <Image src="/icon.svg" alt="VentureNex" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight text-white">
              Venture<span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text font-extrabold italic text-transparent">Nex</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className="block w-full rounded-xl px-4 py-4 text-left text-base font-medium text-slate-300 active:bg-white/20 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push(item.href);
                }}
              >
                {t(item.key)}
              </button>
            ))}
          </div>
        </nav>

        {/* Drawer footer actions */}
        <div className="border-t border-white/10 px-4 py-5 space-y-4">
          {user ? (
            <button
              className="animated-gradient block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => {
                setMobileMenuOpen(false);
                router.push('/dashboard');
              }}
            >
              {t('dashboard')}
            </button>
          ) : (
            <>
              <button
                className="block w-full rounded-xl px-4 py-4 text-center text-base font-medium text-slate-300 active:bg-white/20 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/auth/login');
                }}
              >
                {t('signIn')}
              </button>
              <button
                className="animated-gradient shine block w-full rounded-xl px-4 py-4 text-center text-base font-semibold text-white shadow-lg shadow-indigo-500/20"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/auth/register');
                }}
              >
                {t('getStarted')}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
