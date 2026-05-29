import React, { useState, useEffect } from "react";
import { MdAssignment } from "react-icons/md";
import ActionCard from "./DetailComponents/ActionCard";
import DetailPatients from "./DetailComponents/DetailPatients";


const ManagePatient = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const activePatient = patients.find(p => p.id === selectedId);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPatients = patients.filter((p) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesName = p.ho_ten ? p.ho_ten.toLowerCase().includes(search) : false;
        const matchesBed = p.ma_giuong ? p.ma_giuong.toLowerCase().includes(search) : false;

        return matchesName || matchesBed;
    });
    const fetchPatients = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/patients/inpatient`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu bệnh nhân:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPatients();
    }, []);
    return (
        <div className="flex gap-8 h-[calc(100vh-180px)] animate-in fade-in duration-700 p-1">
            <div className="w-1/3 max-w-[350px] flex flex-col">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
                        Bệnh nhân nội trú
                    </h3>
                    <span className="bg-teal-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm"> {filteredPatients.length} </span>
                </div>

                <div className="relative mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm tên, số giường..."
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        >
                            Xóa
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto pr-3 custom-scrollbar">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                                className={`group p-4 rounded-[1.8rem] cursor-pointer transition-all duration-300 relative border ${selectedId === p.id
                                    ? "bg-teal-400 border-teal-200 shadow-md"
                                    : "bg-white border-slate-100 hover:border-sky-100"
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className={`font-bold text-base tracking-tight transition-colors ${selectedId === p.id ? "text-slate-200" : "text-slate-800"
                                            }`}>
                                            {p.ho_ten}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-medium ${selectedId === p.id ? "text-slate-100" : "text-slate-800"
                                                }`}>
                                                {new Date(p.nam_sinh).toLocaleDateString('vi-VN')} • {p.gioi_tinh}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-[11px] px-3 py-1 rounded-xl font-bold tracking-wider transition-all ${selectedId === p.id
                                        ? "bg-teal-500 text-slate-100 shadow-lg shadow-teal-400"
                                        : "bg-slate-100 text-slate-500"
                                        }`}>
                                        {p.ma_giuong}
                                    </span>
                                </div>

                                <div className={`mt-3 pt-3 border-t flex items-center gap-2 ${selectedId === p.id ? "border-slate-100" : "border-slate-50"
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedId === p.id ? "bg-slate-100" : "bg-emerald-500"}`}></div>
                                    <p className={`text-[11px] font-semibold uppercase tracking-widest ${selectedId === p.id ? "text-slate-100" : "text-slate-800"
                                        }`}>
                                        {p.ten_khoa}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">Trống danh sách</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CỘT PHẢI: CHI TIẾT */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                {activePatient ? (
                    <div className="h-full overflow-y-auto custom-scrollbar p-8 animate-in slide-in-from-bottom-4 duration-500">
                        <DetailPatients patients={patients} selectedId={selectedId} />
                        <div className="mt-8">
                            <ActionCard patients={patients} selectedPatient={activePatient} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <div className="relative mb-6">
                            <div className="relative p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner text-slate-300">
                                <MdAssignment size={64} />
                            </div>
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Hồ sơ bệnh án điện tử</h4>
                        <p className="text-slate-400 max-w-[280px] leading-relaxed text-sm font-medium">
                            Chọn một bệnh nhân ở danh sách bên trái để xem chẩn đoán và quản lý thuốc.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePatient;