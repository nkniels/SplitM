import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  ArrowRight,
  Check,
} from '@phosphor-icons/react';
import type { GroupCardData } from '../dashboard/GroupRingCard';
import { FinanceEngine } from '../../core/finance/FinanceEngine';
import { mockPaymentService } from '../../payments/mock/mockPaymentService';
import type { Locale } from '../../i18n/addFlow.i18n';
import { addFlowTranslations } from '../../i18n/addFlow.i18n';
import { triggerHaptic } from '../../core/utils/haptics';

interface StepSettleDebtsProps {
  group: GroupCardData;
  locale: Locale;
  onDone: () => void;
}

interface SettleItem {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar?: string;
  fromInitials: string;
  toId: string;
  toName: string;
  toAvatar?: string;
  toInitials: string;
  amount: number;
  isPaid: boolean;
}

export const StepSettleDebts: React.FC<StepSettleDebtsProps> = ({
  group,
  locale,
  onDone,
}) => {
  const t = addFlowTranslations[locale];

  // Map member balances to Record<string, number>
  const initialItems: SettleItem[] = useMemo(() => {
    const memberMap = new Map((group.members || []).map((m) => [m.id, m]));
    const balances: Record<string, number> = {};

    (group.members || []).forEach((m) => {
      balances[m.id] = m.balanceXaf || 0;
    });

    // Run greedy debt minimization engine
    const settlements = FinanceEngine.computeSettlements(balances);

    return settlements.map((s, idx) => {
      const fromMember = memberMap.get(s.from);
      const toMember = memberMap.get(s.to);

      return {
        id: `st-${idx}-${s.from}-${s.to}`,
        fromId: s.from,
        fromName: fromMember?.name || s.from,
        fromAvatar: fromMember?.avatarUrl,
        fromInitials: fromMember?.initials || '??',
        toId: s.to,
        toName: toMember?.name || s.to,
        toAvatar: toMember?.avatarUrl,
        toInitials: toMember?.initials || '??',
        amount: Math.round(s.amount),
        isPaid: false,
      };
    });
  }, [group]);

  const [items, setItems] = useState<SettleItem[]>(initialItems);
  const [payingId, setPayingId] = useState<string | null>(null);

  const handleMarkAsPaid = (id: string) => {
    triggerHaptic('medium');
    setPayingId(id);

    setTimeout(() => {
      triggerHaptic('success');
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isPaid: true } : item))
      );
      setPayingId(null);
    }, 600);
  };

  const activeDebts = items.filter((i) => !i.isPaid);
  const allSettled = activeDebts.length === 0;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-xl w-full mx-auto animate-fade-in overflow-y-auto">
      {/* Title & Subtitle */}
      <div className="mb-5">
        <h2 className="font-serif text-2xl font-medium text-primary tracking-tight">
          {t.settleTitle}
        </h2>
        <p className="text-sm text-muted font-sans mt-0.5">
          {t.settleSubtitle.replace('{groupName}', group.name)}
        </p>
      </div>

      {allSettled ? (
        /* Empty / All Settled State */
        <div
          className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-emerald-500/30 bg-emerald-500/5 my-auto"
          role="region"
          aria-label={t.noDebtsTitle}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mb-4 animate-scale-up">
            <CheckCircle size={36} weight="duotone" />
          </div>

          <h3 className="font-serif text-xl font-medium text-primary">
            {t.noDebtsTitle}
          </h3>

          <p className="text-sm text-muted font-sans max-w-xs mt-1.5 mb-6 leading-relaxed">
            {t.noDebtsDesc}
          </p>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onDone();
            }}
            className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-accent text-white font-sans font-medium text-sm hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{t.doneBtn}</span>
            <Check size={18} weight="bold" />
          </button>
        </div>
      ) : (
        /* Simplified Debts List */
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {items.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isPaid
                      ? 'border-emerald-500/30 bg-emerald-500/5 opacity-70'
                      : 'border-border bg-surface'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Who owes Whom */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* From Debtor */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-8 h-8 rounded-full ring-2 ring-border bg-surface-elevated overflow-hidden shrink-0">
                          {item.fromAvatar ? (
                            <img
                              src={item.fromAvatar}
                              alt={item.fromName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted">
                              {item.fromInitials}
                            </div>
                          )}
                        </div>
                        <span className="font-serif text-xs font-semibold text-primary truncate max-w-[90px] sm:max-w-[110px]">
                          {item.fromName}
                        </span>
                      </div>

                      {/* Direction Arrow & Amount */}
                      <div className="flex flex-col items-center px-1 shrink-0">
                        <span className="font-mono text-xs font-bold text-accent">
                          {mockPaymentService.formatFcfa(item.amount)}
                        </span>
                        <ArrowRight size={14} weight="bold" className="text-muted" />
                      </div>

                      {/* To Creditor */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-8 h-8 rounded-full ring-2 ring-border bg-surface-elevated overflow-hidden shrink-0">
                          {item.toAvatar ? (
                            <img
                              src={item.toAvatar}
                              alt={item.toName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted">
                              {item.toInitials}
                            </div>
                          )}
                        </div>
                        <span className="font-serif text-xs font-semibold text-primary truncate max-w-[90px] sm:max-w-[110px]">
                          {item.toName}
                        </span>
                      </div>
                    </div>

                    {/* Mark as paid button */}
                    <div className="shrink-0 flex items-center justify-end">
                      {item.isPaid ? (
                        <span className="text-xs font-sans font-medium text-emerald-500 flex items-center gap-1">
                          <CheckCircle size={16} weight="fill" />
                          <span>{t.markPaidSuccess}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={payingId === item.id}
                          onClick={() => handleMarkAsPaid(item.id)}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl border border-border bg-surface-elevated hover:border-emerald-500 hover:text-emerald-500 text-primary font-sans text-xs font-medium transition-all active:scale-[0.98] flex items-center gap-1.5"
                        >
                          <CheckCircle
                            size={16}
                            weight="duotone"
                            className={payingId === item.id ? 'animate-spin text-emerald-500' : ''}
                          />
                          <span>{payingId === item.id ? 'Settling...' : t.markAsPaidBtn}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Done Button */}
          <div className="pt-4 border-t border-border mt-4">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onDone();
              }}
              className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-accent text-white font-sans font-medium text-sm hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{t.doneBtn}</span>
              <Check size={18} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
