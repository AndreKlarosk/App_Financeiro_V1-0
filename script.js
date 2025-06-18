// FinanceManager Pro - Complete Financial Management Application with Advanced Features
class FinanceManager {
    constructor() {
        this.db = null;
        this.currentSection = 'dashboard';
        this.charts = {};
        this.settings = {
            darkMode: false,
            currency: 'BRL',
            budgetAlerts: true,
            goalAlerts: true,
            backupFrequency: 'weekly',
            modules: {
                transactions: true,
                categories: true,
                budget: true,
                goals: true,
                reports: true,
                planning: true,
                investments: true,
                notifications: true,
                comparison: true
            }
        };
        this.notifications = [];
        this.init();
    }

    // Initialize the application
    async init() {
        try {
            await this.initDatabase();
            this.loadSettings();
            this.setupEventListeners();
            this.loadDefaultCategories();
            this.showSection('dashboard');
            this.updateDashboard();
            this.setupAutoBackup();
            this.checkNotifications();
            this.setupMobileFeatures();
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.showNotification('Erro ao inicializar aplicação', 'error');
        }
    }

    // Setup mobile features
    setupMobileFeatures() {
        try {
            // Add mobile menu toggle to header
            const headerControls = document.querySelector('.header-controls');
            if (headerControls && !document.querySelector('.mobile-menu-toggle')) {
                const mobileToggle = document.createElement('button');
                mobileToggle.className = 'mobile-menu-toggle';
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                mobileToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMobileMenu();
                });
                headerControls.insertBefore(mobileToggle, headerControls.firstChild);
            }

