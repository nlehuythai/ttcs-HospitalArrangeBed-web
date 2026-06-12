const express = require('express');
const router = express.Router();
const bedsController = require('../controllers/bedsController');
const nurseController = require('../controllers/nurseController');
const verifyToken = require('../Middleware/authMiddleware');
// Các đường dẫn API
router.get('/beds', verifyToken, bedsController.getAllInfoBeds);
router.get('/nurse/waiting-list', verifyToken, nurseController.waitingList);
router.post('/nurse/assign-bed', verifyToken, nurseController.assignBed);
router.get('/nurse/overview-stats', verifyToken, nurseController.getOverviewStats);
router.get('/nurse/pending-actions', verifyToken, nurseController.getPendingActions);
router.get('/rooms', bedsController.getAllRooms);
router.get('/nurse-task', verifyToken, nurseController.getNurseTasks);
router.patch('/orders/:orderId/complete', nurseController.completeOrder)
router.get('/beds/:id/patient', bedsController.getCurrentInpatientsOnBed);
router.post('nurse/report-bed', verifyToken, nurseController.orderChangeStatusBed);
module.exports = router;