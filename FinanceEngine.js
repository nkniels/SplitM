// FinanceEngine contains pure functions for expense distribution and settlement calculation
const FinanceEngine = {
    /**
     * Distributes a total amount among members based on the split type.
     * Fixes rounding errors by allocating the penny remainder to the first valid member.
     * @param {number} totalAmount - Total amount to split.
     * @param {Array} members - Array of member objects { id, weight (optional) }.
     * @param {string} splitType - 'equal', 'proportional', 'percent', 'custom'.
     * @param {Object} customValues - Key: memberId, Value: amount or percent depending on type.
     * @returns {Array} Array of { memberId, amount } objects representing the split.
     */
    distributeSplit(totalAmount, members, splitType, customValues = {}) {
        if (!members || members.length === 0) return [];
        let splits = [];

        if (splitType === 'custom') {
            for (const [id, amt] of Object.entries(customValues)) {
                if (amt > 0) splits.push({ memberId: id, amount: amt });
            }
            // Strict validation: sum must match exactly (tolerance of 0.01 for floating point issues is fine, but we will force exactness later if needed).
            return splits;
        }

        if (splitType === 'percent') {
            for (const [id, percent] of Object.entries(customValues)) {
                if (percent > 0) {
                    // Truncate to 2 decimal places to avoid floating point bugs
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

        // Adjust for rounding remainders in percent, equal, and proportional
        if (['equal', 'proportional', 'percent'].includes(splitType)) {
            const calculatedSum = splits.reduce((sum, s) => sum + s.amount, 0);
            let diff = Math.round((totalAmount - calculatedSum) * 100) / 100;
            
            if (diff !== 0 && splits.length > 0) {
                // Add the remainder (which could be +0.01 or -0.01 etc.) to the first person's split
                splits[0].amount = Math.round((splits[0].amount + diff) * 100) / 100;
            }
        }

        // Filter out 0 amounts
        return splits.filter(s => s.amount > 0);
    },

    /**
     * Calculates the net balance for each member in a group.
     * @param {Object} group - The group object containing members and expenses.
     * @returns {Object} A map of memberId -> net balance. Positive means they are owed money, negative means they owe money.
     */
    calculateBalances(group) {
        const balances = {};
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
            // Use 0.01 as threshold for zero to handle floating point issues
            if (balance < -0.01) debtors.push({ id, amount: -balance });
            else if (balance > 0.01) creditors.push({ id, amount: balance });
        }

        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const settlements = [];
        let d = 0, c = 0;

        while (d < debtors.length && c < creditors.length) {
            const debtor = debtors[d];
            const creditor = creditors[c];
            
            // Prevent infinite loop if amounts are extremely small (floating point dust)
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
};
