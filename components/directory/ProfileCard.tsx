'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';

interface ProfileCardProps {
  profile: UserProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const t = useTranslations('directory');

  const isAvailable = profile.availabilityStatus === 'available';
  const isAvailableSoon = profile.availabilityStatus === 'available_from';

  return (
    <Link
      href={`/profile/${profile.id}`}
      className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      {/* Arrow indicator */}
      <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-zinc-300 transition-all group-hover:text-blue-500 dark:text-zinc-600" />

      {/* Header: Avatar + name */}
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
            {profile.profilePhotoUrl ? (
              <Image
                src={profile.profilePhotoUrl}
                alt={profile.fullName}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                {profile.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            )}
          </div>
          {/* Availability dot */}
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950',
              isAvailable
                ? 'bg-green-500'
                : isAvailableSoon
                  ? 'bg-amber-500'
                  : 'bg-zinc-300 dark:bg-zinc-600'
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {profile.fullName}
            </h3>
            {profile.isVerified && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            )}
          </div>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {profile.headline}
          </p>
        </div>
      </div>

      {/* Location + availability */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        {(profile.city || profile.country) && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {[profile.city, profile.country].filter(Boolean).join(', ')}
          </span>
        )}
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            isAvailable
              ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
              : isAvailableSoon
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          )}
        >
          <Clock className="h-3 w-3" />
          {isAvailable
            ? t('available')
            : isAvailableSoon
              ? t('availableFrom', { date: profile.availableFrom ?? '' })
              : t('unavailable')}
        </span>
      </div>

      {/* Skills */}
      <div className="mt-3 flex flex-wrap gap-1">
        {profile.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {skill}
          </span>
        ))}
        {profile.skills.length > 4 && (
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-400 dark:bg-zinc-800">
            +{profile.skills.length - 4}
          </span>
        )}
      </div>

      {/* Footer: reputation */}
      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3 mt-3 dark:border-zinc-800">
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <Star className="h-3 w-3 text-amber-500" />
          <span>{profile.reputationScore.toFixed(1)}</span>
          <span className="mx-1">·</span>
          <span>{profile.projectsCompleted} projects</span>
        </div>
        <span className="text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400">
          {t('viewProfile')}
        </span>
      </div>
    </Link>
  );
}
