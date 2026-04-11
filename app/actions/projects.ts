'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import type { Project, ProjectStatus, ProjectInvitation } from '@/lib/types';

const projectsCol = () => adminDb.collection('projects');
const invitationsCol = () => adminDb.collection('projectInvitations');

export interface ProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
  memberCount: number;
  endDate?: string;
  createdAt: string;
}

/** Create a new project from an approved AI plan. */
export async function createProject(data: {
  title: string;
  synopsis: string;
  description: string;
  industry: string;
  requiredSkills: string[];
  estimatedDuration: string;
  estimatedBudget?: number;
  budgetCurrency?: string;
  timeline: Project['timeline'];
}): Promise<{ id: string } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { error: 'Not authenticated' };
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const project: Project = {
    id,
    creatorId: session.userId,
    title: data.title,
    synopsis: data.synopsis,
    description: data.description,
    status: 'planning',
    isPublic: false,
    timeline: data.timeline,
    teamMemberIds: [session.userId],
    pendingInviteIds: [],
    maxTeamSize: 10,
    isRemote: true,
    industry: data.industry,
    requiredSkills: data.requiredSkills,
    estimatedDuration: data.estimatedDuration,
    estimatedBudget: data.estimatedBudget,
    budgetCurrency: data.budgetCurrency,
    createdAt: now,
    updatedAt: now,
  };

  await projectsCol().doc(id).set(project);
  return { id };
}

/** List the current user's projects. */
export async function listMyProjects(): Promise<ProjectSummary[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  try {
    const snapshot = await projectsCol()
      .where('teamMemberIds', 'array-contains', session.userId)
      .get();

    const projects = snapshot.docs.map((doc) => {
      const d = doc.data() as Project;
      return {
        id: d.id,
        title: d.title,
        status: d.status,
        memberCount: d.teamMemberIds.length,
        endDate: d.endDate,
        createdAt: d.createdAt,
      };
    });
    // Sort in-memory to avoid composite index requirement
    projects.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return projects.slice(0, 50);
  } catch (err) {
    console.error('listMyProjects error:', err);
    return [];
  }
}

