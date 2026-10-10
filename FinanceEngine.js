// FinanceEngine contains pure functions for expense distribution and settlement calculation
const toCents = (amt) => Math.round(amt * 100);
const fromCents = (cents) => cents / 100;

const FinanceEngine = {
    /**
     * Distributes a total amount among members based on the split type.
     * Guarantees exact integer-cent precision with zero floating-point remainder drift.
     * @param {number} totalAmount - Total amount to split.
     * @param {Array} members - Array of member objects { id, weight (optional) }.
     * @param {string} splitType - 'equal', 'proportional', 'percent', 'custom'.
     * @param {Object} customValues - Key: memberId, Value: amount or percent depending on type.
     * @returns {Array} Array of { memberId, amount } objects representing the split.
     */
    distributeSplit(totalAmount, members, splitType, customValues = {}) {
        if (!members || members.length === 0 || totalAmount <= 0) return [];
        const totalCents = toCents(totalAmount);
        const splits = [];

        if (splitType === 'custom') {
            let customSumCents = 0;
            const customSplits = [];

            for (const [id, amt] of Object.entries(customValues)) {
                const c = toCents(amt);
                if (c > 0) {
                    customSumCents += c;
                    customSplits.push({ memberId: id, cents: c });
                }
            }

            const diffCents = totalCents - customSumCents;
            if (Math.abs(diffCents) <= 2 && customSplits.length > 0) {
                customSplits[0].cents += diffCents;
            }

            for (const s of customSplits) {
                if (s.cents > 0) splits.push({ memberId: s.memberId, amount: fromCents(s.cents) });
            }
            return splits;
        }

        if (splitType === 'percent') {
            let totalPercent = 0;
            const entries = [];

            for (const [id, percent] of Object.entries(customValues)) {
                if (percent > 0) {
                    totalPercent += percent;
                    entries.push({ memberId: id, percent });
                }
            }

            if (entries.length === 0 || totalPercent <= 0) return [];

            const isFullAllocation = Math.abs(totalPercent - 100) <= 0.1;
            const targetCents = isFullAllocation ? totalCents : Math.round((totalPercent / 100) * totalCents);

            const allocations = entries.map(e => {
                const rawCents = isFullAllocation
                    ? (totalCents * e.percent) / 100
                    : (targetCents * e.percent) / totalPercent;
                const floorCents = Math.floor(rawCents);
                const remainder = rawCents - floorCents;
                return { memberId: e.memberId, floorCents, remainder };
            });

            const assignedCents = allocations.reduce((sum, a) => sum + a.floorCents, 0);
            const remainderPennies = targetCents - assignedCents;

            allocations.sort((a, b) => b.remainder - a.remainder);
            for (let i = 0; i < remainderPennies && i < allocations.length; i++) {
                allocations[i].floorCents += 1;
            }

            for (const a of allocations) {
                if (a.floorCents > 0) {
                    splits.push({ memberId: a.memberId, amount: fromCents(a.floorCents) });
                }
            }
            return splits;
        }

        if (splitType === 'equal') {
            const baseCents = Math.floor(totalCents / members.length);
            let remainderPennies = totalCents - (baseCents * members.length);

            members.forEach(m => {
                const extra = remainderPennies > 0 ? 1 : 0;
                if (remainderPennies > 0) remainderPennies--;
                const memberCents = baseCents + extra;
                if (memberCents > 0) {
                    splits.push({ memberId: m.id, amount: fromCents(memberCents) });
                }
            });
            return splits;
        }

        if (splitType === 'proportional') {
            const totalWeight = members.reduce((sum, m) => sum + Math.max(0, m.weight || 1), 0);

            if (totalWeight <= 0) {
                return FinanceEngine.distributeSplit(totalAmount, members, 'equal');
            }

            const allocations = members.map(m => {
                const weight = Math.max(0, m.weight || 1);
                const rawCents = (totalCents * weight) / totalWeight;
                const floorCents = Math.floor(rawCents);
                const remainder = rawCents - floorCents;
                return { memberId: m.id, floorCents, remainder };
            });

            const assignedCents = allocations.reduce((sum, a) => sum + a.floorCents, 0);
            const remainderPennies = totalCents - assignedCents;

            allocations.sort((a, b) => b.remainder - a.remainder);
            for (let i = 0; i < remainderPennies && i < allocations.length; i++) {
                allocations[i].floorCents += 1;
            }

            for (const a of allocations) {
                if (a.floorCents > 0) {
                    splits.push({ memberId: a.memberId, amount: fromCents(a.floorCents) });
                }
            }
            return splits;
        }

        return splits;
    },

    /**
     * Calculates the net balance for each member in a group.
     * @param {Object} group - The group object containing members and expenses.
     * @param {Array} settlements - Optional list of { from, to, amount } settlements.
     * @returns {Object} A map of memberId -> net balance.
     */
    calculateBalances(group, settlements = []) {
        const balances = {};
        if (!group.members) return balances;

        group.members.forEach(m => balances[m.id] = 0);

        if (group.expenses) {
            group.expenses.forEach(expense => {
                expense.payers.forEach(p => {
                    if (balances[p.memberId] !== undefined) {
                        balances[p.memberId] = fromCents(toCents(balances[p.memberId]) + toCents(p.amount));
                    }
                });
                expense.splits.forEach(s => {
                    if (balances[s.memberId] !== undefined) {
                        balances[s.memberId] = fromCents(toCents(balances[s.memberId]) - toCents(s.amount));
                    }
                });
            });
        }

        settlements.forEach(st => {
            if (balances[st.from] !== undefined) {
                balances[st.from] = fromCents(toCents(balances[st.from]) + toCents(st.amount));
            }
            if (balances[st.to] !== undefined) {
                balances[st.to] = fromCents(toCents(balances[st.to]) - toCents(st.amount));
            }
        });

        return balances;
    },

    /**
     * Computes the minimal number of transactions needed to settle debts.
     * @param {Object} balances - A map of memberId -> net balance.
     * @returns {Array} Array of { from, to, amount } settlement transactions.
     */
    computeSettlements(balances) {
        const debtors = [];
        const creditors = [];

        for (const [id, balance] of Object.entries(balances)) {
            const cents = toCents(balance);
            if (cents < 0) debtors.push({ id, cents: -cents });
            else if (cents > 0) creditors.push({ id, cents });
        }

        debtors.sort((a, b) => b.cents - a.cents);
        creditors.sort((a, b) => b.cents - a.cents);

        const settlements = [];
        let d = 0;
        let c = 0;

        while (d < debtors.length && c < creditors.length) {
            const debtor = debtors[d];
            const creditor = creditors[c];

            if (debtor.cents <= 0) { d++; continue; }
            if (creditor.cents <= 0) { c++; continue; }

            const settleCents = Math.min(debtor.cents, creditor.cents);

            settlements.push({
                from: debtor.id,
                to: creditor.id,
                amount: fromCents(settleCents)
            });

            debtor.cents -= settleCents;
            creditor.cents -= settleCents;

            if (debtor.cents <= 0) d++;
            if (creditor.cents <= 0) c++;
        }

        return settlements;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinanceEngine;
}
