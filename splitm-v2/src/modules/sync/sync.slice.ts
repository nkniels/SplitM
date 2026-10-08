import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  pendingOperations: number;
  syncErrors: string[];
}

const initialState: SyncState = {
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncedAt: null,
  pendingOperations: 0,
  syncErrors: [],
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
    setLastSynced(state, action: PayloadAction<number>) {
      state.lastSyncedAt = action.payload;
      state.syncErrors = []; // clear errors on successful sync
    },
    addPendingOperation(state) {
      state.pendingOperations += 1;
    },
    removePendingOperation(state) {
      state.pendingOperations = Math.max(0, state.pendingOperations - 1);
    },
    clearPendingOperations(state) {
      state.pendingOperations = 0;
    },
    addSyncError(state, action: PayloadAction<string>) {
      state.syncErrors.push(action.payload);
      state.isSyncing = false;
    }
  }
});

export const { 
  setOnlineStatus, 
  setSyncing, 
  setLastSynced, 
  addPendingOperation, 
  removePendingOperation,
  clearPendingOperations,
  addSyncError 
} = syncSlice.actions;

export default syncSlice.reducer;
