import { API_URL } from "../../../api";
const ReportBedModal = ({ isOpen, onClose, bed, token }) => {
    if (!isOpen) return null;
    const handleReportDone = async (bedId) => {
        try {
            await fetch(`${API_URL}/api/nurse/report-bed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bed_id: bedId,
                    message: "Giường đã dọn sạch, Admin vui lòng đổi trạng thái giường."
                })
            });
            alert("Đã gửi báo cáo cho Admin!");
        } catch (err) {
            alert("Lỗi gửi báo cáo");
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl w-96 shadow-2xl">
                <h3 className="text-lg font-black text-slate-800 mb-4">Xác nhận dọn dẹp</h3>
                <p className="text-slate-500 mb-6 text-sm">
                    Bạn xác nhận đã dọn dẹp xong giường <strong>{bed?.ma_giuong}</strong> và báo Admin cập nhật trạng thái?
                </p>
                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Hủy</button>
                    <button
                        onClick={() => { handleReportDone(bed.id); onClose(); }}
                        className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600"
                    >
                        Gửi báo cáo
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ReportBedModal;