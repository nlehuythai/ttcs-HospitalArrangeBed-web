import React from 'react';
import { useState, useEffect } from 'react';
import { MdClose, MdHistory } from "react-icons/md";

const HistoryBedModal = ({ isOpen, onClose, bed }) => {
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/bed-history/${bed.id}`);
            const data = await response.json();
            setHistoryData(data);
        } catch (error) {
            console.error("Lỗi khi fetch lịch sử giường:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && bed?.id) {
            fetchHistory();
        }
    }, [isOpen, bed?.id]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <MdHistory size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800">Lịch sử giường</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {bed?.ma_giuong || 'N/A'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <MdClose size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar min-h-[200px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 space-y-2">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-slate-400">Đang tải lịch sử...</p>
                        </div>
                    ) : historyData.length > 0 ? (
                        <div className="space-y-0">
                            {historyData.map((item, index) => (
                                <div key={item.id} className="relative pl-8 pb-8 last:pb-0">
                                    {/* Đường kẻ nối */}
                                    {index !== historyData.length - 1 && (
                                        <div className="absolute left-[7px] top-5 w-[2px] h-full bg-slate-100"></div>
                                    )}

                                    {/* Dấu chấm timeline */}
                                    <div className="absolute left-0 top-1.5 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-sm z-10"></div>

                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-slate-400">
                                            {formatTime(item.thoi_gian)}
                                        </p>
                                        <p className="text-sm font-black text-slate-700">
                                            {item.trang_thai_cu} → {item.trang_thai_moi}
                                        </p>
                                        <p className="text-[13px] font-medium text-slate-600 italic">
                                            {item.hanh_dong}
                                        </p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            Thực hiện bởi: <span className="font-bold text-slate-600">{item.nhan_vien_ten || 'Hệ thống'}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-sm font-bold text-slate-400 italic">Chưa có lịch sử biến động cho giường này trong 7 ngày gần đây.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryBedModal;