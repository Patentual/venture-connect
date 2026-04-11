'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, ExternalLink, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Src { title: string; url: string; publisher: string }
interface Post { id: string; title: string; slug: string; excerpt: string; content: string; category: string; readTime: string; createdAt: string; sources: Src[] }

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog/posts').then(r => r.json()).then(d => {
      setPost(d.posts?.find((p: Post) => p.slug === params?.slug) || null);
    }).finally(() => setLoading(false));
  }, [params?.slug]);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>;
  if (!post) return <div className="py-32 text-center"><h2 className="text-lg font-semibold">Post not found</h2><Link href="/blog" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">Back</Link></div>;

  return (
    <div className="min-h-screen bg-white py-20 dark:bg-zinc-950">
      <article className="mx-auto max-w-3xl px-4">
        <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-medium text-indigo-700">{post.category}</span>
          <span className="flex items-center gap-1 text-zinc-400"><Clock className="h-3 w-3" />{post.readTime}</span>
          <span className="text-zinc-400">{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-white">{post.title}</h1>
        <p className="mt-3 text-lg text-zinc-500">{post.excerpt}</p>
        <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <ReactMarkdown components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">{children}</a> }}>{post.content}</ReactMarkdown>
        </div>
        {post.sources?.length > 0 && (
          <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 text-sm font-semibold">Sources</h3>
            <ul className="space-y-2">{post.sources.map((s, i) => (
              <li key={i} className="text-sm"><a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">{s.title} <ExternalLink className="h-3 w-3" /></a><span className="ml-2 text-zinc-400">— {s.publisher}</span></li>
            ))}</ul>
          </div>
        )}
      </article>
    </div>
  );
}
