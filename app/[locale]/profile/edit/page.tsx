'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  User,
  Briefcase,
  Wrench,
  Clock,
  MapPin,
  Link2,
  Download,
  Save,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import TagInput from '@/components/ui/TagInput';
import AvatarUpload from '@/components/ui/AvatarUpload';
import type { AccountType, AvailabilityStatus } from '@/lib/types';

const SKILL_SUGGESTIONS = [
  'React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'AWS', 'Docker',
  'Figma', 'UI/UX Design', 'Product Management', 'Data Science', 'Machine Learning',
  'Structural Engineering', 'Civil Engineering', 'Architecture', 'Project Management',
  'Patent Law', 'Corporate Law', 'Financial Analysis', 'Marketing Strategy',
  'Cybersecurity', 'DevOps', 'Blockchain', 'IoT', 'Embedded Systems',
  'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'Flutter', 'Swift',
  'Kotlin', 'Java', 'C++', 'Rust', 'Go', 'Ruby', 'PHP', 'Solidity',
];

const INDUSTRY_OPTIONS = [
  'Technology', 'Construction', 'Healthcare', 'Finance', 'Legal',
  'Manufacturing', 'Education', 'Energy', 'Retail', 'Real Estate',
  'Biotech', 'Aerospace', 'Agriculture', 'Media', 'Consulting',
];

const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Chinese (Mandarin)',
  'Chinese (Cantonese)', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian',
  'Italian', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish',
  'Turkish', 'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Tagalog',
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'CNY', 'INR', 'BRL'];

interface FormState {
  fullName: string;
  headline: string;
  bio: string;
  email: string;
  company: string;
  companyWebsite: string;
  accountType: AccountType;
  skills: string[];
  industries: string[];
  qualifications: string[];
  licences: string[];
  languages: string[];
  yearsOfExperience: number;
  country: string;
  city: string;
  timezone: string;
  availabilityStatus: AvailabilityStatus;
  availableFrom: string;
  availableDuration: string;
  rateMin: string;
  rateMax: string;
  rateCurrency: string;
  rateUnit: 'hourly' | 'daily' | 'project';
  rateVisible: boolean;
  portfolioLinks: string[];
}

const DEFAULT_FORM: FormState = {
  fullName: '',
  headline: '',
  bio: '',
  email: '',
  company: '',
  companyWebsite: '',
  accountType: 'individual',
  skills: [],
  industries: [],
  qualifications: [],
  licences: [],
  languages: [],
  yearsOfExperience: 0,
  country: '',
  city: '',
  timezone: '',
  availabilityStatus: 'available',
  availableFrom: '',
  availableDuration: '',
  rateMin: '',
  rateMax: '',
  rateCurrency: 'USD',
  rateUnit: 'hourly',
  rateVisible: true,
  portfolioLinks: [],
};

const SECTIONS = [
  { key: 'basicInfo', icon: User },
  { key: 'professional', icon: Briefcase },
  { key: 'skillsExpertise', icon: Wrench },
  { key: 'availability', icon: Clock },
  { key: 'location', icon: MapPin },
  { key: 'portfolio', icon: Link2 },
  { key: 'import', icon: Download },
] as const;

