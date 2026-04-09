'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import type { UserProfile } from '@/lib/types';
import { toTypesenseDoc } from '@/lib/shared-utils';

const profilesCol = () => adminDb.collection('profiles');

/** Save (create or update) the current user's profile. */
export async function saveProfile(
  data: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { success: false, error: 'Not authenticated' };
  }

  const now = new Date().toISOString();
  const docRef = profilesCol().doc(session.userId);
  const existing = await docRef.get();

  if (existing.exists) {
    await docRef.update({ ...data, updatedAt: now });
  } else {
    await docRef.set({
      id: session.userId,
      email: session.email,
      ...data,
      // Platform defaults for new profiles
      profilePhotoUrl: data.profilePhotoUrl || '',
      companyLogoUrl: data.companyLogoUrl || '',
      verifications: [],
      isVerified: false,
      reputationScore: 0,
      projectsCompleted: 0,
      endorsementCount: 0,
      responseRate: 0,
      subscriptionTier: 'free',
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    });
  }

  // Sync to Typesense in the background (non-blocking)
  syncProfileToTypesense(session.userId).catch(() => {});

  return { success: true };
}

/** Sync a single profile to Typesense (best-effort). */
async function syncProfileToTypesense(userId: string): Promise<void> {
  const TYPESENSE_CONFIGURED =
    process.env.TYPESENSE_HOST &&
    process.env.TYPESENSE_API_KEY &&
    process.env.TYPESENSE_API_KEY !== 'xyz';

  if (!TYPESENSE_CONFIGURED) return;

  try {
    const typesenseClient = (await import('@/lib/search/typesense')).default;
    const doc = await profilesCol().doc(userId).get();
    if (!doc.exists) return;

    await typesenseClient.collections('profiles').documents().upsert(
      toTypesenseDoc(userId, doc.data()!)
    );
  } catch {
    // Non-critical — search will fall back to Firestore
  }
}

/** Get the current user's profile. */
export async function getMyProfile(): Promise<UserProfile | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;

  const doc = await profilesCol().doc(session.userId).get();
  if (!doc.exists) return null;
  return doc.data() as UserProfile;
}

/** Get a profile by user ID (public view). */
export async function getProfileById(userId: string): Promise<UserProfile | null> {
  const doc = await profilesCol().doc(userId).get();
  if (!doc.exists) return null;
  return doc.data() as UserProfile;
}

/** List all profiles for the directory (paginated). */
export async function listProfiles(opts?: {
  limit?: number;
  startAfter?: string;
}): Promise<{ profiles: UserProfile[]; total: number }> {
  const limit = opts?.limit || 50;

  let query = profilesCol().orderBy('updatedAt', 'desc').limit(limit);
  if (opts?.startAfter) {
    const cursor = await profilesCol().doc(opts.startAfter).get();
    if (cursor.exists) {
      query = query.startAfter(cursor);
    }
  }

  const snapshot = await query.get();
  const profiles = snapshot.docs.map((d) => d.data() as UserProfile);

  // Get approximate total
  const countSnap = await profilesCol().count().get();
  const total = countSnap.data().count;

  return { profiles, total };
}
