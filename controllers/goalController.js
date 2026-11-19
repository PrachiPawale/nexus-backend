const db = require('../config/db');

// Get all goals for a specific user
const getGoals = async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const result = await db.query(
            'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );

        res.status(200).json({
            success: true,
            goals: result.rows
        });

    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch goals'
        });
    }
};


// Get a specific goal belonging to a user
const getGoalById = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const result = await db.query(
            'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }

        res.status(200).json({
            success: true,
            goal: result.rows[0]
        });

    } catch (error) {
        console.error('Get goal error:', error);
        res.status(500).json({
            success: false,
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

        if (!user_id || !title) {
            return res.status(400).json({
                success: false,
                message: 'user_id and title are required'
            });
        }

        if (progress !== undefined &&
            (!Number.isFinite(Number(progress)) ||
             Number(progress) < 0 ||
             Number(progress) > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Progress must be between 0 and 100'
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

        res.status(201).json({
            success: true,
            goal: result.rows[0]
        });

    } catch (error) {
        console.error('Create goal error:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'User does not exist'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create goal'
        });
    }
};


// Update goal
const updateGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            user_id,
            title,
            description,
            progress,
            target_date
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        if (
            title === undefined &&
            description === undefined &&
            progress === undefined &&
            target_date === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'Provide at least one field to update'
            });
        }

        if (progress !== undefined &&
            (!Number.isFinite(Number(progress)) ||
             Number(progress) < 0 ||
             Number(progress) > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Progress must be between 0 and 100'
            });
        }

        const result = await db.query(
            `UPDATE goals
             SET title = COALESCE($1, title),
                 description = CASE WHEN $2 THEN $3 ELSE description END,
                 progress = COALESCE($4, progress),
                 target_date = CASE WHEN $5 THEN $6 ELSE target_date END
             WHERE id = $7 AND user_id = $8
             RETURNING *`,
            [
                title ?? null,
                description !== undefined,
                description ?? null,
                progress ?? null,
                target_date !== undefined,
                target_date ?? null,
                id,
                user_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }

        res.status(200).json({
            success: true,
            goal: result.rows[0]
        });

    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update goal'
        });
    }
};


// Delete goal
const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const result = await db.query(
            'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Goal deleted successfully'
        });

    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({
            success: false,
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