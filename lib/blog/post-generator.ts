import { aiClient, CHAT_MODEL, IMAGE_MODEL } from '@/lib/ai/client';
import { ScannedArticle } from './news-scanner';
import { getStorage } from 'firebase-admin/storage';
import { adminApp } from '@/lib/firebase/admin';

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  sources: { title: string; url: string; publisher: string }[];
  readTime: string;
  coverImage: string;
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export async function generateBlogPost(articles: ScannedArticle[], category: string): Promise<GeneratedPost> {
  const src = articles.map((a, i) => `[${i+1}] "${a.title}" — ${a.source} (${a.pubDate})\n    ${a.link}\n    ${a.snippet}`).join('\n\n');

  const sys = `You are a tech journalist for VentureNex. Write original blog posts synthesizing recent news. Rules:
- NEVER copy verbatim — paraphrase and analyze
- Cite sources inline as short hyperlinks, e.g. "according to [The New York Times](url)" — NEVER show raw URLs
- Do NOT include a Sources section at the end — the sources panel is rendered separately
- Use markdown with ## headings and **bold**, 600-900 words
- Professional but accessible tone`;

  const usr = `Write a "${category}" blog post from these articles:\n\n${src}\n\nReturn JSON: {"title":"...","excerpt":"...","content":"markdown body","readTime":"X min read"}`;

  const res = await aiClient.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const p = JSON.parse(res.choices[0]?.message?.content || '{}');
  const title = p.title || 'Untitled';

  // Generate cover image with DALL-E, then persist to Firebase Storage
  let coverImage = '';
  try {
    const imgRes = await aiClient.images.generate({
      model: IMAGE_MODEL,
      prompt: `Modern, professional blog header illustration for an article titled "${title}" in the ${category} category. Abstract, clean, tech-inspired design with subtle gradients. No text or words in the image.`,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });
    const tempUrl = imgRes.data?.[0]?.url;
    if (tempUrl) {
      // Download the image and upload to Firebase Storage for a permanent URL
      const imgResponse = await fetch(tempUrl);
      const buffer = Buffer.from(await imgResponse.arrayBuffer());
      const bucket = getStorage(adminApp).bucket();
      const filePath = `blog-images/${slugify(title)}-${Date.now()}.png`;
      const file = bucket.file(filePath);
      await file.save(buffer, { metadata: { contentType: 'image/png' } });
      await file.makePublic();
      coverImage = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    }
  } catch (err) {
    console.error('DALL-E image generation/upload failed:', err);
  }

  return {
    title, slug: slugify(title),
    excerpt: p.excerpt || '', content: p.content || '', category, coverImage,
    sources: articles.map(a => ({ title: a.title, url: a.link, publisher: a.source })),
    readTime: p.readTime || '5 min read',
  };
}
