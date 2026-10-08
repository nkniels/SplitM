import type { Member, SplitType, Split, Group, Settlement } from '../types';

export class FinanceEngine {
    /**
     * Distributes a total amount among members based on the split type.
     * Fixes rounding errors by allocating the penny remainder to the first valid member.
     */
    static distributeSplit(
        totalAmount: number,
        members: Member[],
        splitType: SplitType,
        customValues: Record<string, number> = {}
    ): Split[] {
        if (!members || members.length === 0) return [];
        const splits: Split[] = [];

        if (splitType === 'custom') {
            for (const [id, amt] of Object.entries(customValues)) {
                if (amt > 0) splits.push({ memberId: id, amount: amt });
            }
            return splits;
        }

        if (splitType === 'percent') {
            for (const [id, percent] of Object.entries(customValues)) {
                if (percent > 0) {
                    const amt = Math.round((percent / 100) * totalAmount * 100) / 100;
                    splits.push({ memberId: id, amount: amt });
                }
            }
        } else if (splitType === 'equal') {
            const splitAmt = Math.floor((totalAmount / members.length) * 100) / 100;
            members.forEach(m => {
                splits.push({ memberId: m.id, amount: splitAmt });
            });
        } else if (splitType === 'proportional') {
            const totalWeight = members.reduce((sum, m) => sum + (m.weight || 1), 0);
            members.forEach(m => {
                const amt = Math.floor(((totalAmount * (m.weight || 1)) / totalWeight) * 100) / 100;
                if (amt > 0) splits.push({ memberId: m.id, amount: amt });
            });
        }

        // Adjust for rounding remainders
        if (['equal', 'proportional', 'percent'].includes(splitType)) {
            const calculatedSum = splits.reduce((sum, s) => sum + s.amount, 0);
            const diff = Math.round((totalAmount - calculatedSum) * 100) / 100;
            
            if (diff !== 0 && splits.length > 0) {
                splits[0].amount = Math.round((splits[0].amount + diff) * 100) / 100;
            }
        }

        return splits.filter(s => s.amount > 0);
    }

    /**
     * Calculates the net balance for each member in a group.
     */
    static calculateBalances(group: Group): Record<string, number> {
        const balances: Record<string, number> = {};
        group.members.forEach(m => balances[m.id] = 0);

        group.expenses.forEach(expense => {
            expense.payers.forEach(p => {
                if (balances[p.memberId] !== undefined) balances[p.memberId] += p.amount;
            });
            expense.splits.forEach(s => {
                if (balances[s.memberId] !== undefined) balances[s.memberId] -= s.amount;
            });
        });

        return balances;
    }

    /**
     * Computes the minimal number of transactions needed to settle debts.
     */
    static computeSettlements(balances: Record<string, number>): Settlement[] {
        const debtors: { id: string; amount: number }[] = [];
        const creditors: { id: string; amount: number }[] = [];

        for (const [id, balance] of Object.entries(balances)) {
            if (balance < -0.01) debtors.push({ id, amount: -balance });
            else if (balance > 0.01) creditors.push({ id, amount: balance });
        }

        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const settlements: Settlement[] = [];
        let d = 0, c = 0;

        while (d < debtors.length && c < creditors.length) {
            const debtor = debtors[d];
            const creditor = creditors[c];
            
            if (debtor.amount < 0.01) { d++; continue; }
            if (creditor.amount < 0.01) { c++; continue; }

            const amount = Math.min(debtor.amount, creditor.amount);

            settlements.push({
                from: debtor.id,
                to: creditor.id,
                amount: Math.round(amount * 100) / 100
            });

            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount < 0.01) d++;
            if (creditor.amount < 0.01) c++;
        }

        return settlements;
    }
}
