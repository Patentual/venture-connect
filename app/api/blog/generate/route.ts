import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { scanNews, TOPICS } from '@/lib/blog/news-scanner';
import { generateBlogPost } from '@/lib/blog/post-generator';

// Category labels matching topics
const CATEGORIES: Record<string, string> = {
  'artificial intelligence technology': 'AI & Machine Learning',
  'cryptocurrency blockchain': 'Crypto & Web3',
  'venture capital startup funding': 'Venture Capital',
  'fintech digital investment': 'Fintech & Investment',
  'cybersecurity enterprise': 'Cybersecurity',
  'SaaS cloud computing': 'SaaS & Cloud',
  'remote work collaboration tools': 'Remote Work',
  'patent intellectual property technology': 'IP & Patents',
  'investing in tech projects startups': 'Investing',
  'angel investing seed funding rounds': 'Angel Investing',
  'crowdfunding equity investment platforms': 'Crowdfunding',
};

export async function POST(request: Request) {
  // Simple auth — require a secret header
  const authHeader = request.headers.get('x-api-secret');
  if (authHeader !== process.env.BLOG_GENERATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const topicCount = (body as { topicCount?: number }).topicCount || 3; // generate posts for N random topics
    const articlesPerTopic = (body as { articlesPerTopic?: number }).articlesPerTopic || 3;

    // Scan news
    const allArticles = await scanNews(articlesPerTopic);
    if (allArticles.length === 0) {
      return NextResponse.json({ error: 'No articles found' }, { status: 500 });
    }

    // Group by topic (roughly)
    const shuffled = TOPICS.sort(() => Math.random() - 0.5).slice(0, topicCount);
    const generated: string[] = [];

    for (const topic of shuffled) {
      const topicArticles = allArticles.filter(
        (a) => a.title.toLowerCase().includes(topic.split(' ')[0]) || a.snippet.toLowerCase().includes(topic.split(' ')[0])
      );

      // Fall back to any articles if topic filter is too narrow
      const pool = topicArticles.length >= 2 ? topicArticles.slice(0, 4) : allArticles.slice(0, 4);
      const category = CATEGORIES[topic] || 'Technology';

      const post = await generateBlogPost(pool, category);

      // Check for duplicate slugs
      const existing = await adminDb.collection('blog_posts').where('slug', '==', post.slug).limit(1).get();
      if (!existing.empty) {
        post.slug = `${post.slug}-${Date.now()}`;
      }

      await adminDb.collection('blog_posts').add({
        ...post,
        status: 'published',
        createdAt: new Date().toISOString(),
        generatedBy: 'ai',
        coverImage: post.coverImage || '',
      });

      generated.push(post.title);
    }

    return NextResponse.json({ success: true, generated });
  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
