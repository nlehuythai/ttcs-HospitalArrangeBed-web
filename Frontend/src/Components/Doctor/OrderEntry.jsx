import { useEffect, useState } from "react";
import { MdClose, MdAssignment, MdAccessTime, MdInfoOutline, MdPeopleAlt, MdAdd, MdHistory, MdSearch } from "react-icons/md";
import { API_URL } from "../../api";
const OrderEntry = () => {
    const [loading, setLoading] = useState(false);
    const [nurses, setNurses] = useState([]);
    const [orderData, setOrderData] = useState(
        {
            ho_so_id: "",
            y_ta_id: "",
            noi_dung_y_lenh: "",
            loai_y_lenh: "",
        }
    )
    const [patients, setPatients] = useState([]);
    const [historyOrder, setHistoryOrder] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const loai_y_lenh = ["Thuốc", "Xét nghiệm", "Dinh dưỡng"];
    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        setOrderData(prev => ({ ...prev, ho_so_id: patient.id }));
    };
    const handleAddOrder = async (e) => {
        if (!orderData.ho_so_id) {
            alert("⚠️ Vui lòng chọn bệnh nhân trước khi tạo y lệnh!");
            return;
        }
        if (!orderData.noi_dung_y_lenh.trim()) {
            alert("⚠️ Nội dung y lệnh không được để trống!");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ho_so_id: orderData.ho_so_id,
                y_ta_id: orderData.y_ta_id || null,
                loai_y_lenh: orderData.loai_y_lenh,
                noi_dung_y_lenh: orderData.noi_dung_y_lenh,
                muc_do_uu_tien: orderData.muc_do_uu_tien,
                thoi_gian_chi_dinh: new Date().toISOString(),
                trang_thai: "Chờ thực hiện"
            };
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/doctor/add-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (response.ok) {
                alert("✅ Tạo y lệnh thành công!");
                setOrderData(prev => ({
                    ...prev,
                    noi_dung_y_lenh: "",
                    loai_y_lenh: "Thuốc"
                }));
                fetchHistoryOrder();
            } else {
                alert("❌ Lỗi: " + result.message);
            }
        } catch (err) {
            console.error("Lỗi kết nối:", err);
            alert("❌ Không thể kết nối tới máy chủ!");
        } finally {
            setLoading(false);
        }
    };
    const userData = JSON.parse(sessionStorage.getItem("user"));
    const token = sessionStorage.getItem('token');

    const fecthNurse = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/nurses/info/${userData.khoa_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            setNurses(data);
        } catch (err) {
            console.error("Lỗi tải danh sách y tá:", err);
        }
    }
    const fetchPatients = async () => {
        try {
            const res = await fetch(`${API_URL}/api/patients/inpatient`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Đính kèm token
                }
            });
            const data = await res.json();
            setPatients(data);

            // Mặc định chọn bệnh nhân đầu tiên nếu có
            if (data.length > 0) {
                handleSelectPatient(data[0]);
            }
        } catch (err) {
            console.error("Lỗi tải bệnh nhân:", err);
        }
    }
    const fetchHistoryOrder = async () => {
        try {
            const res = await fetch(`${API_URL}/api/doctor/history-order`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            setHistoryOrder(data);

        } catch (err) {
            console.err("Lỗi tải lịch sử y lệnh", err);
        }
    }
    useEffect(() => {
        fetchHistoryOrder();
        fetchPatients();
        fecthNurse();
    }, []);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 1000);

        return () => clearTimeout(handler); // Cleanup nếu searchTerm thay đổi sớm hơn 1s
    }, [searchTerm]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 p-6">

            {/* CỘT TRÁI: DANH SÁCH BỆNH NHÂN */}
            <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
                <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <MdPeopleAlt className="text-teal-600" /> Bệnh nhân của tôi
                    </h3>
                    <div className="mt-3 relative">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm tên, mã giường..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {patients.filter((p) => {
                        const search = debouncedSearchTerm.toLowerCase();
                        return (
                            p.ho_ten.toLowerCase().includes(search) ||
                            p.ma_giuong.toString().toLowerCase().includes(search)
                        );
                    }).map((p) => (
                        <div
                            key={p.id}
                            onClick={() => handleSelectPatient(p)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedPatient?.id === p.id
                                ? "bg-teal-500 border-teal-400 shadow-md shadow-teal-100"
                                : "hover:bg-slate-50 border-transparent"
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <p className={`font-bold text-sm ${selectedPatient?.id === p.id ? "text-white" : "text-slate-700"}`}>
                                    {p.ho_ten}
                                </p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg ${selectedPatient?.id === p.id ? "bg-teal-400 text-white" : "bg-slate-100 text-slate-500"}`}>
                                    Giường {p.ma_giuong}
                                </span>
                            </div>
                            <p className={`text-xs mt-1 ${selectedPatient?.id === p.id ? "text-slate-100" : "text-slate-400"}`}>
                                ID: {p.benh_nhan_id}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CỘT PHẢI: FORM NHẬP Y LỆNH */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-500 rounded-lg text-white">
                                <MdAssignment className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Tạo Y lệnh mới</h3>
                                <p className="text-xs text-teal-600 font-medium">
                                    Đang chỉ định cho: <span className="uppercase">{selectedPatient?.ho_ten || "Chưa chọn"}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <form className="p-8 space-y-6">
                        {/* Loại y lệnh */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Loại chỉ định</label>
                            <div className="grid grid-cols-3 gap-2">
                                {loai_y_lenh.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setOrderData(prev => ({ ...prev, loai_y_lenh: type }))}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${orderData.loai_y_lenh === type
                                            ? "bg-teal-500 border-teal-600 text-white shadow-md"
                                            : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nội dung y lệnh */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                                Nội dung chi tiết <MdInfoOutline className="text-slate-400" />
                            </label>
                            <textarea
                                value={orderData.noi_dung_y_lenh}
                                onChange={(e) => setOrderData(prev => ({ ...prev, noi_dung_y_lenh: e.target.value }))}
                                rows="4"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                placeholder={`Nhập chi tiết chỉ định ${orderData.loai_y_lenh.toLowerCase()}...`}
                                required
                            ></textarea>
                        </div>

                        {/* Ưu tiên & Y tá */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <MdAccessTime className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">Ưu tiên</span>
                                </div>
                                <select
                                    value={orderData.muc_do_uu_tien}
                                    onChange={(e) => setOrderData(prev => ({ ...prev, muc_do_uu_tien: e.target.value }))}
                                    className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-teal-600 shadow-sm outline-none transition-all cursor-pointer hover:border-teal-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 pr-10"
                                >
                                    <option value="Thường">Thường</option>
                                    <option value="Khẩn">Khẩn cấp</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <MdPeopleAlt className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">Y tá thực hiện</span>
                                </div>
                                <select className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-teal-600 shadow-sm outline-none transition-all cursor-pointer hover:border-teal-400 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 pr-10"
                                    onChange={(e) => setOrderData(prev => ({ ...prev, y_ta_id: e.target.value }))}
                                    value={orderData.y_ta_id}
                                >
                                    <option value="" className="text-slate-400">Theo ca trực</option>
                                    {nurses.map(nurse => (
                                        <option key={nurse.id} value={nurse.id}>{nurse.fullname}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Hủy</button>
                            <button
                                type="submit"
                                onClick={handleAddOrder}
                                disabled={!selectedPatient || loading}
                                className="flex-[2] py-3 rounded-xl bg-teal-500 text-white font-bold shadow-lg shadow-teal-100 disabled:opacity-50 hover:bg-teal-600"
                            >
                                {loading ? "Đang gửi..." : "Xác nhận y lệnh"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Section 2: Lịch sử y lệnh (Timeline) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MdHistory className="text-teal-600" /> Lịch sử y lệnh gần đây
                    </h3>

                    {historyOrder.length > 0 ? (
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-teal-50 rounded-lg">
                                    <MdHistory className="text-teal-600" size={24} />
                                </div>
                                Lịch sử y lệnh gần đây
                            </h3>

                            <div className="overflow-hidden">
                                <table className="w-full border-separate border-spacing-y-3">
                                    <thead>
                                        <tr className="text-slate-400 text-[11px] uppercase tracking-[0.1em]">
                                            <th className="px-4 py-2 font-bold text-left">Thời gian</th>
                                            <th className="px-4 py-2 font-bold text-left">Loại</th>
                                            <th className="px-4 py-2 font-bold text-left w-1/2">Nội dung y lệnh</th>
                                            <th className="px-4 py-2 font-bold text-right">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyOrder.map((order) => (
                                            <tr key={order.id} className="group hover:translate-x-1 transition-all duration-200">
                                                {/* Cột Thời Gian */}
                                                <td className="bg-slate-50/50 group-hover:bg-white group-hover:shadow-sm rounded-l-2xl px-4 py-4">
                                                    <div className="text-sm font-bold text-slate-700">
                                                        {new Date(order.thoi_gian_chi_dinh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(order.thoi_gian_chi_dinh).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </td>

                                                {/* Cột Loại */}
                                                <td className="bg-slate-50/50 group-hover:bg-white group-hover:shadow-sm px-4 py-4">
                                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${order.loai_y_lenh === 'Thuốc'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {order.loai_y_lenh}
                                                    </span>
                                                </td>

                                                <td className="bg-slate-50/50 group-hover:bg-white group-hover:shadow-sm px-4 py-4 transition-all duration-300 vertical-align-top">
                                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic 
                                                     line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                                                        "{order.noi_dung_y_lenh}"
                                                    </p>
                                                </td>

                                                {/* Cột Trạng Thái */}
                                                <td className="bg-slate-50/50 group-hover:bg-white group-hover:shadow-sm rounded-r-2xl px-4 py-4 text-right">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${order.trang_thai === 'Hoàn thành' ? 'text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        <span className={`w-2 h-2 rounded-full ${order.trang_thai === 'Hoàn thành' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                                                            }`}></span>
                                                        <span className="text-xs font-bold">{order.trang_thai}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-sm italic">
                            Chưa có y lệnh nào được thực hiện gần đây.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default OrderEntry;