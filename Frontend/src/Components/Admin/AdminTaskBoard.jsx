import React, { useState, useEffect } from 'react';
import { API_URL } from '../../api';
const AdminTaskBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/bed-reports`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setTasks(data); // Lưu danh sách vào state
        } catch (error) {
            console.error("Lỗi khi tải danh sách:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleApprove = async (bedId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/managebeds/${bedId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
                body: JSON.stringify({
                    trang_thai: 'Trống',
                })
            });

            if (response.ok) {
                alert("Cập nhật trạng thái giường thành công!");
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTasks();
    }, []);
    const formatDate = (isoString) => {
        if (!isoString) return "";
        const datePart = isoString.split('T')[0]; // "2026-06-12"
        const timePart = isoString.split('T')[1].substring(0, 5); // "16:15"

        const [year, month, day] = datePart.split('-');

        return `${timePart} - ${day}/${month}/${year}`;
    };
    return (
        <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 mb-3">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="h-8 w-2 bg-teal-500 rounded-full"></div>
                        Trung tâm xử lý</h2>
                    <p className="text-slate-500 font-medium ml-5">Danh sách các yêu cầu dọn dẹp cần được phê duyệt</p>

                </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <span className="text-4xl block mb-2">✨</span>
                        <p className="text-slate-400 font-bold">Không còn yêu cầu nào cần duyệt!</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center justify-between transition-all hover:-translate-y-1 hover:border-teal-200"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 font-black text-xl">
                                    {task.ma_giuong.slice(0, 4)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Giường {task.ma_giuong}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Đề xuất bởi {task.y_ta} • {formatDate(task.thoi_gian_gui)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    Từ chối
                                </button>
                                <button onClick={handleApprove(task.giuong_id)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-teal-500 transition-all shadow-lg shadow-teal-500/20">
                                    Duyệt hoàn tất
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminTaskBoard;