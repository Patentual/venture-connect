'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { listMyInvitations, type InvitationWithSender } from '@/app/actions/nda';


const STATUS_CONFIG = {
  pending: { icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', label: 'pending' },
  interested: { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950', label: 'interested' },
  declined: { icon: XCircle, color: 'text-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800', label: 'declined' },
  nda_sent: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950', label: 'nda_sent' },
  nda_signed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', label: 'nda_signed' },
  approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', label: 'approved' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', label: 'rejected' },
};

type FilterStatus = 'all' | 'pending' | 'nda_sent' | 'nda_signed' | 'declined';

export default function NDAInboxPage() {
  const t = useTranslations('nda');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [invitations, setInvitations] = useState<InvitationWithSender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyInvitations()
      .then(setInvitations)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? invitations
    : invitations.filter((inv) => inv.status === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {t('inboxTitle')}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t('inboxSubtitle')}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {(['all', 'pending', 'nda_sent', 'nda_signed', 'declined'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              filter === f
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            )}
          >
            {f === 'all' ? 'All' : t(`invitation.${f}`)}
            {f !== 'all' && (
              <span className="ml-1.5 text-xs opacity-60">
                {invitations.filter((inv) => inv.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Invitation list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <Shield className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {t('noInvitations')}
            </p>
          </div>
        ) : (
          filtered.map((inv) => {
            const statusCfg = STATUS_CONFIG[inv.status];
            const StatusIcon = statusCfg.icon;

            return (
              <Link
                key={inv.id}
                href={`/nda/${inv.id}`}
                className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                {/* Status icon */}
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', statusCfg.bg)}>
                  <StatusIcon className={cn('h-5 w-5', statusCfg.color)} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {inv.projectTitle}
                    </h3>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      statusCfg.bg,
                      statusCfg.color
                    )}>
                      {t(`invitation.${inv.status}`)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t('roleOffered', { role: inv.role })} · From {inv.senderName}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {inv.outreachMessage}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {inv.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('sentAt', { date: new Date(inv.sentAt).toLocaleDateString() })}
                    </span>
                  </div>
                </div>

                <ChevronRight className="mt-2 h-5 w-5 shrink-0 text-zinc-300 transition-colors group-hover:text-blue-500 dark:text-zinc-600" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
