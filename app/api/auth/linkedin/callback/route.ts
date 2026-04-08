import { NextRequest } from 'next/server';
import { exchangeCodeForToken, getLinkedInProfile, mapLinkedInToUserProfile } from '@/lib/linkedin/oauth';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    // LinkedIn denied access
    const redirectUrl = new URL('/en/profile/edit', request.nextUrl.origin);
    redirectUrl.searchParams.set('linkedin_error', error);
    return Response.redirect(redirectUrl.toString());
  }

  if (!code) {
    return Response.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Fetch LinkedIn profile data
    const linkedInProfile = await getLinkedInProfile(tokenData.access_token);

    // Map to our UserProfile fields
    const profileData = mapLinkedInToUserProfile(linkedInProfile);

    // Redirect to profile edit page with imported data in query params
    // In production: store in session/database instead
    const redirectUrl = new URL('/en/profile/edit', request.nextUrl.origin);
    redirectUrl.searchParams.set('linkedin_import', 'success');
    redirectUrl.searchParams.set('linkedin_data', encodeURIComponent(JSON.stringify(profileData)));

    return Response.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('LinkedIn callback error:', err);
    const redirectUrl = new URL('/en/profile/edit', request.nextUrl.origin);
    redirectUrl.searchParams.set('linkedin_error', 'callback_failed');
    return Response.redirect(redirectUrl.toString());
  }
}
