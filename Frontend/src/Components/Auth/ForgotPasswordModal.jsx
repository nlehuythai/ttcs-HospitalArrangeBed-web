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
    const [message, setMessage] = useState('');
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            setLoading(false);
            if (data.success) {
                setStep(2);
                setMessage("Mã OTP đã được gửi về email của bạn!");
            }
            else {
                setMessage(data.message || "Email không tồn tại.");
                alert(data.message);
            }
        } catch {
            setMessage("Lỗi kết nối máy chủ.");
        } finally {
            setLoading(false);
        }
    };
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword) return setMessage("Vui lòng nhập đầy đủ thông tin.");
        setLoading(true);
        try {
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
                setMessage(data.message || "OTP sai hoặc đã hết hạn.");
            }
        } catch {
            setMessage("Lỗi hệ thống.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
                <h2 className="text-xl font-black mb-1">Khôi phục mật khẩu</h2>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                    {step === 1 ? "Bước 1: Xác thực Email" : "Bước 2: Nhập OTP & Mật khẩu mới"}
                </p>

                {message && (
                    <div className={`mb-4 p-3 rounded-xl text-xs font-bold ${step === 1 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <input
                            type="email"
                            autoComplete="off"
                            placeholder="Nhập email của bạn"
                            className="w-full p-4 border rounded-2xl font-bold"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full py-3 bg-teal-500 text-white rounded-2xl font-bold hover:bg-teal-600">
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <input
                            autoComplete="one-time-code"
                            placeholder="Nhập mã OTP"
                            className="w-full p-4 border rounded-2xl font-bold"
                            onChange={e => setOtp(e.target.value)}
                            value={otp}
                            required
                        />
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Mật khẩu mới"
                            className="w-full p-4 border rounded-2xl font-bold"
                            onChange={e => setNewPassword(e.target.value)}
                            value={newPassword}
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700">
                            {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu thành công"}
                        </button>
                    </form>
                )}

                <button onClick={onClose} className="mt-4 text-xs font-bold text-slate-400 w-full hover:text-slate-600">
                    Đóng
                </button>
            </div>
        </div>
    );
};
export default ForgotPasswordModal;