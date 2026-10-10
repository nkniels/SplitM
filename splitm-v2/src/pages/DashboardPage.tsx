import { useState } from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { GroupRingCard, type GroupCardData } from '../components/dashboard/GroupRingCard';
import { BottomNav, type NavTabId } from '../components/dashboard/BottomNav';
import { AddActionSheet } from '../components/dashboard/AddActionSheet';

// Initial Mock Groups & Members following SplitM's exact domain:
// Group expenses (greedy debt settlement) & Pooled MoMo payments (MTN/Orange Money)
const INITIAL_GROUPS: GroupCardData[] = [
  {
    id: 'grp-bastos',
    name: 'Bastos Apartment',
    category: 'Flatmates • Yaoundé',
    summaryText: 'You owe 4,500 XAF',
    userBalanceType: 'owes',
    userBalanceAmount: 4500,
    totalExpenses: 185000,
    pooledCollected: 60000,
    pooledTarget: 80000,
    members: [
      {
        id: 'm1',
        name: 'Amara K.',
        initials: 'AK',
        balanceXaf: 12500,
        paymentProvider: 'mtn',
      },
      {
        id: 'm2',
        name: 'Bryan T. (You)',
        initials: 'BT',
        balanceXaf: -4500,
        paymentProvider: 'orange',
      },
      {
        id: 'm3',
        name: 'Cécile N.',
        initials: 'CN',
        balanceXaf: -3200,
        paymentProvider: 'mtn',
      },
      {
        id: 'm4',
        name: 'Danielle M.',
        initials: 'DM',
        balanceXaf: 8000,
        paymentProvider: 'mtn',
      },
      {
        id: 'm5',
        name: 'Eric F.',
        initials: 'EF',
        balanceXaf: -12800,
        paymentProvider: 'orange',
      },
      {
        id: 'm6',
        name: 'Franck O.',
        initials: 'FO',
        balanceXaf: 0,
        paymentProvider: 'cash',
      },
    ],
  },
  {
    id: 'grp-kribi',
    name: 'Kribi Beach Trip',
    category: 'Travel • Coastal',
    summaryText: 'You are owed 16,000 XAF',
    userBalanceType: 'owed',
    userBalanceAmount: 16000,
    totalExpenses: 320000,
    pooledCollected: 320000,
    pooledTarget: 320000,
    members: [
      {
        id: 'k1',
        name: 'Bryan T. (You)',
        initials: 'BT',
        balanceXaf: 16000,
        paymentProvider: 'orange',
      },
      {
        id: 'k2',
        name: 'Nadine B.',
        initials: 'NB',
        balanceXaf: -6000,
        paymentProvider: 'mtn',
      },
      {
        id: 'k3',
        name: 'Paul E.',
        initials: 'PE',
        balanceXaf: -10000,
        paymentProvider: 'orange',
      },
      {
        id: 'k4',
        name: 'Sandra M.',
        initials: 'SM',
        balanceXaf: 0,
        paymentProvider: 'cash',
      },
      {
        id: 'k5',
        name: 'Thierry K.',
        initials: 'TK',
        balanceXaf: 0,
        paymentProvider: 'mtn',
      },
    ],
  },
  {
    id: 'grp-lunch',
    name: 'Yaoundé Tech Lunch',
    category: 'Weekly • Work',
    summaryText: 'All balances settled',
    userBalanceType: 'settled',
    userBalanceAmount: 0,
    totalExpenses: 45000,
    pooledCollected: 45000,
    pooledTarget: 45000,
    members: [
      {
        id: 'l1',
        name: 'Bryan T. (You)',
        initials: 'BT',
        balanceXaf: 0,
        paymentProvider: 'orange',
      },
      {
        id: 'l2',
        name: 'Alain K.',
        initials: 'AK',
        balanceXaf: 0,
        paymentProvider: 'mtn',
      },
      {
        id: 'l3',
        name: 'Linda W.',
        initials: 'LW',
        balanceXaf: 0,
        paymentProvider: 'orange',
      },
      {
        id: 'l4',
        name: 'Samuel D.',
        initials: 'SD',
        balanceXaf: 0,
        paymentProvider: 'cash',
      },
    ],
  },
];

