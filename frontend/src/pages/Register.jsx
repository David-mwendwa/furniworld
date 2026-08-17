import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Field.jsx';
import { useAuth } from '../context/AuthProvider.jsx';
import { errorMessage } from '../api/apiClient.js';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Those passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // GuestRoute handles the redirect once the session exists.
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
    } catch (err) {
      setError(errorMessage(err, 'Could not create your account'));
      setLoading(false);
    }
  };

  return (
    <Container className="flex max-w-md flex-col py-16 lg:py-24">
      <p className="eyebrow">Get started</p>
      <h1 className="mt-3 text-display-sm">Create an account</h1>
      <p className="mt-3 text-sm text-dark-600">
        Track your orders, save your delivery details and review what you buy.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <Input
          label="Full name"
          required
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
        />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
        />
        <Input
          label="Phone (optional)"
          value={form.phone}
          onChange={set('phone')}
          placeholder="0712345678"
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          hint="At least 8 characters"
        />
        <Input
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          value={form.confirm}
          onChange={set('confirm')}
        />

        {error && (
          <p className="border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-dark-500">
        Already have an account?{' '}
        <Link to="/login" className="underline hover:text-primary-800">
          Sign in
        </Link>
      </p>
    </Container>
  );
};

export default Register;
