import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const LINKEDIN_LOGIN_REDIRECT_URI = process.env.LINKEDIN_LOGIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/login/callback';

export async function GET() {
  if (!LINKEDIN_CLIENT_ID) {
    return Response.json(
      { error: 'LinkedIn OAuth not configured. Add LINKEDIN_CLIENT_ID to env vars.' },
      { status: 500 }
    );
  }

  const state = randomUUID();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_LOGIN_REDIRECT_URI,
    state,
    scope: 'openid profile email',
  });

  const cookieStore = await cookies();
  cookieStore.set('linkedin_login_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return Response.json({ authUrl: `https://www.linkedin.com/oauth/v2/authorization?${params}` });
}
