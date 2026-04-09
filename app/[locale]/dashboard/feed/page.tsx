'use client';

import { useTranslations } from 'next-intl';
import { Rss, Bell, Heart, MessageSquare, Share2 } from 'lucide-react';

// TODO: Replace with Firestore query for user's feed
const posts: { id: string; author: string; initials: string; color: string; time: string; content: string; likes: number; comments: number }[] = [];

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

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Rss className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            No posts yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your feed will show updates from your team and projects.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
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
      )}
    </div>
  );
}
