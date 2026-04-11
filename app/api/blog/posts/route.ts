import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('blog_posts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Blog posts fetch error:', error);
    return NextResponse.json({ posts: [], error: String(error) }, { status: 500 });
  }
}
