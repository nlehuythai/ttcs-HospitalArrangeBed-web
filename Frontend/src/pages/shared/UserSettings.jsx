import { useState } from 'react';
import { MdPerson, MdLock, MdVerifiedUser, MdOutlineBadge, MdEmail, MdApartment, MdSave, MdPhone, MdEdit, MdCancel } from 'react-icons/md';
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
    const [userInfo, setUserInfo] = useState(JSON.parse(sessionStorage.getItem('user')) || {});
    const [isEditing, setIsEditing] = useState(false);

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
                    userId: userInfo.id,
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
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    fullname: userInfo.fullname,
                    email: userInfo.email,
                    phone: userInfo.phone
                })
            });
            const data = await response.json();
            if (data.success) {
                sessionStorage.setItem('user', JSON.stringify(userInfo));
                setMessage({ type: 'success', text: 'Cập nhật thành công!' });
                setIsEditing(false);
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi kết nối server!' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">


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
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-teal-100 rounded-[2rem] flex items-center justify-center text-teal-600 text-3xl font-black">{userInfo.fullname?.charAt(0)}</div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">{userInfo.fullname}</h3>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{userInfo.role}</p>
                                    </div>
                                </div>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-teal-600 bg-teal-50 px-4 py-2 rounded-xl font-bold text-xs hover:bg-teal-100 transition-all">
                                        <MdEdit size={16} /> CHỈNH SỬA
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all">
                                        <MdCancel size={16} /> HỦY
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <EditInput label="Họ tên" value={userInfo.fullname} onChange={(v) => setUserInfo({ ...userInfo, fullname: v })} />
                                    <EditInput label="Email" value={userInfo.email} onChange={(v) => setUserInfo({ ...userInfo, email: v })} />
                                    <EditInput label="Số điện thoại" value={userInfo.phone} onChange={(v) => setUserInfo({ ...userInfo, phone: v })} />
                                    <div className="col-span-full mt-4">
                                        <button disabled={loading} className="w-full py-3 bg-teal-500 text-white rounded-2xl font-bold hover:bg-teal-600 transition-all">
                                            {loading ? 'Đang lưu...' : 'Lưu thông tin thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoItem icon={<MdApartment />} label="Khoa/Phòng" value={userInfo.ten_khoa || 'N/A'} />
                                    <InfoItem icon={<MdVerifiedUser />} label="Mã nhân viên" value={`${userInfo.ma_nhan_vien}`} />
                                    <InfoItem icon={<MdEmail />} label="Email" value={userInfo.email || 'Chưa cập nhật'} />
                                    <InfoItem icon={<MdPhone />} label="Số điện thoại" value={userInfo.phone || 'Chưa cập nhật'} />
                                </div>
                            )}
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
const EditInput = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-700" />
    </div>
);
export default UserProfileSettings;