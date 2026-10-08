import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { addMemberThunk, removeMemberThunk } from '../../modules/groups/group.thunks';
import type { AppDispatch, RootState } from '../../core/store/store';

interface MembersPanelProps {
  onClose: () => void;
}

export default function MembersPanel({ onClose }: MembersPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const activeGroupId = useSelector((state: RootState) => state.groups.activeGroupId);
  const groups = useSelector((state: RootState) => state.groups.groups);
  const members = useSelector((state: RootState) => state.groups.members);

  const activeGroup = activeGroupId ? groups[activeGroupId] : null;
  const groupMembers = activeGroupId
    ? Object.values(members).filter((m) => m.groupId === activeGroupId)
    : [];

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    if (!activeGroupId) return;

    // Prevent duplicate names (case-insensitive)
    const duplicate = groupMembers.some(
      (m) => m.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setNameError('A member with this name already exists');
      return;
    }

    setNameError('');
    setIsAdding(true);
    try {
      await dispatch(
        addMemberThunk({
          groupId: activeGroupId,
          name: trimmed,
          status: 'normal',
          weight: 1,
        })
      ).unwrap();
      setName('');
      toast(`${trimmed} added`, 'success');
    } catch {
      toast('Failed to add member', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!activeGroupId) return;
    setRemovingId(memberId);
    try {
      await dispatch(
        removeMemberThunk({ memberId, groupId: activeGroupId })
      ).unwrap();
      toast(`${memberName} removed`, 'success');
    } catch {
      toast('Failed to remove member', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Members — ${activeGroup?.name ?? 'Group'}`}
    >
      <div className="space-y-5">
        {/* Add member form */}
        <form onSubmit={handleAdd} className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label="Add member"
              placeholder="e.g. Alice"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              error={nameError}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isAdding}
            leftIcon={<UserPlus className="h-4 w-4" />}
            className="mb-px"
          >
            Add
          </Button>
        </form>

        {/* Member list */}
        <div>
          {groupMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 text-slate-600 mx-auto mb-2" aria-hidden="true" />
              <p className="text-slate-400 text-sm">No members yet. Add someone above.</p>
            </div>
          ) : (
            <ul className="space-y-1" aria-label="Group members">
              {groupMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-700/40 transition-colors group"
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold shrink-0"
                      aria-hidden="true"
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-200 text-sm font-medium">{member.name}</span>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemove(member.id, member.name)}
                    isLoading={removingId === member.id}
                    aria-label={`Remove ${member.name}`}
                    title={`Remove ${member.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end pt-1 border-t border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
