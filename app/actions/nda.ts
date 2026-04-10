'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import type { ProjectInvitation } from '@/lib/types';

const invitationsCol = () => adminDb.collection('projectInvitations');

export interface InvitationWithSender extends ProjectInvitation {
  senderName: string;
}

/** Get a single invitation by ID. */
export async function getInvitation(invitationId: string): Promise<InvitationWithSender | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;

  const doc = await invitationsCol().doc(invitationId).get();
  if (!doc.exists) return null;

  const data = doc.data() as ProjectInvitation & { senderName?: string };
  if (data.recipientId !== session.userId) return null;

  let senderName = data.senderName || 'Unknown';
  if (!data.senderName && data.senderId) {
    const senderDoc = await adminDb.collection('profiles').doc(data.senderId).get();
    if (senderDoc.exists) {
      senderName = senderDoc.data()?.fullName || 'Unknown';
    }
  }

  return { ...data, senderName };
}

/** Sign (accept) an NDA invitation. */
export async function signInvitation(
  invitationId: string,
  signatureData: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { success: false, error: 'Not authenticated' };
  }

  const ref = invitationsCol().doc(invitationId);
  const doc = await ref.get();
  if (!doc.exists) return { success: false, error: 'Invitation not found' };

  const data = doc.data() as ProjectInvitation;
  if (data.recipientId !== session.userId) return { success: false, error: 'Not authorized' };
  if (data.status !== 'pending' && data.status !== 'nda_sent') {
    return { success: false, error: 'Invitation already responded to' };
  }

  const now = new Date().toISOString();
  await ref.update({
    status: 'nda_signed',
    respondedAt: now,
  });

  // Also create/update the NDA record
  if (data.ndaId) {
    await adminDb.collection('ndas').doc(data.ndaId).update({
      status: 'signed',
      signedAt: now,
      signatureData,
    });
  }

  // Add user to project team if not already
  const projectRef = adminDb.collection('projects').doc(data.projectId);
  const projectDoc = await projectRef.get();
  if (projectDoc.exists) {
    const members: string[] = projectDoc.data()?.teamMemberIds || [];
    if (!members.includes(session.userId)) {
      await projectRef.update({
        teamMemberIds: [...members, session.userId],
      });
    }
  }

  return { success: true };
}

/** Decline an NDA invitation. */
export async function declineInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { success: false, error: 'Not authenticated' };
  }

  const ref = invitationsCol().doc(invitationId);
  const doc = await ref.get();
  if (!doc.exists) return { success: false, error: 'Invitation not found' };

  const data = doc.data() as ProjectInvitation;
  if (data.recipientId !== session.userId) return { success: false, error: 'Not authorized' };

  await ref.update({
    status: 'declined',
    respondedAt: new Date().toISOString(),
  });

  return { success: true };
}

/** List all project invitations for the current user. */
export async function listMyInvitations(): Promise<InvitationWithSender[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  try {
    const snapshot = await invitationsCol()
      .where('recipientId', '==', session.userId)
      .orderBy('sentAt', 'desc')
      .limit(100)
      .get();

    const invitations: InvitationWithSender[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data() as ProjectInvitation & { senderName?: string };
      // Try to resolve sender name
      let senderName = data.senderName || 'Unknown';
      if (!data.senderName && data.senderId) {
        const senderDoc = await adminDb.collection('profiles').doc(data.senderId).get();
        if (senderDoc.exists) {
          senderName = senderDoc.data()?.fullName || 'Unknown';
        }
      }
      invitations.push({ ...data, senderName });
    }

    return invitations;
  } catch (err) {
    console.error('listMyInvitations error:', err);
    return [];
  }
}
