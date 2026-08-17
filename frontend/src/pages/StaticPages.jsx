import { useState } from 'react';
import { Truck, Wrench, Ruler, RefreshCw, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Container } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Field.jsx';
import { useToast } from '../context/ToastProvider.jsx';

export const About = () => (
  <Container className="max-w-3xl py-16 lg:py-24">
    <p className="eyebrow">About us</p>
    <h1 className="mt-3 text-display-md">Furniture worth keeping</h1>

    <div className="prose prose-stone mt-10 max-w-none prose-headings:font-sans prose-headings:text-lg prose-headings:tracking-tight prose-p:font-light prose-p:leading-relaxed">
      <p className="text-lg">
        Furniworld sells furniture for Kenyan homes and offices — sofas, dining
        sets, centre tables, TV units and workspace pieces, priced in shillings
        and delivered across all forty-seven counties.
      </p>

      <h2>What we care about</h2>
      <p>
        Most furniture is bought once and lived with for a decade. That shapes what
        we stock: seasoned hardwood frames rather than softwood, sinuous springs
        rather than webbing, sealed stone tops rather than raw marble that stains
        the first time someone puts down a glass of wine.
      </p>
      <p>
        Every listing shows the piece as it actually is. The photographs are of the
        item you will receive, and the dimensions are measured rather than
        estimated, because a sofa that does not fit through a doorway is nobody's
        idea of a good purchase.
      </p>

      <h2>Where we are</h2>
      <p>
        Our showroom sits on Mombasa Road in Nairobi, and it is worth the trip if
        you are choosing between two pieces — a marble top reads very differently
        in person than on a screen.
      </p>

      <h2>A note on this site</h2>
      <p>
        Furniworld is a portfolio project. The catalogue reflects real furniture at
        real Kenyan retail prices, but payments are simulated and no order placed
        here is fulfilled.
      </p>
    </div>
  </Container>
);

const SERVICES = [
  {
    icon: Truck,
    title: 'Countrywide delivery',
    body: 'Same-day within Nairobi on orders placed before noon, next day across Kiambu, Machakos and Kajiado, and two to four working days upcountry. Free on orders over KES 150,000.',
  },
  {
    icon: Wrench,
    title: 'Assembly on arrival',
    body: 'Anything that ships flat-packed is assembled in the room it belongs in, by the delivery team, at no extra charge. Packaging leaves with them.',
  },
  {
    icon: Ruler,
    title: 'Space planning',
    body: 'Send us the dimensions of your room and we will tell you honestly whether the piece you are looking at fits, and what to consider instead if it does not.',
  },
  {
    icon: RefreshCw,
    title: 'Warranty and repairs',
    body: 'Two years on frames, mechanisms and finishes for major pieces. Recliner mechanisms and sofa springs are repaired rather than replaced wherever possible.',
  },
];

export const Services = () => (
  <Container className="py-16 lg:py-24">
    <p className="eyebrow">Services</p>
    <h1 className="mt-3 text-display-md">What comes with the furniture</h1>
    <p className="mt-4 max-w-xl leading-relaxed text-dark-600">
      Delivery, assembly and after-sales are part of the price, not extras bolted
      on at checkout.
    </p>
    <div className="mt-14 grid gap-10 md:grid-cols-2">
      {SERVICES.map(({ icon: Icon, title, body }) => (
        <div
          key={title}
          className="space-y-4 border border-dark-200 bg-white/40 p-8">
          <Icon className="h-6 w-6 text-primary-700" />
          <h3 className="text-lg">{title}</h3>
          <p className="text-sm leading-relaxed text-dark-600">{body}</p>
        </div>
      ))}
    </div>
  </Container>
);

export const Contact = () => {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    // No message endpoint exists — this is a portfolio project, and pretending to
    // deliver mail would be worse than saying so.
    toast.success('Thanks — this demo does not send mail, but the form works');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <Container className="py-16 lg:py-24">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 text-display-md">Talk to us</h1>
          <p className="mt-4 max-w-md leading-relaxed text-dark-600">
            Questions about a piece, a delivery date or a room that needs planning
            — the showroom team answers directly.
          </p>

          <dl className="mt-10 space-y-6">
            {[
              [MapPin, 'Showroom', 'Mombasa Road, Nairobi'],
              [Phone, 'Phone', '+254 700 000 000'],
              [Mail, 'Email', 'hello@furniworld.ke'],
              [Clock, 'Open', 'Mon–Sat, 8:30am – 6:00pm'],
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex items-start gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.12em] text-dark-500">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm text-dark-800">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <form
          onSubmit={submit}
          className="space-y-5 border border-dark-200 bg-white/50 p-8">
          <h2 className="font-sans text-sm font-medium uppercase tracking-[0.16em]">
            Send a message
          </h2>
          <Input
            label="Your name"
            required
            value={form.name}
            onChange={set('name')}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={set('email')}
          />
          <Textarea
            label="Message"
            required
            rows={5}
            value={form.message}
            onChange={set('message')}
          />
          <Button type="submit" size="lg" className="w-full">
            Send message
          </Button>
          <p className="text-xs text-dark-500">
            This is a portfolio project — the form validates but does not deliver
            mail.
          </p>
        </form>
      </div>
    </Container>
  );
};
