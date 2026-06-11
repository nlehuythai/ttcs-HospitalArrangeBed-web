import React from "react";
import { useState } from "react";
import { API_URL } from "../../api";
const ForgotPasswordModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSendOtp = async () => {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        setLoading(false);
        if (data.success) setStep(2);
        else alert(data.message);
    };
    const handleResetPassword = async () => {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/auth/verify-and-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword })
        });
        const data = await res.json();
        setLoading(false);
        if (data.success) {
            alert("Đổi mật khẩu thành công!");
            onClose();
        } else {
            alert(data.message);
        }
    };
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                <h2 className="text-xl font-black mb-6">Khôi phục mật khẩu</h2>

                {step === 1 ? (
                    <div className="space-y-4">
                        <input onClick={handleSendOtp} type="email" placeholder="Nhập email đăng ký" className="w-full p-4 border rounded-2xl font-bold" onChange={(e) => setEmail(e.target.value)} />
                        <button disabled={loading} className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold">
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input placeholder="Nhập OTP" className="w-full p-4 border rounded-2xl font-bold" onChange={e => setOtp(e.target.value)} />
                        <input type="password" placeholder="Mật khẩu mới" className="w-full p-4 border rounded-2xl font-bold" onChange={e => setNewPassword(e.target.value)} />
                        <button onClick={handleResetPassword} disabled={loading} className="w-full py-3 bg-teal-500 text-white rounded-2xl font-bold">
                            {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                        </button>
                    </div>
                )}
                <button onClick={onClose} className="mt-4 text-xs font-bold text-slate-400 w-full hover:text-slate-600">Đóng</button>
            </div>
        </div>
    );
};
export default ForgotPasswordModal;