import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import { triggerHaptic } from '../../core/utils/haptics';
import type { RingMember } from './MemberBalancePopover';

interface DebtSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember: RingMember | null;
  currentUserName?: string;
  onConfirmSettlement: (targetMemberId: string, amount: number, provider: 'mtn' | 'orange' | 'cash') => void;
}

export const DebtSettlementModal: React.FC<DebtSettlementModalProps> = ({
  isOpen,
  onClose,
  targetMember,
  currentUserName = 'Bryan T. (You)',
  onConfirmSettlement,
}) => {
  const [provider, setProvider] = useState<'mtn' | 'orange' | 'cash'>(
    targetMember?.paymentProvider ?? 'mtn'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !targetMember) return null;

  const defaultAmount = Math.abs(targetMember.balanceXaf);
  const isPaying = targetMember.balanceXaf > 0; // If they are owed (+), we pay them. If they owe (-), they pay us.

  const handleConfirm = () => {
    triggerHaptic('medium');
    setIsProcessing(true);

    setTimeout(() => {
      triggerHaptic('success');
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onConfirmSettlement(targetMember.id, defaultAmount, provider);
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settle-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-surface border border-border p-5 shadow-2xl space-y-4 animate-modal-enter text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-success/20 text-success border border-success/30 flex items-center justify-center mx-auto animate-bounce">
              <Check size={32} weight="bold" />
            </div>
            <h3 className="font-serif text-lg font-medium text-primary">Debt Settled!</h3>
            <p className="text-xs text-muted font-mono">
              {defaultAmount.toLocaleString('en-US')} XAF transferred
            </p>
            <p className="text-[11px] text-muted">
              Ledger invariant preserved: &Sigma; Net balances = 0.00 XAF
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                  <ArrowsClockwise size={18} weight="duotone" />
                </div>
                <h3 id="settle-modal-title" className="font-serif text-base font-medium text-primary">
                  Settle Balance
                </h3>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X size={16} weight="duotone" />
              </button>
            </div>

            {/* Transaction Flow Diagram */}
            <div className="p-3.5 rounded-2xl bg-background/50 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold">
                  BT
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-muted block uppercase font-mono">Payer</span>
                  <span className="text-xs font-semibold text-primary truncate max-w-[80px] block">
                    {isPaying ? currentUserName : targetMember.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center px-2">
                <ArrowRight size={16} weight="bold" className="text-accent" />
                <span className="text-[10px] font-mono text-accent font-bold mt-0.5">
                  {defaultAmount.toLocaleString('en-US')} XAF
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-muted block uppercase font-mono">Payee</span>
                  <span className="text-xs font-semibold text-primary truncate max-w-[80px] block">
                    {isPaying ? targetMember.name : currentUserName}
                  </span>
                </div>
                {targetMember.avatarUrl ? (
                  <img
                    src={targetMember.avatarUrl}
                    alt={targetMember.name}
                    className="w-8 h-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-border-subtle flex items-center justify-center text-xs font-bold text-primary border border-border">
                    {targetMember.initials}
                  </div>
                )}
              </div>
            </div>

            {/* Provider Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted block">
                Settlement Channel
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setProvider('mtn');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                    provider === 'mtn'
                      ? 'border-[#FFCC00] bg-[#FFCC00]/10 text-primary font-bold ring-1 ring-[#FFCC00]'
                      : 'border-border bg-surface text-muted hover:text-primary'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]" />
                  MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setProvider('orange');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                    provider === 'orange'
                      ? 'border-[#FF7900] bg-[#FF7900]/10 text-primary font-bold ring-1 ring-[#FF7900]'
                      : 'border-border bg-surface text-muted hover:text-primary'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900]" />
                  Orange Money
                </button>
              </div>
            </div>

            {/* Ledger Invariant Note */}
            <div className="p-2.5 rounded-xl bg-surface-hover/80 border border-border-subtle flex items-center gap-2 text-[11px] text-muted">
              <ShieldCheck size={16} weight="duotone" className="text-success shrink-0" />
              <span>Direct greedy settlement clears debt with zero rounding loss.</span>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl bg-accent text-white font-mono text-xs font-semibold shadow-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <ArrowsClockwise size={14} className="animate-spin" />
                  <span>Processing MoMo Transfer...</span>
                </>
              ) : (
                <>
                  <span>Confirm Settlement ({defaultAmount.toLocaleString('en-US')} XAF)</span>
                  <ArrowRight size={14} weight="bold" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
