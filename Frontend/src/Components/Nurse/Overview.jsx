import { useState, useEffect } from "react";
import { MdPeople, MdTimeline, MdPersonAddAlt, MdCheckCircleOutline } from "react-icons/md";
import { API_URL } from "../../api";
const Overview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/nurse/overview-stats`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error("Lỗi fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    if (loading) return <div className="p-10 text-center">Đang tải thống kê...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Không thể tải dữ liệu</div>;
    const stats = [
        { label: "Tổng bệnh nhân", value: data.patients.total, icon: <MdPeople />, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Đang điều trị", value: data.patients.inTreatment, icon: <MdTimeline />, color: "text-green-600", bg: "bg-green-50" },
        { label: "Chờ xếp giường", value: data.patients.waiting, icon: <MdPersonAddAlt />, color: "text-yellow-600", bg: "bg-yellow-50" },
        { label: "Chờ xuất viện", value: data.patients.ready, icon: <MdCheckCircleOutline />, color: "text-purple-600", bg: "bg-purple-50" },
    ];
    const bedPercent = ((data.beds.occupied / data.beds.total) * 100).toFixed(0);
    const bedCleanPerCent = ((data.beds.clean / data.beds.total) * 100).toFixed(0);
    const emptyPercent = 100 - bedPercent - bedCleanPerCent;
    return (
        <div className="flex flex-col gap-8 p-2">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md sticky top-4 z-20 p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 gap-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tổng quan hệ thống</h2>
                    <p className="text-slate-500 text-sm mt-1">Dữ liệu cập nhật thời gian thực từ {data.ten_khoa}</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Update
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((item, index) => (
                    <div key={index} className="group bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-start shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 cursor-default">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{item.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 group-hover:scale-105 transition-transform origin-left lowercase tabular-nums">
                                {item.value}
                            </h3>
                        </div>
                        <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:rotate-12 transition-transform`}>
                            {item.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 2. Tình trạng giường bệnh - Thiết kế lại Progress trực quan */}
                <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Công suất giường bệnh từ {data.ten_khoa}</h3>
                        <p className="text-sm text-slate-400 mb-8">Trạng thái phân phối hạ tầng</p>

                        <div className="space-y-6 mb-10">
                            {[
                                { label: "Đang sử dụng", count: data.beds.occupied, color: "bg-blue-500", dot: "bg-blue-500" },
                                { label: "Còn trống", count: data.beds.empty, color: "bg-emerald-500", dot: "bg-emerald-500" },
                                { label: "Đang dọn dẹp", count: data.beds.clean, color: "bg-orange-400", dot: "bg-orange-400" },
                            ].map((b, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${b.dot}`} />
                                        <span className="text-sm font-medium text-slate-600">{b.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{b.count} giường</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        {/* Thanh Progress bar đa màu bo góc mềm hơn */}
                        <div className="w-full h-5 bg-slate-100 rounded-2xl overflow-hidden flex p-1 ring-1 ring-slate-100">
                            <div className="h-full bg-blue-500 rounded-l-xl transition-all duration-1000" style={{ width: `${bedPercent}%` }}></div>
                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${emptyPercent}%` }}></div>
                            <div className="h-full bg-orange-400 rounded-r-xl transition-all duration-1000" style={{ width: `${bedCleanPerCent}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tổng quy mô: {data.beds.total} giường nội trú</p>
                            <p className="text-xs font-black text-blue-600">{bedPercent}% Công suất</p>
                        </div>
                    </div>
                </div>

                {/* 3. Phân bổ theo khoa - Sử dụng Card Glassmorphism nhẹ */}
                <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Mật độ bệnh nhân</h3>
                            <p className="text-sm text-slate-400">Phân bổ theo từng phòng thuộc {data.ten_khoa}</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        {data.rooms && data.rooms.map((room, index) => {
                            const percentage = room.countG > 0
                                ? ((room.count / room.countG * 100).toFixed(0))
                                : 0;

                            return (
                                <div key={index} className="group hover:bg-slate-50 p-4 rounded-2xl transition-colors duration-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700">{room.name}</span>
                                        <span className="text-xs font-heavy text-slate-900 bg-white px-2 py-1 rounded-lg shadow-sm ring-1 ring-slate-100">
                                            {room.count} BN
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full transition-all duration-1000"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 min-w-[35px]">
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;