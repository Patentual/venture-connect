'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Languages,
  DollarSign,
  ShieldCheck,
  UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SKILL_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'AWS', 'Docker',
  'Figma', 'UI/UX Design', 'Product Management', 'Data Science', 'Machine Learning',
  'Structural Engineering', 'Civil Engineering', 'Architecture', 'Project Management',
  'Patent Law', 'Corporate Law', 'Financial Analysis', 'Marketing Strategy',
  'Cybersecurity', 'DevOps', 'Blockchain', 'IoT', 'Embedded Systems',
];

const INDUSTRY_OPTIONS = [
  'Technology', 'Construction', 'Healthcare', 'Finance', 'Legal',
  'Manufacturing', 'Education', 'Energy', 'Retail', 'Real Estate',
  'Biotech', 'Aerospace', 'Agriculture', 'Media', 'Consulting',
];

const COUNTRY_OPTIONS = [
  'Australia', 'United States', 'United Kingdom', 'Canada', 'Germany',
  'France', 'Japan', 'Singapore', 'India', 'Brazil',
  'Netherlands', 'South Korea', 'New Zealand', 'Ireland', 'Sweden',
];

interface FilterState {
  query: string;
  skills: string[];
  industries: string[];
  country: string;
  city: string;
  availableOnly: boolean;
  minExperience: number;
  maxExperience: number;
  hideRecruiters: boolean;
  verifiedOnly: boolean;
  languages: string[];
}

const DEFAULT_FILTERS: FilterState = {
  query: '',
  skills: [],
  industries: [],
  country: '',
  city: '',
  availableOnly: false,
  minExperience: 0,
  maxExperience: 30,
  hideRecruiters: true,
  verifiedOnly: false,
  languages: [],
};

export default function SearchFilters({
  onFilterChange,
}: {
  onFilterChange?: (filters: FilterState) => void;
}) {
  const t = useTranslations('directory');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleArrayItem = (key: 'skills' | 'industries' | 'languages', item: string) => {
    const arr = filters[key];
    const newArr = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
    updateFilter(key, newArr);
  };

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    onFilterChange?.(DEFAULT_FILTERS);
  };

  const activeFilterCount =
    filters.skills.length +
    filters.industries.length +
    (filters.country ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.availableOnly ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.hideRecruiters ? 0 : 1) +
    filters.languages.length;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
            showFilters
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300'
              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('filters.title')}
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-900',
          showFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 border-0 opacity-0'
        )}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t('filters.title')}
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {t('filters.clearAll')}
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Skills */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <Briefcase className="h-3.5 w-3.5" />
                {t('filters.skills')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.slice(0, 12).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleArrayItem('skills', skill)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                      filters.skills.includes(skill)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <Briefcase className="h-3.5 w-3.5" />
                {t('filters.industry')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRY_OPTIONS.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => toggleArrayItem('industries', industry)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                      filters.industries.includes(industry)
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    )}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3.5 w-3.5" />
                {t('filters.country')}
              </label>
              <select
                value={filters.country}
                onChange={(e) => updateFilter('country', e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">{t('filters.country')}</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                placeholder={t('filters.city')}
                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <GraduationCap className="h-3.5 w-3.5" />
                {t('filters.experience')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={filters.minExperience}
                  onChange={(e) => updateFilter('minExperience', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {filters.minExperience}–{filters.maxExperience} yrs
                </span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {t('filters.accountType')}
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => updateFilter('availableOnly', e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600"
                />
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">{t('filters.availability')}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.hideRecruiters}
                  onChange={(e) => updateFilter('hideRecruiters', e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600"
                />
                <UserX className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">{t('filters.hideRecruiters')}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600"
                />
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-700 dark:text-zinc-300">{t('filters.verifiedOnly')}</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t('filters.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
