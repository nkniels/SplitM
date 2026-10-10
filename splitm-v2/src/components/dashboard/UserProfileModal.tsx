import React, { useState } from 'react';
import {
  X,
  User,
  Check,
  Camera,
} from '@phosphor-icons/react';
import { triggerHaptic } from '../../core/utils/haptics';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentAvatarUrl?: string;
  onSaveProfile: (name: string, avatarUrl: string, provider: 'mtn' | 'orange') => void;
}

const AVATAR_PRESETS = [
  '/avatars/adult_1.jpg',
  '/avatars/adult_2.jpg',
  '/avatars/teen_1.jpg',
  '/avatars/teen_2.jpg',
  '/avatars/elder_1.jpg',
  '/avatars/elder_2.jpg',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentName,
  currentAvatarUrl,
  onSaveProfile,
}) => {
  const [name, setName] = useState<string>(currentName);
  const [avatarUrl, setAvatarUrl] = useState<string>(currentAvatarUrl || AVATAR_PRESETS[0]);
  const [provider, setProvider] = useState<'mtn' | 'orange'>('orange');
  const [phone, setPhone] = useState<string>('+237 690 12 34 56');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    onSaveProfile(name, avatarUrl, provider);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-surface border border-border p-5 shadow-2xl space-y-4 animate-modal-enter text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <User size={18} weight="duotone" />
            </div>
            <div>
              <h3 id="user-profile-title" className="font-serif text-base font-medium text-primary">
                My Profile
              </h3>
              <p className="text-[11px] text-muted font-sans">Identity & MoMo Payouts</p>
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

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar Selector */}
          <div className="text-center space-y-2">
            <div className="relative inline-block mx-auto">
              <img
                src={avatarUrl}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-accent shadow-md mx-auto"
              />
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-accent text-white">
                <Camera size={12} weight="bold" />
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setAvatarUrl(preset);
                  }}
                  className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                    avatarUrl === preset ? 'ring-2 ring-accent scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-sans text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1">
              Mobile Money Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono text-primary focus:outline-none focus:border-accent"
            />
          </div>

          {/* Preferred MoMo Provider */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1">
              Default Payout Wallet
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setProvider('mtn');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                  provider === 'mtn'
                    ? 'border-[#FFCC00] bg-[#FFCC00]/10 text-primary font-bold ring-1 ring-[#FFCC00]'
                    : 'border-border bg-surface text-muted hover:text-primary'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FFCC00]" />
                MTN MoMo
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setProvider('orange');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                  provider === 'orange'
                    ? 'border-[#FF7900] bg-[#FF7900]/10 text-primary font-bold ring-1 ring-[#FF7900]'
                    : 'border-border bg-surface text-muted hover:text-primary'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FF7900]" />
                Orange Money
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-accent text-white font-mono text-xs font-semibold shadow-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
          >
            <Check size={14} weight="bold" />
            <span>Save Profile Preferences</span>
          </button>
        </form>
      </div>
    </div>
  );
};
