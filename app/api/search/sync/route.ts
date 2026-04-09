import { adminDb } from '@/lib/firebase/admin';
import typesenseClient, { PROFILES_SCHEMA } from '@/lib/search/typesense';
import { toTypesenseDoc } from '@/lib/shared-utils';

const TYPESENSE_CONFIGURED =
  process.env.TYPESENSE_HOST &&
  process.env.TYPESENSE_API_KEY &&
  process.env.TYPESENSE_API_KEY !== 'xyz';

/** POST /api/search/sync — Sync Firestore profiles to Typesense index.
 *  Protected by a secret token in the Authorization header.
 */
export async function POST(request: Request) {
  // Verify sync token
  const authHeader = request.headers.get('authorization');
  const syncToken = process.env.SEARCH_SYNC_TOKEN;
  if (!syncToken || authHeader !== `Bearer ${syncToken}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!TYPESENSE_CONFIGURED) {
    return Response.json({ error: 'Typesense not configured' }, { status: 503 });
  }

  try {
    // Ensure collection exists
    try {
      await typesenseClient.collections('profiles').retrieve();
    } catch {
      await typesenseClient.collections().create(PROFILES_SCHEMA);
    }

    // Fetch all profiles from Firestore
    const snapshot = await adminDb.collection('profiles').get();
    const documents = snapshot.docs.map((doc) => toTypesenseDoc(doc.id, doc.data()));

    if (documents.length === 0) {
      return Response.json({ synced: 0, message: 'No profiles to sync' });
    }

    // Upsert all documents (import with action=upsert)
    const results = await typesenseClient
      .collections('profiles')
      .documents()
      .import(documents, { action: 'upsert' });

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);

    return Response.json({
      synced: succeeded,
      failed: failed.length,
      errors: failed.slice(0, 5).map((r) => r.error),
    });
  } catch (error) {
    console.error('Typesense sync error:', error);
    return Response.json({ error: 'Sync failed' }, { status: 500 });
  }
}
