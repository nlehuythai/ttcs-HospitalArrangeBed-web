const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const nurseController = require('../controllers/nurseController');
const verifyToken = require('../Middleware/authMiddleware');

router.get('/', userController.getAllUsers);
router.post('/add', userController.addUser);
router.get('/nurses/info/:khoa_id', nurseController.getnurseInfo);
router.patch('/delete/:id', userController.deleteUser);
router.post('/ping', verifyToken, userController.handlePing);
router.patch('/reset-password', verifyToken, userController.handleResetPassword);
router.patch('/update', verifyToken, userController.handleUpdateProfile);
module.exports = router;