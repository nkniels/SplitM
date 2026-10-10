# Requirements Document

## Introduction

Expense Management is the core user-facing feature of SplitM v2. It allows group members to add, view, edit, and delete shared expenses within a group, configure how costs are split among members (equally, proportionally, by percentage, or by custom amounts), and support multiple payers per expense. All operations are offline-first: writes go to IndexedDB immediately and are synced to Firebase Firestore when the device is online. The FinanceEngine (already implemented) computes balances and settlement suggestions from the stored expense data.

## Glossary

- **Expense_Form**: The UI component used to create or edit an expense (description, amount, date, category, payment method, payers, splits).
- **Expense_List**: The UI component that displays all expenses for the active group in reverse-chronological order.
- **Expense_Detail**: The read-only view of a single expense showing all fields and computed split breakdown.
- **Split_Configurator**: The sub-component of Expense_Form responsible for configuring how an expense is divided among members.
- **Finance_Engine**: The already-implemented `FinanceEngine` class in `src/core/finance/FinanceEngine.ts`.
- **Sync_Service**: The already-implemented `saveWithSync` function in `src/modules/sync/sync.service.ts` that writes to IndexedDB first and syncs to Firebase when online.
- **Redux_Store**: The Redux Toolkit store managing `expenses` and `groups` slices.
- **Active_Group**: The group identified by `activeGroupId` in the `groups` Redux slice.
- **Expense**: The `Expense` interface defined in `src/core/types.ts`, including `payers`, `splits`, `splitType`, `amount`, `date`, `category`, `paymentMethod`, `settled`, `createdBy`, `createdAt`, and `updatedAt` fields.
- **Payer**: A member who paid for an expense, with a specific amount they contributed (`Payer` interface in `src/core/types.ts`).
- **Split**: A member's share of an expense cost (`Split` interface in `src/core/types.ts`).
- **Settlement**: A computed payment recommendation from one member to another to settle net debts (`Settlement` interface in `src/core/types.ts`).

---

## Requirements

### Requirement 1: Expense List View

**User Story:** As a group member, I want to see all expenses for the active group in one place, so that I can track what has been spent.

#### Acceptance Criteria

1. WHEN the Active_Group changes, THE Expense_List SHALL display all expenses belonging to that group ordered by date descending; expenses with the same date SHALL be ordered by `createdAt` descending as a tiebreaker.
2. THE Expense_List SHALL display for each expense: description, total amount with currency symbol, date, category, and the names of up to 3 Payers; IF more than 3 Payers exist, THE Expense_List SHALL display "and N more" after the first 3 names.
3. IF the expenses collection is empty for the Active_Group, THEN THE Expense_List SHALL display an empty-state message prompting the user to add the first expense.
4. WHILE the expense data is loading from IndexedDB or Firestore, THE Expense_List SHALL display exactly 5 skeleton placeholder cards in place of expense items.
5. WHEN the user selects an expense in the Expense_List, THE Expense_Detail view SHALL open for that expense.
6. IF the expense data fails to load from both IndexedDB and Firestore, THEN THE Expense_List SHALL display an error message with a retry action.

---

### Requirement 2: Add Expense

**User Story:** As a group member, I want to add a new expense to the group, so that the cost can be tracked and split among members.

#### Acceptance Criteria

1. WHEN the user initiates adding a new expense, THE Expense_Form SHALL open with all fields empty and the split type defaulting to `equal` across all Active_Group members.
2. WHILE the Expense_Form is open, THE Expense_Form SHALL require: a non-empty description of at most 100 characters, a numeric amount between 0.01 and 999,999,999.99 inclusive, a date, at least one Payer, and a valid split configuration where the sum of all splits equals the expense amount within ±0.01.
3. WHEN the user submits the Expense_Form with valid data, THE Redux_Store SHALL add the expense to the `expenses` slice synchronously before the persistence operation begins.
4. WHEN the user submits the Expense_Form with valid data, THE Sync_Service SHALL persist the new Expense to IndexedDB first, then to Firestore if the device is online.
5. IF the user submits the Expense_Form with missing or invalid fields, THEN THE Expense_Form SHALL display a field-level validation error message for each invalid field and SHALL NOT submit the expense.
6. WHEN an expense is persisted successfully, THE Expense_Form SHALL close and THE Expense_List SHALL show a new entry with the correct description, amount, and date without requiring a page reload.
7. IF the Sync_Service fails to write to Firestore while online, THEN THE Sync_Service SHALL queue the operation for later retry.
8. IF the Sync_Service queues an operation, THEN THE Redux_Store SHALL increment the pending sync count.

---

### Requirement 3: Edit Expense

**User Story:** As a group member, I want to edit an existing expense, so that I can correct mistakes in amount, description, payers, or split configuration.

#### Acceptance Criteria

