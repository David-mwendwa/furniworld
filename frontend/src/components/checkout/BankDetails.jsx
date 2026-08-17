import { Copy } from 'lucide-react';
import { BANK_TRANSFER_DETAILS } from '../../lib/payment.js';
import { useToast } from '../../context/ToastProvider.jsx';

const FIELDS = [
  ['Bank', 'bankName'],
  ['Account name', 'accountName'],
  ['Account number', 'accountNumber'],
  ['Branch', 'branch'],
];

/**
 * Where to actually send the money. Without this, the "I've paid" box on the
 * order page has nothing to be a follow-up to — a customer choosing bank
 * transfer at checkout was never told which account to pay into.
 */
const BankDetails = ({ orderNumber, className }) => {
  const toast = useToast();

  const copy = (value, label) => {
    navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <div className={`border border-dark-200 bg-white/70 p-4 ${className ?? ''}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-dark-600">
        Transfer to
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        {FIELDS.map(([label, key]) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <dt className="text-dark-500">{label}</dt>
            <dd className="flex items-center gap-2 font-medium text-dark-900">
              {BANK_TRANSFER_DETAILS[key]}
              <button
                type="button"
                onClick={() => copy(BANK_TRANSFER_DETAILS[key], label)}
                aria-label={`Copy ${label}`}
                className="text-dark-400 hover:text-primary-700">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 border-t border-dark-200 pt-2">
          <dt className="text-dark-500">Reference</dt>
          <dd className="flex items-center gap-2 font-medium text-dark-900">
            {orderNumber || 'Your order number'}
            {orderNumber && (
              <button
                type="button"
                onClick={() => copy(orderNumber, 'Reference')}
                aria-label="Copy reference"
                className="text-dark-400 hover:text-primary-700">
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-dark-500">
        Use your order number as the reference, then come back here and send us
        the transaction code so we can match it.
      </p>
    </div>
  );
};

export default BankDetails;
