'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  LayoutDashboard,
  Flag,
  Users,
  FolderOpen,
  MessageSquare,
  Settings,
  Lock,
  Globe,
  Clock,
  ArrowLeft,
  PenTool,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import WorkspaceOverview from '@/components/workspace/WorkspaceOverview';
import WorkspaceMilestones from '@/components/workspace/WorkspaceMilestones';
import WorkspaceTeam from '@/components/workspace/WorkspaceTeam';
import WorkspaceFiles from '@/components/workspace/WorkspaceFiles';
import WorkspaceDiscussions from '@/components/workspace/WorkspaceDiscussions';
import WorkspaceWhiteboard from '@/components/workspace/WorkspaceWhiteboard';
import WorkspaceRatings from '@/components/workspace/WorkspaceRatings';
import ProjectAccessGate from '@/components/workspace/ProjectAccessGate';

const TABS = [
  { key: 'overview', icon: LayoutDashboard },
  { key: 'milestones', icon: Flag },
  { key: 'team', icon: Users },
  { key: 'files', icon: FolderOpen },
  { key: 'discussions', icon: MessageSquare },
  { key: 'whiteboard', icon: PenTool },
  { key: 'ratings', icon: Star },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function DashboardProjectWorkspacePage() {
  const t = useTranslations('projects');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [accessVerified, setAccessVerified] = useState(false);

  // Show access gate before project content
  if (!accessVerified) {
    return (
      <ProjectAccessGate
        isLeader={true}
        projectName="E-Commerce Platform for Sustainable Fashion"
        onAccessGranted={() => setAccessVerified(true)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <Link
        href="/dashboard/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('title')}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              E-Commerce Platform for Sustainable Fashion
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
              {t('status.active')}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              Remote
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              16 weeks
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              5 / 6 members
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              NDA Required
            </span>
          </div>
        </div>
        <button className="shrink-0 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <Settings className="mr-1.5 inline h-4 w-4" />
          {t('tabs.settings')}
        </button>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === key
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            )}
          >
            <Icon className="h-4 w-4" />
            {t(`tabs.${key}`)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <WorkspaceOverview />}
      {activeTab === 'milestones' && <WorkspaceMilestones />}
      {activeTab === 'team' && <WorkspaceTeam />}
      {activeTab === 'files' && <WorkspaceFiles />}
      {activeTab === 'discussions' && <WorkspaceDiscussions />}
      {activeTab === 'whiteboard' && <WorkspaceWhiteboard />}
      {activeTab === 'ratings' && <WorkspaceRatings />}
    </div>
  );
}
