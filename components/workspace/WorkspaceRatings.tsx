'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TeamMemberData } from '@/app/actions/workspace';

interface TeamMemberRating {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  currentRating: number | null;
  totalRatings: number;
  avgRating: number;
}

interface Props {
  projectId: string;
  teamMembers: TeamMemberData[];
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={cn(
            'transition-transform',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClass,
              (hover || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function WorkspaceRatings({ projectId, teamMembers }: Props) {
  const t = useTranslations('projects.ratings');
  const [members, setMembers] = useState<TeamMemberRating[]>(() =>
    teamMembers.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      initials: m.initials,
      color: m.color,
      currentRating: null,
      totalRatings: 0,
      avgRating: 0,
    }))
  );
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  // Load existing ratings on mount
  useEffect(() => {
    import('@/app/actions/ratings').then(({ getRatings }) => {
      getRatings(projectId, teamMembers.map((m) => m.id)).then((summaries) => {
        const alreadyRated = new Set<string>();
        setMembers((prev) =>
          prev.map((m) => {
            const s = summaries.find((r) => r.memberId === m.id);
            if (s?.myRating) alreadyRated.add(m.id);
            return s
              ? { ...m, avgRating: s.avgRating, totalRatings: s.totalRatings, currentRating: s.myRating }
              : m;
          })
        );
        setSubmitted(alreadyRated);
      });
    });
  }, [projectId, teamMembers]);

  const handleRate = (memberId: string, rating: number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, currentRating: rating } : m))
    );
  };

  const handleSubmitRating = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member?.currentRating) return;

    setSubmittingId(memberId);
    const { submitRating } = await import('@/app/actions/ratings');
    const result = await submitRating(projectId, memberId, member.currentRating);
    if (result.success) {
      setSubmitted((prev) => new Set([...prev, memberId]));
    }
    setSubmittingId(null);
  };

  const allSubmitted = members.every((m) => submitted.has(m.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <Trophy className="h-4 w-4 text-amber-500" />
            {t('title')}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t('onlyLeader')}</p>
      </div>

      {/* Rating cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((member) => {
          const isSubmitted = submitted.has(member.id);
          const isSubmitting = submittingId === member.id;

          return (
            <div
              key={member.id}
              className={cn(
                'rounded-2xl border p-4 transition-all',
                isSubmitted
                  ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20'
                  : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white', member.color)}>
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {member.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.role}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <StarRating value={member.avgRating} readonly size="sm" />
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {member.avgRating.toFixed(1)} ({member.totalRatings} {t('reviews')})
                  </p>
                </div>
              </div>

              {/* Rating input or submitted state */}
              <div className="mt-4">
                {isSubmitted ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('submitted')} — {member.currentRating}/5
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {t('ratePerformance')}
                      </p>
                      <StarRating
                        value={member.currentRating || 0}
                        onChange={(v) => handleRate(member.id, v)}
                      />
                    </div>
                    <button
                      onClick={() => handleSubmitRating(member.id)}
                      disabled={!member.currentRating || isSubmitting}
                      className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        t('submit')
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final submission */}
      {allSubmitted && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950/20">
          <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
          <p className="mt-2 text-sm font-semibold text-green-700 dark:text-green-400">
            {t('allRated')}
          </p>
          <p className="text-xs text-green-600/80 dark:text-green-500">
            {t('ratingsUpdated')}
          </p>
        </div>
      )}
    </div>
  );
}
