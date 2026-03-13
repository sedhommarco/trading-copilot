/**
 * auth.tsx — AuthContext + Google Sign-In integration
 *
 * IMPORTANT: This sign-in is a client-side UX gate only.
 * It is NOT a security boundary. Any user can bypass it by
 * clearing localStorage. Real access control will be added
 * when a backend and subscription system are implemented.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  GoogleOAuthProvider,
  googleLogout,
  type CredentialResponse,
} from '@react-oauth/google';
import { Navigate, useLocation } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  googleEnabled: boolean;
  /** Called by <GoogleLogin onSuccess> to hydrate the user from the ID token. */
  handleGoogleSuccess: (response: CredentialResponse) => void;
  /** Legacy no-op kept for Header.tsx compatibility. */
  signInWithGoogle: () => void;
  signOut: () => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  googleEnabled: false,
  handleGoogleSuccess: () => {},
  signInWithGoogle: () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ─── Storage helpers ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tradingAdvisorAuth';

function loadPersistedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Decode a Google ID token (JWT) payload — client-side display only, NOT verified. */
function decodeIdToken(credential: string): Record<string, unknown> {
  try {
    const payload = credential.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

// ─── Provider with Google (must be inside GoogleOAuthProvider) ───────────────────────────────────────

function AuthProviderWithGoogle({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadPersistedUser);
  useEffect(() => { persistUser(user); }, [user]);

  /**
   * Called by <GoogleLogin onSuccess>.
   * The response carries a credential (ID token / JWT) —
   * we decode the payload client-side to extract display fields.
   */
  const handleGoogleSuccess = useCallback((response: CredentialResponse) => {
    if (!response.credential) return;
    const payload = decodeIdToken(response.credential);
    setUser({
      name: (payload.name as string) ?? 'User',
      email: (payload.email as string) ?? '',
      avatarUrl: payload.picture as string | undefined,
    });
  }, []);

  const signOut = useCallback(() => { googleLogout(); setUser(null); }, []);

  // No-op: <GoogleLogin /> drives the flow; kept for Header.tsx interface stability.
  const signInWithGoogle = useCallback(() => {}, []);

  return (
    <AuthContext.Provider
      value={{ user, googleEnabled: true, handleGoogleSuccess, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Provider without Google (no-op sign-in) ──────────────────────────────────────────────

function AuthProviderNoGoogle({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadPersistedUser);
  useEffect(() => { persistUser(user); }, [user]);

  const signOut = useCallback(() => { setUser(null); }, []);
  const handleGoogleSuccess = useCallback((_: CredentialResponse) => {
    console.warn('Google Sign-In not configured. Set VITE_GOOGLE_CLIENT_ID.');
  }, []);
  const signInWithGoogle = useCallback(() => {
    console.warn('Google Sign-In not configured. Set VITE_GOOGLE_CLIENT_ID.');
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, googleEnabled: false, handleGoogleSuccess, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Public AuthProvider ─────────────────────────────────────────────────────────────────────────

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function AuthProvider({ children }: { children: ReactNode }) {
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProviderWithGoogle>{children}</AuthProviderWithGoogle>
      </GoogleOAuthProvider>
    );
  }
  // No Google client ID configured — app still works, sign-in is disabled.
  return <AuthProviderNoGoogle>{children}</AuthProviderNoGoogle>;
}

// ─── RequireAuth guard ────────────────────────────────────────────────────────────────────

/**
 * RequireAuth is a client-side UX gate only.
 * It is NOT a security boundary — it purely redirects unauthenticated
 * visitors to the welcome page. Real protection requires a backend.
 */
export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}
