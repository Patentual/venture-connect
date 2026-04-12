import { NextResponse } from 'next/server';
import { adminDb, adminApp } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { aiClient, IMAGE_MODEL } from '@/lib/ai/client';

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

/**
 * POST /api/blog/fix-images
 * Re-generates cover images for blog posts that have broken/expired DALL-E URLs.
 * Protected by BLOG_GENERATE_SECRET.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('x-api-secret');
  if (authHeader !== process.env.BLOG_GENERATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snapshot = await adminDb.collection('blog_posts').get();
    let fixed = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const coverImage = data.coverImage || '';

      // Skip posts that already have Firebase Storage URLs
      if (coverImage.includes('storage.googleapis.com')) continue;

      // Skip posts with no cover image
      if (!coverImage && !data.title) continue;

      const title = data.title || 'Untitled';
      const category = data.category || 'Technology';

      try {
        const imgRes = await aiClient.images.generate({
          model: IMAGE_MODEL,
          prompt: `Modern, professional blog header illustration for an article titled "${title}" in the ${category} category. Abstract, clean, tech-inspired design with subtle gradients. No text or words in the image.`,
          n: 1,
          size: '1792x1024',
          quality: 'standard',
        });

        const tempUrl = imgRes.data?.[0]?.url;
        if (tempUrl) {
          const imgResponse = await fetch(tempUrl);
          const buffer = Buffer.from(await imgResponse.arrayBuffer());
          const bucket = getStorage(adminApp).bucket();
          const filePath = `blog-images/${slugify(title)}-${Date.now()}.png`;
          const file = bucket.file(filePath);
          await file.save(buffer, { metadata: { contentType: 'image/png' } });
          await file.makePublic();
          const permanentUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

          await doc.ref.update({ coverImage: permanentUrl });
          fixed++;
        }
      } catch (err) {
        console.error(`Failed to fix image for "${title}":`, err);
      }
    }

    return NextResponse.json({ success: true, fixed });
  } catch (error) {
    console.error('Fix blog images error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
