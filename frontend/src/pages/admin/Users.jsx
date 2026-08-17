import { useCallback, useState } from 'react';
import { Search, UserX } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Badge,
  Skeleton,
} from '../../components/ui/Feedback.jsx';
import { Pagination } from '../../components/ui/Controls.jsx';
import { adminApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { useConfirm } from '../../context/ConfirmProvider.jsx';
import { useAuth } from '../../context/AuthProvider.jsx';
import { formatDate } from '../../lib/format.js';

const AdminUsers = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(null);
  const debounced = useDebounce(search);

  const params = { page, limit: 20, ...(debounced && { search: debounced }) };
  const key = JSON.stringify(params);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => adminApi.users(params), [key]),
    [key]
  );

  const changeRole = async (user, role) => {
    setBusy(user._id);
    try {
      await adminApi.setUserRole(user._id, role);
      toast.success(`${user.name} is now ${role === 'admin' ? 'an admin' : 'a customer'}`);
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const deactivate = async (user) => {
    const ok = await confirm({
      title: `Deactivate ${user.name}?`,
      description:
        'They lose access immediately, even on a session they already have open. Their orders are kept.',
      confirmLabel: 'Deactivate',
      destructive: true,
    });
    if (!ok) return;

    setBusy(user._id);
    try {
      await adminApi.deactivateUser(user._id);
      toast.success('User deactivated');
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl">Users</h2>
        <p className="mt-1.5 text-sm text-dark-500">
          {data?.meta ? `${data.meta.total} account(s)` : ' '}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
          className="h-11 w-full border-dark-300 bg-white/70 pl-10 text-sm focus:border-primary-600 focus:ring-0"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, n) => (
            <Skeleton key={n} className="h-14 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data.users.length ? (
        <EmptyState title="No users match" description="Try a different search." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-dark-300 text-left text-xs uppercase tracking-[0.12em] text-dark-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {data.users.map((user) => {
                const isMe = user._id === me?._id;
                return (
                  <tr key={user._id}>
                    <td className="py-3.5">
                      <span className="flex items-center gap-2">
                        {user.name}
                        {isMe && <Badge tone="outline">You</Badge>}
                      </span>
                    </td>
                    <td className="py-3.5 text-dark-600">{user.email}</td>
                    <td className="py-3.5 text-dark-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3.5">
                      <select
                        value={user.role}
                        disabled={isMe || busy === user._id}
                        onChange={(event) => changeRole(user, event.target.value)}
                        aria-label={`Role for ${user.name}`}
                        className="h-9 border-dark-300 bg-white/70 text-xs focus:border-primary-600 focus:ring-0 disabled:opacity-50">
                        <option value="user">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 text-right">
                      {!isMe && (
                        <button
                          onClick={() => deactivate(user)}
                          disabled={busy === user._id}
                          aria-label={`Deactivate ${user.name}`}
                          className="p-2 text-dark-500 transition-colors hover:text-danger-600 disabled:opacity-50">
                          <UserX className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && (
        <Pagination page={data.meta.page} pages={data.meta.pages} onChange={setPage} />
      )}
    </div>
  );
};

export default AdminUsers;
