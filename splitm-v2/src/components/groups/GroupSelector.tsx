import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, PlusCircle } from 'lucide-react';
import { setActiveGroup } from '../../modules/groups/group.slice';
import type { AppDispatch } from '../../core/store/store';
import type { RootState } from '../../core/store/store';
import GroupForm from './GroupForm';

export default function GroupSelector() {
  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector((state: RootState) => state.groups.groups);
  const activeGroupId = useSelector((state: RootState) => state.groups.activeGroupId);

  const [isOpen, setIsOpen] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupList = Object.values(groups);
  const activeGroup = activeGroupId ? groups[activeGroupId] : null;

  const handleSelectGroup = (groupId: string) => {
    dispatch(setActiveGroup(groupId));
    setIsOpen(false);
  };

  const handleNewGroup = () => {
    setIsOpen(false);
    setShowGroupForm(true);
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="max-w-[160px] truncate">
            {activeGroup ? activeGroup.name : 'No groups'}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            aria-label="Select group"
            className="absolute left-0 top-full mt-1 min-w-[200px] bg-surface border border-slate-700 rounded-lg shadow-xl z-50 py-1"
          >
            {groupList.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-400">No groups yet</p>
            ) : (
              groupList.map((group) => (
                <button
                  key={group.id}
                  role="option"
                  aria-selected={group.id === activeGroupId}
                  type="button"
                  onClick={() => handleSelectGroup(group.id)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:bg-slate-700 ${
                    group.id === activeGroupId
                      ? 'text-primary font-medium'
                      : 'text-slate-200'
                  }`}
                >
                  {group.name}
                </button>
              ))
            )}

            {/* Divider */}
            <div className="border-t border-slate-700 my-1" />

            {/* New Group option */}
            <button
              type="button"
              onClick={handleNewGroup}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 focus-visible:outline-none focus-visible:bg-slate-700 flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              New Group
            </button>
          </div>
        )}
      </div>

      {showGroupForm && <GroupForm onClose={() => setShowGroupForm(false)} />}
    </>
  );
}
