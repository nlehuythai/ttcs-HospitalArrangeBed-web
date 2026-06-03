const PatientInfoModal = ({ isOpen, onClose, bed, patient }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />

                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <span className="text-2xl"></span> Hồ sơ bệnh nhân
                </h3>

                {patient ? (
                    <div className="space-y-5">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Họ tên</p>
                            <p className="font-black text-slate-800 text-lg">{patient.ho_ten}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ngày sinh</p>
                                <p className="font-bold text-slate-700">{new Date(patient.nam_sinh).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giới tính</p>
                                <p className="font-bold text-slate-700">{patient.gioi_tinh}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Chẩn đoán</p>
                            <p className="font-semibold text-blue-900 leading-snug">{patient.chan_doan_ban_dau}</p>
                        </div>
                    </div>
                ) : (
                    <div className="py-10 flex flex-col items-center text-slate-400">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-sm font-bold">Đang tải dữ liệu...</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-8 bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-black transition-all active:scale-95"
                >
                    Đóng hồ sơ
                </button>
            </div>
        </div>
    );
};
export default PatientInfoModal;