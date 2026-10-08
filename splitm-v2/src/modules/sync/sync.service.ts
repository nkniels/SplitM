import { store } from '../../core/store/store';
import { getStore, putToStore, deleteFromStore } from '../../services/storage/indexedDB';
import { setOnlineStatus, addPendingOperation, removePendingOperation, addSyncError } from './sync.slice';
import { db } from '../../core/config/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import type { Expense } from '../../core/types';

// Initialize online/offline listeners
export const initSyncListeners = () => {
  window.addEventListener('online', () => {
    store.dispatch(setOnlineStatus(true));
    processSyncQueue();
  });
  window.addEventListener('offline', () => {
    store.dispatch(setOnlineStatus(false));
  });
};

// Main function to push local changes to Firebase
const processSyncQueue = async () => {
  const queue = await getStore('syncQueue');
  if (queue.length === 0) return;

  const batch = writeBatch(db);
  const queueItemsToDelete: string[] = [];

  for (const item of queue) {
    try {
      const docRef = doc(db, item.collection, item.data.id);
      
      if (item.operation === 'delete') {
        batch.delete(docRef);
      } else {
        batch.set(docRef, item.data, { merge: true });
      }
      queueItemsToDelete.push(item.id);
    } catch (error: any) {
      store.dispatch(addSyncError(`Failed to prepare batch for ${item.id}: ${error.message}`));
      // Retry logic could be added here by incrementing retryCount and skipping deletion
    }
  }

  try {
    await batch.commit();
    // Clear processed items from local queue
    for (const id of queueItemsToDelete) {
      await deleteFromStore('syncQueue', id);
      store.dispatch(removePendingOperation());
    }
  } catch (error: any) {
    store.dispatch(addSyncError(`Batch commit failed: ${error.message}`));
  }
};

// Generic save operation wrapper
export const saveWithSync = async (collectionName: string, data: any, operation: 'create' | 'update' | 'delete' = 'create') => {
  const isOnline = store.getState().sync.isOnline;
  
  // 1. Always save to local IndexedDB first for instant UI response
  if (operation === 'delete') {
    await deleteFromStore(collectionName as any, data.id);
  } else {
    await putToStore(collectionName as any, data);
  }

  if (isOnline) {
    // 2a. If online, attempt immediate Firebase save
    try {
      const docRef = doc(db, collectionName, data.id);
      if (operation === 'delete') {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, data, { merge: true });
      }
    } catch (error) {
      // If Firebase fails despite being 'online' (e.g. timeout), push to queue
      queueOperation(collectionName, data, operation);
    }
  } else {
    // 2b. If offline, push to sync queue
    queueOperation(collectionName, data, operation);
  }
};

const queueOperation = async (collectionName: string, data: any, operation: 'create' | 'update' | 'delete') => {
  const syncId = `${collectionName}_${data.id}_${Date.now()}`;
  await putToStore('syncQueue', {
    id: syncId,
    collection: collectionName,
    operation,
    data,
    timestamp: Date.now(),
    retryCount: 0
  });
  store.dispatch(addPendingOperation());
};

// Pull latest changes from Firebase (Delta sync)
export const pullChanges = async (groupId: string, lastSyncedAt: number) => {
  // Example: pull expenses changed since last sync
  const expensesRef = collection(db, 'expenses');
  const q = query(
    expensesRef, 
    where('groupId', '==', groupId),
    where('updatedAt', '>', lastSyncedAt)
  );

  try {
    const snapshot = await getDocs(q);
    const newExpenses: Expense[] = [];
    
    snapshot.forEach((doc) => {
      newExpenses.push(doc.data() as Expense);
    });

    // Update local IDB cache and Redux
    for (const exp of newExpenses) {
      await putToStore('expenses', exp);
      // Redux dispatch would happen in the thunk calling this
    }
    
    return newExpenses;
  } catch (error: any) {
    store.dispatch(addSyncError(`Pull failed: ${error.message}`));
    return [];
  }
};
