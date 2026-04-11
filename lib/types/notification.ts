export type NotificationType =
  | 'meeting_invite'
  | 'meeting_reminder'
  | 'meeting_cancelled'
  | 'project_invite'
  | 'nda_signed'
  | 'general';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;

  // Optional structured metadata
  meetingId?: string;
  projectId?: string;
  accessCode?: string;
  meetingLink?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;

  // Links
  href?: string; // in-app link for click-through

  createdAt: string;
}
