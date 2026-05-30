
CREATE DATABASE postgres;
USE postgres;
-- ==========================================
-- 1. BẢNG KHOA
-- ==========================================
CREATE TABLE khoa (
    id SERIAL PRIMARY KEY,
    ten_khoa VARCHAR(100) NOT NULL,
    ma_khoa VARCHAR(10) UNIQUE NOT NULL
);

-- ==========================================
-- 2. BẢNG USERS (Nhân viên y tế: Bác sĩ, Y tá, Admin)
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'Doctor', 'Nurse', 'Admin',...
    khoa_id INT REFERENCES khoa(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active',
    email_personal VARCHAR(100),
    phone VARCHAR(20),
    ma_nhan_vien VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. BẢNG PHÒNG
-- ==========================================
CREATE TABLE phong (
    id SERIAL PRIMARY KEY,
    ten_phong VARCHAR(50) NOT NULL,
    khoa_id INT REFERENCES khoa(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. BẢNG GIƯỜNG
-- ==========================================
CREATE TYPE trang_thai_giuong_enum AS ENUM ('Trống', 'Đang sử dụng', 'Đang dọn dẹp', 'Ngừng hoạt động');
CREATE TABLE giuong (
    id SERIAL PRIMARY KEY,
    ma_giuong VARCHAR(20) UNIQUE NOT NULL,
    phong_id INT REFERENCES phong(id) ON DELETE CASCADE,
    trang_thai trang_thai_giuong_enum DEFAULT 'Trống', -- 'Trống', 'Có bệnh nhân', 'Đang dọn dẹp'
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. BẢNG BỆNH NHÂN
-- ==========================================
CREATE TYPE kieu_gioi_tinh AS ENUM('Nam','Nữ','Khác')
CREATE TABLE benhnhan (
    id SERIAL PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    nam_sinh date NOT NULL,
    gioi_tinh VARCHAR(10) NOT NULL,
    so_dien_thoai VARCHAR(20),
    dia_chi VarChar(255) NOT NULL,
    so_bhyt VARCHAR(20)
);

-- ==========================================
-- 6. BẢNG HỒ SƠ NHẬP VIỆN
-- ==========================================
CREATE TYPE status_hoso AS ENUM ('Chờ xếp giường','Đang điều trị','Chờ xuất viện','Đã xuất viện');
CREATE TYPE blood_group_type AS ENUM ('A+','A-','B+','B-','O+','O-','AB+','AB-');
CREATE TYPE capdochamsoc AS ENUM ('Cấp 1','Cấp 2','Cấp 3');
CREATE TABLE hosonhapvien (
    id SERIAL PRIMARY KEY,
    benh_nhan_id INT REFERENCES benhnhan(id) ON DELETE CASCADE,
    khoa_id INT REFERENCES khoa(id) ON DELETE SET NULL,
    bac_si_id INT REFERENCES users(id) ON DELETE SET NULL,
    chan_doan_ban_dau TEXT,
    ly_do_nhap_vien TEXT,
    benh_su TEXT,
    thoi_gian_nhap_vien TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    giuong_id INT REFERENCES giuong(id) ON DELETE SET NULL,
    trang_thai_ho_so status_hoso DEFAULT 'Chờ xếp giường', -- 'Chờ xếp giường', 'Đang điều trị', 'Chờ xuất viện', 'Đã xuất viện'
    y_ta_id INT REFERENCES users(id) ON DELETE SET NULL,
    ngay_ra_lenh TIMESTAMP,
    ngay_xuat_vien TIMESTAMP,
    nhom_mau blood_group_type DEFAULT NULL ,
    cap_do capdochamsoc default 'Cấp 1'
);

-- ==========================================
-- 7. BẢNG DIỄN BIẾN BỆNH
-- ==========================================
CREATE TABLE dienbienbenh (
    id SERIAL PRIMARY KEY,
    ho_so_id INT REFERENCES hosonhapvien(id) ON DELETE CASCADE,
    tieu_de VARCHAR(255),
    noi_dung TEXT NOT NULL,
    mach INT,
    huyet_ap VARCHAR(20),
    nhiet_do NUMERIC(4,2), -- Ví dụ: 37.50
    nhip_tho INT,
    ngay_ghi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. BẢNG Y LỆNH
-- ==========================================
CREATE TYPE trangthai_ylenh AS ENUM('Chờ thực hiện','Đang thực hiện','Đã hoàn thành','Dã hủy')
CREATE TYPE muc_do_uu_tien AS ENUM('Thường','Khẩn cấp')
CREATE TABLE ylenh (
    id SERIAL PRIMARY KEY,
    ho_so_id INT REFERENCES hosonhapvien(id) ON DELETE CASCADE,
    bac_si_id INT REFERENCES users(id) ON DELETE SET NULL,
    y_ta_id INT REFERENCES users(id) ON DELETE SET NULL,
    noi_dung_y_lenh TEXT NOT NULL,
    loai_y_lenh VARCHAR(100), -- 'Thuốc uống', 'Truyền dịch', 'Xét nghiệm'...
    thoi_gian_chi_dinh TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    thoi_gian_thuc_hien TIMESTAMP,
    trang_thai trangthai_ylenh DEFAULT 'Chờ thực hiện', -- 'Chờ thực hiện', 'Đã hoàn thành', 'Đã hủy'
    muc_do_uu_tien muc_do_uu_tien DEFAULT 'Thường' -- 'Thường', 'Khẩn cấp'
);

-- ==========================================
-- 9. BẢNG LỊCH SỬ GIƯỜNG
-- ==========================================
CREATE TABLE lich_su_giuong (
    id SERIAL PRIMARY KEY,
    giuong_id INT REFERENCES giuong(id) ON DELETE CASCADE,
    nhan_vien_thuc_hien_id INT REFERENCES users(id) ON DELETE SET NULL,
    hanh_dong VARCHAR(100) NOT NULL, -- 'Xếp giường', 'Chuyển giường', 'Trả giường'
    trang_thai_cu VARCHAR(50),
    trang_thai_moi VARCHAR(50),
    ho_so_benh_nhan_id INT REFERENCES hosonhapvien(id) ON DELETE SET NULL,
    ghi_chu TEXT,
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (
    fullname, username, password, role, khoa_id, 
    status, email_personal, phone, ma_nhan_vien
) VALUES
('Y tá Lê Văn Thành', 'yths', '123', 'Y tá', 4, 'Hoạt động', 'ytaa@hospital.com', '0394938777', 'YTHSCC01'),
('Bác sĩ Trần Văn Lợi', 'bssan', '123456', 'Bác sĩ', 5, 'Hoạt động', 'bsic@hospital.vn', '0782767333', 'BSSAN01'),
('Bác sĩ Nguyễn Đức Tâm', 'bssanb', '123', 'Bác sĩ', 5, 'Hoạt động', 'bsisanc@hospital.vn', '0786743331', 'BSSAN02'),
('Y tá Võ Tốt Ti', 'ytasan', '123', 'Y tá', 5, 'Hoạt động', 'ytab@hospital.vn', '0384343343', 'YTSAN01'),
('Y tá Nguyễn Kỳ Đức An', 'ytatn', '123', 'Y tá', 6, 'Hoạt động', 'ytatn@hospital.vn', '0933336667', 'YTTN01'),
('Quản trị viên Nguyễn', 'admin', '123456', 'Admin', 7, 'Hoạt động', 'admin@hospital.vn', '0384378343', 'ADCNTT01'),
('Bác sĩ Trần Văn Ngoan', 'bsngoai', '123', 'Bác sĩ', 2, 'Hoạt động', 'bsib@hospital.vn', '0782378232', 'BSNTH01'),
('Đào Văn Kha', 'bsnhi', '123', 'Bác sĩ', 3, 'Hoạt động', 'bsinhi@hospital.vn', '0887483473', 'BSNHI0001');
INSERT INTO khoa (ten_khoa, ma_khoa) VALUES
('Nội Tim Mạch', 'NTM'),
('Ngoại Tổng Hợp', 'NTH'),
('Khoa Nhi', 'NHI'),
('Hồi Sức Cấp Cứu', 'HSCC'),
('Sản Phụ Khoa', 'SAN'),
('Khoa Truyền Nhiễm', 'TN'),
('Phòng công nghệ thông tin', 'CNTT');
INSERT INTO phong (ten_phong, khoa_id) VALUES
('Phòng 101 - Tim mạch (Thường)', 1),
('Phòng 102 - Tim mạch (VIP)', 1),
('Phòng 201 - Hậu phẫu', 2),
('Phòng 202 - Chấn thương', 2),
('Phòng 301 - Nhi sơ sinh', 3),
('Phòng 302 - Nhi tổng hợp', 3),
('Phòng 401 - Cấp cứu nội', 4),
('Phòng 402 - Cấp cứu ngoại', 4),
('Phòng 501 - Chờ sinh', 5),
('Phòng 502 - Sau sinh', 5);