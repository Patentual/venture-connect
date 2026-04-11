'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  ShieldCheck,
  Clock,
  MoreVertical,
  UserPlus,
  Search,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TeamMemberData } from '@/app/actions/workspace';
import { searchUsersForInvite, inviteUserToProject, removeTeamMember, changeTeamMemberRole } from '@/app/actions/projects';

interface Props {
  projectId: string;
  teamMembers: TeamMemberData[];
}

type SearchResult = { id: string; name: string; email: string; headline: string; initials: string };

export default function WorkspaceTeam({ projectId, teamMembers }: Props) {
  const t = useTranslations('projects.team');
  const [showInvite, setShowInvite] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [localMembers, setLocalMembers] = useState(teamMembers);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Focus input when modal opens
  useEffect(() => {
    if (showInvite) setTimeout(() => inputRef.current?.focus(), 100);
  }, [showInvite]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchUsersForInvite(projectId, q);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [projectId]);

  const handleInvite = async (userId: string) => {
    setInviting(userId);
    setError(null);
    try {
      const res = await inviteUserToProject(projectId, userId);
      if (res.success) {
        setInvited((prev) => new Set(prev).add(userId));
      } else {
        setError(res.error || 'Failed to send invite');
      }
    } catch {
      setError('Failed to send invite');
    } finally {
      setInviting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {t('title')} ({localMembers.length})
        </h3>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" />
          {t('inviteMore')}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {localMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white', member.color)}>
                  {member.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {member.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.role}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {openMenuId === member.id && (
                  <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    <button
                      onClick={async () => {
                        const newRole = prompt('Enter new role:', member.role);
                        if (newRole && newRole !== member.role) {
                          await changeTeamMemberRole(projectId, member.id, newRole);
                          setLocalMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role: newRole } : m));
                        }
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Change Role
                    </button>
                    {member.role !== 'Project Creator' && (
                      <button
                        disabled={removing === member.id}
                        onClick={async () => {
                          if (!confirm(`Remove ${member.name} from the project?`)) { setOpenMenuId(null); return; }
                          setRemoving(member.id);
                          const res = await removeTeamMember(projectId, member.id);
                          if (res.success) {
                            setLocalMembers((prev) => prev.filter((m) => m.id !== member.id));
                          } else {
                            alert(res.error || 'Failed to remove member');
                          }
                          setRemoving(null);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        {removing === member.id ? 'Removing...' : 'Remove Member'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {member.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              {member.status === 'active' ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">{t('active')}</span>
                  <span className="text-zinc-400 dark:text-zinc-500">
                    · {t('joined', { date: new Date(member.joinedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) })}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">{t('pending')}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Invite Modal ─────────────────────────────────────────────────────── */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Invite Team Member</h3>
              <button
                onClick={() => { setShowInvite(false); setQuery(''); setResults([]); setError(null); }}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-400" />}
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

            {/* Results */}
            <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {results.length === 0 && query.length >= 2 && !searching && (
                <p className="py-4 text-center text-xs text-zinc-400">No users found</p>
              )}
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold text-white">
                      {user.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.headline || user.email}</p>
                    </div>
                  </div>
                  {invited.has(user.id) ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Invited
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInvite(user.id)}
                      disabled={inviting === user.id}
                      className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {inviting === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                      Invite
                    </button>
                  )}
                </div>
              ))}
            </div>

            {query.length < 2 && (
              <p className="mt-4 text-center text-xs text-zinc-400">Type at least 2 characters to search</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
