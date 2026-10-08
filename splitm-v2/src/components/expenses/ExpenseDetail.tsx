import type { Expense, Member } from '../../core/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ExpenseDetailProps {
  expense: Expense;
  members: Member[];
  currency: string;
  onEdit: () => void;
  onClose: () => void;
}

function currencySymbol(currency: string): string {
  if (currency === 'USD') return '$';
  if (currency === 'EUR') return '€';
  if (currency === 'GBP') return '£';
  return currency;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMemberName(members: Member[], memberId: string): string {
  return members.find((m) => m.id === memberId)?.name ?? 'Unknown';
}

export function ExpenseDetail({
  expense,
  members,
  currency,
  onEdit,
  onClose,
}: ExpenseDetailProps) {
  const symbol = currencySymbol(currency);
  const createdByName = getMemberName(members, expense.createdBy);

  return (
    <Modal isOpen onClose={onClose} title={expense.description}>
      <div className="space-y-5">
        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Amount</p>
            <p className="text-slate-100 font-semibold mt-0.5">
              {symbol}{expense.amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
            <p className="text-slate-100 mt-0.5">{formatDate(expense.date)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Category</p>
            <p className="text-slate-100 mt-0.5">{expense.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Payment Method</p>
            <p className="text-slate-100 mt-0.5">{expense.paymentMethod}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Created by</p>
            <p className="text-slate-100 mt-0.5">{createdByName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
            <p className={`mt-0.5 text-sm font-medium ${expense.settled ? 'text-green-400' : 'text-slate-300'}`}>
              {expense.settled ? 'Settled' : 'Unsettled'}
            </p>
          </div>
        </div>

        {/* Payers */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-2">Paid by</p>
          <ul className="space-y-1">
            {expense.payers.map((payer) => (
              <li
                key={payer.memberId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-300">{getMemberName(members, payer.memberId)}</span>
                <span className="text-slate-100 font-medium">
                  {symbol}{payer.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Split breakdown */}
        <div>
          <p className="text-sm font-medium text-slate-300 mb-2">Split breakdown</p>
          <ul className="space-y-1">
            {expense.splits.map((split) => (
              <li
                key={split.memberId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-300">{getMemberName(members, split.memberId)}</span>
                <span className="text-slate-100 font-medium">
                  {symbol}{split.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Comments */}
        {expense.comments && (
          <div>
            <p className="text-sm font-medium text-slate-300 mb-1">Comments</p>
            <p className="text-sm text-slate-400 bg-slate-800 rounded-md p-3">
              {expense.comments}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-700">
          <Button
            variant="primary"
            onClick={() => {
              onEdit();
              onClose();
            }}
          >
            Edit Expense
          </Button>
        </div>
      </div>
    </Modal>
  );
}
