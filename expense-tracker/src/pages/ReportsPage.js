import React, { useState, useEffect } from 'react';
import { FaChartPie, FaChartBar, FaChartLine, FaCalendarAlt, FaFilter, FaFileDownload } from 'react-icons/fa';
import { fetchExpenses, fetchCategories, fetchBudgetAnalysis } from '../services/api';
import styles from './ReportsPage.module.css';

// Add react-chartjs-2 to your project:
// npm install chart.js react-chartjs-2
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

const ReportsPage = () => {
    const [activeReport, setActiveReport] = useState('overview');
    const [timeframe, setTimeframe] = useState('month');
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgetAnalysis, setBudgetAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load data based on active report and timeframe
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Always fetch categories
                const categoriesData = await fetchCategories();
                setCategories(categoriesData);

                // Fetch expenses
                const expensesData = await fetchExpenses();

                // Filter expenses based on timeframe
                const filteredExpenses = filterExpensesByTimeframe(expensesData, timeframe, currentMonth);
                setExpenses(filteredExpenses);

                // Fetch budget analysis if on budget report
                if (activeReport === 'budget') {
                    const analysisData = await fetchBudgetAnalysis(currentMonth);
                    setBudgetAnalysis(analysisData);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching report data:', err);
                setError('Failed to load report data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeReport, timeframe, currentMonth]);

    // Function to filter expenses by timeframe
    const filterExpensesByTimeframe = (expenses, timeframe, currentMonth) => {
        const now = new Date();
        const [year, month] = currentMonth.split('-').map(Number);

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);

            switch (timeframe) {
                case 'week':
                    // Get expenses from the past 7 days
                    const weekAgo = new Date(now);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return expenseDate >= weekAgo;

                case 'month':
                    // Get expenses from the selected month
                    return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === month;

                case 'year':
                    // Get expenses from the current year
                    return expenseDate.getFullYear() === now.getFullYear();

                default:
                    return true;
            }
        });
    };

    // Function to get expense data by category for pie chart
    const getExpensesByCategory = () => {
        // Group expenses by category and sum amounts
        const categoryMap = {};

        expenses.forEach(expense => {
            if (!categoryMap[expense.category]) {
                categoryMap[expense.category] = 0;
            }
            categoryMap[expense.category] += parseFloat(expense.amount);
        });

        // Convert to arrays for chart.js
        const labels = Object.keys(categoryMap);
        const data = Object.values(categoryMap);

        // Get colors for categories
        const colors = labels.map(label => {
            const category = categories.find(c => c.name === label);
            return category ? category.color : '#00b8d4';
        });

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color + '80'),
                    borderWidth: 1,
                },
            ],
        };
    };

    // Function to get expense data by date for line chart
    const getExpensesByDate = () => {
        // Group expenses by date and sum amounts
        const dateMap = {};

        expenses.forEach(expense => {
            const date = expense.date.substring(0, 10);
            if (!dateMap[date]) {
                dateMap[date] = 0;
            }
            dateMap[date] += parseFloat(expense.amount);
        });

        // Sort dates
        const sortedDates = Object.keys(dateMap).sort();

        return {
            labels: sortedDates.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [
                {
                    label: 'Daily Expenses',
                    data: sortedDates.map(date => dateMap[date]),
                    borderColor: '#00b8d4',
                    backgroundColor: 'rgba(0, 184, 212, 0.2)',
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    };

    // Function to get budget comparison data for bar chart
    const getBudgetComparisonData = () => {
        if (!budgetAnalysis || !budgetAnalysis.categories || budgetAnalysis.categories.length === 0) {
            return null;
        }

        return {
            labels: budgetAnalysis.categories.map(item => item.category),
            datasets: [
                {
                    label: 'Budget',
                    data: budgetAnalysis.categories.map(item => item.budgeted),
                    backgroundColor: 'rgba(3, 218, 198, 0.6)',
                },
                {
                    label: 'Actual',
                    data: budgetAnalysis.categories.map(item => item.spent),
                    backgroundColor: 'rgba(0, 184, 212, 0.6)',
                },
            ],
        };
    };

    // Function to get month options for selector
    const getMonthOptions = () => {
        const options = [];
        const now = new Date();

        // Generate past 6 months and current month
        for (let i = 6; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthString = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            options.push({ value: monthString, label: monthLabel });
        }

        return options;
    };

    // Render overview report
    const renderOverviewReport = () => {
        // Get total amount
        const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

        // Get highest expense
        const highestExpense = expenses.length > 0
            ? expenses.reduce((max, expense) => parseFloat(expense.amount) > parseFloat(max.amount) ? expense : max, expenses[0])
            : null;

        // Get average expense
        const averageAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;

        return (
            <div className={styles.reportContent}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Expenses</h3>
                        <div className={styles.statValue}>${totalAmount.toFixed(2)}</div>
                        <div className={styles.statFooter}>
                            for selected period
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <h3>Transactions</h3>
                        <div className={styles.statValue}>{expenses.length}</div>
                        <div className={styles.statFooter}>
                            total records
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <h3>Average Expense</h3>
                        <div className={styles.statValue}>${averageAmount.toFixed(2)}</div>
                        <div className={styles.statFooter}>
                            per transaction
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <h3>Highest Expense</h3>
                        <div className={styles.statValue}>
                            {highestExpense ? `$${parseFloat(highestExpense.amount).toFixed(2)}` : '$0.00'}
                        </div>
                        <div className={styles.statFooter}>
                            {highestExpense ? highestExpense.category : 'N/A'}
                        </div>
                    </div>
                </div>

                <div className={styles.chartsRow}>
                    <div className={styles.chartCard}>
                        <h3>Expenses by Category</h3>
                        <div className={styles.chartContainer}>
                            {expenses.length > 0 ? (
                                <Pie
                                    data={getExpensesByCategory()}
                                    options={{
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    color: '#bbbbbb'
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className={styles.noDataMessage}>
                                    No data available for this period
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.chartCard}>
                        <h3>Spending Over Time</h3>
                        <div className={styles.chartContainer}>
                            {expenses.length > 0 ? (
                                <Line
                                    data={getExpensesByDate()}
                                    options={{
                                        scales: {
                                            x: { grid: { color: '#444' }, ticks: { color: '#bbb' } },
                                            y: { grid: { color: '#444' }, ticks: { color: '#bbb' } }
                                        },
                                        plugins: {
                                            legend: {
                                                labels: {
                                                    color: '#bbbbbb'
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <div className={styles.noDataMessage}>
                                    No data available for this period
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render budget report
    const renderBudgetReport = () => {
        if (!budgetAnalysis) {
            return (
                <div className={styles.noDataMessage}>
                    No budget data available for this month. Please set up budgets in the Settings page.
                </div>
            );
        }

        return (
            <div className={styles.reportContent}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Budget</h3>
                        <div className={styles.statValue}>${budgetAnalysis.summary.budgeted.toFixed(2)}</div>
                        <div className={styles.statFooter}>
                            allocated for {new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <h3>Total Spent</h3>
                        <div className={styles.statValue}>${budgetAnalysis.summary.spent.toFixed(2)}</div>
                        <div className={styles.statFooter}>
                            {budgetAnalysis.summary.percentage.toFixed(0)}% of total budget
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <h3>Remaining</h3>
                        <div className={styles.statValue}>${budgetAnalysis.summary.remaining.toFixed(2)}</div>
                        <div className={styles.statFooter}>
                            available to spend
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <h3>Budget Status</h3>
                        <div className={styles.statValue}>
                            {budgetAnalysis.summary.percentage > 100 ? 'Over Budget' :
                                budgetAnalysis.summary.percentage > 80 ? 'Warning' : 'On Track'}
                        </div>
                        <div className={styles.statFooter}>
                            overall status
                        </div>
                    </div>
                </div>

                <div className={styles.chartCard} style={{ marginTop: '24px' }}>
                    <h3>Budget vs. Actual Spending</h3>
                    <div className={styles.chartContainer}>
                        {budgetAnalysis.categories.length > 0 ? (
                            <Bar
                                data={getBudgetComparisonData()}
                                options={{
                                    responsive: true,
                                    scales: {
                                        x: {
                                            grid: { color: '#444' },
                                            ticks: { color: '#bbb' }
                                        },
                                        y: {
                                            grid: { color: '#444' },
                                            ticks: { color: '#bbb' }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            labels: {
                                                color: '#bbbbbb'
                                            }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <div className={styles.noDataMessage}>
                                No budget categories found for this month
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.budgetDetailsTable}>
                    <h3>Budget Details</h3>
                    <div className={styles.tableContainer}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Budgeted</th>
                                    <th>Spent</th>
                                    <th>Remaining</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetAnalysis.categories.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.category}</td>
                                        <td>${item.budgeted.toFixed(2)}</td>
                                        <td>${item.spent.toFixed(2)}</td>
                                        <td>${item.remaining.toFixed(2)}</td>
                                        <td>
                                            <div
                                                className={`${styles.statusBadge} ${item.status === 'over' ? styles.statusOver :
                                                        item.status === 'warning' ? styles.statusWarning :
                                                            styles.statusGood
                                                    }`}
                                            >
                                                {item.status === 'over' ? 'Over Budget' :
                                                    item.status === 'warning' ? 'Warning' :
                                                        'On Track'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <div className={styles.reportHeader}>
                <div className={styles.reportTabs}>
                    <button
                        className={`${styles.reportTab} ${activeReport === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveReport('overview')}
                    >
                        <FaChartPie className={styles.tabIcon} />
                        <span>Overview</span>
                    </button>

                    

                    <button
                        className={`${styles.reportTab} ${activeReport === 'trends' ? styles.active : ''}`}
                        onClick={() => setActiveReport('trends')}
                    >
                        <FaChartLine className={styles.tabIcon} />
                        <span>Spending Trends</span>
                    </button>
                </div>

                <div className={styles.reportControls}>
                    {activeReport === 'budget' ? (
                        <div className={styles.monthSelector}>
                            <FaCalendarAlt className={styles.controlIcon} />
                            <select
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(e.target.value)}
                                className={styles.controlSelect}
                            >
                                {getMonthOptions().map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className={styles.timeframeSelector}>
                            <FaFilter className={styles.controlIcon} />
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                className={styles.controlSelect}
                            >
                                <option value="week">Last 7 Days</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                    )}

                    <button className={styles.exportButton}>
                        <FaFileDownload className={styles.buttonIcon} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className={styles.reportContainer}>
                {loading ? (
                    <div className={styles.loading}>Loading report data...</div>
                ) : (
                    <>
                        {activeReport === 'overview' && renderOverviewReport()}
                        {activeReport === 'budget' && renderBudgetReport()}
                        {activeReport === 'trends' && (
                            <div className={styles.comingSoon}>
                                <h2>Spending Trends Report</h2>
                                <p>Advanced spending trend analysis coming soon!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;