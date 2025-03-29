const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('./users');

// Apply authentication middleware
router.use(authenticateToken);

// Get all budgets for the user
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT b.*, c.color as category_color
       FROM budgets b
       LEFT JOIN categories c ON b.category = c.name
       WHERE b.user_id = ?
       ORDER BY b.month DESC, b.category ASC`,
            [req.user.id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ message: 'Error fetching budgets' });
    }
});

// Get budget for specific month
router.get('/:month', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT b.*, c.color as category_color
       FROM budgets b
       LEFT JOIN categories c ON b.category = c.name
       WHERE b.user_id = ? AND b.month = ?
       ORDER BY b.category ASC`,
            [req.user.id, req.params.month]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error fetching budget for month:', error);
        res.status(500).json({ message: 'Error fetching budget data' });
    }
});

// Create or update budget
router.post('/', async (req, res) => {
    const { month, category, amount } = req.body;

    if (!month || !category || amount === undefined) {
        return res.status(400).json({ message: 'Please provide month, category and amount' });
    }

    try {
        // Check if budget already exists
        const [existingBudget] = await db.query(
            'SELECT * FROM budgets WHERE user_id = ? AND month = ? AND category = ?',
            [req.user.id, month, category]
        );

        if (existingBudget.length > 0) {
            // Update existing budget
            await db.query(
                'UPDATE budgets SET amount = ? WHERE id = ?',
                [amount, existingBudget[0].id]
            );

            const [updatedBudget] = await db.query('SELECT * FROM budgets WHERE id = ?', [existingBudget[0].id]);
            return res.json(updatedBudget[0]);
        }

        // Create new budget
        const [result] = await db.query(
            'INSERT INTO budgets (user_id, month, category, amount) VALUES (?, ?, ?, ?)',
            [req.user.id, month, category, amount]
        );

        const [newBudget] = await db.query('SELECT * FROM budgets WHERE id = ?', [result.insertId]);

        res.status(201).json(newBudget[0]);
    } catch (error) {
        console.error('Error creating/updating budget:', error);
        res.status(500).json({ message: 'Error saving budget' });
    }
});

// Delete budget
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM budgets WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Budget not found or not authorized' });
        }

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ message: 'Error deleting budget' });
    }
});

// Get budget analysis (comparison with actual spending)
router.get('/analysis/:month', async (req, res) => {
    try {
        const month = req.params.month;

        // Get budgets for the month
        const [budgets] = await db.query(
            `SELECT category, amount
       FROM budgets
       WHERE user_id = ? AND month = ?`,
            [req.user.id, month]
        );

        // Get expenses for the month
        const [expenses] = await db.query(
            `SELECT category, SUM(amount) as spent
       FROM expenses
       WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
       GROUP BY category`,
            [req.user.id, month]
        );

        // Convert expenses to a map for easy lookup
        const expenseMap = expenses.reduce((map, expense) => {
            map[expense.category] = expense.spent;
            return map;
        }, {});

        // Calculate budget vs actual
        const analysis = budgets.map(budget => {
            const spent = expenseMap[budget.category] || 0;
            const remaining = budget.amount - spent;
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

            return {
                category: budget.category,
                budgeted: budget.amount,
                spent,
                remaining,
                percentage: Math.min(percentage, 100), // Cap at 100%
                status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
            };
        });

        // Calculate total budget, spending and remaining
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const totalSpent = expenses.reduce((sum, expense) => sum + expense.spent, 0);
        const totalRemaining = totalBudget - totalSpent;

        res.json({
            month,
            categories: analysis,
            summary: {
                budgeted: totalBudget,
                spent: totalSpent,
                remaining: totalRemaining,
                percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
            }
        });
    } catch (error) {
        console.error('Error getting budget analysis:', error);
        res.status(500).json({ message: 'Error analyzing budget data' });
    }
});

module.exports = router;