import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Wrench, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Container, SectionHeading } from '../ui/Feedback.jsx';
import Button from '../ui/Button.jsx';
import { CATEGORIES } from '../../constants/catalog.js';
import { assetUrl } from '../../lib/images.js';
import { subscribersApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useAuth } from '../../context/AuthProvider.jsx';

const VALUES = [
  {
    icon: Truck,
    title: 'Countrywide delivery',
    body: 'Same day in Nairobi, next day across the metro, two to four days upcountry.',
  },
  {
    icon: ShieldCheck,
    title: 'Two-year warranty',
    body: 'Frames, mechanisms and finishes covered on every major piece we sell.',
  },
  {
    icon: Wrench,
    title: 'Assembly included',
    body: 'Flat-packed items are put together in your room at no extra charge.',
  },
  {
    icon: Sparkles,
    title: 'Real photography',
    body: 'Every listing shows the actual piece, not a rendered stand-in.',
  },
];

export const ValueProps = () => (
  <section className="border-b border-dark-200 bg-primary-50/60">
    <Container className="py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="space-y-3">
            <Icon className="h-5 w-5 text-primary-700" />
            <h3 className="text-sm uppercase tracking-[0.12em]">{title}</h3>
            <p className="text-sm leading-relaxed text-dark-600">{body}</p>
          </div>
        ))}
      </div>
    </Container>
  </section>
);

export const CategoryTiles = ({ facets }) => {
  const countFor = (slug) =>
    (facets?.categories ?? [])
      .filter((facet) => facet.category === slug)
      .reduce((sum, facet) => sum + facet.count, 0);

  return (
    <Container className="py-20">
      <SectionHeading
        eyebrow="Shop by room"
        title="Start where you need it"
        description="Four rooms, each with the pieces that actually belong in them."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            to={`/shop/${category.slug}`}
            className="group flex flex-col justify-between border border-dark-200 bg-white/40 p-7 transition-colors duration-300 ease-premium hover:border-primary-300 hover:bg-primary-50">
            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-semibold text-primary-950">
                {category.label}
              </h3>
              <p className="text-sm leading-relaxed text-dark-600">
                {category.blurb}
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-dark-400">
                {countFor(category.slug) || '—'} pieces
              </span>
              <ArrowRight className="h-4 w-4 text-primary-700 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
};

export const EditorialSplit = ({ product }) => (
  <section className="bg-primary-950 text-cream">
    <div className="grid lg:grid-cols-2">
      <div className="aspect-[4/3] lg:aspect-auto">
        {product ? (
          <img
            src={assetUrl(product.images?.[0]?.url)}
            alt={product.images?.[0]?.alt || product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="skeleton h-full min-h-[320px] w-full" />
        )}
      </div>
      <div className="flex items-center px-8 py-16 lg:px-16">
        <div className="max-w-md space-y-6">
          <p className="text-xs uppercase tracking-[0.18em] text-primary-300">
            The marble collection
          </p>
          <h2 className="text-display-sm text-cream lg:text-4xl">
            Stone tops, properly sealed
          </h2>
          <p className="leading-relaxed text-primary-200/85">
            An untreated marble top picks up a ring from the first glass of wine.
            Every stone surface we sell is sealed before it leaves the workshop, so
            the veining you choose is the veining you keep.
          </p>
          <Button to="/shop?search=marble" variant="outline" className="border-cream text-cream hover:bg-cream hover:text-primary-950">
            Browse marble pieces
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export const Newsletter = () => {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [error, setError] = useState('');

  // Signed in, this writes the same `newsletterOptIn` flag the account page's
  // toggle does, and mails the account's own address — never a typed-in one a
  // signed-in visitor didn't mean to use.
  const submit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const { data } = await subscribersApi.subscribe(email);
      if (user) setUser({ ...user, newsletterOptIn: data.newsletterOptIn });
      setStatus('done');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('idle');
    }
  };

  const alreadySubscribed = user?.newsletterOptIn;

  return (
    <Container className="py-20">
      <div className="border border-dark-200 bg-white/50 px-8 py-14 text-center lg:px-16">
        <p className="eyebrow">Stay in touch</p>
        <h2 className="mx-auto mt-3 max-w-xl text-display-sm lg:text-4xl">
          New arrivals, and the sales worth knowing about
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-dark-600">
          One email a month. Nothing else, and no sharing your address with anyone.
        </p>

        {alreadySubscribed || status === 'done' ? (
          <p className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 text-sm text-primary-800">
            <Check className="h-4 w-4" />
            {alreadySubscribed
              ? "You're already on the list."
              : "You're on the list — thanks for signing up."}
            {user && (
              <Link to="/account/profile" className="underline">
                Manage
              </Link>
            )}
          </p>
        ) : user ? (
          <form onSubmit={submit} className="mx-auto mt-8 max-w-md">
            <p className="mb-3 text-xs text-dark-500">
              We'll use the email on your account, {user.email}.
            </p>
            <Button type="submit" size="lg" loading={status === 'loading'}>
              Subscribe
            </Button>
          </form>
        ) : (
          <form
            onSubmit={submit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-12 flex-1 border-dark-300 bg-white text-sm focus:border-primary-600 focus:ring-0"
            />
            <Button type="submit" size="lg" loading={status === 'loading'}>
              Subscribe
            </Button>
          </form>
        )}
        {error && <p className="mt-3 text-xs text-danger-600">{error}</p>}
      </div>
    </Container>
  );
};
