    calculateSettlements() {
        const group = getActiveGroup();
        const balances = FinanceEngine.calculateBalances(group);
        return FinanceEngine.computeSettlements(balances);
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

        // Feature 21: CONFETTI CELEBRATION (Kept to retain Gamification)
        if (settlements.length === 0 && group.expenses.length > 0) {
            if(!window.confettiFired) {
                if(typeof confetti !== 'undefined') {
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#004aad', '#38bdf8'] });
                }
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
                        <strong>${sanitizeHTML(fromName)}</strong> <span style="color:var(--text-muted)">${d.owes || 'owes'}</span> <strong>${sanitizeHTML(toName)}</strong>
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
