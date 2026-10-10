import { saveWithSync } from '../sync/sync.service';
import { putToStore, getStore } from '../../services/storage/indexedDB';
import { db } from '../../core/config/firebase';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import type { Expense } from '../../core/types';

export const saveExpenseToIDB = async (expense: Expense) =>
  putToStore('expenses', expense);

export const createExpense = async (expense: Expense) =>
  saveWithSync('expenses', expense, 'create');

export const updateExpenseInStore = async (expense: Expense) =>
  saveWithSync('expenses', expense, 'update');

export const deleteExpenseFromStore = async (id: string) =>
  saveWithSync('expenses', { id }, 'delete');

/**
 * Load expenses for a group.
 * When online: fetch from Firestore, refresh IDB cache.
 * When offline: IDB fallback.
 */
export const loadExpensesForGroup = async (groupId: string): Promise<Expense[]> => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('groupId', '==', groupId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const expenses: Expense[] = snapshot.docs.map(d => d.data() as Expense);
      for (const e of expenses) {
        await putToStore('expenses', e);
      }
      return expenses;
    }
  } catch {
    // Fall through to IDB
  }

  const all = await getStore('expenses') as Expense[];
  return all.filter(e => e.groupId === groupId);
};

/**
 * Subscribe to real-time expense updates for a group.
 */
export const subscribeToGroupExpenses = (
  groupId: string,
  onUpdate: (expenses: Expense[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'expenses'),
    where('groupId', '==', groupId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const expenses: Expense[] = snapshot.docs.map((d) => d.data() as Expense);
      for (const e of expenses) {
        void putToStore('expenses', e);
      }
      onUpdate(expenses);
    },
    (error) => {
      console.warn('[SplitM] Real-time expenses listener error:', error);
      onError?.(error);
    }
  );
};

