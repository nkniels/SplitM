import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { createGroupThunk } from '../../modules/groups/group.thunks';
import type { AppDispatch } from '../../core/store/store';
import type { RootState } from '../../core/store/store';

interface GroupFormProps {
  onClose: () => void;
}

export default function GroupForm({ onClose }: GroupFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Group name is required');
      return;
    }
    setNameError('');

    if (!user) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        createGroupThunk({
          name: name.trim(),
          description: description.trim(),
          currency: currency.trim() || 'USD',
          createdBy: user.uid,
        })
      ).unwrap();
      toast('Group created', 'success');
      onClose();
    } catch {
      toast('Failed to create group', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="New Group">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Group name"
          placeholder="e.g. Trip to Paris"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          required
          autoFocus
        />
        <Input
          label="Description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Currency"
          placeholder="USD"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}
