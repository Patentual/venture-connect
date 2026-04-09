'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getCurrentUser } from '@/app/actions/auth';

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  authenticated: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AUTH_CACHE_KEY = 'vn_auth_cache';
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    const { user, ts } = JSON.parse(raw);
    if (Date.now() - ts > AUTH_CACHE_TTL) return null;
    return user;
  } catch {
    return null;
  }
}

function setCachedUser(user: AuthUser | null) {
  try {
    sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ user, ts: Date.now() }));
  } catch {}
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
      setCachedUser(u);
    } catch {
      setUser(null);
      setCachedUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    // Use cached auth state immediately to avoid blocking render
    const cached = getCachedUser();
    if (cached) {
      setUser(cached);
      setLoading(false);
      // Background refresh to keep cache fresh
      refresh();
    } else {
      refresh();
    }
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
