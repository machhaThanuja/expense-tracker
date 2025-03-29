const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('./users');

// Make categories available without authentication for now
// You can add authentication here later

// Get all categories
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Create a new category
router.post('/', authenticateToken, async (req, res) => {
    const { name, color } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Please provide a category name' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO categories (name, color) VALUES (?, ?)',
            [name, color || '#00b8d4']
        );

        const [newCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

        res.status(201).json(newCategory[0]);
    } catch (error) {
        console.error('Error creating category:', error);

        // Handle duplicate entry
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category already exists' });
        }

        res.status(500).json({ message: 'Error creating category' });
    }
});

// Update a category
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, color } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Please provide a category name' });
    }

    try {
        const [result] = await db.query(
            'UPDATE categories SET name = ?, color = ? WHERE id = ?',
            [name, color || '#00b8d4', req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const [updatedCategory] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);

        res.json(updatedCategory[0]);
    } catch (error) {
        console.error('Error updating category:', error);

        // Handle duplicate entry
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category name already exists' });
        }

        res.status(500).json({ message: 'Error updating category' });
    }
});

// Delete a category
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if category is used in expenses
        const [expenseCheck] = await db.query(
            'SELECT COUNT(*) as count FROM expenses e JOIN categories c ON e.category = c.name WHERE c.id = ?',
            [req.params.id]
        );

        if (expenseCheck[0].count > 0) {
            return res.status(400).json({
                message: 'Cannot delete category because it is used in expenses. Update or delete those expenses first.'
            });
        }

        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category' });
    }
});

module.exports = router;