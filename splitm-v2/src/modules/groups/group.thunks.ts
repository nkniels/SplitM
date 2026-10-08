import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Group, Member } from '../../core/types';
import { setGroups, addGroup, addMember, removeMember, setActiveGroup, setMembers } from './group.slice';
import { createGroup, loadGroupsFromIDB, addMemberToGroup, removeMemberFromGroup, loadMembersForGroup } from './group.service';
import type { RootState } from '../../core/store/store';

export const loadGroups = createAsyncThunk(
  'groups/loadGroups',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const userId = state.auth.user?.uid;
    const groups = await loadGroupsFromIDB(userId);
    dispatch(setGroups(groups));
    if (!state.groups.activeGroupId && groups.length > 0) {
      dispatch(setActiveGroup(groups[0].id));
      // Also load members for the first group
      const members = await loadMembersForGroup(groups[0].id);
      dispatch(setMembers(members));
    }
    return groups;
  }
);

export const loadMembersThunk = createAsyncThunk(
  'groups/loadMembers',
  async (groupId: string, { dispatch }) => {
    const members = await loadMembersForGroup(groupId);
    dispatch(setMembers(members));
    return members;
  }
);

export const createGroupThunk = createAsyncThunk(
  'groups/createGroup',
  async (payload: { name: string; description: string; currency: string; budget?: number; createdBy: string }, { dispatch }) => {
    const group: Group = {
      id: crypto.randomUUID(),
      name: payload.name,
      description: payload.description,
      currency: payload.currency,
      budget: payload.budget ?? 0,
      members: [],
      expenses: [],
      createdBy: payload.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await createGroup(group);
    dispatch(addGroup(group));
    // Load members for new group
    const members = await loadMembersForGroup(group.id);
    dispatch(setMembers(members));
    return group;
  }
);

export const addMemberThunk = createAsyncThunk(
  'groups/addMember',
  async (payload: { groupId: string; name: string; status: 'normal' | 'good' | 'difficult'; weight: number }, { dispatch }) => {
    const member: Member = {
      id: crypto.randomUUID(),
      groupId: payload.groupId,
      name: payload.name,
      status: payload.status,
      weight: payload.weight,
    };
    await addMemberToGroup(member);
    dispatch(addMember(member));
    return member;
  }
);

export const removeMemberThunk = createAsyncThunk(
  'groups/removeMember',
  async (payload: { memberId: string; groupId: string }, { dispatch }) => {
    await removeMemberFromGroup(payload.memberId, payload.groupId);
    dispatch(removeMember(payload.memberId));
    return payload.memberId;
  }
);
