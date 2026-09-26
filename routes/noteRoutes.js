const express = require('express');

const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote
} = require('../controllers/notecontroller');

const router = express.Router();

router.get('/', getNotes);

router.get('/:id', getNoteById);

router.post('/', createNote);

router.put('/:id', updateNote);

router.delete('/:id', deleteNote);

module.exports = router;