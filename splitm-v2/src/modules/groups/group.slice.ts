import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Group, Member } from '../../core/types';

export interface GroupState {
  groups: Record<string, Group>;
  activeGroupId: string | null;
  members: Record<string, Member>; // key is memberId
}

const initialState: GroupState = {
  groups: {
    'grp-bastos': {
      id: 'grp-bastos',
      name: 'Bastos Apartment',
      description: 'Flatmates • Yaoundé',
      currency: 'XAF',
      budget: 80000,
      members: [],
      expenses: [],
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    'grp-kribi': {
      id: 'grp-kribi',
      name: 'Kribi Beach Trip',
      description: 'Travel • Coastal',
      currency: 'XAF',
      budget: 320000,
      members: [],
      expenses: [],
      createdBy: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  activeGroupId: 'grp-bastos',
  members: {},
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setGroups(state, action: PayloadAction<Group[]>) {
      action.payload.forEach(group => {
        state.groups[group.id] = group;
      });
    },
    addGroup(state, action: PayloadAction<Group>) {
      state.groups[action.payload.id] = action.payload;
      if (!state.activeGroupId) {
        state.activeGroupId = action.payload.id;
      }
    },
    setActiveGroup(state, action: PayloadAction<string>) {
      state.activeGroupId = action.payload;
    },
    setMembers(state, action: PayloadAction<Member[]>) {
      action.payload.forEach(member => {
        state.members[member.id] = member;
      });
    },
    addMember(state, action: PayloadAction<Member>) {
      state.members[action.payload.id] = action.payload;
    },
    removeMember(state, action: PayloadAction<string>) {
      delete state.members[action.payload];
    }
  }
});

export const { setGroups, addGroup, setActiveGroup, setMembers, addMember, removeMember } = groupSlice.actions;
export default groupSlice.reducer;
