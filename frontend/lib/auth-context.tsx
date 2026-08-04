'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEMO_MODE } from './demo';
import { authApi } from './api';
import { clearApiKey, getApiKey, setApiKey } from './session';

interface AuthContextValue {
  unlocked: boolean;
  loading: boolean;
  error: string | null;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(DEMO_MODE);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) return;
    const stored = getApiKey();
    if (!stored) {
      setLoading(false);
      return;
    }
    authApi.verify(stored).then((ok) => {
      if (!ok) clearApiKey();
      setUnlocked(ok);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      unlocked,
      loading,
      error,
      async login(password: string) {
        if (DEMO_MODE) return;
        setError(null);
        const ok = await authApi.verify(password);
        if (ok) {
          setApiKey(password);
          setUnlocked(true);
        } else {
          setError('Incorrect password — check the API_KEY value with whoever set up the backend.');
        }
      },
      logout() {
        clearApiKey();
        setUnlocked(false);
      },
    }),
    [unlocked, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
