import React from "react";
import { MdEditNote, MdExitToApp } from "react-icons/md";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import NoteProressCard from "./NoteProressCard";

const ActionCard = (props) => {
    const [showNote, setShowNote] = useState(false);
    const { selectedPatient } = props;
    const navigate = useNavigate();

    const handleOpenDischargePage = () => {
        if (!selectedPatient) return;
        console.log("Dữ liệu bệnh nhân đang chọn:", selectedPatient);
        navigate(`/doctor/DischargeProcessDoctor/${selectedPatient.benh_nhan_id}`);
    };
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Hành động</h3>
            <div className="grid grid-cols-2 gap-4">

                {/* Nút Ghi chú diễn biến */}
                <button onClick={() => setShowNote(true)} className="flex flex-col items-start p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md hover:border-slate-300 transition-all group text-left">
                    <div className="p-3 bg-teal-50 rounded-2xl mb-4 group-hover:bg-slate-100 transition-colors">
                        <MdEditNote size={28} className="text-slate-900" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-lg leading-tight">Ghi chú diễn biến</p>
                        <p className="text-slate-500 text-sm mt-1">Thêm diễn biến mới</p>
                    </div>
                </button>

                {/* Nút Cho phép xuất viện */}
                <button
                    onClick={handleOpenDischargePage}
                    className="flex flex-col items-start p-6 bg-teal-500 rounded-[2rem] shadow-teal-500/20 hover:bg-teal-600 transition-all text-left group">
                    <div className="p-3 bg-white/10 rounded-2xl mb-4 group-hover:bg-white/20 transition-colors">
                        <MdExitToApp size={28} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-lg leading-tight">Cho phép xuất viện</p>
                        <p className="text-slate-300 text-sm mt-1 font-medium">Viết lệnh xuất viện</p>
                    </div>
                </button>
                <NoteProressCard
                    isOpen={showNote}
                    onClose={() => setShowNote(false)}
                    patientName={selectedPatient.ho_ten}
                    admissionId={selectedPatient?.benh_nhan_id}
                    doctorName={selectedPatient.ten_bac_si}
                />
            </div>
        </div>
    );
};

export default ActionCard;