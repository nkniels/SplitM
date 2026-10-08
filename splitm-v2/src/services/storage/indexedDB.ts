import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface SplitMDb extends DBSchema {
  groups: {
    key: string;
    value: any;
  };
  members: {
    key: string;
    value: any;
    indexes: { 'by-group': string };
  };
  expenses: {
    key: string;
    value: any;
    indexes: { 'by-group': string; 'by-date': string };
  };
  settlements: {
    key: string;
    value: any;
    indexes: { 'by-group': string };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      collection: string;
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
      retryCount: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<SplitMDb>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<SplitMDb>('splitm-db', 1, {
      upgrade(db) {
        db.createObjectStore('groups', { keyPath: 'id' });
        
        const memberStore = db.createObjectStore('members', { keyPath: 'id' });
        memberStore.createIndex('by-group', 'groupId');
        
        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expenseStore.createIndex('by-group', 'groupId');
        expenseStore.createIndex('by-date', 'date');
        
        const settlementStore = db.createObjectStore('settlements', { keyPath: 'id' });
        settlementStore.createIndex('by-group', 'groupId');

        db.createObjectStore('syncQueue', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const getStore = async <T extends keyof SplitMDb>(storeName: T) => {
  const db = await initDB();
  return db.getAll(storeName as 'groups' | 'members' | 'expenses' | 'settlements' | 'syncQueue');
};

export const putToStore = async <T extends keyof SplitMDb>(storeName: T, value: SplitMDb[T]['value']) => {
  const db = await initDB();
  return db.put(storeName as 'groups' | 'members' | 'expenses' | 'settlements' | 'syncQueue', value);
};

export const deleteFromStore = async <T extends keyof SplitMDb>(storeName: T, key: SplitMDb[T]['key']) => {
  const db = await initDB();
  return db.delete(storeName as 'groups' | 'members' | 'expenses' | 'settlements' | 'syncQueue', key as string);
};

export const clearStore = async <T extends keyof SplitMDb>(storeName: T) => {
  const db = await initDB();
  return db.clear(storeName as 'groups' | 'members' | 'expenses' | 'settlements' | 'syncQueue');
};
