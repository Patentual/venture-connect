'use client';

import { useActionState, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Globe, ShieldCheck, Loader2, Copy, Check, CreditCard, AlertCircle } from 'lucide-react';
import { register, confirmTwoFactorSetup, type AuthState } from '@/app/actions/auth';
import QRCode from 'qrcode';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [regState, regAction, regPending] = useActionState(register, undefined);
  const [tfaState, tfaAction, tfaPending] = useActionState(confirmTwoFactorSetup, undefined);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate QR code when TOTP URI is available
  useEffect(() => {
    if (regState?.totpUri) {
      QRCode.toDataURL(regState.totpUri, { width: 256, margin: 2 })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [regState?.totpUri]);

  const copySecret = () => {
    if (regState?.totpSecret) {
      navigator.clipboard.writeText(regState.totpSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── 2FA Setup Step ──────────────────────────────────────────────────
  if (regState?.requiresTwoFactor && regState.email) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {t('twoFactorSetup')}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {t('twoFactorSetupDesc')}
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* QR Code */}
            {qrDataUrl && (
              <div className="mb-4 flex justify-center">
                <div className="rounded-xl bg-white p-3">
                  <img src={qrDataUrl} alt="TOTP QR Code" width={200} height={200} />
                </div>
              </div>
            )}

            {/* Manual secret */}
            {regState.totpSecret && (
              <div className="mb-4">
                <p className="mb-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {t('cantScanQR')}
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                  <code className="flex-1 text-xs font-mono text-zinc-700 dark:text-zinc-300 break-all">
                    {regState.totpSecret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="shrink-0 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {tfaState?.error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {tfaState.error}
              </div>
            )}

            {/* Verify code */}
            <form action={tfaAction} className="space-y-4">
              <input type="hidden" name="email" value={regState.email} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t('twoFactorCode')}
                </label>
                <input
                  name="token"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="000000"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-zinc-900 placeholder:text-zinc-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <button
                type="submit"
                disabled={tfaPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {tfaPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {tfaPending ? t('verifying') : t('verifyCode')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ───────────────────────────────────────────────
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
            <span className="text-xl font-bold text-white">V</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('signUp')}
          </h1>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Social login */}
          <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
              <Globe className="h-5 w-5" />
              {t('google')}
            </button>
            <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {t('linkedin')}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          {regState?.error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {regState.error}
            </div>
          )}

          {/* Email registration */}
          <form action={regAction} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('fullName')}
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('email')}
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('password')}
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('confirmPassword')}
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            {/* Age verification via credit card */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <CreditCard className="h-4 w-4" />
                {t('ageVerification')}
              </div>
              <p className="mb-3 text-xs text-amber-600/80 dark:text-amber-500">
                {t('ageVerificationDesc')}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {t('cardNumber')}
                  </label>
                  <input
                    name="cardNumber"
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {t('cardExpiry')}
                    </label>
                    <input
                      name="cardExpiry"
                      type="text"
                      required
                      placeholder="MM / YY"
                      maxLength={7}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {t('cardCvc')}
                    </label>
                    <input
                      name="cardCvc"
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="CVC"
                      maxLength={4}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-100/50 px-3 py-2 dark:bg-amber-900/20">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {t('cardNotCharged')}
                </p>
              </div>
            </div>

            {/* Age confirmation */}
            <label className="flex items-start gap-2.5">
              <input
                name="ageConfirm"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {t('ageConfirmLabel')}
              </span>
            </label>

            <button
              type="submit"
              disabled={regPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {regPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {regPending ? t('registering') : t('signUp')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t('haveAccount')}{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {t('signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
