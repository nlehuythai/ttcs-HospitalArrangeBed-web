import React from "react";
import { MdPersonAdd, MdEdit, MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";

const AccountManagement = () => {

    const [showAddForm, setShowAddForm] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [newUser, setNewUser] = useState({
        fullname: '',
        username: '',
        role: 'Bác sĩ',
        ten_khoa: '',
        status: 'Hoạt động',
        email_personal: '',
        phone: ''
    });
    const LIMIT = 5;
    const [hasMore, setHasMore] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchData = async (currentOffset, isRefresh = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const [userRes, deptRes] = await Promise.all([
                fetch(`http://localhost:5000/api/users?limit=${LIMIT}&offset=${currentOffset}`),
                fetch('http://localhost:5000/api/departments')
            ]);
            const userData = await userRes.json();
            const deptData = await deptRes.json();
            const incomingUsers = userData.users || [];
            if (isRefresh) {
                setUsers(incomingUsers);
            } else {

                setUsers((prevUsers) => [...prevUsers, ...(incomingUsers)]);
            }
            setHasMore(userData.hasMore);
            setTotalUsers(userData.total || 0);
            setDepartments(deptData);
            if (deptData.length > 0 && !newUser.ten_khoa) {
                setNewUser(prev => ({ ...prev, ten_khoa: deptData[0].id }));
            }
            setLoading(false);
        } catch (error) {
            console.error('Lỗi:', error);
            setLoading(false);
        }
    };
    const handleLoadMore = () => {
        const nextOffset = users.length; // offset chính bằng số lượng người hiện tại đang hiển thị
        fetchData(nextOffset, false);
    };
    useEffect(() => {
        fetchData(0, true);
    }, []);
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            const data = await response.json();

            if (data.success) {
                alert('Thêm tài khoản thành công!');

                setNewUser({
                    fullname: '', username: '', password: '', role: 'Bác sĩ',
                    ten_khoa: '', status: 'Hoạt động', email_personal: '', phone: ''
                });
                fetchData();
                setShowAddForm(false); // Ẩn form sau khi thêm thành công
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Lỗi:', error);
        }
    };
    const handleDeleteUser = async (userId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/users/delete/${userId}`, {
                    method: 'PATCH',
                });
                const data = await response.json();
                if (data.success) {
                    alert('Tài khoản đã được xóa');
                    fetchData();
                } else {
                    alert('Xóa tài khoản thất bại: ' + data.message);
                }
            } catch (error) {
                console.error('Lỗi:', error);
                alert('Đã xảy ra lỗi khi xóa tài khoản');
            }
        }
    };
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md sticky top-4 z-20 p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="w-2 h-8 bg-teal-500 rounded-full" />
                        Quản lý Nhân sự <span className="text-teal-500">({totalUsers})</span>
                    </h2>
                    <p className="text-slate-500 font-medium ml-5">Hệ thống phân quyền và điều phối chuyên khoa</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-slate-100 px-6 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                    <MdPersonAdd size={22} className="group-hover:rotate-12 transition-transform" />
                    THÊM TÀI KHOẢN
                </button>
            </div>

            {/* Form thêm mới */}
            {showAddForm && (
                <form onSubmit={handleAddUser} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="font-bold text-teal-500 border-l-4 border-teal-500 pl-3">Thêm Tài khoản Mới</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Họ tên</label>
                            <input type="text" value={newUser.fullname} onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chuyên Khoa</label>
                            <select value={newUser.khoa_id} onChange={(e) => setNewUser({ ...newUser, khoa_id: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none">
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.ten_khoa}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản</label>
                            <input type="text" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
                            <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vai trò</label>
                            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none">
                                <option>Bác sĩ</option>
                                <option>Y tá</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</label>
                            <select value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none">
                                <option>Hoạt động</option>
                            </select>
                        </div>
                        <div className="space-y-2 ">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">email</label>
                            <input type="email" value={newUser.email_personal} onChange={(e) => setNewUser({ ...newUser, email_personal: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" />
                        </div>
                        <div className="space-y-2 ">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SỐ ĐIỆN THOẠI</label>
                            <input type="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all" />
                        </div>
                    </div>
                    <div className="flex gap-3 space-y-2 ">
                        <button type="submit" className="bg-teal-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-teal-600">Thêm mới</button>
                        <button onClick={() => setShowAddForm(false)} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-8 py-2.5 rounded-xl font-bold">Hủy</button>
                    </div>
                </form>
            )}

            {/* Bảng dữ liệu */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                            <th className="px-6 py-4">Họ tên</th>
                            <th className="px-6 py-4">Tài khoản</th>
                            <th className="px-6 py-4">Vai trò</th>
                            <th className="px-6 py-4">Chuyên khoa</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Số điện thoại</th>
                            <th className="px-6 py-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm font-medium">
                        {users.map((user, index) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-900 font-bold">{user.fullname}</td>
                                <td className="px-6 py-4 text-slate-500">{user.username}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${user.role === 'Bác sĩ' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{user.ten_khoa}</td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit text-[11px] font-bold">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{user.email_personal}</td>
                                <td className="px-6 py-4 text-slate-500">{user.phone}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg shadow-sm transition-all"><MdDelete size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex flex-col items-center justify-center gap-2">

                    {/* Trường hợp 1: Vẫn còn dữ liệu để xem thêm (hasMore = true) */}
                    {hasMore && users.length > 0 && (
                        <button
                            type="button"
                            disabled={loading} // Khóa bấm nút khi đang trong tiến trình tải
                            onClick={handleLoadMore}
                            className={`flex items-center gap-2 font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 border
                ${loading
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" // Giao diện khi đang tải
                                    : "bg-white hover:bg-slate-100 text-teal-600 border-slate-200"       // Giao diện bình thường
                                }`}
                        >
                            {loading ? (
                                <>
                                    {/* Hiệu ứng vòng xoay SVG loading siêu mượt */}
                                    <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    ĐANG TẢI DỮ LIỆU...
                                </>
                            ) : (
                                "XEM THÊM THÀNH VIÊN"
                            )}
                        </button>
                    )}

                    {/* Trường hợp 2: Khi không còn dữ liệu nào nữa (hasMore = false) */}
                    {!hasMore && users.length > 0 && (
                        <p className="text-slate-400 text-xs font-medium bg-slate-100/80 px-4 py-1.5 rounded-full">
                            🎉 Đã hiển thị toàn bộ danh sách nhân sự
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountManagement;