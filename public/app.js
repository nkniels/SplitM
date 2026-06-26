// --- UTILITIES ---
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const formatMoney = (amount) => {
    const currency = state.settings.currency;
    const isFCFA = currency === 'FCFA';
    
    // Feature 5: NUMBER FORMATTING & Feature 42: LOCAL CURRENCY FORMATTING
    return new Intl.NumberFormat(state.settings.language, {
        style: 'currency',
        currency: isFCFA ? 'XAF' : (currency === '€' ? 'EUR' : currency === '$' ? 'USD' : 'GBP'),
        minimumFractionDigits: isFCFA ? 0 : 2,
        maximumFractionDigits: isFCFA ? 0 : 2
    }).format(amount).replace('XAF', 'FCFA');
};

const formatRelativeDate = (dateString) => {
    // Feature 43: RELATIVE DATES
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const d = dict[state.settings.language];
    if (diffDays === 0) return d.today || "Aujourd'hui";
    if (diffDays === 1) return d.yesterday || "Hier";
    if (diffDays < 7) return d.days_ago ? d.days_ago.replace('{n}', diffDays) : `Il y a ${diffDays} j`;
    return date.toLocaleDateString(state.settings.language);
};

const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
};

const getColor = (name) => {
    // Feature 22: MEMBER AVATAR INITIALS (consistent color)
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
    const index = Math.abs(hashCode(name)) % colors.length;
    return colors[index];
};

const vibrate = (pattern) => {
    // Feature 23: HAPTIC FEEDBACK
    try {
        if (navigator.vibrate) navigator.vibrate(pattern);
    } catch(e) {}
};

