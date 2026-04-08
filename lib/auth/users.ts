// In-memory mock user store — replace with Firestore in production

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  totpSecret: string | null;
  totpEnabled: boolean;
  createdAt: string;
}

// Simple in-memory store (resets on server restart)
const users = new Map<string, StoredUser>();

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
  if (users.has(data.email)) {
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

  users.set(data.email, user);
  return user;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const user = users.get(email);
  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export function getUserByEmail(email: string): StoredUser | null {
  return users.get(email) || null;
}

export function getUserById(id: string): StoredUser | null {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return null;
}

export function enableTOTP(email: string, secret: string): boolean {
  const user = users.get(email);
  if (!user) return false;
  user.totpSecret = secret;
  user.totpEnabled = true;
  return true;
}
