const pool = require('../config/db');

const getReports = async (req, res) => {
    const { selectedMonth } = req.params;
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = `${year}-${month}-01`;
    const endDate = month === 12
        ? `${year + 1}-01-01`
        : `${year}-${month + 1}-01`;
    try {
        const stats = await pool.query(`
             SELECT 
                (SELECT COUNT(*) FROM users WHERE created_at< $1 ) as total_users,
                (SELECT COUNT(*) FROM users WHERE role = 'Bác sĩ' AND created_at<$1) as total_doctors,
                (SELECT COUNT(*) FROM users WHERE role = 'Y tá' AND created_at<$1) as total_nurses,
                (SELECT COUNT(*) FROM hosonhapvien WHERE thoi_gian_nhap_vien<$1 AND thoi_gian_nhap_vien>=$2) as total_patients_monthly,   
                (SELECT COUNT(*) FROM hosonhapvien WHERE trang_thai_ho_so = 'Đang điều trị') as active_patients,
                (SELECT COUNT(*) FROM hosonhapvien WHERE trang_thai_ho_so = 'Đang điều trị' AND thoi_gian_nhap_vien<$1 AND thoi_gian_nhap_vien>=$2) as new_active_patients,
                (SELECT COUNT(*) FROM hosonhapvien WHERE trang_thai_ho_so = 'Đã xuất viện' AND ngay_xuat_vien<$1 AND ngay_xuat_vien>=$2) as discharge_patients,                
                (SELECT COUNT(*) FROM giuong WHERE giuong.is_deleted=false) as total_beds,
                (SELECT COUNT(*) FROM giuong WHERE giuong.is_deleted=false AND created_at<$1 AND (deleted_at>$1 or deleted_at IS NULL) )as total_beds_month,
                (SELECT COUNT(*) FROM giuong WHERE trang_thai = 'Đang sử dụng') as occupied_beds,
                (SELECT COUNT(*) FROM users Where status='Hoạt động' ) as active_account,
                (SELECT 
                COALESCE(SUM(
                    EXTRACT(DAY FROM (
                        LEAST(COALESCE(ngay_xuat_vien, CURRENT_DATE), $1::date) - 
                        GREATEST(thoi_gian_nhap_vien, $2::date)
                    )) + 1
                ), 0) as total_patient_days),
        `, [endDate, startDate]);

        const data = stats.rows[0];

        // Tính toán tỷ lệ lấp đầy
        const totalBeds = parseInt(data.total_beds) || 0;
        const occupiedBeds = parseInt(data.occupied_beds) || 0;
        const total_patients_monthly = parseInt(data.total_patient_days) || 0;
        const total_beds_month = parseInt(data.total_beds_month) || 0;
        const occupancyRateMonth = total_patients_monthly > 0 && total_beds_month > 0 ? ((total_patients_monthly / (total_beds_month * 30)) * 100).toFixed(1) : 0;
        const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;
        res.json({
            ...data,
            occupancy_Rate_Month: occupancyRateMonth + "%",
            occupancy_rate: occupancyRate + "%"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const updateStatusBed = async (req, res) => {
    const bedId = req.params.id;
    const { trang_thai } = req.body;
    const admin_id = req.user.id;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            "SELECT trang_thai FROM giuong WHERE id = $1",
            [bedId]
        );
        const rows = result.rows;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy giường bệnh" });
        }
        const currentStatus = rows[0].trang_thai;
        if (currentStatus === "Đang sử dụng") {
            return res.status(403).json({
                success: false,
                message: `Quyền Admin bị hạn chế: Không thể sửa giường đang ở trạng thái '${currentStatus}'.`
            });
        }

        await client.query('UPDATE giuong SET trang_thai = $1 WHERE id = $2', [trang_thai, bedId]);
        const logQuery = `
            INSERT INTO lich_su_giuong (
                giuong_id, 
                nhan_vien_thuc_hien_id, 
                hanh_dong, 
                trang_thai_cu, 
                trang_thai_moi, 
                ghi_chu
            ) VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await client.query(logQuery, [
            bedId,
            admin_id,
            'Cập nhật trạng thái',
            currentStatus,
            trang_thai,
            `Admin thay đổi trạng thái thủ công từ ${currentStatus} sang ${trang_thai}`
        ]);
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Cập nhật thành công" });
    }
    catch (error) {
        console.error(error); // In ra màn hình console của Node.js
        res.status(500).json({ message: "Lỗi hệ thống", detail: error.message });
    }
};
const getBedHistory = async (req, res) => {
    const bedId = req.params.id;
    try {
        const query = `
                SELECT
                    g.ma_giuong,
                    lsg.trang_thai_cu,
                    lsg.trang_thai_moi,
                    lsg.hanh_dong,
                    lsg.thoi_gian,
                    u.fullname as nhan_vien_ten
                FROM lich_su_giuong lsg
                JOIN GIUONG g ON lsg.giuong_id = g.id
                join users u on lsg.nhan_vien_thuc_hien_id = u.id
                where g.id = $1 AND lsg.thoi_gian >= NOW() - INTERVAL '7 days'
                ORDER BY lsg.thoi_gian DESC;
        `;
        const result = await pool.query(query, [bedId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi hệ thống", detail: error.message });
    }
};
const getTotalBeds = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT g.id, g.ma_giuong, g.trang_thai, p.ten_phong, k.ten_khoa,k.id as khoa_id,b.ho_ten as ten_bn,b.id as benh_nhan_id,u.fullname as ten_bs
            FROM giuong g
            JOIN phong p ON g.phong_id = p.id
            JOIN khoa k ON p.khoa_id = k.id
            LEFT JOIN HoSoNhapVien h on h.giuong_id=g.id and h.trang_thai_ho_so IN ('Đang điều trị', 'Chờ xuất viện')
            LEFT JOIN BenhNhan b on b.id=h.benh_nhan_id 
            LEFT JOIN Users u on u.id=h.bac_si_id
            WHERE g.is_deleted = false
            ORDER BY k.ten_khoa, p.ten_phong, g.ma_giuong`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const deleteBed = async (req, res) => {
    const bedId = req.params.id;
    const admin_id = req.user.id;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const checkBed = await client.query('SELECT * FROM giuong WHERE id = $1', [bedId]);
        if (checkBed.rows[0].trang_thai !== 'Trống') {
            throw new Error('Không thể xóa giường đang sử dụng hoặc đang dọn dẹp');
        }
        await client.query(`UPDATE GIUONG SET is_deleted=true, trang_thai = 'Ngừng hoạt động',
                 deleted_at = NOW() WHERE id = $1`, [bedId]);
        await client.query(
            `INSERT INTO lich_su_giuong (giuong_id, nhan_vien_thuc_hien_id, hanh_dong, trang_thai_cu, trang_thai_moi)
             VALUES ($1, $2, 'Xóa giường', 'Trống', 'Ngừng hoạt động')`,
            [bedId, admin_id]
        );
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Xóa giường thành công" });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Lỗi hệ thống", detail: error.message });
    } finally {
        client.release();
    }
};
const addBed = async (req, res) => {
    const { ma_giuong, phong_id, trang_thai, admin_id } = req.body;
    if (!ma_giuong || !phong_id || !trang_thai || !admin_id) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const checkMaGiuong = await client.query('SELECT * FROM giuong WHERE ma_giuong = $1 AND phong_id=$2', [ma_giuong, phong_id]);
        if (checkMaGiuong.rows.length > 0) {
            throw new Error('Mã giường đã tồn tại trong phòng này');
        }
        const roomResult = await client.query('SELECT ten_phong FROM phong WHERE id = $1', [phong_id]);
        const tenPhong = roomResult.rows[0].ten_phong;
        const match = tenPhong.match(/\d+/);
        const soPhong = match ? match[0] : '';
        if (!ma_giuong.includes(soPhong)) {
            return res.status(400).json({
                success: false,
                message: `Mã giường (${ma_giuong}) không khớp với số phòng (${soPhong}) của phòng (${tenPhong})!`
            });
        }
        const result = await client.query(
            `INSERT INTO giuong (ma_giuong, phong_id, trang_thai,is_deleted) VALUES ($1, $2, $3, false) RETURNING *`,
            [ma_giuong, phong_id, trang_thai]
        );
        const logQuery = `
            INSERT INTO lich_su_giuong (
                giuong_id,
                nhan_vien_thuc_hien_id,
                hanh_dong,
                trang_thai_cu,
                trang_thai_moi
            ) VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(logQuery, [result.rows[0].id, admin_id, 'Thêm giường', null, trang_thai]);
        await client.query('COMMIT');
        res.status(201).json({ success: true, message: "Thêm giường thành công", bed: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Lỗi hệ thống", detail: error.message });
    } finally {
        client.release();
    }
};
const getReportBed = async (req, res) => {
    try {
        const query = `
                SELECT tb.id, tb.giuong_id, tb.noi_dung, tb.thoi_gian_gui, g.ma_giuong ,u.fullname as y_ta
                FROM thong_bao_giuong tb
                JOIN giuong g ON tb.giuong_id = g.id
                JOIN users u on u.id=tb.y_ta_id
                WHERE tb.trang_thai_duyet = 'Chờ duyệt'
                ORDER BY tb.thoi_gian_gui DESC
            `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Lỗi lấy dữ liệu: " + err.message });
    }
};
const updateStatusReport = async (req, res) => {
    const { reportId } = req.params;

    try {
        const query = `
            UPDATE thong_bao_giuong 
            SET trang_thai_duyet = 'Đã duyệt' 
            WHERE id = $1
        `;
        const result = await pool.query(query, [reportId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu" });
        }

        res.status(200).json({ success: true, message: "Đã xác nhận dọn dẹp thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

module.exports = { getReports, updateStatusBed, getBedHistory, getTotalBeds, deleteBed, addBed, getReportBed, updateStatusReport };  