1. WHEN the user initiates editing an expense from Expense_Detail or Expense_List, THE Expense_Form SHALL open pre-populated with the existing values for amount, description, payers, and split configuration of that expense.
2. WHEN the user submits the edited Expense_Form with valid data (amount between 0.01 and 999,999,999.99, description 1–100 characters, at least one payer, and at least one split participant), THE Sync_Service SHALL update the existing Expense document in IndexedDB and Firestore, and THE Redux_Store SHALL replace the expense in the `expenses` slice with the updated version.
3. WHEN the user submits the edited Expense_Form successfully, THE Expense_Form SHALL set `updatedAt` to the current Unix timestamp in milliseconds.
4. WHEN the user cancels the edit, THE Expense_Form SHALL close without modifying the original expense data.
5. IF the expense being edited is marked `settled: true`, THEN THE Expense_Form SHALL display a modal with distinct confirm and cancel buttons warning that editing a settled expense will affect balance calculations; IF the user clicks cancel, THE Expense_Form SHALL abort the edit without modification.
6. IF the Sync_Service fails to update Firestore while online, THEN THE Sync_Service SHALL queue the update operation and THE Redux_Store SHALL retain the locally-updated expense, displaying it with a pending sync indicator.

---

### Requirement 4: Delete Expense

**User Story:** As a group member, I want to delete an expense, so that incorrectly added entries can be removed from the group's ledger.

#### Acceptance Criteria

