'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { getDashboardStats, getRecentActivity, type DashboardStats, type ActivityItem } from '@/app/actions/dashboard';
import {
  FolderKanban,
  Users,
  ShieldCheck,
  TrendingUp,
  Star,
  ArrowRight,
  Sparkles,
  Rss,
  FileUp,
  Mail,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { key: 'newProject', href: '/dashboard/projects/planner', icon: Sparkles, color: 'indigo' },
  { key: 'browseDirectory', href: '/dashboard/directory', icon: Users, color: 'emerald' },
  { key: 'viewNda', href: '/dashboard/nda', icon: ShieldCheck, color: 'amber' },
] as const;

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
};

export default function DashboardOverview() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getRecentActivity().then(setActivity).finally(() => setActivityLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('welcome', { name: user?.name || '' })}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('welcomeSub')}
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('stats.activeProjects'), value: String(stats?.activeProjects ?? 0), icon: FolderKanban, trend: '0' },
          { label: t('stats.teamMembers'), value: String(stats?.teamMembers ?? 0), icon: Users, trend: '0' },
          { label: t('stats.pendingNda'), value: String(stats?.pendingNdas ?? 0), icon: ShieldCheck, trend: '0' },
          { label: t('stats.avgRating'), value: stats?.avgRating ?? '—', icon: Star, trend: '0' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-slate-400" />
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        {t('quickActions')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.key}
              href={action.href}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${COLOR_MAP[action.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t(`actions.${action.key}`)}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <h2 className="mb-4 mt-8 text-lg font-semibold text-slate-900 dark:text-white">
        {t('recentActivity')}
      </h2>
      {activityLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : activity.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 text-center dark:border-slate-800/60 dark:bg-slate-900">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t('noActivity')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activity.map((item) => {
            const Icon = item.type === 'post' ? Rss : item.type === 'file' ? FileUp : item.type === 'invitation' ? Mail : Star;
            const iconColor = item.type === 'post' ? 'text-indigo-500' : item.type === 'file' ? 'text-emerald-500' : item.type === 'invitation' ? 'text-amber-500' : 'text-rose-500';
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3 dark:border-slate-800/60 dark:bg-slate-900"
              >
                <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