export default function ProfileEditPage() {
  const t = useTranslations('profile');
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [activeSection, setActiveSection] = useState<string>('basicInfo');
  const [newLink, setNewLink] = useState('');
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addPortfolioLink = () => {
    if (newLink.trim() && !form.portfolioLinks.includes(newLink.trim())) {
      update('portfolioLinks', [...form.portfolioLinks, newLink.trim()]);
      setNewLink('');
    }
  };

  const removePortfolioLink = (link: string) => {
    update('portfolioLinks', form.portfolioLinks.filter((l) => l !== link));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to Firestore
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  const completeness = (() => {
    let filled = 0;
    let total = 8;
    if (form.fullName) filled++;
    if (form.headline) filled++;
    if (form.bio) filled++;
    if (form.skills.length > 0) filled++;
    if (form.industries.length > 0) filled++;
    if (form.country) filled++;
    if (form.languages.length > 0) filled++;
    if (form.yearsOfExperience > 0) filled++;
    return Math.round((filled / total) * 100);
  })();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('createTitle')}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t('createSubtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Eye className="h-4 w-4" />
            {t('preview')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      {/* Completeness bar */}
      <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {t('completeness')}
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">{completeness}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          {t('completenessHint')}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <nav className="hidden w-56 shrink-0 md:block">
          <ul className="sticky top-24 space-y-1">
            {SECTIONS.map(({ key, icon: Icon }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection(key);
                    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    activeSection === key
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(`sections.${key}`)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Form sections */}
        <div className="min-w-0 flex-1 space-y-8">
          {/* Basic Information */}
          <Section id="basicInfo" title={t('sections.basicInfo')} icon={User}>
            <div className="mb-6">
              <AvatarUpload
                fallbackInitials={form.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                onFileSelect={() => {}}
                uploadLabel={t('fields.uploadPhoto')}
                changeLabel={t('fields.changePhoto')}
                removeLabel={t('fields.removePhoto')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('fields.fullName')} required>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  placeholder={t('fields.fullNamePlaceholder')}
                  className="input-field"
                />
              </Field>
              <Field label={t('fields.email')}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="input-field"
                />
              </Field>
            </div>

            <Field label={t('fields.headline')} required className="mt-4">
              <input
                type="text"
                value={form.headline}
                onChange={(e) => update('headline', e.target.value)}
                placeholder={t('fields.headlinePlaceholder')}
                className="input-field"
              />
            </Field>

            <Field label={t('fields.bio')} className="mt-4">
              <textarea
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                placeholder={t('fields.bioPlaceholder')}
                rows={4}
                className="input-field resize-none"
              />
            </Field>
          </Section>

          {/* Professional Details */}
          <Section id="professional" title={t('sections.professional')} icon={Briefcase}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('fields.company')}>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  placeholder={t('fields.companyPlaceholder')}
                  className="input-field"
                />
              </Field>
              <Field label={t('fields.companyWebsite')}>
                <input
                  type="url"
                  value={form.companyWebsite}
                  onChange={(e) => update('companyWebsite', e.target.value)}
                  placeholder={t('fields.companyWebsitePlaceholder')}
                  className="input-field"
                />
              </Field>
            </div>

            <Field label={t('fields.accountType')} className="mt-4">
              <div className="flex gap-3">
                {(['individual', 'company', 'recruiter'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update('accountType', type)}
                    className={cn(
                      'rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                      form.accountType === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    )}
                  >
                    {t(`fields.accountType${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t('fields.yearsOfExperience')} className="mt-4">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={form.yearsOfExperience}
                  onChange={(e) => update('yearsOfExperience', Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {form.yearsOfExperience} yrs
                </span>
              </div>
            </Field>

            <Field label={t('fields.qualifications')} className="mt-4">
              <TagInput
                value={form.qualifications}
                onChange={(v) => update('qualifications', v)}
                placeholder={t('fields.qualificationsPlaceholder')}
              />
            </Field>

            <Field label={t('fields.licences')} className="mt-4">
              <TagInput
                value={form.licences}
                onChange={(v) => update('licences', v)}
                placeholder={t('fields.licencesPlaceholder')}
              />
            </Field>
          </Section>

          {/* Skills & Expertise */}
          <Section id="skillsExpertise" title={t('sections.skillsExpertise')} icon={Wrench}>
            <Field label={t('fields.skills')} required>
              <TagInput
                value={form.skills}
                onChange={(v) => update('skills', v)}
                placeholder={t('fields.skillsPlaceholder')}
                suggestions={SKILL_SUGGESTIONS}
              />
            </Field>

            <Field label={t('fields.industries')} className="mt-4">
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_OPTIONS.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => {
                      const arr = form.industries.includes(industry)
                        ? form.industries.filter((i) => i !== industry)
                        : [...form.industries, industry];
                      update('industries', arr);
                    }}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      form.industries.includes(industry)
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    )}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t('fields.languages')} className="mt-4">
              <TagInput
                value={form.languages}
                onChange={(v) => update('languages', v)}
                placeholder={t('fields.languagesPlaceholder')}
                suggestions={LANGUAGE_OPTIONS}
              />
            </Field>
          </Section>

          {/* Availability & Rates */}
          <Section id="availability" title={t('sections.availability')} icon={Clock}>
            <Field label={t('fields.availabilityStatus')}>
              <div className="flex gap-3">
                {(['available', 'available_from', 'unavailable'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => update('availabilityStatus', status)}
                    className={cn(
                      'rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                      form.availabilityStatus === status
                        ? status === 'available'
                          ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-950 dark:text-green-300'
                          : status === 'available_from'
                            ? 'border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-300'
                            : 'border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    )}
                  >
                    {status === 'available'
                      ? t('fields.availableNow')
                      : status === 'available_from'
                        ? t('fields.availableFrom')
                        : t('fields.unavailable')}
                  </button>
                ))}
              </div>
            </Field>

            {form.availabilityStatus === 'available_from' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label={t('fields.availableFromDate')}>
                  <input
                    type="date"
                    value={form.availableFrom}
                    onChange={(e) => update('availableFrom', e.target.value)}
                    className="input-field"
                  />
                </Field>
                <Field label={t('fields.availableDuration')}>
                  <input
                    type="text"
                    value={form.availableDuration}
                    onChange={(e) => update('availableDuration', e.target.value)}
                    placeholder={t('fields.availableDurationPlaceholder')}
                    className="input-field"
                  />
                </Field>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <Field label={t('fields.rateRange')}>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      {t('fields.rateMin')}
                    </label>
                    <input
                      type="number"
                      value={form.rateMin}
                      onChange={(e) => update('rateMin', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      {t('fields.rateMax')}
                    </label>
                    <input
                      type="number"
                      value={form.rateMax}
                      onChange={(e) => update('rateMax', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      {t('fields.rateCurrency')}
                    </label>
                    <select
                      value={form.rateCurrency}
                      onChange={(e) => update('rateCurrency', e.target.value)}
                      className="input-field"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      {t('fields.rateUnit')}
                    </label>
                    <select
                      value={form.rateUnit}
                      onChange={(e) => update('rateUnit', e.target.value as FormState['rateUnit'])}
                      className="input-field"
                    >
                      <option value="hourly">{t('fields.rateUnitHourly')}</option>
                      <option value="daily">{t('fields.rateUnitDaily')}</option>
                      <option value="project">{t('fields.rateUnitProject')}</option>
                    </select>
                  </div>
                </div>
              </Field>

              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.rateVisible}
                  onChange={(e) => update('rateVisible', e.target.checked)}
                  className="rounded border-zinc-300 text-blue-600"
                />
                <span className="text-zinc-700 dark:text-zinc-300">{t('fields.rateVisible')}</span>
              </label>
            </div>
          </Section>

          {/* Location */}
          <Section id="location" title={t('sections.location')} icon={MapPin}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('fields.country')} required>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => update('country', e.target.value)}
                  placeholder={t('fields.countryPlaceholder')}
                  className="input-field"
                />
              </Field>
              <Field label={t('fields.city')}>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  placeholder={t('fields.cityPlaceholder')}
                  className="input-field"
                />
              </Field>
            </div>
            <Field label={t('fields.timezone')} className="mt-4">
              <input
                type="text"
                value={form.timezone}
                onChange={(e) => update('timezone', e.target.value)}
                placeholder={t('fields.timezonePlaceholder')}
                className="input-field"
              />
            </Field>
          </Section>

          {/* Portfolio & Links */}
          <Section id="portfolio" title={t('sections.portfolio')} icon={Link2}>
            <Field label={t('fields.portfolioLinks')}>
              <div className="space-y-2">
                {form.portfolioLinks.map((link) => (
                  <div
                    key={link}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                      {link}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePortfolioLink(link)}
                      className="text-xs text-zinc-400 hover:text-red-500"
                    >
                      {t('removeItem')}
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
                    placeholder={t('fields.portfolioLinksPlaceholder')}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={addPortfolioLink}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {t('fields.addLink')}
                  </button>
                </div>
              </div>
            </Field>
          </Section>

          {/* Import Profile Data */}
          <Section id="import" title={t('sections.import')} icon={Download}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {t('import.linkedin')}
                    </h4>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {t('import.linkedinDescription')}
                    </p>
                    <button
                      type="button"
                      className="mt-3 rounded-lg bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      {t('import.linkedin')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                    <span className="text-lg font-bold text-violet-600 dark:text-violet-400">i</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {t('import.itinervate')}
                    </h4>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {t('import.itinervateDescription')}
                    </p>
                    <button
                      type="button"
                      className="mt-3 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      {t('import.itinervate')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Bottom actions */}
          <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <button
              type="button"
              className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Helpers ---- */

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`section-${id}`}
      className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        <Icon className="h-5 w-5 text-blue-500" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
