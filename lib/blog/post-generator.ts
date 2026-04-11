import OpenAI from 'openai';
import { ScannedArticle } from './news-scanner';

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  sources: { title: string; url: string; publisher: string }[];
  readTime: string;
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export async function generateBlogPost(articles: ScannedArticle[], category: string): Promise<GeneratedPost> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const src = articles.map((a, i) => `[${i+1}] "${a.title}" — ${a.source} (${a.pubDate})\n    ${a.link}\n    ${a.snippet}`).join('\n\n');

  const sys = `You are a tech journalist for VentureNex. Write original blog posts synthesizing recent news. Rules:
- NEVER copy verbatim — paraphrase and analyze
- Cite sources inline as short hyperlinks, e.g. "according to [The New York Times](url)" — NEVER show raw URLs
- Do NOT include a Sources section at the end — the sources panel is rendered separately
- Use markdown with ## headings and **bold**, 600-900 words
- Professional but accessible tone`;

  const usr = `Write a "${category}" blog post from these articles:\n\n${src}\n\nReturn JSON: {"title":"...","excerpt":"...","content":"markdown body","readTime":"X min read"}`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: sys }, { role: 'user', content: usr }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const p = JSON.parse(res.choices[0]?.message?.content || '{}');
  return {
    title: p.title || 'Untitled', slug: slugify(p.title || `post-${Date.now()}`),
    excerpt: p.excerpt || '', content: p.content || '', category,
    sources: articles.map(a => ({ title: a.title, url: a.link, publisher: a.source })),
    readTime: p.readTime || '5 min read',
  };
}
