/**
 * Add Flow Single-File i18n Localization (English & French)
 *
 * Covers all strings, labels, step instructions, validation errors,
 * and empty states across Step 1 to Step 5 and the Settle Debts flow.
 */

export type Locale = 'en' | 'fr';

export const addFlowTranslations = {
  en: {
    // Header & Navigation
    back: 'Back',
    close: 'Close',
    stepOf: 'Step {current} of {total}',
    cancelFlow: 'Cancel transaction',
    changeGroup: 'Change',

    // Step 1: Choose Group
    step1Title: 'Select Group',
    step1Subtitle: 'Choose which ledger to transact within',
    noGroupsTitle: 'No active groups yet',
    noGroupsDesc: 'Create a new group ledger or join an existing one to begin splitting expenses.',
    createGroupBtn: 'Create a group',
    joinWithLinkBtn: 'Join with a link',
    newGroupRow: '+ New group',
    membersCount: '{count} members',
    activeLedger: 'Active Ledger',

    // Step 2: Choose Action
    step2Title: 'Choose Action',
    step2Subtitle: 'Select what you want to do with {groupName}',
    pmpCardTitle: 'Pool Money Pot (PMP)',
    pmpCardSubtitle: 'Pay for something together, now.',
    pmpCardBadge: 'Direct carrier debit',
    pmpCardDesc: 'Collect real-time contributions from members via MTN MoMo / Orange Money to pay a merchant or person immediately.',
    settleCardTitle: 'Settle Debts',
    settleCardSubtitle: 'Clear what members owe each other.',
    settleCardBadge: 'Greedy zero-sum engine',
    settleCardDesc: 'Minimal transaction settlement ledger clearing all accumulated debts between flatmates and travel mates.',

    // Step 3: Who are we paying
    step3Title: 'Who are we paying?',
    step3Subtitle: 'Merchant or recipient details',
    scanMerchantBtn: 'Scan merchant QR code',
    scanModalTitle: 'Scan Merchant Code',
    scanModalDesc: 'Point camera at merchant QR sticker or tap simulated barcode',
    mockScanSuccess: 'Scanned merchant successfully',
    manualRecipientLabel: 'Recipient Mobile Number',
    recipientPhonePlaceholder: '670 00 00 00',
    recipientNameLabel: 'Recipient Name (optional)',
    recipientNamePlaceholder: 'e.g. Boulangerie Bastos, Super U, or Jean P.',
    amountLabel: 'Amount to pay',
    amountPlaceholder: '0',
    currencyNote: 'Amounts in integer FCFA',
    noteLabel: 'What is this for? (optional)',
    notePlaceholder: 'e.g. Friday groceries, dinner bill, electricity token',
    continueToSplitBtn: 'Continue to split contributions',
    invalidPhoneError: 'Please enter a valid Cameroon phone number (9 digits starting with 6)',
    invalidAmountError: 'Please enter an amount greater than 0 FCFA',
    networkDetectedMtn: 'MTN Mobile Money',
    networkDetectedOrange: 'Orange Money',
    networkDetectedUnknown: 'Unknown Carrier',

    // Step 4: Split Contributions
    step4Title: 'Split the contributions',
    step4Subtitle: 'Assign shares for {total}',
    splitEqually: 'Split equally',
    customAmounts: 'Custom amounts',
    excludeMemberTooltip: 'Exclude from this payment',
    included: 'Included',
    excluded: 'Excluded',
    assignedProgress: 'Assigned {assigned} / Total {total}',
    remainingToAssign: 'Remaining {amount}',
    overAssigned: 'Over by {amount}',
    balancedExact: 'Exact match',
    initiateBtn: 'Initiate Pool Money Pot',
    mismatchWarning: 'Total assigned must exactly equal {total} before proceeding.',

    // Step 5: Confirm and Initiate
    step5Title: 'Review & Send Requests',
    step5Subtitle: 'Verify breakdown before triggering carrier prompts',
    receiptSummaryTitle: 'POT PAYMENT RECEIPT',
    recipientLabel: 'Recipient',
    phoneLabel: 'Mobile',
    purposeLabel: 'Purpose',
    totalPayable: 'Total Payable',
    sharesBreakdown: 'Member Breakdown',
    sendRequestsBtn: 'Send payment requests',
    liveStatusTitle: 'Awaiting Approvals',
    liveStatusDesc: 'USSD validation prompts dispatched directly to members phones. Watch responses update in real time.',
    waitingStatus: 'Waiting',
    approvedStatus: 'Approved',
    declinedStatus: 'Declined',
    expiredStatus: 'Expired',
    resendAction: 'Resend prompt',
    resendSentToast: 'Validation prompt resent to {name}',
    allApprovedTitle: 'Payment Sent Successfully!',
    allApprovedDesc: 'All group members validated their mobile money PIN. Payment of {amount} has been processed to {recipient}.',
    merchantReceiptCode: 'Transaction Reference: {ref}',
    doneBtn: 'Done & Return to Dashboard',
    actionNeededTitle: 'Action Required',
    actionNeededDesc: 'A member was unable to authorize the request on their phone.',
    coverShareBtn: 'Cover their share',
    reassignShareBtn: 'Reassign equally',
    cancelRefundBtn: 'Cancel & refund',
    coverShareSuccess: "You covered {name}'s share of {amount}",
    reassignShareSuccess: "Reassigned {name}'s share of {amount} across remaining members",
    cancelledNotice: 'Payment collection cancelled. No charges processed.',

    // Settle Debts Path
    settleTitle: 'Settle Group Debts',
    settleSubtitle: 'Simplified greedy ledger for {groupName}',
    noDebtsTitle: 'All balances settled!',
    noDebtsDesc: 'Zero outstanding debts in this group ledger. Every member is square.',
    owesText: 'owes',
    markAsPaidBtn: 'Mark as paid',
    markPaidSuccess: 'Settled',
    debtSettledToast: 'Settlement of {amount} from {debtor} to {creditor} recorded!',
    preferredChannel: 'Recommended Channel: {channel}',
    settleAllBtn: 'Finish Review',

    // General
    loading: 'Loading...',
    tryAgain: 'Try again',
    languageToggle: 'FR',
  },
  fr: {
    // Header & Navigation
    back: 'Retour',
    close: 'Fermer',
    stepOf: 'Étape {current} sur {total}',
    cancelFlow: 'Annuler la transaction',
    changeGroup: 'Changer',

    // Step 1: Choose Group
    step1Title: 'Choisir le groupe',
    step1Subtitle: 'Sélectionnez le registre dans lequel opérer',
    noGroupsTitle: 'Aucun groupe pour le moment',
    noGroupsDesc: 'Créez un nouveau registre de groupe ou rejoignez-en un pour partager vos dépenses.',
    createGroupBtn: 'Créer un groupe',
    joinWithLinkBtn: 'Rejoindre avec un lien',
    newGroupRow: '+ Nouveau groupe',
    membersCount: '{count} membres',
    activeLedger: 'Registre actif',

    // Step 2: Choose Action
    step2Title: 'Choisir une action',
    step2Subtitle: 'Sélectionnez ce que vous souhaitez faire avec {groupName}',
    pmpCardTitle: 'Cagnotte Commune (PMP)',
    pmpCardSubtitle: 'Payez ensemble immédiatement.',
    pmpCardBadge: 'Débit direct opérateur',
    pmpCardDesc: 'Collectez en direct les parts des membres via MTN MoMo / Orange Money pour régler immédiatement un marchand ou un tiers.',
    settleCardTitle: 'Régler les dettes',
    settleCardSubtitle: 'Équilibrez ce que les membres se doivent.',
    settleCardBadge: 'Algorithme somme-nulle',
    settleCardDesc: 'Registre simplifié à transactions minimales pour solder toutes les dettes accumulées entre colocataires ou amis.',

    // Step 3: Who are we paying
    step3Title: 'Qui payons-nous ?',
    step3Subtitle: 'Informations du bénéficiaire ou marchand',
    scanMerchantBtn: 'Scanner le code QR marchand',
    scanModalTitle: 'Scanner le code marchand',
    scanModalDesc: 'Pointez la caméra vers le code QR marchand ou touchez un exemple',
    mockScanSuccess: 'Code marchand scanné avec succès',
    manualRecipientLabel: 'Numéro de téléphone du destinataire',
    recipientPhonePlaceholder: '670 00 00 00',
    recipientNameLabel: 'Nom du destinataire (optionnel)',
    recipientNamePlaceholder: 'Ex: Boulangerie Bastos, Super U, ou Jean P.',
    amountLabel: 'Montant à payer',
    amountPlaceholder: '0',
    currencyNote: 'Montants en FCFA entiers',
    noteLabel: 'Motif du paiement (optionnel)',
    notePlaceholder: 'Ex: Courses du vendredi, addition restaurant, jeton électricité',
    continueToSplitBtn: 'Continuer vers la répartition',
    invalidPhoneError: 'Veuillez saisir un numéro camerounais valide (9 chiffres commençant par 6)',
    invalidAmountError: 'Veuillez saisir un montant supérieur à 0 FCFA',
    networkDetectedMtn: 'MTN Mobile Money',
    networkDetectedOrange: 'Orange Money',
    networkDetectedUnknown: 'Opérateur inconnu',

    // Step 4: Split Contributions
    step4Title: 'Répartir les cotisations',
    step4Subtitle: 'Attribuez les montants pour {total}',
    splitEqually: 'Parts égales',
    customAmounts: 'Montants personnalisés',
    excludeMemberTooltip: 'Exclure de ce paiement',
    included: 'Inclus',
    excluded: 'Exclu',
    assignedProgress: 'Attribué {assigned} / Total {total}',
    remainingToAssign: 'Reste {amount}',
    overAssigned: 'En excès de {amount}',
    balancedExact: 'Équilibre parfait',
    initiateBtn: 'Lancer la Cagnotte',
    mismatchWarning: 'Le total attribué doit être exactement égal à {total} pour continuer.',

    // Step 5: Confirm and Initiate
    step5Title: 'Vérifier & Envoyer les demandes',
    step5Subtitle: 'Validez la répartition avant l’envoi des prompts USSD',
    receiptSummaryTitle: 'REÇU DE CAGNOTTE COMMUNE',
    recipientLabel: 'Bénéficiaire',
    phoneLabel: 'Téléphone',
    purposeLabel: 'Motif',
    totalPayable: 'Total à payer',
    sharesBreakdown: 'Détail par membre',
    sendRequestsBtn: 'Envoyer les demandes de paiement',
    liveStatusTitle: 'En attente des validations',
    liveStatusDesc: 'Les invites USSD de validation ont été envoyées sur le téléphone de chaque membre. Suivez les réponses en temps réel.',
    waitingStatus: 'En attente',
    approvedStatus: 'Approuvé',
    declinedStatus: 'Refusé',
    expiredStatus: 'Expiré',
    resendAction: 'Renvoyer l’invite',
    resendSentToast: 'Invite USSD renvoyée à {name}',
    allApprovedTitle: 'Paiement effectué avec succès !',
    allApprovedDesc: 'Tous les membres du groupe ont validé leur code secret Mobile Money. Le paiement de {amount} a été transféré à {recipient}.',
    merchantReceiptCode: 'Référence transaction : {ref}',
    doneBtn: 'Terminer et retourner au tableau de bord',
    actionNeededTitle: 'Action requise',
    actionNeededDesc: 'Un membre n’a pas pu autoriser le prélèvement sur son téléphone.',
    coverShareBtn: 'Prendre sa part en charge',
    reassignShareBtn: 'Répartir équitablement',
    cancelRefundBtn: 'Annuler et rembourser',
    coverShareSuccess: 'Vous avez pris en charge la part de {name} ({amount})',
    reassignShareSuccess: 'La part de {name} ({amount}) a été redistribuée aux autres membres',
    cancelledNotice: 'Collecte annulée. Aucun débit n’a été effectué.',

    // Settle Debts Path
    settleTitle: 'Régler les dettes du groupe',
    settleSubtitle: 'Registre simplifié pour {groupName}',
    noDebtsTitle: 'Toutes les dettes sont soldées !',
    noDebtsDesc: 'Aucune dette en cours dans ce registre de groupe. Tout le monde est quitte.',
    owesText: 'doit à',
    markAsPaidBtn: 'Marquer comme payé',
    markPaidSuccess: 'Réglé',
    debtSettledToast: 'Règlement de {amount} de {debtor} à {creditor} enregistré !',
    preferredChannel: 'Canal recommandé : {channel}',
    settleAllBtn: 'Terminer l’examen',

    // General
    loading: 'Chargement...',
    tryAgain: 'Réessayer',
    languageToggle: 'EN',
  },
};

export function translate(
  key: keyof typeof addFlowTranslations['en'],
  locale: Locale,
  params?: Record<string, string | number>
): string {
  const dict = addFlowTranslations[locale] || addFlowTranslations.en;
  let text = (dict[key] || addFlowTranslations.en[key] || key) as string;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }

  return text;
}
