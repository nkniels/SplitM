/**
 * Mock Mobile Money Payment Aggregator Service
 *
 * Implements a realistic timer-based simulator for pooled group payments (PMP),
 * simulating USSD push prompt delivery to Cameroon Mobile Money subscribers
 * (MTN MoMo and Orange Money).
 *
 * Architecture note: Designed behind a clean aggregator interface so a real
 * payment gateway (e.g. CinetPay, Notch Pay, Campay, or MTN MoMo Open API)
 * can replace this module without requiring any changes to the UI layer.
 */

export type MemberPaymentStatus = 'waiting' | 'approved' | 'declined' | 'expired';

export type PaymentRequestStatus =
  | 'idle'
  | 'collecting'
  | 'completed'
  | 'action_needed'
  | 'cancelled';

export interface PaymentRecipient {
  name: string;
  phoneNumber: string;
  network: 'mtn' | 'orange' | 'unknown';
  isMerchant?: boolean;
}

export interface MemberShare {
  memberId: string;
  memberName: string;
  avatarUrl?: string;
  initials: string;
  phoneNumber?: string;
  network: 'mtn' | 'orange' | 'cash';
  amount: number; // Integer FCFA
  status: MemberPaymentStatus;
  updatedAt: number;
}

export interface PaymentRequest {
  id: string;
  groupId: string;
  groupName: string;
  recipient: PaymentRecipient;
  totalAmount: number; // Integer FCFA
  note?: string;
  shares: MemberShare[];
  status: PaymentRequestStatus;
  createdAt: number;
  completedAt?: number;
  ussdRef?: string;
}

export type PaymentSubscriber = (request: PaymentRequest) => void;

class MockPaymentAggregatorService {
  private activeRequests: Map<string, PaymentRequest> = new Map();
  private subscribers: Map<string, Set<PaymentSubscriber>> = new Map();
  private timers: Map<string, any[]> = new Map();

  /**
   * Helper to format amounts in strict SplitM FCFA format: "12 500 FCFA"
   */
  public formatFcfa(amount: number): string {
    const rounded = Math.round(amount || 0);
    const withSpaces = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${withSpaces} FCFA`;
  }

  /**
   * Auto-detect Cameroon carrier from local phone number prefix
   * MTN Cameroon: 67x, 650-654, 680-683
   * Orange Cameroon: 69x, 655-659
   */
  public detectCameroonNetwork(rawPhone: string): 'mtn' | 'orange' | 'unknown' {
    const cleaned = rawPhone.replace(/\D/g, '');
    const local = cleaned.startsWith('237') ? cleaned.slice(3) : cleaned;

    if (local.length < 2) return 'unknown';

    // 2-digit check
    const prefix2 = local.slice(0, 2);
    if (prefix2 === '67') return 'mtn';
    if (prefix2 === '69') return 'orange';

    // 3-digit check
    if (local.length >= 3) {
      const prefix3 = local.slice(0, 3);
      const num3 = parseInt(prefix3, 10);
      if (num3 >= 650 && num3 <= 654) return 'mtn';
      if (num3 >= 680 && num3 <= 683) return 'mtn';
      if (num3 >= 655 && num3 <= 659) return 'orange';
    }

    return 'unknown';
  }

  /**
   * Subscribe to live updates for a specific payment request
   */
  public subscribe(requestId: string, subscriber: PaymentSubscriber): () => void {
    if (!this.subscribers.has(requestId)) {
      this.subscribers.set(requestId, new Set());
    }
    this.subscribers.get(requestId)!.add(subscriber);

    // Initial broadcast
    const current = this.activeRequests.get(requestId);
    if (current) {
      subscriber({ ...current });
    }

    return () => {
      const subs = this.subscribers.get(requestId);
      if (subs) {
        subs.delete(subscriber);
      }
    };
  }

  private notify(requestId: string) {
    const req = this.activeRequests.get(requestId);
    if (!req) return;
    const subs = this.subscribers.get(requestId);
    if (subs) {
      subs.forEach((cb) => cb({ ...req, shares: [...req.shares] }));
    }
  }

  /**
   * Initiate payment collection across group members.
   * Dispatches timer-based events simulating subscriber PIN authorization.
   */
  public initiatePaymentRequest(params: {
    groupId: string;
    groupName: string;
    recipient: PaymentRecipient;
    totalAmount: number;
    note?: string;
    shares: Omit<MemberShare, 'status' | 'updatedAt'>[];
    autoApproveDelayMs?: number;
  }): PaymentRequest {
    const requestId = `req-pmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const ussdRef = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRequest: PaymentRequest = {
      id: requestId,
      groupId: params.groupId,
      groupName: params.groupName,
      recipient: params.recipient,
      totalAmount: Math.round(params.totalAmount),
      note: params.note,
      status: 'collecting',
      createdAt: Date.now(),
      ussdRef,
      shares: params.shares.map((s, idx) => ({
        ...s,
        amount: Math.round(s.amount),
        // If organizer (Bryan / You), immediate approval simulate
        status: idx === 0 ? 'approved' : 'waiting',
        updatedAt: Date.now(),
      })),
    };

    this.activeRequests.set(requestId, newRequest);
    this.timers.set(requestId, []);

    // Start simulation for waiting members
    this.startSimulationTimeline(requestId);

    return newRequest;
  }

