const db = require('../config/db');

// Get all goals
const getGoals = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM goals ORDER BY created_at DESC'
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Get goals error:', error);

        res.status(500).json({
            message: 'Failed to fetch goals'
        });
    }
};


// Get goal by ID
const getGoalById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT * FROM goals WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Goal not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Get goal error:', error);

        res.status(500).json({
            message: 'Failed to fetch goal'
        });
    }
};


// Create goal
const createGoal = async (req, res) => {
    try {
        const {
            user_id,
            title,
            description,
            progress,
            target_date
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                message: 'user_id is required'
            });
        }

        if (!title) {
            return res.status(400).json({
                message: 'title is required'
            });
        }

        const result = await db.query(
            `INSERT INTO goals
            (user_id, title, description, progress, target_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                user_id,
                title,
                description || null,
                progress ?? 0,
                target_date || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Create goal error:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                message: 'User does not exist'
            });
        }

        res.status(500).json({
            message: 'Failed to create goal'
        });
    }
};


// Update goal
const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            progress,
            target_date
        } = req.body;

        const result = await db.query(
            `UPDATE goals
             SET title = $1,
                 description = $2,
                 progress = $3,
                 target_date = $4
             WHERE id = $5
             RETURNING *`,
            [
                title,
                description || null,
                progress ?? 0,
                target_date || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Goal not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Update goal error:', error);

        res.status(500).json({
            message: 'Failed to update goal'
        });
    }
};


// Delete goal
const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM goals WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Goal not found'
            });
        }

        res.status(200).json({
            message: 'Goal deleted successfully'
        });

    } catch (error) {
        console.error('Delete goal error:', error);

        res.status(500).json({
            message: 'Failed to delete goal'
        });
    }
};


module.exports = {
    getGoals,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal
};