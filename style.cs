/* FinanceManager Pro - Comprehensive Styles */
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --info-color: #06b6d4;

    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;

    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --text-muted: #94a3b8;

    --border-color: #e2e8f0;
    --border-light: #f1f5f9;

    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

    --radius: 8px;
    --radius-sm: 4px;
    --radius-lg: 12px;

    --transition: all 0.3s ease;

    --sidebar-width: 280px;
    --header-height: 70px;
}

/* Dark Mode Variables */
.dark-mode {
    --bg-primary: #1e293b;
    --bg-secondary: #0f172a;
    --bg-tertiary: #334155;

    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;

    --border-color: #334155;
    --border-light: #475569;
}

/* Reset & Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
}

/* App Container */
.app-container {
    display: flex;
    min-height: 100vh;
    position: relative;
}

/* Header */
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--header-height);
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    z-index: 1000;
    box-shadow: var(--shadow);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 2rem;
    max-width: 100%;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 700;
    color: var(--primary-color);
}

.logo i {
    font-size: 1.5rem;
}

.logo h1 {
    font-size: 1.25rem;
    margin: 0;
}

.header-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
}

/* Mobile Header Menu */
.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.5rem;
}

/* Sidebar */
.sidebar {
    position: fixed;
    left: 0;
    top: var(--header-height);
    width: var(--sidebar-width);
    height: calc(100vh - var(--header-height));
    background: var(--bg-primary);
    border-right: 1px solid var(--border-color);
    overflow-y: auto;
    z-index: 999;
    transition: var(--transition);
}

.nav-menu {
    list-style: none;
    padding: 1rem 0;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    color: var(--text-secondary);
    text-decoration: none;
    transition: var(--transition);
    border-left: 3px solid transparent;
}

.nav-link:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.nav-link.active {
    background: var(--bg-secondary);
    color: var(--primary-color);
    border-left-color: var(--primary-color);
    font-weight: 500;
}

.nav-link i {
    width: 1.25rem;
    text-align: center;
}

/* Main Content */
.main-content {
    margin-left: var(--sidebar-width);
    margin-top: var(--header-height);
    padding: 2rem;
    width: calc(100% - var(--sidebar-width));
    min-height: calc(100vh - var(--header-height));
}

/* Content Sections */
.content-section {
    display: none;
}

.content-section.active {
    display: block;
}

/* Section Headers */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.section-header h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--text-primary);
}

/* Dashboard */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.dashboard-header h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--text-primary);
}

.date-filter select {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
}

/* Summary Cards */
.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.card {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: var(--transition);
    border-left: 4px solid;
}

.card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.card-income {
    border-left-color: var(--success-color);
}

.card-expense {
    border-left-color: var(--danger-color);
}

.card-balance {
    border-left-color: var(--primary-color);
}

.card-budget {
    border-left-color: var(--warning-color);
}

.card-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: white;
}

.card-income .card-icon {
    background: var(--success-color);
}

.card-expense .card-icon {
    background: var(--danger-color);
}

.card-balance .card-icon {
    background: var(--primary-color);
}

.card-budget .card-icon {
    background: var(--warning-color);
}

.card-content {
    flex: 1;
}

