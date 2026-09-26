const db = require('../config/db');

// Get all users
const getUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, name, email, created_at
             FROM users
             ORDER BY created_at DESC`
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Get users error:', error);

        res.status(500).json({
            message: 'Failed to fetch users'
        });
    }
};


// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT id, name, email, created_at
             FROM users
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Get user error:', error);

        res.status(500).json({
            message: 'Failed to fetch user'
        });
    }
};


// Create user
const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Name is required'
            });
        }

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const result = await db.query(
            `INSERT INTO users (name, email)
             VALUES ($1, $2)
             RETURNING id, name, email, created_at`,
            [name, email]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Create user error:', error);

        // Duplicate email
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            message: 'Failed to create user'
        });
    }
};


// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Name is required'
            });
        }

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        const result = await db.query(
            `UPDATE users
             SET name = $1,
                 email = $2
             WHERE id = $3
             RETURNING id, name, email, created_at`,
            [name, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Update user error:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            message: 'Failed to update user'
        });
    }
};


// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `DELETE FROM users
             WHERE id = $1
             RETURNING id, name, email`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Delete user error:', error);

        res.status(500).json({
            message: 'Failed to delete user'
        });
    }
};


module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};