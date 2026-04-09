'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import SearchFilters from '@/components/directory/SearchFilters';
import ProfileCard from '@/components/directory/ProfileCard';
import { listProfiles } from '@/app/actions/profile';
import type { UserProfile } from '@/lib/types';

export default function DirectoryPage() {
  const t = useTranslations('directory');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalFound, setTotalFound] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load real profiles from Firestore on mount
  useEffect(() => {
    listProfiles({ limit: 50 })
      .then(({ profiles: p, total }) => {
        setProfiles(p);
        setTotalFound(total);
      })
      .finally(() => setLoading(false));
  }, []);

  const doSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query || '*' }),
      });
      if (res.ok) {
        const data = await res.json();
        setTotalFound(data.found);
        // Map search hits back to UserProfile shape for ProfileCard
        if (data.hits?.length) {
          setProfiles(
            data.hits.map((hit: { document: Record<string, unknown> }) => ({
              ...hit.document,
              email: '',
              bio: '',
              profilePhotoUrl: '',
              companyLogoUrl: '',
              timezone: '',
              company: hit.document.company || '',
              companyWebsite: '',
              qualifications: [],
              licences: [],
              portfolioLinks: [],
              rateUnit: 'hourly',
              rateVisible: true,
              verifications: [],
              projectsCompleted: 0,
              endorsementCount: 0,
              responseRate: 0,
              createdAt: '',
              updatedAt: '',
              lastActiveAt: '',
            }))
          );
        } else {
          setProfiles([]);
        }
      }
    } catch {
      // Keep existing profiles on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t('title')}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t('subtitle')}</p>
      </div>

      {/* Live search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, skill, city, or keyword..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <SearchFilters />

      <div className="mt-6 flex items-center gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('results', { count: totalFound })}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      {profiles.length === 0 && !loading && (
        <div className="py-16 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No professionals found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
