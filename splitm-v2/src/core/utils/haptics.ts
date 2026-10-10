/**
 * SplitM Tactile Paper Haptics
 * Micro-vibration pulses simulating tactile physical paper receipt interactions.
 */

export const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'tear' = 'light') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(22);
        break;
      case 'tear':
        // Double micro-click pattern simulating tearing paper perforations
        navigator.vibrate([15, 30, 20]);
        break;
      case 'success':
        // Triple micro-pulse for settled payment / zero-sum balance
        navigator.vibrate([18, 40, 18, 40, 28]);
        break;
    }
  } catch {
    // Graceful fallback on devices that reject vibration
  }
};
