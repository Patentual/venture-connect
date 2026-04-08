'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import SearchFilters from '@/components/directory/SearchFilters';
import ProfileCard from '@/components/directory/ProfileCard';
import type { UserProfile } from '@/lib/types';

const MOCK_PROFILES: UserProfile[] = [
  {
    id: '1',
    email: 'sarah.chen@example.com',
    fullName: 'Sarah Chen',
    headline: 'Full-Stack Engineer · React & Node.js',
    bio: 'Building scalable web applications for 8 years.',
    profilePhotoUrl: '',
    companyLogoUrl: '',
    country: 'Australia',
    city: 'Sydney',
    timezone: 'Australia/Sydney',
    company: 'TechCraft Studios',
    companyWebsite: 'https://techcraft.io',
    accountType: 'individual',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'],
    industries: ['Technology'],
    qualifications: ['B.Sc Computer Science'],
    licences: [],
    languages: ['English', 'Mandarin'],
    yearsOfExperience: 8,
    portfolioLinks: [],
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
    subscriptionTier: 'professional',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2026-04-08T00:00:00Z',
    lastActiveAt: '2026-04-08T00:00:00Z',
  },
  {
    id: '2',
    email: 'james.muller@example.com',
    fullName: 'James Müller',
    headline: 'Structural Engineer · PE Licensed',
    bio: 'Designing structures that stand the test of time.',
    profilePhotoUrl: '',
    companyLogoUrl: '',
    country: 'Germany',
    city: 'Munich',
    timezone: 'Europe/Berlin',
    company: 'Müller Engineering GmbH',
    companyWebsite: '',
    accountType: 'individual',
    skills: ['Structural Engineering', 'AutoCAD', 'Revit', 'Project Management'],
    industries: ['Construction', 'Architecture'],
    qualifications: ['M.Eng Structural Engineering', 'PE Licence'],
    licences: ['Professional Engineer'],
    languages: ['English', 'German'],
    yearsOfExperience: 15,
    portfolioLinks: [],
    availabilityStatus: 'available_from',
    availableFrom: '2026-05-01',
    availableDuration: '6 months',
    rateVisible: false,
    verifications: ['identity', 'qualification'],
    isVerified: true,
    reputationScore: 4.9,
    projectsCompleted: 23,
    endorsementCount: 56,
    responseRate: 88,
    subscriptionTier: 'professional',
    createdAt: '2023-06-10T00:00:00Z',
    updatedAt: '2026-04-07T00:00:00Z',
    lastActiveAt: '2026-04-07T00:00:00Z',
  },
  {
    id: '3',
    email: 'priya.sharma@example.com',
    fullName: 'Priya Sharma',
    headline: 'Data Scientist · ML & AI Specialist',
    bio: 'Turning data into insights and products.',
    profilePhotoUrl: '',
    companyLogoUrl: '',
    country: 'India',
    city: 'Bangalore',
    timezone: 'Asia/Kolkata',
    company: '',
    companyWebsite: '',
    accountType: 'individual',
    skills: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow', 'SQL'],
    industries: ['Technology', 'Healthcare'],
    qualifications: ['PhD Computer Science', 'AWS ML Specialty'],
    licences: [],
    languages: ['English', 'Hindi', 'Kannada'],
    yearsOfExperience: 6,
    portfolioLinks: [],
    availabilityStatus: 'available',
    rateMin: 80,
    rateMax: 120,
    rateCurrency: 'USD',
    rateUnit: 'hourly',
    rateVisible: true,
    verifications: ['identity'],
    isVerified: true,
    reputationScore: 4.7,
    projectsCompleted: 8,
    endorsementCount: 19,
    responseRate: 92,
    subscriptionTier: 'free',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2026-04-08T00:00:00Z',
    lastActiveAt: '2026-04-08T00:00:00Z',
  },
  {
    id: '4',
    email: 'mike.oconnor@example.com',
    fullName: 'Mike O\'Connor',
    headline: 'Patent Attorney · IP Strategy',
    bio: 'Helping innovators protect their intellectual property.',
    profilePhotoUrl: '',
    companyLogoUrl: '',
    country: 'United States',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    company: 'O\'Connor IP Law',
    companyWebsite: 'https://oconnorip.com',
    accountType: 'company',
    skills: ['Patent Law', 'IP Strategy', 'Patent Prosecution', 'Freedom to Operate'],
    industries: ['Legal', 'Technology', 'Biotech'],
    qualifications: ['JD', 'Patent Bar'],
    licences: ['State Bar - California'],
    languages: ['English'],
    yearsOfExperience: 12,
    portfolioLinks: [],
    availabilityStatus: 'unavailable',
    rateVisible: false,
    verifications: ['identity', 'company'],
    isVerified: true,
    reputationScore: 4.6,
    projectsCompleted: 31,
    endorsementCount: 45,
    responseRate: 78,
    subscriptionTier: 'creator',
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2026-04-06T00:00:00Z',
    lastActiveAt: '2026-04-06T00:00:00Z',
  },
  {
    id: '5',
    email: 'aiko.tanaka@example.com',
    fullName: 'Aiko Tanaka',
    headline: 'UX/UI Designer · Design Systems',
    bio: 'Crafting beautiful, accessible user experiences.',
    profilePhotoUrl: '',
    companyLogoUrl: '',
    country: 'Japan',
    city: 'Tokyo',
    timezone: 'Asia/Tokyo',
    company: '',
    companyWebsite: '',
    accountType: 'individual',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research'],
    industries: ['Technology', 'Media'],
    qualifications: ['B.Des Visual Communication'],
    licences: [],
    languages: ['English', 'Japanese'],
    yearsOfExperience: 7,
    portfolioLinks: ['https://dribbble.com/aiko'],
    availabilityStatus: 'available',
    rateMin: 90,
    rateMax: 140,
    rateCurrency: 'USD',
    rateUnit: 'hourly',
    rateVisible: true,
    verifications: ['identity'],
    isVerified: true,
    reputationScore: 4.9,
    projectsCompleted: 15,
    endorsementCount: 42,
    responseRate: 97,
    subscriptionTier: 'professional',
    createdAt: '2024-02-14T00:00:00Z',
    updatedAt: '2026-04-08T00:00:00Z',
    lastActiveAt: '2026-04-08T00:00:00Z',
  },
  {
    id: '6',
    email: 'carlos.silva@example.com',
    fullName: 'Carlos Silva',
    headline: 'Civil Engineer · Infrastructure Projects',
    bio: 'Building infrastructure across South America.',
    profilePhotoUrl: '',
    companyLogoUrl: '',
    country: 'Brazil',
    city: 'São Paulo',
    timezone: 'America/Sao_Paulo',
    company: 'Silva Engenharia',
    companyWebsite: '',
    accountType: 'company',
    skills: ['Civil Engineering', 'Project Management', 'AutoCAD', 'BIM'],
    industries: ['Construction', 'Energy'],
    qualifications: ['M.Eng Civil Engineering', 'PMP'],
    licences: ['CREA Registration'],
    languages: ['English', 'Portuguese', 'Spanish'],
    yearsOfExperience: 18,
    portfolioLinks: [],
    availabilityStatus: 'available_from',
    availableFrom: '2026-06-15',
    availableDuration: '12 months',
    rateVisible: false,
    verifications: ['identity', 'qualification', 'company'],
    isVerified: true,
    reputationScore: 4.8,
    projectsCompleted: 27,
    endorsementCount: 38,
    responseRate: 85,
    subscriptionTier: 'creator',
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2026-04-05T00:00:00Z',
    lastActiveAt: '2026-04-05T00:00:00Z',
  },
];

export default function DirectoryPage() {
  const t = useTranslations('directory');
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalFound, setTotalFound] = useState(MOCK_PROFILES.length);
  const [loading, setLoading] = useState(false);

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
