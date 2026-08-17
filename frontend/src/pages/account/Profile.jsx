import { useState } from 'react';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { usersApi, authApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useAuth } from '../../context/AuthProvider.jsx';
import { useToast } from '../../context/ToastProvider.jsx';

export const Profile = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await usersApi.updateMe(form);
      setUser(data.user);
      toast.success('Your details have been saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-8">
      <div>
        <h2 className="text-2xl">Your details</h2>
        <p className="mt-2 text-sm text-dark-600">
          These prefill the delivery form at checkout.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Input label="Full name" required value={form.name} onChange={set('name')} />
        <Input
          label="Phone"
          value={form.phone}
          onChange={set('phone')}
          placeholder="0712345678"
          hint="Kenyan mobile number"
        />
        <Input label="Email" value={user?.email ?? ''} disabled hint="Your email cannot be changed" />
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </form>
    </div>
  );
};

export const Password = () => {
  const toast = useToast();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.newPassword !== form.confirm) {
      setError('Those passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await authApi.updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Your password has been changed');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-8">
      <div>
        <h2 className="text-2xl">Password</h2>
        <p className="mt-2 text-sm text-dark-600">
          Changing your password signs out any other device.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Input
          label="Current password"
          type="password"
          required
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={set('currentPassword')}
        />
        <Input
          label="New password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.newPassword}
          onChange={set('newPassword')}
          hint="At least 8 characters"
        />
        <Input
          label="Confirm new password"
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
        <Button type="submit" loading={saving}>
          Change password
        </Button>
      </form>
    </div>
  );
};
