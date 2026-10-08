import { saveWithSync } from '../sync/sync.service';
import { getStore, putToStore } from '../../services/storage/indexedDB';
import { db } from '../../core/config/firebase';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import type { Group, Member } from '../../core/types';

// ─── Groups ───────────────────────────────────────────────────────────────────

export const createGroup = async (data: Group) =>
  saveWithSync('groups', data, 'create');

export const updateGroup = async (data: Group) =>
  saveWithSync('groups', data, 'update');

/**
 * Load groups for a user.
 * When online: fetch from Firestore, refresh IDB cache, return result.
 * When offline: fall back to IDB.
 */
export const loadGroupsFromIDB = async (userId?: string): Promise<Group[]> => {
  // Attempt Firestore pull if we have a userId
  if (userId) {
    try {
      const q = query(
        collection(db, 'groups'),
        where('createdBy', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const groups: Group[] = snapshot.docs.map(d => d.data() as Group);
        // Refresh IDB cache
        for (const g of groups) {
          await putToStore('groups', g);
        }
        return groups;
      }
    } catch {
      // Firestore unreachable — fall through to IDB
    }
  }

  // IDB fallback (offline or no userId)
  return getStore('groups') as Promise<Group[]>;
};

// ─── Members ─────────────────────────────────────────────────────────────────

export const addMemberToGroup = async (member: Member) =>
  saveWithSync('members', member, 'create');

export const removeMemberFromGroup = async (memberId: string, groupId: string) =>
  saveWithSync('members', { id: memberId, groupId }, 'delete');

/**
 * Load members for a group.
 * When online: fetch from Firestore, refresh IDB cache.
 * When offline: IDB fallback.
 */
export const loadMembersForGroup = async (groupId: string): Promise<Member[]> => {
  try {
    const q = query(
      collection(db, 'members'),
      where('groupId', '==', groupId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const members: Member[] = snapshot.docs.map(d => d.data() as Member);
      for (const m of members) {
        await putToStore('members', m);
      }
      return members;
    }
  } catch {
    // Fall through to IDB
  }

  const all = await getStore('members') as Member[];
  return all.filter(m => m.groupId === groupId);
};
