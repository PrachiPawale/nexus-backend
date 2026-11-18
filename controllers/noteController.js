const db = require('../config/db');

// Get all notes for a specific user
const getNotes = async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        const result = await db.query(
            'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );

        res.status(200).json({
            success: true,
            notes: result.rows
        });

    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notes'
        });
    }
};


// Get a specific note belonging to a user
const getNoteById = async (req, res) => {
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
            'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            note: result.rows[0]
        });

    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch note'
        });
    }
};


// Create note
const createNote = async (req, res) => {
    try {
        const { title, content, user_id } = req.body;

        if (!title || !user_id) {
            return res.status(400).json({
                success: false,
                message: 'Title and user_id are required'
            });
        }

        const result = await db.query(
            `INSERT INTO notes (title, content, user_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [title, content || null, user_id]
        );

        res.status(201).json({
            success: true,
            note: result.rows[0]
        });

    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create note'
        });
    }
};


// Update note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required'
            });
        }

        if (title === undefined && content === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Provide a title or content to update'
            });
        }

        const result = await db.query(
            `UPDATE notes
             SET title = CASE WHEN $1::boolean THEN $2 ELSE title END,
                 content = CASE WHEN $3::boolean THEN $4 ELSE content END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 AND user_id = $6
             RETURNING *`,
            [
                title !== undefined,
                title,
                content !== undefined,
                content,
                id,
                user_id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            note: result.rows[0]
        });

    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update note'
        });
    }
};


// Delete note
const deleteNote = async (req, res) => {
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
            'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });

    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete note'
        });
    }
};


module.exports = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
};