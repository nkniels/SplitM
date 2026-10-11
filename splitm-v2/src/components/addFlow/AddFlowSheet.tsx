import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from '@phosphor-icons/react';
import type { GroupCardData } from '../dashboard/GroupRingCard';
import type { Locale } from '../../i18n/addFlow.i18n';
import { addFlowTranslations } from '../../i18n/addFlow.i18n';
import { triggerHaptic } from '../../core/utils/haptics';

// Subcomponents
import { StepChooseGroup } from './StepChooseGroup';
import { StepChooseAction } from './StepChooseAction';
import { StepWhoPaying, type RecipientFormData } from './StepWhoPaying';
import { StepSplitContributions } from './StepSplitContributions';
import { StepConfirmAndStatus } from './StepConfirmAndStatus';
import { StepSettleDebts } from './StepSettleDebts';
import type { MemberShare } from '../../payments/mock/mockPaymentService';

export interface AddFlowSheetProps {
  isOpen: boolean;
  onClose: () => void;
  groups: GroupCardData[];
  defaultGroupId?: string;
  onGroupCreated?: (newGroup: GroupCardData) => void;
  onRequestCreateGroup?: () => void;
}

export type AddFlowStep = 'group' | 'action' | 'pmp_recipient' | 'pmp_split' | 'pmp_confirm' | 'settle_debts';

