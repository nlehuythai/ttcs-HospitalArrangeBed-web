import { useState } from 'react';
import { MdPerson, MdLock, MdVerifiedUser, MdOutlineBadge, MdEmail, MdApartment, MdSave, MdPhone } from 'react-icons/md';
import { API_URL } from '../../api';
const UserProfileSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        upper: false,
        number: false,
        special: false
    });
    const validatePassword = (password) => {
        setPasswordChecks({
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    };
    // Lấy thông tin user từ sessionStorage (đã lưu lúc đăng nhập)
    const user = JSON.parse(sessionStorage.getItem('user')) || {};

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu mới không khớp!' });
            setPasswordData({ ...passwordData, newPassword: '', confirmPassword: '' });
            return;
        }

        setLoading(true);
        try {
            // Gọi API đổi mật khẩu (sẽ viết ở bước sau)
            const response = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            } else {

                setMessage({ type: 'error', text: data.message });
                setPasswordData({ currentPassword: '', ...passwordData });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi kết nối server!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <MdOutlineBadge className="text-teal-500" /> Cài đặt tài khoản
            </h2>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Menu */}
                <div className="w-full md:w-64 bg-slate-50 p-6 border-r border-slate-100">
                    <div className="space-y-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-teal-500 text-white shadow-lg shadow-teal-100' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <MdPerson size={20} /> Thông tin cá nhân
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-teal-500 text-white shadow-lg shadow-teal-100' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <MdLock size={20} /> Bảo mật & mật khẩu
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {activeTab === 'profile' ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-20 h-20 bg-teal-100 rounded-[2rem] flex items-center justify-center text-teal-600 text-3xl font-black">
                                    {user.fullname?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">{user.fullname}</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{user.role}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem icon={<MdApartment />} label="Khoa/Phòng" value={user.ten_khoa || 'N/A'} />
                                <InfoItem icon={<MdVerifiedUser />} label="Mã nhân viên" value={`${user.ma_nhan_vien}`} />
                                <InfoItem icon={<MdEmail />} label="Email" value={user.email || 'Chưa cập nhật'} />
                                <InfoItem icon={<MdPhone />} label="Số điện thoại" value={user.phone || 'Chưa cập nhật'} />
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-sm">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => {
                                        setPasswordData({ ...passwordData, newPassword: e.target.value });
                                        validatePassword(e.target.value);
                                    }}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold"
                                    placeholder="Tối thiểu 8 ký tự, có chữ hoa, số, ký tự đặc biệt"
                                />
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] font-bold">
                                    <span className={passwordChecks.length ? "text-teal-500" : "text-slate-400"}>✓ 8+ ký tự</span>
                                    <span className={passwordChecks.upper ? "text-teal-500" : "text-slate-400"}>✓ Chữ hoa</span>
                                    <span className={passwordChecks.number ? "text-teal-500" : "text-slate-400"}>✓ Chữ số</span>
                                    <span className={passwordChecks.special ? "text-teal-500" : "text-slate-400"}>✓ Ký tự đặc biệt</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-bold"
                                />
                            </div>
                            {message.text && (
                                <p className={`text-[11px] font-black uppercase mt-2 ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {message.text}
                                </p>
                            )}
                            <button
                                disabled={loading || !Object.values(passwordChecks).every(Boolean)}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all active:scale-95 disabled:bg-slate-300 shadow-xl shadow-slate-200"
                            >
                                <MdSave size={18} /> {loading ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-teal-500 mb-1">
            {icon}
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <p className="font-bold text-slate-700 ml-6">{value}</p>
    </div>
);

export default UserProfileSettings;