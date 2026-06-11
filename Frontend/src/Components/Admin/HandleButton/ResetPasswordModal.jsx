import React, { useState } from "react";
import { MdLockReset, MdDelete } from "react-icons/md";
import { API_URL } from "../../../api";
const ResetPasswordModal = ({ isOpen, onClose, user }) => {
    const [newPassword, setNewPassword] = useState("");
    if (!isOpen) return null;
    const handleResetPassword = async (newPassword) => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/users/reset-password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ userId: user.id, newPassword }) // 'user' là đối tượng người dùng hiện tại
            });

            const data = await response.json();

            if (data.success) {
                alert('Cấp lại mật khẩu thành công!');
                onClose();
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Lỗi khi reset mật khẩu:', error);
            alert('Đã xảy ra lỗi khi kết nối server');
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-black text-teal-600 mb-2">Cấp lại mật khẩu</h3>
                <p className="text-slate-500 mb-6 text-sm">
                    Reset mật khẩu cho: <strong className="text-slate-800">{user?.fullname}</strong>
                </p>

                <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />

                <div className="flex gap-3">
                    <button
                        onClick={() => { handleResetPassword(newPassword); setNewPassword(""); }}
                        className="flex-1 bg-teal-500 text-white py-3 rounded-xl font-bold hover:bg-teal-600 active:scale-95 transition-all"
                    >
                        Xác nhận
                    </button>
                    <button
                        onClick={() => { onClose(); setNewPassword(""); }}
                        className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordModal;