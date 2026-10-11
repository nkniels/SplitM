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
  PencilSimple,
  PhoneCall,
  BellRinging,
} from '@phosphor-icons/react';
import { triggerHaptic } from '../../core/utils/haptics';
import type { GroupCardData } from './GroupRingCard';

export interface PooledMoMoDrawerProps {
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
  const [userPhone, setUserPhone] = useState<string>('+237 678 45 12 90');
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [isSimulatingPush, setIsSimulatingPush] = useState<boolean>(false);
  const [pushStage, setPushStage] = useState<'dispatching' | 'prompt' | 'success'>('dispatching');
  const [pinInput, setPinInput] = useState<string>('');

  if (!isOpen) return null;

  const target = group.pooledTarget ?? 80000;
  const collected = group.pooledCollected ?? 0;
  const remaining = Math.max(0, target - collected);
  const percentage = Math.min(100, Math.round((collected / target) * 100));

  // Determine individual quota (target / members)
  const quotaPerMember = Math.round(target / Math.max(1, group.members.length));

  const providerCode = provider === 'mtn' ? '*126#' : '*144#';
  const providerName = provider === 'mtn' ? 'MTN MoMo (*126#)' : 'Orange Money (*144#)';

  const handleStartDirectWithdrawal = () => {
    triggerHaptic('medium');
    setIsSimulatingPush(true);
    setPushStage('dispatching');
    setPinInput('');

    // Simulate carrier network push dispatching to attached number
    setTimeout(() => {
      setPushStage('prompt');
      triggerHaptic('tear');
    }, 900);
  };

  const handleApproveWithdrawal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic('success');
    setPushStage('success');

