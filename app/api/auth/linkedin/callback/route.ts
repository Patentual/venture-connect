import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getLinkedInProfile, mapLinkedInToUserProfile } from '@/lib/linkedin/oauth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const state = request.nextUrl.searchParams.get('state');

  if (error) {
    const redirectUrl = new URL('/en/profile/edit', request.nextUrl.origin);
    redirectUrl.searchParams.set('linkedin_error', error);
    return Response.redirect(redirectUrl.toString());
  }

  if (!code) {
    return Response.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  // Validate OAuth state against stored cookie to prevent CSRF
  const cookieStore = await cookies();
  const storedState = cookieStore.get('linkedin_oauth_state')?.value;
  cookieStore.delete('linkedin_oauth_state');

  if (!state || !storedState || state !== storedState) {
    const redirectUrl = new URL('/en/profile/edit', request.nextUrl.origin);
    redirectUrl.searchParams.set('linkedin_error', 'invalid_state');
    return Response.redirect(redirectUrl.toString());
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Fetch LinkedIn profile data
    const linkedInProfile = await getLinkedInProfile(tokenData.access_token);

    // Map to our UserProfile fields
    const profileData = mapLinkedInToUserProfile(linkedInProfile);

    // Store profile data in an httpOnly cookie (not URL params)
    const redirectUrl = new URL('/en/profile/edit', request.nextUrl.origin);
    redirectUrl.searchParams.set('linkedin_import', 'success');

    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.set('linkedin_profile_data', JSON.stringify(profileData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // 5 minutes — just long enough to read on the profile edit page
    });

    return response;
  } catch (err) {
    console.error('LinkedIn callback error:', err);
    const redirectUrl = new URL('/en/profile/edit', request.nextUrl.origin);
    redirectUrl.searchParams.set('linkedin_error', 'callback_failed');
    return Response.redirect(redirectUrl.toString());
  }
}
