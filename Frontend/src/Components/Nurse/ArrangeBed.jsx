import { useState, useEffect } from "react";
import BedAssignmentModal from "./BedAssignmentModal";
import { data } from "react-router-dom";
import { API_URL } from "../../api";
import PatientInfoModal from "./handleButton/PatientInfoModal";
import ReportBedModal from "./handleButton/ReportBedModal";
const ArrangeBed = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetBed, setTargetBed] = useState(null);
    const [waitingPatients, setWaitingPatients] = useState([]);
    const [beds, setBeds] = useState([]);
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const token = sessionStorage.getItem('token');
    const loadWaitingList = async () => {
        try {
            const res = await fetch(`${API_URL}/api/nurse/waiting-list`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            const data = await res.json();
            setWaitingPatients(data);
        } catch (err) {
            console.error("Lỗi load danh sách chờ:", err);
        }
    };

    const loadBeds = async () => {
        try {
            const res = await fetch(`${API_URL}/api/beds`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setBeds(data);
        } catch (err) {
            console.error("Lỗi load giường:", err);
        }
    };

    useEffect(() => {
        loadWaitingList();
        loadBeds();
    }, []);

    // --- LOGIC TÍNH TOÁN LEGEND (Dựa trên dữ liệu thực) ---
    const bedStats = {
        tong: beds.length,
        trong: beds.filter(b => b.trang_thai === "Trống").length,
        suDung: beds.filter(b => b.trang_thai === "Đang sử dụng").length,
        donDep: beds.filter(b => b.trang_thai === "Đang dọn dẹp").length,
    };

    const statuses = [
        { label: "Tổng Giường", count: bedStats.tong, colorClass: "bg-slate-500" },
        { label: "Trống", count: bedStats.trong, colorClass: "bg-green-500" },
        { label: "Đang sử dụng", count: bedStats.suDung, colorClass: "bg-blue-500" },
        { label: "Đang dọn dẹp", count: bedStats.donDep, colorClass: "bg-amber-500" },
    ];

    const handleConfirmAssignment = async (hosoId) => {
        if (!targetBed) return;
        try {
            const response = await fetch(`${API_URL}/api/nurse/assign-bed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    hoso_id: hosoId,
                    giuong_id: targetBed.id,
                })
            });
            if (response.status === 500) {
                alert("Giường này vừa được người khác chọn hoặc trạng thái đã thay đổi. Vui lòng tải lại trang!");
                loadBeds(); // Cập nhật lại danh sách ngay lập tức
                setIsModalOpen(false);
                return;
            }
            if (response.ok) {
                alert("Xếp giường thành công!");
                loadWaitingList();
                loadBeds();
                setIsModalOpen(false);
            }
        } catch (error) {
            alert("Lỗi server!");
        }
    };
    const handleBedClick = async (bed) => {
        setTargetBed(bed);
        if (bed.trang_thai === "Đang sử dụng") {
            try {
                const res = await fetch(`${API_URL}/api/beds/${bed.id}/patient`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setCurrentPatient(data);
                setIsPatientModalOpen(true);
            } catch (err) {
                console.error("Lỗi lấy thông tin BN:", err);
            }
        } else if (bed.trang_thai === "Trống") {
            setIsModalOpen(true);
        }
    };

    return (
        <div className="flex flex-col gap-10 p-4 animate-in fade-in duration-700">
            {/* 1. Header & Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md sticky top-4 z-20 p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 gap-6">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                Danh sách giường bệnh
                            </h2>
                            <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black uppercase rounded-lg border border-teal-100">
                                {data?.ten_khoa}
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs font-bold mt-1">
                            Quản lý và theo dõi tình trạng giường thời gian thực
                        </p>
                    </div>
                </div>

                {/* Legend với hiệu ứng đếm số */}
                <div className="flex items-center gap-6 bg-slate-50/50 p-2 rounded-3xl px-6 border border-slate-100">
                    {statuses.map((status) => (
                        <div key={status.label} className="flex items-center gap-3 group">
                            <div className={`relative flex h-3 w-3`}>
                                {status.label === "Trống" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${status.colorClass}`}></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{status.label}</span>
                                <span className="text-sm font-black text-slate-700 tabular-nums">{status.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Grid Danh sách giường */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {beds.map((bed) => {
                    const isMaintenance = bed.trang_thai === "Đang dọn dẹp";
                    const isOccupied = bed.trang_thai === "Đang sử dụng";
                    const isAvailable = bed.trang_thai === "Trống";

                    // Dynamic Colors
                    const theme = isMaintenance
                        ? { bg: "bg-amber-50/50", border: "border-amber-100", text: "text-amber-700", accent: "bg-amber-500", btn: "bg-amber-100 text-amber-700 hover:bg-amber-200", shadow: "hover:shadow-amber-200" }
                        : isOccupied
                            ? { bg: "bg-blue-50/50", border: "border-blue-100", text: "text-blue-700", accent: "bg-blue-500", btn: "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700", shadow: "hover:shadow-blue-200" }
                            : { bg: "bg-emerald-50/50", border: "border-emerald-100", text: "text-emerald-700", accent: "bg-emerald-500", btn: "bg-slate-900 text-white shadow-slate-300", shadow: "hover:shadow-emerald-200" };

                    return (
                        <div
                            key={bed.id}
                            className={`relative overflow-hidden border-2 rounded-[2.5rem] p-6 transition-all duration-500 group flex flex-col justify-between min-h-[280px]
                                ${theme.bg} ${theme.border} hover:-translate-y-2 shadow-sm hover:shadow-2xl ${theme.shadow}`}
                        >
                            {/* Pattern chìm trang trí */}
                            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 ${theme.accent}`} />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${theme.accent} ${isAvailable && 'animate-pulse'}`} />
                                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.text} opacity-60`}>
                                                {bed.ten_khoa}
                                            </span>
                                        </div>
                                        <h3 className={`text-3xl font-black tracking-tighter ${theme.text}`}>
                                            {bed.ma_giuong}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-inherit group-hover:rotate-12 transition-transform duration-500">
                                        <span className="text-2xl">🛏️</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className={`flex items-center gap-2 text-sm font-bold ${theme.text}`}>
                                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        {bed.ten_phong}
                                    </p>
                                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase border-2 ${theme.border} ${theme.text} bg-white/50`}>
                                        {bed.trang_thai}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (isMaintenance) {
                                        setIsReportModalOpen(true);
                                        setTargetBed(bed);
                                    } else {
                                        handleBedClick(bed);
                                    }
                                }}
                                className={`relative z-10 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all duration-300 active:scale-95 shadow-lg
                                    ${theme.btn} ${isMaintenance ? ' opacity-80 shadow-none' : ''}`}
                            >
                                {isAvailable ? (
                                    <span className="flex items-center justify-center gap-2">
                                        Tiếp nhận <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </span>
                                ) : isMaintenance ? (
                                    'Đang khử khuẩn'
                                ) : (
                                    'Xem chi tiết bệnh nhân'
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <BedAssignmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedBed={targetBed}
                patients={waitingPatients}
                onConfirm={handleConfirmAssignment}
            />
            <PatientInfoModal
                isOpen={isPatientModalOpen}
                onClose={() => setIsPatientModalOpen(false)}
                bed={targetBed}
                patient={currentPatient}
            />
            <ReportBedModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                bed={targetBed}
                token={token}
            />
        </div>
    );
};

export default ArrangeBed;