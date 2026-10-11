import React from 'react';
import { Coins, ArrowsClockwise, ArrowRight } from '@phosphor-icons/react';
import type { GroupCardData } from '../dashboard/GroupRingCard';
import type { Locale } from '../../i18n/addFlow.i18n';
import { addFlowTranslations } from '../../i18n/addFlow.i18n';
import { triggerHaptic } from '../../core/utils/haptics';

interface StepChooseActionProps {
  group: GroupCardData;
  locale: Locale;
  onChangeGroup: () => void;
  onSelectPmp: () => void;
  onSelectSettleDebts: () => void;
}

export const StepChooseAction: React.FC<StepChooseActionProps> = ({
  group,
  locale,
  onChangeGroup,
  onSelectPmp,
  onSelectSettleDebts,
}) => {
  const t = addFlowTranslations[locale];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-xl w-full mx-auto animate-fade-in">
      {/* Selected Group Top Bar with Change Link */}
      <div className="mb-6 p-3.5 rounded-2xl bg-surface-elevated/70 border border-border flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-muted block">
            {t.activeLedger}
          </span>
          <h3 className="font-serif text-base font-semibold text-primary truncate">
            {group.name}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onChangeGroup();
          }}
          className="min-h-[44px] px-3 rounded-xl text-xs font-sans font-medium text-accent hover:text-accent/80 hover:bg-surface active:scale-[0.98] transition-all flex items-center gap-1 shrink-0"
        >
          <span>{t.changeGroup}</span>
        </button>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-medium text-primary tracking-tight">
          {t.step2Title}
        </h2>
        <p className="text-sm text-muted font-sans mt-0.5">
          {t.step2Subtitle.replace('{groupName}', group.name)}
        </p>
      </div>

      {/* Two Large Action Cards */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Card a: Pool Money Pot (PMP) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            triggerHaptic('medium');
            onSelectPmp();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectPmp();
            }
          }}
          className="min-h-[140px] p-5 sm:p-6 rounded-3xl border border-border bg-surface hover:border-accent hover:bg-surface-elevated transition-all cursor-pointer text-left flex flex-col justify-between group active:scale-[0.99] select-none shadow-sm hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <Coins size={28} weight="duotone" className="text-accent shrink-0" />
                <h3 className="font-serif text-lg sm:text-xl font-medium text-primary group-hover:text-accent transition-colors">
                  {t.pmpCardTitle}
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 shrink-0">
                {t.pmpCardBadge}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-sans font-medium text-primary/80 mb-1">
              {t.pmpCardSubtitle}
            </p>
            <p className="text-xs font-sans text-muted leading-relaxed">
              {t.pmpCardDesc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-sans font-medium text-accent">
            <span>{locale === 'en' ? 'Start immediate collection' : 'Lancer la collecte immédiate'}</span>
            <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card b: Settle Debts */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            triggerHaptic('medium');
            onSelectSettleDebts();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectSettleDebts();
            }
          }}
          className="min-h-[140px] p-5 sm:p-6 rounded-3xl border border-border bg-surface hover:border-emerald-500 hover:bg-surface-elevated transition-all cursor-pointer text-left flex flex-col justify-between group active:scale-[0.99] select-none shadow-sm hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <ArrowsClockwise size={28} weight="duotone" className="text-emerald-500 shrink-0" />
                <h3 className="font-serif text-lg sm:text-xl font-medium text-primary group-hover:text-emerald-500 transition-colors">
                  {t.settleCardTitle}
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                {t.settleCardBadge}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-sans font-medium text-primary/80 mb-1">
              {t.settleCardSubtitle}
            </p>
            <p className="text-xs font-sans text-muted leading-relaxed">
              {t.settleCardDesc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-sans font-medium text-emerald-500">
            <span>{locale === 'en' ? 'View simplified debts' : 'Voir les dettes simplifiées'}</span>
            <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
