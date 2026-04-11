'use client';
import { useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface Props {
  variant: 'project_create' | 'project_join';
  onAccept: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const BULLETS_CREATE = [
  'VentureNex is a collaboration platform only. It does not process, facilitate, or guarantee payments between users.',
  'As project leader, you are solely responsible for all compensation arrangements and legal compliance.',
  'Payment terms must be agreed directly between you and team members, outside of VentureNex.',
  'VentureNex bears no liability for disputes, non-payment, or claims between users.',
  'You must comply with all applicable employment, labour, tax, and contractor laws.',
];
const BULLETS_JOIN = [
  'VentureNex is a collaboration platform only. It does not process, facilitate, or guarantee payments between users.',
  'Compensation arrangements are solely between you and the project leader.',
  'VentureNex does not verify, enforce, or guarantee any payment terms or schedules.',
  'VentureNex bears no liability for disputes, non-payment, or claims between users.',
  'You are strongly encouraged to formalise compensation terms in writing outside VentureNex.',
];

export default function LiabilityDisclaimer({ variant, onAccept, onCancel, loading }: Props) {
  const [accepted, setAccepted] = useState(false);
  const isCreate = variant === 'project_create';
  const title = isCreate ? 'Project Leader Acknowledgment' : 'Team Member Acknowledgment';
  const bullets = isCreate ? BULLETS_CREATE : BULLETS_JOIN;
  const checkLabel = isCreate
    ? 'I acknowledge that all compensation arrangements are my sole responsibility as project leader.'
    : 'I acknowledge that all compensation arrangements are solely between me and the project leader.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
        </div>
        <ul className="mt-4 space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {b}
            </li>
          ))}
        </ul>
        <a href="/legal/terms" target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
          Read full Terms of Service <ExternalLink className="h-3 w-3" />
        </a>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 rounded border-zinc-300 text-blue-600" />
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{checkLabel}</span>
        </label>
        <div className="mt-5 flex gap-3">
          <button onClick={onAccept} disabled={!accepted || loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40">
            {loading ? 'Processing...' : (isCreate ? 'I Acknowledge & Continue' : 'I Acknowledge & Join')}
          </button>
          <button onClick={onCancel}
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
