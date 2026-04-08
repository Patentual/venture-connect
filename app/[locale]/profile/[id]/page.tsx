'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Globe,
  ShieldCheck,
  Star,
  Briefcase,
  GraduationCap,
  Languages,
  ExternalLink,
  MessageCircle,
  UserPlus,
  DollarSign,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';

const MOCK_PROFILE: UserProfile = {
  id: '1',
  email: 'sarah.chen@example.com',
  fullName: 'Sarah Chen',
  headline: 'Full-Stack Engineer · React & Node.js',
  bio: 'I\'m a full-stack engineer with 8 years of experience building scalable web applications. I specialise in React, Next.js, Node.js, and cloud infrastructure on AWS. I\'ve led engineering teams at two startups and contributed to open-source projects with 5k+ GitHub stars.\n\nI\'m passionate about clean architecture, developer experience, and building products that make a real difference. Currently open to project-based work with teams building in healthtech, fintech, or developer tools.',
  profilePhotoUrl: '',
  companyLogoUrl: '',
  country: 'Australia',
  city: 'Sydney',
  timezone: 'Australia/Sydney (UTC+11)',
  company: 'TechCraft Studios',
  companyWebsite: 'https://techcraft.io',
  accountType: 'individual',
  skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker', 'GraphQL', 'Tailwind CSS', 'Figma'],
  industries: ['Technology', 'Healthcare', 'Finance'],
  qualifications: ['B.Sc Computer Science (UNSW)', 'AWS Solutions Architect – Associate'],
  licences: [],
  languages: ['English', 'Mandarin'],
  yearsOfExperience: 8,
  portfolioLinks: ['https://github.com/sarahchen', 'https://dribbble.com/sarahchen', 'https://techcraft.io'],
  availabilityStatus: 'available',
  rateMin: 120,
  rateMax: 180,
  rateCurrency: 'AUD',
  rateUnit: 'hourly',
  rateVisible: true,
  verifications: ['identity'],
  isVerified: true,
  reputationScore: 4.8,
  projectsCompleted: 12,
  endorsementCount: 34,
  responseRate: 95,
  linkedInProfileUrl: 'https://linkedin.com/in/sarahchen',
  subscriptionTier: 'professional',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2026-04-08T00:00:00Z',
  lastActiveAt: '2026-04-08T00:00:00Z',
};

export default function ProfileViewPage() {
  const t = useTranslations('profile');
  const profile = MOCK_PROFILE;

  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const isAvailable = profile.availabilityStatus === 'available';
  const isAvailableSoon = profile.availabilityStatus === 'available_from';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/directory"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </Link>

      {/* Profile header card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-500 sm:h-28 sm:w-28">
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                {initials}
              </div>
            </div>
            <div
              className={cn(
                'absolute bottom-1 right-1 h-5 w-5 rounded-full border-3 border-white dark:border-zinc-900',
                isAvailable ? 'bg-green-500' : isAvailableSoon ? 'bg-amber-500' : 'bg-zinc-300'
              )}
            />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {profile.fullName}
              </h1>
              {profile.isVerified && (
                <ShieldCheck className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{profile.headline}</p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {profile.city}, {profile.country}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {profile.timezone}
              </span>
              {profile.company && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {profile.company}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap gap-4">
              <Stat icon={Star} value={profile.reputationScore.toFixed(1)} label="Rating" />
              <Stat icon={Briefcase} value={String(profile.projectsCompleted)} label="Projects" />
              <Stat icon={UserPlus} value={String(profile.endorsementCount)} label="Endorsements" />
              <Stat icon={MessageCircle} value={`${profile.responseRate}%`} label="Response" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <button className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              Invite to Project
            </button>
            <button className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Send Message
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Card title={t('about')}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {profile.bio}
            </p>
          </Card>

          {/* Skills */}
          <Card title={t('skills')}>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
            {profile.industries.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Industries
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.industries.map((ind) => (
                    <span
                      key={ind}
                      className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Qualifications */}
          {profile.qualifications.length > 0 && (
            <Card title={t('qualifications')}>
              <ul className="space-y-2">
                {profile.qualifications.map((q) => (
                  <li key={q} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    {q}
                  </li>
                ))}
              </ul>
              {profile.licences.length > 0 && (
                <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <ul className="space-y-2">
                    {profile.licences.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* Portfolio */}
          {profile.portfolioLinks.length > 0 && (
            <Card title={t('portfolio')}>
              <div className="space-y-2">
                {profile.portfolioLinks.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-blue-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-blue-400 dark:hover:bg-zinc-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {link}
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability */}
          <Card title={t('availability')}>
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold',
                isAvailable
                  ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                  : isAvailableSoon
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              <Clock className="h-4 w-4" />
              {isAvailable
                ? 'Available Now'
                : isAvailableSoon
                  ? `Available from ${profile.availableFrom}`
                  : 'Not Available'}
            </div>

            {profile.rateVisible && profile.rateMin && profile.rateMax && (
              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <DollarSign className="h-4 w-4" />
                <span>
                  {profile.rateCurrency} {profile.rateMin}–{profile.rateMax} /{' '}
                  {profile.rateUnit === 'hourly' ? 'hr' : profile.rateUnit === 'daily' ? 'day' : 'project'}
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Calendar className="h-4 w-4" />
              <span>{profile.yearsOfExperience} years experience</span>
            </div>
          </Card>

          {/* Languages */}
          <Card title={t('languages')}>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang) => (
                <span
                  key={lang}
                  className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <Languages className="h-3.5 w-3.5 text-zinc-400" />
                  {lang}
                </span>
              ))}
            </div>
          </Card>

          {/* Links */}
          <Card title={t('website')}>
            <div className="space-y-2">
              {profile.companyWebsite && (
                <a
                  href={profile.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {profile.companyWebsite.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile.linkedInProfileUrl && (
                <a
                  href={profile.linkedInProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---- Helpers ---- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      {children}
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-zinc-400" />
      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{value}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}
