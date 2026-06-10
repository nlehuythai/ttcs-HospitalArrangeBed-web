import React, { useState, useEffect } from "react";
import { MdPerson, MdLocalHospital, MdHistory, MdFavorite, MdWaterDrop, MdThermostat, MdAir } from "react-icons/md";
import { API_URL } from "../../../api";
const DetailPatients = (props) => {
    const { patients, selectedId } = props;
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const activePatient = patients.find((p) => p.id === selectedId);

    // Nếu không tìm thấy bệnh nhân (phòng trường hợp lỗi dữ liệu)
    if (!activePatient) return null;
    useEffect(() => {
        const fetchHistory = async () => {
            if (activePatient?.benh_nhan_id) {
                setLoadingHistory(true);
                try {
                    const res = await fetch(`${API_URL}/api/admission/${activePatient.benh_nhan_id}/history`);
                    const data = await res.json();
                    setHistory(data);
                } catch (err) {
                    console.error("Lỗi lấy lịch sử:", err);
                } finally {
                    setLoadingHistory(false);
                }
            }
        };
        fetchHistory();
    }, [selectedId, activePatient?.id_ho_so]);
    if (!activePatient) return null;
    return (
        <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
            {/* 1. Thông tin cá nhân */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-500 text-white rounded-2xl">
                            <MdPerson size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Thông tin cá nhân</h2>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest">
                        Đang điều trị
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoItem label="Họ và tên" value={activePatient.ho_ten} />
                    <InfoItem label="Năm sinh" value={new Date(activePatient.nam_sinh).toLocaleDateString('vi-VN')} />
                    <InfoItem label="Giới tính" value={activePatient.gioi_tinh} />
                    <InfoItem label="Số điện thoại" value={activePatient.so_dien_thoai} />
                    <InfoItem label="Số BHYT" value={activePatient.so_bhyt} />
                    <InfoItem label="Địa chỉ" value={activePatient.dia_chi} fullWidth />
                </div>
            </div>

            {/* 2. Thông tin y tế nhập viện */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-teal-500 text-white rounded-2xl">
                        <MdLocalHospital size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Thông tin y tế ban đầu</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label="Khoa điều trị" value={activePatient.ten_khoa} highlight />
                    <InfoItem label="Bác sĩ phụ trách" value={activePatient.ten_bac_si} highlight />
                    <div className="col-span-2 space-y-4">
                        <InfoBox label="Chẩn đoán ban đầu" value={activePatient.chan_doan_ban_dau} color="bg-teal-50" />
                        <InfoBox label="Lý do nhập viện" value={activePatient.ly_do_nhap_vien} />
                        <InfoBox label="Bệnh sử" value={activePatient.benh_su} />
                    </div>
                </div>
            </div>

            {/* 3. Diễn biến điều trị */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-teal-500 text-white rounded-2xl">
                        <MdHistory size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Diễn biến điều trị</h2>
                </div>

                <div className="space-y-4">
                    {loadingHistory ? (
                        <p className="text-center py-10 text-slate-400">Đang tải lịch sử...</p>
                    ) : history.length > 0 ? (
                        history.map((item) => (
                            <div key={item.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-all hover:border-slate-300">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-slate-800 uppercase text-[11px] tracking-widest">{item.tieu_de}</p>
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        {new Date(item.ngay_ghi).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">{item.noi_dung}</p>

                                {/* Vital Signs */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/60 p-4 rounded-2xl border border-slate-100">
                                    <VitalItem icon={<MdFavorite className="text-red-500" />} label="Mạch" value={item.mach} unit="l/p" />
                                    <VitalItem icon={<MdWaterDrop className="text-blue-500" />} label="Huyết áp" value={item.huyet_ap} />
                                    <VitalItem icon={<MdThermostat className="text-orange-500" />} label="Nhiệt độ" value={item.nhiet_do} unit="°C" />
                                    <VitalItem icon={<MdAir className="text-emerald-500" />} label="Nhịp thở" value={item.nhip_tho} unit="l/p" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="border-2 border-dashed border-slate-50 rounded-2xl p-6 text-center text-slate-400 text-sm italic font-medium">
                            Chưa có ghi nhận diễn biến mới cho hồ sơ này.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Bạn cần giữ các Component phụ này ở trong file hoặc export/import chúng ---
const InfoItem = ({ label, value, fullWidth = false, highlight = false }) => (
    <div className={`${fullWidth ? "md:col-span-3" : "col-span-1"}`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</p>
        <p className={`font-semibold text-sm ${highlight ? "text-blue-600" : "text-slate-800"}`}>
            {value || "---"}
        </p>
    </div>
);
const VitalItem = ({ icon, label, value, unit = "" }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {icon}
            <span>{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-800">
            {value ? `${value}${unit}` : "---"}
        </p>
    </div>
);
const InfoBox = ({ label, value, color = "bg-slate-50" }) => (
    <div className={`${color} p-5 rounded-2xl border border-gray-50/50 shadow-inner`}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">{label}</p>
        <p className="text-slate-700 text-sm leading-relaxed font-medium">
            {value || "Chưa có dữ liệu"}
        </p>
    </div>
);

export default DetailPatients;