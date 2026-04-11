'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';

/** Load compensation terms for a project. */
export async function loadCompensationTerms(projectId: string): Promise<string | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;

  const doc = await adminDb.collection('projects').doc(projectId).get();
  if (!doc.exists) return null;

  const project = doc.data()!;

  // Check access: must be team member or creator
  if (!project.teamMemberIds?.includes(session.userId) && project.creatorId !== session.userId) {
    return null;
  }

  return project.compensationTerms || '';
}

/** Save compensation terms — only the project leader can do this. */
export async function saveCompensationTerms(projectId: string, content: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { error: 'Not authenticated' };
  }

  const doc = await adminDb.collection('projects').doc(projectId).get();
  if (!doc.exists) return { error: 'Project not found' };

  const project = doc.data()!;

  // Only the project creator can edit compensation terms
  if (project.creatorId !== session.userId) {
    return { error: 'Only the project leader can edit compensation terms' };
  }

  await adminDb.collection('projects').doc(projectId).update({
    compensationTerms: content,
    updatedAt: new Date().toISOString(),
  });

  return {};
}