1. WHEN the user initiates deleting an expense, THE Expense_Detail or Expense_List SHALL display a confirmation dialog that includes the expense description and amount before performing the deletion.
2. WHEN the user confirms deletion, THE Sync_Service SHALL remove the expense from IndexedDB immediately, queue the Firestore delete operation, and THE Redux_Store SHALL remove the expense from the `expenses` slice.
3. WHEN the user cancels the deletion confirmation, THE Expense_Detail or Expense_List SHALL remain unchanged.
4. IF the Sync_Service fails to delete from Firestore while online, THEN the expense SHALL remain removed from IndexedDB and the Redux_Store, and the delete operation SHALL be queued for retry with the pending sync count incremented.
5. WHEN an expense is successfully deleted, THE Expense_List SHALL display a success notification confirming the deletion.
6. IF the authenticated user is not the creator of the expense (`createdBy` does not match the user's UID), THEN THE Expense_Detail and Expense_List SHALL not display a delete action for that expense.

---

### Requirement 5: Split Configuration

**User Story:** As a group member adding or editing an expense, I want to choose how the cost is split among members, so that the division accurately reflects each person's share.

#### Acceptance Criteria

1. THE Split_Configurator SHALL support the following split types: `equal`, `proportional`, `percent`, and `custom`.
2. WHEN the Expense_Form opens for a new expense, THE Split_Configurator SHALL default to split type `equal`.
3. WHEN the user selects split type `equal`, THE Split_Configurator SHALL compute and display each member's share as an equal portion of the total expense amount, shown as a non-editable read-only value.
4. WHEN the user selects split type `proportional`, THE Split_Configurator SHALL compute each member's share proportional to their weight value and display it as a non-editable read-only value; IF all members have a weight of zero, THEN THE Split_Configurator SHALL display a validation error and SHALL prevent form submission.
5. WHEN the user selects split type `percent`, THE Split_Configurator SHALL allow the user to enter a percentage between 0 and 100 for each member and SHALL display a running total of the assigned percentages.
6. WHEN the user selects split type `custom`, THE Split_Configurator SHALL allow the user to enter a non-negative monetary amount for each member and SHALL display the sum of entered amounts alongside the total expense amount.
7. IF split type is `percent` and the sum of all entered percentages does not equal 100, THEN THE Split_Configurator SHALL display a validation error and SHALL prevent form submission.
8. IF split type is `custom` and the sum of all entered amounts does not equal the total expense amount within ±0.01, THEN THE Split_Configurator SHALL display a validation error and SHALL prevent form submission.
9. WHEN the expense amount or split type changes, THE Split_Configurator SHALL recalculate and update all displayed split values without requiring user interaction.
10. WHEN the user sets a member's share to zero, THE Split_Configurator SHALL allow that entry and the Finance_Engine SHALL exclude zero-amount splits from balance calculations.

---

### Requirement 6: Multiple Payers

**User Story:** As a group member, I want to record that multiple people paid for a single expense, so that the ledger reflects real-world situations like split bills.

#### Acceptance Criteria

1. THE Expense_Form SHALL allow the user to assign a payment amount to between 1 and 20 members as Payers for a single expense, with each Payer identified by their member ID and a payment amount greater than zero.
2. WHILE the user is entering or editing payer amounts, THE Expense_Form SHALL display the sum of all Payer amounts in the same view as the total expense amount.
3. IF the sum of all Payer amounts does not equal the total expense amount within ±0.01, THEN THE Expense_Form SHALL display a validation error indicating the mismatch amount and SHALL prevent form submission.
4. IF the user attempts to add the same group member as a Payer more than once, THEN THE Expense_Form SHALL prevent the duplicate entry and display an error message.
5. WHEN only one Payer is assigned and the Payer's amount equals the total expense amount, THE Expense_Form SHALL not require any further payer configuration before submission.

---

### Requirement 7: Balance and Settlement Display

**User Story:** As a group member, I want to see the current net balances and suggested settlements for the group, so that I know who owes whom and how to settle up efficiently.

#### Acceptance Criteria

1. WHEN the user views the Active_Group's expense summary, THE Finance_Engine SHALL compute the net balance for each member and the suggested settlement transactions using the current members and expenses from the Redux_Store.
2. WHEN the user views the Active_Group's expense summary, THE Expense_List or summary view SHALL display each member's net balance rounded to two decimal places, with positive balances labeled "is owed" and negative balances labeled "owes", and members with a net balance of 0.00 SHALL be omitted from the balance list.
3. WHEN the user views the Active_Group's expense summary, THE Expense_List or summary view SHALL display each suggested settlement in the format "[payer name] → [payee name]: [amount rounded to two decimal places]".
4. IF all members in the Active_Group have a net balance of 0.00, THEN THE Expense_List or summary view SHALL display a message indicating that the group is fully settled, in place of the balance and settlement sections.
5. WHEN an expense is added to or removed from the Active_Group, THE Finance_Engine SHALL recompute the net balances and suggested settlements so that the Expense_List or summary view reflects the updated state.

---

### Requirement 8: Expense Filtering and Sorting

**User Story:** As a group member, I want to filter and sort the expense list, so that I can quickly find specific expenses in a large group ledger.

#### Acceptance Criteria

1. WHEN the user selects a category filter value, THE Expense_List SHALL display only expenses whose `category` field exactly matches the selected value.
2. WHEN the user selects a settlement status filter, THE Expense_List SHALL display only expenses whose `settled` field matches the selected value (`true` or `false`).
3. WHEN the user selects a sort option, THE Expense_List SHALL sort the displayed expenses by the chosen field (date or amount) in the chosen direction (ascending or descending).
4. WHEN a filter or sort option is changed, THE Expense_List SHALL update the displayed expenses within 300 milliseconds without a page reload.
5. WHEN multiple filters are active simultaneously, THE Expense_List SHALL apply all active filters using AND logic, displaying only expenses that match every active filter.
6. IF no expenses match the active filter criteria, THEN THE Expense_List SHALL display a message indicating no expenses match the current filters, and SHALL display zero expense items.
7. WHEN the user clears all active filters and sort options, THE Expense_List SHALL restore the default view showing all expenses sorted by date descending.

---

### Requirement 9: Offline Operation

**User Story:** As a group member, I want to add, edit, and delete expenses without an internet connection, so that the app remains functional while offline.

#### Acceptance Criteria

1. WHILE the device is offline, THE Sync_Service SHALL persist all expense create, update, and delete operations to IndexedDB and queue them for later synchronization, up to a maximum of 500 pending operations.
2. WHILE the device is offline, WHEN an expense operation is submitted, THE Redux_Store SHALL reflect the change within 100 milliseconds, allowing the Expense_List and Expense_Detail to display up-to-date data.
3. WHEN the device returns online, THE Sync_Service SHALL process the sync queue and commit all pending operations to Firestore using a batch write, applying operations in the order they were enqueued.
4. WHILE pending sync operations exist, THE Expense_List SHALL display a sync status indicator showing the count of unsynced operations.
5. IF the sync queue reaches 500 pending operations, THEN THE Sync_Service SHALL reject any new offline operations and display an error message indicating the queue is full.
6. IF a batch write to Firestore fails after the device returns online, THEN THE Sync_Service SHALL retain the failed operations in the sync queue and automatically retry up to 3 times before dispatching a permanent failure error to the `sync` Redux slice.

---

### Requirement 10: Expense Data Integrity

**User Story:** As a developer, I want expense data to always be internally consistent, so that the FinanceEngine produces correct balance and settlement calculations.

#### Acceptance Criteria

1. WHEN the user submits the Expense_Form, IF the sum of all `splits` amounts does not equal the expense `amount` within ±0.01, THEN THE Expense_Form SHALL display a validation error and SHALL NOT persist the expense.
2. WHEN the user submits the Expense_Form, IF the sum of all `payers` amounts does not equal the expense `amount` within ±0.01, THEN THE Expense_Form SHALL display a validation error and SHALL NOT persist the expense.
3. WHEN an expense is created, THE Expense_Form SHALL set `createdAt` and `updatedAt` to the current Unix timestamp in milliseconds.
4. WHEN an expense is created, IF the user is authenticated, THEN THE Expense_Form SHALL set `createdBy` to the authenticated user's UID from the `auth` Redux slice; IF the user is not authenticated, THEN THE Expense_Form SHALL prevent expense creation and display an authentication error.
5. WHEN an expense is created, THE Expense_Form SHALL assign a unique `id` using a UUID or Firestore auto-generated document ID.
6. FOR any valid set of expenses E, `calculateBalances` applied to E followed by `computeSettlements` applied to the resulting balances SHALL yield a settlement list where the absolute difference between the sum of all settlement amounts FROM members and the sum of all settlement amounts TO members is less than 0.01 (zero-sum property within floating-point tolerance).
