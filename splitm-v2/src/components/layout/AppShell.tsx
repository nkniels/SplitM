import { useState } from 'react';
import { useSelector } from 'react-redux';
import { LogOut, Moon, Sun } from 'lucide-react';
import type { RootState } from '../../core/store/store';
import { logout } from '../../modules/auth/auth.service';
import SyncStatusBar from './SyncStatusBar';
import { Button } from '../ui/Button';
import GroupSelector from '../groups/GroupSelector';
import { SplitMLogo } from '../common/SplitMLogo';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isDark, setIsDark] = useState(() => {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('splitm_theme', 'dark'); } catch (_) {}
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#090d16');
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('splitm_theme', 'light'); } catch (_) {}
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#f8fafc');
    }
  };

  const displayName = user?.displayName || user?.email || 'User';
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 transition-colors duration-200">
      {/* Sync status banner — sits above the navbar */}
      <SyncStatusBar />

      {/* Sticky top navbar (Desktop only - mobile uses the single PWA receipt screen layout) */}
      <header className="hidden md:block bg-surface border-b border-border sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: authentic SplitM logo */}
          <div className="flex items-center gap-2">
            <SplitMLogo size="sm" textSize="md" />
          </div>

          {/* Center: GroupSelector */}
          <GroupSelector />

          {/* Right: theme toggle + user info + logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 hover:text-slate-800" />
              )}
            </Button>

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
