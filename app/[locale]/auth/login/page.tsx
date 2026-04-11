'use client';

import { useActionState, useRef, useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Globe, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import HexLogo from '@/components/ui/HexLogo';
import { login, verifyTwoFactor, type AuthState } from '@/app/actions/auth';

function generateCaptcha() {
  const ops = ['+', '-', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      answer = a * b;
      break;
  }
  return { question: `${a} ${op} ${b}`, answer };
}

export default function LoginPage() {
  const t = useTranslations('auth');
  const [loginState, loginAction, loginPending] = useActionState(login, undefined);
  const [tfaState, tfaAction, tfaPending] = useActionState(verifyTwoFactor, undefined);
  const [twoFactorEmail, setTwoFactorEmail] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError(false);
  }, []);

  const handleLoginSubmit = (formData: FormData) => {
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      setCaptchaError(true);
      refreshCaptcha();
      return;
    }
    setCaptchaError(false);
    loginAction(formData);
  };

  // If login succeeded and requires 2FA, show 2FA form
  const needs2FA = loginState?.requiresTwoFactor || twoFactorEmail;
  const email = twoFactorEmail || loginState?.email;

  // After loginState tells us 2FA is needed, remember the email
  if (loginState?.requiresTwoFactor && loginState.email && !twoFactorEmail) {
    setTwoFactorEmail(loginState.email);
  }

  const combinedError = (needs2FA ? tfaState?.error : loginState?.error);

  if (needs2FA && email) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {t('twoFactorTitle')}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {t('twoFactorVerifyDesc')}
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {combinedError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {combinedError}
              </div>
            )}

            <form action={tfaAction} className="space-y-4">
              <input type="hidden" name="email" value={email} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t('twoFactorCode')}
                </label>
                <input
                  ref={codeRef}
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

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <HexLogo className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('signIn')}
          </h1>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Social login */}
          <div className="space-y-3">
            <button
              onClick={async () => {
                const res = await fetch('/api/auth/google');
                const data = await res.json();
                if (data.authUrl) window.location.href = data.authUrl;
                else alert(data.error || 'Google login not configured');
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <Globe className="h-5 w-5" />
              {t('google')}
            </button>
            <button
              onClick={async () => {
                const res = await fetch('/api/auth/linkedin/login');
                const data = await res.json();
                if (data.authUrl) window.location.href = data.authUrl;
                else alert(data.error || 'LinkedIn login not configured');
              }}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
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

          {combinedError && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {combinedError}
            </div>
          )}

          {/* Email login */}
          <form action={handleLoginSubmit} className="space-y-4">
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
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t('password')}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            {/* CAPTCHA */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('captchaLabel')}
              </label>
              <div className="flex items-center gap-3">
                <div className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 px-5">
                  <span className="select-none text-lg font-bold tracking-widest text-white" style={{ fontFamily: 'monospace', letterSpacing: '0.15em', textShadow: '0 0 8px rgba(99,102,241,0.6)' }}>
                    {captcha.question} = ?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                  title="New challenge"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={captchaInput}
                onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(false); }}
                required
                placeholder={t('captchaPlaceholder')}
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-zinc-50 ${
                  captchaError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 dark:border-zinc-700'
                }`}
              />
              {captchaError && (
                <p className="mt-1 text-xs text-red-500">{t('captchaWrong')}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loginPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {loginPending ? t('signingIn') : t('signIn')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t('noAccount')}{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {t('signUpLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
