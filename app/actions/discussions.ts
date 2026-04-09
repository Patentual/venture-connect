'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import { moderateContent } from '@/lib/moderation';
import { checkProjectAccess } from '@/lib/auth/project-access';
import { getInitials, getAvatarColor } from '@/lib/shared-utils';

export interface ThreadReply {
  id: string;
  author: string;
  initials: string;
  color: string;
  content: string;
  postedAt: string;
  authorId: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  author: string;
  initials: string;
  color: string;
  content: string;
  postedAt: string;
  authorId: string;
  replies: ThreadReply[];
}

async function resolveUser(userId: string): Promise<{ name: string; initials: string; color: string }> {
  const doc = await adminDb.collection('profiles').doc(userId).get();
  const name = doc.exists ? doc.data()?.fullName || 'Unknown' : 'Unknown';
  return { name, initials: getInitials(name), color: getAvatarColor(name) };
}

/** List all threads for a project. */
export async function listThreads(projectId: string): Promise<DiscussionThread[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  if (!await checkProjectAccess(projectId, session.userId)) return [];

  const snapshot = await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('threads')
    .orderBy('postedAt', 'desc')
    .limit(50)
    .get();

  const threads: DiscussionThread[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const user = await resolveUser(data.authorId);

    // Load replies
    const repliesSnap = await adminDb
      .collection('projects')
      .doc(projectId)
      .collection('threads')
      .doc(doc.id)
      .collection('replies')
      .orderBy('postedAt', 'asc')
      .limit(50)
      .get();

    const replies: ThreadReply[] = [];
    for (const replyDoc of repliesSnap.docs) {
      const r = replyDoc.data();
      const replyUser = await resolveUser(r.authorId);
      replies.push({
        id: replyDoc.id,
        author: replyUser.name,
        initials: replyUser.initials,
        color: replyUser.color,
        content: r.content,
        postedAt: r.postedAt,
        authorId: r.authorId,
      });
    }

    threads.push({
      id: doc.id,
      title: data.title,
      author: user.name,
      initials: user.initials,
      color: user.color,
      content: data.content,
      postedAt: data.postedAt,
      authorId: data.authorId,
      replies,
    });
  }

  return threads;
}

/** Create a new discussion thread. */
export async function createThread(
  projectId: string,
  data: { title: string; content: string }
): Promise<DiscussionThread | { error: string } | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;

  if (!await checkProjectAccess(projectId, session.userId)) {
    return { error: 'Not a project member' };
  }

  // Moderate title + content
  const modResult = await moderateContent(`${data.title} ${data.content}`);
  if (!modResult.allowed) {
    return { error: modResult.reason || 'Content not allowed.' };
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const user = await resolveUser(session.userId);

  const threadData = {
    title: data.title,
    content: data.content,
    authorId: session.userId,
    postedAt: now,
  };

  await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('threads')
    .doc(id)
    .set(threadData);

  return {
    id,
    ...threadData,
    author: user.name,
    initials: user.initials,
    color: user.color,
    replies: [],
  };
}

/** Add a reply to a thread. */
export async function addReply(
  projectId: string,
  threadId: string,
  content: string
): Promise<ThreadReply | { error: string } | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;

  if (!await checkProjectAccess(projectId, session.userId)) {
    return { error: 'Not a project member' };
  }

  // Content moderation
  const modResult = await moderateContent(content);
  if (!modResult.allowed) {
    return { error: modResult.reason || 'Content not allowed.' };
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const user = await resolveUser(session.userId);

  const replyData = {
    content,
    authorId: session.userId,
    postedAt: now,
  };

  await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('threads')
    .doc(threadId)
    .collection('replies')
    .doc(id)
    .set(replyData);

  return {
    id,
    author: user.name,
    initials: user.initials,
    color: user.color,
    content,
    postedAt: now,
    authorId: session.userId,
  };
}
