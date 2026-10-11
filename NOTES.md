# SplitM — Central Add Flow (`design/add-flow`)

## 1. Overview & Architecture
This flow implements the full-screen slide-up sheet activated by tapping the central floating `+` button in the docked receipt bottom navigation. It adheres to SplitM's **human-design** specifications, Garry Tan's **gstack** software factory ethos, and integer-cent zero-sum ledger invariants.

### Key Architectural Decisions
1. **Single Modal Flow with Internal Step Machine**:
   - Built as a full-screen slide-up sheet (`AddFlowSheet.tsx`) rather than fragmented browser pages.
   - Preserves state across transitions and supports natural back-button traversal, animated step indicator dots ("Step 2 of 5"), and instant language toggle (EN / FR).
2. **Aggregator-Ready Mock Payment Service (`/src/payments/mock/mockPaymentService.ts`)**:
   - Decoupled behind a standardized mobile money payment interface (`PaymentRequest`, `MemberShare`, `subscribe`).
   - Simulates realistic USSD push prompt delivery to Cameroon handsets (`*126#` for MTN MoMo, `#150#` for Orange Money).
   - Designed so a live payment aggregator (e.g. CinetPay, Notch Pay, Campay, or MTN MoMo Open API) can replace the mock without any modifications to the React UI components.
3. **Single-File Bilingual i18n (`/src/i18n/addFlow.i18n.ts`)**:
   - Centralizes 100% of strings, field labels, validation notices, receipt text, and error states for English (`en`) and French (`fr`).

---

## 2. Assumptions & Mobile Money Logic
- **Currency & Integer Precision**:
  - Currency formatting strictly adheres to `"12 500 FCFA"` (space thousand-separator, integer only, no fractional decimals).
  - Remainder pennies in Step 4 ("Split equally") are distributed via Euclidean division: the first `remainder` members absorb `+1 FCFA`, guaranteeing that $\sum \text{assigned} \equiv \text{total}$.
- **Cameroon Phone Number Range & Carrier Auto-Detection**:
  - Standard Cameroon mobile numbers are 9 digits beginning with `6` (`+237 6XX XX XX XX`).
  - MTN Cameroon: `67x`, `650-654`, `680-683`.
  - Orange Cameroon: `69x`, `655-659`.
  - Prefix detection automatically renders real-time carrier badges (MTN yellow or Orange orange) as the user types.
- **PIN Security & Handset Auth**:
  - SplitM never collects or prompts for user Mobile Money PINs. The validation prompt is pushed by the carrier's USSD gateway directly to the subscriber's phone screen.
- **Decline / Timeout Handling (Step 5)**:
  - If a member declines or their USSD prompt times out, the organizer receives three clear recovery paths:
    1. *Cover their share*: Organizer absorbs the pending amount.
    2. *Reassign*: The share is reallocated evenly across the remaining participating members.
    3. *Cancel & refund*: The pooled collection is aborted with zero charges.

---

## 3. Human Design & Accessibility Standards
- **Iconography**: Phosphor Icons (`@phosphor-icons/react`) with duotone styling exclusively. No emojis as icons or list bullets.
- **Typography**: Display titles in Fraunces serif font; UI labels and numbers in DM Sans and monospace.
- **Color Discipline**: Strict 3-color palette (primary neutral, terracotta accent `#D95D39`, and emerald success `#1E7E51`).
- **Touch Ergonomics**: All interactive elements, checkboxes, and buttons maintain a touch target $\ge 44\text{px}$ with sticky thumb-reachable actions at the bottom.
- **Themes & Motion**: Fully verified in Light Mode and Dark Mode; all animations respect `prefers-reduced-motion`.
