import React, { useState, useMemo } from 'react';
import {
  Check,
  X,
  WarningCircle,
  ArrowRight,
} from '@phosphor-icons/react';
import type { GroupCardData } from '../dashboard/GroupRingCard';
import type { MemberShare } from '../../payments/mock/mockPaymentService';
import { mockPaymentService } from '../../payments/mock/mockPaymentService';
import type { Locale } from '../../i18n/addFlow.i18n';
import { addFlowTranslations } from '../../i18n/addFlow.i18n';
import { triggerHaptic } from '../../core/utils/haptics';

interface StepSplitContributionsProps {
  group: GroupCardData;
  totalAmount: number;
  locale: Locale;
  onInitiate: (shares: Omit<MemberShare, 'status' | 'updatedAt'>[]) => void;
}

export const StepSplitContributions: React.FC<StepSplitContributionsProps> = ({
  group,
  totalAmount,
  locale,
  onInitiate,
}) => {
  const t = addFlowTranslations[locale];

  const members = group.members || [];
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal');
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});

  // Included members
  const includedMembers = useMemo(
    () => members.filter((m) => !excludedIds.has(m.id)),
    [members, excludedIds]
  );

  // Compute shares based on mode and exact integer penny distribution
  const computedShares = useMemo(() => {
    const shares: Record<string, number> = {};

    if (splitMode === 'equal') {
      const count = includedMembers.length;
      if (count === 0) {
        members.forEach((m) => {
          shares[m.id] = 0;
        });
        return shares;
      }

      // Exact integer division with remainder pennies allocated to first R members
      const quotient = Math.floor(totalAmount / count);
      const remainder = totalAmount % count;

      includedMembers.forEach((m, idx) => {
        shares[m.id] = quotient + (idx < remainder ? 1 : 0);
      });

      // Excluded members have 0
      members.forEach((m) => {
        if (excludedIds.has(m.id)) {
          shares[m.id] = 0;
        }
      });
    } else {
      // Custom mode: read from customAmounts map
      members.forEach((m) => {
        if (excludedIds.has(m.id)) {
          shares[m.id] = 0;
        } else {
          shares[m.id] = customAmounts[m.id] ?? 0;
        }
      });
    }

    return shares;
  }, [members, includedMembers, excludedIds, splitMode, totalAmount, customAmounts]);

  // When switching to custom mode, initialize with the current equal split
  const handleToggleMode = (mode: 'equal' | 'custom') => {
    triggerHaptic('light');
    if (mode === 'custom' && splitMode === 'equal') {
      setCustomAmounts({ ...computedShares });
    }
    setSplitMode(mode);
  };

  const handleToggleExclude = (memberId: string) => {
    triggerHaptic('light');
    const next = new Set(excludedIds);
    if (next.has(memberId)) {
      next.delete(memberId);
    } else {
      // Cannot exclude everyone
      if (includedMembers.length === 1 && !next.has(memberId)) {
        return;
      }
      next.add(memberId);
    }
    setExcludedIds(next);
  };

  const handleCustomAmountChange = (memberId: string, valStr: string) => {
    const parsed = parseInt(valStr.replace(/\D/g, ''), 10) || 0;
    setCustomAmounts((prev) => ({
      ...prev,
      [memberId]: parsed,
    }));
  };

  // Calculate assigned total
  const assignedTotal = useMemo(() => {
    return Object.values(computedShares).reduce((acc, curr) => acc + curr, 0);
  }, [computedShares]);

  const diff = totalAmount - assignedTotal;
  const isExactMatch = diff === 0 && includedMembers.length > 0;
  const progressPercent = Math.min(
    100,
    totalAmount > 0 ? Math.round((assignedTotal / totalAmount) * 100) : 0
  );

  const handleProceed = () => {
    if (!isExactMatch) return;
    triggerHaptic('medium');

    const resultShares: Omit<MemberShare, 'status' | 'updatedAt'>[] = includedMembers.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      avatarUrl: m.avatarUrl,
      initials: m.initials,
      network: (m.paymentProvider === 'orange' ? 'orange' : 'mtn') as 'mtn' | 'orange',
      amount: computedShares[m.id] || 0,
    }));

    onInitiate(resultShares);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-xl w-full mx-auto animate-fade-in overflow-hidden">
      {/* Title & Subtitle */}
      <div className="mb-4">
        <h2 className="font-serif text-2xl font-medium text-primary tracking-tight">
          {t.step4Title}
        </h2>
        <p className="text-sm text-muted font-sans mt-0.5">
          {t.step4Subtitle.replace('{total}', mockPaymentService.formatFcfa(totalAmount))}
        </p>
      </div>

      {/* Split Mode Segmented Toggle */}
      <div className="p-1 rounded-2xl bg-surface-elevated border border-border flex items-center mb-4">
        <button
          type="button"
          onClick={() => handleToggleMode('equal')}
          className={`flex-1 min-h-[40px] rounded-xl text-xs font-sans font-medium transition-all flex items-center justify-center gap-1.5 ${
            splitMode === 'equal'
              ? 'bg-surface text-primary shadow-sm font-semibold'
              : 'text-muted hover:text-primary'
          }`}
        >
          <span>{t.splitEqually}</span>
        </button>

        <button
          type="button"
          onClick={() => handleToggleMode('custom')}
          className={`flex-1 min-h-[40px] rounded-xl text-xs font-sans font-medium transition-all flex items-center justify-center gap-1.5 ${
            splitMode === 'custom'
              ? 'bg-surface text-primary shadow-sm font-semibold'
              : 'text-muted hover:text-primary'
          }`}
        >
          <span>{t.customAmounts}</span>
        </button>
      </div>

      {/* Members Split List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pb-2">
        {members.map((member) => {
          const isExcluded = excludedIds.has(member.id);
          const share = computedShares[member.id] || 0;

          return (
            <div
              key={member.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isExcluded
                  ? 'border-border/50 bg-surface/30 opacity-60'
                  : 'border-border bg-surface'
              }`}
            >
              {/* Left: Exclude Checkbox & Member Avatar + Name */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleExclude(member.id)}
                  className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center border transition-all ${
                    isExcluded
                      ? 'border-border bg-surface-elevated text-muted'
                      : 'border-accent bg-accent text-white'
                  }`}
                  aria-label={isExcluded ? t.included : t.excludeMemberTooltip}
                  title={isExcluded ? t.included : t.excludeMemberTooltip}
                >
                  {isExcluded ? <X size={16} weight="bold" /> : <Check size={16} weight="bold" />}
                </button>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full ring-2 ring-border bg-surface-elevated overflow-hidden shrink-0">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-muted">
                      {member.initials || member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name & Carrier */}
                <div className="min-w-0">
                  <h4 className="font-serif text-sm font-medium text-primary truncate">
                    {member.name}
                  </h4>
                  <span className="text-[10px] font-sans text-muted">
                    {isExcluded ? (
                      <span className="text-accent">{t.excluded}</span>
                    ) : member.paymentProvider === 'orange' ? (
                      'Orange Money'
                    ) : (
                      'MTN MoMo'
                    )}
                  </span>
                </div>
              </div>

              {/* Right: Amount Display / Custom Input */}
              <div className="shrink-0 flex items-center gap-1.5">
                {splitMode === 'equal' || isExcluded ? (
                  <span className="font-mono text-sm font-medium text-primary px-3 py-1.5 rounded-xl bg-surface-elevated border border-border">
                    {mockPaymentService.formatFcfa(share)}
                  </span>
                ) : (
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={customAmounts[member.id] ?? ''}
                      onChange={(e) => handleCustomAmountChange(member.id, e.target.value)}
                      placeholder="0"
                      className="w-28 min-h-[44px] px-2.5 py-1 text-right rounded-xl border border-border bg-surface text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />
                    <span className="ml-1 text-[11px] font-sans font-bold text-muted">
                      FCFA
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Sticky Footer: Assigned Progress & Initiate Button */}
      <div className="pt-3 border-t border-border mt-auto bg-background">
        {/* Progress Bar & Assigned Text */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-muted font-medium">
              {t.assignedProgress
                .replace('{assigned}', mockPaymentService.formatFcfa(assignedTotal))
                .replace('{total}', mockPaymentService.formatFcfa(totalAmount))}
            </span>

            {/* Status indicator pill */}
            {isExactMatch ? (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <Check size={14} weight="bold" />
                {t.balancedExact}
              </span>
            ) : diff > 0 ? (
              <span className="text-[#D95D39] font-semibold">
                {t.remainingToAssign.replace('{amount}', mockPaymentService.formatFcfa(diff))}
              </span>
            ) : (
              <span className="text-[#D95D39] font-semibold">
                {t.overAssigned.replace('{amount}', mockPaymentService.formatFcfa(-diff))}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isExactMatch
                  ? 'bg-emerald-500'
                  : diff < 0
                  ? 'bg-[#D95D39]'
                  : 'bg-accent'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Warning banner when unequal */}
        {!isExactMatch && (
          <p className="text-[11px] font-sans text-[#D95D39] mb-2.5 flex items-center gap-1 animate-fade-in">
            <WarningCircle size={14} weight="bold" />
            {t.mismatchWarning.replace('{total}', mockPaymentService.formatFcfa(totalAmount))}
          </p>
        )}

        {/* Initiate Button */}
        <button
          type="button"
          disabled={!isExactMatch}
          onClick={handleProceed}
          className={`w-full min-h-[48px] px-4 py-3 rounded-2xl font-sans font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
            isExactMatch
              ? 'bg-accent text-white hover:bg-accent/90 active:scale-[0.98] cursor-pointer'
              : 'bg-muted/20 text-muted cursor-not-allowed border border-border'
          }`}
        >
          <span>{t.initiateBtn}</span>
          <ArrowRight size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
};
