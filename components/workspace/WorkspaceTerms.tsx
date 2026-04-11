'use client';

import { useTranslations } from 'next-intl';
import { Banknote, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';

interface WorkspaceTermsProps {
  projectId: string;
  isLeader: boolean;
}

const STEPS = [
  ['Agree on payment terms externally', 'Use a written contract outside VentureNex.'],
  ['Use external payment platforms', 'PayPal, Wise, bank transfer — never through VentureNex.'],
  ['Clarify tax & legal obligations', 'Each party handles their own compliance.'],
  ['Document scope of work', 'Define deliverables and timelines in your external agreement.'],
  ['Establish dispute resolution', 'Include this in your contract. VentureNex does not arbitrate.'],
];

export default function WorkspaceTerms({ projectId, isLeader }: WorkspaceTermsProps) {
  const t = useTranslations('projects');

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          <p className="font-semibold">Important: Payment & Compensation Disclaimer</p>
          <p className="mt-1 leading-relaxed">
            VentureNex is a collaboration platform only. It does <strong>not</strong> process, facilitate, mediate, or guarantee payments between users. All compensation arrangements are solely between the project leader and team members.
          </p>
          <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-medium underline hover:no-underline">
            Read Terms of Service (Sections 8 & 9) <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <Banknote className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Compensation Guidance</h3>
        </div>
        <div className="p-5">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Formalise compensation arrangements <strong>outside this platform</strong>:
          </p>
          <ul className="mt-4 space-y-3">
            {STEPS.map(([title, desc], i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          VentureNex does not store compensation arrangements, payment transactions, or work completion records. The platform bears no liability for compensation disputes. See our <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
