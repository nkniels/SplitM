import { saveWithSync } from '../sync/sync.service';
import { putToStore, getStore } from '../../services/storage/indexedDB';
import type { Expense } from '../../core/types';

export const saveExpenseToIDB = async (expense: Expense) =>
  putToStore('expenses', expense);

export const createExpense = async (expense: Expense) =>
  saveWithSync('expenses', expense, 'create');

export const updateExpenseInStore = async (expense: Expense) =>
  saveWithSync('expenses', expense, 'update');

export const deleteExpenseFromStore = async (id: string) =>
  saveWithSync('expenses', { id }, 'delete');

export const loadExpensesForGroup = async (groupId: string): Promise<Expense[]> => {
  const all = await getStore('expenses') as Expense[];
  return all.filter(e => e.groupId === groupId);
};
