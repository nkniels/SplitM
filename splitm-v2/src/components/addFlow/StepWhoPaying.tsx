import React, { useState } from 'react';
import {
  QrCode,
  ArrowRight,
  WarningCircle,
} from '@phosphor-icons/react';
import { CameraScannerModal } from './CameraScannerModal';
import { mockPaymentService } from '../../payments/mock/mockPaymentService';
import type { Locale } from '../../i18n/addFlow.i18n';
import { addFlowTranslations } from '../../i18n/addFlow.i18n';
import { triggerHaptic } from '../../core/utils/haptics';

export interface RecipientFormData {
  recipientName: string;
  phoneNumber: string;
  network: 'mtn' | 'orange' | 'unknown';
  amount: number;
  note: string;
}

interface StepWhoPayingProps {
  initialData?: Partial<RecipientFormData>;
  locale: Locale;
  onContinue: (data: RecipientFormData) => void;
}

export const StepWhoPaying: React.FC<StepWhoPayingProps> = ({
  initialData,
  locale,
  onContinue,
}) => {
  const t = addFlowTranslations[locale];

  const [recipientName, setRecipientName] = useState(initialData?.recipientName || '');
  const [phoneRaw, setPhoneRaw] = useState(initialData?.phoneNumber || '670 12 34 56');
  const [amountInput, setAmountInput] = useState(
    initialData?.amount ? String(initialData.amount) : '15000'
  );
  const [note, setNote] = useState(initialData?.note || '');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [hasInteractedWithPhone, setHasInteractedWithPhone] = useState(false);
  const [hasInteractedWithAmount, setHasInteractedWithAmount] = useState(false);

  // Network detection
  const detectedNetwork = mockPaymentService.detectCameroonNetwork(phoneRaw);

  const cleanDigits = phoneRaw.replace(/\D/g, '');
  const localDigits = cleanDigits.startsWith('237') ? cleanDigits.slice(3) : cleanDigits;
  const isPhoneValid = localDigits.length === 9 && localDigits.startsWith('6');

  const parsedAmount = parseInt(amountInput.replace(/\D/g, ''), 10) || 0;
  const isAmountValid = parsedAmount > 0;

  const canProceed = isPhoneValid && isAmountValid;

  const handlePhoneChange = (val: string) => {
    setHasInteractedWithPhone(true);
    setPhoneRaw(val);
  };

  const handleQuickAmount = (val: number) => {
    triggerHaptic('light');
    setHasInteractedWithAmount(true);
    setAmountInput(String(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;

    triggerHaptic('medium');
    onContinue({
      recipientName: recipientName.trim() || (detectedNetwork === 'mtn' ? 'MTN Merchant' : 'Orange Merchant'),
      phoneNumber: `+237 ${localDigits}`,
      network: detectedNetwork,
      amount: parsedAmount,
      note: note.trim(),
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-xl w-full mx-auto animate-fade-in">
      {/* Title & Subtitle */}
      <div className="mb-5">
        <h2 className="font-serif text-2xl font-medium text-primary tracking-tight">
          {t.step3Title}
        </h2>
        <p className="text-sm text-muted font-sans mt-0.5">
          {t.step3Subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          {/* Scan Merchant Code Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsScannerOpen(true);
            }}
            className="w-full min-h-[48px] px-4 py-3 rounded-2xl border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 text-primary font-sans font-medium text-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
          >
            <QrCode size={22} weight="duotone" className="text-accent shrink-0" />
            <span>{t.scanMerchantBtn}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-border" />
            <span className="text-[11px] font-sans uppercase tracking-wider text-muted font-medium">
              {locale === 'en' ? 'Or enter manually' : 'Ou saisir manuellement'}
            </span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>

          {/* Recipient Phone with Auto-Detected Network Badge */}
          <div>
            <label className="block text-xs font-sans font-medium text-primary mb-1.5">
              {t.manualRecipientLabel}
            </label>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-mono font-medium text-muted pointer-events-none">
                +237
              </span>

              <input
                type="tel"
                value={phoneRaw}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => setHasInteractedWithPhone(true)}
                placeholder={t.recipientPhonePlaceholder}
                className="w-full min-h-[46px] pl-16 pr-32 py-2.5 rounded-2xl border border-border bg-surface text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
              />

              {/* Dynamic Carrier Badge */}
              <div className="absolute right-2.5 flex items-center">
                {detectedNetwork === 'mtn' && (
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    MTN MoMo
                  </span>
                )}
                {detectedNetwork === 'orange' && (
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Orange Money
                  </span>
                )}
                {detectedNetwork === 'unknown' && localDigits.length > 2 && (
                  <span className="text-[10px] font-sans text-muted px-1.5 py-0.5">
                    Unknown Carrier
                  </span>
                )}
              </div>
            </div>

            {hasInteractedWithPhone && !isPhoneValid && (
              <p className="mt-1 text-[11px] font-sans text-accent flex items-center gap-1 animate-fade-in">
                <WarningCircle size={14} weight="bold" />
                {t.invalidPhoneError}
              </p>
            )}
          </div>

          {/* Recipient Name (Optional) */}
          <div>
            <label className="block text-xs font-sans font-medium text-primary mb-1.5">
              {t.recipientNameLabel}
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder={t.recipientNamePlaceholder}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-2xl border border-border bg-surface text-primary font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
            />
          </div>

          {/* Amount to Pay */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-sans font-medium text-primary">
                {t.amountLabel}
              </label>
              <span className="text-[11px] font-sans text-muted">
                {t.currencyNote}
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                type="number"
                min="100"
                step="50"
                value={amountInput}
                onChange={(e) => {
                  setHasInteractedWithAmount(true);
                  setAmountInput(e.target.value);
                }}
                onBlur={() => setHasInteractedWithAmount(true)}
                placeholder={t.amountPlaceholder}
                className="w-full min-h-[48px] pl-3.5 pr-20 py-2.5 rounded-2xl border border-border bg-surface text-primary font-serif text-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
              />
              <span className="absolute right-3.5 font-sans font-bold text-xs text-muted pointer-events-none">
                FCFA
              </span>
            </div>

            {/* Quick Amount Selection Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[5000, 10000, 15000, 25000, 50000].map((quickVal) => (
                <button
                  key={quickVal}
                  type="button"
                  onClick={() => handleQuickAmount(quickVal)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-xl border min-h-[32px] transition-all active:scale-[0.98] ${
                    parsedAmount === quickVal
                      ? 'border-accent bg-accent/10 text-accent font-semibold'
                      : 'border-border bg-surface-elevated text-primary/70 hover:text-primary hover:border-accent/30'
                  }`}
                >
                  {mockPaymentService.formatFcfa(quickVal)}
                </button>
              ))}
            </div>

            {hasInteractedWithAmount && !isAmountValid && (
              <p className="mt-1 text-[11px] font-sans text-accent flex items-center gap-1 animate-fade-in">
                <WarningCircle size={14} weight="bold" />
                {t.invalidAmountError}
              </p>
            )}
          </div>

          {/* Optional Note Field */}
          <div>
            <label className="block text-xs font-sans font-medium text-primary mb-1.5">
              {t.noteLabel}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.notePlaceholder}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-2xl border border-border bg-surface text-primary font-sans text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
            />
          </div>
        </div>

        {/* Thumb-Reachable Primary Sticky Footer Button */}
        <div className="pt-4 border-t border-border mt-auto">
          <button
            type="submit"
            disabled={!canProceed}
            className={`w-full min-h-[48px] px-4 py-3 rounded-2xl font-sans font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
              canProceed
                ? 'bg-accent text-white hover:bg-accent/90 active:scale-[0.98] cursor-pointer'
                : 'bg-muted/20 text-muted cursor-not-allowed border border-border'
            }`}
          >
            <span>{t.continueToSplitBtn}</span>
            <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </form>

      {/* Mock Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        locale={locale}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={(res) => {
          setRecipientName(res.merchantName);
          setPhoneRaw(res.phoneNumber);
          if (res.amount) setAmountInput(String(res.amount));
          setHasInteractedWithPhone(true);
          setHasInteractedWithAmount(true);
        }}
      />
    </div>
  );
};
