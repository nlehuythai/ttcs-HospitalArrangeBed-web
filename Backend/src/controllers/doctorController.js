const pool = require('../config/db')
const addOrderEntry = async (req, res) => {
    const {
        ho_so_id,
        y_ta_id,
        noi_dung_y_lenh,
        loai_y_lenh,
    } = req.body;
    const bac_si_id = req.user.id;
    if (!ho_so_id || !bac_si_id || !noi_dung_y_lenh) {
        return res.status(400).json({
            message: "Thiếu thông tin: Mã hồ sơ, bác sĩ và nội dung là bắt buộc!"
        });
    }
    try {
        const newOrder = await pool.query(
            `INSERT INTO YLenh (
                ho_so_id, 
                bac_si_id, 
                y_ta_id,
                noi_dung_y_lenh, 
                loai_y_lenh, 
                thoi_gian_chi_dinh,
                trang_thai
            ) 
            VALUES ($1, $2, $3, $4,$5, CURRENT_TIMESTAMP, 'Chờ thực hiện') 
            RETURNING *`,
            [ho_so_id, bac_si_id, y_ta_id, noi_dung_y_lenh, loai_y_lenh || 'Thuốc']
        );
        res.status(201).json({
            message: "Tạo y lệnh thành công",
            order: newOrder.rows[0]
        });

    } catch (error) {
        console.error("Lỗi khi tạo y lệnh:", error.message);
        res.status(500).json({
            message: "Lỗi hệ thống không thể tạo y lệnh",
            error: error.message
        });
    }
}
const getHistoryOrder = async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(400).json({
            message: "Thiếu thông tin: Mã bác sĩ !"
        });
    }
    try {
        const historyOrder = await pool.query(
            `Select * from ylenh where bac_si_id=$1 AND thoi_gian_chi_dinh >= NOW() - INTERVAL '7 days' ORDER BY thoi_gian_chi_dinh DESC;`, [userId]
        );
        res.status(200).json(historyOrder.rows);
    } catch (err) {
        console.error("Lỗi lấy danh sách lịch sử y lệnh:", err);
        res.status(500).json({
            message: "Lỗi hệ thống không thể lấy lịch sử y lệnh",
            error: err.message
        })
    }

};
module.exports = { addOrderEntry, getHistoryOrder };