            // Add sidebar overlay for mobile
            if (!document.querySelector('.sidebar-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.addEventListener('click', () => this.closeMobileMenu());
                document.body.appendChild(overlay);
            }

            // Handle swipe gestures on mobile
            this.setupSwipeGestures();

            // Close menu when clicking on nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
                    }
                });
            });
        } catch (error) {
            console.error('Error setting up mobile features:', error);
        }
    }

    // Mobile menu methods
    setupMobileMenu() {
        console.log('Mobile menu initialized');
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (sidebar && overlay) {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');

            // Prevent body scroll when menu is open
            document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
        }
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Setup swipe gestures for mobile navigation
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Swipe right to open menu
                if (diffX < -50 && startX < 50) {
                    this.toggleMobileMenu();
                }
                // Swipe left to close menu
                else if (diffX > 50 && document.querySelector('.sidebar').classList.contains('mobile-open')) {
                    this.closeMobileMenu();
                }
            }

            startX = 0;
            startY = 0;
        });
    }

    // Enhanced IndexedDB Setup
    async initDatabase() {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('FinanceManagerDB', 2);

                request.onerror = (event) => {
                    console.error('Database error:', event.target.error);
                    reject(event.target.error);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.db.onerror = (event) => {
                        console.error('Database error:', event.target.error);
                    };
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    try {
                        const db = event.target.result;

                        // Transactions store
                        if (!db.objectStoreNames.contains('transactions')) {
                            const transactionStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
                            transactionStore.createIndex('date', 'date');
                            transactionStore.createIndex('category', 'category');
                            transactionStore.createIndex('type', 'type');
                            transactionStore.createIndex('tags', 'tags', { multiEntry: true });
                        }

                        // Categories store
                        if (!db.objectStoreNames.contains('categories')) {
                            const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                            categoryStore.createIndex('name', 'name');
                        }

                        // Budget store
                        if (!db.objectStoreNames.contains('budgets')) {
                            const budgetStore = db.createObjectStore('budgets', { keyPath: 'id', autoIncrement: true });
                            budgetStore.createIndex('category', 'category');
                            budgetStore.createIndex('month', 'month');
                        }

                        // Goals store
                        if (!db.objectStoreNames.contains('goals')) {
                            const goalStore = db.createObjectStore('goals', { keyPath: 'id', autoIncrement: true });
                            goalStore.createIndex('deadline', 'deadline');
                        }

                        // Investments store
                        if (!db.objectStoreNames.contains('investments')) {
                            const investmentStore = db.createObjectStore('investments', { keyPath: 'id', autoIncrement: true });
                            investmentStore.createIndex('type', 'type');
                            investmentStore.createIndex('date', 'date');
                        }

                        // Reminders store
                        if (!db.objectStoreNames.contains('reminders')) {
                            const reminderStore = db.createObjectStore('reminders', { keyPath: 'id', autoIncrement: true });
                            reminderStore.createIndex('date', 'date');
                            reminderStore.createIndex('type', 'type');
                        }

                        // Settings store
                        if (!db.objectStoreNames.contains('settings')) {
                            db.createObjectStore('settings', { keyPath: 'key' });
                        }
                    } catch (upgradeError) {
                        console.error('Error during database upgrade:', upgradeError);
                        reject(upgradeError);
                    }
                };
            } catch (error) {
                console.error('Error initializing database:', error);
                reject(error);
            }
        });
    }

    // Database operations
    async addRecord(storeName, data) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            return new Promise((resolve, reject) => {
                const request = store.add(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error adding record:', error);
            throw error;
        }
    }

    async updateRecord(storeName, data) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            return new Promise((resolve, reject) => {
                const request = store.put(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error updating record:', error);
            throw error;
        }
    }

    async deleteRecord(storeName, id) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            return new Promise((resolve, reject) => {
                const request = store.delete(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    }

    async getAllRecords(storeName) {
        try {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting records:', error);
            return [];
        }
    }

    // Enhanced Event Listeners Setup
    setupEventListeners() {
        try {
            // Mobile menu toggle
            this.setupMobileMenu();

            // Window resize handler for responsive charts
            window.addEventListener('resize', this.debounce(() => {
                this.resizeCharts();
            }, 250));

            // Navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = link.getAttribute('data-section');
                    this.showSection(section);

                    // Close mobile menu when navigating
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
                    }
                });
            });

            // Modal controls
            document.querySelectorAll('[data-modal]').forEach(element => {
                element.addEventListener('click', (e) => {
                    const modalId = element.getAttribute('data-modal');
                    if (element.classList.contains('close') || element.textContent === 'Cancelar') {
                        this.closeModal(modalId);
                    } else {
                        this.closeModal(modalId);
                    }
                });
            });

            // Form submissions
            const transactionForm = document.getElementById('transactionForm');
            if (transactionForm) {
                transactionForm.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
            }

            const categoryForm = document.getElementById('categoryForm');
            if (categoryForm) {
                categoryForm.addEventListener('submit', (e) => this.handleCategorySubmit(e));
            }

            const budgetForm = document.getElementById('budgetForm');
            if (budgetForm) {
                budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
            }

            const goalForm = document.getElementById('goalForm');
            if (goalForm) {
                goalForm.addEventListener('submit', (e) => this.handleGoalSubmit(e));
            }

            const investmentForm = document.getElementById('investmentForm');
            if (investmentForm) {
                investmentForm.addEventListener('submit', (e) => this.handleInvestmentSubmit(e));
            }

            const reminderForm = document.getElementById('reminderForm');
            if (reminderForm) {
                reminderForm.addEventListener('submit', (e) => this.handleReminderSubmit(e));
            }

            // Button clicks
            this.setupButtonListeners();

            // Filters
            const periodFilter = document.getElementById('periodFilter');
            if (periodFilter) {
                periodFilter.addEventListener('change', () => this.updateDashboard());
            }

            this.setupTransactionFilters();
            this.setupCalculators();
            this.setupComparison();
            this.setupExportImport();
            this.setupSettings();

            // Set default dates
            this.setDefaultDates();

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    setupButtonListeners() {
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => this.openTransactionModal());
        }

        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.openCategoryModal());
        }

        const addBudgetBtn = document.getElementById('addBudgetBtn');
        if (addBudgetBtn) {
            addBudgetBtn.addEventListener('click', () => this.openBudgetModal());
        }

        const addGoalBtn = document.getElementById('addGoalBtn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => this.openGoalModal());
        }

        const addInvestmentBtn = document.getElementById('addInvestmentBtn');
        if (addInvestmentBtn) {
            addInvestmentBtn.addEventListener('click', () => this.openInvestmentModal());
        }

        const addReminderBtn = document.getElementById('addReminderBtn');
        if (addReminderBtn) {
            addReminderBtn.addEventListener('click', () => this.openReminderModal());
        }
    }

    setupTransactionFilters() {
        const searchTransactions = document.getElementById('searchTransactions');
        if (searchTransactions) {
            searchTransactions.addEventListener('input', () => this.filterTransactions());
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterTransactions());
        }

        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.filterTransactions());
        }
    }

    setupCalculators() {
        // Calculators
        const calculateSavings = document.getElementById('calculateSavings');
        if (calculateSavings) {
            calculateSavings.addEventListener('click', () => this.calculateSavings());
        }

        const calculateLoan = document.getElementById('calculateLoan');
        if (calculateLoan) {
            calculateLoan.addEventListener('click', () => this.calculateLoan());
        }

        const calculateRetirement = document.getElementById('calculateRetirement');
        if (calculateRetirement) {
            calculateRetirement.addEventListener('click', () => this.calculateRetirement());
        }

        const calculateInflation = document.getElementById('calculateInflation');
        if (calculateInflation) {
            calculateInflation.addEventListener('click', () => this.calculateInflation());
        }

        const calculateCompound = document.getElementById('calculateCompound');
        if (calculateCompound) {
            calculateCompound.addEventListener('click', () => this.calculateCompound());
        }

        const calculateDiscount = document.getElementById('calculateDiscount');
        if (calculateDiscount) {
            calculateDiscount.addEventListener('click', () => this.calculateDiscount());
        }
    }

    setupComparison() {
        const compareCards = document.getElementById('compareCards');
        if (compareCards) {
            compareCards.addEventListener('click', () => this.compareCards());
        }

        const compareInvestments = document.getElementById('compareInvestments');
        if (compareInvestments) {
            compareInvestments.addEventListener('click', () => this.compareInvestments());
        }

        const compareLoans = document.getElementById('compareLoans');
        if (compareLoans) {
            compareLoans.addEventListener('click', () => this.compareLoans());
        }
    }

    setupExportImport() {
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportData());
        }

        const importDataBtn = document.getElementById('importDataBtn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => this.importData());
        }

        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }

        const backupNowBtn = document.getElementById('backupNowBtn');
        if (backupNowBtn) {
            backupNowBtn.addEventListener('click', () => this.backupNow());
        }
    }

    setupSettings() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => this.toggleDarkMode(e.target.checked));
        }

        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => this.changeCurrency(e.target.value));
        }

        const budgetAlertsToggle = document.getElementById('budgetAlertsToggle');
        if (budgetAlertsToggle) {
            budgetAlertsToggle.addEventListener('change', (e) => this.toggleBudgetAlerts(e.target.checked));
        }

        const goalAlertsToggle = document.getElementById('goalAlertsToggle');
        if (goalAlertsToggle) {
            goalAlertsToggle.addEventListener('change', (e) => this.toggleGoalAlerts(e.target.checked));
        }

        const backupFrequency = document.getElementById('backupFrequency');
        if (backupFrequency) {
            backupFrequency.addEventListener('change', (e) => this.changeBackupFrequency(e.target.value));
        }

        // Module Settings
        this.setupModuleSettings();

        // Reports
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }
    }

    setupModuleSettings() {
        const moduleIds = [
            'enableTransactions', 'enableCategories', 'enableBudget', 'enableGoals',
            'enableReports', 'enablePlanning', 'enableInvestments', 'enableNotifications',
            'enableComparison'
        ];

        moduleIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const moduleName = id.replace('enable', '').toLowerCase();
                element.addEventListener('change', (e) => this.toggleModule(moduleName, e.target.checked));
            }
        });
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toISOString().substr(0, 7);

        const transactionDate = document.getElementById('transactionDate');
        if (transactionDate) transactionDate.value = today;

        const reportMonth = document.getElementById('reportMonth');
        if (reportMonth) reportMonth.value = currentMonth;

        const budgetMonth = document.getElementById('budgetMonth');
        if (budgetMonth) budgetMonth.value = currentMonth;

        const investmentDate = document.getElementById('investmentDate');
        if (investmentDate) investmentDate.value = today;

        const reminderDate = document.getElementById('reminderDate');
        if (reminderDate) reminderDate.value = today;
    }

    // Debounce utility for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Enhanced Navigation
    showSection(sectionName) {
        try {
            // Update navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Update content sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });

            const activeSection = document.getElementById(sectionName);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            this.currentSection = sectionName;

            // Load section-specific data
            switch (sectionName) {
                case 'dashboard':
                    this.updateDashboard();
                    break;
                case 'transactions':
                    if (this.settings.modules.transactions) this.loadTransactions();
                    break;
                case 'categories':
                    if (this.settings.modules.categories) this.loadCategories();
                    break;
                case 'budget':
                    if (this.settings.modules.budget) this.loadBudgets();
                    break;
                case 'goals':
                    if (this.settings.modules.goals) this.loadGoals();
                    break;
                case 'reports':
                    if (this.settings.modules.reports) this.loadReports();
                    break;
                case 'planning':
                    if (this.settings.modules.planning) this.loadPlanning();
                    break;
                case 'investments':
                    if (this.settings.modules.investments) this.loadInvestments();
                    break;
                case 'notifications':
                    if (this.settings.modules.notifications) this.loadNotifications();
                    break;
                case 'comparison':
                    if (this.settings.modules.comparison) this.loadComparison();
                    break;
            }
        } catch (error) {
            console.error('Error showing section:', error);
        }
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            // Reset forms and clear edit IDs
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                delete form.dataset.editId;
            }
        }
    }

    openTransactionModal(transaction = null) {
        this.populateCategorySelect('transactionCategory');
        if (transaction) {
            document.getElementById('transactionModalTitle').textContent = 'Editar Transação';
            this.populateTransactionForm(transaction);
        } else {
            document.getElementById('transactionModalTitle').textContent = 'Nova Transação';
            const dateField = document.getElementById('transactionDate');
            if (dateField) {
                dateField.value = new Date().toISOString().split('T')[0];
            }
        }
        this.openModal('transactionModal');
    }

    openCategoryModal(category = null) {
        if (category) {
            document.getElementById('categoryModalTitle').textContent = 'Editar Categoria';
            this.populateCategoryForm(category);
        } else {
            document.getElementById('categoryModalTitle').textContent = 'Nova Categoria';
        }
        this.openModal('categoryModal');
    }

    openBudgetModal(budget = null) {
        this.populateCategorySelect('budgetCategory');
        if (budget) {
            document.getElementById('budgetModalTitle').textContent = 'Editar Orçamento';
            this.populateBudgetForm(budget);
        } else {
            document.getElementById('budgetModalTitle').textContent = 'Novo Orçamento';
            const monthField = document.getElementById('budgetMonth');
            if (monthField) {
                monthField.value = new Date().toISOString().substr(0, 7);
            }
        }
        this.openModal('budgetModal');
    }

    openGoalModal(goal = null) {
        if (goal) {
            document.getElementById('goalModalTitle').textContent = 'Editar Meta';
            this.populateGoalForm(goal);
        } else {
            document.getElementById('goalModalTitle').textContent = 'Nova Meta';
        }
        this.openModal('goalModal');
    }

    openInvestmentModal(investment = null) {
        if (investment) {
            document.getElementById('investmentModalTitle').textContent = 'Editar Investimento';
            this.populateInvestmentForm(investment);
        } else {
            document.getElementById('investmentModalTitle').textContent = 'Novo Investimento';
            const dateField = document.getElementById('investmentDate');
            if (dateField) {
                dateField.value = new Date().toISOString().split('T')[0];
            }
        }
        this.openModal('investmentModal');
    }

    openReminderModal(reminder = null) {
        if (reminder) {
            document.getElementById('reminderModalTitle').textContent = 'Editar Lembrete';
            this.populateReminderForm(reminder);
        } else {
            document.getElementById('reminderModalTitle').textContent = 'Novo Lembrete';
            const dateField = document.getElementById('reminderDate');
            if (dateField) {
                dateField.value = new Date().toISOString().split('T')[0];
            }
        }
        this.openModal('reminderModal');
    }

    // Enhanced Form Handlers
    async handleTransactionSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        try {
            const transaction = {
                type: document.getElementById('transactionType').value,
                amount: parseFloat(document.getElementById('transactionAmount').value),
                description: document.getElementById('transactionDescription').value,
                category: document.getElementById('transactionCategory').value,
                date: document.getElementById('transactionDate').value,
                tags: document.getElementById('transactionTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
                notes: document.getElementById('transactionNotes').value,
                timestamp: new Date().toISOString()
            };

            if (editId) {
                transaction.id = parseInt(editId);
                await this.updateRecord('transactions', transaction);
                this.showNotification('Transação atualizada com sucesso!', 'success');
            } else {
                await this.addRecord('transactions', transaction);
                this.showNotification('Transação adicionada com sucesso!', 'success');
            }

            this.closeModal('transactionModal');
            this.updateDashboard();
            if (this.currentSection === 'transactions') {
                this.loadTransactions();
            }
        } catch (error) {
            console.error('Error handling transaction:', error);
            this.showNotification(editId ? 'Erro ao atualizar transação' : 'Erro ao adicionar transação', 'error');
        }
    }

    async handleCategorySubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        try {
            const category = {
                name: document.getElementById('categoryName').value,
                icon: document.getElementById('categoryIcon').value,
                color: document.getElementById('categoryColor').value,
                timestamp: new Date().toISOString()
            };

            if (editId) {
                category.id = parseInt(editId);
                await this.updateRecord('categories', category);
                this.showNotification('Categoria atualizada com sucesso!', 'success');
            } else {
                await this.addRecord('categories', category);
                this.showNotification('Categoria adicionada com sucesso!', 'success');
            }

            this.closeModal('categoryModal');
            this.loadCategories();
        } catch (error) {
            console.error('Error handling category:', error);
            this.showNotification(editId ? 'Erro ao atualizar categoria' : 'Erro ao adicionar categoria', 'error');
        }
    }

    async handleBudgetSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        try {
            const budget = {
                category: document.getElementById('budgetCategory').value,
                amount: parseFloat(document.getElementById('budgetAmount').value),
                month: document.getElementById('budgetMonth').value,
                timestamp: new Date().toISOString()
            };

            if (editId) {
                budget.id = parseInt(editId);
                await this.updateRecord('budgets', budget);
                this.showNotification('Orçamento atualizado com sucesso!', 'success');
            } else {
                await this.addRecord('budgets', budget);
                this.showNotification('Orçamento adicionado com sucesso!', 'success');
            }

            this.closeModal('budgetModal');
            this.loadBudgets();
            this.updateDashboard();
        } catch (error) {
            console.error('Error handling budget:', error);
            this.showNotification(editId ? 'Erro ao atualizar orçamento' : 'Erro ao adicionar orçamento', 'error');
        }
    }

    async handleGoalSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        try {
            const goal = {
                name: document.getElementById('goalName').value,
                target: parseFloat(document.getElementById('goalTarget').value),
                current: parseFloat(document.getElementById('goalCurrent').value) || 0,
                deadline: document.getElementById('goalDeadline').value,
                timestamp: new Date().toISOString()
            };

            if (editId) {
                goal.id = parseInt(editId);
                await this.updateRecord('goals', goal);
                this.showNotification('Meta atualizada com sucesso!', 'success');
            } else {
                await this.addRecord('goals', goal);
                this.showNotification('Meta adicionada com sucesso!', 'success');
            }

            this.closeModal('goalModal');
            this.loadGoals();
        } catch (error) {
            console.error('Error handling goal:', error);
            this.showNotification(editId ? 'Erro ao atualizar meta' : 'Erro ao adicionar meta', 'error');
        }
    }

    async handleInvestmentSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        try {
            const investment = {
                name: document.getElementById('investmentName').value,
                type: document.getElementById('investmentType').value,
                amount: parseFloat(document.getElementById('investmentAmount').value),
                currentValue: parseFloat(document.getElementById('investmentCurrent').value),
                date: document.getElementById('investmentDate').value,
                timestamp: new Date().toISOString()
            };

            if (editId) {
                investment.id = parseInt(editId);
                await this.updateRecord('investments', investment);
                this.showNotification('Investimento atualizado com sucesso!', 'success');
            } else {
                await this.addRecord('investments', investment);
                this.showNotification('Investimento adicionado com sucesso!', 'success');
            }

            this.closeModal('investmentModal');
            this.loadInvestments();
        } catch (error) {
            console.error('Error handling investment:', error);
            this.showNotification(editId ? 'Erro ao atualizar investimento' : 'Erro ao adicionar investimento', 'error');
        }
    }

    async handleReminderSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        try {
            const reminder = {
                title: document.getElementById('reminderTitle').value,
                description: document.getElementById('reminderDescription').value,
                date: document.getElementById('reminderDate').value,
                type: document.getElementById('reminderType').value,
                completed: false,
                timestamp: new Date().toISOString()
            };

            if (editId) {
                reminder.id = parseInt(editId);
                await this.updateRecord('reminders', reminder);
                this.showNotification('Lembrete atualizado com sucesso!', 'success');
            } else {
                await this.addRecord('reminders', reminder);
                this.showNotification('Lembrete adicionado com sucesso!', 'success');
            }

            this.closeModal('reminderModal');
            this.loadNotifications();
        } catch (error) {
            console.error('Error handling reminder:', error);
            this.showNotification(editId ? 'Erro ao atualizar lembrete' : 'Erro ao adicionar lembrete', 'error');
        }
    }

    // Enhanced Dashboard Functions
    async updateDashboard() {
        try {
            const periodElement = document.getElementById('periodFilter');
            const period = periodElement ? parseInt(periodElement.value) : 30;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - period);

            const transactions = await this.getAllRecords('transactions');
            const filteredTransactions = transactions.filter(t => 
                new Date(t.date) >= startDate
            );

            this.updateSummaryCards(filteredTransactions);
            this.updateCharts(filteredTransactions);
            this.updateRecentTransactions(transactions.slice(-10));
            this.checkBudgetAlerts();
            this.checkGoalAlerts();
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    updateSummaryCards(transactions) {
        try {
            const income = transactions.filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            const expense = transactions.filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            const balance = income - expense;

            const totalIncomeEl = document.getElementById('totalIncome');
            if (totalIncomeEl) totalIncomeEl.textContent = this.formatCurrency(income);

            const totalExpenseEl = document.getElementById('totalExpense');
            if (totalExpenseEl) totalExpenseEl.textContent = this.formatCurrency(expense);

            const totalBalanceEl = document.getElementById('totalBalance');
            if (totalBalanceEl) totalBalanceEl.textContent = this.formatCurrency(balance);

            // Calculate changes (simplified)
            const incomeChangeEl = document.getElementById('incomeChange');
            if (incomeChangeEl) incomeChangeEl.textContent = '+0%';

            const expenseChangeEl = document.getElementById('expenseChange');
            if (expenseChangeEl) expenseChangeEl.textContent = '+0%';

            const balanceChangeEl = document.getElementById('balanceChange');
            if (balanceChangeEl) {
                balanceChangeEl.textContent = '0%';
                balanceChangeEl.className = balance >= 0 ? 'change positive' : 'change negative';
            }
        } catch (error) {
            console.error('Error updating summary cards:', error);
        }
    }

    async updateCharts(transactions) {
        try {
            this.updateLineChart(transactions);
            this.updatePieChart(transactions);
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    updateLineChart(transactions) {
        try {
            const canvas = document.getElementById('lineChart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');

            // Set safe canvas dimensions to prevent size errors
            const container = canvas.parentElement;
            const containerWidth = container.clientWidth || 400;
            const containerHeight = 300;

            // Set actual canvas size in pixels (for rendering)
            canvas.width = Math.min(containerWidth - 32, 800);
            canvas.height = Math.min(containerHeight, 400);

            // Set display size via CSS (for layout)
            canvas.style.width = Math.min(containerWidth - 32, 800) + 'px';
            canvas.style.height = Math.min(containerHeight, 400) + 'px';

            // Destroy existing chart
            if (this.charts.line) {
                this.charts.line.destroy();
            }

            // Group transactions by date
            const dailyData = {};
            transactions.forEach(t => {
                const date = t.date;
                if (!dailyData[date]) {
                    dailyData[date] = { income: 0, expense: 0 };
                }
                dailyData[date][t.type] += t.amount;
            });

            const labels = Object.keys(dailyData).sort();
            const incomeData = labels.map(date => dailyData[date].income);
            const expenseData = labels.map(date => dailyData[date].expense);

            this.charts.line = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Receitas',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Despesas',
                        data: expenseData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => this.formatCurrency(value)
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating line chart:', error);
        }
    }

    async updatePieChart(transactions) {
        try {
            const canvas = document.getElementById('pieChart');
            if (!canvas) return;

            // Wait for container to be properly sized
            await new Promise(resolve => setTimeout(resolve, 100));

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Destroy existing chart first
            if (this.charts.pie) {
                try {
                    this.charts.pie.destroy();
                    this.charts.pie = null;
                } catch (e) {
                    console.warn('Error destroying pie chart:', e);
                }
            }

            const categories = await this.getAllRecords('categories');
            const categoryMap = {};
            categories.forEach(cat => {
                categoryMap[cat.name] = cat.color;
            });

            // Group expenses by category
            const expensesByCategory = {};
            transactions.filter(t => t.type === 'expense').forEach(t => {
                if (!expensesByCategory[t.category]) {
                    expensesByCategory[t.category] = 0;
                }
                expensesByCategory[t.category] += t.amount;
            });

            const labels = Object.keys(expensesByCategory);
            const data = Object.values(expensesByCategory);
            
            if (labels.length === 0) {
                // Clear canvas if no data
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            
            const colors = labels.map(label => categoryMap[label] || '#64748b');

            // Set safe canvas dimensions
            const container = canvas.parentElement;
            if (!container) return;
            
            const containerRect = container.getBoundingClientRect();
            const maxWidth = Math.min(containerRect.width - 32, 600);
            const maxHeight = Math.min(400, maxWidth);
            
            canvas.width = maxWidth > 0 ? maxWidth : 400;
            canvas.height = maxHeight > 0 ? maxHeight : 300;

            this.charts.pie = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
                                    return `${context.label}: ${this.formatCurrency(context.parsed)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating pie chart:', error);
        }
    }

    async updateRecentTransactions(transactions) {
        try {
            const container = document.getElementById('recentTransactionsList');
            if (!container) return;

            const categories = await this.getAllRecords('categories');
            const categoryMap = {};
            categories.forEach(cat => {
                categoryMap[cat.name] = { icon: cat.icon, color: cat.color };
            });

            if (transactions.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <h3>Nenhuma transação recente</h3>
                        <p>Suas transações aparecerão aqui</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = transactions.map(transaction => {
                const category = categoryMap[transaction.category] || { icon: 'fas fa-question', color: '#64748b' };
                return `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-icon" style="background-color: ${category.color}">
                                <i class="${category.icon}"></i>
                            </div>
                            <div class="transaction-details">
                                <h4>${transaction.description}</h4>
                                <p>${transaction.category} • ${this.formatDate(transaction.date)}</p>
                                ${transaction.tags && transaction.tags.length > 0 ? 
                                    `<div class="transaction-tags">${transaction.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                            </div>
                        </div>
                        <div class="transaction-amount ${transaction.type}">
                            ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error updating recent transactions:', error);
        }
    }

    // Resize charts for responsive behavior
    resizeCharts() {
        try {
            if (this.charts.line && typeof this.charts.line.resize === 'function') {
                this.charts.line.resize();
            }
            if (this.charts.pie && typeof this.charts.pie.resize === 'function') {
                this.charts.pie.resize();
            }
        } catch (error) {
            console.error('Erro ao redimensionar gráficos:', error);
        }
    }

    // Utility Functions
    async populateCategorySelect(selectId) {
        try {
            const categories = await this.getAllRecords('categories');
            const select = document.getElementById(selectId);

            if (select) {
                select.innerHTML = '<option value="">Selecionar categoria</option>' +
                    categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
            }
        } catch (error) {
            console.error('Error populating category select:', error);
        }
    }

    async loadDefaultCategories() {
        try {
            const existingCategories = await this.getAllRecords('categories');
            if (existingCategories.length === 0) {
                const defaultCategories = [
                    { name: 'Alimentação', icon: 'fas fa-utensils', color: '#ef4444' },
                    { name: 'Transporte', icon: 'fas fa-car', color: '#3b82f6' },
                    { name: 'Casa', icon: 'fas fa-home', color: '#10b981' },
                    { name: 'Saúde', icon: 'fas fa-heartbeat', color: '#f59e0b' },
                    { name: 'Educação', icon: 'fas fa-graduation-cap', color: '#8b5cf6' },
                    { name: 'Entretenimento', icon: 'fas fa-gamepad', color: '#06b6d4' },
                    { name: 'Compras', icon: 'fas fa-shopping-cart', color: '#ec4899' },
                    { name: 'Trabalho', icon: 'fas fa-briefcase', color: '#64748b' },
                    { name: 'Investimentos', icon: 'fas fa-chart-line', color: '#059669' },
                    { name: 'Outros', icon: 'fas fa-ellipsis-h', color: '#6b7280' }
                ];

                for (const category of defaultCategories) {
                    await this.addRecord('categories', {
                        ...category,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.error('Error loading default categories:', error);
        }
    }

    // Formatting Utilities
    formatCurrency(amount) {
        const currencyMap = {
            'BRL': { currency: 'BRL', locale: 'pt-BR' },
            'USD': { currency: 'USD', locale: 'en-US' },
            'EUR': { currency: 'EUR', locale: 'de-DE' }
        };

        const config = currencyMap[this.settings.currency] || currencyMap['BRL'];

        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.currency
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    formatMonth(monthString) {
        const [year, month] = monthString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#2563eb'};
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            min-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Load settings from database
    async loadSettings() {
        try {
            const settingsData = await this.getAllRecords('settings');
            
            // Apply loaded settings to current settings object
            settingsData.forEach(setting => {
                if (setting.key === 'modules' && typeof setting.value === 'object') {
                    this.settings.modules = { ...this.settings.modules, ...setting.value };
                } else {
                    this.settings[setting.key] = setting.value;
                }
            });
            
            this.applySettings();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    applySettings() {
        try {
            // Apply UI settings
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) darkModeToggle.checked = this.settings.darkMode;

            const currencySelect = document.getElementById('currencySelect');
            if (currencySelect) currencySelect.value = this.settings.currency;

            const budgetAlertsToggle = document.getElementById('budgetAlertsToggle');
            if (budgetAlertsToggle) budgetAlertsToggle.checked = this.settings.budgetAlerts;

            const goalAlertsToggle = document.getElementById('goalAlertsToggle');
            if (goalAlertsToggle) goalAlertsToggle.checked = this.settings.goalAlerts;

            const backupFrequency = document.getElementById('backupFrequency');
            if (backupFrequency) backupFrequency.value = this.settings.backupFrequency;

            // Apply module settings
            Object.keys(this.settings.modules).forEach(module => {
                const elementId = `enable${module.charAt(0).toUpperCase() + module.slice(1)}`;
                const element = document.getElementById(elementId);
                if (element) {
                    element.checked = this.settings.modules[module];
                }
            });

            // Apply dark mode
            if (this.settings.darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }

            // Apply module visibility
            this.applyModuleVisibility();
        } catch (error) {
            console.error('Error applying settings:', error);
        }
    }

    applyModuleVisibility() {
        try {
            // Hide/show navigation items based on module settings
            const moduleNavMapping = {
                transactions: '[data-section="transactions"]',
                categories: '[data-section="categories"]',
                budget: '[data-section="budget"]',
                goals: '[data-section="goals"]',
                reports: '[data-section="reports"]',
                planning: '[data-section="planning"]',
                investments: '[data-section="investments"]',
                notifications: '[data-section="notifications"]',
                comparison: '[data-section="comparison"]'
            };

            Object.keys(moduleNavMapping).forEach(module => {
                const navElement = document.querySelector(moduleNavMapping[module]);
                const isEnabled = this.settings.modules[module];
                
                if (navElement) {
                    if (isEnabled) {
                        navElement.style.display = '';
                        navElement.parentElement.style.display = '';
                    } else {
                        navElement.style.display = 'none';
                        navElement.parentElement.style.display = 'none';
                    }
                }
            });

            // If current section is disabled, switch to dashboard
            if (!this.settings.modules[this.currentSection] && this.currentSection !== 'dashboard' && this.currentSection !== 'settings') {
                this.showSection('dashboard');
            }
        } catch (error) {
            console.error('Error applying module visibility:', error);
        }
    }

    async saveSettings() {
        try {
            // Save each setting individually
            for (const [key, value] of Object.entries(this.settings)) {
                const settingRecord = { key, value };
                
                // Check if setting already exists
                const existingSettings = await this.getAllRecords('settings');
                const existingSetting = existingSettings.find(s => s.key === key);
                
                if (existingSetting) {
                    settingRecord.id = existingSetting.id;
                    await this.updateRecord('settings', settingRecord);
                } else {
                    await this.addRecord('settings', settingRecord);
                }
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    async toggleDarkMode(enabled) {
        try {
            this.settings.darkMode = enabled;
            await this.saveSettings();

            if (enabled) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            this.showNotification(`Modo escuro ${enabled ? 'ativado' : 'desativado'}`, 'success');
        } catch (error) {
            console.error('Error toggling dark mode:', error);
            this.showNotification('Erro ao alterar modo escuro', 'error');
        }
    }

    async changeCurrency(currency) {
        try {
            this.settings.currency = currency;
            await this.saveSettings();
            this.updateDashboard();
            this.showNotification('Moeda alterada com sucesso', 'success');
        } catch (error) {
            console.error('Error changing currency:', error);
            this.showNotification('Erro ao alterar moeda', 'error');
        }
    }

    async toggleBudgetAlerts(enabled) {
        try {
            this.settings.budgetAlerts = enabled;
            await this.saveSettings();
            this.showNotification(`Alertas de orçamento ${enabled ? 'ativados' : 'desativados'}`, 'success');
        } catch (error) {
            console.error('Error toggling budget alerts:', error);
            this.showNotification('Erro ao alterar alertas de orçamento', 'error');
        }
    }

    async toggleGoalAlerts(enabled) {
        try {
            this.settings.goalAlerts = enabled;
            await this.saveSettings();
            this.showNotification(`Alertas de metas ${enabled ? 'ativados' : 'desativados'}`, 'success');
        } catch (error) {
            console.error('Error toggling goal alerts:', error);
            this.showNotification('Erro ao alterar alertas de metas', 'error');
        }
    }

    async changeBackupFrequency(frequency) {
        try {
            this.settings.backupFrequency = frequency;
            await this.saveSettings();
            this.setupAutoBackup();
            this.showNotification('Frequência de backup alterada', 'success');
        } catch (error) {
            console.error('Error changing backup frequency:', error);
            this.showNotification('Erro ao alterar frequência de backup', 'error');
        }
    }

    async toggleModule(moduleName, enabled) {
        try {
            this.settings.modules[moduleName] = enabled;
            await this.saveSettings();
            this.applyModuleVisibility();
            
            const moduleDisplayName = {
                transactions: 'Transações',
                categories: 'Categorias',
                budget: 'Orçamento',
                goals: 'Metas',
                reports: 'Relatórios',
                planning: 'Planejamento',
                investments: 'Investimentos',
                notifications: 'Notificações',
                comparison: 'Comparação'
            };
            
            const displayName = moduleDisplayName[moduleName] || moduleName;
            this.showNotification(`Módulo ${displayName} ${enabled ? 'ativado' : 'desativado'}`, 'success');
        } catch (error) {
            console.error('Error toggling module:', error);
            this.showNotification('Erro ao alterar módulo', 'error');
        }
    }

    setupAutoBackup() {
        console.log('Auto backup setup');
    }

    async backupNow() {
        try {
            await this.exportData();
            this.showNotification('Backup realizado com sucesso!', 'success');
        } catch (error) {
            this.showNotification('Erro ao realizar backup', 'error');
        }
    }

    checkNotifications() {
        console.log('Notifications checked');
    }

    async checkBudgetAlerts() {
        return [];
    }

    async checkGoalAlerts() {
        return [];
    }

    // Load functions for different sections
    async loadTransactions() {
        console.log('Loading transactions');
    }

    async loadCategories() {
        console.log('Loading categories');
    }

    async loadBudgets() {
        console.log('Loading budgets');
    }

    async loadGoals() {
        console.log('Loading goals');
    }

    async loadReports() {
        console.log('Loading reports');
    }

    loadPlanning() {
        console.log('Loading planning');
    }

    async loadInvestments() {
        console.log('Loading investments');
    }

    async loadNotifications() {
        console.log('Loading notifications');
    }

    loadComparison() {
        console.log('Loading comparison');
    }

    // Calculator functions
    calculateSavings() {
        const amount = parseFloat(document.getElementById('savingsAmount').value) || 0;
        const rate = parseFloat(document.getElementById('interestRate').value) / 100 || 0;
        const period = parseInt(document.getElementById('savingsPeriod').value) || 0;

        let futureValue = 0;
        for (let i = 1; i <= period; i++) {
            futureValue += amount * Math.pow(1 + rate, period - i + 1);
        }

        const totalInvested = amount * period;
        const totalInterest = futureValue - totalInvested;

        const resultElement = document.getElementById('savingsResult');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="result-item">
                    <strong>Valor Futuro:</strong> ${this.formatCurrency(futureValue)}
                </div>
                <div class="result-item">
                    <strong>Total Investido:</strong> ${this.formatCurrency(totalInvested)}
                </div>
                <div class="result-item">
                    <strong>Juros Ganhos:</strong> ${this.formatCurrency(totalInterest)}
                </div>
            `;
        }
    }

    calculateLoan() {
        const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
        const rate = parseFloat(document.getElementById('loanRate').value) / 100 || 0;
        const period = parseInt(document.getElementById('loanPeriod').value) || 0;

        if (rate === 0) {
            const payment = amount / period;
            const resultElement = document.getElementById('loanResult');
            if (resultElement) {
                resultElement.innerHTML = `
                    <div class="result-item">
                        <strong>Parcela Mensal:</strong> ${this.formatCurrency(payment)}
                    </div>
                    <div class="result-item">
                        <strong>Total a Pagar:</strong> ${this.formatCurrency(amount)}
                    </div>
                `;
            }
            return;
        }

        const payment = amount * (rate * Math.pow(1 + rate, period)) / (Math.pow(1 + rate, period) - 1);
        const totalPayment = payment * period;
        const totalInterest = totalPayment - amount;

        const resultElement = document.getElementById('loanResult');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="result-item">
                    <strong>Parcela Mensal:</strong> ${this.formatCurrency(payment)}
                </div>
                <div class="result-item">
                    <strong>Total a Pagar:</strong> ${this.formatCurrency(totalPayment)}
                </div>
                <div class="result-item">
                    <strong>Total de Juros:</strong> ${this.formatCurrency(totalInterest)}
                </div>
            `;
        }
    }

    calculateRetirement() {
        const currentAge = parseInt(document.getElementById('currentAge').value) || 0;
        const retirementAge = parseInt(document.getElementById('retirementAge').value) || 0;
        const monthlyDesired = parseFloat(document.getElementById('monthlyRetirement').value) || 0;

        const yearsToRetirement = retirementAge - currentAge;
        const monthsToRetirement = yearsToRetirement * 12;

        // Assume 0.8% monthly return and 25 years of retirement
        const monthlyReturn = 0.008;
        const retirementYears = 25;

        // Calculate required capital for retirement
        const requiredCapital = monthlyDesired * ((1 - Math.pow(1 + monthlyReturn, -retirementYears * 12)) / monthlyReturn);

        // Calculate monthly savings needed
        const monthlySavings = requiredCapital / (((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn));

        const resultElement = document.getElementById('retirementResult');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="result-item">
                    <strong>Capital Necessário:</strong> ${this.formatCurrency(requiredCapital)}
                </div>
                <div class="result-item">
                    <strong>Economizar Mensalmente:</strong> ${this.formatCurrency(monthlySavings)}
                </div>
                <div class="result-item">
                    <strong>Tempo até Aposentadoria:</strong> ${yearsToRetirement} anos
                </div>
            `;
        }
    }

    calculateInflation() {
        console.log('Calculate inflation');
    }

    calculateCompound() {
        console.log('Calculate compound');
    }

    calculateDiscount() {
        console.log('Calculate discount');
    }

    // Comparison functions
    compareCards() {
        console.log('Compare cards');
    }

    compareInvestments() {
        console.log('Compare investments');
    }

    compareLoans() {
        console.log('Compare loans');
    }

    // Export/Import functions
    async exportData() {
        try {
            const data = {
                transactions: await this.getAllRecords('transactions'),
                categories: await this.getAllRecords('categories'),
                budgets: await this.getAllRecords('budgets'),
                goals: await this.getAllRecords('goals'),
                investments: await this.getAllRecords('investments'),
                reminders: await this.getAllRecords('reminders'),
                settings: await this.getAllRecords('settings'),
                exportDate: new Date().toISOString(),
                version: '2.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification('Dados exportados com sucesso!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Erro ao exportar dados', 'error');
        }
    }

    importData() {
        console.log('Import data');
    }

    async clearAllData(confirm = true) {
        if (confirm && !window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const stores = ['transactions', 'categories', 'budgets', 'goals', 'investments', 'reminders', 'settings'];
            for (const store of stores) {
                const records = await this.getAllRecords(store);
                for (const record of records) {
                    await this.deleteRecord(store, record.id);
                }
            }

            if (confirm) {
                this.showNotification('Todos os dados foram limpos!', 'success');
                await this.loadDefaultCategories();
                this.settings = {
                    darkMode: false,
                    currency: 'BRL',
                    budgetAlerts: true,
                    goalAlerts: true,
                    backupFrequency: 'weekly',
                    modules: {
                        transactions: true,
                        categories: true,
                        budget: true,
                        goals: true,
                        reports: true,
                        planning: true,
                        investments: true,
                        notifications: true,
                        comparison: true
                    }
                };
                this.applySettings();
                this.updateDashboard();
            }
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showNotification('Erro ao limpar dados', 'error');
        }
    }

    // Form population functions (placeholders)
    populateTransactionForm(transaction) {
        console.log('Populate transaction form', transaction);
    }

    populateCategoryForm(category) {
        console.log('Populate category form', category);
    }

    populateBudgetForm(budget) {
        console.log('Populate budget form', budget);
    }

    populateGoalForm(goal) {
        console.log('Populate goal form', goal);
    }

    populateInvestmentForm(investment) {
        console.log('Populate investment form', investment);
    }

    populateReminderForm(reminder) {
        console.log('Populate reminder form', reminder);
    }

    // Filter function
    async filterTransactions() {
        console.log('Filter transactions');
    }

    // Generate report function
    async generateReport() {
        console.log('Generate report');
    }
}

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.financeManager = new FinanceManager();
    } catch (error) {
        console.error('Error initializing FinanceManager:', error);
    }
});

// Add enhanced CSS animations and styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .badge-income { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
    .badge-expense { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
    .text-success { color: #10b981 !important; }
    .text-danger { color: #ef4444 !important; }
    .text-warning { color: #f59e0b !important; }
    .text-muted { color: #6b7280 !important; }

    .tag {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        background-color: rgba(37, 99, 235, 0.1);
        color: #2563eb;
        border-radius: 9999px;
        font-size: 0.75rem;
        margin-right: 0.25rem;
        margin-bottom: 0.25rem;
    }

    .transaction-tags {
        margin-top: 0.25rem;
    }

    .calc-row {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .calc-row label {
        font-weight: 500;
        color: var(--text-primary);
    }

    .calc-row input {
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        font-size: 0.875rem;
    }

    .calc-result {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: var(--radius);
    }

    .result-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .result-item:last-child {
        border-bottom: none;
    }

    @media (max-width: 768px) {
        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            visibility: hidden;
            transition: var(--transition);
        }

        .sidebar-overlay.active {
            opacity: 1;
            visibility: visible;
        }
    }
`;
document.head.appendChild(style);
