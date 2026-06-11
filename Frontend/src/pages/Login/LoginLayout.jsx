import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLogin, MdMedicalServices, MdShield, MdPersonOutline, MdLockOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { API_URL } from '../../api';
const LoginLayout = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.success) {
                // Lưu thông tin người dùng vào sessionStorage
                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('isAuthenticated', 'true');

                if (data.token) {
                    sessionStorage.setItem('token', data.token);
                }
                // Điều hướng dựa trên vai trò
                if (data.user.role === 'Bác sĩ') {
                    navigate('/doctor');
                } else if (data.user.role === 'Y tá') {
                    navigate('/nurse');
                } else if (data.user.role === 'Admin') {
                    navigate('/admin');
                }

            } else {
                setErrorMsg(data.message);
            }
        } catch (error) {

            setErrorMsg('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px]" />

            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] w-full max-w-[480px] border border-white relative z-10 animate-in fade-in zoom-in-95 duration-700">

                <div className="flex flex-col items-center mb-10">
                    <div className="relative">
                        <div className="p-5 bg-teal-600 rounded-[2rem] shadow-xl shadow-teal-100 text-white animate-bounce-slow">
                            <MdMedicalServices size={40} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md text-emerald-500">
                            <MdShield size={20} />
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            T&N <span className="text-teal-500">HOSPITAL</span>
                        </h1>
                        <p className="text-teal-500 text-xs font-bold uppercase tracking-[0.3em] mt-3 bg-slate-100 px-4 py-1.5 rounded-full inline-block">
                            Hệ thống quản trị bệnh viện
                        </p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {errorMsg && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Lỗi! </strong>
                            <span className="block sm:inline">{errorMsg}</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <MdPersonOutline size={16} className="text-teal-500" /> Tên đăng nhập
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập mã nhân viên hoặc username"
                                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MdLockOutline size={16} className="text-teal-500" /> Mật khẩu
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-teal-600 transition-colors"
                            >
                                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </button>
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-teal-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-teal-600 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center gap-3 mt-4"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Đăng nhập hệ thống <MdLogin size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Footer */}
                <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        Thiết bị này được bảo mật bởi <br />
                        <span className="text-slate-600">Phòng Công Nghệ Thông Tin - Bệnh Viện</span>
                    </p>
                </div>
            </div>

        </div>
    );
}
export default LoginLayout;