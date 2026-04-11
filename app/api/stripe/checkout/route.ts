import { getStripe, STRIPE_PRICES } from '@/lib/stripe';
import { getSession } from '@/lib/auth/session';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.twoFactorVerified) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier, interval } = await request.json();

    if (!tier || !interval) {
      return Response.json({ error: 'Missing tier or interval' }, { status: 400 });
    }

    const prices = STRIPE_PRICES[tier];
    if (!prices) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const priceId = interval === 'yearly' ? prices.yearly : prices.monthly;
    if (!priceId) {
      return Response.json(
        { error: `Stripe Price ID not configured for ${tier} (${interval}). Add STRIPE_PRICE_* env vars.` },
        { status: 500 }
      );
    }

    // Get or create Stripe customer
    const profileRef = adminDb.collection('profiles').doc(session.userId);
    const profileDoc = await profileRef.get();
    const profileData = profileDoc.data();

    let customerId = profileData?.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: profileData?.email || session.email || '',
        metadata: { firebaseUserId: session.userId },
      });
      customerId = customer.id;
      await profileRef.update({ stripeCustomerId: customerId });
    }

    // Determine the base URL
    const origin = request.headers.get('origin') || 'https://venturenex.com';

    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/billing?success=true`,
      cancel_url: `${origin}/dashboard/billing?cancelled=true`,
      subscription_data: {
        metadata: {
          firebaseUserId: session.userId,
          tier,
        },
      },
      metadata: {
        firebaseUserId: session.userId,
        tier,
      },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
