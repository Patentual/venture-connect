'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, Clock, MoreVertical, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TeamMemberData } from '@/app/actions/workspace';

interface Props {
  teamMembers: TeamMemberData[];
}

export default function WorkspaceTeam({ teamMembers }: Props) {
  const t = useTranslations('projects.team');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {t('title')} ({teamMembers.length})
        </h3>
        <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <UserPlus className="h-4 w-4" />
          {t('inviteMore')}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white', member.color)}>
                  {member.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {member.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.role}</p>
                </div>
              </div>
              <button className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {member.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              {member.status === 'active' ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">{t('active')}</span>
                  <span className="text-zinc-400 dark:text-zinc-500">
                    · {t('joined', { date: new Date(member.joinedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) })}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">{t('pending')}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
