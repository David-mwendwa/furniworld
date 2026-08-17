import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Send } from 'lucide-react';
import { ordersApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useToast } from '../../context/ToastProvider.jsx';

/**
 * "I've paid — here's the code."
 *
 * An order can be settled outside the app: M-Pesa sent to the till, a bank
 * transfer, cash handed to a driver. None of that reaches the server on its
 * own, so without this box the only way to tell anyone is to email, and the
 * order sits looking unpaid. Submitting is a claim, not a payment — the copy
 * says so, and it writes `payment.verification`, never `payment.status`. An
 * admin checks it against the real statement from the payments queue.
 *
 * Hidden once the order is paid or cancelled: there is nothing left to claim.
 */

const CHANNELS = [
  { id: 'mpesa', label: 'M-Pesa' },
  { id: 'bank_transfer', label: 'Bank transfer' },
  { id: 'cash', label: 'Cash' },
  { id: 'other', label: 'Something else' },
];

const PaymentReferenceBox = ({ order, onUpdated }) => {
  const toast = useToast();
  const claim = order.payment?.verification;
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState('');
  const [channel, setChannel] = useState(
    order.payment?.method === 'mpesa' ? 'mpesa' : 'bank_transfer'
  );
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await ordersApi.submitPaymentReference(order.orderNumber, {
        reference: reference.trim(),
        channel,
        payerNote: note.trim(),
      });
      toast.success(data.message);
      setOpen(false);
      setReference('');
      setNote('');
      onUpdated?.(data.verification);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (order.payment?.status === 'paid' || order.status === 'cancelled') return null;

  // Already waiting on us — showing the form again would invite a second
  // claim for the same money.
  if (claim?.state === 'submitted' && !open)
    return (
      <div className="mt-3 flex items-start gap-2.5 border border-dark-200 bg-white p-3.5 text-sm">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
        <div>
          <p className="font-medium text-dark-800">We're checking your payment</p>
          <p className="mt-0.5 text-xs text-dark-500">
            You sent <span className="font-mono text-dark-700">{claim.reference}</span>.
            We'll email you once it's matched against our records.
          </p>
        </div>
      </div>
    );

  return (
    <div className="mt-3 border border-dark-200 bg-white p-3.5">
      {claim?.state === 'rejected' && (
        <div className="mb-3 flex items-start gap-2.5 bg-warning-50 p-2.5 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning-700" />
          <div>
            <p className="font-medium text-warning-900">We couldn't match that code</p>
            <p className="mt-0.5 text-xs text-warning-800">{claim.reviewNote}</p>
          </div>
        </div>
      )}

      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-dark-500">
            Paid by M-Pesa, transfer or cash? Send the transaction code and we'll
            match it to this order.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 border border-primary-300 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-primary-800 transition-colors hover:bg-primary-50">
            <Send className="h-3.5 w-3.5" />
            {claim?.state === 'rejected' ? 'Send another code' : "I've paid"}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-dark-600">
                Transaction code
              </span>
              <input
                required
                value={reference}
                onChange={(event) => setReference(event.target.value.toUpperCase())}
                placeholder="TIJ4KX9QAB"
                maxLength={64}
                className="h-9 w-full border border-dark-300 px-3 font-mono text-sm uppercase focus:border-primary-600 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-dark-600">
                How you paid
              </span>
              <select
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
                className="h-9 w-full border border-dark-300 px-3 text-sm focus:border-primary-600 focus:outline-none">
                {CHANNELS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-dark-600">
              Anything we should know? (optional)
            </span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Sent from a different number"
              maxLength={500}
              className="h-9 w-full border border-dark-300 px-3 text-sm focus:border-primary-600 focus:outline-none"
            />
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-dark-500 hover:text-dark-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !reference.trim()}
              className="bg-primary-800 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-cream transition-colors hover:bg-primary-900 disabled:bg-dark-300">
              {saving ? 'Sending…' : 'Send code'}
            </button>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-dark-400">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Sending a code doesn't mark the order paid — someone checks it against
            our records first, and you'll get an email either way.
          </p>
        </form>
      )}
    </div>
  );
};

export default PaymentReferenceBox;
