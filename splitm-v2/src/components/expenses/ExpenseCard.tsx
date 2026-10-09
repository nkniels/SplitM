import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import type { Expense, Member } from '../../core/types';
import { cn } from '../../core/utils/helpers';

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSettle: () => void;
  isCreator: boolean;
  onClick: () => void;
}

function currencySymbol(currency: string): string {
  if (currency === 'USD') return '$';
  if (currency === 'EUR') return '€';
  if (currency === 'GBP') return '£';
  return currency;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function ExpenseCard({
  expense,
  members,
  currency,
  onEdit,
  onDelete,
  onToggleSettle,
  isCreator,
  onClick,
}: ExpenseCardProps) {
  const symbol = currencySymbol(currency);

  // Resolve payer names
  const payerNames = expense.payers.map((p) => {
    const member = members.find((m) => m.id === p.memberId);
    return member?.name ?? 'Unknown';
  });
  const visiblePayers = payerNames.slice(0, 3);
  const extraCount = payerNames.length - 3;
  const payerLabel =
    visiblePayers.join(', ') + (extraCount > 0 ? ` + ${extraCount} more` : '');

  return (
    <div
      className={cn(
        'bg-surface border rounded-lg p-4 hover:border-slate-600 transition-colors cursor-pointer relative',
        expense.settled ? 'border-slate-700/50 opacity-70' : 'border-slate-700'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${expense.description}`}
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {/* Settle toggle */}
        <button
          className={cn(
            'p-1.5 rounded transition-colors',
            expense.settled
              ? 'text-success hover:text-success/70 hover:bg-slate-700'
              : 'text-slate-400 hover:text-success hover:bg-slate-700'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSettle();
          }}
          aria-label={expense.settled ? `Unsettle ${expense.description}` : `Mark ${expense.description} as settled`}
          title={expense.settled ? 'Mark as unsettled' : 'Mark as settled'}
        >
          {expense.settled
            ? <CheckCircle2 className="h-3.5 w-3.5" />
            : <Circle className="h-3.5 w-3.5" />
          }
        </button>

        <button
          className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={`Edit ${expense.description}`}
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {isCreator && (
          <button
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Delete ${expense.description}`}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Top row: description + amount */}
      <div className="flex items-start justify-between pr-24">
        <p className={cn('font-medium truncate flex-1', expense.settled ? 'text-slate-400 line-through' : 'text-slate-100')}>
          {expense.description}
        </p>
        <p className={cn('font-semibold ml-3 shrink-0', expense.settled ? 'text-slate-500' : 'text-primary')}>
          {symbol}{expense.amount.toFixed(2)}
        </p>
      </div>

      {/* Middle row: date + category + status */}
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
        <span className="text-xs bg-slate-700 text-slate-300 rounded px-2 py-0.5">
          {expense.category}
        </span>
        {expense.settled && (
          <span className="text-xs bg-success/10 text-success rounded px-2 py-0.5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            Settled
          </span>
        )}
      </div>

      {/* Bottom row: payers */}
      <p className="text-xs text-slate-500 mt-1.5 truncate">Paid by: {payerLabel}</p>
    </div>
  );
}
