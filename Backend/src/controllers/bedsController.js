const pool = require('../config/db');

const getAllInfoBeds = async (req, res) => {
    const khoa_id = req.user.khoa_id;
    try {
        const result = await pool.query(`
            SELECT g.id, g.ma_giuong, g.trang_thai, p.ten_phong, k.ten_khoa,k.id as khoa_id,b.ho_ten as ten_bn,b.id as benh_nhan_id,u.fullname as ten_bs
            FROM giuong g
            JOIN phong p ON g.phong_id = p.id
            JOIN khoa k ON p.khoa_id = k.id
            LEFT JOIN HoSoNhapVien h on h.giuong_id=g.id and h.trang_thai_ho_so='Đang điều trị'
            LEFT JOIN BenhNhan b on b.id=h.benh_nhan_id 
            LEFT JOIN Users u on u.id=h.bac_si_id
            WHERE k.id = $1 AND g.is_deleted = false
            ORDER BY k.ten_khoa, p.ten_phong, g.ma_giuong

        `, [khoa_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const getAllRooms = async (req, res) => {
    try {
        const queryRooms = await pool.query(`
            SELECT p.id, p.ten_phong
            FROM phong p
            `);
        res.json(queryRooms.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xuất tất cả các hàm liên quan đến giường
module.exports = { getAllInfoBeds, getAllRooms };