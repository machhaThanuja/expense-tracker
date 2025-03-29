import React, { useState, useEffect } from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';
import styles from './Dashboard.module.css';
import { fetchExpenseStats, fetchMonthlyExpenses, fetchExpenses, fetchBudgetsByMonth } from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalExpenses: 0,
        highestExpense: { amount: 0, category: 'None' },
        expensesByCategory: []
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalBudget, setTotalBudget] = useState(0);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, monthlyData, expensesData, budgetsData] = await Promise.all([
                    fetchExpenseStats(),
                    fetchMonthlyExpenses(),
                    fetchExpenses(),
                    fetchBudgetsByMonth(currentMonth)
                ]);

                setStats(statsData);
                setMonthlyData(monthlyData);
                setRecentExpenses(expensesData.slice(0, 5)); // Get only the 5 most recent expenses

                // Calculate total budget from all category budgets
                if (budgetsData && budgetsData.length > 0) {
                    const total = budgetsData.reduce((sum, budget) => sum + parseFloat(budget.amount || 0), 0);
                    setTotalBudget(total);
                } else {
                    setTotalBudget(0);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [currentMonth]);

    // Format date function
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Format currency function
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Calculate remaining budget
    const calculateRemainingBudget = () => {
        return totalBudget - stats.totalExpenses;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
                <button
                    className={styles.retryButton}
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    const remainingBudget = calculateRemainingBudget();
    const isOverBudget = remainingBudget < 0;

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.pageTitle}>Dashboard</h1>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIconContainer} style={{ backgroundColor: 'rgba(0, 184, 212, 0.2)' }}>
                        <FaWallet className={styles.statIcon} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3 className={styles.statTitle}>Total Expenses</h3>
                        <p className={styles.statValue}>{formatCurrency(stats.totalExpenses)}</p>
                        <p className={styles.statPeriod}>This Month</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconContainer} style={{ backgroundColor: 'rgba(123, 31, 162, 0.2)' }}>
                        <FaArrowDown className={styles.statIcon} style={{ color: 'var(--accent-secondary)' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3 className={styles.statTitle}>Highest Expense</h3>
                        <p className={styles.statValue}>{formatCurrency(stats.highestExpense.amount)}</p>
                        <p className={styles.statPeriod}>{stats.highestExpense.category}</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconContainer} style={{
                        backgroundColor: isOverBudget ? 'rgba(207, 102, 121, 0.2)' : 'rgba(3, 218, 198, 0.2)'
                    }}>
                        <FaArrowUp className={styles.statIcon} style={{
                            color: isOverBudget ? 'var(--danger)' : 'var(--success)'
                        }} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3 className={styles.statTitle}>Budget Status</h3>
                        <p className={styles.statValue} style={{
                            color: isOverBudget ? 'var(--danger)' : 'inherit'
                        }}>
                            {formatCurrency(Math.abs(remainingBudget))}
                        </p>
                        <p className={styles.statPeriod}>
                            {isOverBudget ? 'Over Budget' : 'Remaining'}
                        </p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconContainer} style={{ backgroundColor: 'rgba(255, 183, 77, 0.2)' }}>
                        <FaChartLine className={styles.statIcon} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className={styles.statInfo}>
                        <h3 className={styles.statTitle}>Monthly Trend</h3>
                        <p className={styles.statValue}>
                            {monthlyData.length >= 2 ? (
                                `${((monthlyData[monthlyData.length - 1].total / monthlyData[monthlyData.length - 2].total - 1) * 100).toFixed(1)}%`
                            ) : (
                                'N/A'
                            )}
                        </p>
                        <p className={styles.statPeriod}>vs Last Month</p>
                    </div>
                </div>
            </div>

            <div className={styles.chartSection}>
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Expense Breakdown</h3>
                    <div className={styles.placeholderChart}>
                        <div className={styles.chartLegend}>
                            {stats.expensesByCategory.slice(0, 5).map((category, index) => (
                                <div className={styles.legendItem} key={index}>
                                    <div
                                        className={styles.legendColor}
                                        style={{
                                            backgroundColor: ['#00b8d4', '#7b1fa2', '#03dac6', '#ffb74d', '#cf6679'][index % 5]
                                        }}
                                    ></div>
                                    <span>{category.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Monthly Expenses</h3>
                    <div className={styles.placeholderChart}>
                        <div className={styles.barChart}>
                            {monthlyData.slice(-6).map((month, index) => {
                                const maxAmount = Math.max(...monthlyData.map(m => m.total));
                                const height = maxAmount > 0 ? (month.total / maxAmount) * 90 : 0;
                                const monthName = new Date(month.month + '-01').toLocaleString('default', { month: 'short' });

                                return (
                                    <div className={styles.barContainer} key={index}>
                                        <div className={styles.bar} style={{ height: `${height}%` }}></div>
                                        <span className={styles.barLabel}>{monthName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.recentExpenses}>
                <h3 className={styles.sectionTitle}>Recent Expenses</h3>
                <div className={styles.expenseTable}>
                    <div className={styles.expenseTableHeader}>
                        <div className={styles.expenseTableCell}>Description</div>
                        <div className={styles.expenseTableCell}>Category</div>
                        <div className={styles.expenseTableCell}>Date</div>
                        <div className={styles.expenseTableCell}>Amount</div>
                    </div>

                    {recentExpenses.length > 0 ? (
                        recentExpenses.map(expense => (
                            <div className={styles.expenseTableRow} key={expense.id}>
                                <div className={styles.expenseTableCell}>{expense.description}</div>
                                <div className={styles.expenseTableCell}>{expense.category}</div>
                                <div className={styles.expenseTableCell}>{formatDate(expense.date)}</div>
                                <div className={styles.expenseTableCell}>{formatCurrency(expense.amount)}</div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noExpenses}>
                            <p>No expenses found. Start by adding some expenses!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;