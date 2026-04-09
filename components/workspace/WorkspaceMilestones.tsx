'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, MilestoneStatus } from '@/lib/types';

interface Props {
  project: Project;
}

const STATUS_CONFIG = {
  pending: { icon: Circle, color: 'text-zinc-300 dark:text-zinc-600', bg: 'bg-zinc-100 dark:bg-zinc-800', label: 'Pending' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', label: 'Completed' },
  blocked: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', label: 'Blocked' },
};

export default function WorkspaceMilestones({ project }: Props) {
  const t = useTranslations('projects.milestones');
  const phases = project.timeline?.phases || [];
  const [expandedPhase, setExpandedPhase] = useState<number>(phases.findIndex((p) => (p.milestones || []).some((m) => m.status === 'in_progress')));

  const allMilestones = phases.flatMap((p) => p.milestones || []);
  const totals = allMilestones.reduce(
    (acc, m) => ({ ...acc, [m.status]: (acc[m.status] || 0) + 1 }),
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex gap-3 overflow-x-auto">
        {(['completed', 'in_progress', 'pending', 'blocked'] as const).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          return (
            <div
              key={status}
              className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium', cfg.bg, cfg.color)}
            >
              <Icon className="h-4 w-4" />
              {totals[status] || 0} {cfg.label}
            </div>
          );
        })}
      </div>

      {/* Phases */}
      {phases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-400">No phases defined yet</p>
        </div>
      ) : null}
      {phases.map((phase, i) => {
        const phaseMilestones = phase.milestones || [];
        const completedCount = phaseMilestones.filter((m) => m.status === 'completed').length;
        const isExpanded = expandedPhase === i;

        return (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <button
              onClick={() => setExpandedPhase(isExpanded ? -1 : i)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{phase.name}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {completedCount} / {phaseMilestones.length} complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${phaseMilestones.length > 0 ? (completedCount / phaseMilestones.length) * 100 : 0}%` }}
                  />
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-zinc-100 px-5 pb-5 pt-3 dark:border-zinc-800">
                <div className="space-y-3">
                  {phaseMilestones.map((ms) => {
                    const cfg = STATUS_CONFIG[ms.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <div
                        key={ms.id}
                        className="flex items-start gap-3 rounded-xl border border-zinc-100 p-3 dark:border-zinc-800"
                      >
                        <StatusIcon className={cn('mt-0.5 h-5 w-5 shrink-0', cfg.color)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                              {ms.title}
                            </h4>
                            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cfg.bg, cfg.color)}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{ms.description}</p>
                          <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                            <span>Due {new Date(ms.dueDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</span>
                            <span>· {(ms.assigneeIds || []).length} assignee{(ms.assigneeIds || []).length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        {ms.status !== 'completed' && ms.status !== 'blocked' && (
                          <button className="shrink-0 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                            {t('markComplete')}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
