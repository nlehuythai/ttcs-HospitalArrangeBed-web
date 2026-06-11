const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const brevo = require('@getbrevo/brevo');
const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);
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
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc bị khóa' });
        }
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
                const userResponse = { ...userData };
                delete userResponse.password;
                res.json({
                    success: true,
                    message: 'Đăng nhập thành công',
                    token: token,
                    user: userResponse
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

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Kiểm tra email có tồn tại không
        const userCheck = await pool.query('SELECT id FROM users WHERE email_personal= $1', [email]);
        if (userCheck.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Email không tồn tại trong hệ thống!' });
        }

        // 2. Tạo mã OTP ngẫu nhiên (6 số)
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

        // 3. Lưu OTP vào DB
        // Lưu ý: Bạn cần tạo bảng 'password_resets' trước hoặc lưu vào một bảng tạm
        await pool.query(
            `INSERT INTO password_resets (email, otp, expires_at) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3`,
            [email, otp, expiresAt]
        );

        // 4. Gửi email
        // 4. Gửi email qua Brevo API (Thay cho nodemailer)
        let sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "Mã xác thực khôi phục mật khẩu";
        sendSmtpEmail.sender = { "name": "T&N Hospital", "email": "nlht081005@gmail.com" };
        sendSmtpEmail.to = [{ "email": email }];
        sendSmtpEmail.htmlContent = `<html><body><p>Chào bạn, mã OTP của bạn là: <strong>${otp}</strong>.</p></body></html>`;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        res.json({ success: true, message: 'Mã OTP đã được gửi về email của bạn!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi gửi email!' });
    }
};
const verifyAndReset = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // 1. Kiểm tra OTP và thời hạn
        const result = await pool.query(
            `SELECT otp, expires_at FROM password_resets WHERE email = $1`,
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ success: false, message: 'Yêu cầu không tồn tại!' });
        }

        const { otp: storedOtp, expires_at } = result.rows[0];

        // Kiểm tra mã OTP
        if (storedOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Mã OTP không chính xác!' });
        }

        // Kiểm tra thời hạn
        if (new Date() > new Date(expires_at)) {
            return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn!' });
        }

        // 2. Hash mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 3. Cập nhật mật khẩu vào bảng users
        await pool.query('UPDATE users SET password = $1 WHERE email_personal = $2', [hashedPassword, email]);

        // 4. Xóa bản ghi OTP đã dùng
        await pool.query('DELETE FROM password_resets WHERE email = $1', [email]);

        res.json({ success: true, message: 'Đổi mật khẩu thành công!' });

    } catch (err) {
        console.error("--- CHI TIẾT LỖI GỬI EMAIL ---");
        console.error(err);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ!' });
    }
};
module.exports = { login, changePassword, forgotPassword, verifyAndReset, };