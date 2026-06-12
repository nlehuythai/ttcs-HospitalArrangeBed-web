const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../Middleware/authMiddleware');
// Các đường dẫn API
router.get('/reports/:selectedMonth', adminController.getReports);
router.put('/managebeds/:id', verifyToken, adminController.updateStatusBed);
router.get('/bed-history/:id', adminController.getBedHistory);
router.get('/totalbeds', adminController.getTotalBeds);
router.patch('/delete-bed/:id', verifyToken, adminController.deleteBed);
router.post('/add-bed', adminController.addBed);
router.get('/bed-reports', verifyToken, adminController.getReportBed)
router.patch('/approve-report/:reportId', verifyToken, adminController.updateStatusReport)
module.exports = router;