import { useSelector } from 'react-redux';
import { Layers, LogOut } from 'lucide-react';
import type { RootState } from '../../core/store/store';
import { logout } from '../../modules/auth/auth.service';
import SyncStatusBar from './SyncStatusBar';
import { Button } from '../ui/Button';
import GroupSelector from '../groups/GroupSelector';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  const displayName = user?.displayName || user?.email || 'User';
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background text-slate-100">
      {/* Sync status banner — sits above the navbar */}
      <SyncStatusBar />

      {/* Sticky top navbar */}
      <header className="bg-surface border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: app name + icon */}
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="font-bold text-primary text-lg tracking-tight">SplitM</span>
          </div>

          {/* Center: GroupSelector */}
          <GroupSelector />

          {/* Right: user info + logout */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-slate-900 text-sm font-semibold"
                aria-hidden="true"
              >
                {firstLetter}
              </div>
            )}

            {/* Display name */}
            <span className="text-sm text-slate-300 hidden sm:block max-w-[140px] truncate">
              {displayName}
            </span>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
