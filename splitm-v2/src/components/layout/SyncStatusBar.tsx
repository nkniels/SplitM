import { useSelector } from 'react-redux';
import type { RootState } from '../../core/store/store';

export default function SyncStatusBar() {
  const isOnline = useSelector((state: RootState) => state.sync.isOnline);
  const pendingOperations = useSelector((state: RootState) => state.sync.pendingOperations);

  if (!isOnline) {
    return (
      <div className="bg-yellow-500/20 border-b border-yellow-500/30 text-yellow-300 py-1.5 px-4 text-sm text-center sticky top-0 z-50">
        You are offline — changes will sync when reconnected
      </div>
    );
  }

  if (isOnline && pendingOperations > 0) {
    return (
      <div className="bg-blue-500/20 border-b border-blue-500/30 text-blue-300 py-1.5 px-4 text-sm text-center sticky top-0 z-50">
        Syncing {pendingOperations} change{pendingOperations > 1 ? 's' : ''}...
      </div>
    );
  }

  return null;
}
