import {
    MdSearch, MdError, MdInfoOutline, MdAddCircle,
    MdWarning, MdLocationOn, MdCheckCircle, MdCheck
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_URL } from "../../api";
const TaskList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [orders, setOrders] = useState([]);
    const getAuthHeaders = () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            console.error("Token không tồn tại trong sessionStorage!");
            return { 'Content-Type': 'application/json' };
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const loadPatients = async () => {
        try {
            const res = await fetch(`${API_URL}/api/patients/patient-records`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            setPatients(data);
        } catch (err) {
            console.error("Lỗi load bệnh nhân:", err);
        }
    };
    const loadOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/api/nurse-task`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error("Lỗi load y lệnh:", err);
        }
    };
    useEffect(() => {
        loadPatients();
        loadOrders();
    }, []);

    const handleOpenBedSelection = (task) => {
        navigate(`/nurse/beds`);
    };

    const handleConfirmDischarge = async (taskId) => {
        navigate(`/nurse/DischargeProcessNurse?patientId=${taskId}`);
    }


    const handleCompleteOrder = async (orderId) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/complete`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                loadOrders();
            } else {
                console.error("Không thể cập nhật trạng thái y lệnh");
            }
        } catch (err) {
            console.error("Lỗi khi bấm hoàn thành:", err);
        }
    };
    const tasks = [
        ...patients.map(p => {
            let type = '';
            if (!p.ma_giuong) type = 'assign_bed';
            else if (p.trang_thai_ho_so === 'Chờ xuất viện') type = 'discharge';
            return { ...p, type };
        }).filter(t => t.type !== ''),
        ...orders.map(o => ({
            ...o,
            type: 'order'
        }))
    ]
    const [filterStatus, setFilterStatus] = useState("pending");
    const [isUrgentOnly, setIsUrgentOnly] = useState(false);
    const filteredTasks = tasks.filter(task => {
        // 1. Tạo mốc "Hôm nay" theo đúng giờ địa phương của VN
        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString().split('T')[0];

        // 2. Filter khẩn cấp (Giữ nguyên logic của bạn)
        if (isUrgentOnly) {
            const isDefaultUrgent = (task.type === "assign_bed" || task.type === "discharge");
            const isPriorityUrgent = (task.muc_do_uu_tien === "Khẩn cấp");
            if (!isDefaultUrgent && !isPriorityUrgent) return false;
        }

        // 3. Xử lý ngày của task (Chuyển về YYYY-MM-DD để so sánh)
        let taskDateStr = null;
        if (task.thoi_gian_chi_dinh) {
            const d = new Date(task.thoi_gian_chi_dinh);
            // Trừ đi offset để lấy đúng ngày theo giờ VN dù server có lưu thế nào
            taskDateStr = new Date(d.getTime())
                .toISOString().split('T')[0];
        }

        // 4. Pending: Hiện xếp giường, xuất viện và y lệnh CỦA HÔM NAY
        if (filterStatus === "pending") {
            if (task.type === "assign_bed" || task.type === "discharge") return true;

            if (task.type === "order" && taskDateStr) {
                return task.trang_thai !== "Đã hoàn thành" && taskDateStr === todayStr;
            }
            return false;
        }

        // 5. Overdue: Y lệnh chưa xong và ngày < hôm nay
        if (filterStatus === "overdue") {
            return task.type === 'order'
                && task.trang_thai !== 'Đã hoàn thành'
                && taskDateStr
                && taskDateStr < todayStr;
        }

        // 6. Completed
        if (filterStatus === "completed") {
            return task.trang_thai === "Đã hoàn thành";
        }

        return false;
    });


    return (
        <div className="w-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-md top-4 z-20 p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Danh sách Y lệnh & Nhiệm vụ Ca trực</h2>
                    <p className="text-slate-500 text-sm mt-1">Hoàn thành các chỉ định y tế và điều phối người bệnh trong ca trực.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-teal-50/80 text-teal-600 px-3 py-1 rounded-xl text-xs font-bold border border-indigo-100">
                        Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                    </span>
                    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-xs font-bold border border-amber-100">
                        {
                            tasks.filter(t => {
                                if (t.type === 'order') {
                                    return t.trang_thai !== 'Đã hoàn thành';
                                }
                                return true;
                            }).length
                        } việc cần xử lý
                    </span>
                </div>
            </div>
            <div className="sticky top-4 z-30 bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-md border border-slate-100 mb-6 flex flex-wrap items-center justify-between gap-4 transition-all">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button
                        type="button"
                        onClick={() => setFilterStatus("pending")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${filterStatus === "pending"
                            ? "bg-white text-amber-600 shadow-sm font-extrabold"
                            : "text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        Chờ thực hiện (Hôm nay)
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus("overdue")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${filterStatus === "overdue"
                            ? "bg-rose-50 text-rose-600 border border-rose-100 font-extrabold"
                            : "text-slate-500 hover:text-rose-600"
                            }`}
                    >
                        Việc tồn đọng
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus("completed")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${filterStatus === "completed"
                            ? "bg-white text-teal-500 shadow-sm font-extrabold"
                            : "text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        Lịch sử đã xong
                    </button>
                </div>
                <button
                    onClick={() => setIsUrgentOnly(!isUrgentOnly)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${isUrgentOnly
                        ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-100 font-extrabold"
                        : "bg-white border-slate-200 text-amber-600 hover:bg-amber-50"
                        }`}
                >
                    {isUrgentOnly ? "Đang hiện việc khẩn cấp" : "Chỉ hiện việc khẩn cấp"}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => {
                    if (task.type === 'assign_bed') {
                        return (
                            <div key={`bed-${task.id}`} className="bg-white rounded-[32px] p-6 border-2 border-dashed border-indigo-200 bg-indigo-50/20 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm shadow-indigo-100">
                                            Hành chính
                                        </span>
                                        <div className="flex items-center gap-1 text-indigo-600">
                                            <MdError size={14} />
                                            <span className="text-[10px] font-bold uppercase">Chờ xếp giường</span>
                                        </div>
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 text-lg mb-1">BN: {task.ho_ten}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 font-semibold">
                                        <span className="bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">
                                            {task.gioi_tinh || "Chưa rõ giới tính"}
                                        </span>
                                        <span className="bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                                            Năm sinh: {new Date(task.nam_sinh).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-white/90 rounded-2xl border border-slate-100 text-xs text-slate-600 mb-4 shadow-inner">
                                        <strong className="block mb-1 text-indigo-700 text-[11px] uppercase font-black tracking-wide">
                                            Chẩn đoán ban đầu:
                                        </strong>
                                        <p className="line-clamp-2 leading-relaxed italic text-slate-700">
                                            {task.chan_doan_ban_dau || "Chưa có chẩn đoán lâm sàng"}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4 flex items-center gap-1 italic">
                                        <MdInfoOutline /> Vừa nhập viện - Cần bố trí vị trí nằm
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleOpenBedSelection(task)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 mt-4"
                                >
                                    <MdAddCircle size={20} /> Chọn giường cho bệnh nhân
                                </button>
                            </div>
                        );
                    }

                    // --- 2. GIAO DIỆN TASK XUẤT VIỆN (Màu Red/Rose) ---
                    if (task.type === 'discharge') {
                        return (
                            <div key={`out-${task.id}`} className="bg-white rounded-[32px] p-6 border-2 border-red-100 bg-red-50/30 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm shadow-rose-100">
                                            Thủ tục
                                        </span>
                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">Xuất viện</span>
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 text-lg mb-1">BN: {task.ho_ten}</h4>
                                    <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                                        <MdLocationOn /> Giường: {task.ma_giuong} | Phòng: {task.ten_phong}
                                    </p>
                                    <div className="p-4 bg-white/80 rounded-2xl border border-red-100 text-[11px] text-rose-600 font-medium leading-relaxed mb-4">
                                        <strong className="block mb-1 text-rose-700">Yêu cầu hoàn tất:</strong>
                                        - Kiểm tra đồ dùng cá nhân <br />
                                        - Ký xác nhận bàn giao giường & thiết bị.
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleConfirmDischarge(task.id)}
                                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-rose-100"
                                >
                                    Xác nhận đã rời viện
                                </button>
                            </div>
                        );
                    }

                    // --- 3. GIAO DIỆN Y LỆNH THƯỜNG (Dữ liệu cũ của bạn) ---
                    return (
                        <div key={`order-${task.id}`} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${task.loai_y_lenh === 'Thuốc' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                        }`}>
                                        {task.loai_y_lenh}
                                    </span>
                                    {task.muc_do_uu_tien === 'Khẩn cấp' && task.trang_thai !== 'Đã hoàn thành' && (
                                        <span className="text-[10px] font-black text-amber-500 flex items-center gap-1 uppercase">
                                            <MdWarning size={14} /> Khẩn cấp
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-extrabold text-slate-800 text-lg mb-1">BN: {task.ho_ten}</h4>
                                <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                                    <MdLocationOn /> Giường: {task.ma_giuong} | Phòng: {task.ten_phong}
                                </p>

                                <div className="bg-slate-50 rounded-[24px] p-5 mb-4 border border-transparent hover:border-slate-100 transition-all">
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        {task.noi_dung_y_lenh}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] text-slate-400 font-bold italic">BS: {task.ten_bac_si}</span>
                                {task.trang_thai === 'Đã hoàn thành' ? (
                                    <div className="flex items-center gap-1 text-emerald-500 font-black text-[11px] uppercase">
                                        <MdCheckCircle size={18} /> Đã xong
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleCompleteOrder(task.id)}
                                        className={`p-2 px-6 rounded-2xl font-black text-xs transition-all flex items-center gap-2 hover:bg-green-700 hover:text-white ${task.loai_y_lenh === 'Thuốc'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-purple-600 text-white'
                                            }`}
                                    >
                                        <MdCheck size={18} /> Xong
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskList;