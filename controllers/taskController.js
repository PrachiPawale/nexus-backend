const db = require('../config/db');

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM tasks ORDER BY created_at DESC'
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Get tasks error:', error);

        res.status(500).json({
            message: 'Failed to fetch tasks'
        });
    }
};


// Get task by ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT * FROM tasks WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Get task error:', error);

        res.status(500).json({
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


// Update task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            status,
            priority,
            due_date
        } = req.body;

        const result = await db.query(
            `UPDATE tasks
             SET title = $1,
                 description = $2,
                 status = $3,
                 priority = $4,
                 due_date = $5
             WHERE id = $6
             RETURNING *`,
            [
                title,
                description || null,
                status,
                priority,
                due_date || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Update task error:', error);

        res.status(500).json({
            message: 'Failed to update task'
        });
    }
};


// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Task not found'
            });
        }

        res.status(200).json({
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error);

        res.status(500).json({
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