/** Save edited pitch deck slides. The VentureNex closing slide is enforced and cannot be removed. */
export async function updatePitchDeckSlides(
  projectId: string,
  slides: { title: string; type: string; bullets: string[]; speakerNotes: string; imageUrl?: string; imagePrompt?: string }[],
): Promise<{ ok: true } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { error: 'Not authenticated' };

  const doc = await projectsCol().doc(projectId).get();
  if (!doc.exists) return { error: 'Project not found' };
  const project = doc.data() as Project;
  if (!project.teamMemberIds.includes(session.userId) && project.creatorId !== session.userId) {
    return { error: 'Not a project member' };
  }

  // Only the project leader (creator) can edit the pitch deck
  if (project.creatorId !== session.userId) {
    return { error: 'Only the project leader can edit the pitch deck' };
  }

  // Enforce VentureNex closing slide — strip any user-submitted VN slide and re-append
  const vnSlide = {
    title: 'Built with VentureNex',
    type: 'venturenex',
    bullets: [
      'AI-powered project planning & team building',
      'Investor-ready pitch decks generated in seconds',
      'Secure data rooms with NDA-protected access',
      'Learn more at venturenex.com',
    ],
    speakerNotes: 'This project was planned, assembled, and pitched using the VentureNex platform — the AI-powered business directory for launching ventures globally.',
  };
  const cleanSlides = slides.filter((s) => s.type !== 'venturenex');
  cleanSlides.push(vnSlide);

  await projectsCol().doc(projectId).update({
    'pitchDeck.slides': cleanSlides,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}

/** Update pitch deck branding (logo, company name, accent colour, tagline). */
export async function updatePitchBranding(
  projectId: string,
  branding: { logoUrl?: string; companyName?: string; accentColor?: string; tagline?: string },
): Promise<{ ok: true } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { error: 'Not authenticated' };

  const doc = await projectsCol().doc(projectId).get();
  if (!doc.exists) return { error: 'Project not found' };
  const project = doc.data() as Project;
  if (!project.teamMemberIds.includes(session.userId) && project.creatorId !== session.userId) {
    return { error: 'Not a project member' };
  }

  // Only the project leader (creator) can edit branding
  if (project.creatorId !== session.userId) {
    return { error: 'Only the project leader can edit branding' };
  }

  await projectsCol().doc(projectId).update({
    pitchBranding: branding,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}

/** Send outreach invitations to matching professionals for a project. */
export async function sendOutreach(
  projectId: string,
  requiredSkills: string[],
): Promise<{ sent: number } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { error: 'Not authenticated' };

  const projectDoc = await projectsCol().doc(projectId).get();
  if (!projectDoc.exists) return { error: 'Project not found' };
  const project = projectDoc.data() as Project;

  if (project.creatorId !== session.userId) {
    return { error: 'Only the project creator can send outreach' };
  }

  // Search profiles matching any of the required skills
  const profilesSnap = await adminDb.collection('profiles').limit(200).get();
  const skillsLower = requiredSkills.map((s) => s.toLowerCase());

  const candidates = profilesSnap.docs.filter((doc) => {
    const p = doc.data();
    if (doc.id === session.userId) return false; // skip self
    if (project.teamMemberIds.includes(doc.id)) return false; // skip existing members
    const profileSkills: string[] = (p.skills || []).map((s: string) => s.toLowerCase());
    return skillsLower.some((s) => profileSkills.includes(s));
  });

  // Check for already-sent invitations to avoid duplicates
  const existingSnap = await invitationsCol()
    .where('projectId', '==', projectId)
    .where('senderId', '==', session.userId)
    .get();
  const alreadyInvited = new Set(existingSnap.docs.map((d) => d.data().recipientId));

  const now = new Date().toISOString();
  let sent = 0;
  const batch = adminDb.batch();

  for (const doc of candidates) {
    if (alreadyInvited.has(doc.id)) continue;
    const profile = doc.data();
    const invId = crypto.randomUUID();
    const invitation: ProjectInvitation = {
      id: invId,
      projectId,
      projectTitle: project.title,
      projectSynopsis: project.synopsis || project.description || '',
      senderId: session.userId,
      recipientId: doc.id,
      role: 'Team Member',
      requiredSkills: requiredSkills.filter((s) =>
        (profile.skills || []).map((sk: string) => sk.toLowerCase()).includes(s.toLowerCase())
      ),
      status: 'pending',
      outreachMessage: `You've been identified as a strong match for the project "${project.title}" based on your skills. We'd love to discuss this opportunity with you.`,
      sentAt: now,
    };
    batch.set(invitationsCol().doc(invId), invitation);
    sent++;
    if (sent >= 20) break; // cap at 20 outreach per batch
  }

  if (sent > 0) {
    await batch.commit();
    // Update project with pending invite IDs
    const newPendingIds = candidates
      .filter((d) => !alreadyInvited.has(d.id))
      .slice(0, 20)
      .map((d) => d.id);
    await projectsCol().doc(projectId).update({
      pendingInviteIds: [...project.pendingInviteIds, ...newPendingIds],
      updatedAt: now,
    });
  }

  return { sent };
}

/** Search users for invite (by name, fuzzy prefix match on profiles). */
export async function searchUsersForInvite(
  projectId: string,
  query: string
): Promise<{ id: string; name: string; email: string; headline: string; initials: string }[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];
  if (!query || query.length < 2) return [];

  const projectDoc = await projectsCol().doc(projectId).get();
  if (!projectDoc.exists) return [];
  const project = projectDoc.data() as Project;

  // Only project members can invite
  if (!project.teamMemberIds.includes(session.userId) && project.creatorId !== session.userId) return [];

  const excludeIds = new Set([...project.teamMemberIds, ...project.pendingInviteIds]);

  // Search profiles by fullName prefix (case-insensitive via range query)
  const q = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
  const snap = await adminDb.collection('profiles')
    .where('fullName', '>=', q)
    .where('fullName', '<=', q + '\uf8ff')
    .limit(20)
    .get();

  return snap.docs
    .filter((d) => !excludeIds.has(d.id))
    .slice(0, 10)
    .map((d) => {
      const p = d.data();
      const name = p.fullName || 'Unknown';
      return {
        id: d.id,
        name,
        email: p.email || '',
        headline: p.headline || '',
        initials: name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
      };
    });
}

