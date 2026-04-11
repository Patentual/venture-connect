import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth/session';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.twoFactorVerified) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileDoc = await adminDb.collection('profiles').doc(session.userId).get();
    const customerId = profileDoc.data()?.stripeCustomerId;

    if (!customerId) {
      return Response.json({ error: 'No Stripe customer found. Please subscribe first.' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'https://venturenex.com';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard/billing`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
