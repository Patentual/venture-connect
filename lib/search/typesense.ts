import Typesense from 'typesense';

// Typesense client — connects to Typesense Cloud or self-hosted instance
const client = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.TYPESENSE_PORT || '8108'),
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  connectionTimeoutSeconds: 5,
});

export default client;

// Schema for the profiles collection
export const PROFILES_SCHEMA = {
  name: 'profiles',
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'fullName', type: 'string' as const },
    { name: 'headline', type: 'string' as const, optional: true },
    { name: 'bio', type: 'string' as const, optional: true },
    { name: 'company', type: 'string' as const, optional: true },
    { name: 'skills', type: 'string[]' as const },
    { name: 'industries', type: 'string[]' as const },
    { name: 'country', type: 'string' as const, optional: true },
    { name: 'city', type: 'string' as const, optional: true },
    { name: 'availabilityStatus', type: 'string' as const },
    { name: 'yearsOfExperience', type: 'int32' as const },
    { name: 'reputationScore', type: 'float' as const },
    { name: 'isVerified', type: 'bool' as const },
    { name: 'accountType', type: 'string' as const },
    { name: 'subscriptionTier', type: 'string' as const },
    { name: 'languages', type: 'string[]' as const },
    { name: 'rateMin', type: 'int32' as const, optional: true },
    { name: 'rateMax', type: 'int32' as const, optional: true },
    { name: 'rateCurrency', type: 'string' as const, optional: true },
  ],
  default_sorting_field: 'reputationScore',
};

export interface SearchParams {
  query: string;
  skills?: string[];
  industries?: string[];
  country?: string;
  city?: string;
  availabilityStatus?: string;
  yearsOfExperienceMin?: number;
  yearsOfExperienceMax?: number;
  isVerified?: boolean;
  page?: number;
  perPage?: number;
  sortBy?: string;
}

export function buildSearchParams(params: SearchParams) {
  const filterParts: string[] = [];

  if (params.skills?.length) {
    filterParts.push(`skills:[${params.skills.join(',')}]`);
  }
  if (params.industries?.length) {
    filterParts.push(`industries:[${params.industries.join(',')}]`);
  }
  if (params.country) {
    filterParts.push(`country:=${params.country}`);
  }
  if (params.city) {
    filterParts.push(`city:=${params.city}`);
  }
  if (params.availabilityStatus) {
    filterParts.push(`availabilityStatus:=${params.availabilityStatus}`);
  }
  if (params.isVerified !== undefined) {
    filterParts.push(`isVerified:=${params.isVerified}`);
  }
  if (params.yearsOfExperienceMin !== undefined) {
    filterParts.push(`yearsOfExperience:>=${params.yearsOfExperienceMin}`);
  }
  if (params.yearsOfExperienceMax !== undefined) {
    filterParts.push(`yearsOfExperience:<=${params.yearsOfExperienceMax}`);
  }

  return {
    q: params.query || '*',
    query_by: 'fullName,headline,bio,skills,company',
    filter_by: filterParts.join(' && ') || undefined,
    sort_by: params.sortBy || 'reputationScore:desc',
    page: params.page || 1,
    per_page: params.perPage || 20,
    highlight_full_fields: 'fullName,headline,bio',
  };
}
