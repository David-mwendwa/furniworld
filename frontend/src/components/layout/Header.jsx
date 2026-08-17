import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X, LayoutDashboard, LogOut } from 'lucide-react';
import Logo from './Logo.jsx';
import AccountMenu from './AccountMenu.jsx';
import { Container } from '../ui/Feedback.jsx';
import { CATEGORIES } from '../../constants/catalog.js';
import { useCart } from '../../context/CartProvider.jsx';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useToast } from '../../context/ToastProvider.jsx';
import { useScrolled } from '../../hooks/useScrolled.js';
import { cn } from '../../lib/cn.js';

const Header = () => {
  const scrolled = useScrolled();
  const { itemCount, loading: cartLoading, openCart } = useCart();
  const { isAuthenticated, isAdmin, user, loading: authLoading, logout } = useAuth();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!term.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(term.trim())}`);
    setTerm('');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-cream/85 backdrop-blur-md transition-shadow duration-300',
        scrolled ? 'border-b border-dark-200' : 'border-b border-transparent'
      )}>
      <Container>
        <div className="flex h-[var(--header-h)] items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden items-center gap-8 lg:flex">
              {CATEGORIES.map((category) => (
                <NavLink
                  key={category.slug}
                  to={`/shop/${category.slug}`}
                  className={({ isActive }) =>
                    cn(
                      'text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200',
                      isActive
                        ? 'text-primary-900'
                        : 'text-dark-500 hover:text-primary-800'
                    )
                  }>
                  {category.label}
                </NavLink>
              ))}
              <NavLink
                to="/shop"
                end
                className={({ isActive }) =>
                  cn(
                    'text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200',
                    isActive ? 'text-primary-900' : 'text-dark-500 hover:text-primary-800'
                  )
                }>
                All
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <form onSubmit={submitSearch} className="hidden lg:block">
              <div
                className={cn(
                  'flex items-center overflow-hidden border transition-all duration-300 ease-premium',
                  searchOpen || term
                    ? 'w-56 border-dark-300 bg-white/70 px-3'
                    : 'w-10 border-transparent'
                )}>
                <button
                  type={searchOpen || term ? 'submit' : 'button'}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search products"
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-dark-600 hover:text-primary-800">
                  <Search className="h-[18px] w-[18px]" />
                </button>
                <input
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  onBlur={() => !term && setSearchOpen(false)}
                  placeholder="Search furniture"
                  className={cn(
                    'h-10 w-full border-0 bg-transparent p-0 text-sm placeholder:text-dark-400 focus:ring-0',
                    !searchOpen && !term && 'pointer-events-none opacity-0'
                  )}
                />
              </div>
            </form>

            {!authLoading && isAdmin && (
              <Link
                to="/admin"
                aria-label="Dashboard"
                className="hidden h-10 w-10 items-center justify-center text-dark-600 transition-colors hover:text-primary-800 lg:flex">
                <LayoutDashboard className="h-[18px] w-[18px]" />
              </Link>
            )}

            <AccountMenu />

            {/* Orders are a shopper action — an admin runs the store, not the
                cart, so there is nothing here for that account to open. */}
            {!isAdmin && (
              <button
                onClick={openCart}
                aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
                className="relative flex h-10 w-10 items-center justify-center text-dark-600 transition-colors hover:text-primary-800">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {!cartLoading && itemCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-800 px-1 text-[0.6rem] font-medium text-cream">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center text-dark-600 lg:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {menuOpen && (
        <div className="animate-fade-in border-t border-dark-200 bg-cream lg:hidden">
          <Container className="space-y-1 py-5">
            {authLoading ? null : isAuthenticated ? (
              <div className="mb-4 flex items-center justify-between gap-3 border border-dark-200 bg-white/60 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-dark-900">
                    Hello, {user.name.split(' ')[0]}
                  </p>
                  <Link
                    to="/account/orders"
                    className="text-xs text-primary-800 underline underline-offset-2">
                    View your orders
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    // logout() already navigates away — see AuthProvider.
                    await logout();
                    toast.success('Signed out');
                  }}
                  className="flex shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-dark-500 hover:text-danger-600">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mb-4 flex gap-2">
                <Link
                  to="/login"
                  className="flex flex-1 items-center justify-center gap-2 border border-primary-800 bg-primary-800 py-3 text-xs font-medium uppercase tracking-[0.12em] text-cream">
                  <User className="h-4 w-4" />
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex flex-1 items-center justify-center py-3 text-xs font-medium uppercase tracking-[0.12em] text-primary-900 border border-primary-800">
                  Create account
                </Link>
              </div>
            )}

            <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2">
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Search furniture"
                className="h-11 w-full border-dark-300 bg-white/70 text-sm focus:border-primary-600 focus:ring-0"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary-800 text-cream">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to={`/shop/${category.slug}`}
                className="block py-3 text-sm uppercase tracking-[0.14em] text-dark-700">
                {category.label}
              </Link>
            ))}
            <Link
              to="/shop"
              className="block py-3 text-sm uppercase tracking-[0.14em] text-dark-700">
              All furniture
            </Link>
            <div className="mt-2 border-t border-dark-200 pt-2">
              {['about', 'services', 'contact'].map((page) => (
                <Link
                  key={page}
                  to={`/${page}`}
                  className="block py-3 text-sm capitalize text-dark-500">
                  {page}
                </Link>
              ))}
              {!authLoading && isAdmin && (
                <Link to="/admin" className="block py-3 text-sm text-dark-500">
                  Dashboard
                </Link>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};

export default Header;
