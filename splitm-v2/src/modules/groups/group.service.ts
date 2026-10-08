import { saveWithSync } from '../sync/sync.service';
import { getStore } from '../../services/storage/indexedDB';
import type { Group, Member } from '../../core/types';

export const createGroup = async (data: Group) =>
  saveWithSync('groups', data, 'create');

export const updateGroup = async (data: Group) =>
  saveWithSync('groups', data, 'update');

export const loadGroupsFromIDB = async (): Promise<Group[]> =>
  getStore('groups') as Promise<Group[]>;

export const addMemberToGroup = async (member: Member) =>
  saveWithSync('members', member, 'create');

export const removeMemberFromGroup = async (memberId: string, groupId: string) =>
  saveWithSync('members', { id: memberId, groupId }, 'delete');

export const loadMembersForGroup = async (groupId: string): Promise<Member[]> => {
  const all = await getStore('members') as Member[];
  return all.filter(m => m.groupId === groupId);
};
