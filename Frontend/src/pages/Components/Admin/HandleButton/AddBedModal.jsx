import React, { useState, useEffect } from 'react';
import { MdOutlineBed, MdAttachMoney, MdMeetingRoom, MdClose } from 'react-icons/md';
import { API_URL } from '../../../../api';
const AddBedModal = ({ isOpen, onClose, onAddSuccess }) => {
    const [formData, setFormData] = useState({
        ma_giuong: '',
        phong_id: '',
        trang_thai: 'Trống',
    });
    const userData = JSON.parse(sessionStorage.getItem('user'));

    const userId = userData?.id || null;
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState([]);
    const fetchRooms = async () => {
        try {
            const response = await fetch(`${API_URL}/api/rooms`);
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phòng:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchRooms();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/admin/add-bed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, admin_id: userId })
                ,
            });

            if (response.ok) {
                onAddSuccess();
                onClose();
                setFormData({ ma_giuong: '', phong_id: '', trang_thai: 'Trống' });
            } else {
                alert("Thêm giường thất bại. Vui lòng kiểm tra lại thông tin và thử lại.");
            }
        } catch (error) {
            console.error("Lỗi thêm giường:", error);
        } finally {
            setLoading(false);
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <MdOutlineBed size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Thêm giường mới</h2>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white"><MdClose size={24} /></button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {/* Chọn Phòng */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <MdMeetingRoom className="text-blue-500" /> Chọn phòng
                        </label>
                        <select
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.phong_id}
                            onChange={(e) => setFormData({ ...formData, phong_id: e.target.value })}
                        >
                            <option value="">-- Chọn phòng --</option>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.ten_phong}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mã Giường */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Mã giường</label>
                        <input
                            required
                            type="text"
                            placeholder="Ví dụ: G-101"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.ma_giuong}
                            onChange={(e) => setFormData({ ...formData, ma_giuong: e.target.value.toUpperCase() })}
                        />
                    </div>


                    {/* Footer Nút bấm */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Lưu giường'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddBedModal;

