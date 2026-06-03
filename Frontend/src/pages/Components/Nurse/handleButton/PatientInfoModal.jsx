const PatientInfoModal = ({ isOpen, onClose, bed, patient }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in duration-300">
                <h3 className="text-lg font-black text-slate-800 mb-4">Thông tin bệnh nhân</h3>
                {patient ? (
                    <div className="space-y-3">
                        <p><strong>Họ tên:</strong> {patient.ho_ten}</p>
                        <p><strong>Năm sinh:</strong> {patient.nam_sinh}</p>
                        <p><strong>Giới tính:</strong> {patient.gioi_tinh}</p>
                        <p><strong>Chẩn đoán:</strong> {patient.chan_doan_ban_dau}</p>
                    </div>
                ) : (
                    <p className="text-slate-500 italic">Đang tải thông tin...</p>
                )}
                <button onClick={onClose} className="w-full mt-6 bg-slate-100 py-2 rounded-xl font-bold">Đóng</button>
            </div>
        </div>
    );
};
export default PatientInfoModal;