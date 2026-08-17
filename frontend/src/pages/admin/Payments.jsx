import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Check, X } from 'lucide-react';
import {
  EmptyState,
  ErrorState,
  Price,
  Skeleton,
  StatusPill,
} from '../../components/ui/Feedback.jsx';
import { Modal } from '../../components/ui/Overlay.jsx';
import { Pagination } from '../../components/ui/Controls.jsx';
import Button from '../../components/ui/Button.jsx';
import { Textarea, Input } from '../../components/ui/Field.jsx';
import { paymentsApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { formatDateTime } from '../../lib/format.js';
import {
  paymentLabel,
  paymentMethodLabel,
  verificationLabel,
} from '../../lib/payment.js';

const TABS = [
  { id: 'awaiting', label: 'Awaiting' },
  { id: 'submitted', label: 'Claims' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

const AdminPayments = () => {
  const toast = useToast();
  const [state, setState] = useState('awaiting');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [decision, setDecision] = useState(null); // { order, action: 'confirm' | 'reject' }
  const [reviewNote, setReviewNote] = useState('');
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);
  const debounced = useDebounce(search);

  const params = {
    state,
    page,
    limit: 20,
    ...(debounced && { search: debounced }),
  };
  const key = JSON.stringify(params);

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => paymentsApi.reviewQueue(params), [key]),
    [key]
  );

  const openDecision = (order, action) => {
    setDecision({ order, action });
    setReviewNote('');
    setReference(order.payment.verification?.reference ?? order.payment.transactionId ?? '');
  };

  const needsReference =
    decision?.action === 'confirm' &&
    !decision.order.payment.verification?.reference &&
    !decision.order.payment.transactionId;

  const submitDecision = async (event) => {
    event.preventDefault();
    if (decision.action === 'reject' && !reviewNote.trim()) return;
    if (needsReference && !reference.trim()) return;

    setSaving(true);
    try {
      await paymentsApi.review(decision.order._id, {
        decision: decision.action,
        reviewNote: reviewNote.trim(),
        reference: reference.trim(),
      });
      toast.success(
        decision.action === 'confirm'
          ? `Payment confirmed for ${decision.order.orderNumber}`
          : `Marked ${decision.order.orderNumber} as not received`
      );
      setDecision(null);
      refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl">Payments</h2>
        <p className="mt-1.5 text-sm text-dark-500">
          Every automated path here can report success with nothing having
          moved — this queue is where a person checks. {data?.counts && (
            <>
              {data.counts.submitted} claim(s) waiting,{' '}
              {data.counts.unpaid} order(s) unpaid.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex gap-1 overflow-x-auto border-b border-dark-200 hide-scrollbar">
          {TABS.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => {
                  setState(tab.id);
                  setPage(1);
                }}
                className={`relative shrink-0 px-3.5 py-2.5 text-sm transition-colors ${
                  state === tab.id
                    ? 'text-primary-900'
                    : 'text-dark-500 hover:text-primary-800'
                }`}>
                {tab.label}
                {tab.id === 'submitted' && data?.counts?.submitted > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning-600 px-1 text-[0.65rem] text-white">
                    {data.counts.submitted}
                  </span>
                )}
                {state === tab.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-800" />
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Order, email, reference…"
            className="h-10 w-full border-dark-300 bg-white/70 pl-10 text-sm focus:border-primary-600 focus:ring-0"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, n) => (
            <Skeleton key={n} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data.orders.length ? (
        <EmptyState
          title="Nothing here"
          description="No orders match this filter right now."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-dark-300 text-left text-xs uppercase tracking-[0.12em] text-dark-500">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 font-medium">Claim</th>
                <th className="pb-3 text-right font-medium">Total</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200">
              {data.orders.map((order) => {
                // Anything not already refunded can be decided — not just
                // orders with a submitted claim. Cash on delivery has no
                // claim mechanism at all (the driver collects it, not the
                // app), so an admin has to be able to confirm it directly
                // once the driver reports back.
                const canDecide = !['refunded', 'partially_refunded'].includes(
                  order.payment.status
                );

                return (
                  <tr key={order._id} className="hover:bg-primary-50/60">
                    <td className="py-3.5">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="font-medium hover:text-primary-700">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-dark-500">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </td>
                    <td className="py-3.5 text-dark-600">
                      <p>{order.customer.name}</p>
                      <p className="text-xs text-dark-500">{order.customer.email}</p>
                    </td>
                    <td className="py-3.5">{paymentMethodLabel(order.payment.method)}</td>
                    <td className="py-3.5">
                      <StatusPill
                        status={order.payment.status}
                        label={paymentLabel(order.payment.status)}
                      />
                    </td>
                    <td className="py-3.5">
                      {order.payment.verification?.state !== 'none' ? (
                        <div>
                          <p className="text-xs">
                            {verificationLabel(order.payment.verification.state)}
                          </p>
                          {order.payment.verification.reference && (
                            <p className="font-mono text-xs text-dark-500">
                              {order.payment.verification.reference}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-dark-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Price value={order.total} />
                    </td>
                    <td className="py-3.5">
                      {canDecide && (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDecision(order, 'confirm')}
                            aria-label="Confirm payment"
                            className="border border-success-300 p-1.5 text-success-700 hover:bg-success-100">
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDecision(order, 'reject')}
                            aria-label="Reject payment"
                            className="border border-danger-300 p-1.5 text-danger-700 hover:bg-danger-100">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
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

      <Modal
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        title={
          decision?.action === 'confirm'
            ? `Confirm payment for ${decision?.order.orderNumber}`
            : `Mark ${decision?.order.orderNumber} as not received`
        }
        description={
          decision?.action === 'confirm'
            ? 'This is the only thing in the app that sets an order paid by hand. Check the reference against your statement first.'
            : "The customer sees this reason — it doesn't cancel the order, since a wrong reference is usually a typo, not fraud."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setDecision(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              form="payment-decision-form"
              type="submit"
              variant={decision?.action === 'reject' ? 'danger' : 'primary'}
              loading={saving}
              disabled={
                (decision?.action === 'reject' && !reviewNote.trim()) ||
                (needsReference && !reference.trim())
              }>
              {decision?.action === 'confirm' ? 'Confirm payment' : 'Reject claim'}
            </Button>
          </>
        }>
        {decision && (
          <form id="payment-decision-form" onSubmit={submitDecision} className="space-y-4">
            {decision.action === 'confirm' && (
              <Input
                label="Reference"
                required={needsReference}
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder={
                  decision.order.payment.method === 'cash_on_delivery'
                    ? 'e.g. Collected on delivery, confirmed with driver'
                    : 'The code or reference you checked against your records'
                }
                hint={
                  needsReference
                    ? 'No claim was submitted for this order — record what you checked against.'
                    : undefined
                }
              />
            )}
            <Textarea
              label={decision.action === 'confirm' ? 'Note (optional)' : 'Reason'}
              required={decision.action === 'reject'}
              rows={3}
              maxLength={500}
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder={
                decision.action === 'confirm'
                  ? 'Matched against the statement'
                  : 'That code belongs to a different payment amount'
              }
            />
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminPayments;
