'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Rss, Bell, Heart, MessageSquare, Share2, Send, Loader2, Check, ChevronDown, ChevronUp, FolderKanban, Globe, Lock } from 'lucide-react';
import {
  listFeedPosts,
  createPost,
  toggleLike,
  listComments,
  addComment,
  type FeedPost,
  type FeedComment,
} from '@/app/actions/feed';
import { listMyProjects, type ProjectSummary } from '@/app/actions/projects';
import { cn } from '@/lib/utils';

export default function FeedPage() {
  const t = useTranslations('dashboard');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, FeedComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [postingComment, setPostingComment] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [moderationError, setModerationError] = useState('');
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    Promise.all([listFeedPosts(), listMyProjects()])
      .then(([feedPosts, userProjects]) => {
        setPosts(feedPosts);
        setProjects(userProjects);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || posting) return;
    setPosting(true);
    setModerationError('');
    const result = await createPost(newPost, selectedProjectId || undefined);
    if (result && 'error' in result) {
      setModerationError(result.error);
    } else if (result) {
      setPosts((prev) => [result as FeedPost, ...prev]);
      setNewPost('');
      setSelectedProjectId('');
    }
    setPosting(false);
  };

  const handleLike = async (postId: string) => {
    const result = await toggleLike(postId);
    if (result) {
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, likes: result.likes } : p)
      );
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (result.liked) next.add(postId); else next.delete(postId);
        return next;
      });
    }
  };

  const handleToggleComments = async (postId: string) => {
    const isOpen = expandedComments.has(postId);
    if (isOpen) {
      setExpandedComments((prev) => { const n = new Set(prev); n.delete(postId); return n; });
      return;
    }

    setExpandedComments((prev) => new Set([...prev, postId]));

    // Load comments if not cached
    if (!commentsMap[postId]) {
      setLoadingComments((prev) => new Set([...prev, postId]));
      const comments = await listComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
      setLoadingComments((prev) => { const n = new Set(prev); n.delete(postId); return n; });
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    setPostingComment(postId);
    setModerationError('');
    const result = await addComment(postId, text);
    if (result && 'error' in result) {
      setModerationError(result.error);
    } else if (result) {
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), result as FeedComment],
      }));
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, comments: p.comments + 1 } : p)
      );
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    }
    setPostingComment(null);
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/dashboard/feed?post=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: open share dialog if available
      if (navigator.share) {
        navigator.share({ url }).catch(() => {});
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Rss className="h-5 w-5 text-indigo-500" />
          {t('nav.feed')}
        </h1>
        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-5 w-5" />
        </button>
      </div>

      {/* Compose box */}
      <div className="mb-6 rounded-2xl border border-slate-200/60 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share an update with your network..."
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-7 text-xs text-slate-600 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="">🌐 Public</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>🔒 {p.title}</option>
                ))}
              </select>
              {selectedProjectId ? (
                <Lock className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500" />
              ) : (
                <Globe className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              )}
            </div>
            {selectedProjectId ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 truncate">
                <Lock className="mr-0.5 inline h-3 w-3" />
                Confidential — only project team members will see this
              </p>
            ) : (
              <p className="text-xs text-slate-400 truncate">
                {newPost.length > 0 ? `${newPost.length} characters` : 'Visible to your entire network'}
              </p>
            )}
          </div>
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || posting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post
          </button>
        </div>
      </div>

      {/* Moderation error banner */}
      {moderationError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          <span className="font-medium">Post blocked:</span> {moderationError}
          <button onClick={() => setModerationError('')} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Rss className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            No posts yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Write your first post above to get the conversation started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const commentsOpen = expandedComments.has(post.id);
            const comments = commentsMap[post.id] || [];
            const isLoadingComments = loadingComments.has(post.id);
            const isCopied = copiedId === post.id;

            return (
              <div
                key={post.id}
                className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900"
              >
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${post.color}`}>
                      {post.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{post.author}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-400">{post.time}</p>
                        {post.projectTitle ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Lock className="h-2.5 w-2.5" />
                            {post.projectTitle}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <Globe className="h-2.5 w-2.5" />
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{post.content}</p>
                  <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs transition-colors',
                        isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                      )}
                    >
                      <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-red-500')} /> {post.likes}
                    </button>
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs transition-colors',
                        commentsOpen ? 'text-indigo-500' : 'text-slate-500 hover:text-indigo-500'
                      )}
                    >
                      <MessageSquare className={cn('h-3.5 w-3.5', commentsOpen && 'fill-indigo-100')} /> {post.comments}
                      {commentsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => handleShare(post.id)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs transition-colors',
                        isCopied ? 'text-emerald-500' : 'text-slate-500 hover:text-emerald-500'
                      )}
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                      {isCopied ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </div>

                {/* Comments section */}
                {commentsOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
                    {isLoadingComments ? (
                      <div className="flex justify-center py-3">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="py-2 text-center text-xs text-slate-400">No comments yet. Be the first!</p>
                    ) : (
                      <div className="space-y-3 mb-3">
                        {comments.map((c) => (
                          <div key={c.id} className="flex gap-2.5">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white ${c.color}`}>
                              {c.initials}
                            </div>
                            <div className="min-w-0 flex-1 rounded-xl bg-white p-2.5 dark:bg-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.author}</span>
                                <span className="text-[10px] text-slate-400">{c.time}</span>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(post.id); } }}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentText[post.id]?.trim() || postingComment === post.id}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {postingComment === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
