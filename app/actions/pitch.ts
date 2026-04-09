'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';

export interface PitchSession {
  id: string;
  projectId: string;
  projectTitle: string;
  scheduledAt: string; // ISO date
  durationMinutes: number;
  investorEmails: string[];
  confirmedCount: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
  createdAt: string;
}

/** List pitch sessions for a project. */
export async function listPitchSessions(projectId: string): Promise<PitchSession[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  const snapshot = await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('pitchSessions')
    .orderBy('scheduledAt', 'asc')
    .limit(20)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      projectId,
      projectTitle: data.projectTitle || '',
      scheduledAt: data.scheduledAt || '',
      durationMinutes: data.durationMinutes || 30,
      investorEmails: data.investorEmails || [],
      confirmedCount: data.confirmedCount || 0,
      status: data.status || 'scheduled',
      meetingLink: data.meetingLink,
      createdAt: data.createdAt || '',
    };
  });
}

/** Schedule a new pitch session. */
export async function schedulePitch(
  projectId: string,
  data: {
    scheduledAt: string;
    durationMinutes: number;
    investorEmails: string[];
  }
): Promise<PitchSession | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;

  const projectDoc = await adminDb.collection('projects').doc(projectId).get();
  if (!projectDoc.exists) return null;
  const projectTitle = projectDoc.data()?.title || 'Untitled';

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const pitchData = {
    projectTitle,
    scheduledAt: data.scheduledAt,
    durationMinutes: data.durationMinutes,
    investorEmails: data.investorEmails,
    confirmedCount: 0,
    status: 'scheduled' as const,
    createdAt: now,
    createdBy: session.userId,
  };

  await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('pitchSessions')
    .doc(id)
    .set(pitchData);

  return {
    id,
    projectId,
    ...pitchData,
  };
}

/** Cancel a pitch session. */
export async function cancelPitch(projectId: string, pitchId: string): Promise<boolean> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return false;

  await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('pitchSessions')
    .doc(pitchId)
    .update({ status: 'cancelled' });

  return true;
}
