import typesenseClient, { buildSearchParams } from '@/lib/search/typesense';
import type { SearchParams } from '@/lib/search/typesense';

// Mock profiles for when Typesense is not configured
const MOCK_PROFILES = [
  { id: '1', fullName: 'Sarah Chen', headline: 'Full-Stack Engineer · React & Node.js', skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'AWS'], industries: ['Technology', 'Healthcare'], country: 'Australia', city: 'Sydney', availabilityStatus: 'available', yearsOfExperience: 8, reputationScore: 4.8, isVerified: true, accountType: 'individual', subscriptionTier: 'professional', languages: ['English', 'Mandarin'], rateMin: 120, rateMax: 180, rateCurrency: 'AUD' },
  { id: '2', fullName: 'Marcus Rivera', headline: 'UX Designer · Product Strategy', skills: ['Figma', 'User Research', 'Design Systems', 'Prototyping'], industries: ['Technology', 'Finance'], country: 'United States', city: 'San Francisco', availabilityStatus: 'available', yearsOfExperience: 6, reputationScore: 4.6, isVerified: true, accountType: 'individual', subscriptionTier: 'creator', languages: ['English', 'Spanish'], rateMin: 100, rateMax: 150, rateCurrency: 'USD' },
  { id: '3', fullName: 'Aiko Tanaka', headline: 'ML Engineer · Computer Vision & NLP', skills: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI API', 'Data Pipelines'], industries: ['Technology', 'Healthcare', 'Research'], country: 'Japan', city: 'Tokyo', availabilityStatus: 'available_from', yearsOfExperience: 5, reputationScore: 4.7, isVerified: true, accountType: 'individual', subscriptionTier: 'professional', languages: ['Japanese', 'English'], rateMin: 140, rateMax: 200, rateCurrency: 'USD' },
  { id: '4', fullName: 'Priya Sharma', headline: 'Cloud Architect · AWS & GCP', skills: ['AWS', 'GCP', 'Kubernetes', 'Terraform', 'Docker'], industries: ['Technology', 'Finance', 'Government'], country: 'India', city: 'Bangalore', availabilityStatus: 'available', yearsOfExperience: 10, reputationScore: 4.9, isVerified: true, accountType: 'individual', subscriptionTier: 'creator', languages: ['English', 'Hindi', 'Kannada'], rateMin: 80, rateMax: 130, rateCurrency: 'USD' },
  { id: '5', fullName: 'Oliver Müller', headline: 'DevOps Engineer · CI/CD & Monitoring', skills: ['Docker', 'Kubernetes', 'GitHub Actions', 'Datadog', 'Terraform'], industries: ['Technology', 'Automotive'], country: 'Germany', city: 'Berlin', availabilityStatus: 'unavailable', yearsOfExperience: 7, reputationScore: 4.5, isVerified: false, accountType: 'individual', subscriptionTier: 'professional', languages: ['German', 'English'], rateMin: 110, rateMax: 160, rateCurrency: 'EUR' },
  { id: '6', fullName: 'Elena Costa', headline: 'Product Manager · B2B SaaS', skills: ['Product Strategy', 'Agile', 'User Research', 'SQL', 'Jira'], industries: ['Technology', 'E-commerce'], country: 'Brazil', city: 'São Paulo', availabilityStatus: 'available', yearsOfExperience: 9, reputationScore: 4.7, isVerified: true, accountType: 'individual', subscriptionTier: 'professional', languages: ['Portuguese', 'English', 'Spanish'], rateMin: 90, rateMax: 140, rateCurrency: 'USD' },
  { id: '7', fullName: 'James O\'Brien', headline: 'Security Engineer · Penetration Testing', skills: ['Security', 'OWASP', 'AWS', 'Python', 'Compliance'], industries: ['Finance', 'Healthcare', 'Government'], country: 'United Kingdom', city: 'London', availabilityStatus: 'available_from', yearsOfExperience: 12, reputationScore: 4.9, isVerified: true, accountType: 'individual', subscriptionTier: 'creator', languages: ['English'], rateMin: 150, rateMax: 220, rateCurrency: 'GBP' },
  { id: '8', fullName: 'Fatima Al-Hassan', headline: 'Mobile Developer · iOS & Flutter', skills: ['Swift', 'Flutter', 'Firebase', 'GraphQL', 'CI/CD'], industries: ['Technology', 'Education', 'Healthcare'], country: 'UAE', city: 'Dubai', availabilityStatus: 'available', yearsOfExperience: 4, reputationScore: 4.4, isVerified: false, accountType: 'individual', subscriptionTier: 'free', languages: ['Arabic', 'English'], rateMin: 70, rateMax: 110, rateCurrency: 'USD' },
];

function searchMockProfiles(params: SearchParams) {
  let results = [...MOCK_PROFILES];

  // Text search
  if (params.query && params.query !== '*') {
    const q = params.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.country && p.country.toLowerCase().includes(q))
    );
  }

  // Filters
  if (params.skills?.length) {
    results = results.filter((p) =>
      params.skills!.some((s) => p.skills.map((sk) => sk.toLowerCase()).includes(s.toLowerCase()))
    );
  }
  if (params.industries?.length) {
    results = results.filter((p) =>
      params.industries!.some((ind) => p.industries.map((i) => i.toLowerCase()).includes(ind.toLowerCase()))
    );
  }
  if (params.country) {
    results = results.filter((p) => p.country.toLowerCase() === params.country!.toLowerCase());
  }
  if (params.city) {
    results = results.filter((p) => p.city?.toLowerCase().includes(params.city!.toLowerCase()));
  }
  if (params.availabilityStatus) {
    results = results.filter((p) => p.availabilityStatus === params.availabilityStatus);
  }
  if (params.isVerified !== undefined) {
    results = results.filter((p) => p.isVerified === params.isVerified);
  }
  if (params.yearsOfExperienceMin !== undefined) {
    results = results.filter((p) => p.yearsOfExperience >= params.yearsOfExperienceMin!);
  }

  // Sort
  results.sort((a, b) => b.reputationScore - a.reputationScore);

  const page = params.page || 1;
  const perPage = params.perPage || 20;
  const start = (page - 1) * perPage;

  return {
    found: results.length,
    hits: results.slice(start, start + perPage).map((p) => ({
      document: p,
      highlights: [],
    })),
    page,
  };
}

export async function POST(request: Request) {
  try {
    const params: SearchParams = await request.json();

    // If Typesense is configured, use it
    const isTypesenseConfigured =
      process.env.TYPESENSE_API_KEY &&
      process.env.TYPESENSE_API_KEY !== 'xyz' &&
      process.env.TYPESENSE_HOST;

    if (isTypesenseConfigured) {
      try {
        const searchParams = buildSearchParams(params);
        const results = await typesenseClient
          .collections('profiles')
          .documents()
          .search(searchParams);

        return Response.json({
          found: results.found,
          hits: results.hits || [],
          page: results.page,
        });
      } catch (tsError) {
        console.error('Typesense search failed, falling back to mock:', tsError);
        // Fall through to mock
      }
    }

    // Fallback: search mock profiles
    const results = searchMockProfiles(params);
    return Response.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
