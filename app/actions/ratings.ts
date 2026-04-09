'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import { checkProjectAccess } from '@/lib/auth/project-access';

export interface MemberRatingSummary {
  memberId: string;
  avgRating: number;
  totalRatings: number;
  myRating: number | null;
}

/** Get rating summaries for all team members of a project. */
export async function getRatings(projectId: string, memberIds: string[]): Promise<MemberRatingSummary[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  if (!await checkProjectAccess(projectId, session.userId)) return [];

  const summaries: MemberRatingSummary[] = [];

  for (const memberId of memberIds) {
    const ratingsSnap = await adminDb
      .collection('projects')
      .doc(projectId)
      .collection('ratings')
      .where('ratedUserId', '==', memberId)
      .get();

    let total = 0;
    let count = 0;
    let myRating: number | null = null;

    for (const doc of ratingsSnap.docs) {
      const data = doc.data();
      total += data.rating;
      count++;
      if (data.raterId === session.userId) {
        myRating = data.rating;
      }
    }

    summaries.push({
      memberId,
      avgRating: count > 0 ? total / count : 0,
      totalRatings: count,
      myRating,
    });
  }

  return summaries;
}

/** Submit a rating for a team member. */
export async function submitRating(
  projectId: string,
  ratedUserId: string,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { success: false, error: 'Not authenticated' };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Rating must be 1-5' };
  }

  if (!await checkProjectAccess(projectId, session.userId)) {
    return { success: false, error: 'Not a project member' };
  }

  // Use a composite doc ID to enforce one rating per rater per member per project
  const docId = `${session.userId}_${ratedUserId}`;

  await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('ratings')
    .doc(docId)
    .set({
      raterId: session.userId,
      ratedUserId,
      rating,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

  // Update the rated user's reputation score (average across all project ratings)
  try {
    const allRatingsSnap = await adminDb
      .collectionGroup('ratings')
      .where('ratedUserId', '==', ratedUserId)
      .get();

    let totalAll = 0;
    let countAll = 0;
    for (const doc of allRatingsSnap.docs) {
      totalAll += doc.data().rating;
      countAll++;
    }

    if (countAll > 0) {
      const avgReputation = Math.round((totalAll / countAll) * 20); // Scale 1-5 to 0-100
      await adminDb.collection('profiles').doc(ratedUserId).update({
        reputationScore: avgReputation,
      });
    }
  } catch {
    // Non-critical — skip if profile doesn't exist
  }

  return { success: true };
}
