// Firestore-backed user store — 'users' collection (keyed by email)

import { adminDb } from '@/lib/firebase/admin';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  totpSecret: string | null;
  totpEnabled: boolean;
  createdAt: string;
}

const usersCol = () => adminDb.collection('users');

// Minimal password hashing using Web Crypto (no bcrypt dep needed)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'vc-salt-2026');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
}): Promise<StoredUser | { error: string }> {
  const existing = await usersCol().doc(data.email).get();
  if (existing.exists) {
    return { error: 'Email already registered' };
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: data.email,
    name: data.name,
    passwordHash: await hashPassword(data.password),
    totpSecret: null,
    totpEnabled: false,
    createdAt: new Date().toISOString(),
  };

  await usersCol().doc(data.email).set(user);
  return user;
}

function docToUser(doc: FirebaseFirestore.DocumentSnapshot): StoredUser | null {
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    id: d.id,
    email: d.email,
    name: d.name,
    passwordHash: d.passwordHash,
    totpSecret: d.totpSecret ?? null,
    totpEnabled: d.totpEnabled ?? false,
    createdAt: d.createdAt,
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const doc = await usersCol().doc(email).get();
  return docToUser(doc);
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  const snapshot = await usersCol().where('id', '==', id).limit(1).get();
  if (snapshot.empty) return null;
  return docToUser(snapshot.docs[0]);
}

export async function enableTOTP(email: string, secret: string): Promise<boolean> {
  const doc = await usersCol().doc(email).get();
  if (!doc.exists) return false;
  await usersCol().doc(email).update({
    totpSecret: secret,
    totpEnabled: true,
  });
  return true;
}
