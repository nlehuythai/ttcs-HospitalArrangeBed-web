import { NavLink, useNavigate } from "react-router-dom";
import { MdDashboard, MdManageAccounts, MdBarChart, MdLogout, MdHealthAndSafety, MdPeople } from "react-icons/md";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useState } from "react";
import logo from "/logo.svg"
const Navigation = () => {
    const navigate = useNavigate();
    const tabs = [
        { id: "accounts", label: "Quản lý Tài khoản", icon: <MdManageAccounts size={20} /> },
        { id: "reports", label: "Báo cáo Hệ thống", icon: <MdBarChart size={20} /> },
        { id: "task-board", label: "Nhiệm vụ", icon: <MdPeople size={20} /> }

    ];
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : null;
    const [isExpanded, setIsExpanded] = useState(true);
    return (
        <div className="relative h-screen">

            <aside className={`
                ${isExpanded ? "w-70" : "w-0"} 
                h-screen bg-slate-900 text-slate-400 flex flex-col justify-between p-4 
                border-r border-slate-800 sticky top-0 shrink-0 z-40 
                transition-all duration-300 ease-in-out relative overflow-hidden
            `}>
                <div className={`
        w-64 flex flex-col gap-8 transition-opacity duration-300
        ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}>

                    <div className="flex flex-col gap-8 w-full">

                        <div className="p-6 border-b border-slate-800">
                            <div onClick={() => navigate('/admin')} className="cursor-pointer flex items-center gap-4">
                                <div className="w-21 h-15  rounded-xl flex items-center justify-center text-white">
                                    <img
                                        src={logo}
                                        alt="Mô tả ảnh"
                                        className="w-full h-full object-cover rounded-[1rem]"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-lg font-black text-white leading-tight">T&N Hospital</h1>
                                    <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 bg-teal-900/50 rounded-full border border-blue-800/50 w-fit">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                                        </span>
                                        <span className="text-[9px] font-black text-blue-300 uppercase tracking-wider">
                                            {userObj?.ten_khoa || "Khoa"}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Danh sách các Tab (Chuyển thành hàng dọc) */}
                        <nav className="flex flex-col gap-1.5 w-full">
                            {tabs.map((tab) => {
                                const isTabActive = location.pathname.startsWith(`/admin/${tab.id}`);

                                return (
                                    <NavLink
                                        key={tab.id}
                                        to={`/admin/${tab.id}`}
                                        className={`
                                        relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group w-full
                                        ${isTabActive
                                                ? "bg-teal-600 text-white shadow-lg shadow-blue-600/10 font-extrabold"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                            }
                                        `}
                                    >
                                        {/* Thanh Indicator nhỏ ở rìa trái khi tab active */}
                                        {isTabActive && (
                                            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md" />
                                        )}

                                        <span className={`transition-transform duration-200 ${isTabActive ? "scale-105" : "group-hover:scale-110"}`}>
                                            {tab.icon}
                                        </span>
                                        <span className="relative z-10 tracking-wide">{tab.label}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Phần dưới cùng: Thông tin phiên trực / Đăng xuất (Tùy chọn) */}
                </div>
                <div className=" w-64 border-t border-slate-800 pt-4 text-xs text-teal-600 font-semibold text-center">
                    Phiên làm việc: Bác sĩ
                </div>
            </aside>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-4 top-1/2 bg-teal-600 p-1.5 rounded-full text-white shadow-lg hover:bg-teal-500 transition-colors z-50"
            >
                {isExpanded ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
            </button>
        </div>
    );
};

export default Navigation;