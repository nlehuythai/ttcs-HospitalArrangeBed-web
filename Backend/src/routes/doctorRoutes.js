const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController')
const verifyToken = require('../Middleware/authMiddleware');
router.post('/add-order', verifyToken, doctorController.addOrderEntry)
router.get('/history-order', verifyToken, doctorController.getHistoryOrder)
module.exports = router