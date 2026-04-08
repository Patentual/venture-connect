'use client';

import { useTranslations } from 'next-intl';
import { ShieldCheck, Clock, MoreVertical, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  joinedAt: string;
  status: 'active' | 'pending';
  initials: string;
  color: string;
}

const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'Alex Rivera', role: 'Project Creator', skills: ['Product Management', 'Strategy'], joinedAt: '2026-02-15', status: 'active', initials: 'AR', color: 'from-blue-500 to-cyan-500' },
  { id: '2', name: 'Sarah Chen', role: 'Full-Stack Engineer', skills: ['Next.js', 'TypeScript', 'PostgreSQL'], joinedAt: '2026-03-01', status: 'active', initials: 'SC', color: 'from-violet-500 to-pink-500' },
  { id: '3', name: 'Dev Patel', role: 'Full-Stack Engineer', skills: ['React', 'Node.js', 'Stripe'], joinedAt: '2026-03-01', status: 'active', initials: 'DP', color: 'from-green-500 to-emerald-500' },
  { id: '4', name: 'Aiko Tanaka', role: 'UI/UX Designer', skills: ['Figma', 'Design Systems', 'Prototyping'], joinedAt: '2026-03-05', status: 'active', initials: 'AT', color: 'from-amber-500 to-orange-500' },
  { id: '5', name: 'Jun Wei', role: 'ML Engineer', skills: ['Python', 'OpenAI API', 'Recommendation Systems'], joinedAt: '2026-04-02', status: 'active', initials: 'JW', color: 'from-rose-500 to-red-500' },
  { id: '6', name: 'Maria Lopez', role: 'QA Engineer', skills: ['Playwright', 'API Testing', 'Accessibility'], joinedAt: '', status: 'pending', initials: 'ML', color: 'from-zinc-400 to-zinc-500' },
];

export default function WorkspaceTeam() {
  const t = useTranslations('projects.team');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {t('title')} ({MOCK_TEAM.length})
        </h3>
        <button className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <UserPlus className="h-4 w-4" />
          {t('inviteMore')}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_TEAM.map((member) => (
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
