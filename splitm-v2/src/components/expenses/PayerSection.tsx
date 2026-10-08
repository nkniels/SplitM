import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Member, Payer } from '../../core/types';

interface PayerSectionProps {
  members: Member[];
  payers: Payer[];
  totalAmount: number;
  onChange: (payers: Payer[]) => void;
}

export function PayerSection({
  members,
  payers,
  totalAmount,
  onChange,
}: PayerSectionProps) {
  const paidSum = payers.reduce((acc, p) => acc + p.amount, 0);
  const paidError =
    Math.abs(paidSum - totalAmount) > 0.01
      ? 'Paid amounts must equal the total expense amount'
      : null;

  const canAddPayer =
    payers.length < 20 && payers.length < members.length;

  // IDs of members already assigned to a payer row
  function usedMemberIds(excludeIndex?: number): Set<string> {
    return new Set(
      payers
        .filter((_, i) => i !== excludeIndex)
        .map((p) => p.memberId)
    );
  }

  function handleAddPayer() {
    const used = usedMemberIds();
    const next = members.find((m) => !used.has(m.id));
    if (!next) return;
    onChange([...payers, { memberId: next.id, amount: 0 }]);
  }

  function handleRemove(index: number) {
    onChange(payers.filter((_, i) => i !== index));
  }

  function handleMemberChange(index: number, memberId: string) {
    const updated = payers.map((p, i) =>
      i === index ? { ...p, memberId } : p
    );
    onChange(updated);
  }

  function handleAmountChange(index: number, amount: number) {
    const updated = payers.map((p, i) =>
      i === index ? { ...p, amount } : p
    );
    onChange(updated);
  }

  return (
    <div>
      <p className="text-slate-300 text-sm font-medium mb-2">Who paid?</p>

      <div className="space-y-2">
        {payers.map((payer, index) => {
          const used = usedMemberIds(index);
          return (
            <div key={index} className="flex items-center gap-2">
              {/* Member select */}
              <select
                value={payer.memberId}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                aria-label={`Payer ${index + 1} member`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {members
                  .filter((m) => !used.has(m.id) || m.id === payer.memberId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>

              {/* Amount input */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm text-slate-400">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={payer.amount}
                  onChange={(e) =>
                    handleAmountChange(
                      index,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  aria-label={`Payer ${index + 1} amount`}
                  className="w-24 h-9 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-right"
                />
              </div>

              {/* Remove button */}
              {payers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove payer ${index + 1}`}
                  className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Payer */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAddPayer}
        disabled={!canAddPayer}
        leftIcon={<PlusCircle className="w-4 h-4" aria-hidden="true" />}
        className="mt-2 text-slate-400 hover:text-slate-200"
      >
        Add Payer
      </Button>

      {/* Summary */}
      <div className="mt-2">
        <p className="text-xs text-slate-400">
          Paid: ${paidSum.toFixed(2)} / ${totalAmount.toFixed(2)}
        </p>
        {paidError && (
          <p className="text-xs text-red-400 mt-0.5" role="alert">
            {paidError}
          </p>
        )}
      </div>
    </div>
  );
}
