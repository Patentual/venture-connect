import { aiClient, IMAGE_MODEL, isAIConfigured } from '@/lib/ai/client';
import { adminDb, adminApp } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { getSession } from '@/lib/auth/session';

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

/**
 * POST /api/ai/pitch-deck/image
 * Generates a single DALL-E image for a pitch deck slide and persists it to
 * Firebase Storage. Updates the slide's imageUrl in Firestore.
 *
 * Body: { projectId, slideIndex, imagePrompt }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.twoFactorVerified) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAIConfigured()) {
      return Response.json({ error: 'AI not configured' }, { status: 500 });
    }

    const { projectId, slideIndex, imagePrompt } = await request.json();
    if (!projectId || slideIndex == null || !imagePrompt) {
      return Response.json({ error: 'projectId, slideIndex, and imagePrompt are required' }, { status: 400 });
    }

    // Verify membership
    const doc = await adminDb.collection('projects').doc(projectId).get();
    if (!doc.exists) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    const project = doc.data()!;
    const uid = session.userId;
    const isMember = project.creatorId === uid || (project.teamMemberIds || []).includes(uid);
    if (!isMember) {
      return Response.json({ error: 'Not a project member' }, { status: 403 });
    }

    // Generate image
    const response = await aiClient.images.generate({
      model: IMAGE_MODEL,
      prompt: `Professional pitch deck slide illustration: ${imagePrompt}. Style: clean, modern, minimalist corporate design with dark indigo/navy gradient background. No text or words in the image. High quality, 16:9 aspect ratio feel.`,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });

    const tempUrl = response.data?.[0]?.url;
    if (!tempUrl) {
      return Response.json({ error: 'Image generation failed' }, { status: 500 });
    }

    // Persist to Firebase Storage
    const imgResponse = await fetch(tempUrl);
    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    const bucket = getStorage(adminApp).bucket();
    const projectSlug = slugify(project.title || 'project');
    const filePath = `pitch-deck-images/${projectSlug}/slide-${slideIndex}-${Date.now()}.png`;
    const file = bucket.file(filePath);
    await file.save(buffer, { metadata: { contentType: 'image/png' } });
    await file.makePublic();
    const permanentUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Update the specific slide in Firestore
    const pitchDeck = project.pitchDeck;
    if (pitchDeck?.slides?.[slideIndex]) {
      pitchDeck.slides[slideIndex].imageUrl = permanentUrl;
      await adminDb.collection('projects').doc(projectId).update({ pitchDeck });
    }

    return Response.json({ imageUrl: permanentUrl });
  } catch (error: unknown) {
    console.error('Pitch deck image error:', error);
    return Response.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
