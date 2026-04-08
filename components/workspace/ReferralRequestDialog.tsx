'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

interface ReferralRequestDialogProps {
  open: boolean;
  onClose: () => void;
  suggestedSkills?: string[];
}

export default function ReferralRequestDialog({
  open,
  onClose,
  suggestedSkills = [],
}: ReferralRequestDialogProps) {
  const t = useTranslations('dashboard.referralRequest');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [skills, setSkills] = useState(suggestedSkills.join(', '));

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate posting the referral request — in production, save to Firestore
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
            Referral Request Posted!
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Your request has been posted globally. Other users will be able to refer professionals from their network who match your criteria.
          </p>
          <button
            onClick={onClose}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t('title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI suggestion banner */}
        <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-400">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t('aiSuggestion')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <FileText className="h-3.5 w-3.5" />
              {t('description')}
            </label>
            <textarea
              required
              rows={3}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="We need a senior Rust developer with experience in WASM and real-time systems..."
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              {t('skills')}
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="Rust, WebAssembly, Systems Architecture"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <MapPin className="h-3.5 w-3.5" />
                {t('location')}
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                placeholder="Remote / Sydney, AU"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Calendar className="h-3.5 w-3.5" />
                {t('availability')}
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                placeholder="Full-time, starting May"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <DollarSign className="h-3.5 w-3.5" />
              {t('budget')}
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="$100-150/hr or $15,000-20,000 fixed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            {t('post')}
          </button>
        </form>
      </div>
    </div>
  );
}
