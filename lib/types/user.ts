export type AccountType = 'individual' | 'company' | 'recruiter';

export type AvailabilityStatus = 'available' | 'available_from' | 'unavailable';

export type VerificationLevel = 'none' | 'identity' | 'qualification' | 'company';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  headline: string;
  bio: string;
  profilePhotoUrl: string;
  companyLogoUrl: string;

  // Location
  country: string;
  city: string;
  timezone: string;
  coordinates?: { lat: number; lng: number };

  // Professional
  company: string;
  companyWebsite: string;
  accountType: AccountType;
  skills: string[];
  industries: string[];
  qualifications: string[];
  licences: string[];
  languages: string[];
  yearsOfExperience: number;
  portfolioLinks: string[];

  // Availability
  availabilityStatus: AvailabilityStatus;
  availableFrom?: string; // ISO date
  availableDuration?: string; // e.g. '3 months', '6 weeks'
  rateMin?: number;
  rateMax?: number;
  rateCurrency?: string;
  rateUnit?: 'hourly' | 'daily' | 'project';
  rateVisible: boolean;

  // Verification
  verifications: VerificationLevel[];
  isVerified: boolean;

  // Platform
  reputationScore: number;
  projectsCompleted: number;
  endorsementCount: number;
  responseRate: number; // 0-100 percentage

  // Integrations
  linkedInProfileUrl?: string;
  itinervateUserId?: string;

  // Subscription
  subscriptionTier: 'free' | 'professional' | 'creator' | 'enterprise';
  stripeCustomerId?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

export interface UserExperience {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface UserEducation {
  id: string;
  userId: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}
