'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/auth/session';
import { getStorage } from 'firebase-admin/storage';
import { adminApp } from '@/lib/firebase/admin';
import { checkProjectAccess } from '@/lib/auth/project-access';

export interface ProjectFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'code' | 'video';
  size: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedById: string;
  uploadedAt: string;
  storagePath: string;
  downloadUrl: string;
}

const EXT_TYPE_MAP: Record<string, ProjectFile['type']> = {
  pdf: 'document', doc: 'document', docx: 'document', txt: 'document', rtf: 'document', xls: 'document', xlsx: 'document', csv: 'document',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', svg: 'image', webp: 'image', fig: 'image', sketch: 'image',
  js: 'code', ts: 'code', tsx: 'code', jsx: 'code', py: 'code', sql: 'code', yaml: 'code', yml: 'code', json: 'code', html: 'code', css: 'code',
  mp4: 'video', mov: 'video', avi: 'video', webm: 'video', mkv: 'video',
};

function getFileType(filename: string): ProjectFile['type'] {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return EXT_TYPE_MAP[ext] || 'document';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** List files for a project. */
export async function listProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) return [];

  if (!await checkProjectAccess(projectId, session.userId)) return [];

  const snapshot = await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('files')
    .orderBy('uploadedAt', 'desc')
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => doc.data() as ProjectFile);
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_CONTENT_TYPES = new Set([
  // Documents
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv', 'application/rtf',
  // Images
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
  // Code / data
  'application/json', 'text/html', 'text/css', 'text/javascript', 'application/x-yaml',
  // Videos
  'video/mp4', 'video/webm', 'video/quicktime',
  // Archives
  'application/zip', 'application/gzip',
]);

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'ps1', 'msi', 'dll', 'so', 'dylib', 'com', 'scr', 'pif', 'vbs', 'js', 'wsh', 'wsf',
]);

/** Generate a signed upload URL for a project file. */
export async function getUploadUrl(
  projectId: string,
  filename: string,
  contentType: string,
  sizeBytes?: number
): Promise<{ url: string; storagePath: string } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { error: 'Not authenticated' };
  }

  // Validate file extension
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { error: `File type .${ext} is not allowed.` };
  }

  // Validate content type
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return { error: `Content type ${contentType} is not allowed.` };
  }

  // Validate file size
  if (sizeBytes && sizeBytes > MAX_FILE_SIZE) {
    return { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.` };
  }

  // Verify project membership
  if (!await checkProjectAccess(projectId, session.userId)) {
    return { error: 'Not a team member' };
  }

  // Sanitize filename — strip path traversal attempts
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `projects/${projectId}/files/${Date.now()}_${safeName}`;
  const bucket = getStorage(adminApp).bucket();
  const file = bucket.file(storagePath);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return { url, storagePath };
}

/** Register an uploaded file in Firestore after upload completes. */
export async function registerUploadedFile(
  projectId: string,
  data: { name: string; storagePath: string; sizeBytes: number; contentType: string }
): Promise<{ file: ProjectFile } | { error: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { error: 'Not authenticated' };
  }

  // Resolve uploader name
  let uploaderName = 'Unknown';
  const profileDoc = await adminDb.collection('profiles').doc(session.userId).get();
  if (profileDoc.exists) {
    uploaderName = profileDoc.data()?.fullName || 'Unknown';
  }

  // Get download URL
  const bucket = getStorage(adminApp).bucket();
  const file = bucket.file(data.storagePath);
  const [downloadUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const fileDoc: ProjectFile = {
    id,
    name: data.name,
    type: getFileType(data.name),
    size: formatSize(data.sizeBytes),
    sizeBytes: data.sizeBytes,
    uploadedBy: uploaderName,
    uploadedById: session.userId,
    uploadedAt: now,
    storagePath: data.storagePath,
    downloadUrl,
  };

  await adminDb
    .collection('projects')
    .doc(projectId)
    .collection('files')
    .doc(id)
    .set(fileDoc);

  return { file: fileDoc };
}

/** Delete a project file. */
export async function deleteProjectFile(projectId: string, fileId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || !session.twoFactorVerified) {
    return { success: false, error: 'Not authenticated' };
  }

  if (!await checkProjectAccess(projectId, session.userId)) {
    return { success: false, error: 'Not a project member' };
  }

  const fileRef = adminDb.collection('projects').doc(projectId).collection('files').doc(fileId);
  const fileDoc = await fileRef.get();
  if (!fileDoc.exists) return { success: false, error: 'File not found' };

  const fileData = fileDoc.data() as ProjectFile;

  // Delete from Storage
  try {
    const bucket = getStorage(adminApp).bucket();
    await bucket.file(fileData.storagePath).delete();
  } catch {
    // File may already be deleted from storage
  }

  // Delete from Firestore
  await fileRef.delete();
  return { success: true };
}
