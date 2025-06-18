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
                notifications: true
            }
        };
        this.notifications = [];
        this.init();
    }

    // Initialize the application
    async init() {
        await this.initDatabase();
        this.loadSettings();
        this.setupEventListeners();
        this.loadDefaultCategories();
        this.showSection('dashboard');
        this.updateDashboard();
        this.setupAutoBackup();
        this.checkNotifications();
        this.setupMobileFeatures();
    }

    // Setup mobile features
    setupMobileFeatures() {
        // Add mobile menu toggle to header
        const headerControls = document.querySelector('.header-controls');
        if (headerControls && !document.querySelector('.mobile-menu-toggle')) {
            const mobileToggle = document.createElement('button');
            mobileToggle.className = 'mobile-menu-toggle';
            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            headerControls.insertBefore(mobileToggle, headerControls.firstChild);

            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Add sidebar overlay for mobile
        if (!document.querySelector('.sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);

            overlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // Handle swipe gestures on mobile
        this.setupSwipeGestures();
    }

    // Mobile menu methods
    setupMobileMenu() {
        // Setup mobile menu toggle click handler
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mobile-menu-toggle')) {
                this.toggleMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
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

    // Resize charts for responsive behavior
    resizeCharts() {
        try {
            if (this.charts.line && typeof this.charts.line.resize === 'function') {
                this.charts.line.resize();
            }
            if (this.charts.pie && typeof this.charts.pie.resize === 'function') {
                this.charts.pie.resize();
            }
            if (this.charts.trend && typeof this.charts.trend.resize === 'function') {
                this.charts.trend.resize();
            }
            if (this.charts.cashFlow && typeof this.charts.cashFlow.resize === 'function') {
                this.charts.cashFlow.resize();
            }
            if (this.charts.seasonal && typeof this.charts.seasonal.resize === 'function') {
                this.charts.seasonal.resize();
            }
            if (this.charts.investment && typeof this.charts.investment.resize === 'function') {
                this.charts.investment.resize();
            }
        } catch (error) {
            console.error('Erro ao redimensionar gráficos:', error);
        }
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

    // Enhanced IndexedDB Setup
    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FinanceManagerDB', 2);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
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
            };
        });
    }

    // Database operations
    async addRecord(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.add(data);
    }

    async updateRecord(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.put(data);
    }

    async deleteRecord(storeName, id) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return store.delete(id);
    }

    async getAllRecords(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getRecordsByIndex(storeName, indexName, value) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Enhanced Event Listeners Setup
    setupEventListeners() {
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
        document.getElementById('transactionForm').addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.handleCategorySubmit(e));
        document.getElementById('budgetForm').addEventListener('submit', (e) => this.handleBudgetSubmit(e));
        document.getElementById('goalForm').addEventListener('submit', (e) => this.handleGoalSubmit(e));
        document.getElementById('investmentForm').addEventListener('submit', (e) => this.handleInvestmentSubmit(e));
        document.getElementById('reminderForm').addEventListener('submit', (e) => this.handleReminderSubmit(e));

        // Button clicks
        document.getElementById('addTransactionBtn').addEventListener('click', () => this.openTransactionModal());
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('addBudgetBtn').addEventListener('click', () => this.openBudgetModal());
        document.getElementById('addGoalBtn').addEventListener('click', () => this.openGoalModal());
        document.getElementById('addInvestmentBtn').addEventListener('click', () => this.openInvestmentModal());
        document.getElementById('addReminderBtn').addEventListener('click', () => this.openReminderModal());

        // Filters
        document.getElementById('periodFilter').addEventListener('change', () => this.updateDashboard());
        // document.getElementById('analyticsRange').addEventListener('change', () => this.loadAnalytics());

        if (document.getElementById('searchTransactions')) {
            document.getElementById('searchTransactions').addEventListener('input', () => this.filterTransactions());
            document.getElementById('categoryFilter').addEventListener('change', () => this.filterTransactions());
            document.getElementById('typeFilter').addEventListener('change', () => this.filterTransactions());
        }

        // Calculators
        document.getElementById('calculateSavings').addEventListener('click', () => this.calculateSavings());
        document.getElementById('calculateLoan').addEventListener('click', () => this.calculateLoan());
        document.getElementById('calculateRetirement').addEventListener('click', () => this.calculateRetirement());

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => this.importData());
        document.getElementById('clearDataBtn').addEventListener('click', () => this.clearAllData());
        document.getElementById('backupNowBtn').addEventListener('click', () => this.backupNow());

        // Settings
        document.getElementById('darkModeToggle').addEventListener('change', (e) => this.toggleDarkMode(e.target.checked));
        document.getElementById('currencySelect').addEventListener('change', (e) => this.changeCurrency(e.target.value));
        document.getElementById('budgetAlertsToggle').addEventListener('change', (e) => this.toggleBudgetAlerts(e.target.checked));
        document.getElementById('goalAlertsToggle').addEventListener('change', (e) => this.toggleGoalAlerts(e.target.checked));
        document.getElementById('backupFrequency').addEventListener('change', (e) => this.changeBackupFrequency(e.target.value));

        // Module Settings
        document.getElementById('enableTransactions').addEventListener('change', (e) => this.toggleModule('transactions', e.target.checked));
        document.getElementById('enableCategories').addEventListener('change', (e) => this.toggleModule('categories', e.target.checked));
        document.getElementById('enableBudget').addEventListener('change', (e) => this.toggleModule('budget', e.target.checked));
        document.getElementById('enableGoals').addEventListener('change', (e) => this.toggleModule('goals', e.target.checked));
        document.getElementById('enableReports').addEventListener('change', (e) => this.toggleModule('reports', e.target.checked));
        document.getElementById('enablePlanning').addEventListener('change', (e) => this.toggleModule('planning', e.target.checked));
        document.getElementById('enableInvestments').addEventListener('change', (e) => this.toggleModule('investments', e.target.checked));
        document.getElementById('enableNotifications').addEventListener('change', (e) => this.toggleModule('notifications', e.target.checked));

        // Reports
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());

        // Set default dates
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('reportMonth').value = new Date().toISOString().substr(0, 7);
        document.getElementById('budgetMonth').value = new Date().toISOString().substr(0, 7);
        document.getElementById('investmentDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('reminderDate').value = new Date().toISOString().split('T')[0];
    }

    // Enhanced Navigation
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'transactions':
                if(this.settings.modules.transactions) this.loadTransactions();
                break;
            case 'categories':
                if(this.settings.modules.categories) this.loadCategories();
                break;
            case 'budget':
                if(this.settings.modules.budget) this.loadBudgets();
                break;
            case 'goals':
                 if(this.settings.modules.goals) this.loadGoals();
                break;
            case 'reports':
                 if(this.settings.modules.reports) this.loadReports();
                break;
            case 'planning':
                 if(this.settings.modules.planning) this.loadPlanning();
                break;
            case 'investments':
                 if(this.settings.modules.investments) this.loadInvestments();
                break;
            case 'notifications':
                if(this.settings.modules.notifications) this.loadNotifications();
                break;
        }
    }

    // Modal Management
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        // Reset forms and clear edit IDs
        const form = document.querySelector(`#${modalId} form`);
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }
    }

    openTransactionModal(transaction = null) {
        this.populateCategorySelect('transactionCategory');
        if (transaction) {
            document.getElementById('transactionModalTitle').textContent = 'Editar Transação';
            this.populateTransactionForm(transaction);
        } else {
            document.getElementById('transactionModalTitle').textContent = 'Nova Transação';
            document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
        }
        this.openModal('transactionModal');
    }

    openInvestmentModal(investment = null) {
        if (investment) {
            document.getElementById('investmentModalTitle').textContent = 'Editar Investimento';
            this.populateInvestmentForm(investment);
        } else {
            document.getElementById('investmentModalTitle').textContent = 'Novo Investimento';
            document.getElementById('investmentDate').value = new Date().toISOString().split('T')[0];
        }
        this.openModal('investmentModal');
    }

    openReminderModal(reminder = null) {
        if (reminder) {
            document.getElementById('reminderModalTitle').textContent = 'Editar Lembrete';
            this.populateReminderForm(reminder);
        } else {
            document.getElementById('reminderModalTitle').textContent = 'Novo Lembrete';
            document.getElementById('reminderDate').value = new Date().toISOString().split('T')[0];
        }
        this.openModal('reminderModal');
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
            document.getElementById('budgetMonth').value = new Date().toISOString().substr(0, 7);
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

    // Enhanced Form Handlers
    async handleTransactionSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

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

        try {
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
            this.showNotification(editId ? 'Erro ao atualizar transação' : 'Erro ao adicionar transação', 'error');
        }
    }

    async handleInvestmentSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        const investment = {
            name: document.getElementById('investmentName').value,
            type: document.getElementById('investmentType').value,
            amount: parseFloat(document.getElementById('investmentAmount').value),
            currentValue: parseFloat(document.getElementById('investmentCurrent').value),
            date: document.getElementById('investmentDate').value,
            timestamp: new Date().toISOString()
        };

        try {
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
            this.showNotification(editId ? 'Erro ao atualizar investimento' : 'Erro ao adicionar investimento', 'error');
        }
    }

    async handleReminderSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        const reminder = {
            title: document.getElementById('reminderTitle').value,
            description: document.getElementById('reminderDescription').value,
            date: document.getElementById('reminderDate').value,
            type: document.getElementById('reminderType').value,
            completed: false,
            timestamp: new Date().toISOString()
        };

        try {
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
            this.showNotification(editId ? 'Erro ao atualizar lembrete' : 'Erro ao adicionar lembrete', 'error');
        }
    }

    async handleCategorySubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        const category = {
            name: document.getElementById('categoryName').value,
            icon: document.getElementById('categoryIcon').value,
            color: document.getElementById('categoryColor').value,
            timestamp: new Date().toISOString()
        };

        try {
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
            this.showNotification(editId ? 'Erro ao atualizar categoria' : 'Erro ao adicionar categoria', 'error');
        }
    }

    async handleBudgetSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        const budget = {
            category: document.getElementById('budgetCategory').value,
            amount: parseFloat(document.getElementById('budgetAmount').value),
            month: document.getElementById('budgetMonth').value,
            timestamp: new Date().toISOString()
        };

        try {
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
            this.showNotification(editId ? 'Erro ao atualizar orçamento' : 'Erro ao adicionar orçamento', 'error');
        }
    }

    async handleGoalSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.dataset.editId;

        const goal = {
            name: document.getElementById('goalName').value,
            target: parseFloat(document.getElementById('goalTarget').value),
            current: parseFloat(document.getElementById('goalCurrent').value) || 0,
            deadline: document.getElementById('goalDeadline').value,
            timestamp: new Date().toISOString()
        };

        try {
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
            this.showNotification(editId ? 'Erro ao atualizar meta' : 'Erro ao adicionar meta', 'error');
        }
    }

    // Enhanced Dashboard Functions
    async updateDashboard() {
        const period = parseInt(document.getElementById('periodFilter').value);
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
    }

    updateSummaryCards(transactions) {
        const income = transactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;

        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('totalExpense').textContent = this.formatCurrency(expense);
        document.getElementById('totalBalance').textContent = this.formatCurrency(balance);

        // Calculate changes (simplified)
        document.getElementById('incomeChange').textContent = '+0%';
        document.getElementById('expenseChange').textContent = '+0%';
        document.getElementById('balanceChange').textContent = '0%';

        // Update balance change class
        const balanceElement = document.getElementById('balanceChange');
        balanceElement.className = balance >= 0 ? 'change positive' : 'change negative';
    }

    async updateCharts(transactions) {
        this.updateLineChart(transactions);
        this.updatePieChart(transactions);
    }

    updateLineChart(transactions) {
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
    }

    async updatePieChart(transactions) {
        const canvas = document.getElementById('pieChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set safe canvas dimensions
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth || 400;
        const containerHeight = 300;

        // Set actual canvas size in pixels
        canvas.width = Math.min(containerWidth - 32, 800);
        canvas.height = Math.min(containerHeight, 400);

        // Set display size via CSS
        canvas.style.width = Math.min(containerWidth - 32, 800) + 'px';
        canvas.style.height = Math.min(containerHeight, 400) + 'px';

        // Destroy existing chart
        if (this.charts.pie) {
            this.charts.pie.destroy();
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
        const colors = labels.map(label => categoryMap[label] || '#64748b');

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
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(context.parsed)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    async updateRecentTransactions(transactions) {
        const container = document.getElementById('recentTransactionsList');
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
    }

    // Planning Functions
    loadPlanning() {
        // Planning functions are already set up in HTML and event listeners
    }

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

        document.getElementById('savingsResult').innerHTML = `
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

    calculateLoan() {
        const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
        const rate = parseFloat(document.getElementById('loanRate').value) / 100 || 0;
        const period = parseInt(document.getElementById('loanPeriod').value) || 0;

        if (rate === 0) {
            const payment = amount / period;
            document.getElementById('loanResult').innerHTML = `
                <div class="result-item">
                    <strong>Parcela Mensal:</strong> ${this.formatCurrency(payment)}
                </div>
                <div class="result-item">
                    <strong>Total a Pagar:</strong> ${this.formatCurrency(amount)}
                </div>
            `;
            return;
        }

        const payment = amount * (rate * Math.pow(1 + rate, period)) / (Math.pow(1 + rate, period) - 1);
        const totalPayment = payment * period;
        const totalInterest = totalPayment - amount;

        document.getElementById('loanResult').innerHTML = `
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

        document.getElementById('retirementResult').innerHTML = `
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

    // Investment Functions
    async loadInvestments() {
        const investments = await this.getAllRecords('investments');
        this.displayInvestments(investments);
        this.updateInvestmentSummary(investments);
        this.updateInvestmentChart(investments);
    }

    displayInvestments(investments) {
        const container = document.getElementById('investmentsList');

        if (investments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-coins"></i>
                    <h3>Nenhum investimento encontrado</h3>
                    <p>Adicione seus investimentos para acompanhar a rentabilidade</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="investments-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Valor Investido</th>
                            <th>Valor Atual</th>
                            <th>Rentabilidade</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${investments.map(investment => {
                            const profit = investment.currentValue - investment.amount;
                            const profitPercentage = ((profit / investment.amount) * 100);
                            return `
                                <tr>
                                    <td>${investment.name}</td>
                                    <td>
                                        <span class="badge badge-${investment.type}">${this.getInvestmentTypeLabel(investment.type)}</span>
                                    </td>
                                    <td>${this.formatCurrency(investment.amount)}</td>
                                    <td>${this.formatCurrency(investment.currentValue)}</td>
                                    <td class="${profit >= 0 ? 'text-success' : 'text-danger'}">
                                        ${this.formatCurrency(profit)} (${profitPercentage.toFixed(2)}%)
                                    </td>
                                    <td>${this.formatDate(investment.date)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-secondary" onclick="financeManager.editInvestment(${investment.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="financeManager.deleteInvestment(${investment.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    updateInvestmentSummary(investments) {
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalReturn = currentValue - totalInvested;
        const returnPercentage = totalInvested > 0 ? ((totalReturn / totalInvested) * 100) : 0;

        document.getElementById('totalInvested').textContent = this.formatCurrency(totalInvested);
        document.getElementById('currentValue').textContent = this.formatCurrency(currentValue);
        document.getElementById('totalReturn').textContent = this.formatCurrency(totalReturn);
        document.getElementById('returnPercentage').textContent = `${returnPercentage.toFixed(2)}%`;

        // Update colors
        document.getElementById('totalReturn').className = `value ${totalReturn >= 0 ? 'text-success' : 'text-danger'}`;
        document.getElementById('returnPercentage').className = `value ${returnPercentage >= 0 ? 'text-success' : 'text-danger'}`;
    }

    updateInvestmentChart(investments) {
        const canvas = document.getElementById('investmentChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Set safe canvas dimensions
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth || 400;
        const containerHeight = 300;

        canvas.width = Math.min(containerWidth - 32, 800);
        canvas.height = Math.min(containerHeight, 400);
        canvas.style.width = Math.min(containerWidth - 32, 800) + 'px';
        canvas.style.height = Math.min(containerHeight, 400) + 'px';

        if (this.charts.investment) {
            this.charts.investment.destroy();
        }

        // Group by type
        const typeData = {};
        investments.forEach(inv => {
            if (!typeData[inv.type]) {
                typeData[inv.type] = 0;
            }
            typeData[inv.type] += inv.currentValue;
        });

        const labels = Object.keys(typeData).map(type => this.getInvestmentTypeLabel(type));
        const data = Object.values(typeData);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

        this.charts.investment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
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
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(context.parsed)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    getInvestmentTypeLabel(type) {
        const labels = {
            'stocks': 'Ações',
            'funds': 'Fundos',
            'crypto': 'Criptomoedas',
            'bonds': 'Títulos',
            'savings': 'Poupança',
            'other': 'Outros'
        };
        return labels[type] || type;
    }

    async deleteInvestment(id) {
        if (confirm('Tem certeza que deseja excluir este investimento?')) {
            try {
                await this.deleteRecord('investments', id);
                this.showNotification('Investimento excluído com sucesso!', 'success');
                this.loadInvestments();
            } catch (error) {
                this.showNotification('Erro ao excluir investimento', 'error');
            }
        }
    }

    // Notification Functions
    async loadNotifications() {
        const reminders = await this.getAllRecords('reminders');
        this.displayReminders(reminders);
        this.displayAlerts();
    }

    displayReminders(reminders) {
        const container = document.getElementById('remindersList');

        if (reminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <h3>Nenhum lembrete encontrado</h3>
                    <p>Adicione lembretes para não esquecer de suas tarefas financeiras</p>
                </div>
            `;
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const sortedReminders = reminders.sort((a, b) => new Date(a.date) - new Date(b.date));

        container.innerHTML = sortedReminders.map(reminder => {
            const isOverdue = reminder.date < today && !reminder.completed;
            const isToday = reminder.date === today;

            return `
                <div class="reminder-item ${reminder.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isToday ? 'today' : ''}">
                    <div class="reminder-content">
                        <h4>${reminder.title}</h4>
                        <p>${reminder.description}</p>
                        <div class="reminder-meta">
                            <span class="reminder-date">${this.formatDate(reminder.date)}</span>
                            <span class="reminder-type badge badge-${reminder.type}">${this.getReminderTypeLabel(reminder.type)}</span>
                        </div>
                    </div>
                    <div class="reminder-actions">
                        <button class="btn btn-sm ${reminder.completed ? 'btn-secondary' : 'btn-success'}" 
                                onclick="financeManager.toggleReminder(${reminder.id})">
                            <i class="fas fa-${reminder.completed ? 'undo' : 'check'}"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="financeManager.deleteReminder(${reminder.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async displayAlerts() {
        const alerts = [];

        // Check budget alerts
        if (this.settings.budgetAlerts) {
            const budgetAlerts = await this.checkBudgetAlerts();
            alerts.push(...budgetAlerts);
        }

        // Check goal alerts
        if (this.settings.goalAlerts) {
            const goalAlerts = await this.checkGoalAlerts();
            alerts.push(...goalAlerts);
        }

        const container = document.getElementById('alertsList');

        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="alert-item alert-success">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <h4>Tudo em ordem!</h4>
                        <p>Não há alertas no momento</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.type}">
                <i class="fas fa-${alert.icon}"></i>
                <div>
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                </div>
            </div>
        `).join('');
    }

    async checkBudgetAlerts() {
        const alerts = [];
        const budgets = await this.getAllRecords('budgets');
        const transactions = await this.getAllRecords('transactions');
        const currentMonth = new Date().toISOString().substr(0, 7);

        budgets.forEach(budget => {
            if (budget.month === currentMonth) {
                const monthTransactions = transactions.filter(t => 
                    t.type === 'expense' && 
                    t.category === budget.category &&
                    t.date.startsWith(budget.month)
                );

                const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
                const percentage = (spent / budget.amount) * 100;

                if (percentage >= 100) {
                    alerts.push({
                        type: 'danger',
                        icon: 'exclamation-triangle',
                        title: 'Orçamento Estourado',
                        message: `Categoria "${budget.category}" excedeu o orçamento em ${this.formatCurrency(spent - budget.amount)}`
                    });
                } else if (percentage >= 80) {
                    alerts.push({
                        type: 'warning',
                        icon: 'exclamation-circle',
                        title: 'Orçamento Quase Estourado',
                        message: `Categoria "${budget.category}" está em ${percentage.toFixed(1)}% do orçamento`
                    });
                }
            }
        });

        return alerts;
    }

    async checkGoalAlerts() {
        const alerts = [];
        const goals = await this.getAllRecords('goals');
        const today = new Date();

        goals.forEach(goal => {
            const deadline = new Date(goal.deadline);
            const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            const percentage = (goal.current / goal.target) * 100;

            if (daysLeft <= 0 && percentage < 100) {
                alerts.push({
                    type: 'danger',
                    icon: 'calendar-times',
                    title: 'Meta Vencida',
                    message: `Meta "${goal.name}" venceu e está ${percentage.toFixed(1)}% completa`
                });
            } else if (daysLeft <= 30 && percentage < 50) {
                alerts.push({
                    type: 'warning',
                    icon: 'clock',
                    title: 'Meta em Risco',
                    message: `Meta "${goal.name}" tem ${daysLeft} dias restantes e está apenas ${percentage.toFixed(1)}% completa`
                });
            }
        });

        return alerts;
    }

    getReminderTypeLabel(type) {
        const labels = {
            'payment': 'Pagamento',
            'income': 'Recebimento',
            'investment': 'Investimento',
            'review': 'Revisão',
            'other': 'Outro'
        };
        return labels[type] || type;
    }

    async toggleReminder(id) {
        try {
            const reminders = await this.getAllRecords('reminders');
            const reminder = reminders.find(r => r.id === id);
            if (reminder) {
                reminder.completed = !reminder.completed;
                await this.updateRecord('reminders', reminder);
                this.loadNotifications();
                this.showNotification(
                    reminder.completed ? 'Lembrete marcado como concluído!' : 'Lembrete reativado!',
                    'success'
                );
            }
        } catch (error) {
            this.showNotification('Erro ao atualizar lembrete', 'error');
        }
    }

    async deleteReminder(id) {
        if (confirm('Tem certeza que deseja excluir este lembrete?')) {
            try {
                await this.deleteRecord('reminders', id);
                this.showNotification('Lembrete excluído com sucesso!', 'success');
                this.loadNotifications();
            } catch (error) {
                this.showNotification('Erro ao excluir lembrete', 'error');
            }
        }
    }

    // Settings Functions
    async loadSettings() {
        try {
            const settings = await this.getAllRecords('settings');
            settings.forEach(setting => {
                this.settings[setting.key] = setting.value;
            });
            this.applySettings();
        } catch (error) {
            // Use default settings
        }
    }

    async saveSettings() {
        for (const [key, value] of Object.entries(this.settings)) {
            await this.updateRecord('settings', { key, value });
        }
    }

    applySettings() {
        document.getElementById('darkModeToggle').checked = this.settings.darkMode;
        document.getElementById('currencySelect').value = this.settings.currency;
        document.getElementById('budgetAlertsToggle').checked = this.settings.budgetAlerts;
        document.getElementById('goalAlertsToggle').checked = this.settings.goalAlerts;
        document.getElementById('backupFrequency').value = this.settings.backupFrequency;

        // Module settings
        document.getElementById('enableTransactions').checked = this.settings.modules.transactions;
        document.getElementById('enableCategories').checked = this.settings.modules.categories;
        document.getElementById('enableBudget').checked = this.settings.modules.budget;
        document.getElementById('enableGoals').checked = this.settings.modules.goals;
        document.getElementById('enableReports').checked = this.settings.modules.reports;
        document.getElementById('enablePlanning').checked = this.settings.modules.planning;
        document.getElementById('enableInvestments').checked = this.settings.modules.investments;
        document.getElementById('enableNotifications').checked = this.settings.modules.notifications;

        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        }

        // Apply CSS based on module settings
        this.applyModuleCSS();
    }

    async toggleDarkMode(enabled) {
        this.settings.darkMode = enabled;
        await this.saveSettings();

        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    async changeCurrency(currency) {
        this.settings.currency = currency;
        await this.saveSettings();
        // Refresh current view to update currency display
        this.showSection(this.currentSection);
    }

    async toggleBudgetAlerts(enabled) {
        this.settings.budgetAlerts = enabled;
        await this.saveSettings();
    }

    async toggleGoalAlerts(enabled) {
        this.settings.goalAlerts = enabled;
        await this.saveSettings();
    }

    async changeBackupFrequency(frequency) {
        this.settings.backupFrequency = frequency;
        await this.saveSettings();
        this.setupAutoBackup();
    }

     async toggleModule(moduleName, enabled) {
        this.settings.modules[moduleName] = enabled;
        await this.saveSettings();
        this.applyModuleCSS();
        this.showSection('dashboard'); // Refresh current view
    }

    applyModuleCSS() {
        const styleId = 'module-style';
        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        let css = '';
        for (const module in this.settings.modules) {
            if (!this.settings.modules[module]) {
                css += `.nav-link[data-section="${module}"] { display: none !important; } `;
                css += `#${module} { display: none !important; } `;
                css += `.nav-menu li:has(.nav-link[data-section="${module}"]) { display: none !important; } `;
            } else {
                css += `.nav-link[data-section="${module}"] { display: flex !important; } `;
                css += `.nav-menu li:has(.nav-link[data-section="${module}"]) { display: block !important; } `;
            }
        }
        styleElement.textContent = css;
    }

    // Backup Functions
    setupAutoBackup() {
        // Clear existing backup timer
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
        }

        if (this.settings.backupFrequency === 'never') {
            return;
        }

        const intervals = {
            'daily': 24 * 60 * 60 * 1000,
            'weekly': 7 * 24 * 60 * 60 * 1000,
            'monthly': 30 * 24 * 60 * 60 * 1000
        };

        const interval = intervals[this.settings.backupFrequency];
        if (interval) {
            this.backupTimer = setInterval(() => {
                this.backupNow();
            }, interval);
        }
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
        // Check for due reminders
        this.checkDueReminders();

        // Set up periodic checks
        setInterval(() => {
            this.checkDueReminders();
        }, 60000); // Check every minute
    }

    async checkDueReminders() {
        const reminders = await this.getAllRecords('reminders');
        const today = new Date().toISOString().split('T')[0];

        const dueReminders = reminders.filter(r => 
            r.date === today && !r.completed
        );

        dueReminders.forEach(reminder => {
            this.showNotification(
                `Lembrete: ${reminder.title}`,
                'info'
            );
        });
    }

    // Enhanced Transactions Management
    async loadTransactions() {
        const transactions = await this.getAllRecords('transactions');
        const categories = await this.getAllRecords('categories');

        this.populateCategoryFilter(categories);
        this.displayTransactions(transactions);
    }

    displayTransactions(transactions) {
        const container = document.getElementById('transactionsTable');

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>Nenhuma transação encontrada</h3>
                    <p>Adicione sua primeira transação para começar</p>
                </div>
            `;
            return;
        }

        // Sort transactions by date (newest first)
        const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Tags</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTransactions.map(transaction => `
                        <tr>
                            <td>${this.formatDate(transaction.date)}</td>
                            <td>
                                ${transaction.description}
                                ${transaction.notes ? `<br><small class="text-muted">${transaction.notes}</small>` : ''}
                            </td>
                            <td>${transaction.category}</td>
                            <td>
                                ${transaction.tags && transaction.tags.length > 0 ? 
                                    transaction.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ') : 
                                    '<span class="text-muted">-</span>'}
                            </td>
                            <td>
                                <span class="badge badge-${transaction.type}">
                                    ${transaction.type === 'income' ? 'Receita' : 'Despesa'}
                                </span>
                            </td>
                            <td class="transaction-amount ${transaction.type}">
                                ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                            </td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick="financeManager.editTransaction(${transaction.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="financeManager.deleteTransaction(${transaction.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async filterTransactions() {
        const searchTerm = document.getElementById('searchTransactions').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;

        let transactions = await this.getAllRecords('transactions');

        if (searchTerm) {
            transactions = transactions.filter(t => 
                t.description.toLowerCase().includes(searchTerm) ||
                t.category.toLowerCase().includes(searchTerm) ||
                (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                (t.notes && t.notes.toLowerCase().includes(searchTerm))
            );
        }

        if (categoryFilter) {
            transactions = transactions.filter(t => t.category === categoryFilter);
        }

        if (typeFilter) {
            transactions = transactions.filter(t => t.type === typeFilter);
        }

        this.displayTransactions(transactions);
    }

    async deleteTransaction(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
                await this.deleteRecord('transactions', id);
                this.showNotification('Transação excluída com sucesso!', 'success');
                this.loadTransactions();
                this.updateDashboard();
            } catch (error) {
                this.showNotification('Erro ao excluir transação', 'error');
            }
        }
    }

    // Enhanced Categories Management
    async loadCategories() {
        const categories = await this.getAllRecords('categories');
        this.displayCategories(categories);
    }

    displayCategories(categories) {
        const container = document.getElementById('categoriesGrid');

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>Nenhuma categoria encontrada</h3>
                    <p>Adicione categorias para organizar suas transações</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-icon" style="background-color: ${category.color}">
                        <i class="${category.icon}"></i>
                    </div>
                    <h4>${category.name}</h4>
                </div>
                <div class="category-actions">
                    <button class="btn btn-sm btn-secondary" onclick="financeManager.editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="financeManager.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async deleteCategory(id) {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            try {
                await this.deleteRecord('categories', id);
                this.showNotification('Categoria excluída com sucesso!', 'success');
                this.loadCategories();
            } catch (error) {
                this.showNotification('Erro ao excluir categoria', 'error');
            }
        }
    }

    // Enhanced Budget Management
    async loadBudgets() {
        const budgets = await this.getAllRecords('budgets');
        const transactions = await this.getAllRecords('transactions');
        const categories = await this.getAllRecords('categories');

        this.displayBudgets(budgets, transactions, categories);
    }

    displayBudgets(budgets, transactions, categories) {
        const container = document.getElementById('budgetOverview');

        if (budgets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-piggy-bank"></i>
                    <h3>Nenhum orçamento encontrado</h3>
                    <p>Defina orçamentos para controlar seus gastos</p>
                </div>
            `;
            return;
        }

        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat;
        });

        container.innerHTML = budgets.map(budget => {
            const monthTransactions = transactions.filter(t => 
                t.type === 'expense' && 
                t.category === budget.category &&
                t.date.startsWith(budget.month)
            );

            const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
            const percentage = (spent / budget.amount) * 100;
            const category = categoryMap[budget.category] || {};

            return `
                <div class="budget-item">
                    <div class="budget-header">
                        <div class="budget-info">
                            <div class="budget-icon" style="background-color: ${category.color || '#64748b'}">
                                <i class="${category.icon || 'fas fa-question'}"></i>
                            </div>
                            <div>
                                <h4>${budget.category}</h4>
                                <p>${this.formatMonth(budget.month)}</p>
                            </div>
                        </div>
                        <div class="budget-amount">
                            <span class="spent">${this.formatCurrency(spent)}</span>
                            <span class="total">de ${this.formatCurrency(budget.amount)}</span>
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar" style="width: ${Math.min(percentage, 100)}%; background-color: ${percentage > 100 ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#10b981'}"></div>
                    </div>
                    <div class="budget-stats">
                        <span>${percentage.toFixed(1)}% utilizado</span>
                        <span>Restante: ${this.formatCurrency(Math.max(budget.amount - spent, 0))}</span>
                    </div>
                    <div class="budget-actions">
                        <button class="btn btn-sm btn-secondary" onclick="financeManager.editBudget(${budget.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="financeManager.deleteBudget(${budget.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteBudget(id) {
        if (confirm('Tem certeza que deseja excluir este orçamento?')) {
            try {
                await this.deleteRecord('budgets', id);
                this.showNotification('Orçamento excluído com sucesso!', 'success');
                this.loadBudgets();
                this.updateDashboard();
            } catch (error) {
                this.showNotification('Erro ao excluir orçamento', 'error');
            }
        }
    }

    // Enhanced Goals Management
    async loadGoals() {
        const goals = await this.getAllRecords('goals');
        this.displayGoals(goals);
    }

    displayGoals(goals) {
        const container = document.getElementById('goalsGrid');

        if (goals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <h3>Nenhuma meta encontrada</h3>
                    <p>Defina metas para alcançar seus objetivos financeiros</p>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => {
            const percentage = (goal.current / goal.target) * 100;
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

            return `
                <div class="goal-card">
                    <div class="goal-header">
                        <h4>${goal.name}</h4>
                        <div class="goal-actions">
                            <button class="btn btn-sm btn-secondary" onclick="financeManager.editGoal(${goal.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="financeManager.deleteGoal(${goal.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background-color: ${percentage >= 100 ? '#10b981' : daysLeft < 0 ? '#ef4444' : '#2563eb'}"></div>
                        </div>
                    </div>
                    <div class="goal-stats">
                        <div>
                            <span class="current">${this.formatCurrency(goal.current)}</span>
                            <span class="target">de ${this.formatCurrency(goal.target)}</span>
                        </div>
                        <div class="goal-deadline">
                            <span class="${daysLeft < 30 ? (daysLeft < 0 ? 'text-danger' : 'text-warning') : ''}">${daysLeft < 0 ? 'Vencida' : `${daysLeft} dias restantes`}</span>
                        </div>
                    </div>
                    <div class="goal-percentage">
                        ${percentage.toFixed(1)}% concluído
                    </div>
                    <div class="goal-progress-actions">
                        <button class="btn btn-sm btn-primary" onclick="financeManager.updateGoalProgress(${goal.id})">
                            <i class="fas fa-plus"></i> Adicionar Progresso
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async updateGoalProgress(id) {
        const amount = prompt('Digite o valor a adicionar ao progresso da meta:');
        if (amount && !isNaN(amount)) {
            try {
                const goals = await this.getAllRecords('goals');
                const goal = goals.find(g => g.id === id);
                if (goal) {
                    goal.current += parseFloat(amount);
                    await this.updateRecord('goals', goal);
                    this.showNotification('Progresso da meta atualizado!', 'success');
                    this.loadGoals();
                }
            } catch (error) {
                this.showNotification('Erro ao atualizar progresso da meta', 'error');
            }
        }
    }

    async deleteGoal(id) {
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            try {
                await this.deleteRecord('goals', id);
                this.showNotification('Meta excluída com sucesso!', 'success');
                this.loadGoals();
            } catch (error) {
                this.showNotification('Erro ao excluir meta', 'error');
            }
        }
    }

    // Reports Functions
    loadReports() {
        // Set default month to current month
        const currentMonth = new Date().toISOString().substr(0, 7);
        document.getElementById('reportMonth').value = currentMonth;

        // Generate initial report
        this.generateReport();
    }

    // Enhanced Reports
    async generateReport() {
        const month = document.getElementById('reportMonth').value;
        const transactions = await this.getAllRecords('transactions');
        const monthTransactions = transactions.filter(t => t.date.startsWith(month));

        this.displayReport(monthTransactions, month);
    }

    displayReport(transactions, month) {
        const container = document.getElementById('reportsContainer');

        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;

        // Category breakdown
        const categoryBreakdown = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            if (!categoryBreakdown[t.category]) {
                categoryBreakdown[t.category] = 0;
            }
            categoryBreakdown[t.category] += t.amount;
        });

        // Tags analysis
        const tagAnalysis = {};
        transactions.forEach(t => {
            if (t.tags && t.tags.length > 0) {
                t.tags.forEach(tag => {
                    if (!tagAnalysis[tag]) {
                        tagAnalysis[tag] = { count: 0, amount: 0 };
                    }
                    tagAnalysis[tag].count++;
                    tagAnalysis[tag].amount += t.amount;
                });
            }
        });

        container.innerHTML = `
            <div class="report-summary">
                <div class="report-item">
                    <h4>Total de Receitas</h4>
                    <div class="value text-success">${this.formatCurrency(income)}</div>
                </div>
                <div class="report-item">
                    <h4>Total de Despesas</h4>
                    <div class="value text-danger">${this.formatCurrency(expense)}</div>
                </div>
                <div class="report-item">
                    <h4>Saldo Final</h4>
                    <div class="value ${balance >= 0 ? 'text-success' : 'text-danger'}">${this.formatCurrency(balance)}</div>
                </div>
                <div class="report-item">
                    <h4>Transações</h4>
                    <div class="value">${transactions.length}</div>
                </div>
            </div>

            <div class="report-details">
                <div class="report-section">
                    <h3>Despesas por Categoria</h3>
                    <div class="category-breakdown">
                        ${Object.entries(categoryBreakdown).map(([category, amount]) => `
                            <div class="breakdown-item">
                                <span class="category-name">${category}</span>
                                <span class="category-amount">${this.formatCurrency(amount)}</span>
                                <span class="category-percentage">${expense > 0 ? ((amount / expense) * 100).toFixed(1) : 0}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${Object.keys(tagAnalysis).length > 0 ? `
                    <div class="report-section">
                        <h3>Análise por Tags</h3>
                        <div class="tag-breakdown">
                            ${Object.entries(tagAnalysis).map(([tag, data]) => `
                                <div class="breakdown-item">
                                    <span class="tag-name">${tag}</span>
                                    <span class="tag-count">${data.count} transações</span>
                                    <span class="tag-amount">${this.formatCurrency(data.amount)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Enhanced Data Management
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
            this.showNotification('Erro ao exportar dados', 'error');
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const text = await file.text();
                const data = JSON.parse(text);

                // Validate data structure
                if (!data.version || !data.exportDate) {
                    throw new Error('Formato de arquivo inválido');
                }

                // Clear existing data
                await this.clearAllData(false);

                // Import new data
                const stores = ['categories', 'transactions', 'budgets', 'goals', 'investments', 'reminders', 'settings'];

                for (const store of stores) {
                    if (data[store]) {
                        for (const record of data[store]) {
                            delete record.id;
                            await this.addRecord(store, record);
                        }
                    }
                }

                this.showNotification('Dados importados com sucesso!', 'success');
                this.loadSettings();
                this.updateDashboard();
                this.showSection('dashboard');
            } catch (error) {
                this.showNotification('Erro ao importar dados: ' + error.message, 'error');
            }
        };
        input.click();
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
                        notifications: true
                    }
                };
                this.applySettings();
                this.updateDashboard();
                this.loadCategories();
            }
        } catch (error) {
            this.showNotification('Erro ao limpar dados', 'error');
        }
    }

    // Utility Functions
    async populateCategorySelect(selectId) {
        const categories = await this.getAllRecords('categories');
        const select = document.getElementById(selectId);

        select.innerHTML = '<option value="">Selecionar categoria</option>' +
            categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
    }

    populateCategoryFilter(categories) {
        const select = document.getElementById('categoryFilter');
        if (select) {
            select.innerHTML = '<option value="">Todas as categorias</option>' +
                categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
        }
    }

    async loadDefaultCategories() {
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

    // Edit Functions
    async editTransaction(id) {
        try {
            const transactions = await this.getAllRecords('transactions');
            const transaction = transactions.find(t => t.id === id);
            if (transaction) {
                this.openTransactionModal(transaction);
                this.populateTransactionForm(transaction);
            }
        } catch (error) {
            this.showNotification('Erro ao carregar transação', 'error');
        }
    }

    async editCategory(id) {
        try {
            const categories = await this.getAllRecords('categories');
            const category = categories.find(c => c.id === id);
            if (category) {
                this.openCategoryModal(category);
                this.populateCategoryForm(category);
            }
        } catch (error) {
            this.showNotification('Erro ao carregar categoria', 'error');
        }
    }

    async editBudget(id) {
        try {
            const budgets = await this.getAllRecords('budgets');
            const budget = budgets.find(b => b.id === id);
            if (budget) {
                this.openBudgetModal(budget);
                this.populateBudgetForm(budget);
            }
        } catch (error) {
            this.showNotification('Erro ao carregar orçamento', 'error');
        }
    }

    async editGoal(id) {
        try {
            const goals = await this.getAllRecords('goals');
            const goal = goals.find(g => g.id === id);
            if (goal) {
                this.openGoalModal(goal);
                this.populateGoalForm(goal);
            }
        } catch (error) {
            this.showNotification('Erro ao carregar meta', 'error');
        }
    }

    async editInvestment(id) {
        try {
            const investments = await this.getAllRecords('investments');
            const investment = investments.find(i => i.id === id);
            if (investment) {
                this.openInvestmentModal(investment);
                this.populateInvestmentForm(investment);
            }
        } catch (error) {
            this.showNotification('Erro ao carregar investimento', 'error');
        }
    }

    async editReminder(id) {
        try {
            const reminders = await this.getAllRecords('reminders');
            const reminder = reminders.find(r => r.id === id);
            if (reminder) {
                this.openReminderModal(reminder);
                this.populateReminderForm(reminder);
            }
        } catch (error) {
            this.showNotification('Erro ao carregar lembrete', 'error');
        }
    }

    // Form Population Functions
    populateTransactionForm(transaction) {
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionDescription').value = transaction.description;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDate').value = transaction.date;
        document.getElementById('transactionTags').value = transaction.tags ? transaction.tags.join(', ') : '';
        document.getElementById('transactionNotes').value = transaction.notes || '';

        // Store the ID for updating
        document.getElementById('transactionForm').dataset.editId = transaction.id;
    }

    populateCategoryForm(category) {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('categoryColor').value = category.color;

        document.getElementById('categoryForm').dataset.editId = category.id;
    }

    populateBudgetForm(budget) {
        document.getElementById('budgetCategory').value = budget.category;
        document.getElementById('budgetAmount').value = budget.amount;
        document.getElementById('budgetMonth').value = budget.month;

        document.getElementById('budgetForm').dataset.editId = budget.id;
    }

    populateGoalForm(goal) {
        document.getElementById('goalName').value = goal.name;
        document.getElementById('goalTarget').value = goal.target;
        document.getElementById('goalCurrent').value = goal.current;
        document.getElementById('goalDeadline').value = goal.deadline;

        document.getElementById('goalForm').dataset.editId = goal.id;
    }

    populateInvestmentForm(investment) {
        document.getElementById('investmentName').value = investment.name;
        document.getElementById('investmentType').value = investment.type;
        document.getElementById('investmentAmount').value = investment.amount;
        document.getElementById('investmentCurrent').value = investment.currentValue;
        document.getElementById('investmentDate').value = investment.date;

        document.getElementById('investmentForm').dataset.editId = investment.id;
    }

    populateReminderForm(reminder) {
        document.getElementById('reminderTitle').value = reminder.title;
        document.getElementById('reminderDescription').value = reminder.description;
        document.getElementById('reminderDate').value = reminder.date;
        document.getElementById('reminderType').value = reminder.type;

        document.getElementById('reminderForm').dataset.editId = reminder.id;
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

    calculateInflation() {
        const currentValue = parseFloat(document.getElementById('inflationValue').value) || 0;
        const rate = parseFloat(document.getElementById('inflationRate').value) / 100 || 0;
        const period = parseInt(document.getElementById('inflationPeriod').value) || 0;

        const futureValue = currentValue * Math.pow(1 + rate, period);
        const totalInflation = futureValue - currentValue;
        const purchasingPowerLoss = ((currentValue - (currentValue / Math.pow(1 + rate, period))) / currentValue) * 100;

        document.getElementById('inflationResult').innerHTML = `
            <div class="result-item">
                <strong>Valor Futuro:</strong> ${this.formatCurrency(futureValue)}
            </div>
            <div class="result-item">
                <strong>Impacto da Inflação:</strong> ${this.formatCurrency(totalInflation)}
            </div>
            <div class="result-item">
                <strong>Perda do Poder de Compra:</strong> ${purchasingPowerLoss.toFixed(2)}%
            </div>
            <div class="result-item">
                <strong>Valor Real Hoje:</strong> ${this.formatCurrency(currentValue / Math.pow(1 + rate, period))}
            </div>
        `;
    }

    calculateCompound() {
        const initial = parseFloat(document.getElementById('compoundInitial').value) || 0;
        const monthly = parseFloat(document.getElementById('compoundMonthly').value) || 0;
        const annualRate = parseFloat(document.getElementById('compoundRate').value) / 100 || 0;
        const years = parseInt(document.getElementById('compoundPeriod').value) || 0;

        const monthlyRate = annualRate / 12;
        const months = years * 12;

        // Valor futuro do capital inicial
        const futureInitial = initial * Math.pow(1 + monthlyRate, months);

        // Valor futuro dos aportes mensais
        let futureMonthly = 0;
        if (monthlyRate > 0) {
            futureMonthly = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        } else {
            futureMonthly = monthly * months;
        }

        const totalFuture = futureInitial + futureMonthly;
        const totalInvested = initial + (monthly * months);
        const totalInterest = totalFuture - totalInvested;

        document.getElementById('compoundResult').innerHTML = `
            <div class="result-item">
                <strong>Valor Final:</strong> ${this.formatCurrency(totalFuture)}
            </div>
            <div class="result-item">
                <strong>Total Investido:</strong> ${this.formatCurrency(totalInvested)}
            </div>
            <div class="result-item">
                <strong>Juros Ganhos:</strong> ${this.formatCurrency(totalInterest)}
            </div>
            <div class="result-item">
                <strong>Rentabilidade:</strong> ${totalInvested > 0 ? ((totalInterest / totalInvested) * 100).toFixed(2) : 0}%
            </div>
        `;
    }

    calculateDiscount() {
        const original = parseFloat(document.getElementById('discountOriginal').value) || 0;
        let discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        let discountValue = parseFloat(document.getElementById('discountValue').value) || 0;

        let finalValue = 0;
        let savings = 0;

        if (discountPercent > 0) {
            // Calcular baseado na porcentagem
            discountValue = (original * discountPercent) / 100;
            finalValue = original - discountValue;
            savings = discountValue;
        } else if (discountValue > 0) {
            // Calcular baseado no valor
            discountPercent = (discountValue / original) * 100;
            finalValue = original - discountValue;
            savings = discountValue;
        }

        document.getElementById('discountResult').innerHTML = `
            <div class="result-item">
                <strong>Valor Original:</strong> ${this.formatCurrency(original)}
            </div>
            <div class="result-item">
                <strong>Desconto (%):</strong> ${discountPercent.toFixed(2)}%
            </div>
            <div class="result-item">
                <strong>Valor do Desconto:</strong> ${this.formatCurrency(discountValue)}
            </div>
            <div class="result-item">
                <strong>Valor Final:</strong> ${this.formatCurrency(finalValue)}
            </div>
            <div class="result-item">
                <strong>Economia:</strong> ${this.formatCurrency(savings)}
            </div>
        `;

        // Atualizar campos automaticamente
        document.getElementById('discountPercent').value = discountPercent.toFixed(2);
        document.getElementById('discountValue').value = discountValue.toFixed(2);
    }

    // Comparison Functions
    compareCards() {
        const card1 = {
            name: document.getElementById('card1Name').value || 'Cartão 1',
            annual: parseFloat(document.getElementById('card1Annual').value) || 0,
            cashback: parseFloat(document.getElementById('card1Cashback').value) || 0,
            points: parseFloat(document.getElementById('card1Points').value) || 0
        };

        const card2 = {
            name: document.getElementById('card2Name').value || 'Cartão 2',
            annual: parseFloat(document.getElementById('card2Annual').value) || 0,
            cashback: parseFloat(document.getElementById('card2Cashback').value) || 0,
            points: parseFloat(document.getElementById('card2Points').value) || 0
        };

        // Calcular valor anual necessário para compensar anuidade com cashback
        const breakeven1 = card1.annual > 0 && card1.cashback > 0 ? (card1.annual / (card1.cashback / 100)) : 0;
        const breakeven2 = card2.annual > 0 && card2.cashback > 0 ? (card2.annual / (card2.cashback / 100)) : 0;

        document.getElementById('cardComparison').innerHTML = `
            <div class="comparison-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Critério</th>
                            <th>${card1.name}</th>
                            <th>${card2.name}</th>
                            <th>Melhor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Anuidade</td>
                            <td>${this.formatCurrency(card1.annual)}</td>
                            <td>${this.formatCurrency(card2.annual)}</td>
                            <td class="${card1.annual <= card2.annual ? 'text-success' : 'text-danger'}">${card1.annual <= card2.annual ? card1.name : card2.name}</td>
                        </tr>
                        <tr>
                            <td>Cashback (%)</td>
                            <td>${card1.cashback}%</td>
                            <td>${card2.cashback}%</td>
                            <td class="${card1.cashback >= card2.cashback ? 'text-success' : 'text-danger'}">${card1.cashback >= card2.cashback ? card1.name : card2.name}</td>
                        </tr>
                        <tr>
                            <td>Pontos por R$1</td>
                            <td>${card1.points}</td>
                            <td>${card2.points}</td>
                            <td class="${card1.points >= card2.points ? 'text-success' : 'text-danger'}">${card1.points >= card2.points ? card1.name : card2.name}</td>
                        </tr>
                        <tr>
                            <td>Gasto anual para compensar anuidade</td>
                            <td>${breakeven1 > 0 ? this.formatCurrency(breakeven1) : 'N/A'}</td>
                            <td>${breakeven2 > 0 ? this.formatCurrency(breakeven2) : 'N/A'}</td>
                            <td class="${breakeven1 <= breakeven2 && breakeven1 > 0 ? 'text-success' : 'text-danger'}">${breakeven1 <= breakeven2 && breakeven1 > 0 ? card1.name : card2.name}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    compareInvestments() {
        const invest1 = {
            name: document.getElementById('invest1Name').value || 'Investimento 1',
            return: parseFloat(document.getElementById('invest1Return').value) || 0,
            risk: parseInt(document.getElementById('invest1Risk').value) || 1,
            liquidity: parseInt(document.getElementById('invest1Liquidity').value) || 0
        };

        const invest2 = {
            name: document.getElementById('invest2Name').value || 'Investimento 2',
            return: parseFloat(document.getElementById('invest2Return').value) || 0,
            risk: parseInt(document.getElementById('invest2Risk').value) || 1,
            liquidity: parseInt(document.getElementById('invest2Liquidity').value) || 0
        };

        const amount = parseFloat(document.getElementById('investAmount').value) || 10000;
        const period = parseInt(document.getElementById('investPeriod').value) || 1;

        const future1 = amount * Math.pow(1 + invest1.return / 100, period);
        const future2 = amount * Math.pow(1 + invest2.return / 100, period);
        const profit1 = future1 - amount;
        const profit2 = future2 - amount;

        document.getElementById('investmentComparison').innerHTML = `
            <div class="comparison-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Critério</th>
                            <th>${invest1.name}</th>
                            <th>${invest2.name}</th>
                            <th>Melhor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rendimento anual</td>
                            <td>${invest1.return}%</td>
                            <td>${invest2.return}%</td>
                            <td class="${invest1.return >= invest2.return ? 'text-success' : 'text-danger'}">${invest1.return >= invest2.return ? invest1.name : invest2.name}</td>
                        </tr>
                        <tr>
                            <td>Valor futuro (${period} anos)</td>
                            <td>${this.formatCurrency(future1)}</td>
                            <td>${this.formatCurrency(future2)}</td>
                            <td class="${future1 >= future2 ? 'text-success' : 'text-danger'}">${future1 >= future2 ? invest1.name : invest2.name}</td>
                        </tr>
                        <tr>
                            <td>Lucro estimado</td>
                            <td>${this.formatCurrency(profit1)}</td>
                            <td>${this.formatCurrency(profit2)}</td>
                            <td class="${profit1 >= profit2 ? 'text-success' : 'text-danger'}">${profit1 >= profit2 ? invest1.name : invest2.name}</td>
                        </tr>
                        <tr>
                            <td>Risco (1-10)</td>
                            <td>${invest1.risk}</td>
                            <td>${invest2.risk}</td>
                            <td class="${invest1.risk <= invest2.risk ? 'text-success' : 'text-danger'}">${invest1.risk <= invest2.risk ? invest1.name : invest2.name}</td>
                        </tr>
                        <tr>
                            <td>Liquidez (dias)</td>
                            <td>${invest1.liquidity}</td>
                            <td>${invest2.liquidity}</td>
                            <td class="${invest1.liquidity <= invest2.liquidity ? 'text-success': 'text-danger'}">${invest1.liquidity <= invest2.liquidity ? invest1.name : invest2.name}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    compareLoans() {
        const loan1 = {
            name: document.getElementById('loan1Name').value || 'Empréstimo 1',
            rate: parseFloat(document.getElementById('loan1Rate').value) / 100 || 0,
            fee: parseFloat(document.getElementById('loan1Fee').value) || 0,
            insurance: parseFloat(document.getElementById('loan1Insurance').value) || 0
        };

        const loan2 = {
            name: document.getElementById('loan2Name').value || 'Empréstimo 2',
            rate: parseFloat(document.getElementById('loan2Rate').value) / 100 || 0,
            fee: parseFloat(document.getElementById('loan2Fee').value) || 0,
            insurance: parseFloat(document.getElementById('loan2Insurance').value) || 0
        };

        const amount = parseFloat(document.getElementById('loanAmount').value) || 10000;
        const term = parseInt(document.getElementById('loanTerm').value) || 12;

        // Calcular PMT
        const pmt1 = loan1.rate > 0 ? 
            amount * (loan1.rate * Math.pow(1 + loan1.rate, term)) / (Math.pow(1 + loan1.rate, term) - 1) : 
            amount / term;
        const pmt2 = loan2.rate > 0 ? 
            amount * (loan2.rate * Math.pow(1 + loan2.rate, term)) / (Math.pow(1 + loan2.rate, term) - 1) : 
            amount / term;

        const total1 = (pmt1 + loan1.insurance) * term + loan1.fee;
        const total2 = (pmt2 + loan2.insurance) * term + loan2.fee;
        const totalInterest1 = total1 - amount;
        const totalInterest2 = total2 - amount;

        document.getElementById('loanComparison').innerHTML = `
            <div class="comparison-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Critério</th>
                            <th>${loan1.name}</th>
                            <th>${loan2.name}</th>
                            <th>Melhor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Taxa mensal</td>
                            <td>${(loan1.rate * 100).toFixed(2)}%</td>
                            <td>${(loan2.rate * 100).toFixed(2)}%</td>
                            <td class="${loan1.rate <= loan2.rate ? 'text-success' : 'text-danger'}">${loan1.rate <= loan2.rate ? loan1.name : loan2.name}</td>
                        </tr>
                        <tr>
                            <td>Parcela</td>
                            <td>${this.formatCurrency(pmt1 + loan1.insurance)}</td>
                            <td>${this.formatCurrency(pmt2 + loan2.insurance)}</td>
                            <td class="${(pmt1 + loan1.insurance) <= (pmt2 + loan2.insurance) ? 'text-success' : 'text-danger'}">${(pmt1 + loan1.insurance) <= (pmt2 + loan2.insurance) ? loan1.name : loan2.name}</td>
                        </tr>
                        <tr>
                            <td>Total a pagar</td>
                            <td>${this.formatCurrency(total1)}</td>
                            <td>${this.formatCurrency(total2)}</td>
                            <td class="${total1 <= total2 ? 'text-success' : 'text-danger'}">${total1 <= total2 ? loan1.name : loan2.name}</td>
                        </tr>
                        <tr>
                            <td>Total de juros</td>
                            <td>${this.formatCurrency(totalInterest1)}</td>
                            <td>${this.formatCurrency(totalInterest2)}</td>
                            <td class="${totalInterest1 <= totalInterest2 ? 'text-success' : 'text-danger'}">${totalInterest1 <= totalInterest2 ? loan1.name : loan2.name}</td>
                        </tr>
                        <tr>
                            <td>Taxa de abertura</td>
                            <td>${this.formatCurrency(loan1.fee)}</td>
                            <td>${this.formatCurrency(loan2.fee)}</td>
                            <td class="${loan1.fee <= loan2.fee ? 'text-success' : 'text-danger'}">${loan1.fee <= loan2.fee ? loan1.name : loan2.name}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Initialize the application
const financeManager = new FinanceManager();

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
    .badge-stocks { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .badge-funds { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
    .badge-crypto { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .badge-bonds { background-color: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .badge-savings { background-color: rgba(6, 182, 212, 0.1); color: #06b6d4; }
    .badge-other { background-color: rgba(107, 114, 128, 0.1); color: #6b7280; }
    .badge-payment { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .badge-income { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
    .badge-investment { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .badge-review { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }

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

    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
    }

    .analytics-card {
        background: var(--bg-primary);
        border-radius: var(--radius);
        padding: 1.5rem;
        box-shadow: var(--shadow);
    }

    .analytics-card h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .planning-tools {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
    }

    .tool-card {
        background: var(--bg-primary);
        border-radius: var(--radius);
        padding: 1.5rem;
        box-shadow: var(--shadow);
    }

    .tool-card h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .calculator {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .calc-row {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
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

    .investments-overview {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .investment-summary {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .summary-item {
        background: var(--bg-primary);
        padding: 1rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        text-align: center;
    }

    .summary-item h4 {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .summary-item .value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .investments-chart {
        background: var(--bg-primary);
        border-radius: var(--radius);
        padding: 1.5rem;
        box-shadow: var(--shadow);
    }

    .investments-table {
        background: var(--bg-primary);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
    }

    .notifications-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    .alerts-section,
    .reminders-section {
        background: var(--bg-primary);
        border-radius: var(--radius);
        padding: 1.5rem;
        box-shadow: var(--shadow);
    }

    .alerts-section h3,
    .reminders-section h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .alert-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: var(--radius);
        margin-bottom: 1rem;
        border-left: 4px solid;
    }

    .alert-success {
        background: rgba(16, 185, 129, 0.1);
        border-left-color: #10b981;
        color: #065f46;
    }

    .alert-warning {
        background: rgba(245, 158, 11, 0.1);
        border-left-color: #f59e0b;
        color: #92400e;
    }

    .alert-danger {
        background: rgba(239, 68, 68, 0.1);
        border-left-color: #ef4444;
        color: #991b1b;
    }

    .alert-item i {
        font-size: 1.25rem;
    }

    .alert-item h4 {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .alert-item p {
        font-size: 0.75rem;
        margin: 0;
    }

    .reminder-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        margin-bottom: 1rem;
        transition: var(--transition);
    }

    .reminder-item:hover {
        box-shadow: var(--shadow-md);
    }

    .reminder-item.completed {
        opacity: 0.6;
    }

    .reminder-item.overdue {
        border-left: 4px solid #ef4444;
        background: rgba(239, 68, 68, 0.05);
    }

    .reminder-item.today {
        border-left: 4px solid #f59e0b;
        background: rgba(245, 158, 11, 0.05);
    }

    .reminder-content h4 {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
    }

    .reminder-content p {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .reminder-meta {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .reminder-date {
        font-size: 0.75rem;
        color: var(--text-secondary);
    }

    .reminder-actions {
        display: flex;
        gap: 0.5rem;
    }

    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .setting-item:last-child {
        border-bottom: none;
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: var(--primary-color);
    }

    input:checked + .slider:before {
        transform: translateX(26px);
    }

    .efficiency-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }

    .stat-item {
        text-align: center;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: var(--radius);
    }

    .stat-item h4 {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .stat-value.positive {
        color: #10b981;
    }

    .stat-value.negative {
        color: #ef4444;
    }

    .budget-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        justify-content: flex-end;
    }

    .goal-progress-actions {
        margin-top: 1rem;
    }

    .report-section {
        margin-bottom: 2rem;
    }

    .report-section h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    .tag-breakdown {
        background: var(--bg-primary);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
    }

    .tag-name {
        font-weight: 500;
        color: var(--text-primary);
    }

    .tag-count {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    .tag-amount {
        font-weight: 600;
        color: var(--text-primary);
    }

    /* Dark mode styles */
    .dark-mode {
        --bg-primary: #1e293b;
        --bg-secondary: #0f172a;
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --border-color: #334155;
    }

    @media (max-width: 768px) {
        .analytics-grid {
            grid-template-columns: 1fr;
        }

        .planning-tools {
            grid-template-columns: 1fr;
        }

        .investments-overview {
            grid-template-columns: 1fr;
        }

        .investment-summary {
            grid-template-columns: 1fr;
        }

        .notifications-container {
            grid-template-columns: 1fr;
        }

        .efficiency-stats {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);
