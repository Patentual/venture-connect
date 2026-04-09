'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Plus, FolderKanban, Clock, Users, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { listMyProjects, type ProjectSummary } from '@/app/actions/projects';

export default function ProjectsPage() {
  const t = useTranslations('dashboard');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
            <Sparkles className="h-7 w-7 text-indigo-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            No projects yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create your first project to get started with your team workspace.
          </p>
          <Link
            href="/dashboard/projects/planner"
            className="animated-gradient mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            {t('newProject')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
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
                  {project.title}
                </p>
                <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {project.memberCount} members
                  </span>
                  {project.endDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due {new Date(project.endDate).toLocaleDateString()}
                  </span>
                  )}
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
      )}
    </div>
  );
}
