import React from 'react';
import { X, Receipt, ArrowRight, DeviceMobile } from '@phosphor-icons/react';

interface AddActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeGroupName: string;
  onAddExpense?: () => void;
  onStartPooled?: () => void;
}

export const AddActionSheet: React.FC<AddActionSheetProps> = ({
  isOpen,
  onClose,
  activeGroupName,
  onAddExpense,
  onStartPooled,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Create group expense or pooled payment"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-surface border-t sm:border border-border p-6 shadow-2xl animate-modal-enter transition-transform"
      >
        {/* Top Grab Handle on mobile */}
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-muted uppercase">
              {activeGroupName}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-primary font-medium mt-0.5">
              New Transaction
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close"
          >
            <X size={20} weight="duotone" />
          </button>
        </div>

        {/* Two Core Actions from SplitM Concept */}
        <div className="mt-5 space-y-3">
          {/* Action 1: Add Shared Expense */}
          <button
            onClick={() => {
              onClose();
              if (onAddExpense) {
                onAddExpense();
              } else {
                alert(`Add Expense flow opened for "${activeGroupName}".`);
              }
            }}
            className="w-full text-left p-4 rounded-2xl bg-background border border-border hover:border-primary/40 hover:bg-surface-hover transition-all duration-150 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Receipt size={22} weight="duotone" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary">
                  Split Group Expense
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  Greedy debt settlement with exact integer-cent math
                </p>
              </div>
            </div>
            <ArrowRight
              size={18}
              weight="duotone"
              className="text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all"
            />
          </button>

          {/* Action 2: Start Pooled MoMo Payment */}
          <button
            onClick={() => {
              onClose();
              if (onStartPooled) {
                onStartPooled();
              } else {
                alert(`Pooled MoMo Payment flow opened for "${activeGroupName}".`);
              }
            }}
            className="w-full text-left p-4 rounded-2xl bg-accent-subtle border border-accent/25 hover:border-accent hover:bg-accent-subtle/80 transition-all duration-150 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <DeviceMobile size={22} weight="duotone" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-primary">
                    Pooled MoMo Pot
                  </h4>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                    MoMo & OM
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Members pool balances to pay one lump-sum bill
                </p>
              </div>
            </div>
            <ArrowRight
              size={18}
              weight="duotone"
              className="text-accent group-hover:translate-x-0.5 transition-all"
            />
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-[11px] text-muted text-center font-mono">
          Zero-Sum Ledger • Automatic MoMo Reconciliation
        </p>
      </div>
    </div>
  );
};

export default AddActionSheet;
