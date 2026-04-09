'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import type { Project, ProjectStatus } from '@/lib/types';

const projectsCol = () => adminDb.collection('projects');

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

  const snapshot = await projectsCol()
    .where('teamMemberIds', 'array-contains', session.userId)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => {
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
