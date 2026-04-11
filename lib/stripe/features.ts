/**
 * Feature gating by subscription tier.
 *
 * Usage:
 *   const allowed = canAccess(profile.subscriptionTier, 'aiProjectPlanning');
 */

export type SubscriptionTier = 'free' | 'professional' | 'creator' | 'enterprise' | 'talentSourcing';

export interface TierLimits {
  maxActiveProjects: number;
  aiProjectPlanning: boolean;
  automatedTeamAssembly: boolean;
  ndaGeneration: boolean;
  collaborationWorkspace: boolean;
  meetingScheduler: boolean;
  prioritySearch: boolean;
  verifiedBadge: boolean;
  portfolioUploads: boolean;
  availabilityCalendarSync: boolean;
  profileAnalytics: boolean;
  apiAccess: boolean;
  sso: boolean;
  customBranding: boolean;
  dedicatedAccountManager: boolean;
  prioritySupport: boolean;
  recruiterSearch: boolean;
  recruiterOutreach: number; // messages per month
}

const TIER_CONFIG: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxActiveProjects: 2,
    aiProjectPlanning: false,
    automatedTeamAssembly: false,
    ndaGeneration: false,
    collaborationWorkspace: false,
    meetingScheduler: false,
    prioritySearch: false,
    verifiedBadge: false,
    portfolioUploads: false,
    availabilityCalendarSync: false,
    profileAnalytics: false,
    apiAccess: false,
    sso: false,
    customBranding: false,
    dedicatedAccountManager: false,
    prioritySupport: false,
    recruiterSearch: false,
    recruiterOutreach: 0,
  },
  professional: {
    maxActiveProjects: 5,
    aiProjectPlanning: false,
    automatedTeamAssembly: false,
    ndaGeneration: false,
    collaborationWorkspace: false,
    meetingScheduler: false,
    prioritySearch: true,
    verifiedBadge: true,
    portfolioUploads: true,
    availabilityCalendarSync: true,
    profileAnalytics: true,
    apiAccess: false,
    sso: false,
    customBranding: false,
    dedicatedAccountManager: false,
    prioritySupport: false,
    recruiterSearch: false,
    recruiterOutreach: 0,
  },
  creator: {
    maxActiveProjects: Infinity,
    aiProjectPlanning: true,
    automatedTeamAssembly: true,
    ndaGeneration: true,
    collaborationWorkspace: true,
    meetingScheduler: true,
    prioritySearch: true,
    verifiedBadge: true,
    portfolioUploads: true,
    availabilityCalendarSync: true,
    profileAnalytics: true,
    apiAccess: false,
    sso: false,
    customBranding: false,
    dedicatedAccountManager: false,
    prioritySupport: false,
    recruiterSearch: false,
    recruiterOutreach: 0,
  },
  enterprise: {
    maxActiveProjects: Infinity,
    aiProjectPlanning: true,
    automatedTeamAssembly: true,
    ndaGeneration: true,
    collaborationWorkspace: true,
    meetingScheduler: true,
    prioritySearch: true,
    verifiedBadge: true,
    portfolioUploads: true,
    availabilityCalendarSync: true,
    profileAnalytics: true,
    apiAccess: true,
    sso: true,
    customBranding: true,
    dedicatedAccountManager: true,
    prioritySupport: true,
    recruiterSearch: false,
    recruiterOutreach: 0,
  },
  talentSourcing: {
    maxActiveProjects: 0,
    aiProjectPlanning: false,
    automatedTeamAssembly: false,
    ndaGeneration: false,
    collaborationWorkspace: false,
    meetingScheduler: false,
    prioritySearch: false,
    verifiedBadge: false,
    portfolioUploads: false,
    availabilityCalendarSync: false,
    profileAnalytics: false,
    apiAccess: false,
    sso: false,
    customBranding: false,
    dedicatedAccountManager: false,
    prioritySupport: false,
    recruiterSearch: true,
    recruiterOutreach: 50,
  },
};

export function getTierLimits(tier: string): TierLimits {
  return TIER_CONFIG[tier as SubscriptionTier] || TIER_CONFIG.free;
}

export function canAccess(tier: string, feature: keyof TierLimits): boolean {
  const limits = getTierLimits(tier);
  const value = limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}
