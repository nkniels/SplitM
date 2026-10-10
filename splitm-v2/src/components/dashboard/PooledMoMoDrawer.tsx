import React, { useState } from 'react';
import {
  X,
  Wallet,
  CheckCircle,
  Clock,
  ArrowRight,
  DeviceMobile,
  Check,
  ShieldCheck,
} from '@phosphor-icons/react';
import { triggerHaptic } from '../../core/utils/haptics';
import type { GroupCardData } from './GroupRingCard';

interface PooledMoMoDrawerProps {
  group: GroupCardData;
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess: (groupId: string, amount: number) => void;
}

export const PooledMoMoDrawer: React.FC<PooledMoMoDrawerProps> = ({
  group,
  isOpen,
  onClose,
  onContributeSuccess,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(20000);
  const [provider, setProvider] = useState<'mtn' | 'orange'>('mtn');
  const [isSimulatingUssd, setIsSimulatingUssd] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [isUssdConfirmed, setIsUssdConfirmed] = useState<boolean>(false);

  if (!isOpen) return null;

  const target = group.pooledTarget ?? 80000;
  const collected = group.pooledCollected ?? 0;
  const remaining = Math.max(0, target - collected);
  const percentage = Math.min(100, Math.round((collected / target) * 100));

  // Determine individual quota (target / members)
  const quotaPerMember = Math.round(target / Math.max(1, group.members.length));

  const handleStartUssd = () => {
    triggerHaptic('medium');
    setIsSimulatingUssd(true);
    setPinInput('');
    setIsUssdConfirmed(false);
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    setIsUssdConfirmed(true);

    setTimeout(() => {
      onContributeSuccess(group.id, selectedAmount);
      setIsSimulatingUssd(false);
      setIsUssdConfirmed(false);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pooled-momo-title"
    >
      <div
        className="w-full max-w-lg bg-surface border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-border-subtle bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
              <Wallet size={22} weight="duotone" />
            </div>
            <div>
              <h3 id="pooled-momo-title" className="font-serif text-lg font-medium text-primary">
                Pooled MoMo Pot
              </h3>
              <p className="text-xs text-muted font-sans">{group.name} • Shared Group Purchase</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl text-muted hover:text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close drawer"
          >
            <X size={18} weight="duotone" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Progress Card */}
          <div className="p-4 rounded-2xl bg-background/60 border border-border">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted uppercase tracking-wider">Pot Collection Target</span>
              <span className="font-bold text-accent tabular-nums">{percentage}% Funded</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-primary tabular-nums">
                  {collected.toLocaleString('en-US')}
                </span>
                <span className="text-xs font-mono text-muted ml-1.5">/ {target.toLocaleString('en-US')} XAF</span>
              </div>
              <span className="text-xs text-muted font-mono tabular-nums">
                {remaining === 0 ? 'Fully funded 🎉' : `${remaining.toLocaleString('en-US')} XAF remaining`}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-border rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Members Quotas Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-muted">
                Member Contributions ({quotaPerMember.toLocaleString('en-US')} XAF each)
              </span>
              <span className="text-xs text-muted font-mono">{group.members.length} members</span>
            </div>

            <div className="space-y-2">
              {group.members.map((member, idx) => {
                // Mock contribution status based on index and balance
                const isPaid = idx % 2 === 0 || member.balanceXaf > 0;
                const memberProvider = member.paymentProvider ?? (idx % 2 === 0 ? 'mtn' : 'orange');

                return (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-surface border border-border-subtle flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-border-subtle flex items-center justify-center text-xs font-semibold text-primary border border-border">
                          {member.initials}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-primary leading-tight">
                          {member.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              memberProvider === 'mtn'
                                ? 'bg-[#FFCC00]/15 text-[#B38F00] dark:text-[#FFCC00]'
                                : 'bg-[#FF7900]/15 text-[#CC6100] dark:text-[#FF7900]'
                            }`}
                          >
                            {memberProvider === 'mtn' ? 'MTN MoMo' : 'Orange Money'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success font-mono">
                          <CheckCircle size={14} weight="duotone" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent font-mono">
                          <Clock size={14} weight="duotone" />
                          Pending
                        </span>
                      )}
                      <span className="text-[11px] text-muted font-mono block tabular-nums">
                        {quotaPerMember.toLocaleString('en-US')} XAF
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contribute Action Area */}
          <div className="p-4 rounded-2xl bg-surface-hover/70 border border-border space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
              <DeviceMobile size={15} weight="duotone" className="text-accent" />
              Contribute My Share
            </h4>

            {/* Quick Amount Chips */}
            <div className="grid grid-cols-3 gap-2">
              {[10000, 20000, quotaPerMember].map((amt, idx) => (
                <button
                  key={`${amt}-${idx}`}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedAmount(amt);
                  }}
                  className={`py-2 px-1 text-xs font-mono font-medium rounded-xl border text-center transition-all ${
                    selectedAmount === amt
                      ? 'bg-primary text-background border-primary shadow-sm'
                      : 'bg-surface border-border text-primary hover:border-accent'
                  }`}
                >
                  {amt.toLocaleString('en-US')} XAF
                </button>
              ))}
            </div>

            {/* Provider Selection */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setProvider('mtn');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono transition-all ${
                  provider === 'mtn'
                    ? 'border-[#FFCC00] bg-[#FFCC00]/10 text-primary font-bold ring-1 ring-[#FFCC00]'
                    : 'border-border bg-surface text-muted hover:text-primary'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00]" />
                MTN MoMo (*126#)
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setProvider('orange');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono transition-all ${
                  provider === 'orange'
                    ? 'border-[#FF7900] bg-[#FF7900]/10 text-primary font-bold ring-1 ring-[#FF7900]'
                    : 'border-border bg-surface text-muted hover:text-primary'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900]" />
                Orange Money (*144#)
              </button>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleStartUssd}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-accent text-white font-medium text-xs font-mono flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.99] transition-all"
            >
              <span>Pay {selectedAmount.toLocaleString('en-US')} XAF to Pot</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* USSD Prompt Simulation Dialog */}
      {isSimulatingUssd && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xs rounded-2xl bg-[#1E1E1E] text-white p-5 border border-white/10 shadow-2xl space-y-4 animate-modal-enter">
            {isUssdConfirmed ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-success/20 text-success border border-success/30 flex items-center justify-center mx-auto animate-bounce">
                  <Check size={28} weight="bold" />
                </div>
                <h4 className="font-mono text-sm font-bold text-white">Payment Approved!</h4>
                <p className="text-xs text-white/70 font-mono">
                  TxID: MOMO-{Date.now().toString().slice(-6)}
                </p>
                <p className="text-[11px] text-white/50">Updating group pot ledger...</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmPin} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      provider === 'mtn' ? 'bg-[#FFCC00]' : 'bg-[#FF7900]'
                    }`}
                  />
                  <span className="text-xs font-mono font-bold tracking-wider text-white">
                    {provider === 'mtn' ? 'MTN MoMo Cameroon' : 'Orange Money Cameroun'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono text-white/90">
                  <p>Transfer to: SplitM Escrow Pot</p>
                  <p className="font-bold text-accent">
                    Amount: {selectedAmount.toLocaleString('en-US')} XAF
                  </p>
                  <p className="text-white/60 text-[11px]">Fee: 0 XAF (Group Rate)</p>
                </div>

                <div>
                  <label
                    htmlFor="ussd-pin"
                    className="block text-[10px] uppercase tracking-wider font-mono text-white/60 mb-1"
                  >
                    Enter 4-digit MoMo PIN:
                  </label>
                  <input
                    id="ussd-pin"
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    autoFocus
                    required
                    className="w-full text-center tracking-[0.5em] text-lg font-mono py-2 rounded-lg bg-black/50 border border-white/20 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setIsSimulatingUssd(false);
                    }}
                    className="w-1/2 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-mono text-white/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-lg bg-accent hover:opacity-90 text-xs font-mono font-bold text-white transition-opacity flex items-center justify-center gap-1"
                  >
                    <ShieldCheck size={14} weight="bold" />
                    Approve
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
