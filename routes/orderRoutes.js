const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public: Create order
router.post('/', orderController.createOrder);

// Protected: Admin views and updates
router.get('/', authMiddleware, orderController.getAllOrders);
router.patch('/:id/status', authMiddleware, orderController.updateOrderStatus);

module.exports = router;