.card-content h3 {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.card-content .amount {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.change {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
}

.change.positive {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.change.negative {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

/* Charts Container */
.charts-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.chart-card {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

.chart-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.chart-card canvas {
    max-width: 100% !important;
    height: auto !important;
    max-height: 300px !important;
}

/* Recent Transactions */
.recent-transactions {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

.recent-transactions h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.transactions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    transition: var(--transition);
}

.transaction-item:hover {
    background: var(--bg-secondary);
    box-shadow: var(--shadow);
}

.transaction-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.transaction-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.875rem;
}

.transaction-details h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.transaction-details p {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.transaction-amount {
    font-size: 1rem;
    font-weight: 600;
}

.transaction-amount.income {
    color: var(--success-color);
}

.transaction-amount.expense {
    color: var(--danger-color);
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background: var(--secondary-color);
    color: white;
}

.btn-secondary:hover {
    background: #475569;
}

.btn-success {
    background: var(--success-color);
    color: white;
}

.btn-success:hover {
    background: #059669;
}

.btn-danger {
    background: var(--danger-color);
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}

.btn-warning {
    background: var(--warning-color);
    color: white;
}

.btn-warning:hover {
    background: #d97706;
}

.btn-info {
    background: var(--info-color);
    color: white;
}

.btn-info:hover {
    background: #0891b2;
}

/* Filters */
.filters {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.filters input,
.filters select {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
    min-width: 150px;
}

/* Tables */
.table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow);
}

.table thead {
    background: var(--bg-secondary);
}

.table th,
.table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.table th {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.875rem;
}

.table td {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.table tbody tr:hover {
    background: var(--bg-secondary);
}

/* Categories Grid */
.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.category-card {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow);
    transition: var(--transition);
}

.category-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.category-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.category-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1rem;
}

.category-header h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.category-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

/* Budget Items */
.budget-item {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow);
    margin-bottom: 1.5rem;
}

.budget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.budget-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.budget-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1rem;
}

.budget-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.budget-info p {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.budget-amount {
    text-align: right;
}

.budget-amount .spent {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.budget-amount .total {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.budget-progress {
    background: var(--bg-secondary);
    border-radius: var(--radius);
    height: 8px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.budget-progress-bar {
    height: 100%;
    border-radius: var(--radius);
    transition: var(--transition);
}

.budget-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

/* Goals Grid */
.goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.goal-card {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow);
    transition: var(--transition);
}

.goal-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.goal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.goal-header h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.goal-actions {
    display: flex;
    gap: 0.5rem;
}

.goal-progress {
    margin-bottom: 1rem;
}

.progress-bar {
    background: var(--bg-secondary);
    border-radius: var(--radius);
    height: 8px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: var(--radius);
    transition: var(--transition);
}

.goal-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.goal-stats .current {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
}

.goal-stats .target {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.goal-deadline {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.goal-percentage {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

/* Modals */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: 0;
    visibility: hidden;
    transition: var(--transition);
}

.modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    transform: scale(0.9);
    transition: var(--transition);
}

.modal.active .modal-content {
    transform: scale(1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.close {
    font-size: 1.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0.25rem;
}

.close:hover {
    color: var(--text-primary);
}

/* Forms */
form {
    padding: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.875rem;
    transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

/* Settings */
.settings-container {
    max-width: 800px;
}

.settings-group {
    background: var(--bg-primary);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow);
}

.settings-group h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-light);
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-item label {
    font-weight: 500;
    color: var(--text-primary);
}

/* Switch */
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

/* Empty States */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-secondary);
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--text-muted);
}

.empty-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.empty-state p {
    font-size: 0.875rem;
}

/* Utility Classes */
.text-success { color: var(--success-color) !important; }
.text-danger { color: var(--danger-color) !important; }
.text-warning { color: var(--warning-color) !important; }
.text-muted { color: var(--text-muted) !important; }

/* Mobile Responsive Styles */
@media (max-width: 1024px) {
    .summary-cards {
        grid-template-columns: repeat(2, 1fr);
    }

    .charts-container {
        grid-template-columns: 1fr;
    }

    .categories-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .goals-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    :root {
        --sidebar-width: 0px;
        --header-height: 60px;
    }

    .header-content {
        padding: 0 1rem;
    }

    .logo h1 {
        font-size: 1.125rem;
    }

    .mobile-menu-toggle {
        display: block !important;
        order: -1;
        z-index: 1001;
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 1.25rem;
        padding: 0.5rem;
        cursor: pointer;
        border-radius: var(--radius);
        transition: var(--transition);
    }

    .mobile-menu-toggle:hover {
        background: var(--bg-secondary);
    }

    .header-controls {
        gap: 0.5rem;
    }

    .header-controls .btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
    }

    .sidebar {
        transform: translateX(-100%);
        width: 280px;
        left: 0;
        z-index: 1000;
        transition: transform 0.3s ease;
    }

    .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: var(--shadow-lg);
    }

    .main-content {
        margin-left: 0;
        width: 100%;
        padding: 1rem;
    }

    .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .dashboard-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .summary-cards {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .card {
        padding: 1rem;
    }

    .card-content .amount {
        font-size: 1.5rem;
    }

    .charts-container {
        gap: 1rem;
    }

    .chart-card {
        padding: 1rem;
    }

    .chart-card canvas {
        max-height: 250px !important;
    }

    .categories-grid {
        grid-template-columns: 1fr;
    }

    .goals-grid {
        grid-template-columns: 1fr;
    }

    .filters {
        flex-direction: column;
        align-items: stretch;
    }

    .filters input,
    .filters select {
        min-width: auto;
        width: 100%;
    }

    .table-responsive {
        overflow-x: auto;
    }

    .table {
        min-width: 600px;
    }

    .modal-content {
        width: 95%;
        margin: 1rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .transaction-item {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .transaction-info {
        justify-content: flex-start;
    }

    .transaction-amount {
        text-align: right;
        font-size: 1.125rem;
    }

    .budget-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .budget-amount {
        text-align: left;
    }

    .goal-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .goal-stats {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
    }
}

@media (max-width: 480px) {
    .main-content {
        padding: 0.5rem;
    }

    .card {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }

    .card-icon {
        align-self: center;
    }

    .modal-content {
        width: 100%;
        height: 100%;
        border-radius: 0;
        max-height: 100vh;
    }

    .chart-card canvas {
        max-height: 200px !important;
    }

    .planning-tools {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .tool-card {
        padding: 1rem;
    }

    .calc-row input {
        font-size: 16px; /* Previne zoom no iOS */
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        font-size: 16px; /* Previne zoom no iOS */
    }

    .filters {
        gap: 0.5rem;
    }

    .filters input,
    .filters select {
        font-size: 16px;
        min-width: 120px;
    }
}

/* Mobile Overlay */
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

/* Loading States */
.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--text-secondary);
}

.loading::after {
    content: '';
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 0.5rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Print Styles */
@media print {
    .sidebar,
    .header,
    .btn,
    .modal {
        display: none !important;
    }

    .main-content {
        margin: 0;
        width: 100%;
        padding: 0;
    }

    .card,
    .chart-card,
    .category-card,
    .goal-card {
        box-shadow: none;
        border: 1px solid #ddd;
        break-inside: avoid;
    }
}

    /* Report Styles */
    .report-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .report-item {
        background: var(--bg-primary);
        border-radius: var(--radius);
        padding: 1.5rem;
        text-align: center;
        box-shadow: var(--shadow);
    }

    .report-item h4 {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
    }

    .report-item .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .category-breakdown, .tag-breakdown {
        background: var(--bg-primary);
        border-radius: var(--radius);
        padding: 1rem;
        box-shadow: var(--shadow);
    }

    .breakdown-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--border-color);
    }

    .breakdown-item:last-child {
        border-bottom: none;
    }

    .category-name, .tag-name {
        font-weight: 500;
        color: var(--text-primary);
        flex: 1;
    }

    .category-amount, .tag-amount {
        font-weight: 600;
        color: var(--text-primary);
    }

    /* Comparison Styles */
    .comparison-tools {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
    }

    .comparison-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .comparison-item {
        background: var(--bg-secondary);
        border-radius: var(--radius);
        padding: 1rem;
    }

    .comparison-item h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
    }

    .comparison-item input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .comparison-params {
        background: var(--bg-tertiary);
        border-radius: var(--radius);
        padding: 1rem;
    }

    .comparison-params input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .comparison-result {
        margin-top: 1rem;
        max-height: 400px;
        overflow-y: auto;
    }

    .comparison-table {
        background: var(--bg-primary);
        border-radius: var(--radius);
        overflow: hidden;
        box-shadow: var(--shadow);
    }

    .comparison-table .table {
        margin: 0;
    }

    .comparison-table .table th {
        background: var(--bg-secondary);
        font-weight: 600;
        font-size: 0.875rem;
    }

    .comparison-table .table td {
        font-size: 0.875rem;
        vertical-align: middle;
    }

    .comparison-table .text-success {
        color: var(--success-color) !important;
        font-weight: 600;
    }

    .comparison-table .text-danger {
        color: var(--danger-color) !important;
        font-weight: 600;
    }

    @media (max-width: 768px) {
        .comparison-tools {
            grid-template-columns: 1fr;
        }

        .comparison-table {
            font-size: 0.75rem;
        }

        .comparison-item {
            padding: 0.75rem;
        }
    }
