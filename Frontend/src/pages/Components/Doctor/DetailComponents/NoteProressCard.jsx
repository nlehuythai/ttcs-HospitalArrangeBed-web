import React, { useState } from "react";
import { MdClose, MdAdd, MdFavorite, MdWaterDrop, MdThermostat, MdAir } from 'react-icons/md';
import { API_URL } from "../../../../api";
const NoteProressCard = ({ isOpen, onClose, patientName, admissionId, doctorName }) => {

    // 2. State cho Form thêm mới
    const [formData, setFormData] = useState({
        tieu_de: "Theo dõi hàng ngày",
        mach: "",
        huyet_ap: "",
        nhiet_do: "",
        nhip_tho: "",
        noi_dung: ""
    });




    const handleSave = async () => {
        if (!formData.noi_dung) return alert("Vui lòng nhập nội dung diễn biến");
        try {
            const res = await fetch(`${API_URL}/api/admission/history/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ho_so_id: admissionId,
                    tieu_de: formData.tieu_de,
                    noi_dung: formData.noi_dung,
                    mach: parseInt(formData.mach) || null,
                    huyet_ap: formData.huyet_ap,
                    nhiet_do: parseFloat(formData.nhiet_do) || null,
                    nhip_tho: parseInt(formData.nhip_tho) || null
                })
            });

            if (res.ok) {
                // Reset form và tải lại danh sách
                setFormData({ tieu_de: "Theo dõi hàng ngày", mach: "", huyet_ap: "", nhiet_do: "", nhip_tho: "", noi_dung: "" });
                alert("Đã lưu diễn biến bệnh!");
            }
        } catch {
            alert("Lỗi kết nối server");
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-100 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Theo dõi diễn biến - {patientName}</h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Bác sĩ phụ trách: <span className="text-teal-600 uppercase font-bold">{doctorName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="p-6 max-h-[75vh] overflow-y-auto space-y-8">
                    {/* FORM THÊM MỚI */}
                    <div className="p-6 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] space-y-4">
                        <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <MdAdd className="text-teal-600" /> Thêm diễn biến mới
                        </p>

                        <div className="grid grid-cols-4 gap-4">
                            <InputGroup label="Mạch" placeholder="80" value={formData.mach} onChange={(v) => setFormData({ ...formData, mach: v })} />
                            <InputGroup label="Huyết áp" placeholder="120/80" value={formData.huyet_ap} onChange={(v) => setFormData({ ...formData, huyet_ap: v })} />
                            <InputGroup label="Nhiệt độ" placeholder="37" value={formData.nhiet_do} onChange={(v) => setFormData({ ...formData, nhiet_do: v })} />
                            <InputGroup label="Nhịp thở" placeholder="20" value={formData.nhip_tho} onChange={(v) => setFormData({ ...formData, nhip_tho: v })} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nội dung diễn biến</label>
                            <textarea
                                value={formData.noi_dung}
                                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                                placeholder="Mô tả tình trạng bệnh nhân, thuốc đã dùng..."
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm h-24 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none transition-all"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold bg-teal-500 text-slate-100 rounded-xl shadow-lg hover:bg-teal-600 transition-all">
                                Lưu diễn biến
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Sub-components nội bộ
const InputGroup = ({ label, placeholder, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 leading-tight block">{label}</label>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition-all"
        />
    </div>
);


export default NoteProressCard;