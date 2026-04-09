import { getLinkedInAuthUrl } from '@/lib/linkedin/oauth';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

export async function GET() {
  if (!process.env.LINKEDIN_CLIENT_ID) {
    return Response.json(
      { error: 'LinkedIn OAuth not configured. Add LINKEDIN_CLIENT_ID to .env.local' },
      { status: 500 }
    );
  }

  const state = randomUUID();
  const authUrl = getLinkedInAuthUrl(state);

  // Store state in httpOnly cookie for CSRF validation in callback
  const cookieStore = await cookies();
  cookieStore.set('linkedin_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  return Response.json({ authUrl });
}
