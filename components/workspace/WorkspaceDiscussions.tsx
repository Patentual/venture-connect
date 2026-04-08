'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reply {
  id: string;
  author: string;
  initials: string;
  color: string;
  content: string;
  postedAt: string;
}

interface Thread {
  id: string;
  title: string;
  author: string;
  initials: string;
  color: string;
  content: string;
  postedAt: string;
  replies: Reply[];
}

const MOCK_THREADS: Thread[] = [
  {
    id: 't1',
    title: 'API rate limiting approach',
    author: 'Alex Rivera',
    initials: 'AR',
    color: 'from-blue-500 to-cyan-500',
    content: 'We need to decide on the rate limiting strategy for our API. Should we use token bucket, sliding window, or fixed window? Also, what limits should we set for free vs paid tiers?',
    postedAt: '2026-04-07T14:30:00Z',
    replies: [
      { id: 'r1', author: 'Sarah Chen', initials: 'SC', color: 'from-violet-500 to-pink-500', content: 'I\'d recommend token bucket for its flexibility. We could do 100 req/min for free, 1000 for paid. Redis is great for distributed tracking.', postedAt: '2026-04-07T15:10:00Z' },
      { id: 'r2', author: 'Dev Patel', initials: 'DP', color: 'from-green-500 to-emerald-500', content: 'Agreed on token bucket. We should also add per-endpoint limits for expensive operations like AI recommendations. I can set up the Redis middleware this week.', postedAt: '2026-04-07T16:00:00Z' },
    ],
  },
  {
    id: 't2',
    title: 'Sustainability data sources',
    author: 'Jun Wei',
    initials: 'JW',
    color: 'from-rose-500 to-red-500',
    content: 'I\'ve been researching data sources for the carbon footprint calculator. Found a few options:\n\n1. Open LCA (open source, comprehensive)\n2. Ecoinvent (paid, very detailed)\n3. EXIOBASE (free, multi-regional)\n\nWhich should we prioritise for the MVP?',
    postedAt: '2026-04-06T10:00:00Z',
    replies: [
      { id: 'r3', author: 'Alex Rivera', initials: 'AR', color: 'from-blue-500 to-cyan-500', content: 'Let\'s go with Open LCA for MVP since it\'s free and open source. We can integrate Ecoinvent later for more detail. Budget is tight for this phase.', postedAt: '2026-04-06T11:30:00Z' },
    ],
  },
  {
    id: 't3',
    title: 'Design review — Checkout flow',
    author: 'Aiko Tanaka',
    initials: 'AT',
    color: 'from-amber-500 to-orange-500',
    content: 'I\'ve updated the checkout wireframes based on last week\'s feedback. Key changes: simplified the shipping form to a single step, added progress indicator, and moved promo code input to the order summary panel. Please review by EOD Friday.',
    postedAt: '2026-04-05T09:00:00Z',
    replies: [],
  },
];

export default function WorkspaceDiscussions() {
  const t = useTranslations('projects.discussions');
  const [expandedThread, setExpandedThread] = useState<string>('t1');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showNewThread, setShowNewThread] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {t('title')} ({MOCK_THREADS.length})
        </h3>
        <button
          onClick={() => setShowNewThread(!showNewThread)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t('newThread')}
        </button>
      </div>

      {/* New thread input */}
      {showNewThread && (
        <div className="rounded-2xl border border-blue-200 bg-white p-4 dark:border-blue-800 dark:bg-zinc-900">
          <input
            type="text"
            placeholder="Discussion title..."
            className="mb-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <textarea
            placeholder={t('threadPlaceholder')}
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setShowNewThread(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              Post
            </button>
          </div>
        </div>
      )}

      {/* Thread list */}
      <div className="space-y-3">
        {MOCK_THREADS.map((thread) => {
          const isExpanded = expandedThread === thread.id;
          return (
            <div
              key={thread.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <button
                onClick={() => setExpandedThread(isExpanded ? '' : thread.id)}
                className="flex w-full items-start gap-3 p-5 text-left"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white', thread.color)}>
                  {thread.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {thread.title}
                    </h4>
                    {thread.replies.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                        <MessageSquare className="h-3 w-3" />
                        {t('replies', { count: thread.replies.length })}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {thread.author} · {new Date(thread.postedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                  </p>
                  {!isExpanded && (
                    <p className="mt-1 line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {thread.content}
                    </p>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
                ) : (
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-100 px-5 pb-5 dark:border-zinc-800">
                  {/* Original post */}
                  <p className="whitespace-pre-wrap py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {thread.content}
                  </p>

                  {/* Replies */}
                  {thread.replies.length > 0 && (
                    <div className="space-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      {thread.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white', reply.color)}>
                            {reply.initials}
                          </div>
                          <div className="min-w-0 flex-1 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                {reply.author}
                              </span>
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                {new Date(reply.postedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={replyText[thread.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [thread.id]: e.target.value })}
                      placeholder={t('replyPlaceholder')}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    />
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
