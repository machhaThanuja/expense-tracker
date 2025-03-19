const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT e.*, c.name as category_name, c.color as category_color
      FROM expenses e
      LEFT JOIN categories c ON e.category = c.name
      ORDER BY e.date DESC
    `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error fetching expenses' });
    }
});

// Get expense by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);

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
            'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)',
            [description, amount, category, date]
        );

        const [newExpense] = await db.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);

        res.status(201).json(newExpense[0]);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Error creating expense' });
    }
});

// Update an expense
router.put('/:id', async (req, res) => {
    const { description, amount, category, date } = req.body;

    if (!description || !amount || !category || !date) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const [result] = await db.query(
            'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?',
            [description, amount, category, date, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const [updatedExpense] = await db.query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);

        res.json(updatedExpense[0]);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Error updating expense' });
    }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM expenses WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Error deleting expense' });
    }
});

// Get expense statistics
router.get('/stats/summary', async (req, res) => {
    try {
        // Total expenses for the current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const firstDay = firstDayOfMonth.toISOString().split('T')[0];
        const lastDay = lastDayOfMonth.toISOString().split('T')[0];

        const [totalResult] = await db.query(
            'SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?',
            [firstDay, lastDay]
        );

        // Highest expense
        const [highestResult] = await db.query(
            `SELECT amount, category FROM expenses 
       WHERE date BETWEEN ? AND ?
       ORDER BY amount DESC LIMIT 1`,
            [firstDay, lastDay]
        );

        // Expense by category
        const [categoryResult] = await db.query(
            `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE date BETWEEN ? AND ?
       GROUP BY category
       ORDER BY total DESC`,
            [firstDay, lastDay]
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
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month
    `);

        res.json(result);
    } catch (error) {
        console.error('Error fetching monthly expenses:', error);
        res.status(500).json({ message: 'Error fetching monthly expenses' });
    }
});

module.exports = router;