export default function DashboardPage() {
  const [groups] = useState<GroupCardData[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState<string>(INITIAL_GROUPS[0].id);
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // Light / Dark Theme toggle helper
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
      if (meta) meta.setAttribute('content', '#191816');
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('splitm_theme', 'light'); } catch (_) {}
      const meta = document.getElementById('theme-color-meta');
      if (meta) meta.setAttribute('content', '#F7F4EE');
    }
  };

  // Swap group positions smoothly when an inactive card is tapped
  const handleSelectGroup = (newActiveId: string) => {
    setActiveGroupId(newActiveId);
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const otherGroups = groups.filter((g) => g.id !== activeGroupId);

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent/20 transition-colors duration-200">
      {/* Mobile Screen Container: Edge-to-edge portrait on mobile (<768px), elegant centered phone canvas on larger screens */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between relative shadow-sm">
        {/* Top Header Bar */}
        <header className="px-5 pt-4 pb-2 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-xl tracking-tight text-primary">
              SplitM
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-border-subtle text-muted">
              Receipt Ledger
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted hover:text-primary hover:bg-surface transition-colors"
              aria-label={isDark ? 'Switch to light paper' : 'Switch to warm charcoal dark'}
              title={isDark ? 'Switch to light paper' : 'Switch to warm charcoal dark'}
            >
              {isDark ? (
                <Sun size={18} weight="duotone" className="text-amber-400" />
              ) : (
                <Moon size={18} weight="duotone" className="text-slate-600" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area (The "Dashboard" from the sketch) */}
        <main
          className="flex-1 px-4 pt-1 pb-24 overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Active Group Card Header Label */}
          <div className="flex items-center justify-between px-1 mb-1 text-[11px] font-mono tracking-wider text-muted uppercase">
            <span>Active Group</span>
            <span>Tap avatar for balance</span>
          </div>

          {/* 1. Active Group Card with Circular Avatar Ring */}
          <GroupRingCard
            group={activeGroup}
            isActive={true}
            onSelectGroup={handleSelectGroup}
          />

          {/* Section Divider & Perforation Marker */}
          <div className="mt-8 mb-4 px-2 flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-muted uppercase tracking-wider">
              Other Groups ({otherGroups.length})
            </span>
            <span className="text-[10px] font-mono text-muted/70">
              Tap card to switch active
            </span>
          </div>

          {/* 2. Scrollable List of Additional Group Cards */}
          <div className="space-y-6">
            {otherGroups.map((group) => (
              <GroupRingCard
                key={group.id}
                group={group}
                isActive={false}
                onSelectGroup={handleSelectGroup}
              />
            ))}
          </div>

          {/* End of Receipt Paper Watermark */}
          <div className="mt-8 mb-4 text-center">
            <div className="w-16 h-[1px] bg-border mx-auto mb-2" />
            <p className="text-[10px] font-mono text-muted/60 tracking-widest uppercase">
              End of Active Ledger • SplitM PWA
            </p>
          </div>
        </main>

        {/* Bottom Navigation Bar with Signature Receipt-Tear Divider & Center Plus */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'dashboard') {
              // Soft stub indication for other tabs
              console.log(`Switched to tab: ${tab}`);
            }
          }}
          onAddClick={() => setIsAddSheetOpen(true)}
        />

        {/* Bottom Sheet Modal for Adding Expense / Pooled MoMo Payment */}
        <AddActionSheet
          isOpen={isAddSheetOpen}
          onClose={() => setIsAddSheetOpen(false)}
          activeGroupName={activeGroup.name}
        />
      </div>
    </div>
  );
}
