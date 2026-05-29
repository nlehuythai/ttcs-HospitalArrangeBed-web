const pool = require('../config/db');

const getAllUsers = async (req, res) => {
    try {
        // Truy vấn lấy dữ liệu theo các cột trong giao diện của bạn
        const allUsers = await pool.query(
            `
            SELECT 
                u.id, 
                u.fullname, 
                u.username, 
                u.password, 
                u.role,  
                k.ten_khoa, -- Giả sử tên cột trong bảng khoa là ten_khoa
                u.status, 
                u.email_personal, 
                u.phone ,
                u.ma_nhan_vien
            FROM users u
            LEFT JOIN khoa k ON u.khoa_id = k.id 
            WHERE u.status !='Khóa' AND u.role!='Admin'
            ORDER BY u.id DESC
        `
        );
        res.json(allUsers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi máy chủ khi lấy danh sách người dùng');
    }
};
const generateUserCode = async (role, khoaId) => {
    try {
        const khoaRes = await pool.query('SELECT ma_khoa FROM khoa WHERE id = $1', [khoaId]);
        const maKhoa = khoaRes.rows[0]?.ma_khoa;

        if (!maKhoa) {
            throw new Error(`Khoa với ID ${khoaId} chưa được cấu hình mã khoa (ma_khoa)`);
        }

        const maxRes = await pool.query(
            `SELECT MAX(CAST(SUBSTRING(ma_nhan_vien FROM '[0-9]+$') AS INTEGER)) as max_num 
             FROM users 
             WHERE khoa_id = $1`,
            [khoaId]
        );

        const nextNumber = (parseInt(maxRes.rows[0].max_num) || 0) + 1;

        // 3. Xác định tiền tố dựa trên vai trò
        let prefix = 'AD';
        if (role === 'Bác sĩ') prefix = 'BS';
        else if (role === 'Y tá') prefix = 'YT';

        // 4. Trả về mã định dạng hoàn chỉnh (VD: BSSAN0005)
        const orderPart = nextNumber.toString().padStart(4, '0');
        return `${prefix}${maKhoa}${orderPart}`;

    } catch (error) {
        console.error("Lỗi chi tiết khi tạo mã:", error.message);
        throw error; // Nên throw lỗi để hàm addUser biết mà dừng lại, không nên dùng "TEMP_CODE"
    }
};
const addUser = async (req, res) => {
    const { fullname, username, password, role, khoa_id, status, email_personal, phone } = req.body;
    try {
        const maNV = await generateUserCode(role, khoa_id);
        const newUser = await pool.query(
            `INSERT INTO users (fullname, username, password, role, khoa_id, status, email_personal, phone, ma_nhan_vien,created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,CURRENT_TIMESTAMP) RETURNING *`,
            [fullname, username, password, role, khoa_id, status, email_personal, phone, maNV]
        );

        res.json({ success: true, user: newUser.rows[0] });
    } catch (err) {
        console.error("Lỗi INSERT:", err.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};
const deleteUser = async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({ message: "Thiếu ID người dùng" });
    }
    try {
        const result = await pool.query(`UPDATE users SET status ='Khóa' WHERE id = $1`, [userId]);
        res.json({ success: true, message: 'Người dùng đã được xóa', user: result.rows[0] });
    } catch (err) {
        console.error("Lỗi DELETE:", err.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};
module.exports = { getAllUsers, addUser, deleteUser };