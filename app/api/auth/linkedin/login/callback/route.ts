import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findOrCreateOAuthUser } from '@/lib/auth/users';
import { createSession } from '@/lib/auth/session';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
const LINKEDIN_LOGIN_REDIRECT_URI = process.env.LINKEDIN_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/login/callback';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const state = request.nextUrl.searchParams.get('state');

  const origin = request.nextUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/en/auth/login?error=linkedin_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/en/auth/login?error=missing_code`);
  }

  // Validate state
  const cookieStore = await cookies();
  const storedState = cookieStore.get('linkedin_login_state')?.value;
  cookieStore.delete('linkedin_login_state');

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${origin}/en/auth/login?error=invalid_state`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_LOGIN_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      console.error('LinkedIn token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(`${origin}/en/auth/login?error=token_failed`);
    }

    const tokens = await tokenRes.json();

    // Get user info via OpenID userinfo endpoint
    const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${origin}/en/auth/login?error=profile_failed`);
    }

    const profile = await userInfoRes.json();
    const email = profile.email;
    const name = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || email;

    if (!email) {
      return NextResponse.redirect(`${origin}/en/auth/login?error=no_email`);
    }

    // Find or create user
    const user = await findOrCreateOAuthUser({ email, name, provider: 'linkedin' });

    // Create session (OAuth users skip 2FA)
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      twoFactorVerified: true,
    });

    return NextResponse.redirect(`${origin}/en/dashboard`);
  } catch (err) {
    console.error('LinkedIn login callback error:', err);
    return NextResponse.redirect(`${origin}/en/auth/login?error=callback_failed`);
  }
}
