'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  MessageSquare,
  Send,
  ChevronDown,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listThreads,
  createThread,
  addReply,
  type DiscussionThread,
} from '@/app/actions/discussions';

interface Props {
  projectId: string;
}

export default function WorkspaceDiscussions({ projectId }: Props) {
  const t = useTranslations('projects.discussions');
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedThread, setExpandedThread] = useState<string>('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [replying, setReplying] = useState<string | null>(null);

  const fetchThreads = useCallback(() => {
    listThreads(projectId)
      .then((data) => {
        setThreads(data);
        if (data.length > 0 && !expandedThread) setExpandedThread(data[0].id);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setPosting(true);
    const result = await createThread(projectId, { title: newTitle.trim(), content: newContent.trim() });
    if (result && 'error' in result) {
      alert(result.error);
    } else if (result) {
      setThreads((prev) => [result, ...prev]);
      setExpandedThread(result.id);
      setNewTitle('');
      setNewContent('');
      setShowNewThread(false);
    }
    setPosting(false);
  };

  const handleReply = async (threadId: string) => {
    const text = replyText[threadId]?.trim();
    if (!text) return;
    setReplying(threadId);
    const result = await addReply(projectId, threadId, text);
    if (result && 'error' in result) {
      alert(result.error);
    } else if (result) {
      setThreads((prev) =>
        prev.map((t) => t.id === threadId ? { ...t, replies: [...t.replies, result] } : t)
      );
      setReplyText((prev) => ({ ...prev, [threadId]: '' }));
    }
    setReplying(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {t('title')} ({threads.length})
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
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Discussion title..."
            className="mb-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
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
            <button
              onClick={handleCreateThread}
              disabled={posting || !newTitle.trim() || !newContent.trim()}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Thread list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
            <MessageSquare className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">No discussions yet. Start a new thread!</p>
          </div>
        ) : null}
        {threads.map((thread) => {
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
                    <button
                      onClick={() => handleReply(thread.id)}
                      disabled={replying === thread.id || !replyText[thread.id]?.trim()}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {replying === thread.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
