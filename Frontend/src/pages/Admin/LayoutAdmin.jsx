import Navigation from "../../Components/Admin/Navigation";
import { Outlet } from "react-router-dom";
import { MdLogout, MdHealthAndSafety, MdSettings } from "react-icons/md";
import { useState, useEffect } from 'react';
import useLogout from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import imgLayout from "/image.png"
const LayoutAdmin = () => {
    const [adminName, setAdminName] = useState('Admin');
    const logout = useLogout();
    const user = sessionStorage.getItem('user');
    const userObj = user ? JSON.parse(user) : null;
    const isSettingsPage = location.pathname.includes('settings');
    useEffect(() => {
        if (userObj?.fullname) {
            setAdminName(userObj.fullname);
        }
    }, [userObj]);
    const navigate = useNavigate();
    return (
        <div
            className="min-h-screen w-full flex flex-row font-sans relative bg-slate-50"
            style={{
                backgroundImage: `url(${imgLayout})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}
        >
            <Navigation />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen p-4 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md top-4 z-20 p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 gap-6 transition-all duration-300 mb-8">
                    <div onClick={() => navigate('/admin')} className="cursor-pointer flex items-center gap-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <MdHealthAndSafety size={32} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                                Quản lý Bệnh Nhân Nội trú - Admin
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5 px-3 py-0.5 bg-teal-50 rounded-full border border-teal-100">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                    </span>
                                    <span className="text-[11px] font-black text-teal-700 uppercase tracking-wider">
                                        {userObj?.ten_khoa}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">


                        <div className="flex items-center gap-6 bg-slate-50 p-2 pr-4 rounded-3xl border border-slate-100">

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <span className="text-xl font-black">{userObj?.fullname?.charAt(0) || "Y"}</span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                                </div>

                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">Phiên trực</p>
                                    <p className="text-sm font-black text-slate-700">Hi, {adminName}</p>
                                </div>
                            </div>

                            <div className="h-8 w-[1px] bg-slate-200"></div>
                            <button
                                onClick={() => navigate('/admin/settings')}
                                className="group p-3 bg-white text-slate-400 rounded-2xl border border-slate-100 shadow-sm hover:bg-teal-50 hover:text-teal-500 transition-all duration-300 active:scale-90"
                                title="Cài đặt tài khoản"
                            >
                                <MdSettings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                            <button
                                onClick={logout}
                                className="group p-3 bg-white text-red-500 rounded-2xl border border-red-50 shadow-sm hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-90"
                                title="Đăng xuất"
                            >
                                <MdLogout size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>



                <div className="mt-4">
                    <Outlet />
                </div>
            </main>


        </div>
    );
}
export default LayoutAdmin;