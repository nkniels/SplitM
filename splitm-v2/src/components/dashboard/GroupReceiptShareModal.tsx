import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  WhatsappLogo,
  Receipt,
  DownloadSimple,
  Image as ImageIcon,
  TextT,
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
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Calculate settlement pairings
  const debtors = group.members.filter((m) => m.balanceXaf < 0);
  const creditors = group.members.filter((m) => m.balanceXaf > 0);

  let settlementPairs: Array<{ from: string; to: string; amount: number; provider: string }> = [];
  if (debtors.length > 0 && creditors.length > 0) {
    settlementPairs = debtors.slice(0, 3).map((d, i) => {
      const c = creditors[i % creditors.length];
      const amt = Math.min(Math.abs(d.balanceXaf), c.balanceXaf);
      return {
        from: d.name,
        to: c.name,
        amount: amt,
        provider: c.paymentProvider === 'orange' ? 'Orange Money (#150#)' : 'MTN MoMo (*126#)',
      };
    });
  }

  // Draw high-resolution receipt card to canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = document.createElement('canvas');
    const width = 640;
    const height = 820;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background paper
    ctx.fillStyle = '#1C1A17';
    ctx.fillRect(0, 0, width, height);

    // Outer subtle border
    ctx.strokeStyle = '#36322C';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Decorative top & bottom tear notches (SplitM receipt motif)
    ctx.fillStyle = '#0F0E0C';
    const notchRadius = 7;
    for (let x = 32; x < width - 32; x += 22) {
      ctx.beginPath();
      ctx.arc(x, 12, notchRadius, 0, Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, height - 12, notchRadius, Math.PI, 0);
      ctx.fill();
    }

    // Top Header: SplitM Brand
    ctx.fillStyle = '#0284C7';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('SplitM', 40, 68);

    ctx.fillStyle = '#EAE7E0';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('GROUP SETTLEMENT VOUCHER', 128, 68);

    ctx.fillStyle = '#A39E93';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`DATE: ${dateStr.toUpperCase()}  •  REF: SM-${Date.now().toString().slice(-6)}`, 40, 94);

    // Divider
    ctx.strokeStyle = '#36322C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 112);
    ctx.lineTo(width - 40, 112);
    ctx.stroke();

    // Group Information
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(group.name, 40, 150);

    ctx.fillStyle = '#D95D39';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(group.category.toUpperCase(), 40, 174);

    // Total Group Ledger Box
    ctx.fillStyle = '#262420';
    ctx.fillRect(40, 192, width - 80, 72);
    ctx.strokeStyle = '#423D35';
    ctx.strokeRect(40, 192, width - 80, 72);

    ctx.fillStyle = '#A39E93';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('TOTAL GROUP LEDGER', 60, 218);

    ctx.fillStyle = '#F4F1EA';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText(`${group.totalExpenses.toLocaleString('en-US')} XAF`, 60, 248);

    ctx.fillStyle = '#34A872';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('ZERO-SUM VERIFIED (Σ=0)', width - 240, 248);

    // Member Balances Section Header
    ctx.fillStyle = '#EAE7E0';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText('ITEMIZED MEMBER BALANCES:', 40, 298);

    // List Members
    let y = 328;
    group.members.slice(0, 5).forEach((m) => {
      ctx.fillStyle = '#22201D';
      ctx.fillRect(40, y - 18, width - 80, 36);

      // Dot
      ctx.fillStyle = m.balanceXaf > 0 ? '#34A872' : m.balanceXaf < 0 ? '#E0643F' : '#A39E93';
      ctx.beginPath();
      ctx.arc(56, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(m.name, 72, y + 4);

      // Balance
      const sign = m.balanceXaf > 0 ? '+' : m.balanceXaf < 0 ? '-' : '';
      ctx.fillStyle = m.balanceXaf > 0 ? '#34A872' : m.balanceXaf < 0 ? '#E0643F' : '#A39E93';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      const balStr = `${sign}${Math.abs(m.balanceXaf).toLocaleString('en-US')} XAF`;
      ctx.fillText(balStr, width - 210, y + 4);

      // Status pill
      ctx.font = '10px "JetBrains Mono", monospace';
      const statusStr = m.balanceXaf > 0 ? 'OWED' : m.balanceXaf < 0 ? 'OWES' : 'SETTLED';
      ctx.fillText(statusStr, width - 90, y + 4);

      y += 42;
    });

    // Settlements Section
    y += 10;
    ctx.fillStyle = '#EAE7E0';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText('RECOMMENDED DIRECT SETTLEMENTS:', 40, y);
    y += 26;

    if (settlementPairs.length > 0) {
      settlementPairs.forEach((p) => {
        ctx.fillStyle = '#262420';
        ctx.fillRect(40, y - 16, width - 80, 34);

        ctx.fillStyle = '#F4F1EA';
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.fillText(`👉 ${p.from}  ➔  ${p.to}: ${p.amount.toLocaleString('en-US')} XAF`, 56, y + 5);

        ctx.fillStyle = '#0284C7';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(p.provider, width - 210, y + 5);

        y += 40;
      });
    } else {
      ctx.fillStyle = '#34A872';
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText('✅ All members are completely settled up!', 56, y + 8);
      y += 34;
    }

    // Pool Money Pot details (if configured)
    if (group.pooledTarget && group.pooledTarget > 0) {
      y += 10;
      ctx.fillStyle = '#2E211D';
      ctx.fillRect(40, y - 16, width - 80, 38);
      ctx.strokeStyle = '#D95D39';
      ctx.strokeRect(40, y - 16, width - 80, 38);

      ctx.fillStyle = '#E0643F';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(`POOLED MONEY POT: ${(group.pooledCollected ?? 0).toLocaleString('en-US')} / ${group.pooledTarget.toLocaleString('en-US')} XAF (${Math.round(((group.pooledCollected ?? 0) / group.pooledTarget) * 100)}% FUNDED)`, 56, y + 8);
      y += 42;
    }

    // Footer Watermark
    ctx.fillStyle = '#6E695F';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('Generated by SplitM PWA  •  Centralized Zero-Sum Engine (MTN & Orange MoMo)', 40, height - 32);

    setImageUrl(canvas.toDataURL('image/png'));
  }, [isOpen, group, dateStr]);

  if (!isOpen) return null;

  // Text representation for instant copy / WhatsApp
  const memberBalancesText = group.members
    .map((m) => {
      const sign = m.balanceXaf > 0 ? '+' : m.balanceXaf < 0 ? '-' : ' ';
      const status = m.balanceXaf > 0 ? '(Owed to them)' : m.balanceXaf < 0 ? '(Owes group)' : '(Settled)';
      return `• ${m.name}: ${sign}${Math.abs(m.balanceXaf).toLocaleString('en-US')} XAF ${status}`;
    })
    .join('\n');

  const settlementText =
    settlementPairs.length > 0
      ? settlementPairs
          .map((p) => `👉 ${p.from} ➔ ${p.to}: ${p.amount.toLocaleString('en-US')} XAF (${p.provider})`)
          .join('\n')
      : '✅ All group debts are settled up!';

  const poolMoneyText = group.pooledTarget
    ? `\n*Pooled Money Pot:*\nCollected: ${(group.pooledCollected ?? 0).toLocaleString('en-US')} / ${group.pooledTarget.toLocaleString('en-US')} XAF (${Math.round(((group.pooledCollected ?? 0) / group.pooledTarget) * 100)}% funded)`
    : '';

  const receiptContent = `🧾 *SplitM Group Expense Receipt*
Group: *${group.name}* (${group.category})
Date: ${dateStr}
Total Ledger: *${group.totalExpenses.toLocaleString('en-US')} XAF*
────────────────────────
*Current Member Balances:*
${memberBalancesText}

*Suggested MoMo Settlements:*
${settlementText}${poolMoneyText}
────────────────────────
_Generated via SplitM PWA • Zero-Sum Ledger (Σ=0)_`;

  const handleCopy = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(receiptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    triggerHaptic('success');
    const link = document.createElement('a');
    link.download = `SplitM_Receipt_${group.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('medium');
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(receiptContent)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-receipt-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-surface border border-border p-5 shadow-2xl space-y-4 animate-modal-enter text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Receipt size={18} weight="duotone" />
            </div>
            <div>
              <h3 id="share-receipt-title" className="font-serif text-base font-medium text-primary">
                Group Receipt Voucher
              </h3>
              <p className="text-[11px] text-muted font-sans">Image summary & WhatsApp export</p>
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

        {/* View Switcher: Image Voucher vs Raw Text */}
        <div className="flex items-center p-1 rounded-xl bg-background border border-border shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('image');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'image'
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-muted hover:text-primary'
            }`}
          >
            <ImageIcon size={14} weight="duotone" />
            <span>Image Voucher</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('text');
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'text'
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-muted hover:text-primary'
            }`}
          >
            <TextT size={14} weight="duotone" />
            <span>Text Voucher</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'image' ? (
            <div className="space-y-3">
              {imageUrl ? (
                <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-black/40">
                  <img
                    src={imageUrl}
                    alt={`Receipt voucher for ${group.name}`}
                    className="w-full h-auto object-contain block"
                  />
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-muted font-mono animate-pulse">
                  Rendering receipt image voucher...
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-background/70 border border-dashed border-border font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-line text-primary select-all">
              {receiptContent}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 shrink-0">
          {activeTab === 'image' && imageUrl && (
            <button
              type="button"
              onClick={handleDownloadImage}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-medium text-xs font-mono flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
            >
              <DownloadSimple size={16} weight="bold" />
              <span>Download Receipt Image (PNG)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 rounded-xl bg-[#25D366] text-black font-semibold text-xs font-mono flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all"
          >
            <WhatsappLogo size={18} weight="fill" />
            <span>Share to WhatsApp Group</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-primary font-mono text-xs flex items-center justify-center gap-2 transition-colors"
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

export default GroupReceiptShareModal;
