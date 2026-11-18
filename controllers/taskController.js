const db = require('../config/db');

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "user_id is required"
            });
        }

        const result = await db.query(
            "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC",
            [user_id]
        );

        res.status(200).json({
            success: true,
            tasks: result.rows
        });

    } catch (error) {
        console.error("Get Tasks Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks"
        });
    }
};


// Get a specific task belonging to a user
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "user_id is required"
            });
        }

        const result = await db.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Get task error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch task'
        });
    }
};


// Create task
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            priority,
            due_date,
            user_id
        } = req.body;

        const result = await db.query(
            `INSERT INTO tasks
            (title, description, status, priority, due_date, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                title,
                description || null,
                status || 'pending',
                priority || 'medium',
                due_date || null,
                user_id || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Create task error:', error);

        res.status(500).json({
            message: 'Failed to create task'
        });
    }
};


// Update a user's own task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            status,
            priority,
            due_date,
            user_id
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "user_id is required"
            });
        }

        const result = await db.query(
            `UPDATE tasks
             SET title = $1,
                 description = $2,
                 status = $3,
                 priority = $4,
                 due_date = $5
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [
                title,
                description || null,
                status,
                priority,
                due_date || null,
                id,
                user_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or unauthorized'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Update task error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update task'
        });
    }
};


/// Delete a user's own task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: "user_id is required"
            });
        }

        const result = await db.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found or unauthorized'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete task'
        });
    }
};


module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};