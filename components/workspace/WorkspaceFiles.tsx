'use client';

import { useTranslations } from 'next-intl';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FileCode,
  Film,
  Download,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'code' | 'video';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

const FILE_ICONS = {
  document: FileText,
  image: ImageIcon,
  code: FileCode,
  video: Film,
};

const MOCK_FILES: FileItem[] = [
  { id: 'f1', name: 'Technical Architecture v2.pdf', type: 'document', size: '2.4 MB', uploadedBy: 'Alex Rivera', uploadedAt: '2026-03-01' },
  { id: 'f2', name: 'Design System — Components.fig', type: 'image', size: '18.7 MB', uploadedBy: 'Aiko Tanaka', uploadedAt: '2026-03-08' },
  { id: 'f3', name: 'database-schema.sql', type: 'code', size: '45 KB', uploadedBy: 'Sarah Chen', uploadedAt: '2026-03-15' },
  { id: 'f4', name: 'Brand Guidelines.pdf', type: 'document', size: '5.1 MB', uploadedBy: 'Aiko Tanaka', uploadedAt: '2026-03-05' },
  { id: 'f5', name: 'Product Demo — Sprint 2.mp4', type: 'video', size: '124 MB', uploadedBy: 'Dev Patel', uploadedAt: '2026-04-05' },
  { id: 'f6', name: 'api-spec-openapi.yaml', type: 'code', size: '12 KB', uploadedBy: 'Sarah Chen', uploadedAt: '2026-03-20' },
  { id: 'f7', name: 'User Flow Wireframes.png', type: 'image', size: '3.2 MB', uploadedBy: 'Aiko Tanaka', uploadedAt: '2026-03-10' },
];

export default function WorkspaceFiles() {
  const t = useTranslations('projects.files');

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/20">
        <FolderOpen className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {t('dragDrop')}
        </p>
        <button className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          <Upload className="h-4 w-4" />
          {t('upload')}
        </button>
      </div>

      {/* File list */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t('title')} ({MOCK_FILES.length})
          </h3>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {MOCK_FILES.map((file) => {
            const Icon = FILE_ICONS[file.type];
            return (
              <div key={file.id} className="flex items-center gap-3 px-5 py-3">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  file.type === 'document' && 'bg-blue-50 text-blue-500 dark:bg-blue-950',
                  file.type === 'image' && 'bg-violet-50 text-violet-500 dark:bg-violet-950',
                  file.type === 'code' && 'bg-green-50 text-green-500 dark:bg-green-950',
                  file.type === 'video' && 'bg-amber-50 text-amber-500 dark:bg-amber-950',
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {file.size} · {t('uploadedBy', { name: file.uploadedBy })} · {new Date(file.uploadedAt).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-blue-500 dark:hover:bg-zinc-800">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