export const AddFlowSheet: React.FC<AddFlowSheetProps> = ({
  isOpen,
  onClose,
  groups,
  defaultGroupId,
  onGroupCreated,
  onRequestCreateGroup,
}) => {
  const [locale, setLocale] = useState<Locale>('en');
  const t = addFlowTranslations[locale];

  // Flow State
  const [currentStep, setCurrentStep] = useState<AddFlowStep>('group');
  const [selectedGroup, setSelectedGroup] = useState<GroupCardData | null>(null);

  // PMP Flow State
  const [recipientData, setRecipientData] = useState<RecipientFormData | null>(null);
  const [finalShares, setFinalShares] = useState<Omit<MemberShare, 'status' | 'updatedAt'>[]>([]);

  // Inline Quick Create Group modal for Step 1
  const [isInlineCreateGroupOpen, setIsInlineCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Flatmates • Yaoundé');

  // Initialize selected group from default if provided
  useEffect(() => {
    if (isOpen) {
      if (defaultGroupId) {
        const found = groups.find((g) => g.id === defaultGroupId);
        if (found) {
          setSelectedGroup(found);
          setCurrentStep('action');
          return;
        }
      }
      // Default to group selection
      setCurrentStep('group');
    } else {
      // Reset state on close
      setCurrentStep('group');
      setRecipientData(null);
      setFinalShares([]);
    }
  }, [isOpen, defaultGroupId, groups]);

  if (!isOpen) return null;

  // Toggle locale between EN and FR
  const toggleLocale = () => {
    triggerHaptic('light');
    setLocale((prev) => (prev === 'en' ? 'fr' : 'en'));
  };

  // Determine Step Indicators
  const isSettlePath = currentStep === 'settle_debts';

  let currentStepNumber = 1;
  let totalStepsNumber = isSettlePath ? 3 : 5;

  if (currentStep === 'group') {
    currentStepNumber = 1;
    totalStepsNumber = 5;
  } else if (currentStep === 'action') {
    currentStepNumber = 2;
    totalStepsNumber = 5;
  } else if (currentStep === 'pmp_recipient') {
    currentStepNumber = 3;
    totalStepsNumber = 5;
  } else if (currentStep === 'pmp_split') {
    currentStepNumber = 4;
    totalStepsNumber = 5;
  } else if (currentStep === 'pmp_confirm') {
    currentStepNumber = 5;
    totalStepsNumber = 5;
  } else if (currentStep === 'settle_debts') {
    currentStepNumber = 3;
    totalStepsNumber = 3;
  }

  // Handle Back Button navigation
  const handleBack = () => {
    triggerHaptic('light');
    if (currentStep === 'action') {
      setCurrentStep('group');
    } else if (currentStep === 'pmp_recipient') {
      setCurrentStep('action');
    } else if (currentStep === 'pmp_split') {
      setCurrentStep('pmp_recipient');
    } else if (currentStep === 'pmp_confirm') {
      setCurrentStep('pmp_split');
    } else if (currentStep === 'settle_debts') {
      setCurrentStep('action');
    } else {
      onClose();
    }
  };

  // Handle Quick Create Group
  const handleConfirmCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    triggerHaptic('success');
    const created: GroupCardData = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      category: newGroupCategory,
      summaryText: 'All balances settled',
      userBalanceType: 'settled',
      userBalanceAmount: 0,
      totalExpenses: 0,
      pooledCollected: 0,
      pooledTarget: 50000,
      members: [
        {
          id: 'user-self',
          name: 'Bryan T. (You)',
          avatarUrl: '/avatars/adult_1.jpg',
          initials: 'BT',
          balanceXaf: 0,
          paymentProvider: 'orange',
        },
        {
          id: `m-${Date.now()}-1`,
          name: 'Sandrine M.',
          avatarUrl: '/avatars/teen_2.jpg',
          initials: 'SM',
          balanceXaf: 0,
          paymentProvider: 'mtn',
        },
        {
          id: `m-${Date.now()}-2`,
          name: 'Alain K.',
          avatarUrl: '/avatars/adult_2.jpg',
          initials: 'AK',
          balanceXaf: 0,
          paymentProvider: 'mtn',
        },
      ],
    };

    if (onGroupCreated) {
      onGroupCreated(created);
    }

    setSelectedGroup(created);
    setIsInlineCreateGroupOpen(false);
    setNewGroupName('');
    setCurrentStep('action');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background text-primary overflow-hidden animate-slide-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flow-header-step"
    >
      {/* Sticky Top Navigation Bar */}
      <header className="shrink-0 h-16 px-4 border-b border-border bg-surface flex items-center justify-between z-10">
        {/* Left: Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-primary hover:bg-surface-elevated active:scale-[0.95] transition-all"
          aria-label={t.back}
          title={t.back}
        >
          <ArrowLeft size={22} weight="bold" />
        </button>

        {/* Center: Step Indicator */}
        <div className="flex flex-col items-center">
          <span
            id="flow-header-step"
            className="font-mono text-xs font-semibold text-accent uppercase tracking-wider"
          >
            {t.stepOf
              .replace('{current}', String(currentStepNumber))
              .replace('{total}', String(totalStepsNumber))}
          </span>

          {/* Micro Step Dots */}
          <div className="flex gap-1.5 mt-1">
            {Array.from({ length: totalStepsNumber }).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx + 1 === currentStepNumber
                    ? 'w-5 bg-accent'
                    : idx + 1 < currentStepNumber
                    ? 'w-1.5 bg-accent/50'
                    : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Language Toggle & Close Button */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleLocale}
            className="min-w-[44px] min-h-[44px] px-2.5 rounded-full flex items-center justify-center text-xs font-mono font-bold text-muted hover:text-primary hover:bg-surface-elevated transition-colors"
            title="Switch Language (EN / FR)"
            aria-label="Toggle language"
          >
            {locale.toUpperCase()}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-primary hover:bg-surface-elevated active:scale-[0.95] transition-all"
            aria-label={t.close}
            title={t.close}
          >
            <X size={22} weight="bold" />
          </button>
        </div>
      </header>

      {/* Sheet Body Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-background">
        {/* STEP 1: Choose Group */}
        {currentStep === 'group' && (
          <StepChooseGroup
            groups={groups}
            selectedGroupId={selectedGroup?.id}
            locale={locale}
            onSelectGroup={(g) => {
              setSelectedGroup(g);
              setCurrentStep('action');
            }}
            onCreateNewGroup={() => {
              if (onRequestCreateGroup) {
                onRequestCreateGroup();
              } else {
                setIsInlineCreateGroupOpen(true);
              }
            }}
            onJoinWithLink={() => {
              setIsInlineCreateGroupOpen(true);
            }}
          />
        )}

        {/* STEP 2: Choose Action */}
        {currentStep === 'action' && selectedGroup && (
          <StepChooseAction
            group={selectedGroup}
            locale={locale}
            onChangeGroup={() => setCurrentStep('group')}
            onSelectPmp={() => setCurrentStep('pmp_recipient')}
            onSelectSettleDebts={() => setCurrentStep('settle_debts')}
          />
        )}

        {/* PMP STEP 3: Who Are We Paying */}
        {currentStep === 'pmp_recipient' && selectedGroup && (
          <StepWhoPaying
            initialData={recipientData || undefined}
            locale={locale}
            onContinue={(data) => {
              setRecipientData(data);
              setCurrentStep('pmp_split');
            }}
          />
        )}

        {/* PMP STEP 4: Split Contributions */}
        {currentStep === 'pmp_split' && selectedGroup && recipientData && (
          <StepSplitContributions
            group={selectedGroup}
            totalAmount={recipientData.amount}
            locale={locale}
            onInitiate={(shares) => {
              setFinalShares(shares);
              setCurrentStep('pmp_confirm');
            }}
          />
        )}

        {/* PMP STEP 5: Confirm and Initiate / Real-time Status */}
        {currentStep === 'pmp_confirm' && selectedGroup && recipientData && (
          <StepConfirmAndStatus
            group={selectedGroup}
            recipient={{
              name: recipientData.recipientName,
              phoneNumber: recipientData.phoneNumber,
              network: recipientData.network,
            }}
            totalAmount={recipientData.amount}
            note={recipientData.note}
            shares={finalShares}
            locale={locale}
            onDone={() => {
              onClose();
            }}
          />
        )}

        {/* SETTLE DEBTS PATH */}
        {currentStep === 'settle_debts' && selectedGroup && (
          <StepSettleDebts
            group={selectedGroup}
            locale={locale}
            onDone={() => {
              onClose();
            }}
          />
        )}
      </main>

      {/* Inline Create Group Modal */}
      {isInlineCreateGroupOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h3 className="font-serif text-lg font-medium text-primary">
                {t.createGroupBtn}
              </h3>
              <button
                type="button"
                onClick={() => setIsInlineCreateGroupOpen(false)}
                className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-primary"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-medium text-primary mb-1">
                  {locale === 'en' ? 'Group Name' : 'Nom du groupe'}
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Bastos Flatmates, Kribi Trip, Office Lunch"
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-2xl border border-border bg-surface text-primary font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-medium text-primary mb-1">
                  {locale === 'en' ? 'Category / Tag' : 'Catégorie / Tag'}
                </label>
                <input
                  type="text"
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  placeholder="e.g. Flatmates • Yaoundé, Travel • Beach"
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-2xl border border-border bg-surface text-primary font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInlineCreateGroupOpen(false)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl border border-border text-primary font-sans font-medium text-xs hover:bg-surface-elevated"
                >
                  {t.cancelFlow}
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl bg-accent text-white font-sans font-medium text-xs hover:bg-accent/90"
                >
                  {locale === 'en' ? 'Create & Continue' : 'Créer et continuer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
