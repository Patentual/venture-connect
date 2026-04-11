'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, CheckCircle2, ArrowUpRight, Loader2, Sparkles, Crown, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getMyProfile } from '@/app/actions/profile';
import { cn } from '@/lib/utils';

const PLAN_DETAILS: Record<string, { name: string; price: string; color: string; borderColor: string }> = {
  free: { name: 'Free', price: '$0/month', color: 'text-slate-600', borderColor: 'border-slate-200 dark:border-slate-700' },
  professional: { name: 'Professional', price: '$19/month', color: 'text-blue-600', borderColor: 'border-blue-200 dark:border-blue-800' },
  creator: { name: 'Creator', price: '$39/month', color: 'text-indigo-600', borderColor: 'border-indigo-200 dark:border-indigo-800' },
  enterprise: { name: 'Enterprise', price: 'Custom', color: 'text-violet-600', borderColor: 'border-violet-200 dark:border-violet-800' },
  talentSourcing: { name: 'Talent Sourcing', price: '$499/month', color: 'text-amber-600', borderColor: 'border-amber-200 dark:border-amber-800' },
};

export default function BillingPage() {
  const t = useTranslations('dashboard');
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const showSuccess = searchParams.get('success') === 'true';
  const showCancelled = searchParams.get('cancelled') === 'true';

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) router.push(data.url);
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    getMyProfile().then((profile) => {
      setTier(profile?.subscriptionTier || 'free');
    }).finally(() => setLoading(false));
  }, []);

  const plan = PLAN_DETAILS[tier || 'free'] || PLAN_DETAILS.free;
  const isFree = tier === 'free';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
        <CreditCard className="h-5 w-5 text-indigo-500" />
        {t('nav.billing')}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t('billingSub')}
      </p>

      {showSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Subscription activated! Your plan has been upgraded.
        </div>
      )}
      {showCancelled && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Checkout was cancelled. No changes were made.
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Current plan */}
          <div className={cn(
            'mt-6 rounded-2xl border bg-white/50 p-6 dark:bg-slate-900/50',
            plan.borderColor
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Plan
                </p>
                <p className={cn('mt-1 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white')}>
                  {plan.name}
                  {!isFree && (
                    <Crown className={cn('h-4 w-4', plan.color)} />
                  )}
                </p>
              </div>
              <div className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                isFree
                  ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400'
              )}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isFree ? 'Free Tier' : 'Active'}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {plan.price}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                {isFree ? 'Upgrade plan' : 'View all plans'} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              {!isFree && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {portalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Settings className="h-3.5 w-3.5" />}
                  Manage Subscription
                </button>
              )}
            </div>
          </div>

          {/* Upgrade CTA for free users */}
          {isFree && (
            <div className="mt-6 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 p-6 text-center dark:border-indigo-800 dark:bg-indigo-950/20">
              <Sparkles className="mx-auto h-8 w-8 text-indigo-500" />
              <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                Unlock more features
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Upgrade to Creator or Professional for AI pitch decks, investor data rooms, priority search placement, and more.
              </p>
              <Link
                href="/pricing"
                className="animated-gradient mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20"
              >
                <Sparkles className="h-4 w-4" />
                View pricing
              </Link>
            </div>
          )}

          {/* Billing info note */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Payment method</h3>
            {isFree ? (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                No payment method on file. Add one when you upgrade.
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Managed through Stripe. Click &quot;Manage Subscription&quot; above to update payment details, change plans, or cancel.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
