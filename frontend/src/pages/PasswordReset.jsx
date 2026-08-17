import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Container } from '../components/ui/Feedback.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Field.jsx';
import { authApi } from '../api/index.js';
import { errorMessage } from '../api/apiClient.js';
import { useAuth } from '../context/AuthProvider.jsx';
import { useToast } from '../context/ToastProvider.jsx';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent)
    return (
      <Container className="max-w-md py-20 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
          <MailCheck className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-display-sm">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-dark-600">
          If {email} has an account, a reset link is on its way. The link is valid
          for 30 minutes.
        </p>
        <Button to="/login" variant="outline" className="mt-8">
          Back to sign in
        </Button>
      </Container>
    );

  return (
    <Container className="flex max-w-md flex-col py-16 lg:py-24">
      <p className="eyebrow">Password help</p>
      <h1 className="mt-3 text-display-sm">Forgot your password?</h1>
      <p className="mt-3 text-sm text-dark-600">
        Enter the email on your account and we will send a reset link.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {error && (
          <p className="border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 text-sm text-dark-500 underline hover:text-primary-800">
        Back to sign in
      </Link>
    </Container>
  );
};

export const ResetPassword = () => {
  const { token } = useParams();
  const { adopt } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Those passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.resetPassword(token, form.password);
      adopt(data);
      toast.success('Your password has been changed');
      navigate('/account', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="flex max-w-md flex-col py-16 lg:py-24">
      <p className="eyebrow">Password help</p>
      <h1 className="mt-3 text-display-sm">Choose a new password</h1>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <Input
          label="New password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={(event) =>
            setForm((c) => ({ ...c, password: event.target.value }))
          }
          hint="At least 8 characters"
        />
        <Input
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          value={form.confirm}
          onChange={(event) =>
            setForm((c) => ({ ...c, confirm: event.target.value }))
          }
        />
        {error && (
          <p className="border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Change password
        </Button>
      </form>
    </Container>
  );
};
