import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowClockwise,
  Check,
  X,
  DeviceMobile,
  HandCoins,
  ArrowsSplit,
  Warning,
} from '@phosphor-icons/react';
import { ReceiptTearDivider } from '../dashboard/ReceiptTearDivider';
import type { GroupCardData } from '../dashboard/GroupRingCard';
import type {
  PaymentRequest,
  MemberShare,
  PaymentRecipient,
} from '../../payments/mock/mockPaymentService';
import { mockPaymentService } from '../../payments/mock/mockPaymentService';
import type { Locale } from '../../i18n/addFlow.i18n';
import { addFlowTranslations } from '../../i18n/addFlow.i18n';
import { triggerHaptic } from '../../core/utils/haptics';

interface StepConfirmAndStatusProps {
  group: GroupCardData;
  recipient: PaymentRecipient;
  totalAmount: number;
  note?: string;
  shares: Omit<MemberShare, 'status' | 'updatedAt'>[];
  locale: Locale;
  onDone: () => void;
}

export const StepConfirmAndStatus: React.FC<StepConfirmAndStatusProps> = ({
  group,
  recipient,
  totalAmount,
  note,
  shares,
  locale,
  onDone,
}) => {
  const t = addFlowTranslations[locale];

  // Payment Request state
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [resendingMemberId, setResendingMemberId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to live status updates once initiated
  useEffect(() => {
    if (!paymentRequest?.id) return;

    const unsubscribe = mockPaymentService.subscribe(paymentRequest.id, (updated) => {
      setPaymentRequest(updated);
    });

    return () => {
      unsubscribe();
    };
  }, [paymentRequest?.id]);

  // Initiate request handler
  const handleSendPaymentRequests = () => {
    triggerHaptic('medium');

    const created = mockPaymentService.initiatePaymentRequest({
      groupId: group.id,
      groupName: group.name,
      recipient,
      totalAmount,
      note,
      shares,
    });

    setPaymentRequest(created);
  };

  const handleResend = (memberId: string, memberName: string) => {
    if (!paymentRequest) return;
    triggerHaptic('light');
    setResendingMemberId(memberId);

    mockPaymentService.resendRequest(paymentRequest.id, memberId);

    setToastMessage(t.resendSentToast.replace('{name}', memberName));
    setTimeout(() => {
      setToastMessage(null);
      setResendingMemberId(null);
    }, 2500);
  };

  const handleCoverShare = (memberId: string, memberName: string, amount: number) => {
    if (!paymentRequest) return;
    triggerHaptic('medium');
    mockPaymentService.coverShare(paymentRequest.id, memberId, 'Bryan T. (You)');
    setToastMessage(
      t.coverShareSuccess
        .replace('{name}', memberName)
        .replace('{amount}', mockPaymentService.formatFcfa(amount))
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReassignShare = (memberId: string, memberName: string, amount: number) => {
    if (!paymentRequest) return;
    triggerHaptic('medium');
    mockPaymentService.reassignShare(paymentRequest.id, memberId);
    setToastMessage(
      t.reassignShareSuccess
        .replace('{name}', memberName)
        .replace('{amount}', mockPaymentService.formatFcfa(amount))
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelAndRefund = () => {
    if (!paymentRequest) return;
    triggerHaptic('tear');
    mockPaymentService.cancelAndRefund(paymentRequest.id);
    setToastMessage(t.cancelledNotice);
    setTimeout(() => {
      onDone();
    }, 1800);
  };

  // Helper to trigger developer simulation for testing declined/expired states
  const handleSimulateDecline = () => {
    if (!paymentRequest) return;
    const waiting = paymentRequest.shares.find((s) => s.status === 'waiting');
    if (waiting) {
      mockPaymentService.simulateMemberDecline(paymentRequest.id, waiting.memberId);
    }
  };

  // Helper to fast-forward approval
  const handleForceApproveAll = () => {
    if (!paymentRequest) return;
    mockPaymentService.forceApproveAll(paymentRequest.id);
  };

  const declinedMember = paymentRequest?.shares.find(
    (s) => s.status === 'declined' || s.status === 'expired'
  );

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-xl w-full mx-auto animate-fade-in overflow-y-auto">
      {/* Toast banner */}
      {toastMessage && (
        <div className="mb-3 p-3 rounded-xl bg-accent text-white text-xs font-sans font-medium flex items-center justify-between shadow-lg animate-fade-in">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* PHASE 5A: Receipt Summary Card (Before Sending) */}
      {!paymentRequest ? (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-medium text-primary tracking-tight">
                {t.step5Title}
              </h2>
              <p className="text-sm text-muted font-sans mt-0.5">
                {t.step5Subtitle}
              </p>
            </div>

            {/* Receipt Summary Card with Torn Notches */}
            <div className="relative rounded-2xl bg-surface border border-border shadow-md overflow-hidden mb-5">
              <ReceiptTearDivider orientation="top" />

              <div className="p-5 sm:p-6 space-y-4">
                {/* Receipt Header */}
                <div className="text-center pb-3 border-b border-dashed border-border">
                  <span className="text-[10px] font-mono tracking-widest text-muted uppercase">
                    SplitM • Group Payment Voucher
                  </span>
                  <h3 className="font-serif text-lg font-medium text-primary mt-0.5">
                    {t.receiptSummaryTitle}
                  </h3>
                  <p className="text-xs font-sans text-muted">
                    {group.name}
                  </p>
                </div>

                {/* Recipient info */}
                <div className="space-y-1.5 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-muted">{t.recipientLabel}:</span>
                    <span className="font-medium text-primary">{recipient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">{t.phoneLabel}:</span>
                    <span className="font-mono font-medium text-primary">{recipient.phoneNumber}</span>
                  </div>
                  {note && (
                    <div className="flex justify-between">
                      <span className="text-muted">{t.purposeLabel}:</span>
                      <span className="italic text-primary/80">{note}</span>
                    </div>
                  )}
                </div>

                {/* Dashed line */}
                <div className="border-t border-dashed border-border pt-3">
                  <span className="text-[11px] font-sans font-semibold text-muted uppercase tracking-wider block mb-2">
                    {t.sharesBreakdown}
                  </span>

                  <div className="space-y-2">
                    {shares.map((share) => (
                      <div
                        key={share.memberId}
                        className="flex items-center justify-between text-xs font-sans"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-surface-elevated text-[10px] font-bold text-muted flex items-center justify-center">
                            {share.initials}
                          </span>
                          <span className="text-primary">{share.memberName}</span>
                        </div>
                        <span className="font-mono font-medium text-primary">
                          {mockPaymentService.formatFcfa(share.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Line */}
                <div className="pt-3 border-t-2 border-primary/20 flex items-center justify-between">
                  <span className="font-serif text-base font-semibold text-primary">
                    {t.totalPayable}
                  </span>
                  <span className="font-serif text-xl font-bold text-accent">
                    {mockPaymentService.formatFcfa(totalAmount)}
                  </span>
                </div>
              </div>

              <ReceiptTearDivider orientation="bottom" />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-3 border-t border-border mt-auto">
            <button
              type="button"
              onClick={handleSendPaymentRequests}
              className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-accent text-white font-sans font-medium text-sm hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <DeviceMobile size={18} weight="duotone" />
              <span>{t.sendRequestsBtn}</span>
            </button>
          </div>
        </div>
      ) : paymentRequest.status === 'completed' ? (
        /* PHASE 5C: Payment Sent! Success Receipt Animation */
        <div className="flex-1 flex flex-col items-center justify-between text-center py-4">
          <div className="w-full">
            {/* Animated Printed Receipt Card */}
            <div className="relative w-full max-w-sm mx-auto bg-surface border border-border rounded-2xl shadow-xl overflow-hidden animate-slide-up mb-6">
              <ReceiptTearDivider orientation="top" />

              <div className="p-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 animate-scale-up">
                  <CheckCircle size={36} weight="duotone" />
                </div>

                <h3 className="font-serif text-xl font-bold text-primary">
                  {t.allApprovedTitle}
                </h3>

                <p className="text-xs font-sans text-muted leading-relaxed">
                  {t.allApprovedDesc
                    .replace('{amount}', mockPaymentService.formatFcfa(paymentRequest.totalAmount))
                    .replace('{recipient}', paymentRequest.recipient.name)}
                </p>

                <div className="py-2.5 px-3 rounded-xl bg-surface-elevated border border-border inline-block">
                  <span className="text-[11px] font-mono text-muted">
                    {t.merchantReceiptCode.replace('{ref}', paymentRequest.ussdRef || 'TXN-90218')}
                  </span>
                </div>

                <div className="pt-3 border-t border-dashed border-border flex justify-between items-center text-xs font-sans">
                  <span className="text-muted">Total Paid</span>
                  <span className="font-serif font-bold text-base text-primary">
                    {mockPaymentService.formatFcfa(paymentRequest.totalAmount)}
                  </span>
                </div>
              </div>

              <ReceiptTearDivider orientation="bottom" />
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('success');
              onDone();
            }}
            className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-accent text-white font-sans font-medium text-sm hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{t.doneBtn}</span>
            <Check size={18} weight="bold" />
          </button>
        </div>
      ) : (
        /* PHASE 5B: Live Status Screen & Action Needed (Declined) */
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-medium text-primary tracking-tight">
                {paymentRequest.status === 'action_needed' ? t.actionNeededTitle : t.liveStatusTitle}
              </h2>
              <p className="text-sm text-muted font-sans mt-0.5">
                {paymentRequest.status === 'action_needed' ? t.actionNeededDesc : t.liveStatusDesc}
              </p>
            </div>

            {/* USSD Network Active Indicator */}
            <div className="mb-4 p-3 rounded-xl bg-surface-elevated border border-border flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
              <span className="text-xs font-sans text-muted">
                {locale === 'en'
                  ? 'Carrier USSD prompts active (*126# / #150# prompt on handset)'
                  : 'Invites USSD opérateur actives (*126# / #150# sur mobile)'}
              </span>
            </div>

            {/* If Member Declined or Expired -> Show Action Required Card */}
            {paymentRequest.status === 'action_needed' && declinedMember && (
              <div className="mb-4 p-4 rounded-2xl border border-[#D95D39]/40 bg-[#D95D39]/10 animate-fade-in space-y-3">
                <div className="flex items-center gap-2 text-[#D95D39]">
                  <Warning size={20} weight="duotone" />
                  <h4 className="font-serif text-sm font-semibold">
                    {declinedMember.memberName}{' '}
                    {declinedMember.status === 'declined' ? 'declined prompt' : 'timed out'}
                  </h4>
                </div>

                <p className="text-xs font-sans text-primary/80">
                  {declinedMember.memberName}'s share of{' '}
                  <strong className="font-mono">
                    {mockPaymentService.formatFcfa(declinedMember.amount)}
                  </strong>{' '}
                  is uncollected. Choose how to proceed:
                </p>

                {/* 3 Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleCoverShare(
                        declinedMember.memberId,
                        declinedMember.memberName,
                        declinedMember.amount
                      )
                    }
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-accent text-white font-sans text-xs font-medium hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <HandCoins size={16} weight="duotone" />
                    <span>{t.coverShareBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReassignShare(
                        declinedMember.memberId,
                        declinedMember.memberName,
                        declinedMember.amount
                      )
                    }
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-border bg-surface text-primary font-sans text-xs font-medium hover:bg-surface-elevated active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowsSplit size={16} weight="duotone" />
                    <span>{t.reassignShareBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelAndRefund}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-border bg-surface text-[#D95D39] font-sans text-xs font-medium hover:bg-surface-elevated active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={16} weight="duotone" />
                    <span>{t.cancelRefundBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Member Shares with Live Status */}
            <div className="space-y-2.5">
              {paymentRequest.shares.map((share) => {
                const isWaiting = share.status === 'waiting';
                const isApproved = share.status === 'approved';
                const isDeclined = share.status === 'declined';
                const isExpired = share.status === 'expired';

                return (
                  <div
                    key={share.memberId}
                    className="p-3.5 rounded-2xl border border-border bg-surface flex items-center justify-between gap-3"
                  >
                    {/* Left: Avatar & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full ring-2 ring-border bg-surface-elevated overflow-hidden shrink-0">
                        {share.avatarUrl ? (
                          <img
                            src={share.avatarUrl}
                            alt={share.memberName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-muted">
                            {share.initials}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-serif text-sm font-medium text-primary truncate">
                          {share.memberName}
                        </h4>
                        <span className="font-mono text-xs text-muted block">
                          {mockPaymentService.formatFcfa(share.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Live Status Pill & Resend Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-sans font-medium flex items-center gap-1">
                          <CheckCircle size={14} weight="fill" />
                          <span>{t.approvedStatus}</span>
                        </span>
                      )}

                      {isWaiting && (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-sans font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{t.waitingStatus}</span>
                          </span>

                          <button
                            type="button"
                            disabled={resendingMemberId === share.memberId}
                            onClick={() => handleResend(share.memberId, share.memberName)}
                            className="min-h-[44px] px-2.5 py-1 rounded-xl text-xs font-sans text-muted hover:text-primary hover:bg-surface-elevated border border-border flex items-center gap-1 transition-all"
                            title={t.resendAction}
                          >
                            <ArrowClockwise
                              size={14}
                              weight="bold"
                              className={resendingMemberId === share.memberId ? 'animate-spin' : ''}
                            />
                            <span>{t.resendAction}</span>
                          </button>
                        </div>
                      )}

                      {isDeclined && (
                        <span className="px-2.5 py-1 rounded-full bg-[#D95D39]/10 text-[#D95D39] border border-[#D95D39]/20 text-xs font-sans font-medium flex items-center gap-1">
                          <XCircle size={14} weight="fill" />
                          <span>{t.declinedStatus}</span>
                        </span>
                      )}

                      {isExpired && (
                        <span className="px-2.5 py-1 rounded-full bg-muted/15 text-muted border border-border text-xs font-sans font-medium flex items-center gap-1">
                          <Clock size={14} weight="fill" />
                          <span>{t.expiredStatus}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Developer Controls for QA Testing */}
          <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-muted">
            <span className="text-[11px] font-sans">Simulator Controls:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSimulateDecline}
                className="px-2.5 py-1 rounded-lg border border-border hover:bg-surface-elevated text-accent text-[11px] min-h-[36px]"
              >
                Simulate Decline
              </button>
              <button
                type="button"
                onClick={handleForceApproveAll}
                className="px-2.5 py-1 rounded-lg border border-border hover:bg-surface-elevated text-emerald-500 text-[11px] min-h-[36px]"
              >
                Approve All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
