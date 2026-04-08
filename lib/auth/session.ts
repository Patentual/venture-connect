import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || 'venture-connect-dev-secret-change-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  twoFactorVerified: boolean;
  expiresAt: Date;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      twoFactorVerified: payload.twoFactorVerified as boolean,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return null;
  }
}

export async function createSession(user: {
  id: string;
  email: string;
  name: string;
  twoFactorVerified: boolean;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({
    userId: user.id,
    email: user.email,
    name: user.name,
    twoFactorVerified: user.twoFactorVerified,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  return decrypt(session);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
