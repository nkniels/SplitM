import assert from 'node:assert';
import { FinanceEngine } from '../splitm-v2/src/core/finance/FinanceEngine.ts';

console.log('--- RUNNING FINANCE ENGINE RIGOROUS TEST SUITE ---');

// Test 1: Equal Split across 3 members with uneven penny remainder ($100 / 3)
{
    const members = [{ id: 'm1', name: 'Alice', weight: 1, status: 'normal', groupId: 'g1' }, { id: 'm2', name: 'Bob', weight: 1, status: 'normal', groupId: 'g1' }, { id: 'm3', name: 'Charlie', weight: 1, status: 'normal', groupId: 'g1' }];
    const splits = FinanceEngine.distributeSplit(100, members, 'equal');
    const total = splits.reduce((sum, s) => sum + s.amount, 0);
    assert.strictEqual(Math.round(total * 100) / 100, 100, 'Equal split sum must be exactly 100.00');
    assert.strictEqual(splits.length, 3);
    assert.strictEqual(splits[0].amount, 33.34);
    assert.strictEqual(splits[1].amount, 33.33);
    assert.strictEqual(splits[2].amount, 33.33);
    console.log('✓ Test 1: Equal split uneven pennies passed.');
}

// Test 2: Equal Split with $0.01 across 3 members
{
    const members = [{ id: 'm1', name: 'A', weight: 1, status: 'normal', groupId: 'g1' }, { id: 'm2', name: 'B', weight: 1, status: 'normal', groupId: 'g1' }, { id: 'm3', name: 'C', weight: 1, status: 'normal', groupId: 'g1' }];
    const splits = FinanceEngine.distributeSplit(0.01, members, 'equal');
    const total = splits.reduce((sum, s) => sum + s.amount, 0);
    assert.strictEqual(Math.round(total * 100) / 100, 0.01);
    assert.strictEqual(splits.length, 1);
    assert.strictEqual(splits[0].amount, 0.01);
    console.log('✓ Test 2: Sub-cent fractional equal split passed.');
}

// Test 3: Percent Split exact 100% with fractional pennies
{
    const members = [{ id: 'm1', name: 'A', weight: 1, status: 'normal', groupId: 'g1' }, { id: 'm2', name: 'B', weight: 1, status: 'normal', groupId: 'g1' }, { id: 'm3', name: 'C', weight: 1, status: 'normal', groupId: 'g1' }];
    const splits = FinanceEngine.distributeSplit(100, members, 'percent', { m1: 33.33, m2: 33.33, m3: 33.34 });
    const total = splits.reduce((sum, s) => sum + s.amount, 0);
    assert.strictEqual(Math.round(total * 100) / 100, 100);
    console.log('✓ Test 3: Percent split 100% exact allocation passed.');
}

// Test 4: Proportional Split with weights
{
    const members = [{ id: 'm1', name: 'A', weight: 1, status: 'normal', groupId: 'g1' }, { id: 'm2', name: 'B', weight: 2, status: 'normal', groupId: 'g1' }, { id: 'm3', name: 'C', weight: 3, status: 'normal', groupId: 'g1' }];
    const splits = FinanceEngine.distributeSplit(100, members, 'proportional');
    const total = splits.reduce((sum, s) => sum + s.amount, 0);
    assert.strictEqual(Math.round(total * 100) / 100, 100);
    assert.strictEqual(splits[0].amount, 16.67);
    assert.strictEqual(splits[1].amount, 33.33);
    assert.strictEqual(splits[2].amount, 50.00);
    console.log('✓ Test 4: Proportional weighted split passed.');
}

// Test 5: Proportional Split with all weights 0 (graceful fallback)
{
    const members = [{ id: 'm1', name: 'A', weight: 0, status: 'normal', groupId: 'g1' }, { id: 'm2', name: 'B', weight: 0, status: 'normal', groupId: 'g1' }];
    const splits = FinanceEngine.distributeSplit(50, members, 'proportional');
    const total = splits.reduce((sum, s) => sum + s.amount, 0);
    assert.strictEqual(total, 50);
    assert.strictEqual(splits[0].amount, 25);
    assert.strictEqual(splits[1].amount, 25);
    console.log('✓ Test 5: Proportional split zero-weights fallback passed.');
}

// Test 6: Zero-Sum Ledger Invariant on group calculation
{
    const group = {
        id: 'g1',
        name: 'Apartment',
        description: 'Rent and utilities',
        currency: 'USD',
        budget: 1000,
        createdBy: 'u1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
            { id: 'm1', name: 'Alice', weight: 1, status: 'normal', groupId: 'g1' },
            { id: 'm2', name: 'Bob', weight: 1, status: 'normal', groupId: 'g1' },
            { id: 'm3', name: 'Charlie', weight: 1, status: 'normal', groupId: 'g1' }
        ],
        expenses: [
            {
                id: 'e1',
                groupId: 'g1',
                description: 'Groceries',
                amount: 90,
                date: '2026-10-10',
                paymentMethod: 'card',
                category: 'food',
                payers: [{ memberId: 'm1', amount: 90 }],
                splits: [{ memberId: 'm1', amount: 30 }, { memberId: 'm2', amount: 30 }, { memberId: 'm3', amount: 30 }],
                splitType: 'equal',
                settled: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                createdBy: 'm1'
            },
            {
                id: 'e2',
                groupId: 'g1',
                description: 'Electricity',
                amount: 60,
                date: '2026-10-10',
                paymentMethod: 'card',
                category: 'utilities',
                payers: [{ memberId: 'm2', amount: 60 }],
                splits: [{ memberId: 'm1', amount: 20 }, { memberId: 'm2', amount: 20 }, { memberId: 'm3', amount: 20 }],
                splitType: 'equal',
                settled: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                createdBy: 'm2'
            }
        ]
    };

    const balances = FinanceEngine.calculateBalances(group);
    // Alice: +90 paid - 30 owed - 20 owed = +40
    // Bob: +60 paid - 30 owed - 20 owed = +10
    // Charlie: 0 paid - 30 owed - 20 owed = -50
    assert.strictEqual(balances['m1'], 40);
    assert.strictEqual(balances['m2'], 10);
    assert.strictEqual(balances['m3'], -50);

    const netSum = Object.values(balances).reduce((sum, b) => sum + b, 0);
    assert.strictEqual(Math.round(netSum * 100) / 100, 0, 'Zero-sum ledger invariant must strictly hold');
    console.log('✓ Test 6: Zero-sum balance calculation passed.');

    // Test 7: Settlements computation
    const settlements = FinanceEngine.computeSettlements(balances);
    assert.strictEqual(settlements.length, 2);
    // Charlie owes Alice 40, Charlie owes Bob 10
    assert.strictEqual(settlements[0].from, 'm3');
    assert.strictEqual(settlements[0].to, 'm1');
    assert.strictEqual(settlements[0].amount, 40);

    assert.strictEqual(settlements[1].from, 'm3');
    assert.strictEqual(settlements[1].to, 'm2');
    assert.strictEqual(settlements[1].amount, 10);
    console.log('✓ Test 7: Debt settlements minimization passed.');

    // Test 8: With direct settlement applied, all debts clear to zero
    const settledBalances = FinanceEngine.calculateBalances(group, settlements);
    assert.strictEqual(settledBalances['m1'], 0);
    assert.strictEqual(settledBalances['m2'], 0);
    assert.strictEqual(settledBalances['m3'], 0);
    console.log('✓ Test 8: Settlement application completely clears balances.');
}

console.log('--- ALL 8 TESTS PASSED SUCCESSFULLY! ---');
