import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return Response.json(
      { error: 'Google OAuth not configured. Add GOOGLE_CLIENT_ID to env vars.' },
      { status: 500 }
    );
  }

  const state = randomUUID();

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  });

  const cookieStore = await cookies();
  cookieStore.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return Response.json({ authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
}
