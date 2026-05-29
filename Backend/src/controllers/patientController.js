const pool = require('../config/db');

const getPatientRecords = async (req, res) => {
    try {
        const y_ta_id = req.user.id;
        const query = `
            SELECT h.id, b.ho_ten, b.nam_sinh, b.gioi_tinh, k.ten_khoa, 
                   g.ma_giuong, p.ten_phong, u.fullname as bac_si, 
                   h.khoa_id,h.chan_doan_ban_dau, h.thoi_gian_nhap_vien, h.trang_thai_ho_so,
                   (CURRENT_DATE::date - h.thoi_gian_nhap_vien::date) as so_ngay,
                   h.cap_do as cap_do_cham_soc
            FROM HoSoNhapVien h
            JOIN BenhNhan b ON h.benh_nhan_id = b.id
            JOIN Khoa k ON h.khoa_id = k.id
            JOIN users u ON h.bac_si_id = u.id
            LEFT JOIN Giuong g ON h.giuong_id = g.id
            LEFT JOIN Phong p ON g.phong_id = p.id
            WHERE h.trang_thai_ho_so IN ('Chờ xếp giường', 'Đang điều trị', 'Chờ xuất viện')  
            AND h.y_ta_id = $1
            ORDER BY h.id DESC
        `;
        const result = await pool.query(query, [y_ta_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi máy chủ khi lấy hồ sơ nội trú');
    }
};
const getInpatient = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(`
            SELECT
                bn.id as benh_nhan_id, 
                bn.ho_ten, 
                bn.nam_sinh, 
                bn.gioi_tinh, 
                bn.so_dien_thoai, 
                bn.dia_chi, 
                bn.so_bhyt,
                hs.id,
                hs.chan_doan_ban_dau, 
                hs.ly_do_nhap_vien, 
                hs.benh_su,
                hs.thoi_gian_nhap_vien,
                k.ten_khoa,
                g.ma_giuong,
                p.ten_phong,
                nv.fullname as ten_bac_si,
                hs.nhom_mau,
                db.huyet_ap,
                db.nhip_tho,
                db.nhiet_do
            FROM BenhNhan bn
            JOIN HoSoNhapVien hs ON bn.id = hs.benh_nhan_id
            LEFT JOIN Khoa k ON hs.khoa_id = k.id
            LEFT JOIN Giuong g ON hs.giuong_id = g.id
            LEFT JOIN Phong p ON g.phong_id = p.id
            LEFT JOIN users nv ON hs.bac_si_id = nv.id
            LEFT JOIN DIENBIENBENH db ON db.ho_so_id = hs.id AND db.id = (
                SELECT MAX(id) FROM DIENBIENBENH WHERE ho_so_id = hs.id
            )
            WHERE hs.trang_thai_ho_so = 'Đang điều trị' AND hs.bac_si_id = $1
            ORDER BY hs.thoi_gian_nhap_vien DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const dischargeOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const queryUpdate = `
           UPDATE hosonhapvien 
            SET 
                trang_thai_ho_so = 'Chờ xuất viện',
                ngay_ra_lenh = NOW()
            
            WHERE id = $1
            RETURNING *;
        `;

        const result = await pool.query(queryUpdate, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Không tìm thấy hồ sơ bệnh án." });
        }

        res.status(200).json({ success: true, message: "Đã ghi nhận ngày ra lệnh xuất viện.", data: result.rows[0] });
    } catch (error) {
        console.error("Lỗi SQL:", error.message);
        res.status(500).json({ message: "Lỗi khi cập nhật database." });
    }
};
const getWaitingDischarge = async (req, res) => {
    const nurseId = req.user.id;
    try {
        const query = `
            SELECT 
                h.id, 
                b.ho_ten, 
                b.nam_sinh, 
                b.gioi_tinh, 
                h.giuong_id, 
                h.chan_doan_ban_dau,
                k.ten_khoa,
                u.fullName,
                g.ma_giuong,
                TO_CHAR(ngay_ra_lenh, 'DD/MM/YYYY') as ngay_ra_lenh
            FROM hosonhapvien h
            JOIN khoa k on k.id=h.khoa_id
            JOIN benhnhan b  on b.id=h.benh_nhan_id
            JOIN USERS u on u.id=h.bac_si_id
            JOIN Giuong g on g.id=h.giuong_id
            WHERE trang_thai_ho_so = 'Chờ xuất viện' 
            AND y_ta_id=$1
            ORDER BY ngay_ra_lenh DESC;
        `;
        const result = await pool.query(query, [nurseId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Lỗi getWaitingDischarge:", error.message);
        res.status(500).json({ message: "Lỗi lấy danh sách chờ xuất viện" });
    }
};
const completeDischarge = async (req, res) => {
    const { id } = req.params;
    const nurseId = req.user.id;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const findHoSo = await client.query(
            "SELECT giuong_id FROM hosonhapvien WHERE id = $1",
            [id]
        );

        if (findHoSo.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hồ sơ bệnh nhân" });
        }

        const giuongId = findHoSo.rows[0].giuong_id;
        await client.query(
            "UPDATE hosonhapvien SET trang_thai_ho_so = 'Đã xuất viện', ngay_xuat_vien = CURRENT_TIMESTAMP WHERE id = $1",
            [id]
        );
        if (giuongId) {
            await client.query(
                "UPDATE giuong SET trang_thai = 'Đang dọn dẹp' WHERE id = $1",
                [giuongId]
            );
        }
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
        await client.query(logQuery, [giuongId, id, nurseId, 'Bệnh nhân xuất viện', 'Đang sử dụng', 'Đang dọn dẹp', 'Hoàn tất quy trình xuất viện']);
        await client.query('COMMIT');
        res.status(200).json({
            success: true,
            message: "Quy trình xuất viện hoàn tất, giường đã được giải phóng."
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Hủy bỏ các thay đổi nếu có lỗi
        console.error("Lỗi completeDischarge:", error.message);
        res.status(500).json({ success: false, message: "Lỗi hệ thống: " + error.message });
    } finally {
        client.release(); // Giải phóng client trả về pool
    }
};
module.exports = { getPatientRecords, getInpatient, dischargeOrder, getWaitingDischarge, completeDischarge };