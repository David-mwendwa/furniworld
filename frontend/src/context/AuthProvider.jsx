import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect.js';
import { authApi } from '../api/index.js';
import { AUTH_EXPIRED_EVENT } from '../api/apiClient.js';
import {
  getToken,
  setToken,
  clearToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from '../lib/storage.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  /*
   * Restored from the last-known user so the navbar paints signed-in state
   * immediately on refresh instead of flashing "signed out" for the round trip
   * to `/auth/me` below. `loading` still gates anything that needs the verified
   * session (route guards, checkout) — this is display-only.
   *
   * Read in a layout effect rather than in the initialiser. Reading it during
   * render makes the first client render disagree with the prerendered HTML for
   * anyone with a session — the build renders signed-out, the browser renders
   * their name, and React throws away the server's markup for that subtree. A
   * layout effect runs before paint, so the flash the seeding exists to prevent
   * is still prevented.
   */
  const [user, setUser] = useState(null);

  useIsomorphicLayoutEffect(() => {
    if (getToken()) setUser(getStoredUser());
  }, []);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(({ data }) => {
        setUser(data.user);
        setStoredUser(data.user);
      })
      .catch(() => {
        clearToken();
        clearStoredUser();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Raised by the api client when a request comes back 401 on a route that
    // needed a live session.
    const handleExpiry = () => {
      setUser(null);
      clearStoredUser();
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiry);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiry);
  }, []);

  const adopt = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
    setStoredUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    async (credentials) => adopt((await authApi.login(credentials)).data),
    [adopt]
  );

  const register = useCallback(
    async (payload) => adopt((await authApi.register(payload)).data),
    [adopt]
  );

  const logout = useCallback(async () => {
    // Leave the current route before clearing the session, not after — a
    // protected route (e.g. an order detail page) re-renders the instant
    // `isAuthenticated` flips to false and issues its own redirect to
    // `/login` carrying `state: {from: <that route>}`. If that fires first,
    // whoever logs in next — a different account entirely — gets bounced
    // back into the page the previous session happened to be sitting on.
    navigate('/', { replace: true });
    try {
      await authApi.logout();
    } finally {
      clearToken();
      clearStoredUser();
      setUser(null);
    }
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      adopt,
      setUser,
    }),
    [user, loading, login, register, logout, adopt]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};
