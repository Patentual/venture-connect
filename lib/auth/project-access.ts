import { adminDb } from '@/lib/firebase/admin';

/**
 * Check if a user is a member (or creator) of a project.
 * Returns the project data if access is granted, null otherwise.
 */
export async function checkProjectAccess(
  projectId: string,
  userId: string
): Promise<FirebaseFirestore.DocumentData | null> {
  const doc = await adminDb.collection('projects').doc(projectId).get();
  if (!doc.exists) return null;

  const project = doc.data()!;
  const memberIds: string[] = project.teamMemberIds || [];
  if (memberIds.includes(userId) || project.creatorId === userId) {
    return project;
  }
  return null;
}
