    saveExpense() {
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

        // Collect Payers
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
        // Tolerance for payers sum to allow simple edits
        if (Math.abs(payersSum - totalAmount) > 0.05) {
            payersError.style.display = 'block';
            payersError.classList.add('shake');
            setTimeout(()=>payersError.classList.remove('shake'), 500);
            return;
        }
        payersError.style.display = 'none';

        // Collect Splits using FinanceEngine
        const type = document.querySelector('input[name="split-type"]:checked').value;
        const splitInputs = document.querySelectorAll('.split-amount-input');
        const checkboxes = document.querySelectorAll('.split-checkbox');
        
        const customValues = {};
        let activeMembers = [];

        if (type === 'custom' || type === 'percent') {
            splitInputs.forEach(input => {
                if (!input.disabled) customValues[input.dataset.id] = parseFloat(input.value) || 0;
            });
        }
        
        checkboxes.forEach(cb => {
            if (cb.checked) {
                const member = group.members.find(m => m.id === cb.dataset.id);
                if (member) activeMembers.push(member);
            }
        });

        // Use FinanceEngine to accurately distribute the splits, handling rounding errors
        const splits = FinanceEngine.distributeSplit(totalAmount, activeMembers, type, customValues);

        // Validation for custom/percent before saving
        const splitError = document.getElementById('split-error');
        if (type === 'custom' || type === 'percent') {
            const calculatedSum = splits.reduce((sum, s) => sum + s.amount, 0);
            if (Math.abs(calculatedSum - totalAmount) > 0.05) {
                splitError.textContent = type === 'percent' ? "Le total des pourcentages doit être 100%." : "La somme des répartitions ne correspond pas au total.";
                splitError.style.display = 'block';
                splitError.classList.add('shake');
                setTimeout(()=>splitError.classList.remove('shake'), 500);
                return;
            }
        }
        splitError.style.display = 'none';

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
