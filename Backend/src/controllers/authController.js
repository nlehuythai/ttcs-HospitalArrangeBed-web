const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Truy vấn kiểm tra tài khoản, mật khẩu và trạng thái hoạt động
        const userQuery = await pool.query(
            `SELECT 
        u.id, 
        u.fullname, 
        u.password,
        u.username,
        u.email_personal AS email,
        u.phone,
        u.role, 
        u.khoa_id, 
        k.ten_khoa ,
        u.ma_nhan_vien
     FROM users u
     LEFT JOIN khoa k ON k.id = u.khoa_id 
     WHERE u.username = $1
       AND u.status = $2`,
            [username, 'Hoạt động']
        );

        if (userQuery.rows.length > 0) {
            const userData = userQuery.rows[0];
            const isMatch = await bcrypt.compare(password, userData.password);
            if (isMatch) {
                const payload = {
                    id: userData.id,
                    username: userData.username,
                    role: userData.role,
                    khoa_id: userData.khoa_id
                };

                const token = jwt.sign(
                    payload,
                    'HospitalT&Ntoken',
                    { expiresIn: '1d' }
                );
                delete user.password;
                res.json({
                    success: true,
                    message: 'Đăng nhập thành công',
                    token: token,
                    user: userQuery.rows[0]
                });

            } else {
                res.status(401).json({
                    success: false,
                    message: 'Tài khoản hoặc mật khẩu không chính xác'
                });
            }
        } else {
            res.status(401).json({
                success: false,
                message: 'Tài khoản không tồn tại hoặc đã bị khóa'
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi máy chủ hệ thống');
    }
};
const changePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    try {
        const userQuery = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        const user = userQuery.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });

        }
        const isSameAsOld = await bcrypt.compare(newPassword, user.password);
        if (isSameAsOld) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải khác mật khẩu hiện tại'
            });
        }
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        // Cập nhật mật khẩu mới
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedNewPassword, userId]
        );

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi máy chủ hệ thống');
    }
};

module.exports = { login, changePassword };