import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSort } from 'react-icons/fa';
import { fetchExpenses, deleteExpense } from '../services/api';
import ExpenseForm from '../components/expenses/ExpenseForm';
import styles from './ExpensesPage.module.css';

const ExpensesPage = () => {
    const location = useLocation();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [filter, setFilter] = useState({ keyword: '', category: '', dateFrom: '', dateTo: '' });

    useEffect(() => {
        loadExpenses();

        // Check if we should show the form based on navigation state
        if (location.state?.showForm) {
            setShowForm(true);
        }
    }, [location]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await fetchExpenses();
            setExpenses(data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading expenses:', err);
            setError('Failed to load expenses. Please try again later.');
            setLoading(false);
        }
    };

    const handleAddExpense = () => {
        setCurrentExpense(null);
        setShowForm(true);
    };

    const handleEditExpense = (expense) => {
        setCurrentExpense(expense);
        setShowForm(true);
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await deleteExpense(id);
                setExpenses(expenses.filter(expense => expense.id !== id));
            } catch (err) {
                console.error('Error deleting expense:', err);
                setError('Failed to delete expense. Please try again.');
            }
        }
    };

    const handleSaveExpense = (savedExpense) => {
        if (currentExpense) {
            // Update existing expense in list
            setExpenses(expenses.map(expense =>
                expense.id === savedExpense.id ? savedExpense : expense
            ));
        } else {
            // Add new expense to list
            setExpenses([savedExpense, ...expenses]);
        }
        setShowForm(false);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Sort and filter expenses
    const getSortedAndFilteredExpenses = () => {
        // First apply filters
        let filteredExpenses = [...expenses];

        if (filter.keyword) {
            const keyword = filter.keyword.toLowerCase();
            filteredExpenses = filteredExpenses.filter(expense =>
                expense.description.toLowerCase().includes(keyword) ||
                expense.category.toLowerCase().includes(keyword)
            );
        }

        if (filter.category) {
            filteredExpenses = filteredExpenses.filter(expense =>
                expense.category === filter.category
            );
        }

        if (filter.dateFrom) {
            filteredExpenses = filteredExpenses.filter(expense =>
                new Date(expense.date) >= new Date(filter.dateFrom)
            );
        }

        if (filter.dateTo) {
            filteredExpenses = filteredExpenses.filter(expense =>
                new Date(expense.date) <= new Date(filter.dateTo)
            );
        }

        // Then sort
        return filteredExpenses.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    // Get unique categories
    const categories = [...new Set(expenses.map(expense => expense.category))];

    // Calculate total of filtered expenses
    const totalAmount = getSortedAndFilteredExpenses()
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    if (showForm) {
        return (
            <ExpenseForm
                expense={currentExpense}
                onSave={handleSaveExpense}
                onCancel={() => setShowForm(false)}
            />
        );
    }

    return (
        <div className={styles.expensesPage}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Expenses</h1>
                <button className={styles.addButton} onClick={handleAddExpense}>
                    <FaPlus className={styles.addIcon} /> Add Expense
                </button>
            </div>

            <div className={styles.filterSection}>
                <div className={styles.filterRow}>
                    <div className={styles.filterGroup}>
                        <input
                            type="text"
                            name="keyword"
                            value={filter.keyword}
                            onChange={handleFilterChange}
                            placeholder="Search expenses..."
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            name="category"
                            value={filter.category}
                            onChange={handleFilterChange}
                            className={styles.filterSelect}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <input
                            type="date"
                            name="dateFrom"
                            value={filter.dateFrom}
                            onChange={handleFilterChange}
                            className={styles.filterDate}
                            placeholder="From Date"
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <input
                            type="date"
                            name="dateTo"
                            value={filter.dateTo}
                            onChange={handleFilterChange}
                            className={styles.filterDate}
                            placeholder="To Date"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading expenses...</p>
                </div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <p>{error}</p>
                    <button
                        className={styles.retryButton}
                        onClick={loadExpenses}
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    <div className={styles.totalSection}>
                        <span className={styles.totalLabel}>Total:</span>
                        <span className={styles.totalAmount}>{formatCurrency(totalAmount)}</span>
                    </div>

                    <div className={styles.expenseTable}>
                        <div className={styles.expenseTableHeader}>
                            <div
                                className={styles.expenseTableCell}
                                onClick={() => handleSort('description')}
                            >
                                Description
                                {sortConfig.key === 'description' && (
                                    <FaSort className={styles.sortIcon} />
                                )}
                            </div>
                            <div
                                className={styles.expenseTableCell}
                                onClick={() => handleSort('category')}
                            >
                                Category
                                {sortConfig.key === 'category' && (
                                    <FaSort className={styles.sortIcon} />
                                )}
                            </div>
                            <div
                                className={styles.expenseTableCell}
                                onClick={() => handleSort('date')}
                            >
                                Date
                                {sortConfig.key === 'date' && (
                                    <FaSort className={styles.sortIcon} />
                                )}
                            </div>
                            <div
                                className={styles.expenseTableCell}
                                onClick={() => handleSort('amount')}
                            >
                                Amount
                                {sortConfig.key === 'amount' && (
                                    <FaSort className={styles.sortIcon} />
                                )}
                            </div>
                            <div className={styles.expenseTableCell}>Actions</div>
                        </div>

                        {getSortedAndFilteredExpenses().length > 0 ? (
                            getSortedAndFilteredExpenses().map(expense => (
                                <div className={styles.expenseTableRow} key={expense.id}>
                                    <div className={styles.expenseTableCell}>{expense.description}</div>
                                    <div className={styles.expenseTableCell}>
                                        <span
                                            className={styles.categoryBadge}
                                            style={{ backgroundColor: expense.category_color || '#00b8d4' }}
                                        >
                                            {expense.category}
                                        </span>
                                    </div>
                                    <div className={styles.expenseTableCell}>{formatDate(expense.date)}</div>
                                    <div className={styles.expenseTableCell}>{formatCurrency(expense.amount)}</div>
                                    <div className={styles.expenseTableCell}>
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.editButton}
                                                onClick={() => handleEditExpense(expense)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteExpense(expense.id)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noExpenses}>
                                <p>No expenses found. Start by adding some expenses!</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ExpensesPage;