'use client';

import { useTranslations } from 'next-intl';
import {
  Calendar,
  DollarSign,
  Users,
  Flag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';

export default function WorkspaceOverview() {
  const t = useTranslations('projects.overview');

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label={t('duration')} value="16 weeks" sub="Week 6 of 16" color="blue" />
        <StatCard icon={DollarSign} label={t('budget')} value="$95,000" sub="$32,400 spent" color="green" />
        <StatCard icon={Users} label={t('teamSize')} value="5 / 6" sub="1 pending invite" color="violet" />
        <StatCard icon={Flag} label="Milestones" value="4 / 12" sub="8 remaining" color="amber" />
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Overall Progress</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">37%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full w-[37%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>Discovery (Done)</span>
          <span className="font-medium text-blue-500">Core Dev (Active)</span>
          <span>AI Features</span>
          <span>Launch</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming milestones */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t('upcomingMilestones')}
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Checkout flow complete', due: 'Apr 18', status: 'in_progress' },
              { title: 'Admin dashboard', due: 'Apr 25', status: 'pending' },
              { title: 'Payment integration tested', due: 'May 2', status: 'pending' },
              { title: 'AI recommendations MVP', due: 'May 16', status: 'pending' },
            ].map((ms) => (
              <div key={ms.title} className="flex items-center gap-3">
                {ms.status === 'in_progress' ? (
                  <Clock className="h-4 w-4 text-blue-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{ms.title}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Due {ms.due}</p>
                </div>
                {ms.status === 'in_progress' && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    In Progress
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t('recentActivity')}
          </h3>
          <div className="space-y-4">
            {[
              { user: 'Sarah Chen', action: 'completed milestone "Product catalog live"', time: '2 hours ago', icon: CheckCircle2, color: 'text-green-500' },
              { user: 'Aiko Tanaka', action: 'uploaded 3 files to Design Assets', time: '5 hours ago', icon: Activity, color: 'text-blue-500' },
              { user: 'Alex Rivera', action: 'started discussion "API rate limiting approach"', time: '1 day ago', icon: Activity, color: 'text-violet-500' },
              { user: 'System', action: 'NDA signed by new team member', time: '2 days ago', icon: AlertCircle, color: 'text-amber-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <item.icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.color}`} />
                <div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="font-medium">{item.user}</span> {item.action}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'green' | 'violet' | 'amber';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-500 dark:bg-blue-950',
    green: 'bg-green-50 text-green-500 dark:bg-green-950',
    violet: 'bg-violet-50 text-violet-500 dark:bg-violet-950',
    amber: 'bg-amber-50 text-amber-500 dark:bg-amber-950',
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
    </div>
  );
}