  private startSimulationTimeline(requestId: string) {
    const req = this.activeRequests.get(requestId);
    if (!req) return;

    const requestTimers = this.timers.get(requestId) || [];

    // Schedule realistic asynchronous simulated approvals
    const waitingIndices = req.shares
      .map((s, i) => (s.status === 'waiting' ? i : -1))
      .filter((i) => i !== -1);

    waitingIndices.forEach((shareIdx, order) => {
      // Delays between 1.8s and 5.5s
      const delay = (order + 1) * 1800 + Math.random() * 900;

      const t = setTimeout(() => {
        const currentReq = this.activeRequests.get(requestId);
        if (!currentReq || currentReq.status === 'completed' || currentReq.status === 'cancelled') {
          return;
        }

        const share = currentReq.shares[shareIdx];
        if (share && share.status === 'waiting') {
          // Simulation rule: member with Franck or special index occasionally times out or declines if tested,
          // but defaults to high success rate (95%) for smooth UX.
          share.status = 'approved';
          share.updatedAt = Date.now();

          // Check if all shares are approved
          const allApproved = currentReq.shares.every((s) => s.status === 'approved');
          if (allApproved) {
            currentReq.status = 'completed';
            currentReq.completedAt = Date.now();
          }

          this.notify(requestId);
        }
      }, delay);

      requestTimers.push(t);
    });

    this.timers.set(requestId, requestTimers);
  }

  /**
   * Resend carrier prompt notification to a specific waiting or expired member
   */
  public resendRequest(requestId: string, memberId: string): boolean {
    const req = this.activeRequests.get(requestId);
    if (!req) return false;

    const share = req.shares.find((s) => s.memberId === memberId);
    if (!share) return false;

    share.status = 'waiting';
    share.updatedAt = Date.now();
    this.notify(requestId);

    // Schedule approval 2.2s after resend
    const t = setTimeout(() => {
      const current = this.activeRequests.get(requestId);
      if (!current || current.status !== 'collecting') return;
      const target = current.shares.find((s) => s.memberId === memberId);
      if (target && target.status === 'waiting') {
        target.status = 'approved';
        target.updatedAt = Date.now();

        if (current.shares.every((s) => s.status === 'approved')) {
          current.status = 'completed';
          current.completedAt = Date.now();
        }
        this.notify(requestId);
      }
    }, 2200);

    const timers = this.timers.get(requestId) || [];
    timers.push(t);
    this.timers.set(requestId, timers);
    return true;
  }

  /**
   * Action when a member declines or expires: organizer covers their share
   */
  public coverShare(requestId: string, declinedMemberId: string, coveringMemberId: string): boolean {
    const req = this.activeRequests.get(requestId);
    if (!req) return false;

    const declinedShare = req.shares.find((s) => s.memberId === declinedMemberId);
    const coveringShare = req.shares.find((s) => s.memberId === coveringMemberId);
    if (!declinedShare || !coveringShare) return false;

    coveringShare.amount += declinedShare.amount;
    declinedShare.amount = 0;
    declinedShare.status = 'approved'; // Mark as resolved
    declinedShare.updatedAt = Date.now();

    if (req.shares.every((s) => s.status === 'approved')) {
      req.status = 'completed';
      req.completedAt = Date.now();
    } else {
      req.status = 'collecting';
    }

    this.notify(requestId);
    return true;
  }

  /**
   * Action when a member declines or expires: reassign share equally among remaining members
   */
  public reassignShare(requestId: string, declinedMemberId: string): boolean {
    const req = this.activeRequests.get(requestId);
    if (!req) return false;

    const declinedShare = req.shares.find((s) => s.memberId === declinedMemberId);
    if (!declinedShare || declinedShare.amount <= 0) return false;

    const remainingApproved = req.shares.filter(
      (s) => s.memberId !== declinedMemberId && s.status === 'approved'
    );
    if (remainingApproved.length === 0) return false;

    const extraEach = Math.floor(declinedShare.amount / remainingApproved.length);
    const remainder = declinedShare.amount % remainingApproved.length;

    remainingApproved.forEach((s, idx) => {
      s.amount += extraEach + (idx === 0 ? remainder : 0);
    });

    declinedShare.amount = 0;
    declinedShare.status = 'approved';
    declinedShare.updatedAt = Date.now();

    if (req.shares.every((s) => s.status === 'approved')) {
      req.status = 'completed';
      req.completedAt = Date.now();
    }

    this.notify(requestId);
    return true;
  }

  /**
   * Action: Cancel payment collection and revert/refund
   */
  public cancelAndRefund(requestId: string): boolean {
    const req = this.activeRequests.get(requestId);
    if (!req) return false;

    // Clear any pending timers
    const timers = this.timers.get(requestId) || [];
    timers.forEach(clearTimeout);
    this.timers.delete(requestId);

    req.status = 'cancelled';
    this.notify(requestId);
    return true;
  }

  /**
   * Developer simulator helper: simulate a member decline for testing resolution flows
   */
  public simulateDecline(requestId: string, memberId: string) {
    const req = this.activeRequests.get(requestId);
    if (!req) return;

    const share = req.shares.find((s) => s.memberId === memberId);
    if (share && share.status === 'waiting') {
      share.status = 'declined';
      share.updatedAt = Date.now();
      req.status = 'action_needed';
      this.notify(requestId);
    }
  }

  public simulateMemberDecline(requestId: string, memberId: string) {
    this.simulateDecline(requestId, memberId);
  }

  /**
   * Developer simulator helper: instantly approve all remaining shares
   */
  public forceApproveAll(requestId: string) {
    const req = this.activeRequests.get(requestId);
    if (!req) return;

    req.shares.forEach((s) => {
      s.status = 'approved';
      s.updatedAt = Date.now();
    });
    req.status = 'completed';
    req.completedAt = Date.now();
    this.notify(requestId);
  }
}

export const mockPaymentService = new MockPaymentAggregatorService();
