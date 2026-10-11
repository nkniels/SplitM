import React, { useState, useEffect } from 'react';
import { X, QrCode, Flashlight, CheckCircle, Camera } from '@phosphor-icons/react';
import { triggerHaptic } from '../../core/utils/haptics';
import type { Locale } from '../../i18n/addFlow.i18n';
import { addFlowTranslations } from '../../i18n/addFlow.i18n';

interface CameraScannerModalProps {
  isOpen: boolean;
  locale: Locale;
  onClose: () => void;
  onScanResult: (result: {
    merchantName: string;
    phoneNumber: string;
    amount?: number;
    network: 'mtn' | 'orange';
  }) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  locale,
  onClose,
  onScanResult,
}) => {
  const t = addFlowTranslations[locale];
  const [torchOn, setTorchOn] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDetected(false);
      setIsSimulating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = (merchantPreset?: {
    name: string;
    phone: string;
    network: 'mtn' | 'orange';
    amount: number;
  }) => {
    triggerHaptic('medium');
    setIsSimulating(true);

    const preset = merchantPreset || {
      name: 'Supermarché Dovv Bastos',
      phone: '+237 677 82 91 00',
      network: 'mtn' as const,
      amount: 17500,
    };

    setTimeout(() => {
      setDetected(true);
      triggerHaptic('success');

      setTimeout(() => {
        onScanResult({
          merchantName: preset.name,
          phoneNumber: preset.phone,
          network: preset.network,
          amount: preset.amount,
        });
        onClose();
      }, 700);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-modal-title"
    >
      <div
        className="w-full max-w-md bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scanner Top Bar */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2">
            <QrCode size={22} weight="duotone" className="text-accent" />
            <h3 id="scanner-modal-title" className="font-serif text-base font-medium text-primary">
              {t.scanModalTitle}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setTorchOn(!torchOn);
              }}
              className={`min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors ${
                torchOn ? 'bg-accent text-white' : 'text-muted hover:text-primary hover:bg-surface-elevated'
              }`}
              aria-label="Toggle Torch"
            >
              <Flashlight size={20} weight={torchOn ? 'fill' : 'duotone'} />
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-primary hover:bg-surface-elevated"
              aria-label={t.close}
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-neutral-950 aspect-[4/3] flex items-center justify-center overflow-hidden">
          {/* Simulated Dark Camera View */}
          <div className="absolute inset-0 bg-neutral-900 opacity-90" />

          {/* Viewfinder Reticle Frame */}
          <div className="relative w-56 h-56 border-2 border-white/30 rounded-2xl flex items-center justify-center overflow-hidden">
            {/* 4 Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-accent rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-accent rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-accent rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-accent rounded-br-lg" />

            {/* Laser scanning line animation */}
            <div
              className={`absolute left-2 right-2 h-[2px] bg-accent shadow-[0_0_8px_#D95D39] transition-opacity ${
                isSimulating ? 'animate-bounce opacity-100' : 'opacity-70'
              }`}
              style={{
                top: isSimulating ? '45%' : '50%',
              }}
            />

            {detected ? (
              <div className="z-10 flex flex-col items-center gap-2 bg-black/75 px-4 py-3 rounded-2xl border border-emerald-500 text-emerald-400 animate-scale-up">
                <CheckCircle size={36} weight="duotone" />
                <span className="text-xs font-medium font-sans">{t.mockScanSuccess}</span>
              </div>
            ) : (
              <div className="text-white/40 flex flex-col items-center gap-1.5 pointer-events-none">
                <Camera size={32} weight="duotone" />
                <span className="text-[11px] font-sans text-center max-w-[140px]">
                  {t.scanModalDesc}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Simulator Triggers */}
        <div className="p-4 bg-surface space-y-2">
          <p className="text-xs text-muted font-sans font-medium">
            {locale === 'en' ? 'Simulator Quick Scan Actions:' : 'Actions de simulation rapide :'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSimulating}
              onClick={() =>
                handleSimulateScan({
                  name: 'Supermarché Dovv Bastos',
                  phone: '+237 677 82 91 00',
                  network: 'mtn',
                  amount: 17500,
                })
              }
              className="min-h-[44px] p-2 text-left rounded-xl border border-border bg-surface-elevated hover:border-accent/40 text-primary transition-all flex flex-col justify-center"
            >
              <span className="text-xs font-semibold truncate">Dovv Bastos (MTN)</span>
              <span className="text-[11px] text-muted">17 500 FCFA</span>
            </button>

            <button
              type="button"
              disabled={isSimulating}
              onClick={() =>
                handleSimulateScan({
                  name: 'Boulangerie Acropole',
                  phone: '+237 699 15 42 18',
                  network: 'orange',
                  amount: 9800,
                })
              }
              className="min-h-[44px] p-2 text-left rounded-xl border border-border bg-surface-elevated hover:border-accent/40 text-primary transition-all flex flex-col justify-center"
            >
              <span className="text-xs font-semibold truncate">Acropole (Orange)</span>
              <span className="text-[11px] text-muted">9 800 FCFA</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulateScan()}
            className="w-full min-h-[44px] mt-2 py-2.5 px-4 rounded-xl bg-accent text-white font-sans font-medium text-xs hover:bg-accent/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <QrCode size={18} weight="bold" />
            {isSimulating
              ? (locale === 'en' ? 'Decoding QR Barcode...' : 'Décodage du code...')
              : (locale === 'en' ? 'Simulate Generic Merchant QR' : 'Simuler un QR code marchand')}
          </button>
        </div>
      </div>
    </div>
  );
};
