export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'recruiting'
  | 'active'
  | 'completed'
  | 'archived';

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface Project {
  id: string;
  creatorId: string;
  title: string;
  synopsis: string; // Short description shared in outreach
  description: string; // Full description, only visible to approved members
  status: ProjectStatus;
  isPublic: false; // Always private — directory listing never shows full details

  // AI-generated plan
  timeline: ProjectTimeline;

  // Team
  teamMemberIds: string[];
  pendingInviteIds: string[];
  maxTeamSize: number;

  // Location
  isRemote: boolean;
  location?: string;
  country?: string;
  city?: string;

  // Metadata
  industry: string;
  requiredSkills: string[];
  estimatedDuration: string;
  estimatedBudget?: number;
  budgetCurrency?: string;

  // AI pitch deck
  pitchDeck?: {
    slides: { title: string; type: string; bullets: string[]; speakerNotes: string }[];
  };
  pitchDeckGeneratedAt?: string;

  createdAt: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectTimeline {
  phases: ProjectPhase[];
  totalDuration: string;
  generatedByAI: boolean;
  approvedAt?: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  personnelNeeds: PersonnelRequirement[];
  toolsAndMaterials: string[];
}

export interface Milestone {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  completedAt?: string;
  assigneeIds: string[];
}

export interface PersonnelRequirement {
  id: string;
  phaseId: string;
  role: string;
  skills: string[];
  count: number;
  duration: string;
  isRemote: boolean;
  location?: string;
  matchedCandidateIds: string[];
  confirmedMemberId?: string;
}
