'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';

export interface DashboardStats {
  activeProjects: number;
  teamMembers: number;
  pendingNdas: number;
  avgRating: string; // formatted string e.g. "4.8" or "—"
}

/** Compute live dashboard stats for the current user. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { activeProjects: 0, teamMembers: 0, pendingNdas: 0, avgRating: '—' };
  }

  const userId = session.userId;

  // Count projects where user is a team member
  const projectsSnap = await adminDb
    .collection('projects')
    .where('teamMemberIds', 'array-contains', userId)
    .get();

  const activeProjects = projectsSnap.docs.filter(
    (d) => ['planning', 'recruiting', 'active'].includes(d.data().status)
  ).length;

  // Collect unique team member IDs across all projects
  const memberSet = new Set<string>();
  projectsSnap.docs.forEach((d) => {
    const members: string[] = d.data().teamMemberIds || [];
    members.forEach((m) => { if (m !== userId) memberSet.add(m); });
  });

  // Count pending NDAs
  const ndasSnap = await adminDb
    .collection('ndaInvitations')
    .where('recipientId', '==', userId)
    .where('status', '==', 'pending')
    .get();

  // Get profile for rating
  const profileDoc = await adminDb.collection('profiles').doc(userId).get();
  const avgRating = profileDoc.exists && profileDoc.data()?.reputationScore
    ? profileDoc.data()!.reputationScore.toFixed(1)
    : '—';

  return {
    activeProjects,
    teamMembers: memberSet.size,
    pendingNdas: ndasSnap.size,
    avgRating,
  };
}
