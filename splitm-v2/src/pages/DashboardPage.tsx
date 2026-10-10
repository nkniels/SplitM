import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon } from '@phosphor-icons/react';
import type { RootState, AppDispatch } from '../core/store/store';
import { loadGroups, loadMembersThunk } from '../modules/groups/group.thunks';
import { loadExpenses } from '../modules/expenses/expense.thunks';
import { setGroups, setMembers } from '../modules/groups/group.slice';
import { setExpenses } from '../modules/expenses/expense.slice';
import { subscribeToUserGroups, subscribeToGroupMembers } from '../modules/groups/group.service';
import { subscribeToGroupExpenses } from '../modules/expenses/expense.service';
import { FinanceEngine } from '../core/finance/FinanceEngine';
import type { Group } from '../core/types';
import { GroupRingCard, type GroupCardData } from '../components/dashboard/GroupRingCard';
import { BottomNav, type NavTabId } from '../components/dashboard/BottomNav';
import { AddActionSheet } from '../components/dashboard/AddActionSheet';
import { PooledMoMoDrawer } from '../components/dashboard/PooledMoMoDrawer';
import { DebtSettlementModal } from '../components/dashboard/DebtSettlementModal';
import { GroupReceiptShareModal } from '../components/dashboard/GroupReceiptShareModal';
import { RecentReceiptsDrawer } from '../components/dashboard/RecentReceiptsDrawer';
import { UserProfileModal } from '../components/dashboard/UserProfileModal';
import { triggerHaptic } from '../core/utils/haptics';
import type { RingMember } from '../components/dashboard/MemberBalancePopover';
import { SplitMLogo } from '../components/common/SplitMLogo';
import { ExpenseForm } from '../components/expenses/ExpenseForm';
import GroupForm from '../components/groups/GroupForm';

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
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'AK',
        balanceXaf: 12500,
        paymentProvider: 'mtn',
      },
      {
        id: 'm2',
        name: 'Bryan T. (You)',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'BT',
        balanceXaf: -4500,
        paymentProvider: 'orange',
      },
      {
        id: 'm3',
        name: 'Cécile N.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'CN',
        balanceXaf: -3200,
        paymentProvider: 'mtn',
      },
      {
        id: 'm4',
        name: 'Danielle M.',
        avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'DM',
        balanceXaf: 8000,
        paymentProvider: 'mtn',
      },
      {
        id: 'm5',
        name: 'Eric F.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'EF',
        balanceXaf: -12800,
        paymentProvider: 'orange',
      },
      {
        id: 'm6',
        name: 'Franck O.',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&h=160&q=80',
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
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'BT',
        balanceXaf: 16000,
        paymentProvider: 'orange',
      },
      {
        id: 'k2',
        name: 'Nadine B.',
        avatarUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'NB',
        balanceXaf: -6000,
        paymentProvider: 'mtn',
      },
      {
        id: 'k3',
        name: 'Paul E.',
        avatarUrl: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'PE',
        balanceXaf: -10000,
        paymentProvider: 'orange',
      },
      {
        id: 'k4',
        name: 'Sandra M.',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'SM',
        balanceXaf: 0,
        paymentProvider: 'cash',
      },
      {
        id: 'k5',
        name: 'Thierry K.',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&h=160&q=80',
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
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'BT',
        balanceXaf: 0,
        paymentProvider: 'orange',
      },
      {
        id: 'l2',
        name: 'Alain K.',
        avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'AK',
        balanceXaf: 0,
        paymentProvider: 'mtn',
      },
      {
        id: 'l3',
        name: 'Linda W.',
        avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'LW',
        balanceXaf: 0,
        paymentProvider: 'orange',
      },
      {
        id: 'l4',
        name: 'Samuel D.',
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&h=160&q=80',
        initials: 'SD',
        balanceXaf: 0,
        paymentProvider: 'cash',
      },
    ],
  },
];

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const firestoreGroups = useSelector((state: RootState) => state.groups.groups);
  const firestoreMembers = useSelector((state: RootState) => state.groups.members);
  const firestoreExpenses = useSelector((state: RootState) => state.expenses.expenses);

  const [activeGroupId, setActiveGroupId] = useState<string>(INITIAL_GROUPS[0].id);
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  // Feature Expansion States (Pooled MoMo, 1-Tap Settle, WhatsApp Share, Receipts, Profile)
  const [localGroups, setLocalGroups] = useState<GroupCardData[]>(INITIAL_GROUPS);
  const [isPooledDrawerOpen, setIsPooledDrawerOpen] = useState(false);
  const [isShareReceiptOpen, setIsShareReceiptOpen] = useState(false);
  const [isDebtSettlementOpen, setIsDebtSettlementOpen] = useState(false);
  const [settlingMember, setSettlingMember] = useState<RingMember | null>(null);
  const [isRecentReceiptsOpen, setIsRecentReceiptsOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Bryan T. (You)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
    provider: 'orange' as 'mtn' | 'orange',
  });

  // Handle Pooled MoMo Contribution
  const handleContributeSuccess = (groupId: string, amount: number) => {
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const target = g.pooledTarget ?? g.totalExpenses;
        const newCollected = Math.min(target, (g.pooledCollected ?? 0) + amount);
        return {
          ...g,
          pooledCollected: newCollected,
        };
      })
    );
  };

  // Handle 1-Tap Debt Settlement with Zero-Sum Invariant preservation
  const handleConfirmSettlement = (targetMemberId: string, amount: number) => {
    setLocalGroups((prev) =>
      prev.map((g) => {
        if (g.id !== activeGroupId) return g;
        const updatedMembers = g.members.map((m) => {
          if (m.id === targetMemberId) {
            return { ...m, balanceXaf: 0 };
          }
          if (m.name.includes('You')) {
            const nextBal = m.balanceXaf + amount;
            return { ...m, balanceXaf: nextBal };
          }
          return m;
        });

        const currentUserMember = updatedMembers.find((m) => m.name.includes('You'));
        const userBal = currentUserMember?.balanceXaf ?? 0;
        const userBalanceType = userBal > 0 ? 'owed' : userBal < 0 ? 'owes' : 'settled';
        const summaryText =
          userBal > 0
            ? `You are owed ${userBal.toLocaleString('en-US')} XAF`
            : userBal < 0
            ? `You owe ${Math.abs(userBal).toLocaleString('en-US')} XAF`
            : 'All balances settled';

        return {
          ...g,
          members: updatedMembers,
          userBalanceType,
          userBalanceAmount: Math.abs(userBal),
          summaryText,
        };
      })
    );
  };

  // Handle User Profile update
  const handleSaveProfile = (name: string, avatarUrl: string, provider: 'mtn' | 'orange') => {
    setUserProfile({ name, avatarUrl, provider });
    setLocalGroups((prev) =>
      prev.map((g) => ({
        ...g,
        members: g.members.map((m) =>
          m.name.includes('You')
            ? { ...m, name: `${name.replace(' (You)', '')} (You)`, avatarUrl, paymentProvider: provider }
            : m
        ),
      }))
    );
  };

  // Load groups on mount and subscribe to real-time updates from Firestore
  useEffect(() => {
    if (currentUser?.uid) {
      void dispatch(loadGroups());
      const unsub = subscribeToUserGroups(currentUser.uid, (freshGroups) => {
        dispatch(setGroups(freshGroups));
      });
      return () => unsub();
    }
  }, [dispatch, currentUser?.uid]);

  // Synchronize Firestore groups into active state
  useEffect(() => {
    const groupKeys = Object.keys(firestoreGroups);
    if (groupKeys.length > 0 && !groupKeys.includes(activeGroupId)) {
      setActiveGroupId(groupKeys[0]);
    }
  }, [firestoreGroups, activeGroupId]);

  // When active group changes, load its expenses and members with real-time listeners
  useEffect(() => {
    if (activeGroupId && firestoreGroups[activeGroupId]) {
      void dispatch(loadExpenses(activeGroupId));
      void dispatch(loadMembersThunk(activeGroupId));

      const unsubExpenses = subscribeToGroupExpenses(activeGroupId, (freshExpenses) => {
        dispatch(setExpenses(freshExpenses));
      });

      const unsubMembers = subscribeToGroupMembers(activeGroupId, (freshMembers) => {
        dispatch(setMembers(freshMembers));
      });

      return () => {
        unsubExpenses();
        unsubMembers();
      };
    }
  }, [dispatch, activeGroupId, firestoreGroups]);

  // Derive cards from Firestore if user has groups; otherwise use mock domain data
  const groups = useMemo<GroupCardData[]>(() => {
    const groupList = Object.values(firestoreGroups);
    if (!currentUser || groupList.length === 0) {
      return localGroups;
    }

    return groupList.map((grp) => {
      const grpMembers = Object.values(firestoreMembers).filter((m) => m.groupId === grp.id);
      const grpExpenses = Object.values(firestoreExpenses).filter((e) => e.groupId === grp.id && !e.settled);

      const derivedGroup: Group = {
        ...grp,
        members: grpMembers,
        expenses: grpExpenses,
      };

      const balances =
        grpMembers.length > 0 && grpExpenses.length > 0
          ? FinanceEngine.calculateBalances(derivedGroup)
          : {};

      const currentMember =
        grpMembers.find((m) => m.name.toLowerCase().includes('you')) ||
        grpMembers[0];
      const userBalance = currentMember && balances[currentMember.id] ? balances[currentMember.id] : 0;

      const userBalanceType = userBalance > 0 ? 'owed' : userBalance < 0 ? 'owes' : 'settled';
      const summaryText =
        userBalance > 0
          ? `You are owed ${userBalance.toLocaleString('en-US')} XAF`
          : userBalance < 0
          ? `You owe ${Math.abs(userBalance).toLocaleString('en-US')} XAF`
          : 'All balances settled';

      const ringMembers = grpMembers.map((m) => {
        const bal = balances[m.id] ?? 0;
        const nameParts = m.name.split(' ');
        const initials =
          nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : m.name.slice(0, 2).toUpperCase();

        return {
          id: m.id,
          name: m.name,
          initials,
          balanceXaf: bal,
          paymentProvider: 'mtn' as const,
        };
      });

      const totalSpent = grpExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        id: grp.id,
        name: grp.name,
        category: grp.description || 'Group Ledger',
        summaryText,
        userBalanceType,
        userBalanceAmount: Math.abs(userBalance),
        totalExpenses: totalSpent,
        pooledCollected: grp.budget ? Math.min(totalSpent, grp.budget) : undefined,
        pooledTarget: grp.budget || undefined,
        members: ringMembers.length > 0 ? ringMembers : INITIAL_GROUPS[0].members,
      };
    });
  }, [firestoreGroups, firestoreMembers, firestoreExpenses, currentUser, localGroups]);

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

  const activeRealMembers = Object.values(firestoreMembers).filter((m) => m.groupId === activeGroupId);

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent/20 transition-colors duration-200">
      {/* Mobile Screen Container: Edge-to-edge portrait on mobile (<768px), elegant centered phone canvas on larger screens */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between relative shadow-sm">
        {/* Top Header Bar */}
        <header className="px-5 pt-4 pb-2 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <SplitMLogo size="sm" textSize="md" />
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
            onOpenPooledDrawer={() => setIsPooledDrawerOpen(true)}
            onShareReceipt={() => setIsShareReceiptOpen(true)}
            onSettleMember={(member) => {
              setSettlingMember(member);
              setIsDebtSettlementOpen(true);
            }}
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
                onOpenPooledDrawer={() => {
                  handleSelectGroup(group.id);
                  setIsPooledDrawerOpen(true);
                }}
                onShareReceipt={() => {
                  handleSelectGroup(group.id);
                  setIsShareReceiptOpen(true);
                }}
                onSettleMember={(member) => {
                  handleSelectGroup(group.id);
                  setSettlingMember(member);
                  setIsDebtSettlementOpen(true);
                }}
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
            triggerHaptic('light');
            if (tab === 'history') {
              setIsRecentReceiptsOpen(true);
            } else if (tab === 'profile') {
              setIsUserProfileOpen(true);
            }
          }}
          onAddClick={() => {
            triggerHaptic('medium');
            setIsAddSheetOpen(true);
          }}
        />

        {/* Bottom Sheet Modal for Adding Expense / Pooled MoMo Payment */}
        <AddActionSheet
          isOpen={isAddSheetOpen}
          onClose={() => setIsAddSheetOpen(false)}
          activeGroupName={activeGroup.name}
          onAddExpense={() => {
            if (activeRealMembers.length > 0) {
              setShowExpenseForm(true);
            } else {
              setShowGroupForm(true);
            }
          }}
          onStartPooled={() => {
            setIsAddSheetOpen(false);
            setIsPooledDrawerOpen(true);
          }}
        />

        {/* 1. Interactive Pooled MoMo Pot Drawer */}
        <PooledMoMoDrawer
          isOpen={isPooledDrawerOpen}
          group={activeGroup}
          onClose={() => setIsPooledDrawerOpen(false)}
          onContributeSuccess={handleContributeSuccess}
        />

        {/* 2. 1-Tap Debt Settlement Modal */}
        <DebtSettlementModal
          isOpen={isDebtSettlementOpen}
          targetMember={settlingMember}
          currentUserName={userProfile.name}
          onClose={() => {
            setIsDebtSettlementOpen(false);
            setSettlingMember(null);
          }}
          onConfirmSettlement={handleConfirmSettlement}
        />

        {/* 3. WhatsApp Receipt Share Modal */}
        <GroupReceiptShareModal
          isOpen={isShareReceiptOpen}
          group={activeGroup}
          onClose={() => setIsShareReceiptOpen(false)}
        />

        {/* 4. Recent Receipts Audit Trail Drawer */}
        <RecentReceiptsDrawer
          isOpen={isRecentReceiptsOpen}
          group={activeGroup}
          onClose={() => {
            setIsRecentReceiptsOpen(false);
            setActiveTab('dashboard');
          }}
        />

        {/* 5. User Profile Preferences Modal */}
        <UserProfileModal
          isOpen={isUserProfileOpen}
          currentName={userProfile.name}
          currentAvatarUrl={userProfile.avatarUrl}
          onClose={() => {
            setIsUserProfileOpen(false);
            setActiveTab('dashboard');
          }}
          onSaveProfile={handleSaveProfile}
        />

        {/* Real Expense Creation Modal wired to Firestore */}
        {showExpenseForm && activeGroupId && activeRealMembers.length > 0 && (
          <ExpenseForm
            groupId={activeGroupId}
            members={activeRealMembers}
            onClose={() => setShowExpenseForm(false)}
          />
        )}

        {/* Real Group Creation Modal wired to Firestore */}
        {showGroupForm && (
          <GroupForm
            onClose={() => setShowGroupForm(false)}
          />
        )}
      </div>
    </div>
  );
}
