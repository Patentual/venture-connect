import { parseStringPromise } from 'xml2js';

export interface ScannedArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
}

export const TOPICS = [
  'artificial intelligence technology',
  'cryptocurrency blockchain',
  'venture capital startup funding',
  'fintech digital investment',
  'cybersecurity enterprise',
  'SaaS cloud computing',
  'remote work collaboration tools',
  'patent intellectual property technology',
];

async function fetchGoogleNewsRSS(query: string, count = 5): Promise<ScannedArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    const items = parsed?.rss?.channel?.item;
    if (!items) return [];
    const list = Array.isArray(items) ? items.slice(0, count) : [items];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return list.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      source: typeof item.source === 'string' ? item.source : item.source?._ || 'Unknown',
      pubDate: item.pubDate || '',
      snippet: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 300),
    }));
  } catch (err) {
    console.error(`News scan error for "${query}":`, err);
    return [];
  }
}

export async function scanNews(articlesPerTopic = 3): Promise<ScannedArticle[]> {
  const all: ScannedArticle[] = [];
  const seen = new Set<string>();
  for (const topic of TOPICS) {
    const articles = await fetchGoogleNewsRSS(topic, articlesPerTopic);
    for (const a of articles) {
      if (!seen.has(a.link)) { seen.add(a.link); all.push(a); }
    }
  }
  return all;
}
