'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import type { Project } from '@/lib/types';
import { getInitials, getAvatarColor } from '@/lib/shared-utils';

const projectsCol = () => adminDb.collection('projects');

export interface WorkspaceData {
  project: Project | null;
  teamMembers: TeamMemberData[];
}

export interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  skills: string[];
  joinedAt: string;
  status: 'active' | 'pending';
  initials: string;
  color: string;
}

/** Load full workspace data for a project. */
export async function getWorkspaceData(projectId: string): Promise<WorkspaceData> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { project: null, teamMembers: [] };
  }

  const doc = await projectsCol().doc(projectId).get();
  if (!doc.exists) return { project: null, teamMembers: [] };

  const project = doc.data() as Project;

  // Check access
  if (!project.teamMemberIds.includes(session.userId) && project.creatorId !== session.userId) {
    return { project: null, teamMembers: [] };
  }

  // Resolve team member profiles
  const teamMembers: TeamMemberData[] = [];
  for (let i = 0; i < project.teamMemberIds.length; i++) {
    const memberId = project.teamMemberIds[i];
    const profileDoc = await adminDb.collection('profiles').doc(memberId).get();
    if (profileDoc.exists) {
      const p = profileDoc.data()!;
      teamMembers.push({
        id: memberId,
        name: p.fullName || 'Unknown',
        role: i === 0 ? 'Project Creator' : p.headline || 'Team Member',
        skills: (p.skills || []).slice(0, 4),
        joinedAt: project.createdAt,
        status: 'active',
        initials: getInitials(p.fullName || 'U'),
        color: getAvatarColor(p.fullName || 'U'),
      });
    } else {
      // Fallback for profiles that don't exist yet
      const userDoc = await adminDb.collection('users').where('id', '==', memberId).limit(1).get();
      const name = userDoc.empty ? 'Unknown' : userDoc.docs[0].data().name || 'Unknown';
      teamMembers.push({
        id: memberId,
        name,
        role: i === 0 ? 'Project Creator' : 'Team Member',
        skills: [],
        joinedAt: project.createdAt,
        status: 'active',
        initials: getInitials(name),
        color: getAvatarColor(name),
      });
    }
  }

  // Add pending invites
  for (let i = 0; i < project.pendingInviteIds.length; i++) {
    const invId = project.pendingInviteIds[i];
    const profileDoc = await adminDb.collection('profiles').doc(invId).get();
    const name = profileDoc.exists ? profileDoc.data()!.fullName || 'Pending' : 'Pending';
    teamMembers.push({
      id: invId,
      name,
      role: 'Invited',
      skills: [],
      joinedAt: '',
      status: 'pending',
      initials: getInitials(name),
      color: 'from-zinc-400 to-zinc-500',
    });
  }

  // Data minimization: strip completedAt timestamps from milestones
  // to avoid storing evidence that could be subpoenaed as proof-of-work records.
  if (project.timeline?.phases) {
    for (const phase of project.timeline.phases) {
      for (const ms of phase.milestones || []) {
        delete ms.completedAt;
      }
    }
  }

  return { project, teamMembers };
}
