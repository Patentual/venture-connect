'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import { moderateContent } from '@/lib/moderation';
import { getInitials, getAvatarColor, timeAgo } from '@/lib/shared-utils';

export interface FeedPost {
  id: string;
  author: string;
  initials: string;
  color: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  projectId?: string;
  projectTitle?: string;
}

/** Create a new feed post, optionally scoped to a project. */
export async function createPost(content: string, projectId?: string): Promise<FeedPost | { error: string } | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;
  if (!content.trim()) return null;

  // Content moderation
  const modResult = await moderateContent(content);
  if (!modResult.allowed) {
    return { error: modResult.reason || 'Content not allowed.' };
  }

  // Block recruitment-style posts from non-Talent Sourcing accounts
  if (modResult.recruitmentDetected) {
    const senderProfile = await adminDb.collection('profiles').doc(session.userId).get();
    const senderType = senderProfile.exists ? senderProfile.data()?.accountType : null;
    if (senderType !== 'recruiter') {
      return { error: 'This post contains recruitment-style language. Talent sourcing requires a Talent Sourcing subscription.' };
    }
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  // Resolve author name
  let authorName = 'Unknown';
  const profileDoc = await adminDb.collection('profiles').doc(session.userId).get();
  if (profileDoc.exists) {
    authorName = profileDoc.data()?.fullName || 'Unknown';
  }

  // Resolve project title if scoped to a project
  let projectTitle: string | undefined;
  if (projectId) {
    const projDoc = await adminDb.collection('projects').doc(projectId).get();
    if (projDoc.exists) {
      projectTitle = projDoc.data()?.title;
    }
  }

  await adminDb.collection('posts').doc(id).set({
    authorId: session.userId,
    content: content.trim(),
    projectId: projectId || null,
    likeCount: 0,
    commentCount: 0,
    likedBy: [],
    createdAt: now,
  });

  return {
    id,
    author: authorName,
    initials: getInitials(authorName),
    color: getAvatarColor(authorName),
    time: 'just now',
    content: content.trim(),
    likes: 0,
    comments: 0,
    projectId: projectId || undefined,
    projectTitle,
  };
}

/** Toggle like on a post. Returns new like count and whether the user now likes it. */
export async function toggleLike(postId: string): Promise<{ likes: number; liked: boolean } | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;

  const postRef = adminDb.collection('posts').doc(postId);
  const postDoc = await postRef.get();
  if (!postDoc.exists) return null;

  const data = postDoc.data()!;
  const likedBy: string[] = data.likedBy || [];
  const alreadyLiked = likedBy.includes(session.userId);

  if (alreadyLiked) {
    const updated = likedBy.filter((id: string) => id !== session.userId);
    await postRef.update({ likedBy: updated, likeCount: updated.length });
    return { likes: updated.length, liked: false };
  } else {
    const updated = [...likedBy, session.userId];
    await postRef.update({ likedBy: updated, likeCount: updated.length });
    return { likes: updated.length, liked: true };
  }
}

export interface FeedComment {
  id: string;
  author: string;
  initials: string;
  color: string;
  content: string;
  time: string;
}

/** List comments for a post. */
export async function listComments(postId: string): Promise<FeedComment[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  const snapshot = await adminDb
    .collection('posts')
    .doc(postId)
    .collection('comments')
    .orderBy('createdAt', 'asc')
    .limit(50)
    .get();

  const comments: FeedComment[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let authorName = 'Unknown';
    const profileDoc = await adminDb.collection('profiles').doc(data.authorId).get();
    if (profileDoc.exists) {
      authorName = profileDoc.data()?.fullName || 'Unknown';
    }
    comments.push({
      id: doc.id,
      author: authorName,
      initials: getInitials(authorName),
      color: getAvatarColor(authorName),
      content: data.content || '',
      time: data.createdAt ? timeAgo(data.createdAt) : '',
    });
  }

  return comments;
}

/** Add a comment to a post. */
export async function addComment(postId: string, content: string): Promise<FeedComment | { error: string } | null> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return null;
  if (!content.trim()) return null;

  // Content moderation
  const modResult = await moderateContent(content);
  if (!modResult.allowed) {
    return { error: modResult.reason || 'Content not allowed.' };
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  let authorName = 'Unknown';
  const profileDoc = await adminDb.collection('profiles').doc(session.userId).get();
  if (profileDoc.exists) {
    authorName = profileDoc.data()?.fullName || 'Unknown';
  }

  await adminDb
    .collection('posts')
    .doc(postId)
    .collection('comments')
    .doc(id)
    .set({
      authorId: session.userId,
      content: content.trim(),
      createdAt: now,
    });

  // Increment comment count on the post
  const postRef = adminDb.collection('posts').doc(postId);
  const postDoc = await postRef.get();
  if (postDoc.exists) {
    const currentCount = postDoc.data()?.commentCount || 0;
    await postRef.update({ commentCount: currentCount + 1 });
  }

  return {
    id,
    author: authorName,
    initials: getInitials(authorName),
    color: getAvatarColor(authorName),
    content: content.trim(),
    time: 'just now',
  };
}

/** List feed posts scoped to the user's project network. */
export async function listFeedPosts(): Promise<FeedPost[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  const userId = session.userId;

  // 1. Find all projects the current user belongs to
  const projectSnap = await adminDb
    .collection('projects')
    .where('teamMemberIds', 'array-contains', userId)
    .get();

  // 2. Collect all unique user IDs and build project title map
  const networkIds = new Set<string>();
  const projectTitleMap = new Map<string, string>();
  networkIds.add(userId); // always see own posts
  for (const doc of projectSnap.docs) {
    const data = doc.data();
    const members: string[] = data.teamMemberIds || [];
    members.forEach((id: string) => networkIds.add(id));
    if (data.creatorId) networkIds.add(data.creatorId);
    if (data.title) projectTitleMap.set(doc.id, data.title);
  }

  // 3. Get posts — Firestore 'in' queries support max 30 values
  const networkArray = Array.from(networkIds);
  const posts: FeedPost[] = [];

  // Batch into chunks of 30 for Firestore 'in' limit
  for (let i = 0; i < networkArray.length; i += 30) {
    const chunk = networkArray.slice(i, i + 30);
    const snapshot = await adminDb
      .collection('posts')
      .where('authorId', 'in', chunk)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      let authorName = 'Unknown';
      const profileDoc = await adminDb.collection('profiles').doc(data.authorId).get();
      if (profileDoc.exists) {
        authorName = profileDoc.data()?.fullName || 'Unknown';
      }

      posts.push({
        id: doc.id,
        author: authorName,
        initials: getInitials(authorName),
        color: getAvatarColor(authorName),
        time: data.createdAt ? timeAgo(data.createdAt) : '',
        content: data.content || '',
        likes: data.likeCount || 0,
        comments: data.commentCount || 0,
        projectId: data.projectId || undefined,
        projectTitle: data.projectId ? projectTitleMap.get(data.projectId) : undefined,
      });
    }
  }

  // Sort combined results by most recent and cap at 50
  posts.sort((a, b) => (b.time < a.time ? -1 : 1));
  return posts.slice(0, 50);
}
