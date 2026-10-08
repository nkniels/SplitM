import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Expense, Member } from '../../core/types';

interface ExpenseCardProps {
  expense: Expense;
  members: Member[];
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
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
      className="bg-surface border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors cursor-pointer relative"
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
      <div className="flex items-start justify-between pr-16">
        <p className="font-medium text-slate-100 truncate flex-1">{expense.description}</p>
        <p className="text-primary font-semibold ml-3 shrink-0">
          {symbol}{expense.amount.toFixed(2)}
        </p>
      </div>

      {/* Middle row: date + category */}
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
        <span className="text-xs bg-slate-700 text-slate-300 rounded px-2 py-0.5">
          {expense.category}
        </span>
        {expense.settled && (
          <span className="text-xs bg-green-900/50 text-green-400 rounded px-2 py-0.5">
            Settled
          </span>
        )}
      </div>

      {/* Bottom row: payers */}
      <p className="text-xs text-slate-500 mt-1.5 truncate">Paid by: {payerLabel}</p>
    </div>
  );
}
