'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Rss, Bell, Heart, ThumbsDown, MessageSquare, Share2, Send, Loader2, Check, ChevronDown, ChevronUp, FolderKanban, Globe, Lock, ArrowUpDown, Link2, Mail, X as XIcon } from 'lucide-react';
import {
  listFeedPosts,
  createPost,
  toggleLike,
  toggleDislike,
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
  const [dislikedPosts, setDislikedPosts] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<'recent' | 'popular'>('recent');

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, FeedComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [postingComment, setPostingComment] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
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
        prev.map((p) => p.id === postId ? { ...p, likes: result.likes, dislikes: result.dislikes } : p)
      );
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (result.liked) next.add(postId); else next.delete(postId);
        return next;
      });
      // Remove from dislikes (mutual exclusion)
      setDislikedPosts((prev) => { const n = new Set(prev); n.delete(postId); return n; });
    }
  };

  const handleDislike = async (postId: string) => {
    const result = await toggleDislike(postId);
    if (result) {
      setPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, likes: result.likes, dislikes: result.dislikes } : p)
      );
      setDislikedPosts((prev) => {
        const next = new Set(prev);
        if (result.disliked) next.add(postId); else next.delete(postId);
        return next;
      });
      // Remove from likes (mutual exclusion)
      setLikedPosts((prev) => { const n = new Set(prev); n.delete(postId); return n; });
    }
  };

  // Sort posts based on current mode
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortMode === 'popular') {
      const scoreA = (a.likes - a.dislikes) + a.comments * 0.5;
      const scoreB = (b.likes - b.dislikes) + b.comments * 0.5;
      if (scoreB !== scoreA) return scoreB - scoreA;
    }
    // Fall back to most recent
    return (b.createdAtISO || '').localeCompare(a.createdAtISO || '');
  });

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

  const getShareUrl = (postId: string) => `${window.location.origin}/dashboard/feed?post=${postId}`;

  const handleCopyLink = async (postId: string) => {
    try {
      await navigator.clipboard.writeText(getShareUrl(postId));
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
    setShareMenuOpen(null);
  };

  const handleShareTo = (platform: string, postId: string, content: string) => {
    const url = encodeURIComponent(getShareUrl(postId));
    const text = encodeURIComponent(content.slice(0, 200));
    const title = encodeURIComponent('Check out this post on VentureNex');
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
      case 'messenger':
        shareUrl = `https://www.facebook.com/dialog/send?link=${url}&app_id=0&redirect_uri=${url}`;
        break;
      case 'wechat':
        // WeChat doesn't support direct URL sharing — copy link and show instructions
        handleCopyLink(postId);
        return;
      case 'x':
        shareUrl = `https://x.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${text}%0A%0A${url}`;
        break;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    setShareMenuOpen(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Rss className="h-5 w-5 text-indigo-500" />
          {t('nav.feed')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortMode(sortMode === 'recent' ? 'popular' : 'recent')}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
              sortMode === 'popular'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortMode === 'recent' ? 'Recent' : 'Popular'}
          </button>
          <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
          </button>
        </div>
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
          {sortedPosts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const isDisliked = dislikedPosts.has(post.id);
            const commentsOpen = expandedComments.has(post.id);
            const comments = commentsMap[post.id] || [];
            const isLoadingComments = loadingComments.has(post.id);
            const isCopied = copiedId === post.id;

            return (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900"
              >
                <div className="p-5">
                  <div
                    onClick={() => handleToggleComments(post.id)}
                    className="cursor-pointer rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 -m-2 p-2"
                  >
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
                  </div>
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
                      onClick={() => handleDislike(post.id)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs transition-colors',
                        isDisliked ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'
                      )}
                    >
                      <ThumbsDown className={cn('h-3.5 w-3.5', isDisliked && 'fill-orange-500')} /> {post.dislikes}
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
                    <div className="relative">
                      <button
                        onClick={() => setShareMenuOpen(shareMenuOpen === post.id ? null : post.id)}
                        className={cn(
                          'flex items-center gap-1.5 text-xs transition-colors',
                          shareMenuOpen === post.id ? 'text-indigo-500' : isCopied ? 'text-emerald-500' : 'text-slate-500 hover:text-emerald-500'
                        )}
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                        {isCopied ? 'Copied!' : 'Share'}
                      </button>

                      {shareMenuOpen === post.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShareMenuOpen(null)} />
                          <div className="absolute left-0 top-full z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <button onClick={() => handleShareTo('whatsapp', post.id, post.content)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              WhatsApp
                            </button>
                            <button onClick={() => handleShareTo('messenger', post.id, post.content)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z"/></svg>
                              Messenger
                            </button>
                            <button onClick={() => handleShareTo('wechat', post.id, post.content)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-green-50 hover:text-green-700 dark:text-slate-300 dark:hover:bg-green-900/20 dark:hover:text-green-400">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 00.186-.062l1.87-1.119a.6.6 0 01.51-.06 10.146 10.146 0 003.058.469c.225 0 .447-.012.667-.03-.11-.404-.168-.823-.168-1.252 0-3.604 3.468-6.526 7.744-6.526.256 0 .507.014.756.04C16.86 4.79 13.142 2.188 8.691 2.188zm-2.6 4.408c.56 0 1.013.458 1.013 1.023 0 .564-.453 1.023-1.013 1.023s-1.013-.459-1.013-1.023c0-.565.453-1.023 1.013-1.023zm5.218 0c.56 0 1.013.458 1.013 1.023 0 .564-.453 1.023-1.013 1.023s-1.013-.459-1.013-1.023c0-.565.453-1.023 1.013-1.023zM16.066 9.48c-3.728 0-6.75 2.548-6.75 5.69 0 3.14 3.022 5.69 6.75 5.69.753 0 1.477-.108 2.156-.307a.52.52 0 01.44.052l1.32.789a.282.282 0 00.16.054.254.254 0 00.25-.254c0-.062-.025-.123-.041-.184l-.276-1.044a.51.51 0 01.184-.574c1.584-1.168 2.597-2.893 2.597-4.808 0-3.142-3.022-5.69-6.75-5.69v-.104zm-2.14 3.356c.483 0 .876.396.876.884 0 .488-.393.884-.875.884s-.876-.396-.876-.884c0-.488.393-.884.876-.884zm4.28 0c.483 0 .876.396.876.884 0 .488-.393.884-.876.884s-.875-.396-.875-.884c0-.488.392-.884.875-.884z"/></svg>
                              WeChat (copy link)
                            </button>
                            <button onClick={() => handleShareTo('x', post.id, post.content)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              X (Twitter)
                            </button>
                            <button onClick={() => handleShareTo('linkedin', post.id, post.content)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              LinkedIn
                            </button>
                            <button onClick={() => handleShareTo('email', post.id, post.content)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-900/20 dark:hover:text-violet-400">
                              <Mail className="h-4 w-4" />
                              Email
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            <button onClick={() => handleCopyLink(post.id)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                              <Link2 className="h-4 w-4" />
                              Copy link
                            </button>
                          </div>
                        </>
                      )}
                    </div>
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
