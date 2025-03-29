const bcrypt = require('bcrypt');
const db = require('./config/db');

async function setupTestUser() {
    try {
        // Check if demo user already exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', ['demo@example.com']);

        if (existingUsers.length > 0) {
            console.log('Demo user already exists.');
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create user
        await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            ['Demo User', 'demo@example.com', hashedPassword]
        );

        console.log('Demo user created successfully.');
        console.log('Email: demo@example.com');
        console.log('Password: password123');
    } catch (error) {
        console.error('Error creating demo user:', error);
    }
}

// Run the setup
setupTestUser().then(() => process.exit(0));