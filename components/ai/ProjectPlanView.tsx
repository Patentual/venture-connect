'use client';

import { useTranslations } from 'next-intl';
import {
  Calendar,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Wrench,
  Package,
  Flag,
} from 'lucide-react';
import { useState } from 'react';

interface ProjectPlanViewProps {
  plan: {
    title: string;
    summary: string;
    estimatedDuration: string;
    estimatedBudget: string;
    phases: {
      name: string;
      duration: string;
      description: string;
      milestones: { title: string; description: string }[];
      tools: string[];
      materials: string[];
    }[];
    personnel: {
      role: string;
      count: number;
      skills: string[];
      phase: string;
      estimatedRate: string;
    }[];
  };
  onApprove?: () => void;
  onEdit?: () => void;
}

export default function ProjectPlanView({ plan, onApprove, onEdit }: ProjectPlanViewProps) {
  const t = useTranslations('ai');
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      {/* Plan header */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{plan.title}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{plan.summary}</p>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-950">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {plan.estimatedDuration}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm dark:bg-green-950">
            <span className="font-medium text-green-700 dark:text-green-300">
              {plan.estimatedBudget}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm dark:bg-violet-950">
            <Users className="h-4 w-4 text-violet-500" />
            <span className="font-medium text-violet-700 dark:text-violet-300">
              {plan.personnel.reduce((sum, p) => sum + p.count, 0)} people
            </span>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Project Phases
        </h3>
        {plan.phases.map((phase, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <button
              type="button"
              onClick={() => setExpandedPhase(expandedPhase === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {phase.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{phase.duration}</p>
                </div>
              </div>
              {expandedPhase === i ? (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              )}
            </button>

            {expandedPhase === i && (
              <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{phase.description}</p>

                {/* Milestones */}
                {phase.milestones.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <Flag className="h-3 w-3" /> Milestones
                    </h5>
                    <div className="space-y-2">
                      {phase.milestones.map((ms, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
                          <div>
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                              {ms.title}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {ms.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools & Materials */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {phase.tools.length > 0 && (
                    <div>
                      <h5 className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <Wrench className="h-3 w-3" /> Tools
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {phase.tools.map((tool) => (
                          <span
                            key={tool}
                            className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {phase.materials.length > 0 && (
                    <div>
                      <h5 className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <Package className="h-3 w-3" /> Materials
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {phase.materials.map((mat) => (
                          <span
                            key={mat}
                            className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Personnel */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Personnel Requirements
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {plan.personnel.map((person, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {person.role}
                </h4>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                  ×{person.count}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Phase: {person.phase} · {person.estimatedRate}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {person.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onApprove}
          className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t('approveTimeline')}
        </button>
        <button
          onClick={onEdit}
          className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {t('editTimeline')}
        </button>
      </div>
    </div>
  );
}
