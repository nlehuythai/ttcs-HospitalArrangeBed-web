import React from 'react';
import { useState } from 'react';
import { API_URL } from '../../../../api';
const EditBedModal = ({ isOpen, onClose, selectedBed, newStatus, setNewStatus, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const token = sessionStorage.getItem('token');
    const handleUpdateBed = async () => {
        if (newStatus === selectedBed.trang_thai) {
            onClose();
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/managebeds/${selectedBed.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    trang_thai: newStatus,
                })
            });

            if (response.ok) {
                alert("Cập nhật trạng thái giường thành công!");
                onClose();
                onRefresh();
            }
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen || !selectedBed) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Chỉnh sửa giường</h3>
                <p className="text-slate-500 font-bold text-sm mb-6 uppercase">
                    Mã giường: {selectedBed.ma_giuong}
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">
                            Trạng thái giường
                        </label>
                        <select
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="Trống">Trống (Sẵn sàng)</option>
                            <option value="Đang dọn dẹp">Đang dọn dẹp</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                    >
                        HỦY
                    </button>
                    <button
                        onClick={handleUpdateBed}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                        LƯU THAY ĐỔI
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditBedModal;