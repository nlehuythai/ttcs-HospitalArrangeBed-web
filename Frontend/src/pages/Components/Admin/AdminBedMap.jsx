import React, { useEffect, useState } from "react";
import {
    MdBed, MdPerson, MdCleaningServices, MdSearch,
    MdFilterList, MdMoreVert, MdEdit, MdHistory, MdDeleteOutline, MdChevronRight, MdMeetingRoom, MdExpandMore, MdCheck
} from "react-icons/md";
import HistoryModal from "./HandleButton/HistoryBedModal";
import EditBedModal from "./HandleButton/EditBedModal";
import AddBedModal from "./HandleButton/AddBedModal";
const AdminBedMap = () => {
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [khoas, setKhoas] = useState([])
    const [selectedKhoa, setSelectedKhoa] = useState("Tất cả khoa");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const token = sessionStorage.getItem('token');
    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/totalbeds');
            const data = await res.json();
            setBeds(data)
            setLoading(false);
        } catch (err) {
            console.error("Lỗi load giường:", err);
        }

    }
    const loadKhoas = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/departments');
            const data = await res.json();
            setKhoas(data);
        } catch (err) {
            console.error("Lỗi load khoa:", err);
        }
    };
    const handleDeleteBed = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/delete-bed/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                alert("Xóa giường thành công!");
                fetchData();
            }
        } catch (error) {
            console.error("Lỗi xóa:", error);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        loadKhoas();
    }, [])
    const filteredBeds = selectedKhoa === "Tất cả khoa"
        ? beds
        : beds.filter(b => b.ten_khoa === selectedKhoa);
    const handleOpenEdit = (bed) => {
        setSelectedBed(bed);
        setNewStatus(bed.trang_thai);
        setIsEditModalOpen(true);
    };
    const handleOpenHistory = (bed) => {
        setSelectedBed(bed);
        setIsHistoryModalOpen(true);
    }
    const hanadleOpenAddBed = () => {
        setIsAddModalOpen(true);
    }
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-white sticky top-0 z-30 mb-8">
                <div className="flex items-center gap-4 w-full md:w-auto relative">
                    {/* Icon hiển thị bên trái */}
                    <div className="p-3 bg-teal-50 rounded-2xl text-teal-500 shadow-sm shadow-indigo-100">
                        <MdMeetingRoom size={24} />
                    </div>

                    <div className="flex flex-col relative">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                            Khoa điều trị
                        </span>
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-2 cursor-pointer group transition-all"
                        >
                            <span className="text-lg font-black text-slate-800 group-hover:text-teal-500 transition-colors">
                                {selectedKhoa || "Tất cả khoa"}
                            </span>
                            <MdExpandMore
                                size={22}
                                className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-teal-500' : ''}`}
                            />
                        </div>

                        {isOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                                <div className="absolute top-full left-0 mt-4 w-72 bg-white rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                    <div className="p-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-teal-200">
                                        <button
                                            onClick={() => { setSelectedKhoa("Tất cả khoa"); setIsOpen(false); }}
                                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all ${selectedKhoa === "Tất cả khoa" ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            Tất cả khoa
                                            {selectedKhoa === "Tất cả khoa" && <MdCheck size={20} />}
                                        </button>

                                        <div className="h-px bg-slate-50 my-1 mx-4" />

                                        {khoas.map((k) => (
                                            <button
                                                key={k.id}
                                                onClick={() => { setSelectedKhoa(k.ten_khoa); setIsOpen(false); }}
                                                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all mb-1 ${selectedKhoa === k.ten_khoa ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {k.ten_khoa}
                                                {selectedKhoa === k.ten_khoa && <MdCheck size={20} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={hanadleOpenAddBed}
                    className="group relative flex items-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-700 text-slate-100 rounded-2xl text-sm font-black transition-all duration-300 shadow-2xl shadow-indigo-200 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="text-xl">+</span>
                    THÊM GIƯỜNG MỚI
                </button>
            </div>

            {/* Danh sách giường theo dạng Grid đặc biệt cho Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBeds.map((bed) => (
                    <div key={bed.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:border-blue-200 transition-all">
                        {/* Header của thẻ giường */}
                        <div className={`p-4 flex justify-between items-center ${bed.trang_thai === 'Đang sử dụng' ? 'bg-red-50' :
                            bed.trang_thai === 'Đang dọn dẹp' ? 'bg-yellow-50' : 'bg-emerald-50'
                            }`}>
                            <div className="flex items-center gap-2">
                                <MdBed className={
                                    bed.trang_thai === 'Đang sử dụng' ? 'text-red-500' :
                                        bed.trang_thai === 'Đang dọn dẹp' ? 'text-yellow-600' : 'text-emerald-500'
                                } size={24} />
                                <span className="font-black text-slate-800 tracking-tight">{bed.ma_giuong}</span>
                            </div>
                            <div className="relative">

                                <button onClick={() => setOpenMenuId(openMenuId === bed.id ? null : bed.id)} className="p-1 hover:bg-white/50 rounded-full text-slate-400">
                                    <MdMoreVert size={20} />
                                </button>
                                {openMenuId === bed.id && bed.trang_thai === 'Trống' && (
                                    <div className="absolute right-0 mt-1 w-32 bg-white shadow-2xl rounded-xl z-20 border border-slate-100 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Bạn có chắc chắn muốn xóa giường ${bed.ma_giuong}?`)) {
                                                    handleDeleteBed(bed.id);
                                                    setOpenMenuId(null);
                                                }
                                            }}
                                            className="group/item w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-red-50/80 transition-all duration-300 ease-out"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 text-red-500 group-hover/item:bg-red-500 group-hover/item:text-white group-hover/item:rotate-[-10deg] transition-all duration-300 shadow-sm">
                                                    <MdDeleteOutline size={20} />
                                                    <span className="absolute inset-0 rounded-xl bg-red-400 opacity-0 group-hover/item:animate-ping"></span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-700 group-hover/item:text-red-700 transition-colors">
                                                        Xóa giường
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-red-300">
                                                <MdChevronRight size={18} />
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bed.ma_giuong}</p>
                                {bed.trang_thai === 'Đang sử dụng' ? (
                                    <div className="mt-2">
                                        <h4 className="font-black text-slate-800 flex items-center gap-2">
                                            <MdPerson className="text-slate-400" /> {bed.ten_phong}
                                        </h4>
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <div className="text-[11px] bg-slate-50 p-2 rounded-lg">
                                                <p className="text-slate-400 font-bold">Bác sĩ</p>
                                                <p className="text-slate-700 font-black">{bed.ten_bs}</p>
                                            </div>
                                            <div className="text-[11px] bg-slate-50 p-2 rounded-lg">
                                                <p className="text-slate-400 font-bold">Bệnh nhân</p>
                                                <p className="text-slate-700 font-black">{bed.ten_bn} - ID: {bed.benh_nhan_id}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <p className={`text-sm font-black ${bed.trang_thai === 'Đang dọn dẹp' ? 'text-yellow-600' : 'text-emerald-500'
                                            }`}>
                                            {bed.trang_thai === 'Đang dọn dẹp' ? 'Đang chờ vệ sinh' : 'Sẵn sàng tiếp nhận'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 border-t border-dashed border-slate-100 flex justify-between gap-2">
                                <button onClick={() => handleOpenEdit(bed)} disabled={bed.trang_thai === "Đang sử dụng"} className={`flex-1 py-2 flex justify-center items-center gap-1 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors${(bed.trang_thai === "Đang sử dụng")
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    }`}>
                                    <MdEdit size={14} /> Chỉnh sửa
                                </button>
                                <button onClick={() => handleOpenHistory(bed)} className="flex-1 py-2 flex justify-center items-center gap-1 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                                    <MdHistory size={14} /> Lịch sử
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <EditBedModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                selectedBed={selectedBed}
                newStatus={newStatus}
                setNewStatus={setNewStatus}
                onRefresh={fetchData}
            />
            <HistoryModal
                bed={selectedBed}
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
            />
            <AddBedModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onRefresh={fetchData}
                onAddSuccess={fetchData}
            />
        </div>


    );
}
export default AdminBedMap;