'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { logout } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  FolderKanban,
  ShieldCheck,
  UserCircle,
  Rss,
  CreditCard,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

const SIDEBAR_ITEMS = [
  { key: 'overview', href: '/dashboard', icon: LayoutDashboard },
  { key: 'directory', href: '/dashboard/directory', icon: Search },
  { key: 'projects', href: '/dashboard/projects', icon: FolderKanban },
  { key: 'nda', href: '/dashboard/nda', icon: ShieldCheck },
  { key: 'profile', href: '/dashboard/profile', icon: UserCircle },
  { key: 'feed', href: '/dashboard/feed', icon: Rss },
  { key: 'billing', href: '/dashboard/billing', icon: CreditCard },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string): boolean {
    // Strip locale prefix for matching
    const segments = pathname.split('/');
    const pathWithoutLocale =
      segments.length > 1 &&
      ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'].includes(segments[1])
        ? '/' + segments.slice(2).join('/')
        : pathname;

    if (href === '/dashboard') {
      return pathWithoutLocale === '/dashboard';
    }
    return pathWithoutLocale.startsWith(href);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-16 left-0 z-50 flex flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-950/80 md:relative md:inset-y-0',
          collapsed ? 'w-[68px]' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Sidebar header */}
        <div className={cn(
          'flex h-14 items-center border-b border-slate-200/60 px-4 dark:border-slate-800/60',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="animated-gradient flex h-7 w-7 items-center justify-center rounded-lg shadow-sm shadow-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {t('title')}
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 md:flex"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? t(`nav.${item.key}`) : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0',
                        active
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      )}
                    />
                    {!collapsed && <span>{t(`nav.${item.key}`)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className={cn(
          'border-t border-slate-200/60 p-3 dark:border-slate-800/60',
          collapsed && 'flex flex-col items-center'
        )}>
          {!collapsed && user && (
            <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          )}
          <form action={logout}>
            <button
              type="submit"
              title={collapsed ? t('nav.signOut') : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400',
                collapsed && 'justify-center px-2'
              )}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{t('nav.signOut')}</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-12 items-center border-b border-slate-200/60 px-4 dark:border-slate-800/60 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
