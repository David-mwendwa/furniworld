import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider.jsx';
import { Spinner } from '../ui/Feedback.jsx';

const Waiting = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner className="h-6 w-6" />
  </div>
);

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Waiting />;

  // The attempted path travels with the redirect so login can return the user
  // to where they were heading.
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Waiting />;
  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

/**
 * Sends an already-authenticated visitor away from the sign-in pages.
 *
 * This guard owns the post-login destination rather than the login form, because
 * two of them racing meant an admin signing in could land on the customer
 * account page instead of the dashboard, depending on which redirect committed
 * first.
 */
export const GuestRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Waiting />;
  if (!isAuthenticated) return <Outlet />;

  const attempted = location.state?.from?.pathname;
  return (
    <Navigate to={attempted ?? (isAdmin ? '/admin' : '/account')} replace />
  );
};
