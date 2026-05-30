import { MdExpandMore, MdClose, MdPerson, MdLocalHospital } from "react-icons/md";
import { useState, useEffect } from "react";
import { API_URL } from "../../../api";
const Admission = ({ isOpen, onClose, onRefresh }) => {
    // const [departments, setDepartments] = useState([]);

    // Lấy thông tin user ngay khi component render
    const storedUser = sessionStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : {};
    const [nurses, setNurses] = useState([]);
    const [formData, setFormData] = useState({
        ho_ten: '',
        nam_sinh: '',
        gioi_tinh: '',
        so_dien_thoai: '',
        dia_chi: '',
        so_bhyt: '',
        khoa_id: userData.khoa_id || '', // Gán khoa_id từ user đang đăng nhập nếu có
        bac_si_id: userData.id || '', // Gán ID bác sĩ đang đăng nhập
        y_ta_id: '',
        chan_doan: '',
        ly_do: '',
        benh_su: '',
        nhom_mau: '',
        cap_do: ''
    });

    useEffect(() => {
        const fetchNursesByDept = async () => {
            if (!formData.khoa_id) {
                setNurses([]);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/api/users/nurses/info/${formData.khoa_id}`);
                if (res.ok) {
                    const data = await res.json();
                    setNurses(data);
                }
            } catch (error) {
                console.error("Lỗi lấy y tá:", error.message);
            }
        };

        fetchNursesByDept();
    }, [formData.khoa_id]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = async (e) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,

            khoa_id: parseInt(formData.khoa_id),
            bac_si_id: parseInt(userData.id),
        };

        if (!dataToSend.ho_ten || !dataToSend.khoa_id || !dataToSend.bac_si_id || !dataToSend.chan_doan) {
            console.error("Dữ liệu thiếu:", dataToSend);
            return alert("Vui lòng điền đầy đủ: Họ tên, Khoa và Chẩn đoán!");
        }

        try {
            const response = await fetch(`${API_URL}/api/admission/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Đã tạo hồ sơ bệnh nhân thành công!");
                setFormData({
                    ho_ten: '', nam_sinh: '', gioi_tinh: '', so_dien_thoai: '',
                    dia_chi: '', so_bhyt: '', khoa_id: userData.khoa_id || '',
                    bac_si_id: userData.id || '', y_ta_id: '', nhom_mau: '', cap_do: '',
                    chan_doan: '', ly_do: '', benh_su: ''
                });
                onClose();
                if (onRefresh) onRefresh();
            } else {
                // Hiển thị lỗi chi tiết từ Backend trả về
                alert("Lỗi từ hệ thống: " + (result.message || "Không xác định"));
            }
        } catch (error) {
            console.error("Lỗi fetch:", error);
            alert("Không thể kết nối đến máy chủ. Vui lòng kiểm tra Backend!");
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400 text-sm";

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[850px] max-h-[92vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">

                {/* Header - Cố định */}
                <div className="flex justify-between items-center px-10 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nhập viện bệnh nhân mới</h2>
                        <p className="text-slate-500 text-sm mt-1">Vui lòng điền đầy đủ thông tin bắt buộc dưới đây</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50"
                    >
                        <MdClose className="text-2xl" />
                    </button>
                </div>

                {/* Form Content - Cuộn được */}
                <form onSubmit={handleConfirm} className="overflow-y-auto p-10 pt-6 flex-1 custom-scrollbar">
                    <div className="space-y-12">

                        {/* Phần 1: Thông tin cá nhân */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                                    <MdPerson className="text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Thông tin cá nhân</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Họ và tên <span className="text-red-500">*</span></label>
                                    <input name="ho_ten" value={formData.ho_ten} onChange={handleChange} type="text" placeholder="Nguyễn Văn A" className={inputClass} required />
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Ngày sinh <span className="text-red-500">*</span></label>
                                    <input name="nam_sinh" value={formData.nam_sinh} onChange={handleChange} type="date" className={inputClass} required />
                                </div>

                                <div className="col-span-1 relative">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Giới tính <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select name="gioi_tinh" value={formData.gioi_tinh} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer pr-10`} required>
                                            <option value="">Chọn...</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                        </select>
                                        <MdExpandMore className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl" />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Số điện thoại<span className="text-red-500">*</span></label>
                                    <input name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} type="tel" placeholder="090..." className={inputClass} required />
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Số BHYT<span className="text-red-500">*</span></label>
                                    <input name="so_bhyt" value={formData.so_bhyt} onChange={handleChange} type="text" placeholder="GD123..." className={inputClass} required />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Địa chỉ thường trú<span className="text-red-500">*</span></label>
                                    <input name="dia_chi" value={formData.dia_chi} onChange={handleChange} type="text" placeholder="Số nhà, tên đường, phường/xã..." className={inputClass} required />
                                </div>
                            </div>
                        </section>

                        {/* Phần 2: Thông tin y tế */}
                        <section className="bg-slate-50/50 -mx-10 px-10 py-8 border-y border-slate-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <MdLocalHospital className="text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Thông tin y tế nội bộ</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Khoa điều trị</label>
                                    <input type="text" value={userData.ten_khoa || "Đang tải..."} disabled className="w-full bg-slate-200/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-medium cursor-not-allowed text-sm" />
                                </div>

                                <div>
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Bác sĩ phụ trách</label>
                                    <input type="text" value={userData.fullname || "Đang tải..."} disabled className="w-full bg-slate-200/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 font-medium cursor-not-allowed text-sm" />
                                </div>

                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Điều dưỡng phụ trách <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select name="y_ta_id" value={formData.y_ta_id} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer pr-10`} required>
                                            <option value="">-- Chọn điều dưỡng --</option>
                                            {nurses.map(nurse => (
                                                <option key={nurse.id} value={nurse.id}>{nurse.fullname}</option>
                                            ))}
                                        </select>
                                        <MdExpandMore className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Nhóm máu <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select name="nhom_mau" value={formData.nhom_mau} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer pr-10`} required>
                                            <option value="">--Chọn nhóm máu--</option>
                                            <option value="A+">Nhóm A+</option>
                                            <option value="A-">Nhóm A-</option>
                                            <option value="B+">Nhóm B+</option>
                                            <option value="B-">Nhóm B-</option>
                                            <option value="AB+">Nhóm AB+</option>
                                            <option value="AB-">Nhóm AB-</option>
                                            <option value="O+">Nhóm O+</option>
                                            <option value="O-">Nhóm O-</option>
                                        </select>
                                        <MdExpandMore className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Cấp độ chăm sóc <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select name="cap_do" value={formData.cap_do} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer pr-10`} required>
                                            <option value="">--Chọn cấp độ--</option>
                                            <option value="Cấp 1">Cấp 1 (chăm sóc đặc biệt)</option>
                                            <option value="Cấp 2">Cấp 2 (chăm sóc một phần)</option>
                                            <option value="Cấp 3">Cấp 3 (tự chăm sóc)</option>
                                        </select>
                                        <MdExpandMore className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl" />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Chẩn đoán sơ bộ <span className="text-red-500">*</span></label>
                                    <input name="chan_doan" value={formData.chan_doan} onChange={handleChange} type="text" placeholder="Ví dụ: Viêm ruột thừa cấp..." className={inputClass} required />
                                </div>

                                <div className="md:col-span-1">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Lý do nhập viện<span className="text-red-500">*</span></label>
                                    <textarea name="ly_do" value={formData.ly_do} onChange={handleChange} rows="3" className={`${inputClass} resize-none`} placeholder="Mô tả triệu chứng..." required></textarea>
                                </div>

                                <div className="md:col-span-1">
                                    <label className="block text-[13px] font-bold text-slate-700 mb-2 ml-1">Tiền sử bệnh lý<span className="text-red-500">*</span></label>
                                    <textarea name="benh_su" value={formData.benh_su} onChange={handleChange} rows="3" className={`${inputClass} resize-none`} placeholder="Các bệnh nền nếu có..." required></textarea>
                                </div>
                            </div>
                        </section>
                    </div>
                </form>

                {/* Footer - Cố định */}
                <div className="flex justify-end gap-4 px-10 py-6 border-t border-slate-100 bg-white items-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-white text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        onClick={handleConfirm}
                        className="px-10 py-2.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center gap-2"
                    >
                        <span>Xác nhận nhập viện</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Admission;