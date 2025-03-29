const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });

        req.user = user;
        next();
    });
};

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if email already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: {
                id: result.insertId,
                name,
                email
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // Find user by email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    const { name, email, currentPassword, newPassword } = req.body;

    try {
        // Get current user data
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // If updating email, check if new email already exists
        if (email && email !== user.email) {
            const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.user.id]);

            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update fields
        let updateQuery = 'UPDATE users SET ';
        const updateValues = [];

        if (name) {
            updateQuery += 'name = ?, ';
            updateValues.push(name);
        }

        if (email) {
            updateQuery += 'email = ?, ';
            updateValues.push(email);
        }

        // If changing password
        if (currentPassword && newPassword) {
            // Verify current password
            const validPassword = await bcrypt.compare(currentPassword, user.password);

            if (!validPassword) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            updateQuery += 'password = ?, ';
            updateValues.push(hashedPassword);
        }

        // Remove trailing comma and add WHERE clause
        updateQuery = updateQuery.slice(0, -2) + ' WHERE id = ?';
        updateValues.push(req.user.id);

        // Execute update
        await db.query(updateQuery, updateValues);

        // Get updated user data
        const [updatedUsers] = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);

        res.json(updatedUsers[0]);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Error updating user profile' });
    }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;