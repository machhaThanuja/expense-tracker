const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('./users');

// Add authentication middleware to all routes
router.use(authenticateToken);

// Get all expenses for the logged in user
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT e.*, c.name as category_name, c.color as category_color
      FROM expenses e
      LEFT JOIN categories c ON e.category = c.name
      WHERE e.user_id = ? OR e.user_id IS NULL
      ORDER BY e.date DESC
    `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error fetching expenses' });
    }
});

// Get expense by ID (only if it belongs to the logged in user)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM expenses WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
            [req.params.id, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ message: 'Error fetching expense' });
    }
});

// Create a new expense
router.post('/', async (req, res) => {
    const { description, amount, category, date } = req.body;

    if (!description || !amount || !category || !date) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO expenses (description, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)',
            [description, amount, category, date, req.user.id]
        );

        const [newExpense] = await db.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);

        res.status(201).json(newExpense[0]);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Error creating expense' });
    }
});

// Update an expense (only if it belongs to the logged in user)
router.put('/:id', async (req, res) => {
    const { description, amount, category, date } = req.body;

    if (!description || !amount || !category || !date) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if expense belongs to user
        const [expense] = await db.query(
            'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (expense.length === 0) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }

        const [result] = await db.query(
            'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ? AND user_id = ?',
            [description, amount, category, date, req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }

        const [updatedExpense] = await db.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);

        res.json(updatedExpense[0]);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Error updating expense' });
    }
});

// Delete an expense (only if it belongs to the logged in user)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Error deleting expense' });
    }
});

// Get expense statistics for the logged in user
router.get('/stats/summary', async (req, res) => {
    try {
        // Total expenses for the current month for this user
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const firstDay = firstDayOfMonth.toISOString().split('T')[0];
        const lastDay = lastDayOfMonth.toISOString().split('T')[0];

        const [totalResult] = await db.query(
            'SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ? AND user_id = ?',
            [firstDay, lastDay, req.user.id]
        );

        // Highest expense
        const [highestResult] = await db.query(
            `SELECT amount, category FROM expenses 
       WHERE date BETWEEN ? AND ? AND user_id = ?
       ORDER BY amount DESC LIMIT 1`,
            [firstDay, lastDay, req.user.id]
        );

        // Expense by category
        const [categoryResult] = await db.query(
            `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE date BETWEEN ? AND ? AND user_id = ?
       GROUP BY category
       ORDER BY total DESC`,
            [firstDay, lastDay, req.user.id]
        );

        res.json({
            totalExpenses: totalResult[0].total || 0,
            highestExpense: highestResult[0] || { amount: 0, category: 'None' },
            expensesByCategory: categoryResult
        });
    } catch (error) {
        console.error('Error fetching expense statistics:', error);
        res.status(500).json({ message: 'Error fetching expense statistics' });
    }
});

// Get monthly expenses for chart
router.get('/stats/monthly', async (req, res) => {
    try {
        const [result] = await db.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(amount) as total
      FROM expenses
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND user_id = ?
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month
    `, [req.user.id]);

        res.json(result);
    } catch (error) {
        console.error('Error fetching monthly expenses:', error);
        res.status(500).json({ message: 'Error fetching monthly expenses' });
    }
});

module.exports = router;