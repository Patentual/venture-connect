'use client';

import { useTranslations } from 'next-intl';
import { Rss, Bell, Heart, MessageSquare, Share2 } from 'lucide-react';

const MOCK_POSTS = [
  {
    id: '1',
    author: 'Sarah Chen',
    initials: 'SC',
    color: 'from-violet-500 to-pink-500',
    time: '2h ago',
    content: 'Just shipped the new authentication module for the sustainable fashion platform. 2FA with TOTP is live!',
    likes: 12,
    comments: 3,
  },
  {
    id: '2',
    author: 'Dev Patel',
    initials: 'DP',
    color: 'from-green-500 to-emerald-500',
    time: '5h ago',
    content: 'Looking for a Rust/WASM expert for a performance-critical image processing pipeline. Any recommendations?',
    likes: 8,
    comments: 7,
  },
  {
    id: '3',
    author: 'Aiko Tanaka',
    initials: 'AT',
    color: 'from-amber-500 to-orange-500',
    time: '1d ago',
    content: 'Published our new design system documentation. 47 components, fully accessible, dark mode supported.',
    likes: 24,
    comments: 5,
  },
];

export default function FeedPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Rss className="h-5 w-5 text-indigo-500" />
          {t('nav.feed')}
        </h1>
        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_POSTS.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/60 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${post.color}`}>
                {post.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{post.author}</p>
                <p className="text-xs text-slate-400">{post.time}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{post.content}</p>
            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500">
                <Heart className="h-3.5 w-3.5" /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-500">
                <MessageSquare className="h-3.5 w-3.5" /> {post.comments}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-500">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
