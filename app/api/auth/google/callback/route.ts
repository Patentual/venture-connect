import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findOrCreateOAuthUser } from '@/lib/auth/users';
import { createSession } from '@/lib/auth/session';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const state = request.nextUrl.searchParams.get('state');

  const origin = request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/en/auth/login?error=google_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/en/auth/login?error=missing_code`);
  }

  // Validate state
  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;
  cookieStore.delete('google_oauth_state');

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${origin}/en/auth/login?error=invalid_state`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${origin}/en/auth/login?error=token_failed`);
    }

    const tokens = await tokenRes.json();

    // Get user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${origin}/en/auth/login?error=profile_failed`);
    }

    const profile = await userInfoRes.json();
    const email = profile.email;
    const name = profile.name || profile.given_name || email;

    if (!email) {
      return NextResponse.redirect(`${origin}/en/auth/login?error=no_email`);
    }

    // Find or create user
    const user = await findOrCreateOAuthUser({ email, name, provider: 'google' });

    // Create session (OAuth users skip 2FA)
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      twoFactorVerified: true,
    });

    return NextResponse.redirect(`${origin}/en/dashboard`);
  } catch (err) {
    console.error('Google callback error:', err);
    return NextResponse.redirect(`${origin}/en/auth/login?error=callback_failed`);
  }
}
