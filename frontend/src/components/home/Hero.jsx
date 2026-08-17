import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Container } from '../ui/Feedback.jsx';
import Button from '../ui/Button.jsx';
import { assetUrl } from '../../lib/images.js';

const Hero = ({ product }) => (
  <section className="border-b border-dark-200">
    <Container className="py-14 lg:py-20">
      {/* Asymmetric 7/5 split: the copy gets the wider column, which reads as
          editorial rather than as a centred banner. */}
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-7 lg:col-span-7">
          <p className="eyebrow">Furniture for Kenyan homes</p>
          <h1 className="text-display-md text-balance lg:text-display-lg">
            Pieces built to stay
            <span className="block italic text-primary-700">in the family</span>
          </h1>
          <p className="max-w-lg text-lg font-light leading-relaxed text-dark-600">
            Sofas, dining sets, centre tables and office furniture — chosen for
            the way they wear over years, not just how they photograph. Delivered
            countrywide, priced in shillings.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button to="/shop" size="lg">
              Shop the collection
            </Button>
            <Link
              to="/shop?onSale=true"
              className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-primary-900">
              View the sale
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
            </Link>
          </div>

          <dl className="grid max-w-lg grid-cols-3 gap-6 border-t border-dark-200 pt-7">
            {[
              ['50+', 'pieces in stock'],
              ['47', 'counties served'],
              ['24 mo', 'warranty'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-heading text-3xl font-semibold text-primary-900">
                  {value}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-[0.12em] text-dark-500">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5">
          {product ? (
            <Link to={`/product/${product.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-primary-50">
                <img
                  src={assetUrl(product.images?.[0]?.url)}
                  alt={product.images?.[0]?.alt || product.name}
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-950/85 to-transparent p-6 pt-16">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-primary-200">
                    Featured this month
                  </p>
                  <p className="mt-1.5 font-heading text-2xl text-cream">
                    {product.name}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="skeleton aspect-[4/5] w-full" />
          )}
        </div>
      </div>
    </Container>
  </section>
);

export default Hero;
