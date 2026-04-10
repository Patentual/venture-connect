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

  try {
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
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return { activeProjects: 0, teamMembers: 0, pendingNdas: 0, avgRating: '—' };
  }
}

export interface ActivityItem {
  id: string;
  type: 'post' | 'file' | 'invitation' | 'rating';
  title: string;
  description: string;
  time: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Get recent activity items for the dashboard. */
export async function getRecentActivity(): Promise<ActivityItem[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  try {
    const userId = session.userId;
    const items: ActivityItem[] = [];

    // Recent posts by user
    const postsSnap = await adminDb
      .collection('posts')
      .where('authorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    for (const doc of postsSnap.docs) {
      const data = doc.data();
      items.push({
        id: `post-${doc.id}`,
        type: 'post',
        title: 'You published a post',
        description: (data.content || '').slice(0, 80) + ((data.content || '').length > 80 ? '…' : ''),
        time: data.createdAt ? timeAgo(data.createdAt) : '',
      });
    }

    // Recent file uploads across user's projects
    const projectsSnap = await adminDb
      .collection('projects')
      .where('teamMemberIds', 'array-contains', userId)
      .limit(10)
      .get();

    for (const projDoc of projectsSnap.docs) {
      const filesSnap = await adminDb
        .collection('projects')
        .doc(projDoc.id)
        .collection('files')
        .orderBy('uploadedAt', 'desc')
        .limit(3)
        .get();
      for (const fileDoc of filesSnap.docs) {
        const data = fileDoc.data();
        items.push({
          id: `file-${fileDoc.id}`,
          type: 'file',
          title: `File uploaded to ${projDoc.data().title || 'project'}`,
          description: data.name || 'Unnamed file',
          time: data.uploadedAt ? timeAgo(data.uploadedAt) : '',
        });
      }
    }

    // Recent invitations received
    const invSnap = await adminDb
      .collection('projectInvitations')
      .where('recipientId', '==', userId)
      .orderBy('sentAt', 'desc')
      .limit(5)
      .get();

    for (const doc of invSnap.docs) {
      const data = doc.data();
      items.push({
        id: `inv-${doc.id}`,
        type: 'invitation',
        title: `Invitation: ${data.projectTitle || 'Untitled'}`,
        description: `Role: ${data.role || 'Team Member'} · ${data.status || 'pending'}`,
        time: data.sentAt ? timeAgo(data.sentAt) : '',
      });
    }

    // Sort by parsed time (most recent first) — approximate sort by timeAgo string
    // Better: sort by raw timestamp. Let's use a score.
    items.sort((a, b) => {
      const scoreTime = (t: string) => {
        const m = t.match(/(\d+)(m|h|d)/);
        if (!m) return Infinity;
        const n = parseInt(m[1]);
        if (m[2] === 'm') return n;
        if (m[2] === 'h') return n * 60;
        return n * 1440;
      };
      return scoreTime(a.time) - scoreTime(b.time);
    });

    return items.slice(0, 10);
  } catch (err) {
    console.error('getRecentActivity error:', err);
    return [];
  }
}
