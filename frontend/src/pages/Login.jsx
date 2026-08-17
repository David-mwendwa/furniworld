import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Field.jsx';
import { useAuth } from '../context/AuthProvider.jsx';
import { errorMessage } from '../api/apiClient.js';

// Kept in step with backend/scripts/seedDemo.js.
const DEMO_ACCOUNTS = [
  { label: 'Shopper', email: 'demo@furniworld.ke', password: 'demo12345' },
  { label: 'Admin', email: 'admin@furniworld.ke', password: 'admin12345' },
];

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      // GuestRoute redirects once the session exists, so this form does not
      // navigate itself — two redirects racing sent admins to the wrong page.
      await login(form);
    } catch (err) {
      setError(errorMessage(err, 'Could not sign you in'));
      setLoading(false);
    }
  };

  return (
    <Container className="flex max-w-md flex-col py-16 lg:py-24">
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-display-sm">Sign in</h1>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={form.password}
          onChange={set('password')}
        />

        {error && (
          <p className="border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-sm text-dark-500">
        <Link to="/forgot-password" className="underline hover:text-primary-800">
          Forgot your password?
        </Link>
        <p>
          New here?{' '}
          <Link to="/register" className="underline hover:text-primary-800">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-10 border border-dark-200 bg-white/50 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-dark-700">
          Demo accounts
        </p>
        <p className="mt-1 text-xs text-dark-500">
          Fill the form with a ready-made account, then sign in.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() =>
                setForm({ email: account.email, password: account.password })
              }
              className="flex-1 border border-dark-300 px-4 py-2.5 text-left transition-colors hover:border-primary-500 hover:bg-primary-50">
              <span className="block text-xs font-medium uppercase tracking-[0.12em] text-primary-900">
                {account.label}
              </span>
              <span className="mt-0.5 block text-[0.7rem] text-dark-500">
                {account.email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Login;
