'use server';

import { cookies } from 'next/headers';

/**
 * Read LinkedIn profile data from the httpOnly cookie set by the OAuth callback.
 * Clears the cookie after reading (one-time use).
 */
export async function getLinkedInImportData(): Promise<{
  fullName?: string;
  email?: string;
  profilePhotoUrl?: string;
  linkedInProfileUrl?: string;
} | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('linkedin_profile_data')?.value;
  if (!raw) return null;

  // Clear immediately after reading
  cookieStore.delete('linkedin_profile_data');

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