    setTimeout(() => {
      onContributeSuccess(group.id, selectedAmount);
      setIsSimulatingPush(false);
      setPushStage('dispatching');
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pool-money-title"
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
              <h3 id="pool-money-title" className="font-serif text-lg font-medium text-primary">
                Pool Money Pot
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
                            {memberProvider === 'mtn' ? 'MTN (*126#)' : 'Orange (*144#)'}
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

          {/* Direct Withdrawal Initiation Box */}
          <div className="p-4 rounded-2xl bg-surface-hover/70 border border-border space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                <DeviceMobile size={15} weight="duotone" className="text-accent" />
                Direct Carrier Withdrawal
              </h4>
              <span className="text-[10px] font-mono text-muted bg-background/80 px-2 py-0.5 rounded-md border border-border-subtle">
                Fast STK Pull
              </span>
            </div>

            {/* User's Attached Phone Number Box */}
            <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <PhoneCall size={16} weight="duotone" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted">
                    Linked Mobile Number
                  </div>
                  {isEditingPhone ? (
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      onBlur={() => setIsEditingPhone(false)}
                      autoFocus
                      className="text-xs font-mono font-bold text-primary bg-background border border-accent rounded px-1.5 py-0.5 focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-mono font-bold text-primary">
                      {userPhone}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsEditingPhone(!isEditingPhone);
                }}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1"
              >
                <PencilSimple size={12} weight="duotone" />
                <span>{isEditingPhone ? 'Save' : 'Change'}</span>
              </button>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-muted mb-1.5">
                Select Contribution Amount:
              </label>
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
            </div>

            {/* Carrier Provider Selection */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-muted mb-1.5">
                Service Provider Debit Gateway:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setProvider('mtn');
                    if (!userPhone.startsWith('+237 67') && !userPhone.startsWith('+237 65')) {
                      setUserPhone('+237 678 45 12 90');
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono transition-all ${
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
                    if (!userPhone.startsWith('+237 69')) {
                      setUserPhone('+237 699 23 11 05');
                    }
                  }}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-mono transition-all ${
                    provider === 'orange'
                      ? 'border-[#FF7900] bg-[#FF7900]/10 text-primary font-bold ring-1 ring-[#FF7900]'
                      : 'border-border bg-surface text-muted hover:text-primary'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900]" />
                  Orange Money (*144#)
                </button>
              </div>
            </div>

            {/* Initiate Direct Withdrawal Button */}
            <button
              type="button"
              onClick={handleStartDirectWithdrawal}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-accent text-white font-medium text-xs font-mono flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.99] transition-all"
            >
              <span>Initiate Direct Withdrawal ({selectedAmount.toLocaleString('en-US')} XAF)</span>
              <ArrowRight size={14} weight="bold" />
            </button>

            <p className="text-[10px] text-muted text-center font-sans">
              A direct STK push will be dispatched to <strong className="text-primary font-mono">{userPhone}</strong> via <strong className="text-primary font-mono">{providerCode}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Push & Approval STK Modal */}
      {isSimulatingPush && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#1C1A18] text-white p-6 border border-white/10 shadow-2xl space-y-4 animate-modal-enter">
            {pushStage === 'dispatching' && (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto animate-pulse">
                  <BellRinging size={28} weight="duotone" />
                </div>
                <h4 className="font-mono text-sm font-bold text-white">
                  Dispatching Carrier Debit Request...
                </h4>
                <p className="text-xs text-white/70 font-mono">
                  Routing to {userPhone} via {providerName}
                </p>
                <div className="w-24 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                  <div className="w-full h-full bg-accent animate-pulse" />
                </div>
              </div>
            )}

            {pushStage === 'prompt' && (
              <form onSubmit={handleApproveWithdrawal} className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${
                        provider === 'mtn' ? 'bg-[#FFCC00]' : 'bg-[#FF7900]'
                      }`}
                    />
                    <span className="text-xs font-mono font-bold tracking-wider text-white">
                      {provider === 'mtn' ? 'MTN MoMo Cameroon' : 'Orange Money Cameroun'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-accent font-bold px-1.5 py-0.5 rounded bg-accent/20">
                    {providerCode}
                  </span>
                </div>

                {/* Carrier Network STK Prompt Card */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono text-white/90">
                  <div className="flex justify-between text-[11px] text-white/60">
                    <span>Attached Account:</span>
                    <span className="text-white font-bold">{userPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Debit Reference:</span>
                    <span className="text-accent">Pool Pot: {group.name}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-white/10">
                    <span>Withdrawal Amount:</span>
                    <span className="text-success">{selectedAmount.toLocaleString('en-US')} XAF</span>
                  </div>
                  <p className="text-[10px] text-white/50 pt-1">
                    Approval directly debits your wallet and credits the group escrow pot. Fee: 0 XAF.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="ussd-pin"
                    className="block text-[10px] uppercase tracking-wider font-mono text-white/70 mb-1"
                  >
                    Enter 4-digit PIN to authorize withdrawal:
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
                    className="w-full text-center tracking-[0.6em] text-xl font-mono py-2.5 rounded-xl bg-black/80 border border-white/20 text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setIsSimulatingPush(false);
                    }}
                    className="w-1/2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-white/80 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-accent hover:opacity-90 text-xs font-mono font-bold text-white transition-opacity flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ShieldCheck size={16} weight="bold" />
                    Approve Debit
                  </button>
                </div>
              </form>
            )}

            {pushStage === 'success' && (
              <div className="py-6 text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-success/20 text-success border border-success/30 flex items-center justify-center mx-auto animate-bounce">
                  <Check size={32} weight="bold" />
                </div>
                <h4 className="font-mono text-base font-bold text-white">Withdrawal Authorized!</h4>
                <p className="text-xs text-white/80 font-mono">
                  {selectedAmount.toLocaleString('en-US')} XAF debited from {userPhone}
                </p>
                <p className="text-[11px] text-white/50 font-mono">
                  TxID: {provider === 'mtn' ? 'MOMO' : 'OM'}-{Date.now().toString().slice(-6)}
                </p>
                <p className="text-[11px] text-accent pt-1">Group Pot Ledger updated successfully 🎉</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const PoolMoneyDrawer = PooledMoMoDrawer;
export default PooledMoMoDrawer;
