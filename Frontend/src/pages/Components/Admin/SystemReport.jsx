import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom"
import {
    MdPeople,
    MdMonitorHeart,
    MdBed,
    MdAutoGraph,
    MdTrendingUp, MdCheckCircle, MdArrowForward
} from "react-icons/md";
import ExcelModal from "./HandleButton/ExcelModal";

const SystemReport = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        const year = now.getFullYear(); // Phải có dấu ()
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    })
    const navigate = useNavigate();
    const handleGoToBedMap = () => {
        navigate("/admin/reports/AdminBedMap");
    }
    const fetchStats = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/reports/${selectedMonth}`);
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("Lỗi lấy báo cáo:", err);
        } finally {
            setLoading(false);
        }
    };
    const handleRefresh = async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {

            await fetchStats();
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Lỗi khi tải lại:", error);
        } finally {
            setIsRefreshing(false);
        }
    };
    const handleExportExcel = async () => {
        try {
            await ExcelModal(stats, selectedMonth);
        } catch (error) {
            console.error("Lỗi khi xuất file Excel:", error);
            alert("Có lỗi xảy ra khi xuất file báo cáo!");
        }
    };
    useEffect(() => {
        fetchStats();
    }, [selectedMonth]);
    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!stats) return <div className="p-10 text-center text-red-500 font-bold bg-red-50 rounded-2xl">⚠️ Không thể tải dữ liệu hệ thống</div>;

    const summaryData = [
        { label: "Tổng Nhân sự", value: stats.total_users, sub: "Tài khoản hệ thống", icon: <MdPeople />, color: "from-blue-500 to-blue-600", light: "bg-blue-50 text-blue-600" },
        { label: "Bác sĩ / Y tá", value: `${stats.total_doctors} : ${stats.total_nurses}`, sub: "Đội ngũ chuyên môn", icon: <MdMonitorHeart />, color: "from-emerald-500 to-emerald-600", light: "bg-emerald-50 text-emerald-600" },
        { label: "Bệnh nhân mới", value: stats.new_active_patients, sub: "Bệnh nhân nhập viện trong tháng này", icon: <MdPeople />, color: "from-cyan-500 to-cyan-600", light: "bg-cyan-50 text-cyan-600" },
        { label: "Bệnh nhân xuất viện", value: stats.discharge_patients, sub: "Bệnh nhân xuát viện viện trong tháng này", icon: <MdPeople />, color: "from-amber-500 to-amber-600", light: "bg-amber-50 text-amber-600" },
        { label: "Lấp đầy Giường", value: stats.occupancy_Rate_Month, sub: "Hiệu suất sử dụng", icon: <MdAutoGraph />, color: "from-orange-500 to-orange-600", light: "bg-orange-50 text-orange-600" },
    ];

    const occupancyPercent = parseFloat(stats.occupancy_rate);

    return (
        <div className="p-2 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="h-8 w-2 bg-teal-500 rounded-full"></div>
                        Báo cáo Tổng quan
                    </h2>
                    <p className="text-slate-500 font-medium ml-5">Cập nhật dữ liệu thời gian thực từ các khoa</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExportExcel} className="px-4 py-2 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-sm font-bold transition-all duration-300">
                        Xuất EXCEL
                    </button>
                    <button onClick={handleRefresh} disabled={isRefreshing} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-xl text-sm font-bold text-white hover:shadow-lg transition-all active:scale-95">
                        {isRefreshing ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        {isRefreshing ? "Đang tải..." : "Load dữ liệu"}
                    </button>
                </div>
            </div>
            <div className="relative group min-w-[200px]">

                <input
                    type="month"
                    value={selectedMonth}
                    onClick={(e) => e.target.showPicker()}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-base font-black text-slate-700 shadow-inner transition-all duration-300 outline-none cursor-pointer shadow-xl shadow-slate-200/40 hover:bg-slate-100"
                />
            </div>

            {/* 1. TOP STATS CARDS - Phong cách High-End */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryData.map((item, index) => (
                    <div key={index} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-200/30 transition-all duration-300 relative overflow-hidden">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${item.color} opacity-[0.03] group-hover:scale-150 transition-transform duration-700`}></div>

                        <div className="relative flex flex-col h-full justify-between gap-4">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-2xl ${item.light} text-2xl shadow-inner`}>
                                    {item.icon}
                                </div>
                                <div className="flex items-center text-emerald-500 font-black text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">{item.label}</p>
                                <h4 className="text-3xl font-black text-slate-800 tracking-tighter mt-1">{item.value}</h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 italic">{item.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. CHI TIẾT DỮ LIỆU - GRID 2 CỘT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Khối Nhân Viên */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                            <MdPeople className="text-teal-500" /> Thống kê Nhân sự
                        </h3>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">Toàn bệnh viện</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <StatRow_New label="Bác sĩ chuyên khoa" value={stats.total_doctors} total={stats.total_users} color="bg-blue-500" />
                        <StatRow_New label="Điều dưỡng & Y tá" value={stats.total_nurses} total={stats.total_users} color="bg-emerald-500" />
                        <StatRow_New label="Admin" value={stats.total_users - stats.total_doctors - stats.total_nurses} total={stats.total_users} color="bg-purple-500" />
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                            <MdCheckCircle className="text-emerald-500 text-xl" />
                            <p className="text-xs font-bold text-emerald-700">{stats.total_users} tài khoản đang ở trạng thái hoạt động bình thường</p>
                        </div>
                    </div>
                </div>

                {/* Khối Giường Bệnh - Có Progress Bar */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]"></div>

                    <div className="relative flex items-center justify-between mb-8">
                        <h3 className="font-black text-xl flex items-center gap-2 text-white">
                            <MdBed className="text-teal-400" /> Tình trạng Giường bệnh hiện tại
                        </h3>
                    </div>

                    <div className="relative space-y-8">
                        {/* Biểu đồ lấp đầy */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tỷ lệ lấp đầy</p>
                                    <h5 className="text-4xl font-black text-white tracking-tighter">{stats.occupancy_rate}</h5>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-[10px] font-bold">TRỐNG</p>
                                    <p className="text-xl font-black text-teal-400">{stats.total_beds - stats.occupied_beds}</p>
                                </div>
                            </div>
                            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-400 to-amber-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(251,146,60,0.5)]"
                                    style={{ width: `${occupancyPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                <p className="text-slate-400 text-[10px] font-black uppercase">Tổng số giường</p>
                                <p className="text-2xl font-black">{stats.total_beds}</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                <p className="text-slate-400 text-[10px] font-black uppercase">Giường đang sử dụng</p>
                                <p className="text-2xl font-black">{stats.occupied_beds}</p>
                            </div>
                        </div>

                        <button onClick={handleGoToBedMap} className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group">
                            Xem chi tiết sơ đồ giường
                            <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Component thanh tiến trình nhỏ cho nhân sự
const StatRow_New = ({ label, value, total, color }) => {

    const percent = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="space-y-1.5 hover:bg-slate-50 p-2 rounded-xl transition-colors">
            <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-600">{label}</span>
                <span className="font-black text-slate-800">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>

    );
}
export default SystemReport;