import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ChevronDown,
  Package,
  Star,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useToast } from '../../context/ToastProvider.jsx';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import { cn } from '../../lib/cn.js';

/**
 * Everything account-shaped hangs off one header control, so there is exactly
 * one place a first-time visitor learns to look for "sign in" or "sign out" —
 * previously the header icon just linked straight to `/account`, and signing
 * out only existed as one tab among several inside that page, easy to miss.
 */
const AccountMenu = () => {
  const { isAuthenticated, isAdmin, user, loading, logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false), open);

  // logout() already navigates away — see the comment in AuthProvider.
  const signOut = async () => {
    setOpen(false);
    await logout();
    toast.success('Signed out');
  };

  // A refresh starts with `user` null while the session is still being
  // verified — showing "Sign in" during that beat, then swapping to the real
  // menu a moment later, reads as the app forgetting who's logged in.
  if (loading) return <div className="h-10 w-10" />;

  if (!isAuthenticated)
    return (
      <Link
        to="/login"
        className="flex h-10 items-center gap-2 px-2 text-dark-600 transition-colors hover:text-primary-800">
        <User className="h-[18px] w-[18px]" />
        <span className="text-xs font-medium uppercase tracking-[0.14em]">
          Sign in
        </span>
      </Link>
    );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-1.5 px-2 text-dark-600 transition-colors hover:text-primary-800">
        <User className="h-[18px] w-[18px]" />
        <span className="hidden text-xs font-medium uppercase tracking-[0.14em] xl:inline">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 animate-fade-in border border-dark-200 bg-white shadow-sm">
          <div className="border-b border-dark-200 px-4 py-3">
            <p className="truncate text-sm font-medium text-dark-900">{user.name}</p>
            <p className="truncate text-xs text-dark-500">{user.email}</p>
          </div>

          <div className="py-1.5">
            {!isAdmin && (
              <Link
                to="/account/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-primary-50 hover:text-primary-900">
                <Package className="h-4 w-4" />
                Orders
              </Link>
            )}
            <Link
              to="/account/reviews"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-primary-50 hover:text-primary-900">
              <Star className="h-4 w-4" />
              Reviews
            </Link>
            <Link
              to="/account/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-primary-50 hover:text-primary-900">
              <User className="h-4 w-4" />
              Profile
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 hover:bg-primary-50 hover:text-primary-900">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-dark-200 py-1.5">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-dark-500 hover:bg-danger-50 hover:text-danger-700">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
