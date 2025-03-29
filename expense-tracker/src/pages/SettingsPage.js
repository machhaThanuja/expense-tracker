// src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import {
    fetchCategories,
    fetchBudgetsByMonth,
    createOrUpdateBudget,
    deleteBudget
} from '../services/api';
import styles from './SettingsPage.module.css';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('budgets');
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [budgetAmount, setBudgetAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Format selected month for display
    const formattedMonth = () => {
        if (!selectedMonth) return 'Select Month';

        const [year, month] = selectedMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Load categories and budgets
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [categoriesData, budgetsData] = await Promise.all([
                    fetchCategories(),
                    fetchBudgetsByMonth(selectedMonth)
                ]);

                setCategories(categoriesData || []);
                setBudgets(budgetsData || []);
                setError(null);
            } catch (err) {
                console.error('Error loading settings data:', err);
                setError('Failed to load settings data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedMonth]);

    // Handle budget form submission
    const handleAddBudget = async (e) => {
        e.preventDefault();

        if (!selectedCategory) {
            setError('Please select a category');
            return;
        }

        const amount = parseFloat(budgetAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid budget amount');
            return;
        }

        try {
            setLoading(true);

            // Check if budget already exists for this category
            const existingBudget = budgets.find(budget => budget.category === selectedCategory);

            await createOrUpdateBudget({
                id: existingBudget?.id,
                month: selectedMonth,
                category: selectedCategory,
                amount
            });

            // Refresh budgets
            const updatedBudgets = await fetchBudgetsByMonth(selectedMonth);
            setBudgets(updatedBudgets || []);

            // Reset form
            setSelectedCategory('');
            setBudgetAmount('');
            setError(null);
        } catch (err) {
            console.error('Error adding budget:', err);
            setError('Failed to add budget. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle budget deletion
    const handleDeleteBudget = async (budgetId) => {
        try {
            setLoading(true);
            await deleteBudget(budgetId);

            // Refresh budgets
            const updatedBudgets = await fetchBudgetsByMonth(selectedMonth);
            setBudgets(updatedBudgets || []);
            setError(null);
        } catch (err) {
            console.error('Error deleting budget:', err);
            setError('Failed to delete budget. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate total budget
    const calculateTotalBudget = () => {
        return budgets.reduce((total, budget) => total + parseFloat(budget.amount), 0);
    };

    // Render Budgets Tab Content
    const renderBudgetsTab = () => {
        return (
            <div className={styles.tabContent}>
                <div className={styles.monthSelector}>
                    <label>Month:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className={styles.monthSelect}
                    >
                        {generateMonthOptions()}
                    </select>
                </div>

                <div className={styles.budgetSection}>
                    <h3>Current Budgets</h3>
                    {budgets.length === 0 ? (
                        <div className={styles.noBudgets}>
                            <p>No budgets set for {formattedMonth()}</p>
                        </div>
                    ) : (
                        <div className={styles.budgetsList}>
                            {budgets.map(budget => (
                                <div key={budget.id} className={styles.budgetItem}>
                                    <div className={styles.budgetCategory}>
                                        <span
                                            className={styles.categoryDot}
                                            style={{ backgroundColor: getCategoryColor(budget.category) }}
                                        ></span>
                                        {budget.category}
                                    </div>
                                    <div className={styles.budgetAmount}>${parseFloat(budget.amount).toFixed(2)}</div>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteBudget(budget.id)}
                                        title="Delete Budget"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}

                            <div className={styles.totalBudget}>
                                <div className={styles.totalLabel}>Total Budget:</div>
                                <div className={styles.totalAmount}>${calculateTotalBudget().toFixed(2)}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.addBudgetSection}>
                    <h3>Add New Budget</h3>
                    <form onSubmit={handleAddBudget} className={styles.budgetForm}>
                        <div className={styles.formGroup}>
                            <label>Category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className={styles.categorySelect}
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Monthly Budget:</label>
                            <div className={styles.inputWithIcon}>
                                <span className={styles.currencySymbol}>$</span>
                                <input
                                    type="number"
                                    value={budgetAmount}
                                    onChange={(e) => setBudgetAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    className={styles.budgetInput}
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.addButton}>
                            <FaPlus className={styles.buttonIcon} />
                            Add Budget
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    // Render General Tab Content
    const renderGeneralTab = () => {
        return (
            <div className={styles.tabContent}>
                <div className={styles.settingsSection}>
                    <h3>User Preferences</h3>
                    <div className={styles.formGroup}>
                        <label>Default Currency:</label>
                        <select className={styles.settingSelect} defaultValue="USD">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="JPY">JPY (¥)</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Theme:</label>
                        <select className={styles.settingSelect} defaultValue="dark">
                            <option value="dark">Dark Theme</option>
                            <option value="light">Light Theme</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    // Render Notifications Tab Content
    const renderNotificationsTab = () => {
        return (
            <div className={styles.tabContent}>
                <div className={styles.settingsSection}>
                    <h3>Notification Settings</h3>
                    <div className={styles.formGroup}>
                        <label>Budget Alerts:</label>
                        <div className={styles.toggleWrapper}>
                            <input type="checkbox" id="budgetAlerts" className={styles.toggleInput} defaultChecked />
                            <label htmlFor="budgetAlerts" className={styles.toggle}></label>
                            <span className={styles.toggleLabel}>Notify me when I'm approaching my budget limit</span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Payment Reminders:</label>
                        <div className={styles.toggleWrapper}>
                            <input type="checkbox" id="paymentReminders" className={styles.toggleInput} defaultChecked />
                            <label htmlFor="paymentReminders" className={styles.toggle}></label>
                            <span className={styles.toggleLabel}>Send reminders for upcoming payments</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to generate month options
    const generateMonthOptions = () => {
        const options = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        // Generate options for current year and previous year
        for (let year = currentYear; year >= currentYear - 1; year--) {
            for (let month = 11; month >= 0; month--) {
                // Skip future months
                if (year === currentYear && month > currentDate.getMonth()) {
                    continue;
                }

                const monthString = String(month + 1).padStart(2, '0');
                const value = `${year}-${monthString}`;
                const date = new Date(year, month);
                const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });

                options.push(
                    <option key={value} value={value}>
                        {label}
                    </option>
                );
            }
        }

        return options;
    };

    // Helper function to get category color
    const getCategoryColor = (categoryName) => {
        const category = categories.find(c => c.name === categoryName);
        return category?.color || '#00b8d4';
    };

    return (
        <div className={styles.container}>
            <h1>Settings</h1>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.settingsLayout}>
                <div className={styles.sidebar}>
                    <div
                        className={`${styles.sidebarItem} ${activeTab === 'budgets' ? styles.active : ''}`}
                        onClick={() => setActiveTab('budgets')}
                    >
                        <span className={styles.icon}>💰</span>
                        Budgets
                    </div>
                    <div
                        className={`${styles.sidebarItem} ${activeTab === 'general' ? styles.active : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <span className={styles.icon}>⚙️</span>
                        General
                    </div>
                    <div
                        className={`${styles.sidebarItem} ${activeTab === 'notifications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <span className={styles.icon}>🔔</span>
                        Notifications
                    </div>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Loading settings...</div>
                    ) : (
                        <>
                            {activeTab === 'budgets' && renderBudgetsTab()}
                            {activeTab === 'general' && renderGeneralTab()}
                            {activeTab === 'notifications' && renderNotificationsTab()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;