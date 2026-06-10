import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { FaAngleDown } from "react-icons/fa";

const BedAssignmentModal = ({ isOpen, onClose, selectedBed, patients, onConfirm }) => {
    const [selectedHosoId, setSelectedHosoId] = useState("");

    if (!isOpen) return null;
    const filteredPatients = patients.filter(p => {
        const matchKhoa = String(p.ten_khoa?.trim().toLowerCase()) === String(selectedBed?.ten_khoa.trim().toLowerCase());
        return matchKhoa;
    });

    const handleConfirm = () => {
        if (!selectedHosoId) {
            alert("Vui lòng chọn bệnh nhân!");
            return;
        }
        // Gửi ID của HỒ SƠ (hoso_id) để Backend update
        onConfirm(Number(selectedHosoId));
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[1.5rem] w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">
                        Xếp bệnh nhân vào giường {selectedBed?.bed_number}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <label className="text-sm font-bold text-slate-700 block mb-2">
                            Bệnh nhân đang chờ ({filteredPatients.length})
                        </label>
                        <select
                            value={selectedHosoId}
                            onChange={(e) => setSelectedHosoId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-600 focus:outline-none appearance-none cursor-pointer"
                        >
                            <option value="">-- Chọn bệnh nhân --</option>
                            {filteredPatients.map(p => (
                                <option key={p.hoso_id} value={p.hoso_id}>
                                    {p.ho_ten} - {p.ten_khoa}
                                </option>
                            ))}
                        </select>
                        <FaAngleDown className="absolute right-4 top-11 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-600 border border-slate-100 hover:bg-slate-50">Hủy</button>
                    <button onClick={handleConfirm} className="px-6 py-2.5 rounded-xl text-white bg-slate-500 hover:bg-slate-600 shadow-lg">Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

export default BedAssignmentModal;