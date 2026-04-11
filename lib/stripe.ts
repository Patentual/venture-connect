import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Map subscription tiers to Stripe Price IDs.
 * Create these products/prices in your Stripe Dashboard first,
 * then paste the price IDs here.
 *
 * To create them:
 * 1. Go to Stripe Dashboard → Products
 * 2. Create a product for each tier
 * 3. Add monthly + yearly prices
 * 4. Copy the price_xxx IDs below
 */
export const STRIPE_PRICES: Record<string, { monthly: string; yearly: string }> = {
  professional: {
    monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || '',
  },
  creator: {
    monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_CREATOR_YEARLY || '',
  },
  talentSourcing: {
    monthly: process.env.STRIPE_PRICE_TALENT_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_TALENT_YEARLY || '',
  },
};

/** Reverse-lookup: given a Stripe Price ID, return the tier name. */
export function tierFromPriceId(priceId: string): string | null {
  for (const [tier, prices] of Object.entries(STRIPE_PRICES)) {
    if (prices.monthly === priceId || prices.yearly === priceId) {
      return tier;
    }
  }
  return null;
}
