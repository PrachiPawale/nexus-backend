const db = require('../config/db');

// Get all calendar events
const getEvents = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT *
             FROM calendar_events
             ORDER BY start_time ASC`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Get calendar events error:', error);

        res.status(500).json({
            message: 'Failed to fetch calendar events'
        });
    }
};


// Get event by ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT *
             FROM calendar_events
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Calendar event not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Get calendar event error:', error);

        res.status(500).json({
            message: 'Failed to fetch calendar event'
        });
    }
};


// Create calendar event
const createEvent = async (req, res) => {
    try {
        const {
            user_id,
            title,
            description,
            start_time,
            end_time
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

        if (!start_time) {
            return res.status(400).json({
                message: 'start_time is required'
            });
        }

        const result = await db.query(
            `INSERT INTO calendar_events
            (user_id, title, description, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                user_id,
                title,
                description || null,
                start_time,
                end_time || null
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Create calendar event error:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                message: 'User does not exist'
            });
        }

        res.status(500).json({
            message: 'Failed to create calendar event'
        });
    }
};


// Update calendar event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            start_time,
            end_time
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: 'title is required'
            });
        }

        if (!start_time) {
            return res.status(400).json({
                message: 'start_time is required'
            });
        }

        const result = await db.query(
            `UPDATE calendar_events
             SET title = $1,
                 description = $2,
                 start_time = $3,
                 end_time = $4
             WHERE id = $5
             RETURNING *`,
            [
                title,
                description || null,
                start_time,
                end_time || null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Calendar event not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Update calendar event error:', error);

        res.status(500).json({
            message: 'Failed to update calendar event'
        });
    }
};


// Delete calendar event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `DELETE FROM calendar_events
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Calendar event not found'
            });
        }

        res.status(200).json({
            message: 'Calendar event deleted successfully'
        });

    } catch (error) {
        console.error('Delete calendar event error:', error);

        res.status(500).json({
            message: 'Failed to delete calendar event'
        });
    }
};


module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};