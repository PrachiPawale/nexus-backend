const db = require('../config/db');

const getDashboard = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Check user exists
        const userResult = await db.query(
            `SELECT id, name, email, created_at
             FROM users
             WHERE id = $1`,
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Get task summary
        const taskResult = await db.query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed
             FROM tasks
             WHERE user_id = $1`,
            [user_id]
        );

        // Get goals
        const goalResult = await db.query(
            `SELECT
                COUNT(*) AS total,
                COALESCE(ROUND(AVG(progress)), 0) AS average_progress
             FROM goals
             WHERE user_id = $1`,
            [user_id]
        );

        // Get notes count
        const noteResult = await db.query(
            `SELECT COUNT(*) AS total
             FROM notes
             WHERE user_id = $1`,
            [user_id]
        );

        // Get upcoming calendar events
        const eventResult = await db.query(
            `SELECT *
             FROM calendar_events
             WHERE user_id = $1
             AND start_time >= NOW()
             ORDER BY start_time ASC
             LIMIT 5`,
            [user_id]
        );

        // Get recent tasks
        const recentTaskResult = await db.query(
            `SELECT *
             FROM tasks
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 5`,
            [user_id]
        );

        // Get active goals
        const activeGoalResult = await db.query(
            `SELECT *
             FROM goals
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 5`,
            [user_id]
        );

        res.status(200).json({
            user: userResult.rows[0],

            summary: {
                tasks: taskResult.rows[0],
                goals: goalResult.rows[0],
                notes: noteResult.rows[0]
            },

            upcoming_events: eventResult.rows,

            recent_tasks: recentTaskResult.rows,

            goals: activeGoalResult.rows
        });

    } catch (error) {
        console.error('Dashboard error:', error);

        res.status(500).json({
            message: 'Failed to fetch dashboard'
        });
    }
};

module.exports = {
    getDashboard
};