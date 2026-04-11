import { stripe, tierFromPriceId } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase/admin';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.firebaseUserId;
        const tier = session.metadata?.tier;
        if (userId && tier) {
          await adminDb.collection('profiles').doc(userId).update({
            subscriptionTier: tier,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            updatedAt: new Date().toISOString(),
          });
          console.log(`[Stripe] User ${userId} upgraded to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.firebaseUserId;
        if (!userId) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const newTier = priceId ? tierFromPriceId(priceId) : null;
        const status = subscription.status;

        if (status === 'active' && newTier) {
          await adminDb.collection('profiles').doc(userId).update({
            subscriptionTier: newTier,
            updatedAt: new Date().toISOString(),
          });
          console.log(`[Stripe] User ${userId} subscription updated to ${newTier}`);
        } else if (status === 'past_due' || status === 'unpaid') {
          console.log(`[Stripe] User ${userId} subscription ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.firebaseUserId;
        if (userId) {
          await adminDb.collection('profiles').doc(userId).update({
            subscriptionTier: 'free',
            stripeSubscriptionId: '',
            updatedAt: new Date().toISOString(),
          });
          console.log(`[Stripe] User ${userId} subscription cancelled, reverted to free`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.log(`[Stripe] Payment failed for customer ${customerId}`);
        break;
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
