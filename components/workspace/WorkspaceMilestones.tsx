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

interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate: string;
  assignees: string[];
}

interface Phase {
  name: string;
  milestones: MilestoneItem[];
}

const MOCK_PHASES: Phase[] = [
  {
    name: 'Discovery & Architecture',
    milestones: [
      { id: 'm1', title: 'Technical spec approved', description: 'Architecture document signed off', status: 'completed', dueDate: '2026-03-01', assignees: ['Alex Rivera'] },
      { id: 'm2', title: 'Design system created', description: 'Component library in Figma', status: 'completed', dueDate: '2026-03-08', assignees: ['Aiko Tanaka'] },
      { id: 'm3', title: 'CI/CD pipeline live', description: 'Automated testing and deployment', status: 'completed', dueDate: '2026-03-10', assignees: ['Sarah Chen'] },
    ],
  },
  {
    name: 'Core Platform Development',
    milestones: [
      { id: 'm4', title: 'Product catalog live', description: 'CRUD operations with image uploads', status: 'completed', dueDate: '2026-03-28', assignees: ['Sarah Chen', 'Dev Patel'] },
      { id: 'm5', title: 'Checkout flow complete', description: 'Cart → shipping → payment → confirmation', status: 'in_progress', dueDate: '2026-04-18', assignees: ['Sarah Chen'] },
      { id: 'm6', title: 'Admin dashboard', description: 'Order management and analytics', status: 'pending', dueDate: '2026-04-25', assignees: ['Dev Patel'] },
      { id: 'm7', title: 'Payment integration tested', description: 'Stripe integration with test suite', status: 'pending', dueDate: '2026-05-02', assignees: ['Sarah Chen'] },
    ],
  },
  {
    name: 'AI & Sustainability Features',
    milestones: [
      { id: 'm8', title: 'AI recommendations MVP', description: 'Personalised product suggestions', status: 'pending', dueDate: '2026-05-16', assignees: ['Jun Wei'] },
      { id: 'm9', title: 'Carbon calculator', description: 'Per-product environmental impact', status: 'pending', dueDate: '2026-05-23', assignees: ['Jun Wei'] },
      { id: 'm10', title: 'Supply chain tracker', description: 'Visual journey from raw material to delivery', status: 'blocked', dueDate: '2026-05-30', assignees: ['Dev Patel', 'Jun Wei'] },
    ],
  },
  {
    name: 'Testing, QA & Launch',
    milestones: [
      { id: 'm11', title: 'QA complete', description: 'All critical bugs resolved', status: 'pending', dueDate: '2026-06-13', assignees: ['All'] },
      { id: 'm12', title: 'Production launch', description: 'Go-live with monitoring', status: 'pending', dueDate: '2026-06-27', assignees: ['All'] },
    ],
  },
];

const STATUS_CONFIG = {
  pending: { icon: Circle, color: 'text-zinc-300 dark:text-zinc-600', bg: 'bg-zinc-100 dark:bg-zinc-800', label: 'Pending' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', label: 'Completed' },
  blocked: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', label: 'Blocked' },
};

export default function WorkspaceMilestones() {
  const t = useTranslations('projects.milestones');
  const [expandedPhase, setExpandedPhase] = useState<number>(1);

  const totals = MOCK_PHASES.flatMap((p) => p.milestones).reduce(
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
      {MOCK_PHASES.map((phase, i) => {
        const completedCount = phase.milestones.filter((m) => m.status === 'completed').length;
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
                    {completedCount} / {phase.milestones.length} complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${(completedCount / phase.milestones.length) * 100}%` }}
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
                  {phase.milestones.map((ms) => {
                    const cfg = STATUS_CONFIG[ms.status];
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
                            <span>· {ms.assignees.join(', ')}</span>
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
