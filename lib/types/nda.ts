export type NDAStatus = 'pending' | 'signed' | 'declined' | 'expired';

export interface NDA {
  id: string;
  projectId: string;
  projectTitle: string;
  projectSynopsis: string;
  senderId: string; // Project creator
  recipientId: string; // Candidate
  status: NDAStatus;

  // Content
  documentUrl: string; // PDF of the NDA
  signedDocumentUrl?: string; // Countersigned PDF

  // Tracking
  sentAt: string;
  viewedAt?: string;
  signedAt?: string;
  declinedAt?: string;
  expiresAt: string;

  // IP address / consent metadata
  signedFromIp?: string;
  signatureData?: string; // Base64 signature image
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  projectSynopsis: string;
  senderId: string;
  recipientId: string;
  role: string; // The role they'd fill
  requiredSkills: string[];

  // Status
  status: 'pending' | 'interested' | 'declined' | 'nda_sent' | 'nda_signed' | 'approved' | 'rejected';

  // Messages
  outreachMessage: string; // AI-generated, no project specifics
  responseMessage?: string; // Candidate's reply

  sentAt: string;
  respondedAt?: string;
  ndaId?: string;
}
