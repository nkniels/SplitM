import React from 'react';
import { X, Check, ArrowUpRight, ArrowDownRight, ArrowRight } from '@phosphor-icons/react';

export interface RingMember {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  balanceXaf: number; // positive = owed to them (+), negative = owes the group (-)
  paymentProvider?: 'mtn' | 'orange' | 'cash';
  role?: string;
}

interface MemberBalancePopoverProps {
  member: RingMember;
  onClose: () => void;
  onSettle?: (member: RingMember) => void;
  positionStyle?: React.CSSProperties;
}

export const MemberBalancePopover: React.FC<MemberBalancePopoverProps> = ({
  member,
  onClose,
  onSettle,
  positionStyle,
}) => {
  const isPositive = member.balanceXaf > 0;
  const isZero = member.balanceXaf === 0;

  const formattedAmount = `${Math.abs(member.balanceXaf).toLocaleString('en-US')} XAF`;

  return (
    <div
      style={positionStyle}
      className="absolute z-30 w-56 max-w-[calc(100%-28px)] rounded-2xl bg-surface border border-border p-3 shadow-xl animate-modal-enter text-left"
      role="dialog"
      aria-label={`Balance for ${member.name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-border-subtle flex items-center justify-center text-xs font-semibold text-primary border border-border">
              {member.initials}
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-primary leading-tight">
              {member.name}
            </h4>
            <span className="text-[10px] text-muted capitalize">
              {member.paymentProvider === 'mtn' && 'MTN MoMo'}
              {member.paymentProvider === 'orange' && 'Orange Money'}
              {(!member.paymentProvider || member.paymentProvider === 'cash') && 'Cash'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-hover transition-colors"
          aria-label="Close details"
        >
          <X size={14} weight="duotone" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[11px] text-muted">Group Ledger</span>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <>
              <ArrowDownRight size={13} weight="duotone" className="text-success" />
              <span className="text-xs font-bold font-mono text-success tabular-nums">
                +{formattedAmount}
              </span>
            </>
          ) : isZero ? (
            <>
              <Check size={13} weight="duotone" className="text-muted" />
              <span className="text-xs font-medium font-mono text-muted tabular-nums">
                Settled (0)
              </span>
            </>
          ) : (
            <>
              <ArrowUpRight size={13} weight="duotone" className="text-accent" />
              <span className="text-xs font-bold font-mono text-accent tabular-nums">
                -{formattedAmount}
              </span>
            </>
          )}
        </div>
      </div>
      <p className="mt-1 text-[10px] text-muted text-right">
        {isPositive
          ? 'Group owes them'
          : isZero
          ? 'All settled up'
          : 'Owes to the group'}
      </p>

      {member.balanceXaf !== 0 && onSettle && (
        <button
          type="button"
          onClick={() => onSettle(member)}
          className="mt-2.5 w-full py-1.5 px-2 rounded-xl bg-accent text-white font-mono text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span>Settle via MoMo</span>
          <ArrowRight size={12} weight="bold" />
        </button>
      )}
    </div>
  );
};

export default MemberBalancePopover;
