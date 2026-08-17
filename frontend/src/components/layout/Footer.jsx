import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo.jsx';
import { Container } from '../ui/Feedback.jsx';
import { CATEGORIES, SUBCATEGORY_LABELS } from '../../constants/catalog.js';

const POPULAR = ['sofas', 'coffee-tables', 'dining-sets', 'recliners', 'desks'];

const Footer = () => (
  <footer className="mt-24 bg-primary-950 text-primary-100">
    <Container className="py-16">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <Logo tone="light" />
          <p className="max-w-xs text-sm leading-relaxed text-primary-200/80">
            Furniture for Kenyan homes and offices — sofas, dining sets, centre
            tables and workspace pieces, delivered countrywide.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary-300">
            Shop by room
          </h3>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/shop/${category.slug}`}
                  className="text-primary-200/80 transition-colors hover:text-cream">
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary-300">
            Popular
          </h3>
          <ul className="space-y-2.5 text-sm">
            {POPULAR.map((slug) => (
              <li key={slug}>
                <Link
                  to={`/shop?subcategory=${slug}`}
                  className="text-primary-200/80 transition-colors hover:text-cream">
                  {SUBCATEGORY_LABELS[slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary-300">
            Visit us
          </h3>
          <ul className="space-y-3 text-sm text-primary-200/80">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
              <span>Mombasa Road, Nairobi</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
              <a href="tel:+254700000000" className="hover:text-cream">
                +254 700 000 000
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
              <a href="mailto:hello@furniworld.ke" className="hover:text-cream">
                hello@furniworld.ke
              </a>
            </li>
          </ul>
          <div className="mt-6 flex gap-4 text-xs">
            {['about', 'services', 'contact'].map((page) => (
              <Link
                key={page}
                to={`/${page}`}
                className="capitalize text-primary-300 transition-colors hover:text-cream">
                {page}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center gap-2 border-t border-primary-900 pt-8 text-xs text-primary-400 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Furniworld. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Developed by
          <a
            href="https://techdave.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary-300 transition-colors hover:text-cream">
            David
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true">
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </p>
      </div>
    </Container>
  </footer>
);

export default Footer;
