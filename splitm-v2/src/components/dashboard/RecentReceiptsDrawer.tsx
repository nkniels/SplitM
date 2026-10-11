import React from 'react';
import {
  X,
  Receipt,
  CheckCircle,
  Tag,
  CalendarBlank,
} from '@phosphor-icons/react';
import { triggerHaptic } from '../../core/utils/haptics';
import { ReceiptTearDivider } from './ReceiptTearDivider';
import { UndrawReceipt } from '../illustrations/UndrawIllustrations';
import type { GroupCardData } from './GroupRingCard';

interface RecentReceiptsDrawerProps {
  group: GroupCardData;
  isOpen: boolean;
  onClose: () => void;
}

interface MockExpenseReceipt {
  id: string;
  title: string;
  payerName: string;
  amountXaf: number;
  date: string;
  category: string;
}

const SAMPLE_EXPENSES: MockExpenseReceipt[] = [
  {
    id: 'exp-1',
    title: 'March Carrefour Groceries',
    payerName: 'Amara K.',
    amountXaf: 80000,
    date: '08 Oct 2026',
    category: 'Groceries',
  },
  {
    id: 'exp-2',
    title: 'Bastos Eneo Electricity Token',
    payerName: 'Bryan T.',
    amountXaf: 45000,
    date: '03 Oct 2026',
    category: 'Utilities',
  },
  {
    id: 'exp-3',
    title: 'Wi-Fi Fiber Optic (Camtel)',
    payerName: 'Cécile N.',
    amountXaf: 35000,
    date: '28 Sep 2026',
    category: 'Internet',
  },
  {
    id: 'exp-4',
    title: 'Camwater Monthly Bill',
    payerName: 'Danielle M.',
    amountXaf: 25000,
    date: '22 Sep 2026',
    category: 'Water',
  },
];

export const RecentReceiptsDrawer: React.FC<RecentReceiptsDrawerProps> = ({
  group,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recent-receipts-title"
    >
      <div
        className="w-full max-w-lg bg-surface border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-border-subtle bg-surface flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
              <Receipt size={22} weight="duotone" />
            </div>
            <div>
              <h3 id="recent-receipts-title" className="font-serif text-lg font-medium text-primary">
                Itemized Receipts
              </h3>
              <p className="text-xs text-muted font-sans">{group.name} • Audit Trail</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl text-muted hover:text-primary hover:bg-surface-hover transition-colors"
            aria-label="Close"
          >
            <X size={18} weight="duotone" />
          </button>
        </div>

        {/* Scrollable Receipts List */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* unDraw Header Illustration Card */}
          <div className="p-3 rounded-2xl bg-background/50 border border-border flex items-center gap-3">
            <div className="w-20 h-16 shrink-0 flex items-center justify-center">
              <UndrawReceipt width={75} height={60} primaryColor="#0284C7" secondaryColor="#D95D39" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-primary font-serif">Verified Audit Trail</h4>
              <p className="text-[11px] text-muted font-sans mt-0.5">
                Every receipt is timestamped and reconciled with zero-sum mathematical balance.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-muted">
            <span>TOTAL EXPENDITURES</span>
            <span className="font-bold text-primary tabular-nums">
              {group.totalExpenses.toLocaleString('en-US')} XAF
            </span>
          </div>

          <div className="space-y-3">
            {SAMPLE_EXPENSES.map((exp, idx) => (
              <div
                key={exp.id}
                className="rounded-2xl bg-background/60 border border-border overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-sm font-medium text-primary leading-snug">
                        {exp.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted font-sans">
                        <span className="flex items-center gap-1 font-mono">
                          <CalendarBlank size={12} weight="duotone" />
                          {exp.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Tag size={12} weight="duotone" />
                          {exp.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-primary tabular-nums block">
                        {exp.amountXaf.toLocaleString('en-US')} XAF
                      </span>
                      <span className="text-[10px] text-muted font-mono block mt-0.5">
                        Paid by {exp.payerName}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-dashed border-border-subtle flex items-center justify-between text-[11px] font-mono text-muted">
                    <span className="flex items-center gap-1 text-success font-semibold">
                      <CheckCircle size={13} weight="duotone" />
                      Split equally ({Math.round(exp.amountXaf / group.members.length).toLocaleString('en-US')} / member)
                    </span>
                    <span>RECEIPT #{idx + 1}</span>
                  </div>
                </div>

                {/* Perforation line */}
                {idx < SAMPLE_EXPENSES.length - 1 && (
                  <ReceiptTearDivider orientation="bottom" className="opacity-70 my-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
