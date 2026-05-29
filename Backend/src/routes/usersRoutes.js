const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const nurseController = require('../controllers/nurseController');
// Định nghĩa route GET để lấy danh sách người dùng
router.get('/', userController.getAllUsers);

// Định nghĩa route POST để thêm người dùng mới
router.post('/add', userController.addUser);
router.get('/nurses/info/:khoa_id', nurseController.getnurseInfo);
router.patch('/delete/:id', userController.deleteUser);

module.exports = router;