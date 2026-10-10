# SplitM — Engineering & Agent Guidelines (powered by gstack)

This repository follows the **gstack** development methodology and software factory principles created by Garry Tan.

---

## 1. Builder Ethos

### Boil the Ocean
- **Completeness is cheap**: AI makes the marginal cost of completeness near-zero. When evaluating a complete implementation (~150 LOC) vs a shortcut (90% coverage, ~80 LOC), always prefer the complete implementation.
- **Ocean, lakes first**: Break down full coverage into manageable units ("lakes"). Never defer tests, validation, or error states to a follow-up if they can be completed now.
- Do not cut corners on currency precision, rounding remainders, offline sync, or security rules.

### Search Before Building
Understand the three layers of knowledge before writing code:
1. **Layer 1: Tried and True** — Standard patterns, robust libraries, battle-tested algorithms (e.g. debt-simplification greedy heuristics, integer-cent arithmetic).
2. **Layer 2: New and Popular** — Current ecosystem trends and best practices. Scrutinize them carefully; don't blindly follow hype.
3. **Layer 3: First Principles** — Tailor logic to SplitM's exact user experience and mathematical reality. Seek the *Eureka moment* where conventional apps fall short (e.g. awkward debt conversations, unequal splits, uneven pennies).

### User Sovereignty
- **Models recommend, the user decides**: AI never silently alters architecture or overrides business decisions.
- Cross-model or multi-agent agreement is a signal, not a mandate.
- Present recommendations with rationale, outline trade-offs, and confirm before making high-impact changes.

### Build for Yourself
- Focus on real, tangible pain points when splitting group expenses with friends and roommates, not hypothetical abstractions.

---

## 2. The Reuse Ladder

Before authoring new utilities, stop at the first rung that holds:
1. A helper, util, or pattern already in the codebase (e.g. `FinanceEngine`, Redux slice actions).
2. Built-in platform capabilities (e.g. `Intl.NumberFormat`, standard Web APIs).
3. Established, trusted dependencies (e.g. Firebase Firestore SDK, Lucide icons).
4. Only then write custom logic from scratch.

---

## 3. The Iron Law of Investigation & Debugging

When debugging financial calculation errors, sync mismatches, or UI glitches:
1. **No speculative fixes without root-cause investigation**: Never apply guesses hoping a bug goes away.
2. **Reproduce first**: Identify the exact sequence of actions or state transitions causing the bug.
3. **Trace data flow**: Track the numbers from Firestore $\rightarrow$ Redux Store $\rightarrow$ `FinanceEngine` $\rightarrow$ UI components.
4. **Preserve regression tests**: Any fixed financial bug must have a reproducible test verifying the fix.
5. **Circuit breaker**: If three fix attempts fail, stop, document findings, and rethink the premise with the user.

---

## 4. Financial Calculation Standards
- **Integer Cents / Exact Decimal Handling**: Floating point math (`0.1 + 0.2 !== 0.3`) must never corrupt financial ledgers. All splits and balances must account for pennies and remainders.
- **Zero-Sum Ledger Invariant**: In any expense or settlement, $\sum \text{Paid} \equiv \sum \text{Owed}$. Net group balances must sum to $0.00$.
- **Auditability**: Every debt settlement must map directly to explicit member transactions.
