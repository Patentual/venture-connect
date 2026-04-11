'use server';

import { adminDb } from '@/lib/firebase/admin';

export async function subscribeNewsletter(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  try {
    const existing = await adminDb
      .collection('newsletter_subscribers')
      .where('email', '==', email.toLowerCase().trim())
      .limit(1)
      .get();

    if (!existing.empty) {
      return { success: true, message: 'You are already subscribed!' };
    }

    await adminDb.collection('newsletter_subscribers').add({
      email: email.toLowerCase().trim(),
      subscribedAt: new Date().toISOString(),
      source: 'website',
    });

    return { success: true, message: 'Subscribed successfully!' };
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
