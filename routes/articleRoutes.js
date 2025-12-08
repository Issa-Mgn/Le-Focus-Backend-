const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Public Routes
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// Protected Routes (Admin only)
const articleUploads = upload.fields([
    { name: 'cover_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 3 },
    { name: 'pdf_file', maxCount: 1 }
]);

router.post('/', authMiddleware, articleUploads, articleController.createArticle);
router.put('/:id', authMiddleware, articleUploads, articleController.updateArticle);
router.delete('/:id', authMiddleware, articleController.deleteArticle);

module.exports = router;
