'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Lock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { verifyProjectAccessCode } from '@/app/actions/calendar';

interface ProjectAccessGateProps {
  isLeader: boolean;
  projectId: string;
  projectName: string;
  onAccessGranted: () => void;
}

export default function ProjectAccessGate({
  isLeader,
  projectId,
  projectName,
  onAccessGranted,
}: ProjectAccessGateProps) {
  const t = useTranslations('projects.accessGate');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [granted, setGranted] = useState(false);

  // Project leader gets automatic access
  useEffect(() => {
    if (isLeader) {
      setGranted(true);
      setTimeout(onAccessGranted, 400);
    }
  }, [isLeader, onAccessGranted]);

  const handleVerify = async () => {
    setVerifying(true);
    setError(false);
    try {
      const valid = await verifyProjectAccessCode(projectId, inputCode);
      if (valid) {
        setGranted(true);
        setTimeout(onAccessGranted, 600);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setVerifying(false);
    }
  };

  if (granted) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
            <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="mt-4 text-lg font-semibold text-green-700 dark:text-green-400">
            {t('accessGranted')}
          </p>
        </div>
      </div>
    );
  }

  // Leader sees the granted state immediately; non-leaders see the code entry form
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('title')}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {projectName}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            {t('enterCode')}
          </p>

          <input
            type="text"
            value={inputCode}
            onChange={(e) => { setInputCode(e.target.value.toUpperCase()); setError(false); }}
            placeholder="XXXX-XXXX"
            maxLength={9}
            className={`w-full rounded-xl border px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.2em] text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-white ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-zinc-700'
            }`}
          />
          {error && (
            <p className="mt-1.5 text-xs text-red-500">{t('invalidCode')}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={inputCode.replace(/[\s-]/g, '').length < 8 || verifying}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {t('verify')}
          </button>
        </div>
      </div>
    </div>
  );
}
