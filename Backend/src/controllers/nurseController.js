const pool = require('../config/db');

const waitingList = async (req, res) => {
    const y_ta_id = req.user.id;
    try {
        const list = await pool.query(
            `SELECT h.id as hoso_id, b.ho_ten, b.nam_sinh, k.ten_khoa, h.chan_doan_ban_dau, u.fullname as bac_si_chi_dinh
             FROM hosonhapvien h
             JOIN BenhNhan b ON h.benh_nhan_id = b.id
             JOIN Khoa k ON h.khoa_id = k.id
             JOIN users u ON h.bac_si_id = u.id
             WHERE h.trang_thai_ho_so = 'Chờ xếp giường' AND h.y_ta_id=$1`, [y_ta_id]
        );
        res.json(list.rows);
    } catch (err) {
        res.status(500).json({ message: 'Không thể lấy danh sách chờ' });
    }
};
const assignBed = async (req, res) => {
    const { hoso_id, giuong_id } = req.body;
    const y_ta_id = req.user.id
    const client = await pool.connect();
    if (!hoso_id || !giuong_id || !y_ta_id) {
        return res.status(400).json({
            success: false,
            message: "Thiếu thông tin hoso_id, giuong_id hoặc y_ta_id"
        });
    }
    try {
        await client.query('BEGIN');


        await client.query(
            `UPDATE HoSoNhapVien 
             SET giuong_id = $1, trang_thai_ho_so = 'Đang điều trị' 
             WHERE id = $2`,
            [giuong_id, hoso_id]
        );

        // 2. Cập nhật giường: Đổi trạng thái sang 'Đang sử dụng'
        await client.query(
            `UPDATE Giuong SET trang_thai = 'Đang sử dụng' WHERE id = $1`,
            [giuong_id]
        );
        const logQuery = `
        INSERT INTO lich_su_giuong (
            giuong_id, 
            ho_so_benh_nhan_id, 
            nhan_vien_thuc_hien_id, 
            hanh_dong, 
            trang_thai_cu, 
            trang_thai_moi, 
            ghi_chu,
            thoi_gian
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`;
        await client.query(logQuery, [giuong_id, hoso_id, y_ta_id, 'Tiếp nhận bệnh nhân - Gán giường', 'Trống', 'Đang sử dụng', null]);
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
}
const getnurseInfo = async (req, res) => {
    const { khoa_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT u.id, u.fullname 
             FROM users u
             JOIN khoa k ON k.id = u.khoa_id
             WHERE u.role = 'Y tá' and u.khoa_id = $1
             ORDER BY u.fullname ASC`,
            [khoa_id]
        );
        res.json(result.rows);
        if (result.rows.length === 0) {
            return res.json([]);
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Lỗi khi lấy danh sách y tá" });
    }
};

const getOverviewStats = async (req, res) => {
    const khoa_id = req.user.khoa_id;
    try {
        const khoaResult = await pool.query(
            'SELECT ten_khoa FROM Khoa WHERE id = $1',
            [khoa_id]
        );
        const totalPatients = await pool.query("SELECT COUNT(*) FROM HoSoNhapVien WHERE trang_thai_ho_So!='Đã xuất viện' AND khoa_id = $1", [khoa_id]);
        const inTreatment = await pool.query("SELECT COUNT(*) FROM HoSoNhapVien WHERE trang_thai_ho_so = 'Đang điều trị' AND khoa_id = $1", [khoa_id]);
        const waiting = await pool.query("SELECT COUNT(*) FROM HoSoNhapVien WHERE trang_thai_ho_so = 'Chờ xếp giường' AND khoa_id = $1", [khoa_id]);

        const beds = await pool.query('SELECT COUNT(*) FROM Giuong g JOIN phong p ON g.phong_id = p.id WHERE p.khoa_id = $1 AND g.is_deleted=false', [khoa_id]);
        const occupiedBeds = await pool.query("SELECT COUNT(*) FROM Giuong g JOIN phong p ON g.phong_id = p.id  WHERE trang_thai = 'Đang sử dụng' AND p.khoa_id = $1", [khoa_id]);
        const cleanBeds = await pool.query("SELECT COUNT(*) FROM Giuong g JOIN phong p ON g.phong_id = p.id WHERE trang_thai = 'Đang dọn dẹp' AND p.khoa_id = $1", [khoa_id]);
        const roomStats = await pool.query(`
            SELECT 
                p.ten_phong, 
                COUNT(DISTINCT hs.id) as so_luong,
                COUNT(DISTINCT g.id) as so_luong_g
            FROM Phong p
            JOIN giuong g on g.phong_id= p.id
            LEFT JOIN HoSoNhapVien hs ON hs.giuong_id  = g.id
            AND hs.trang_thai_ho_So != 'Đã xuất viện'
            WHERE p.khoa_id = $1
            GROUP BY p.id, p.ten_phong
            ORDER BY p.ten_phong ASC
    `, [khoa_id])
        const totalP = parseInt(totalPatients.rows[0].count) || 0;
        const treatmentP = parseInt(inTreatment.rows[0].count) || 0;
        const waitingP = parseInt(waiting.rows[0].count) || 0;

        const totalB = parseInt(beds.rows[0].count) || 0;
        const occupiedB = parseInt(occupiedBeds.rows[0].count) || 0;
        const cleanB = parseInt(cleanBeds.rows[0].count) || 0;
        const emptyB = totalB - occupiedB - cleanB;
        const ten_khoa = khoaResult.rows[0]?.ten_khoa || "Khoa của bạn";
        // 3. Trả về JSON đúng cấu trúc Frontend cần
        res.json({
            ten_khoa: ten_khoa,
            patients: {
                total: totalP,
                inTreatment: treatmentP,
                waiting: waitingP,
                ready: 0
            },
            beds: {
                total: totalB,
                occupied: occupiedB,
                clean: cleanB,
                empty: emptyB
            },
            rooms: roomStats.rows.map(row => ({
                name: row.ten_phong,
                count: parseInt(row.so_luong),
                countG: parseInt(row.so_luong_g)
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getPendingActions = async (req, res) => {
    const nurse_id = req.user.id;
    try {
        const pendingActions = await pool.query(
            `SELECT COUNT(*) as total_pending
            FROM (
                SELECT h.id 
                FROM hosonhapvien h
                WHERE h.trang_thai_ho_so IN ('Chờ xếp giường', 'Chờ xuất viện') 
                AND h.y_ta_id = $1

            UNION ALL 
    
            SELECT y.id 
            FROM ylenh y
            WHERE y.trang_thai = 'Chờ thực hiện' 
            AND y.y_ta_id = $1
) as todo_list ;`,
            [nurse_id]
        );
        res.json(parseInt(pendingActions.rows[0].total_pending));
    } catch (error) {
        res.status(500).json({ error: "Lỗi lấy thông báo" });
    }
};
const getNurseTasks = async (req, res) => {
    const y_ta_id = req.user.id;
    if (!y_ta_id) {
        return res.status(400).json({
            message: "Thiếu thông tin: Mã y tá!"
        });
    }
    try {
        const nurseTasks = await pool.query(
            `SELECT yl.*, bn.ho_ten, g.ma_giuong, p.ten_phong, u.fullname as ten_bac_si
             FROM ylenh yl
             JOIN hosonhapvien nv ON yl.ho_so_id = nv.id
             JOIN benhnhan bn on bn.id=nv.benh_nhan_id
             JOIN giuong g on nv.giuong_id=g.id
             JOIN phong p on g.phong_id=p.id
             JOIN users u on u.id=yl.bac_si_id 
             WHERE nv.y_ta_id = $1
             ORDER BY yl.thoi_gian_chi_dinh DESC;`,
            [y_ta_id]);
        res.status(200).json(nurseTasks.rows);
    } catch (err) {
        console.error("Lỗi lấy danh sách công việc y tá:", err);
        res.status(500).json({
            message: "Lỗi hệ thống",
            error: err.message
        });
    }

};
const completeOrder = async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: "Thiếu thông tin: Mã y lệnh cần cập nhật!"
        });
    }
    try {
        const updateOrder = await pool.query(`
            UPDATE ylenh 
             SET trang_thai = 'Đã hoàn thành' 
             WHERE id = $1 
             RETURNING *;
            `, [orderId]);
        if (updateOrder.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy y lệnh này trong hệ thống!"
            });
        }
        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái y lệnh hoàn thành!",
            data: updateOrder.rows[0]
        });
    } catch (err) {
        console.error("Lỗi khi cập nhật hoàn thành y lệnh:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống không thể cập nhật trạng thái",
            error: err.message
        });
    }
};
module.exports = { waitingList, assignBed, getnurseInfo, getOverviewStats, getPendingActions, getNurseTasks, completeOrder };