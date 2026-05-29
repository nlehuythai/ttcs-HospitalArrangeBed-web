import { NavLink, useNavigate } from "react-router-dom";
import { MdDashboard, MdManageAccounts, MdBarChart, MdLogout, MdHealthAndSafety } from "react-icons/md";

const Navigation = () => {
    const navigate = useNavigate();
    const tabs = [
        { id: "accounts", label: "Quản lý Tài khoản", icon: <MdManageAccounts size={20} /> },
        { id: "reports", label: "Báo cáo Hệ thống", icon: <MdBarChart size={20} /> },

    ];
    const userData = sessionStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : null;
    return (
        <aside className="w-72 h-screen bg-slate-900 text-slate-400 flex flex-col justify-between p-6 border-r border-slate-800 sticky top-0 shrink-0 z-40">
            <div className="flex flex-col gap-8 w-full">

                <div className="p-6 border-b border-slate-800">
                    <div onClick={() => navigate('/admin')} className="cursor-pointer flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                            <MdHealthAndSafety size={28} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white leading-tight">Hospital T&N</h1>
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
            <div className="border-t border-slate-800 pt-4 text-xs text-teal-600 font-semibold text-center">
                Phiên làm việc: Bác sĩ
            </div>
        </aside>
    );
};

export default Navigation;