'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Lock,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Loader2,
  KeyRound,
} from 'lucide-react';

interface ProjectAccessGateProps {
  isLeader: boolean;
  projectName: string;
  onAccessGranted: () => void;
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function ProjectAccessGate({
  isLeader,
  projectName,
  onAccessGranted,
}: ProjectAccessGateProps) {
  const t = useTranslations('projects.accessGate');
  const [accessCode] = useState(generateAccessCode);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [granted, setGranted] = useState(false);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [accessCode]);

  const handleVerify = async () => {
    setVerifying(true);
    // Simulate server verification
    await new Promise((r) => setTimeout(r, 800));
    if (inputCode.replace(/[\s-]/g, '').toUpperCase() === accessCode.replace('-', '')) {
      setGranted(true);
      setTimeout(onAccessGranted, 600);
    } else {
      setError(true);
    }
    setVerifying(false);
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
          {isLeader && (
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t('leaderCode')}
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
                <KeyRound className="h-4 w-4 text-amber-500" />
                <code className="flex-1 text-center text-xl font-bold tracking-[0.2em] text-zinc-900 dark:text-white">
                  {accessCode}
                </code>
                <button
                  onClick={copyCode}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                {t('shareInstruction')}
              </p>
              <hr className="my-4 border-zinc-200 dark:border-zinc-700" />
            </div>
          )}

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