/** Invite a specific user to a project. */
export async function inviteUserToProject(
  projectId: string,
  recipientId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { success: false, error: 'Not authenticated' };

  const projectDoc = await projectsCol().doc(projectId).get();
  if (!projectDoc.exists) return { success: false, error: 'Project not found' };
  const project = projectDoc.data() as Project;

  if (!project.teamMemberIds.includes(session.userId) && project.creatorId !== session.userId) {
    return { success: false, error: 'Not authorized' };
  }

  if (project.teamMemberIds.includes(recipientId)) {
    return { success: false, error: 'User is already a team member' };
  }
  if (project.pendingInviteIds.includes(recipientId)) {
    return { success: false, error: 'User already has a pending invite' };
  }

  const now = new Date().toISOString();
  const invId = crypto.randomUUID();
  const invitation: ProjectInvitation = {
    id: invId,
    projectId,
    projectTitle: project.title,
    projectSynopsis: project.synopsis || project.description || '',
    senderId: session.userId,
    recipientId,
    role: 'Team Member',
    requiredSkills: [],
    status: 'pending',
    outreachMessage: `You've been invited to join the project "${project.title}".`,
    sentAt: now,
  };

  await invitationsCol().doc(invId).set(invitation);
  await projectsCol().doc(projectId).update({
    pendingInviteIds: [...project.pendingInviteIds, recipientId],
    updatedAt: now,
  });

  return { success: true };
}

/** Update a milestone's status (e.g. mark complete). */
export async function updateMilestoneStatus(
  projectId: string,
  milestoneId: string,
  newStatus: 'pending' | 'in_progress' | 'completed' | 'blocked'
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { success: false, error: 'Not authenticated' };

  const docRef = projectsCol().doc(projectId);
  const doc = await docRef.get();
  if (!doc.exists) return { success: false, error: 'Project not found' };
  const project = doc.data() as Project;

  if (!project.teamMemberIds.includes(session.userId) && project.creatorId !== session.userId) {
    return { success: false, error: 'Not authorized' };
  }

  const phases = project.timeline?.phases || [];
  let found = false;
  for (const phase of phases) {
    for (const ms of phase.milestones || []) {
      if (ms.id === milestoneId) {
        ms.status = newStatus;
        if (newStatus === 'completed') ms.completedAt = new Date().toISOString();
        found = true;
        break;
      }
    }
    if (found) break;
  }

  if (!found) return { success: false, error: 'Milestone not found' };

  await docRef.update({
    'timeline.phases': phases,
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
}

/** Remove a team member from the project (creator-only). */
export async function removeTeamMember(
  projectId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { success: false, error: 'Not authenticated' };

  const docRef = projectsCol().doc(projectId);
  const doc = await docRef.get();
  if (!doc.exists) return { success: false, error: 'Project not found' };
  const project = doc.data() as Project;

  if (project.creatorId !== session.userId) {
    return { success: false, error: 'Only the project creator can remove members' };
  }

  if (memberId === project.creatorId) {
    return { success: false, error: 'Cannot remove the project creator' };
  }

  const updatedMembers = project.teamMemberIds.filter((id) => id !== memberId);
  const updatedPending = project.pendingInviteIds.filter((id) => id !== memberId);

  await docRef.update({
    teamMemberIds: updatedMembers,
    pendingInviteIds: updatedPending,
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
}

/** Change a team member's role label. */
export async function changeTeamMemberRole(
  projectId: string,
  memberId: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return { success: false, error: 'Not authenticated' };

  const docRef = projectsCol().doc(projectId);
  const doc = await docRef.get();
  if (!doc.exists) return { success: false, error: 'Project not found' };
  const project = doc.data() as Project;

  if (project.creatorId !== session.userId) {
    return { success: false, error: 'Only the project creator can change roles' };
  }

  // Store role overrides in a map on the project
  const roleOverrides = (project as Project & { roleOverrides?: Record<string, string> }).roleOverrides || {};
  roleOverrides[memberId] = newRole;

  await docRef.update({
    roleOverrides,
    updatedAt: new Date().toISOString(),
  });

  return { success: true };
}

/** Get a project by ID (only if user is a member). */
export async function getProject(projectId: string): Promise<Project | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;

  const doc = await projectsCol().doc(projectId).get();
  if (!doc.exists) return null;

  const project = doc.data() as Project;
  if (!project.teamMemberIds.includes(session.userId) && project.creatorId !== session.userId) {
    return null;
  }

  return project;
}
