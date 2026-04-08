import { getLinkedInAuthUrl } from '@/lib/linkedin/oauth';
import { randomUUID } from 'crypto';

export async function GET() {
  if (!process.env.LINKEDIN_CLIENT_ID) {
    return Response.json(
      { error: 'LinkedIn OAuth not configured. Add LINKEDIN_CLIENT_ID to .env.local' },
      { status: 500 }
    );
  }

  const state = randomUUID();
  const authUrl = getLinkedInAuthUrl(state);

  // In production: store state in session/cookie for CSRF validation
  return Response.json({ authUrl, state });
}
