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
import type { Project } from '@/lib/types';
import type { TeamMemberData } from '@/app/actions/workspace';

interface Props {
  project: Project;
  teamMembers: TeamMemberData[];
}

export default function WorkspaceOverview({ project, teamMembers }: Props) {
  const t = useTranslations('projects.overview');

  const phases = project.timeline?.phases || [];
  const allMilestones = phases.flatMap((p) => p.milestones || []);
  const completedCount = allMilestones.filter((m) => m.status === 'completed').length;
  const totalCount = allMilestones.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const pendingInvites = project.pendingInviteIds?.length || 0;
  const budgetStr = project.estimatedBudget
    ? `${project.budgetCurrency || '$'}${project.estimatedBudget.toLocaleString()}`
    : '—';
  const activeMembers = teamMembers.filter((m) => m.status === 'active').length;

  // Upcoming milestones (non-completed, sorted by due date)
  const upcoming = allMilestones
    .filter((m) => m.status !== 'completed')
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label={t('duration')} value={project.estimatedDuration || '—'} sub={project.startDate ? `Started ${new Date(project.startDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}` : 'Not started'} color="blue" />
        <StatCard icon={DollarSign} label={t('budget')} value={budgetStr} sub="Estimated" color="green" />
        <StatCard icon={Users} label={t('teamSize')} value={`${activeMembers} / ${project.maxTeamSize}`} sub={pendingInvites > 0 ? `${pendingInvites} pending invite${pendingInvites > 1 ? 's' : ''}` : 'Full team'} color="violet" />
        <StatCard icon={Flag} label="Milestones" value={`${completedCount} / ${totalCount}`} sub={`${totalCount - completedCount} remaining`} color="amber" />
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Overall Progress</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">{progressPct}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        {phases.length > 0 && (
          <div className="mt-2 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
            {phases.map((phase) => {
              const phaseCompleted = (phase.milestones || []).every((m) => m.status === 'completed');
              const phaseActive = (phase.milestones || []).some((m) => m.status === 'in_progress');
              return (
                <span key={phase.id} className={phaseActive ? 'font-medium text-blue-500' : phaseCompleted ? 'text-green-500' : ''}>
                  {phase.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming milestones */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t('upcomingMilestones')}
          </h3>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-400">No upcoming milestones</p>
            ) : (
              upcoming.map((ms) => (
                <div key={ms.id} className="flex items-center gap-3">
                  {ms.status === 'in_progress' ? (
                    <Clock className="h-4 w-4 text-blue-500" />
                  ) : ms.status === 'blocked' ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{ms.title}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Due {ms.dueDate ? new Date(ms.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                  {ms.status === 'in_progress' && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      In Progress
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team overview */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t('recentActivity')}
          </h3>
          <div className="space-y-4">
            {teamMembers.length === 0 ? (
              <p className="text-sm text-zinc-400">No team members yet</p>
            ) : (
              teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="font-medium">{member.name}</span> — {member.role}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {member.status === 'pending' ? 'Invite pending' : member.skills.slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>
              ))
            )}
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
