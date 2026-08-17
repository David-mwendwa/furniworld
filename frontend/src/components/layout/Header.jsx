import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X, LayoutDashboard } from 'lucide-react';
import Logo from './Logo.jsx';
import { Container } from '../ui/Feedback.jsx';
import { CATEGORIES } from '../../constants/catalog.js';
import { useCart } from '../../context/CartProvider.jsx';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useScrolled } from '../../hooks/useScrolled.js';
import { cn } from '../../lib/cn.js';

const Header = () => {
  const scrolled = useScrolled();
  const { itemCount, openCart } = useCart();
  const { isAuthenticated, isAdmin, user } = useAuth();
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

            {isAdmin && (
              <Link
                to="/admin"
                aria-label="Admin dashboard"
                className="hidden h-10 w-10 items-center justify-center text-dark-600 transition-colors hover:text-primary-800 lg:flex">
                <LayoutDashboard className="h-[18px] w-[18px]" />
              </Link>
            )}

            <Link
              to={isAuthenticated ? '/account' : '/login'}
              aria-label={isAuthenticated ? 'Your account' : 'Sign in'}
              className="flex h-10 items-center gap-2 px-2 text-dark-600 transition-colors hover:text-primary-800">
              <User className="h-[18px] w-[18px]" />
              <span className="hidden text-xs font-medium uppercase tracking-[0.14em] xl:inline">
                {isAuthenticated ? user.name.split(' ')[0] : 'Sign in'}
              </span>
            </Link>

            <button
              onClick={openCart}
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
              className="relative flex h-10 w-10 items-center justify-center text-dark-600 transition-colors hover:text-primary-800">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-800 px-1 text-[0.6rem] font-medium text-cream">
                  {itemCount}
                </span>
              )}
            </button>

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
              {isAdmin && (
                <Link to="/admin" className="block py-3 text-sm text-dark-500">
                  Admin dashboard
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
