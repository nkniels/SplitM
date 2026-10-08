// Web Worker for background synchronization tasks

self.addEventListener('message', async (e) => {
  const { type, payload } = e.data;

  if (type === 'PROCESS_SYNC_QUEUE') {
    // Process offline queue logic here
    try {
      const results = await processQueue(payload.queue);
      self.postMessage({ type: 'SYNC_QUEUE_PROCESSED', payload: results });
    } catch (error: any) {
      self.postMessage({ type: 'SYNC_ERROR', payload: error.message });
    }
  }

  if (type === 'RESOLVE_CONFLICTS') {
    const resolved = resolveConflicts(payload.localData, payload.serverData);
    self.postMessage({ type: 'CONFLICTS_RESOLVED', payload: resolved });
  }
});

async function processQueue(queue: any[]) {
  // Simulate processing queue
  // In a real scenario, this worker might batch operations and prepare them for the main thread
  return queue.map(item => ({ ...item, status: 'processed' }));
}

function resolveConflicts(localData: any[], serverData: any[]) {
  // Timestamp-based automatic merging
  // If local timestamp > server timestamp, keep local (user just edited offline)
  // Otherwise, server wins.
  const resolved = [...serverData];
  localData.forEach(localItem => {
    const serverItemIdx = resolved.findIndex(s => s.id === localItem.id);
    if (serverItemIdx > -1) {
      if (localItem.updatedAt > resolved[serverItemIdx].updatedAt) {
        resolved[serverItemIdx] = localItem;
      }
    } else {
      resolved.push(localItem);
    }
  });
  return resolved;
}
