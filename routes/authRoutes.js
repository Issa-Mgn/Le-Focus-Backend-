const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', require('../middlewares/authMiddleware'), authController.register); // Only connected admins can create new admins
// router.post('/register-admin', authController.registerInitialAdmin); // Uncomment only to create first admin

module.exports = router;
