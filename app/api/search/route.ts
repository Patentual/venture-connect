import typesenseClient, { buildSearchParams } from '@/lib/search/typesense';
import type { SearchParams } from '@/lib/search/typesense';
import { adminDb } from '@/lib/firebase/admin';

/** Search Firestore profiles as fallback when Typesense is not configured. */
async function searchFirestoreProfiles(params: SearchParams) {
  const snapshot = await adminDb.collection('profiles').orderBy('updatedAt', 'desc').limit(50).get();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results: any[] = snapshot.docs.map((d) => d.data());

  // Text search
  if (params.query && params.query !== '*') {
    const q = params.query.toLowerCase();
    results = results.filter(
      (p) =>
        (p.fullName || '').toLowerCase().includes(q) ||
        (p.headline || '').toLowerCase().includes(q) ||
        (p.skills || []).some((s: string) => s.toLowerCase().includes(q)) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.country || '').toLowerCase().includes(q)
    );
  }

  // Filters
  if (params.skills?.length) {
    results = results.filter((p) =>
      params.skills!.some((s) => (p.skills || []).map((sk: string) => sk.toLowerCase()).includes(s.toLowerCase()))
    );
  }
  if (params.industries?.length) {
    results = results.filter((p) =>
      params.industries!.some((ind) => (p.industries || []).map((i: string) => i.toLowerCase()).includes(ind.toLowerCase()))
    );
  }
  if (params.country) {
    results = results.filter((p) => (p.country || '').toLowerCase() === params.country!.toLowerCase());
  }
  if (params.city) {
    results = results.filter((p) => (p.city || '').toLowerCase().includes(params.city!.toLowerCase()));
  }
  if (params.availabilityStatus) {
    results = results.filter((p) => p.availabilityStatus === params.availabilityStatus);
  }
  if (params.isVerified !== undefined) {
    results = results.filter((p) => p.isVerified === params.isVerified);
  }
  if (params.yearsOfExperienceMin !== undefined) {
    results = results.filter((p) => (p.yearsOfExperience || 0) >= params.yearsOfExperienceMin!);
  }

  results.sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0));

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

    // Fallback: search Firestore profiles
    const results = await searchFirestoreProfiles(params);
    return Response.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
