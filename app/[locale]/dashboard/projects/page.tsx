'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Plus, FolderKanban, Clock, Users, ArrowRight } from 'lucide-react';

const MOCK_PROJECTS = [
  { id: 'p1', name: 'E-Commerce Platform Redesign', status: 'active', members: 5, dueDate: '2026-06-15' },
  { id: 'p2', name: 'Mobile Banking App', status: 'active', members: 3, dueDate: '2026-07-01' },
  { id: 'p3', name: 'Supply Chain Dashboard', status: 'planning', members: 0, dueDate: '2026-08-30' },
];

export default function ProjectsPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('nav.projects')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('projectsSub')}
          </p>
        </div>
        <Link
          href="/dashboard/projects/planner"
          className="animated-gradient flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20"
        >
          <Plus className="h-4 w-4" />
          {t('newProject')}
        </Link>
      </div>

      <div className="space-y-3">
        {MOCK_PROJECTS.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {project.name}
              </p>
              <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {project.members} members
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due {project.dueDate}
                </span>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                project.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              }`}
            >
              {project.status}
            </span>
            <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 dark:text-slate-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
