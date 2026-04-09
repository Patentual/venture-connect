'use server';

import { createSession, deleteSession, getSession } from '@/lib/auth/session';
import { createUser, authenticateUser, getUserByEmail, enableTOTP } from '@/lib/auth/users';
import { generateTOTPSecret, verifyTOTPToken } from '@/lib/auth/totp';
import { redirect } from 'next/navigation';

export type AuthState = {
  error?: string;
  success?: boolean;
  requiresTwoFactor?: boolean;
  totpUri?: string;
  totpSecret?: string;
  email?: string;
} | undefined;

// ── Register ──────────────────────────────────────────────────────────

export async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const result = await createUser({ email, name, password });

  if ('error' in result) {
    return { error: result.error };
  }

  // Generate TOTP secret for 2FA setup
  const { secret, uri } = generateTOTPSecret(email);

  // Store secret temporarily — will be confirmed after user scans QR & verifies
  await enableTOTP(email, secret);

  return {
    success: true,
    requiresTwoFactor: true,
    totpUri: uri,
    totpSecret: secret,
    email,
  };
}

// ── Confirm 2FA setup (after scanning QR) ─────────────────────────────

export async function confirmTwoFactorSetup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const token = formData.get('token') as string;

  if (!email || !token) {
    return { error: 'Verification code is required' };
  }

  const user = await getUserByEmail(email);
  if (!user || !user.totpSecret) {
    return { error: 'User not found or 2FA not set up' };
  }

  const valid = verifyTOTPToken(user.totpSecret, token);
  if (!valid) {
    return { error: 'Invalid verification code. Try again.' };
  }

  // 2FA confirmed — create session and redirect to dashboard
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    twoFactorVerified: true,
  });

  redirect('/dashboard');
}

// ── Login ─────────────────────────────────────────────────────────────

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return { error: 'Invalid email or password' };
  }

  if (user.totpEnabled) {
    // Create a temporary session (not yet 2FA verified)
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      twoFactorVerified: false,
    });

    return {
      success: true,
      requiresTwoFactor: true,
      email: user.email,
    };
  }

  // No 2FA — create full session
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    twoFactorVerified: true,
  });

  redirect('/dashboard');
}

// ── Verify 2FA on login ───────────────────────────────────────────────

export async function verifyTwoFactor(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const token = formData.get('token') as string;

  if (!email || !token) {
    return { error: 'Verification code is required' };
  }

  const user = await getUserByEmail(email);
  if (!user || !user.totpSecret) {
    return { error: 'User not found' };
  }

  const valid = verifyTOTPToken(user.totpSecret, token);
  if (!valid) {
    return { error: 'Invalid code. Check your authenticator app and try again.' };
  }

  // Upgrade session to 2FA verified
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    twoFactorVerified: true,
  });

  redirect('/dashboard');
}

// ── Logout ────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/');
}

// ── Get current user (for client) ────────────────────────────────────

export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
  name: string;
  authenticated: boolean;
} | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    authenticated: true,
  };
}