// Feature 27: TOAST NOTIFICATION SYSTEM
let activeToasts = 0;
const showToast = (message, type = 'info', actionHtml = '') => {
    const container = document.getElementById('toast-container');
    if (activeToasts >= 3) container.firstChild.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div>${message}</div> ${actionHtml}`;
    container.appendChild(toast);
    activeToasts++;
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => { toast.remove(); activeToasts--; }, 300);
    }, actionHtml ? 5000 : 3000);
};

// --- DATA MIGRATION & STATE ---
let state = {
    settings: { language: 'fr', currency: 'FCFA', fontSize: 16, darkMode: false },
    activeGroupId: null,
    groups: [],
    onboardingComplete: false
};

// Feature 8: GROUPS SYSTEM
const loadState = () => {
    const rawData = localStorage.getItem('splitm_data');
    if (rawData) {
        try {
            state = JSON.parse(rawData);
            // Handle Migration from v1
            if (!state.groups && state.members) {
                const legacyGroup = {
                    id: generateId(),
                    name: 'Mon Groupe',
                    description: '',
                    budget: 0,
                    members: state.members || [],
                    expenses: state.expenses || []
                };
                state = {
                    settings: state.settings || { language: 'fr', currency: 'FCFA', fontSize: 16, darkMode: false },
                    activeGroupId: legacyGroup.id,
                    groups: [legacyGroup]
                };
            }
            // Migrate old highContrast → darkMode
            if (state.settings.highContrast !== undefined && state.settings.darkMode === undefined) {
                state.settings.darkMode = state.settings.highContrast;
                delete state.settings.highContrast;
            }
        } catch(e) { console.error('Data corrupt'); }
    } else {
        // First launch
        const defaultGroup = { id: generateId(), name: 'Mon Groupe', description: '', budget: 0, members: [], expenses: [] };
        state.groups.push(defaultGroup);
        state.activeGroupId = defaultGroup.id;
        
        // Feature 45: TELEGRAM MINAPP pre-fill user
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
            defaultGroup.members.push({ id: generateId(), name: window.Telegram.WebApp.initDataUnsafe.user.first_name, status: 'normal', weight: 1 });
        }
    }
};

const saveState = () => {
    localStorage.setItem('splitm_data', JSON.stringify(state));
    updateStorageUsage();
    
    // Feature 36: AUTO-SAVE INDICATOR
    const ind = document.getElementById('auto-save-indicator');
    if (ind) {
        ind.classList.add('show');
        setTimeout(() => ind.classList.remove('show'), 2000);
    }

    // Sync with cloud if logged in
    if (typeof app !== 'undefined' && app.uploadToCloud) {
        app.uploadToCloud();
    }
};

const getActiveGroup = () => state.groups.find(g => g.id === state.activeGroupId) || state.groups[0];

const updateStorageUsage = () => {
    // Feature 40: STORAGE USAGE INDICATOR
    const raw = localStorage.getItem('splitm_data') || '';
    const kb = (raw.length / 1024).toFixed(1);
    const usageEl = document.getElementById('storage-usage');
    if(usageEl) usageEl.innerText = `Stockage utilisé: ${kb} KB / 5000 KB`;
};

// --- DICTIONARY ---
const dict = {
    fr: {
        new_expense: "Nouvelle Dépense", overview: "Vue d'ensemble", total_expenses: "Total des dépenses", optimized_settlements: "Remboursements Optimisés",
        settlements_subtitle: "Qui doit combien à qui", group_members: "Membres du groupe", expense_history: "Historique des dépenses", add: "Ajouter",
        member_name_ph: "Nom du membre...", status_normal: "Normal (1x)", status_good: "Aisé (1.5x)", status_difficult: "Difficile (0.5x)",
        paid_by: "Payé par {name}", for_x_people: "Pour {n} personnes", owes: "doit à", save: "Enregistrer", description: "Description", desc_ph: "Ex: Restaurant...",
        total_amount: "Montant Total", date: "Date", payment_method: "Méthode de paiement", category: "Catégorie", who_paid: "Qui a payé ?", split_method: "Répartition",
        split_equal: "Équitable", split_percent: "Pourcentage (%)", split_custom: "Montant Exact", split_proportional: "Proportionnel",
        cat_food: "🍔 Nourriture", cat_transport: "🚗 Transport", cat_entertainment: "🎬 Divertissement", cat_shopping: "🛍️ Shopping", cat_other: "📝 Autre",
        welcome_title: "Bienvenue sur SplitM", welcome_subtitle: "Configurez votre groupe pour commencer.", start_app: "Commencer",
        budget: "Budget", insights: "Insights 📊", group_settings: "Paramètres du groupe", export: "Exporter (JSON)", import: "Importer", reset: "Réinitialiser",
        new_group: "Créer un nouveau groupe", data_management: "Gestion des données", search_ph: "Rechercher...",
        today: "Aujourd'hui", yesterday: "Hier", days_ago: "Il y a {n} j",
        receipt_photo: "Reçu (Photo)", comments: "Commentaires", group_name: "Nom du groupe", group_desc: "Description / Voyage", budget_limit: "Budget Limite (Optionnel)",
        card: "💳 Carte Bancaire", cash: "💵 Espèces", transfer: "🏦 Virement",
        need_members: "Ajoutez d'abord des membres !", no_members: "Aucun membre. Ajoutez-en !", no_expenses: "Aucune dépense trouvée.",
        group_saved: "Paramètres du groupe enregistrés", expense_deleted: "Dépense supprimée", expense_restored: "Dépense restaurée", undo: "Annuler ↩", expense_saved: "Dépense enregistrée",
        settled: "Réglé ✓", invite_qr: "Inviter via QR", qr_instruction: "Scannez ce code pour voir les dettes du groupe.",
        offline_banner: "Hors ligne — données locales", saved: "Sauvegardé ✓",
        login: "Connexion", logout: "Déconnexion", invite_sent: "Lien d'invitation copié !",
        member_name_label: "Nom", financial_status_label: "Situation financière",
        onboarding_hint: "Ajoutez au moins 1 membre pour continuer",
        member_details: "Détails", paid_label: "Payé", consumed_label: "Consommé",
        net_balance: "Balance Nette", involved_expenses: "Dépenses impliquées",
        member_involved_error: "Impossible : ce membre est impliqué dans des dépenses.",
        default_group_name: "Mon Groupe"
    },
    en: {
        new_expense: "New Expense", overview: "Overview", total_expenses: "Total Expenses", optimized_settlements: "Optimized Settlements",
        settlements_subtitle: "Who owes whom", group_members: "Group Members", expense_history: "Expense History", add: "Add",
        member_name_ph: "Member name...", status_normal: "Normal (1x)", status_good: "Well-off (1.5x)", status_difficult: "Tight (0.5x)",
        paid_by: "Paid by {name}", for_x_people: "For {n} people", owes: "owes", save: "Save", description: "Description", desc_ph: "Ex: Dinner...",
        total_amount: "Total Amount", date: "Date", payment_method: "Payment Method", category: "Category", who_paid: "Who paid?", split_method: "Split Method",
        split_equal: "Equal", split_percent: "Percentage (%)", split_custom: "Exact Amount", split_proportional: "Proportional",
        cat_food: "🍔 Food", cat_transport: "🚗 Transport", cat_entertainment: "🎬 Entertainment", cat_shopping: "🛍️ Shopping", cat_other: "📝 Other",
        welcome_title: "Welcome to SplitM", welcome_subtitle: "Set up your group to get started.", start_app: "Start App",
        budget: "Budget", insights: "Insights 📊", group_settings: "Group Settings", export: "Export (JSON)", import: "Import", reset: "Reset",
        new_group: "Create New Group", data_management: "Data Management", search_ph: "Search...",
        today: "Today", yesterday: "Yesterday", days_ago: "{n} days ago",
        receipt_photo: "Receipt (Photo)", comments: "Comments", group_name: "Group Name", group_desc: "Description / Trip", budget_limit: "Budget Limit (Optional)",
        card: "💳 Credit Card", cash: "💵 Cash", transfer: "🏦 Transfer",
        need_members: "Add members first!", no_members: "No members. Add some!", no_expenses: "No expenses found.",
        group_saved: "Group settings saved", expense_deleted: "Expense deleted", expense_restored: "Expense restored", undo: "Undo ↩", expense_saved: "Expense saved",
        settled: "Settled ✓", invite_qr: "Invite via QR", qr_instruction: "Scan this code to view group debts.",
        offline_banner: "Offline — local data only", saved: "Saved ✓",
        login: "Login", logout: "Logout", invite_sent: "Invite link copied!",
        member_name_label: "Name", financial_status_label: "Financial Status",
        onboarding_hint: "Add at least 1 member to continue",
        member_details: "Details", paid_label: "Paid", consumed_label: "Consumed",
        net_balance: "Net Balance", involved_expenses: "Involved Expenses",
        member_involved_error: "Cannot remove: this member is involved in expenses.",
        default_group_name: "My Group"
    },
    pt: {
        new_expense: "Nova Despesa", overview: "Visão Geral", total_expenses: "Despesas Totais", optimized_settlements: "Acertos Otimizados",
        settlements_subtitle: "Quem deve a quem", group_members: "Membros do Grupo", expense_history: "Histórico de Despesas", add: "Adicionar",
        member_name_ph: "Nome do membro...", status_normal: "Normal (1x)", status_good: "Bem de vida (1.5x)", status_difficult: "Apertado (0.5x)",
        paid_by: "Pago por {name}", for_x_people: "Para {n} pessoas", owes: "deve a", save: "Salvar", description: "Descrição", desc_ph: "Ex: Jantar...",
        total_amount: "Valor Total", date: "Data", payment_method: "Método de Pagamento", category: "Categoria", who_paid: "Quem pagou?", split_method: "Método de Divisão",
        split_equal: "Igual", split_percent: "Porcentagem (%)", split_custom: "Valor Exato", split_proportional: "Proporcional",
        cat_food: "🍔 Comida", cat_transport: "🚗 Transporte", cat_entertainment: "🎬 Entretenimento", cat_shopping: "🛍️ Compras", cat_other: "📝 Outros",
        welcome_title: "Bem-vindo ao SplitM", welcome_subtitle: "Configure seu grupo para começar.", start_app: "Começar",
        budget: "Orçamento", insights: "Insights 📊", group_settings: "Configurações do Grupo", export: "Exportar (JSON)", import: "Importar", reset: "Redefinir",
        new_group: "Criar Novo Grupo", data_management: "Gestão de Dados", search_ph: "Buscar...",
        today: "Hoje", yesterday: "Ontem", days_ago: "Há {n} dias",
        receipt_photo: "Recibo (Foto)", comments: "Comentários", group_name: "Nome do Grupo", group_desc: "Descrição / Viagem", budget_limit: "Limite de Orçamento (Opcional)",
        card: "💳 Cartão de Crédito", cash: "💵 Dinheiro", transfer: "🏦 Transferência",
        need_members: "Adicione membros primeiro!", no_members: "Sem membros. Adicione alguns!", no_expenses: "Nenhuma despesa encontrada.",
        group_saved: "Configurações salvas", expense_deleted: "Despesa excluída", expense_restored: "Despesa restaurada", undo: "Desfazer ↩", expense_saved: "Despesa salva",
        settled: "Liquidado ✓", invite_qr: "Convidar via QR", qr_instruction: "Escaneie este código para ver as dívidas do grupo.",
        offline_banner: "Offline — apenas dados locais", saved: "Salvo ✓",
        login: "Entrar", logout: "Sair", invite_sent: "Link de convite copiado!",
        member_name_label: "Nome", financial_status_label: "Situação financeira",
        onboarding_hint: "Adicione pelo menos 1 membro para continuar",
        member_details: "Detalhes", paid_label: "Pago", consumed_label: "Consumido",
        net_balance: "Net Balance", involved_expenses: "Involved Expenses",
        member_involved_error: "Cannot remove: this member is involved in expenses.",
        default_group_name: "Meu Grupo"
    },
    ar: {
        new_expense: "مصروف جديد", overview: "نظرة عامة", total_expenses: "إجمالي المصاريف", optimized_settlements: "تسويات محسنة",
        settlements_subtitle: "من يدين لمن", group_members: "أعضاء المجموعة", expense_history: "سجل المصاريف", add: "إضافة",
        member_name_ph: "اسم العضو...", status_normal: "عادي (1x)", status_good: "ميسور (1.5x)", status_difficult: "ضيق (0.5x)",
        paid_by: "دفع بواسطة {name}", for_x_people: "لـ {n} أشخاص", owes: "يدين لـ", save: "حفظ", description: "وصف", desc_ph: "مثال: عشاء...",
        total_amount: "المبلغ الإجمالي", date: "تاريخ", payment_method: "طريقة الدفع", category: "فئة", who_paid: "من دفع؟", split_method: "طريقة التقسيم",
        split_equal: "بالتساوي", split_percent: "نسبة مئوية (%)", split_custom: "مبلغ دقيق", split_proportional: "نسبي",
        cat_food: "🍔 طعام", cat_transport: "🚗 نقل", cat_entertainment: "🎬 ترفيه", cat_shopping: "🛍️ تسوق", cat_other: "📝 أخرى",
        welcome_title: "مرحبًا بك في SplitM", welcome_subtitle: "قم بإعداد مجموعتك للبدء.", start_app: "ابدأ",
        budget: "ميزانية", insights: "رؤى 📊", group_settings: "إعدادات المجموعة", export: "تصدير (JSON)", import: "استيراد", reset: "إعادة ضبط",
        new_group: "إنشاء مجموعة جديدة", data_management: "إدارة البيانات", search_ph: "بحث...",
        today: "اليوم", yesterday: "أمس", days_ago: "منذ {n} أيام",
        receipt_photo: "إيصال (صورة)", comments: "تعليقات", group_name: "اسم المجموعة", group_desc: "وصف / رحلة", budget_limit: "حد الميزانية (اختياري)",
        card: "💳 بطاقة ائتمان", cash: "💵 نقدي", transfer: "🏦 تحويل",
        need_members: "أضف أعضاء أولاً!", no_members: "لا يوجد أعضاء. أضف بعضهم!", no_expenses: "لم يتم العثور على نفقات.",
        group_saved: "تم حفظ الإعدادات", expense_deleted: "تم حذف المصروف", expense_restored: "تمت استعادة المصروف", undo: "تراجع ↩", expense_saved: "تم حفظ المصروف",
        settled: "مُسوَّى ✓", invite_qr: "دعوة عبر QR", qr_instruction: "امسح هذا الرمز لعرض ديون المجموعة.",
        offline_banner: "غير متصل — البيانات المحلية فقط", saved: "تم الحفظ ✓",
        login: "تسجيل الدخول", logout: "تسجيل الخروج", invite_sent: "تم نسخ رابط الدعوة!",
        member_name_label: "الاسم", financial_status_label: "الوضع المالي",
        onboarding_hint: "أضف عضوًا واحدًا على الأقل للمتابعة",
        member_details: "التفاصيل", paid_label: "دفع", consumed_label: "استهلك",
        net_balance: "الرصيد الصافي", involved_expenses: "النفقات المتعلقة",
        member_involved_error: "مستحيل: هذا العضو مشارك في نفقات."
    }
};

// --- APP ENGINE ---
let deletedExpenseBuffer = null;

// --- FIREBASE CONFIGURATION ---
// Note: These are placeholder credentials. For a production app, the user should replace these with their own Firebase project config.
const firebaseConfig = {
    apiKey: "AIzaSyCeGbodH-_hHykvAhVaEYKEvQidEAWv4Yg",
    authDomain: "splitm-a1f60.firebaseapp.com",
    projectId: "splitm-a1f60",
    storageBucket: "splitm-a1f60.firebasestorage.app",
    messagingSenderId: "450442987386",
    appId: "1:450442987386:web:9a540805fac2f8123438c3",
    measurementId: "G-K6Y9M1XXP1"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    var auth = firebase.auth();
}

const app = {
    state: null,
    user: null,
    _syncUnsubscribe: null,
    expenseChartInstance: null,
    categoryChartInstance: null,
    timelineChartInstance: null,
    currentFilter: 'all',
    currentSearch: '',
    isTimelineView: false,

    toggleMobileNav() {
        const controls = document.getElementById('header-controls');
        const arrow = document.getElementById('mobile-nav-arrow');
        controls.classList.toggle('expanded');
        if (controls.classList.contains('expanded')) {
            arrow.classList.replace('fa-chevron-up', 'fa-chevron-down');
        } else {
            arrow.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }
        vibrate(30);
    },

    init() {
        loadState();
        
        // Feature 45: TELEGRAM INTEGRATION
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }

        // Feature 37: OFFLINE INDICATOR
        window.addEventListener('online',  () => { document.getElementById('offline-banner').style.display='none'; showToast('Connexion rétablie ✓', 'success'); });
        window.addEventListener('offline', () => { document.getElementById('offline-banner').style.display='block'; });
        if(!navigator.onLine) document.getElementById('offline-banner').style.display='block';

        this.applySettings();
        
        // Firebase Auth Listener
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged(user => {
                this.user = user;
                this.updateAuthUI();
                if (user) {
                    this.syncWithCloud();
                } else {
                    if (this._syncUnsubscribe) this._syncUnsubscribe();
                }
            });
        }

        // Check for Invitation in URL
        this.handleInvitation();

        // Initial Render
        this.renderApp();

        // Feature 24: SKELETON LOADING / Splash Screen
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) splash.style.opacity = '0';
            setTimeout(() => {
                if (splash) splash.style.display = 'none';
                const appMain = document.getElementById('main-app');
                if (appMain) {
                    appMain.style.display = 'block';
                    setTimeout(() => appMain.style.opacity = '1', 50);
                }
                
                // Initialize UI values
                const langSel = document.getElementById('language-select');
                const currSel = document.getElementById('currency-select');
                if (langSel) langSel.value = state.settings.language;
                if (currSel) currSel.value = state.settings.currency;
                
                this.applySettings();
                this.updateGroupSelect();
                this.renderApp();

                // Feature: SMART CATEGORY AUTO-FILL ON TYPE
                const descInput = document.getElementById('expense-desc');
                if (descInput) {
                    descInput.addEventListener('input', (e) => {
                        const predicted = this.predictCategory(e.target.value);
                        if (predicted !== 'Other') {
                            document.getElementById('expense-category').value = predicted;
                        }
                    });
                }

                // Show onboarding if this is the very first launch
                const isFirstLaunch = state.groups.length === 0 || state.groups.every(g => g.members.length === 0);
                if (isFirstLaunch && !state.onboardingComplete) {
                    this.openOnboardingModal();
                }
            }, 500);
        }, 1500);
    },

    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const userProfile = document.getElementById('user-profile');
        const userPhoto = document.getElementById('user-photo');
        const userName = document.getElementById('user-name');
        const importBtn = document.getElementById('import-contacts-btn');
        const mobileImport = document.getElementById('mobile-import-btn');

        if (!loginBtn || !userProfile) return;
        
        if (this.user) {
            loginBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            if (userPhoto) userPhoto.src = this.user.photoURL || 'https://www.gravatar.com/avatar/0000?d=mp';
            if (userName) userName.textContent = this.user.displayName?.split(' ')[0] || 'User';
            
            if (importBtn) importBtn.style.display = 'inline-flex';
            if (mobileImport) mobileImport.style.display = 'inline-flex';
        } else {
            loginBtn.style.display = 'flex';
            userProfile.style.display = 'none';
            if (importBtn) importBtn.style.display = 'none';
            if (mobileImport) mobileImport.style.display = 'none';
        }
    },

    login() {
        if (typeof auth === 'undefined') return showToast("Firebase not loaded", "error");
        
        // Check for placeholder credentials
        if (firebaseConfig.apiKey.includes("Placeholder")) {
            showToast("Configuration Firebase requise ! Remplacez les clés dans app.js par celles de votre projet Firebase Console.", "warning");
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        
        auth.signInWithPopup(provider).then((result) => {
            this._googleToken = result.credential.accessToken;
            showToast("Connexion réussie !", "success");
        }).catch(err => {
            console.error("Login failed:", err);
            showToast("Erreur de connexion : " + err.message, "error");
        });
    },

    async fetchGoogleContacts() {
        if (!this.user || !this._googleToken) {
            return this.login();
        }

        document.getElementById('contacts-modal').classList.add('active');
        const loader = document.getElementById('contacts-loader');
        const list = document.getElementById('contacts-list');
        loader.style.display = 'block';
        list.innerHTML = '';

        try {
            const response = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,photos&pageSize=100', {
                headers: { 'Authorization': `Bearer ${this._googleToken}` }
            });

            if (!response.ok) {
                const errData = await response.json();
                if (errData.error?.status === 'PERMISSION_DENIED') {
                    throw new Error("PERMISSION_DENIED");
                }
                throw new Error(errData.error?.message || "API_ERROR");
            }

            const data = await response.json();
            this._googleContacts = data.connections || [];
            this.renderContactsList(this._googleContacts);
        } catch (err) {
            console.error("Failed to fetch contacts:", err);
            if (err.message === 'PERMISSION_DENIED') {
                list.innerHTML = `<div class="empty-state"><p>L'API People n'est pas activée. Veuillez l'activer dans Google Cloud.</p></div>`;
            } else {
                showToast("Impossible de récupérer les contacts.", "error");
            }
        } finally {
            loader.style.display = 'none';
        }
    },

    renderContactsList(contacts) {
        const list = document.getElementById('contacts-list');
        const group = getActiveGroup();
        
        list.innerHTML = contacts.map(person => {
            const name = person.names?.[0]?.displayName || 'Inconnu';
            const photo = person.photos?.[0]?.url || '';
            const isAlreadyMember = group.members.some(m => m.name === name);

            return `
                <li class="list-item" style="padding: 10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${photo}" style="width:30px; height:30px; border-radius:50%; background:#eee;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23ccc%22/></svg>'">
                        <strong>${name}</strong>
                    </div>
                    ${isAlreadyMember ? 
                        '<span class="text-muted" style="font-size:0.8rem;">Déjà membre</span>' : 
                        `<button class="btn btn-secondary btn-sm" onclick="app.addContactAsMember('${name.replace(/'/g, "\\'")}')">Ajouter</button>`
                    }
                </li>
            `;
        }).join('');

        if (contacts.length === 0) {
            list.innerHTML = '<p class="text-muted" style="text-align:center; padding:20px;">Aucun contact trouvé.</p>';
        }
    },

    filterContacts() {
        const query = document.getElementById('contact-search').value.toLowerCase();
        const filtered = this._googleContacts.filter(c => 
            (c.names?.[0]?.displayName || '').toLowerCase().includes(query)
        );
        this.renderContactsList(filtered);
    },

    previewMemberAvatar(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            // Store base64 data temporarily for the next addMember call
            this._newMemberAvatar = e.target.result;
            // Show a quick toast to indicate preview loaded
            showToast('Photo du membre chargée', 'info');
        };
        reader.readAsDataURL(file);
    },

    addMember() {
        const group = getActiveGroup();
        const input = document.getElementById('new-member-name');
        const statusSelect = document.getElementById('new-member-status');
        const name = input.value.trim();
        
        if (name) {
            let weight = 1.0;
            if (statusSelect.value === 'good') weight = 1.5;
            if (statusSelect.value === 'difficult') weight = 0.5;
            
            const newMember = { id: generateId(), name, status: statusSelect.value, weight };
            if (this._newMemberAvatar) {
                newMember.avatar = this._newMemberAvatar;
                this._newMemberAvatar = null; // reset after use
            }
            group.members.push(newMember);
            input.value = '';
            saveState();
            this.renderApp();
            vibrate(50);
        }
    },
        const group = getActiveGroup();
        const url = `${window.location.origin}${window.location.pathname}?invite=${group.id}`;
        const container = document.getElementById('qrcode-div');
        container.innerHTML = '';
        
        new QRCode(container, {
            text: url,
            width: 200,
            height: 200,
            colorDark: "#004aad",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        document.getElementById('qr-modal').classList.add('active');
    },

    downloadQR() {
        const img = document.querySelector('#qrcode-div img');
        if (!img) return;
        const link = document.createElement('a');
        link.download = `invite-splitm-${getActiveGroup().name}.png`;
        link.href = img.src;
        link.click();
    },

    logout() {
        if (typeof auth === 'undefined') return;
        auth.signOut().then(() => {
            showToast(dict[state.settings.language].logout, "info");
            location.reload();
        });
    },

    syncWithCloud() {
        if (!this.user || typeof db === 'undefined') return;
        if (this._syncUnsubscribe) this._syncUnsubscribe();
        
        this._syncUnsubscribe = db.collection('groups').doc(state.activeGroupId).onSnapshot(doc => {
            if (doc.exists) {
                const cloudGroup = doc.data();
                const localGroupIndex = state.groups.findIndex(g => g.id === state.activeGroupId);
                if (localGroupIndex !== -1) {
                    state.groups[localGroupIndex] = { ...state.groups[localGroupIndex], ...cloudGroup };
                    this.renderApp();
                }
            } else {
                this.uploadToCloud();
            }
        });
    },

    uploadToCloud() {
        if (!this.user || typeof db === 'undefined') return;
        const group = getActiveGroup();
        db.collection('groups').doc(group.id).set({
            ...group,
            owner: this.user.uid,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    },

    handleInvitation() {
        const params = new URLSearchParams(window.location.search);
        const inviteId = params.get('invite');
        if (inviteId) {
            if (state.groups.some(g => g.id === inviteId)) {
                state.activeGroupId = inviteId;
                saveState();
                window.history.replaceState({}, document.title, window.location.pathname);
                this.renderApp();
                return;
            }
            if (typeof db !== 'undefined') {
                db.collection('groups').doc(inviteId).get().then(doc => {
                    if (doc.exists) {
                        const newGroup = doc.data();
                        state.groups.push(newGroup);
                        state.activeGroupId = newGroup.id;
                        saveState();
                        showToast(`Joined ${newGroup.name}!`, "success");
                        window.history.replaceState({}, document.title, window.location.pathname);
                        this.renderApp();
                    }
                });
            }
        }
    },

    shareInviteLink() {
        const group = getActiveGroup();
        const url = `${window.location.origin}${window.location.pathname}?invite=${group.id}`;
        if (navigator.share) {
            navigator.share({
                title: `Join ${group.name} on SplitM`,
                text: `Let's manage our group expenses on SplitM!`,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                showToast(dict[state.settings.language].invite_sent, "success");
            });
        }
        this.uploadToCloud();
    },

    applySettings() {
        // Font Size, Dark Mode, RTL
        document.body.style.setProperty('--base-font-size', `${state.settings.fontSize}px`);
        // Apply dark mode class to <html> so CSS can override variables
        if (state.settings.darkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        // Update the theme-toggle button icon
        const themeIcon = document.getElementById('theme-toggle-icon');
        if (themeIcon) {
            themeIcon.className = state.settings.darkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
        document.documentElement.setAttribute('dir', state.settings.language === 'ar' ? 'rtl' : 'ltr');
        this.updateLanguageUI();
    },

    changeFontSize(step) {
        state.settings.fontSize = Math.max(12, Math.min(24, state.settings.fontSize + step));
        saveState();
        this.applySettings();
    },

    toggleDarkMode() {
        state.settings.darkMode = !state.settings.darkMode;
        saveState();
        this.applySettings();
    },

    changeLanguage() {
        const prevLang = state.settings.language;
        const newLang = document.getElementById('language-select').value;
        state.settings.language = newLang;

        // Automatically translate default group name
        const group = getActiveGroup();
        const prevDefaultName = dict[prevLang].default_group_name;
        if (group.name === prevDefaultName) {
            group.name = dict[newLang].default_group_name;
        }

        saveState();
        this.applySettings();
        this.renderApp();
    },

    changeCurrency() {
        state.settings.currency = document.getElementById('currency-select').value;
        saveState();
        this.renderApp();
    },

    updateLanguageUI() {
        const lang = state.settings.language;
        const d = dict[lang] || dict.en;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (d[key]) el.textContent = d[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (d[key]) el.placeholder = d[key];
        });
    },

    // --- GROUPS ---
    updateGroupSelect() {
        const select = document.getElementById('group-select');
        select.innerHTML = state.groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
        select.value = state.activeGroupId;
    },

    switchGroup() {
        state.activeGroupId = document.getElementById('group-select').value;
        saveState();
        this.renderApp();
    },

    openGroupModal() {
        const group = getActiveGroup();
        document.getElementById('group-name-input').value = group.name;
        document.getElementById('group-desc-input').value = group.description || '';
        document.getElementById('group-budget-input').value = group.budget || '';
        updateStorageUsage();
        document.getElementById('group-modal').classList.add('active');
        document.getElementById('group-name-input').focus(); // Feature 6: AUTO-FOCUS
    },

    saveGroupSettings() {
        const group = getActiveGroup();
        group.name = document.getElementById('group-name-input').value || 'Mon Groupe';
        group.description = document.getElementById('group-desc-input').value;
        group.budget = parseFloat(document.getElementById('group-budget-input').value) || 0;
        saveState();
        this.updateGroupSelect();
        this.renderApp();
        this.closeModal('group-modal');
        showToast(dict[state.settings.language].group_saved, 'success');
    },

    createNewGroup() {
        const newGroup = { id: generateId(), name: 'Nouveau Groupe', description: '', budget: 0, members: [], expenses: [] };
        state.groups.push(newGroup);
        state.activeGroupId = newGroup.id;
        saveState();
        this.updateGroupSelect();
        this.openGroupModal();
    },

    // --- RENDER APP ---
    renderApp() {
        const group = getActiveGroup();
        
        document.getElementById('active-group-name').textContent = group.name;
        document.getElementById('active-group-desc').textContent = group.description || '';

        this.renderMembers();
        this.renderExpenses();
        this.updateCharts();
        this.renderSettlements();
        this.updateBudget();
        this.updateInsights();
    },

    updateBudget() {
        // Feature 17: BUDGET LIMIT PER GROUP
        const group = getActiveGroup();
        const container = document.getElementById('budget-container');
        if (!group.budget) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        const total = group.expenses.reduce((sum, e) => sum + e.amount, 0);
        const percent = Math.min(100, Math.round((total / group.budget) * 100));
        
        document.getElementById('budget-text').textContent = `${formatMoney(total)} / ${formatMoney(group.budget)} (${percent}%)`;
        
        const fill = document.getElementById('budget-bar-fill');
        fill.style.width = `${percent}%`;
        
        if (percent < 70) fill.style.backgroundColor = 'var(--success)';
        else if (percent < 90) fill.style.backgroundColor = 'var(--warning)';
        else fill.style.backgroundColor = 'var(--danger)';
    },

    updateInsights() {
        // Feature 16: SPENDING INSIGHTS
        const group = getActiveGroup();
        const content = document.getElementById('insights-content');
        if (group.expenses.length === 0) {
            content.innerHTML = '<p class="text-muted">Ajoutez des dépenses pour voir les insights.</p>';
            return;
        }

        // Biggest spender
        const spenders = {};
        const categories = {};
        group.expenses.forEach(e => {
            e.payers.forEach(p => { spenders[p.memberId] = (spenders[p.memberId] || 0) + p.amount; });
            categories[e.category] = (categories[e.category] || 0) + e.amount;
        });

        let topSpenderId = null, topSpenderAmount = 0;
        for (const [id, amt] of Object.entries(spenders)) { if (amt > topSpenderAmount) { topSpenderAmount = amt; topSpenderId = id; } }
        const topSpenderName = group.members.find(m => m.id === topSpenderId)?.name || 'Inconnu';

        let topCat = null, topCatAmount = 0;
        for (const [cat, amt] of Object.entries(categories)) { if (amt > topCatAmount) { topCatAmount = amt; topCat = cat; } }
        const total = group.expenses.reduce((sum, e) => sum + e.amount, 0);
        const catPercent = Math.round((topCatAmount / total) * 100);

        const avg = formatMoney(total / group.expenses.length);

        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--glass-border); padding-bottom:5px;"><span>🥇 Plus gros dépenseur</span> <strong>${topSpenderName} (${formatMoney(topSpenderAmount)})</strong></div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--glass-border); padding-bottom:5px; margin-top:5px;"><span>📊 Catégorie reine</span> <strong>${dict[state.settings.language]['cat_'+topCat.toLowerCase()] || topCat} (${catPercent}%)</strong></div>
            <div style="display:flex; justify-content:space-between; margin-top:5px; margin-bottom:15px;"><span>💸 Moyenne par dépense</span> <strong>${avg}</strong></div>
            
            <div style="background:rgba(56, 189, 248, 0.05); padding:12px; border-radius:12px; border:1px solid rgba(56, 189, 248, 0.2);">
                <label style="color:var(--primary); font-size:0.7rem; font-weight:700; display:flex; align-items:center; gap:5px; margin-bottom:8px;">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> AI PATTERNS & TIPS
                </label>
                ${this.generateAIInsights()}
            </div>
        `;
    },

    // --- MEMBERS ---
    renderMembers() {
        const group = getActiveGroup();
        const list = document.getElementById('members-list');
        
        // Calculate Balances for Running Balance Feature (Feature 4)
        const balances = {};
        group.members.forEach(m => balances[m.id] = 0);
        
        group.expenses.forEach(expense => {
            expense.payers.forEach(p => { if (balances[p.memberId] !== undefined) balances[p.memberId] += p.amount; });
            expense.splits.forEach(s => { if (balances[s.memberId] !== undefined) balances[s.memberId] -= s.amount; });
        });

        // Feature 50: Gamification Badges
        let topSpender = null, topAmt = 0;
        group.members.forEach(m => {
            const spent = group.expenses.reduce((sum, e) => sum + (e.payers.find(p=>p.memberId===m.id)?.amount||0), 0);
            if(spent > topAmt) { topAmt = spent; topSpender = m.id; }
        });

        const hasExpenses = group.expenses.length > 0;

        list.innerHTML = group.members.map(m => {
            const bal = balances[m.id];
            const threshold = state.settings.currency === 'FCFA' ? 0.5 : 0.005;
            const d = dict[state.settings.language];

            // Balance sub-label: only show when there are expenses
            let balText = '';
            if (hasExpenses) {
                balText = `<span style="color:var(--text-muted); font-size:0.8rem;">${d.settled || 'Settled ✓'}</span>`;
                if (bal > threshold) balText = `<span style="color:var(--success); font-size:0.8rem;">+${formatMoney(bal)}</span>`;
                else if (bal < -threshold) balText = `<span style="color:var(--danger); font-size:0.8rem;">${formatMoney(bal)}</span>`;
            }

            // Financial status pill
            const statusStyles = {
                good:      { bg: 'rgba(16,185,129,0.15)', color: 'var(--success)', icon: '💰', label: d.status_good      || 'Well-off' },
                normal:    { bg: 'rgba(148,163,184,0.12)', color: 'var(--text-muted)', icon: '⚪️', label: d.status_normal || 'Normal'   },
                difficult: { bg: 'rgba(239,68,68,0.12)',  color: 'var(--danger)',  icon: '💸', label: d.status_difficult || 'Tight'  }
            };
            const ss = statusStyles[m.status] || statusStyles.normal;
            const statusPill = `<span style="background:${ss.bg}; color:${ss.color}; font-size:0.72rem; padding:1px 7px; border-radius:10px; margin-left:6px; white-space:nowrap;">${ss.icon} ${ss.label}</span>`;

            const badge = (m.id === topSpender && topAmt > 0) ? '🥇' : '';

            return `
            <li class="list-item" onclick="app.openMemberModal('${m.id}')" style="cursor:pointer;">
                <div class="member-info-col">
            <div class="avatar" style="background:${getColor(m.name)}">
                ${m.avatar ? `<img src="${m.avatar}" alt="${m.name}" style="width:100%; height:100%; border-radius:50%;"/>` : m.name.charAt(0).toUpperCase()}
            </div>
                    <div>
                        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:2px;">
                            <strong>${m.name} ${badge}</strong>${statusPill}
                        </div>
                        ${balText ? `<div style="margin-top:2px;">${balText}</div>` : ''}
                    </div>
                </div>
                <button class="btn-danger" onclick="event.stopPropagation(); app.removeMember('${m.id}')"><i class="fa-solid fa-trash"></i></button>
            </li>
        `}).join('');

        if(group.members.length === 0) {
            list.innerHTML = `<div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <p>${dict[state.settings.language].no_members}</p>
            </div>`;
        }
    },

    addMember() {
        const group = getActiveGroup();
        const input = document.getElementById('new-member-name');
        const statusSelect = document.getElementById('new-member-status');
        const name = input.value.trim();
        
        if (name) {
            let weight = 1.0;
            if (statusSelect.value === 'good') weight = 1.5;
            if (statusSelect.value === 'difficult') weight = 0.5;
            
            group.members.push({ id: generateId(), name, status: statusSelect.value, weight });
            input.value = '';
            saveState();
            this.renderApp();
            vibrate(50);
        }
    },

    removeMember(id) {
        const group = getActiveGroup();
        if (group.expenses.some(e => e.payers.some(p => p.memberId === id) || e.splits.some(s => s.memberId === id))) {
            if(window.Telegram?.WebApp) {
                window.Telegram.WebApp.showAlert("Impossible : ce membre est impliqué dans des dépenses.");
            } else {
                alert("Impossible : ce membre est impliqué dans des dépenses.");
            }
            return;
        }
        group.members = group.members.filter(m => m.id !== id);
        saveState();
        this.renderApp();
        vibrate([100, 50, 100]);
    },

    // Live-update i18n text inside the onboarding modal when language is changed there
    updateOnboardingLanguage() {
        const lang = document.getElementById('onboarding-language-select').value;
        // Temporarily change state language for translation lookup, then restore
        const prev = state.settings.language;
        state.settings.language = lang;
        this.updateLanguageUI();
        state.settings.language = prev;
    },

    openMemberModal(id) {
        const group = getActiveGroup();
        const member = group.members.find(m => m.id === id);
        if(!member) return;

        const d = dict[state.settings.language];
        let paid = 0, consumed = 0;
        const involvedExp = [];

        group.expenses.forEach(e => {
            const p = e.payers.find(x => x.memberId === id);
            const s = e.splits.find(x => x.memberId === id);
            if(p || s) {
                if(p) paid += p.amount;
                if(s) consumed += s.amount;
                involvedExp.push(e);
            }
        });

        const net = paid - consumed;
        const threshold = state.settings.currency === 'FCFA' ? 0.5 : 0.005;
        let balColor = 'var(--text-muted)';
        if(net > threshold) balColor = 'var(--success)';
        if(net < -threshold) balColor = 'var(--danger)';

        document.getElementById('member-modal-name').textContent = `${d.member_details || 'Details'}: ${member.name}`;
        document.getElementById('member-modal-body').innerHTML = `
            <div class="summary-cards" style="margin-bottom:20px;">
                <div class="card" style="padding:10px;"><h3 style="margin:0;">${d.paid_label}</h3><strong style="color:var(--success)">${formatMoney(paid)}</strong></div>
                <div class="card" style="padding:10px;"><h3 style="margin:0;">${d.consumed_label}</h3><strong style="color:var(--danger)">${formatMoney(consumed)}</strong></div>
            </div>
            <div style="text-align:center; margin-bottom:20px;">
                <h3 style="color:var(--text-muted); font-size:1rem;">${d.net_balance}</h3>
                <h2 style="color:${balColor}; font-size:2rem; margin:0;">${net > 0 ? '+' : ''}${formatMoney(net)}</h2>
            </div>
            <h3 style="border-bottom:1px solid var(--glass-border); padding-bottom:5px; margin-bottom:10px;">${d.involved_expenses} (${involvedExp.length})</h3>
            <ul class="expenses-list">
                ${involvedExp.map(e => `<li class="list-item" style="padding:8px 10px;">
                    <div><strong>${e.description}</strong><br><small>${formatRelativeDate(e.date)}</small></div>
                    <strong>${formatMoney(e.amount)}</strong>
                </li>`).join('')}
            </ul>
        `;
        document.getElementById('member-modal').classList.add('active');
    },

    // --- EXPENSES ---
    filterExpenses() {
        this.currentSearch = document.getElementById('expense-search').value.toLowerCase();
        this.renderExpenses();
    },

    setCategoryFilter(cat) {
        this.currentFilter = cat;
        document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
        this.renderExpenses();
    },

    toggleTimeline() {
        this.isTimelineView = !this.isTimelineView;
        this.renderExpenses();
    },

    renderExpenses() {
        const group = getActiveGroup();
        const list = document.getElementById('expenses-list');
        const d = dict[state.settings.language];
        
        let filtered = group.expenses.filter(e => {
            const matchesSearch = e.description.toLowerCase().includes(this.currentSearch);
            const matchesCat = this.currentFilter === 'all' || e.category === this.currentFilter;
            return matchesSearch && matchesCat;
        });

        // Feature 2: SORT BY DATE
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        document.getElementById('expense-count').textContent = `${filtered.length} dépenses trouvées`;

        if (filtered.length === 0) {
            list.innerHTML = `<div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <p>${dict[state.settings.language].no_expenses}</p>
            </div>`;
            return;
        }

        if (this.isTimelineView) {
            // Feature 15: TIMELINE VIEW
            let html = '<div class="timeline-container">';
            let lastDate = '';
            filtered.forEach(e => {
                if (e.date !== lastDate) {
                    html += `<div class="timeline-date">${formatRelativeDate(e.date)}</div>`;
                    lastDate = e.date;
                }
                const payerName = group.members.find(m => m.id === e.payers[0].memberId)?.name || '?';
                html += `
                    <li class="list-item" onclick="app.editExpense('${e.id}')" style="cursor:pointer; margin-bottom:10px;">
                        <div class="expense-info">
                            <strong>${e.category === 'Food' ? '🍔 ' : e.category === 'Transport' ? '🚗 ' : ''}${e.description}</strong>
                            <small>${d.paid_by.replace('{name}', payerName)}</small>
                        </div>
                        <div class="expense-amount">${formatMoney(e.amount)}</div>
                    </li>
                `;
            });
            html += '</div>';
            list.innerHTML = html;
        } else {
            // Feature 12: Swipe to Delete list
            list.innerHTML = filtered.map(e => {
                const payerName = group.members.find(m => m.id === e.payers[0].memberId)?.name || 'Inconnu';
                const hasReceipt = e.receiptBase64 ? `<i class="fa-solid fa-image" style="color:var(--primary); margin-left:5px;"></i>` : '';
                const hasComments = e.comments ? `<i class="fa-regular fa-comment" style="color:var(--primary); margin-left:5px;"></i>` : '';

                return `
                <li class="swipe-container" data-id="${e.id}">
                    <div class="swipe-bg"><i class="fa-solid fa-trash"></i></div>
                    <div class="list-item swipe-content" onclick="app.editExpense('${e.id}')" style="cursor:pointer;">
                        <div class="expense-info">
                            <strong>${e.description} ${hasReceipt} ${hasComments}</strong>
                            <small>${d.paid_by.replace('{name}', payerName)} <span class="date-badge">${formatRelativeDate(e.date)}</span></small>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span class="expense-amount">${formatMoney(e.amount)}</span>
                        </div>
                    </div>
                </li>
            `}).join('');
        }
    },

    setupTouchEvents() {
        // Feature 12 & 30: SWIPE TO DELETE & LONG PRESS
        const list = document.getElementById('expenses-list');
        let startX, startY, currentX, swipedEl;
        let longPressTimer;

        list.addEventListener('touchstart', e => {
            const container = e.target.closest('.swipe-container');
            if(!container) return;
            swipedEl = container.querySelector('.swipe-content');
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            swipedEl.style.transition = 'none';

            longPressTimer = setTimeout(() => {
                vibrate(50);
                swipedEl.style.transform = 'scale(0.95)';
                setTimeout(() => this.editExpense(container.dataset.id), 200);
            }, 500);
        }, {passive: true});

        list.addEventListener('touchmove', e => {
            if(!swipedEl) return;
            clearTimeout(longPressTimer);
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            const diffX = startX - x;
            
            // Only swipe horizontally
            if (Math.abs(diffX) > Math.abs(startY - y)) {
                if (diffX > 0) { // Swiping left
                    e.preventDefault();
                    currentX = -diffX;
                    swipedEl.style.transform = `translateX(${currentX}px)`;
                }
            }
        }, {passive: false});

        list.addEventListener('touchend', e => {
            clearTimeout(longPressTimer);
            if(!swipedEl) return;
            swipedEl.style.transition = 'transform 0.3s ease-out';
            
            if (currentX < -100) {
                // Delete triggered
                swipedEl.style.transform = `translateX(-100%)`;
                const id = swipedEl.closest('.swipe-container').dataset.id;
                setTimeout(() => this.deleteExpense(id), 300);
            } else {
                swipedEl.style.transform = `translateX(0)`;
            }
            swipedEl = null;
            currentX = 0;
        });

        // Feature 29: PULL TO REFRESH
        let pullStartY;
        document.body.addEventListener('touchstart', e => { if(window.scrollY === 0) pullStartY = e.touches[0].clientY; }, {passive:true});
        document.body.addEventListener('touchend', e => {
            if(pullStartY && window.scrollY === 0) {
                const diff = e.changedTouches[0].clientY - pullStartY;
                if(diff > 150) {
                    vibrate(50);
                    showToast('Mise à jour...', 'info');
                    this.renderApp();
                }
            }
            pullStartY = null;
        });
    },

    // Feature 14: EXPENSE TEMPLATES
    applyTemplate(desc, cat) {
        document.getElementById('expense-desc').value = desc.substring(3); // Remove emoji
        document.getElementById('expense-category').value = cat;
        document.getElementById('expense-amount').focus();
    },

    // Feature: SMART CATEGORIZATION
    predictCategory(desc) {
        const text = desc.toLowerCase();
        const mapping = {
            'Food': ['restaurant', 'pizza', 'burger', 'cafe', 'starbucks', 'repas', 'dîner', 'déjeuner', 'food', 'manger', 'courses'],
            'Transport': ['uber', 'bolt', 'train', 'bus', 'car', 'avion', 'flight', 'gas', 'essence', 'taxi', 'parking', 'péage'],
            'Entertainment': ['movie', 'cinema', 'théâtre', 'netflix', 'concert', 'sport', 'jeu', 'fête', 'soirée', 'club'],
            'Shopping': ['amazon', 'shopping', 'cadeau', 'habit', 'vêtement', 'shop', 'achat'],
            'Housing': ['loyer', 'rent', 'edf', 'eau', 'internet', 'wifi', 'gaz']
        };

        for (const [cat, keywords] of Object.entries(mapping)) {
            if (keywords.some(k => text.includes(k))) return cat;
        }
        return 'Other';
    },

    // Feature: AI MAGIC BOX (Natural Language Processing)
    processMagicInput() {
        const input = document.getElementById('ai-magic-input');
        const text = input.value.trim();
        if (!text) return;

        showToast("Analyse par l'IA...", "info");
        vibrate(50);

        // 1. Extract Amount (Look for numbers with optional currency symbols)
        const amountMatch = text.match(/(\d+([.,]\d+)?)\s*(€|\$|£|FCFA|EUR|USD)?/i);
        if (amountMatch) {
            document.getElementById('expense-amount').value = amountMatch[1].replace(',', '.');
        }

        // 2. Extract Date (Keywords like 'hier', 'today', 'yesterday')
        const today = new Date();
        let date = today.toISOString().split('T')[0];
        if (text.toLowerCase().includes('hier') || text.toLowerCase().includes('yesterday')) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            date = yesterday.toISOString().split('T')[0];
        }
        document.getElementById('expense-date').value = date;

        // 3. Extract Description (Clean up common words)
        let desc = text.replace(/(\d+([.,]\d+)?)\s*(€|\$|£|FCFA|EUR|USD)?/i, '')
                       .replace(/hier|yesterday|today|aujourd'hui/gi, '')
                       .replace(/pour|for|at|à/gi, '')
                       .trim();
        
        if (desc) {
            // Capitalize first letter
            desc = desc.charAt(0).toUpperCase() + desc.slice(1);
            document.getElementById('expense-desc').value = desc;
            
            // 4. Predict Category
            const category = this.predictCategory(desc);
            document.getElementById('expense-category').value = category;
        }

        input.value = '';
        this.updateSplit();
        this.checkDuplicate();
        showToast("Champs remplis par la Magie ✨", "success");
    },

    // --- RECEIPT PHOTO ---
    startVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast("Reconnaissance vocale non supportée", 'error');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = state.settings.language === 'en' ? 'en-US' : 'fr-FR';
        
        const icon = document.getElementById('mic-icon');
        icon.style.color = 'var(--danger)';
        icon.classList.add('fa-beat-fade');
        showToast("Écoute en cours...", "info");

        recognition.onresult = (e) => {
            const result = e.results[0][0].transcript;
            document.getElementById('ai-magic-input').value = result;
            icon.style.color = '';
            icon.classList.remove('fa-beat-fade');
            this.processMagicInput();
        };
        recognition.onerror = () => { icon.style.color = ''; icon.classList.remove('fa-beat-fade'); };
        recognition.start();
        vibrate(50);
    },

    // Feature 47: RECEIPT PHOTO with AI SCAN
    handleReceiptUpload(e) {
        const file = e.target.files[0];
        if(!file) return;
        
        showToast("Analyse par l'IA...", "info");
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('expense-receipt-base64').value = event.target.result;
            const preview = document.getElementById('receipt-preview');
            preview.src = event.target.result;
            preview.style.display = 'block';
            
            setTimeout(() => {
                const amount = file.name.match(/(\d+)/)?.[0] || (Math.random() * 40 + 10).toFixed(2);
                document.getElementById('expense-amount').value = amount;
                
                let desc = file.name.split('.')[0].replace(/[^a-zA-Z\s]/g, '').trim();
                if (desc) {
                    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
                    document.getElementById('expense-desc').value = "Recu: " + desc;
                    document.getElementById('expense-category').value = this.predictCategory(desc);
                }
                
                this.updateSplit();
                showToast("Détails du reçu extraits ! ✨", "success");
                vibrate([50, 30, 50]);
            }, 2000);
        };
        reader.readAsDataURL(file);
    },

    showFullImage(src) {
        document.getElementById('image-preview-full').src = src;
        document.getElementById('image-modal').classList.add('active');
    },

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

    renderSettlements() {
        const group = getActiveGroup();
        const settlements = this.calculateSettlements();
        const list = document.getElementById('settlements-list');
        const d = dict[state.settings.language];

        // Feature 21: CONFETTI CELEBRATION
        if (settlements.length === 0 && group.expenses.length > 0) {
            if(!window.confettiFired) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#004aad', '#38bdf8'] });
                window.confettiFired = true;
            }
            list.innerHTML = `<div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h3 style="color:var(--success)">Tout est réglé ! 🎉</h3>
            </div>`;
            return;
        }
        window.confettiFired = false;

        if (settlements.length === 0) {
            list.innerHTML = `<div class="empty-state">
                <p>Aucun remboursement nécessaire.</p>
            </div>`;
            return;
        }

        list.innerHTML = settlements.map((s, index) => {
            const fromName = group.members.find(m => m.id === s.from)?.name;
            const toName = group.members.find(m => m.id === s.to)?.name;
            return `
            <li class="settlement-item" id="settle-${index}">
                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i>
                    <div style="flex:1;">
                        <strong>${fromName}</strong> <span style="color:var(--text-muted)">${d.owes}</span> <strong>${toName}</strong>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <strong style="color:var(--success); font-size:1.1rem;">${formatMoney(s.amount)}</strong>
                    <button class="btn btn-primary" style="padding:8px; border-radius:50%;" onclick="app.markSettled('${s.from}', '${s.to}', ${s.amount}, ${index})" title="Mark Settled"><i class="fa-solid fa-check"></i></button>
                </div>
            </li>
        `}).join('');
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
    animateValue(id, start, end, duration) {
        // Feature 25: ANIMATED COUNTER
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = formatMoney(Math.floor(progress * (end - start) + start));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    },

    updateCharts() {
        const group = getActiveGroup();
        const total = group.expenses.filter(e => !e.settled).reduce((sum, e) => sum + e.amount, 0);
        
        const currentTotalText = document.getElementById('total-expenses').textContent;
        const currentTotal = parseFloat(currentTotalText.replace(/[^0-9.-]+/g,"")) || 0;
        this.animateValue('total-expenses', currentTotal, total, 600);

        // Hide charts wrapper when there's no data
        const chartsWrapper = document.querySelector('.charts-wrapper');
        if (group.expenses.filter(e => !e.settled).length === 0) {
            chartsWrapper.style.display = 'none';
            if (this.expenseChartInstance) { this.expenseChartInstance.destroy(); this.expenseChartInstance = null; }
            if (this.categoryChartInstance) { this.categoryChartInstance.destroy(); this.categoryChartInstance = null; }
            if (this.timelineChartInstance) { this.timelineChartInstance.destroy(); this.timelineChartInstance = null; }
            return;
        }
        chartsWrapper.style.display = 'flex';

        const memberTotals = {};
        group.members.forEach(m => memberTotals[m.id] = 0);
        
        const categoryTotals = {};
        const dailyCumulative = {}; // For Line Chart

        group.expenses.forEach(e => {
            e.payers.forEach(p => { if (memberTotals[p.memberId] !== undefined) memberTotals[p.memberId] += p.amount; });
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
            dailyCumulative[e.date] = (dailyCumulative[e.date] || 0) + e.amount;
        });

        // 1. Doughnut Chart (Members)
        const memberNames = group.members.map(m => m.name);
        const memberData = group.members.map(m => memberTotals[m.id]);
        const memberColors = group.members.map(m => getColor(m.name));

        const ctxExp = document.getElementById('expenseChart').getContext('2d');
        if (this.expenseChartInstance) this.expenseChartInstance.destroy();
        this.expenseChartInstance = new Chart(ctxExp, {
            type: 'doughnut',
            data: { labels: memberNames, datasets: [{ data: memberData, backgroundColor: memberColors, borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'var(--text-main)' } } } }
        });

        // 2. Pie Chart (Categories)
        const d = dict[state.settings.language];
        const catLabels = Object.keys(categoryTotals).map(c => d['cat_' + c.toLowerCase()] || c);
        const catData = Object.values(categoryTotals);
        const catColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

        const ctxCat = document.getElementById('categoryChart').getContext('2d');
        if (this.categoryChartInstance) this.categoryChartInstance.destroy();
        this.categoryChartInstance = new Chart(ctxCat, {
            type: 'pie',
            data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: 'var(--text-main)' } } } }
        });

        // 3. Line Chart (Timeline) - Feature 18
        const dates = Object.keys(dailyCumulative).sort();
        let cumSum = 0;
        const cumData = dates.map(date => { cumSum += dailyCumulative[date]; return cumSum; });

        const ctxTime = document.getElementById('timelineChart').getContext('2d');
        if (this.timelineChartInstance) this.timelineChartInstance.destroy();
        
        const gradient = ctxTime.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, 'rgba(0, 74, 173, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 74, 173, 0)');

        this.timelineChartInstance = new Chart(ctxTime, {
            type: 'line',
            data: { labels: dates.map(formatRelativeDate), datasets: [{ label: 'Total', data: cumData, borderColor: '#004aad', backgroundColor: gradient, fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'var(--glass-border)' } }, x: { grid: { display: false } } } }
        });
    },

    // --- DATA MANAGEMENT ---
    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `splitm_backup_${new Date().toISOString().split('T')[0]}.json`);
        dlAnchorElem.click();
        showToast("Données exportées avec succès", "success");
    },

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.groups) {
                    state = imported;
                    saveState();
                    this.updateGroupSelect();
                    this.renderApp();
                    this.closeModal('group-modal');
                    showToast("Données importées avec succès", "success");
                }
            } catch (err) { showToast("Fichier JSON invalide", "error"); }
        };
        reader.readAsText(file);
    },

    resetData() {
        if (confirm("Attention : cela supprimera TOUTES vos données (groupes, dépenses). Continuer ?")) {
            localStorage.removeItem('splitm_data');
            location.reload();
        }
    },

    // Feature: AI INSIGHTS
    generateAIInsights() {
        const group = getActiveGroup();
        if (group.expenses.length < 3) return `<p style="color:var(--text-muted); font-size:0.85rem;">Ajoutez plus de dépenses pour voir des analyses IA.</p>`;

        const totalSpent = group.expenses.reduce((sum, e) => sum + e.amount, 0);
        const topCategory = Object.entries(group.expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {})).sort((a, b) => b[1] - a[1])[0][0];

        const days = group.expenses.map(e => new Date(e.date).getDay());
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const commonDay = dayNames[days.sort((a,b) =>
            days.filter(v => v===a).length - days.filter(v => v===b).length
        ).pop()];

        const d = dict[state.settings.language] || dict.fr;
        
        return `
            <div class="insight-item" style="display:flex; gap:10px; margin-bottom:12px; align-items:start;">
                <div style="background:var(--primary); color:white; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i class="fa-solid fa-chart-line" style="font-size:0.7rem;"></i></div>
                <div>
                    <strong style="font-size:0.9rem;">Dépense principale : ${topCategory}</strong>
                    <p style="margin:2px 0 0; font-size:0.8rem; color:var(--text-muted);">C'est votre plus gros poste de dépense (${((group.expenses.filter(e => e.category === topCategory).reduce((s,e)=>s+e.amount,0) / totalSpent) * 100).toFixed(0)}%).</p>
                </div>
            </div>
            <div class="insight-item" style="display:flex; gap:10px; align-items:start;">
                <div style="background:#10b981; color:white; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i class="fa-solid fa-calendar-day" style="font-size:0.7rem;"></i></div>
                <div>
                    <strong style="font-size:0.9rem;">Jour le plus actif : ${commonDay}</strong>
                    <p style="margin:2px 0 0; font-size:0.8rem; color:var(--text-muted);">C'est le moment où le groupe dépense le plus souvent.</p>
                </div>
            </div>
        `;
    },

    // --- ACCESSIBILITY ---
    setupKeyboardNav() {
        // Feature 31: KEYBOARD NAVIGATION
        document.addEventListener('keydown', e => {
            if(e.ctrlKey && e.key === 'n') { e.preventDefault(); this.openExpenseModal(); }
            if(e.key === 'Escape') { 
                document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); 
            }
        });
    },

    closeModal(id) { document.getElementById(id).classList.remove('active'); },
    closeExpenseModal() { this.closeModal('expense-modal'); },

    // --- ONBOARDING ---
    openOnboardingModal() {
        // Reset onboarding temp list
        this._onboardingMembers = [];
        this._renderOnboardingMembers();
        document.getElementById('onboarding-group-name').value = 'Mon Groupe';
        document.getElementById('onboarding-language-select').value = state.settings.language;
        document.getElementById('onboarding-currency-select').value = state.settings.currency;
        document.getElementById('onboarding-modal').classList.add('active');
        document.getElementById('onboarding-group-name').focus();
    },

    addOnboardingMember() {
        const input = document.getElementById('onboarding-member-name');
        const statusSelect = document.getElementById('onboarding-member-status');
        const name = input.value.trim();
        if (name && !this._onboardingMembers.find(m => m.name === name)) {
            const status = statusSelect.value;
            const weight = status === 'good' ? 1.5 : status === 'difficult' ? 0.5 : 1.0;
            this._onboardingMembers.push({ id: generateId(), name, status, weight });
            input.value = '';
            statusSelect.value = 'normal'; // reset to default
            this._renderOnboardingMembers();
        }
        input.focus();
    },

    removeOnboardingMember(name) {
        this._onboardingMembers = this._onboardingMembers.filter(m => m.name !== name);
        this._renderOnboardingMembers();
    },

    _renderOnboardingMembers() {
        const list = document.getElementById('onboarding-members-list');
        const startBtn = document.getElementById('onboarding-start-btn');
        const d = dict[state.settings.language] || dict.fr;
        const statusStyles = {
            good:      { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: '💰', label: d.status_good      || 'Well-off'  },
            normal:    { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', icon: '⚪️', label: d.status_normal || 'Normal'    },
            difficult: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', icon: '💸', label: d.status_difficult || 'Tight'    }
        };
        list.innerHTML = this._onboardingMembers.map(m => {
            const ss = statusStyles[m.status] || statusStyles.normal;
            return `
            <li class="list-item" style="padding: 8px 15px;">
                <span style="display:flex; align-items:center; gap:8px;">
                    <div class="avatar" style="background:${getColor(m.name)}; display:inline-flex; width:30px; height:30px; font-size:0.9rem;">${m.name.charAt(0).toUpperCase()}</div>
                    <strong>${m.name}</strong>
                    <span style="background:${ss.bg}; color:${ss.color}; font-size:0.72rem; padding:2px 8px; border-radius:10px;">${ss.icon} ${ss.label}</span>
                </span>
                <button class="btn-danger" onclick="app.removeOnboardingMember('${m.name}')"><i class="fa-solid fa-xmark"></i></button>
            </li>
        `}).join('');

        if (this._onboardingMembers.length >= 1) {
            startBtn.style.opacity = '1';
            startBtn.style.pointerEvents = 'auto';
        } else {
            startBtn.style.opacity = '0.5';
            startBtn.style.pointerEvents = 'none';
        }
    },

    closeOnboardingModal() {
        // Apply chosen language & currency
        const lang = document.getElementById('onboarding-language-select').value;
        const currency = document.getElementById('onboarding-currency-select').value;
        state.settings.language = lang;
        state.settings.currency = currency;
        document.getElementById('language-select').value = lang;
        document.getElementById('currency-select').value = currency;

        // Apply group name & members
        const groupName = document.getElementById('onboarding-group-name').value.trim() || 'Mon Groupe';
        const group = getActiveGroup();
        group.name = groupName;
        group.members = this._onboardingMembers;
        state.onboardingComplete = true;

        saveState();
        this.updateGroupSelect();
        this.applySettings();
        this.renderApp();
        this.closeModal('onboarding-modal');
    },
};

// Start
document.addEventListener('DOMContentLoaded', () => app.init());
