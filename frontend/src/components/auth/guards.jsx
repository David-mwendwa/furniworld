import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider.jsx';
import { Spinner } from '../ui/Feedback.jsx';

const Waiting = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner className="h-6 w-6" />
  </div>
);

/** Query string and hash are kept, so a filtered or anchored view is restored too. */
const fullPath = (location) =>
  `${location.pathname}${location.search}${location.hash}`;

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Waiting />;

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: fullPath(location) }} />
  );
};

export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Waiting />;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: fullPath(location) }} />;

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

/**
 * Sends an already-authenticated visitor away from the sign-in pages, back to
 * whatever they were trying to reach.
 *
 * This guard owns the post-login destination rather than the login form: two of
 * them racing meant an admin signing in could land on the customer account page
 * instead of the dashboard, depending on which redirect committed first.
 */
export const GuestRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Waiting />;
  if (!isAuthenticated) return <Outlet />;

  const attempted = location.state?.from;

  // Only internal paths are honoured — a `from` of "https://elsewhere" or
  // "//elsewhere" arriving via history state would otherwise be an open redirect.
  const safe =
    typeof attempted === 'string' &&
    attempted.startsWith('/') &&
    !attempted.startsWith('//')
      ? attempted
      : null;

  return <Navigate to={safe ?? (isAdmin ? '/admin' : '/account')} replace />;
};
