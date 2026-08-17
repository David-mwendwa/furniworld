import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { Container } from '../../components/ui/Feedback.jsx';
import { cn } from '../../lib/cn.js';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
];

const AdminLayout = () => (
  <Container className="py-10 lg:py-14">
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-dark-500 hover:text-primary-800">
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to shop
    </Link>

    <div className="mt-8 grid gap-10 lg:grid-cols-[210px_1fr] lg:gap-14">
      <nav className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:h-fit">
        <p className="eyebrow mb-4 hidden lg:block">Staff area</p>
        <ul className="flex gap-1 overflow-x-auto border-b border-dark-200 pb-1 hide-scrollbar lg:flex-col lg:border-0 lg:pb-0">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
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
        </ul>
      </nav>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  </Container>
);

export default AdminLayout;
