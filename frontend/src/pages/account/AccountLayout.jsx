import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, User, KeyRound, Star, LogOut } from 'lucide-react';
import { Container } from '../../components/ui/Feedback.jsx';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useToast } from '../../context/ToastProvider.jsx';
import { cn } from '../../lib/cn.js';

const LINKS = [
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/reviews', label: 'Reviews', icon: Star },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/password', label: 'Password', icon: KeyRound },
];

const AccountLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const signOut = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <Container className="py-10 lg:py-14">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-3 text-display-sm lg:text-4xl">
        Hello, {user?.name?.split(' ')[0]}
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[200px_1fr] lg:gap-16">
        <nav className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:h-fit">
          <ul className="flex gap-1 overflow-x-auto border-b border-dark-200 pb-1 hide-scrollbar lg:flex-col lg:border-0 lg:pb-0">
            {LINKS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'text-primary-900 lg:bg-primary-100'
                        : 'text-dark-500 hover:text-primary-800'
                    )
                  }>
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={signOut}
                className="flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm text-dark-500 transition-colors hover:text-danger-600">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </li>
          </ul>
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </Container>
  );
};

export default AccountLayout;
