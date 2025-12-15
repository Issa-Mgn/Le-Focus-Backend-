const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Routes mounted at /api/comments

// Like a comment
router.post('/:commentId/like', commentController.likeComment);

// Reply to a comment
router.post('/:commentId/replies', commentController.replyToComment);

module.exports = router;
