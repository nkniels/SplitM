openExpenseModal() {
        const group = getActiveGroup();
        if (group.members.length === 0) {
            showToast(dict[state.settings.language].need_members, "error");
            return;
        }
        document.getElementById('modal-title').textContent = dict[state.settings.language].new_expense;
        document.getElementById('expense-id').value = '';
        document.getElementById('expense-desc').value = '';
        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0]; // Default today
        document.getElementById('expense-comments').value = '';
        document.getElementById('expense-receipt-base64').value = '';
        document.getElementById('receipt-preview').style.display = 'none';
        document.getElementById('expense-receipt').value = '';
        
        const payersContainer = document.getElementById('payers-container');
        payersContainer.innerHTML = group.members.map(m => `
            <div class="custom-split-item">
                <span>${m.name}</span>
                <input type="number" class="payer-input" data-id="${m.id}" min="0" step="0.01" value="0" onchange="app.checkDuplicate()">
            </div>
        `).join('');

        const splitContainer = document.getElementById('custom-split-container');
        splitContainer.innerHTML = group.members.map(m => `
            <div class="custom-split-item">
                <label><input type="checkbox" class="split-checkbox" data-id="${m.id}" checked onchange="app.updateSplit()"> ${m.name}</label>
                <input type="number" class="split-amount-input" data-id="${m.id}" min="0" step="0.01" disabled onchange="app.validateSplit()">
            </div>
        `).join('');

        document.querySelector('input[name="split-type"][value="equal"]').checked = true;
        this.updateSplit();

        document.getElementById('expense-modal').classList.add('active');
        document.getElementById('expense-desc').focus(); // Feature 6
    },

    checkDuplicate() {
        // Feature 39 & 20: DUPLICATE DETECTION & SMART SUGGESTIONS
        const group = getActiveGroup();
        const desc = document.getElementById('expense-desc').value.trim().toLowerCase();
        const amt = parseFloat(document.getElementById('expense-amount').value) || 0;
        const date = document.getElementById('expense-date').value;
        const warn = document.getElementById('duplicate-warning');
        
        if (desc.length > 2) {
            const dup = group.expenses.find(e => e.description.toLowerCase() === desc && e.amount === amt && e.date === date);
            if (dup && !document.getElementById('expense-id').value) {
                warn.style.display = 'block';
                return;
            }
            
            // Suggestion
            if (!amt) {
                const past = group.expenses.find(e => e.description.toLowerCase() === desc);
                if (past) {
                    warn.style.display = 'block';
                    warn.style.color = 'var(--primary)';
                    warn.innerHTML = `Suggestion: Montant précédent ${formatMoney(past.amount)} <a href="#" onclick="document.getElementById('expense-amount').value=${past.amount}; app.checkDuplicate(); return false;">Appliquer</a>`;
                    return;
                }
            }
        }
        warn.style.display = 'none';
    },

    updateSplit() {
        const group = getActiveGroup();
        const type = document.querySelector('input[name="split-type"]:checked').value;
        const total = parseFloat(document.getElementById('expense-amount').value) || 0;
        const container = document.getElementById('custom-split-container');
        const checkboxes = document.querySelectorAll('.split-checkbox');
        const inputs = document.querySelectorAll('.split-amount-input');
        
        const activeMembers = Array.from(checkboxes).filter(cb => cb.checked).map(cb => {
            return group.members.find(m => m.id === cb.dataset.id);
        });

        if (type === 'custom' || type === 'percent') {
            container.style.display = 'block';
            inputs.forEach(input => {
                const cb = document.querySelector(`.split-checkbox[data-id="${input.dataset.id}"]`);
                input.disabled = !cb.checked;
                if (!cb.checked) input.value = 0;
            });
        } else {
            container.style.display = 'block'; // Show to view numbers
            inputs.forEach(input => input.disabled = true);

            if (activeMembers.length > 0) {
                if (type === 'equal') {
                    const splitAmt = total / activeMembers.length;
                    activeMembers.forEach(m => {
                        document.querySelector(`.split-amount-input[data-id="${m.id}"]`).value = splitAmt.toFixed(2);
                    });
                } else if (type === 'proportional') {
                    const totalWeight = activeMembers.reduce((sum, m) => sum + m.weight, 0);
                    activeMembers.forEach(m => {
                        const amt = (total * m.weight) / totalWeight;
                        document.querySelector(`.split-amount-input[data-id="${m.id}"]`).value = amt.toFixed(2);
                    });
                }
                Array.from(checkboxes).filter(cb => !cb.checked).forEach(cb => {
                    document.querySelector(`.split-amount-input[data-id="${cb.dataset.id}"]`).value = 0;
                });
            }
        }
        this.validateSplit();
    },

    validateSplit() {
        const total = parseFloat(document.getElementById('expense-amount').value) || 0;
        const type = document.querySelector('input[name="split-type"]:checked').value;
        const inputs = document.querySelectorAll('.split-amount-input');
        
        let sum = 0;
        inputs.forEach(input => sum += (parseFloat(input.value) || 0));

        const errorEl = document.getElementById('split-error');
        if (type === 'custom' && Math.abs(sum - total) > 0.05) {
            errorEl.style.display = 'block';
            return false;
        } else if (type === 'percent' && Math.abs(sum - 100) > 0.05) {
            errorEl.textContent = "Le total des pourcentages doit être 100%.";
            errorEl.style.display = 'block';
            return false;
        }
        
        errorEl.style.display = 'none';
        return true;
    },

    saveExpense() {
        // Feature 38: DATA VALIDATION & Feature 7: SHAKE ANIMATION
        const group = getActiveGroup();
        const idInput = document.getElementById('expense-id').value;
        const descInput = document.getElementById('expense-desc');
        const amountInput = document.getElementById('expense-amount');
        const date = document.getElementById('expense-date').value;
        const method = document.getElementById('expense-payment-method').value;
        const category = document.getElementById('expense-category').value;
        const comments = document.getElementById('expense-comments').value;
        const receipt = document.getElementById('expense-receipt-base64').value;
        
        const desc = descInput.value.trim();
        const totalAmount = parseFloat(amountInput.value);

        if (!desc) { descInput.classList.add('shake'); setTimeout(()=>descInput.classList.remove('shake'), 500); return; }
        if (!totalAmount || totalAmount <= 0) { amountInput.classList.add('shake'); setTimeout(()=>amountInput.classList.remove('shake'), 500); return; }

        const payerInputs = document.querySelectorAll('.payer-input');
        const payers = [];
        let payersSum = 0;
        payerInputs.forEach(input => {
            const amt = parseFloat(input.value) || 0;
            if (amt > 0) {
                payers.push({ memberId: input.dataset.id, amount: amt });
                payersSum += amt;
            }
        });

        const payersError = document.getElementById('payers-error');
        if (Math.abs(payersSum - totalAmount) > 0.05) {
            payersError.style.display = 'block';
            payersError.classList.add('shake');
            setTimeout(()=>payersError.classList.remove('shake'), 500);
            return;
        }
        payersError.style.display = 'none';

        if (!this.validateSplit()) {
            const se = document.getElementById('split-error');
            se.classList.add('shake');
            setTimeout(()=>se.classList.remove('shake'), 500);
            return;
        }

        const type = document.querySelector('input[name="split-type"]:checked').value;
        const splits = [];
        const splitInputs = document.querySelectorAll('.split-amount-input');
        
        splitInputs.forEach(input => {
            let amt = parseFloat(input.value) || 0;
            if (amt > 0) {
                if (type === 'percent') amt = (amt / 100) * totalAmount;
                splits.push({ memberId: input.dataset.id, amount: amt });
            }
        });

        const expense = {
            id: idInput || generateId(),
            description: desc,
            amount: totalAmount,
            date: date,
            category: category,
            method: method,
            comments: comments,
            receiptBase64: receipt,
            splitType: type,
            payers: payers,
            splits: splits,
            timestamp: Date.now()
        };

        if (idInput) {
            const index = group.expenses.findIndex(e => e.id === idInput);
            if (index !== -1) group.expenses[index] = expense;
        } else {
            group.expenses.push(expense);
        }

        saveState();
        this.renderApp();
        this.closeExpenseModal();
        vibrate(50);
        showToast(dict[state.settings.language].expense_saved, "success");
    },

    editExpense(id) {
        const group = getActiveGroup();
        const expense = group.expenses.find(e => e.id === id);
        if (!expense) return;

        this.openExpenseModal();
        document.getElementById('modal-title').textContent = "Modifier la dépense";
        document.getElementById('expense-id').value = expense.id;
        document.getElementById('expense-desc').value = expense.description;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-date').value = expense.date;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-payment-method').value = expense.method || 'cash';
        document.getElementById('expense-comments').value = expense.comments || '';
        document.getElementById('expense-receipt-base64').value = expense.receiptBase64 || '';
        if(expense.receiptBase64) {
            const preview = document.getElementById('receipt-preview');
            preview.src = expense.receiptBase64;
            preview.style.display = 'block';
        }
        
        document.querySelectorAll('.payer-input').forEach(input => input.value = 0);
        expense.payers.forEach(p => {
            const input = document.querySelector(`.payer-input[data-id="${p.memberId}"]`);
            if (input) input.value = p.amount;
        });

        document.querySelector(`input[name="split-type"][value="${expense.splitType}"]`).checked = true;
        
        document.querySelectorAll('.split-checkbox').forEach(cb => cb.checked = false);
        expense.splits.forEach(s => {
            const cb = document.querySelector(`.split-checkbox[data-id="${s.memberId}"]`);
            if (cb) cb.checked = true;
        });
        
        this.updateSplit();

        if (expense.splitType === 'custom' || expense.splitType === 'percent') {
            expense.splits.forEach(s => {
                const input = document.querySelector(`.split-amount-input[data-id="${s.memberId}"]`);
                if (input) {
                    input.value = expense.splitType === 'percent' ? ((s.amount / expense.amount) * 100).toFixed(2) : s.amount;
                }
            });
        }
    },

    deleteExpense(id) {
        const group = getActiveGroup();
        const index = group.expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            // Feature 3: UNDO DELETE
            deletedExpenseBuffer = group.expenses[index];
            group.expenses.splice(index, 1);
            saveState();
            this.renderApp();
            vibrate([100, 50, 100]);
            showToast(
                dict[state.settings.language].expense_deleted, 
                "info", 
                `<button class="btn btn-secondary" onclick="app.undoDelete()" style="padding:5px 10px;">${dict[state.settings.language].undo}</button>`
            );
        }
    },

    undoDelete() {
        if(deletedExpenseBuffer) {
            getActiveGroup().expenses.push(deletedExpenseBuffer);
            deletedExpenseBuffer = null;
            saveState();
            this.renderApp();
            showToast(dict[state.settings.language].expense_restored, "success");
        }
    },

    // --- ALGORITHMS & SETTLEMENTS ---
    calculateSettlements() {
        const group = getActiveGroup();
        const balances = {};
        
        group.members.forEach(m => balances[m.id] = 0);
        
        // Calculate net balances — ALL expenses count, including reimbursements
        group.expenses.forEach(expense => {
            expense.payers.forEach(p => { if (balances[p.memberId] !== undefined) balances[p.memberId] += p.amount; });
            expense.splits.forEach(s => { if (balances[s.memberId] !== undefined) balances[s.memberId] -= s.amount; });
        });

        const debtors = [];
        const creditors = [];

        for (const [id, balance] of Object.entries(balances)) {
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
            const amount = Math.min(debtor.amount, creditor.amount);

            settlements.push({
                from: debtor.id,
                to: creditor.id,
                amount: amount
            });

            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount < 0.01) d++;
            if (creditor.amount < 0.01) c++;
        }

        return settlements;
    },

    /**
     * Computes the optimized transaction matrix to settle all debts and renders the settlement checklist.
     */
    renderSettlements() {
        const group = getActiveGroup();
        const settlements = this.calculateSettlements();
        const list = this.dom['settlements-list'] || document.getElementById('settlements-list');
        if (!list) return;
        const d = dict[state.settings.language];

        // Feature 21: CONFETTI CELEBRATION
        if (settlements.length === 0 && group.expenses.length > 0) {
            if(!window.confettiFired) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#004aad', '#38bdf8'] });
                window.confettiFired = true;
            }
            list.innerHTML = '';
            const celebrationHTML = `<div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h3 style="color:var(--success)">Tout est réglé ! 🎉</h3>
            </div>`;
            list.appendChild(createFragment(celebrationHTML));
            return;
        }
        window.confettiFired = false;

        if (settlements.length === 0) {
            list.innerHTML = '';
            const emptyHTML = `<div class="empty-state">
                <p>Aucun remboursement nécessaire.</p>
            </div>`;
            list.appendChild(createFragment(emptyHTML));
            return;
        }

        const settlementsHTML = settlements.map((s, index) => {
            const fromName = group.members.find(m => m.id === s.from)?.name || 'Inconnu';
            const toName = group.members.find(m => m.id === s.to)?.name || 'Inconnu';
            return `
            <li class="settlement-item" id="settle-${index}">
                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                    <div style="flex:1;">
                        <strong>${sanitizeHTML(fromName)}</strong> <span style="color:var(--text-muted)">${d.owes}</span> <strong>${sanitizeHTML(toName)}</strong>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <strong style="color:var(--success); font-size:1.1rem;">${formatMoney(s.amount)}</strong>
                    <button class="btn btn-primary" style="padding:8px; border-radius:50%;" onclick="app.markSettled('${s.from}', '${s.to}', ${s.amount}, ${index})" title="Mark Settled"><i class="fa-solid fa-check"></i></button>
                </div>
            </li>
        `}).join('');

        list.innerHTML = '';
        list.appendChild(createFragment(settlementsHTML));
    },

    markSettled(fromId, toId, amount, index) {
        // Feature 1: MARK AS SETTLED
        const el = document.getElementById(`settle-${index}`);
        el.classList.add('settled');
        vibrate([200]);
        
        setTimeout(() => {
            const group = getActiveGroup();
            group.expenses.push({
                id: generateId(),
                description: `Remboursement`,
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                category: 'Other',
                method: 'transfer',
                splitType: 'custom',
                payers: [{ memberId: fromId, amount: amount }],
                splits: [{ memberId: toId, amount: amount }],
                settled: true, // Special flag to ignore in future calculations but keep in history
                timestamp: Date.now()
            });
            saveState();
            this.renderApp();
            showToast("Remboursement validé", "success");
        }, 500);
    },

    shareSettlements() {
        // Feature 10: WEB SHARE API EXPORT
        const group = getActiveGroup();
        const settlements = this.calculateSettlements();
        let text = `💰 ${group.name} - Résumé des dettes\nDate: ${new Date().toLocaleDateString()}\n\n`;
        
        if (settlements.length === 0) {
            text += "Tout le monde est à jour ! 🎉\n";
        } else {
            settlements.forEach(s => {
                const from = group.members.find(m => m.id === s.from)?.name;
                const to = group.members.find(m => m.id === s.to)?.name;
                text += `➡️ ${from} doit ${formatMoney(s.amount)} à ${to}\n`;
            });
        }

        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
            window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
        } else if (navigator.share) {
            navigator.share({ title: 'SplitM Résumé', text: text })
                .catch(console.error);
        } else {
            navigator.clipboard.writeText(text);
            showToast("Copié dans le presse-papier ✓", "success");
        }
    },

    // --- CHARTS & ANIMATION ---
    