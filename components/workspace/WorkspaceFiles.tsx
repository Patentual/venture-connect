'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  listProjectFiles,
  getUploadUrl,
  registerUploadedFile,
  deleteProjectFile,
  type ProjectFile,
} from '@/app/actions/files';

const FILE_ICONS = {
  document: FileText,
  image: ImageIcon,
  code: FileCode,
  video: Film,
};

interface Props {
  projectId: string;
}

export default function WorkspaceFiles({ projectId }: Props) {
  const t = useTranslations('projects.files');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchFiles = useCallback(() => {
    listProjectFiles(projectId)
      .then(setFiles)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (const file of Array.from(fileList)) {
      try {
        const result = await getUploadUrl(projectId, file.name, file.type, file.size);
        if ('error' in result) { alert(result.error); continue; }

        // Upload to signed URL
        await fetch(result.url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        // Register in Firestore
        const reg = await registerUploadedFile(projectId, {
          name: file.name,
          storagePath: result.storagePath,
          sizeBytes: file.size,
          contentType: file.type,
        });

        if ('file' in reg) {
          setFiles((prev) => [reg.file, ...prev]);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (fileId: string) => {
    setDeleting(fileId);
    const result = await deleteProjectFile(projectId, fileId);
    if (result.success) {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
    setDeleting(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-600 dark:hover:bg-blue-950/20"
      >
        <FolderOpen className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {t('dragDrop')}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading...' : t('upload')}
        </button>
      </div>

      {/* File list */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t('title')} ({files.length})
          </h3>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : files.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-400">No files uploaded yet</div>
          ) : (
            files.map((file) => {
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
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-blue-500 dark:hover:bg-zinc-800"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deleting === file.id}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800 disabled:opacity-40"
                    >
                      {deleting === file.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
