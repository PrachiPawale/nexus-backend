const db = require('../config/db');

// Get all notes
const getNotes = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM notes ORDER BY created_at DESC'
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Get notes error:', error);

        res.status(500).json({
            message: 'Failed to fetch notes'
        });
    }
};


// Get note by ID
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT * FROM notes WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Note not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Get note error:', error);

        res.status(500).json({
            message: 'Failed to fetch note'
        });
    }
};


// Create note
const createNote = async (req, res) => {
    try {
        const {
            title,
            content,
            user_id
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: 'Title is required'
            });
        }

        const result = await db.query(
            `INSERT INTO notes
            (title, content, user_id)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [
                title,
                content || null,
                user_id || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Create note error:', error);

        res.status(500).json({
            message: 'Failed to create note'
        });
    }
};


// Update note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            content
        } = req.body;

        const result = await db.query(
            `UPDATE notes
             SET title = $1,
                 content = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [
                title,
                content || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Note not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Update note error:', error);

        res.status(500).json({
            message: 'Failed to update note'
        });
    }
};


// Delete note
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM notes WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Note not found'
            });
        }

        res.status(200).json({
            message: 'Note deleted successfully'
        });

    } catch (error) {
        console.error('Delete note error:', error);

        res.status(500).json({
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