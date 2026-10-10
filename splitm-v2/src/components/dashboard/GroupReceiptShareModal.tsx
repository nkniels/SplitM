import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  WhatsappLogo,
  Receipt,
} from '@phosphor-icons/react';
import { triggerHaptic } from '../../core/utils/haptics';
import type { GroupCardData } from './GroupRingCard';

interface GroupReceiptShareModalProps {
  group: GroupCardData;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupReceiptShareModal: React.FC<GroupReceiptShareModalProps> = ({
  group,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate WhatsApp-friendly receipt markdown text
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const memberBalancesText = group.members
    .map((m) => {
      const sign = m.balanceXaf > 0 ? '+' : m.balanceXaf < 0 ? '-' : ' ';
      const status = m.balanceXaf > 0 ? '(Owed to them)' : m.balanceXaf < 0 ? '(Owes the group)' : '(Settled)';
      return `• ${m.name}: ${sign}${Math.abs(m.balanceXaf).toLocaleString('en-US')} XAF ${status}`;
    })
    .join('\n');

  // Compute simplified debt transfers
  const debtors = group.members.filter((m) => m.balanceXaf < 0);
  const creditors = group.members.filter((m) => m.balanceXaf > 0);

  let settlementText = '';
  if (debtors.length > 0 && creditors.length > 0) {
    settlementText = debtors
      .slice(0, 3)
      .map((d, i) => {
        const c = creditors[i % creditors.length];
        const amt = Math.min(Math.abs(d.balanceXaf), c.balanceXaf);
        return `👉 ${d.name} ➔ ${c.name}: ${amt.toLocaleString('en-US')} XAF (${c.paymentProvider === 'orange' ? 'Orange Money' : 'MTN MoMo'})`;
      })
      .join('\n');
  } else {
    settlementText = '✅ All group debts are settled up!';
  }

  const pooledText = group.pooledTarget
    ? `\n*Pooled MoMo Pot:*\nCollected: ${(group.pooledCollected ?? 0).toLocaleString('en-US')} / ${group.pooledTarget.toLocaleString('en-US')} XAF (${Math.round(((group.pooledCollected ?? 0) / group.pooledTarget) * 100)}% funded)`
    : '';

  const receiptContent = `🧾 *SplitM Group Expense Receipt*
Group: *${group.name}* (${group.category})
Date: ${dateStr}
Total Ledger: *${group.totalExpenses.toLocaleString('en-US')} XAF*
────────────────────────
*Current Member Balances:*
${memberBalancesText}

*Suggested MoMo Settlements:*
${settlementText}${pooledText}
────────────────────────
_Generated via SplitM PWA • Zero-Sum Ledger (Σ=0)_`;

  const handleCopy = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(receiptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('medium');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(receiptContent)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-receipt-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-surface border border-border p-5 shadow-2xl space-y-4 animate-modal-enter text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Receipt size={18} weight="duotone" />
            </div>
            <div>
              <h3 id="share-receipt-title" className="font-serif text-base font-medium text-primary">
                WhatsApp Group Receipt
              </h3>
              <p className="text-[11px] text-muted font-sans">Ready-to-paste ledger voucher</p>
            </div>
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

        {/* Paper Receipt Box */}
        <div className="p-3.5 rounded-2xl bg-background/70 border border-dashed border-border font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line text-primary select-all">
          {receiptContent}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3 rounded-xl bg-[#25D366] text-black font-semibold text-xs font-mono flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
          >
            <WhatsappLogo size={18} weight="fill" />
            <span>Share to WhatsApp Group</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-primary font-mono text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? (
              <>
                <Check size={16} weight="bold" className="text-success" />
                <span className="text-success font-semibold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} weight="duotone" className="text-muted" />
                <span>Copy Raw Receipt Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
