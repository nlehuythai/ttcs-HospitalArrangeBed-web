import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

const ExportDischargeDocx = (patientInfo) => {
    if (!patientInfo) return;

    // 1. Định dạng ngày tháng năm hiện tại cho phần chữ ký
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const ngaySinhRaw = patientInfo.nam_sinh;
    const ngaySinhFormatted = ngaySinhRaw
        ? new Date(ngaySinhRaw).toLocaleDateString('vi-VN')
        : "---";


    const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" };

    // 4. Khởi tạo cấu trúc Document Word
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
                }
            },
            children: [

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CƠ QUAN CHỦ QUẢN", font: "Times New Roman", size: 22 })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TÊN CƠ SỞ KCB", bold: true, font: "Times New Roman", size: 22 })] })] }),
                                new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, font: "Times New Roman", size: 22 })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", font: "Times New Roman", size: 22 })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "__________________________", font: "Times New Roman", size: 22 })] })] }),
                                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MS:...", font: "Times New Roman", size: 22 })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Số hồ sơ/Số BA:....", bold: true, font: "Times New Roman", size: 22 })] })] })
                            ]
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 500 }
                }),

                // --- TIÊU ĐỀ TÊN BỆNH VIỆN ---
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: "HOSPITAL T&N", bold: true, size: 26, font: "Arial" }),
                    ],
                    spacing: { after: 300 },
                }),

                // --- TIÊU ĐỀ PHIẾU XUẤT VIỆN ---
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: "PHIẾU XUẤT VIỆN", bold: true, size: 36, font: "Arial" }),
                    ],
                    spacing: { after: 500 },
                }),

                // --- BẢNG THÔNG TIN HÀNH CHÍNH (Kẻ ô chia khung) ---
                // --- THÔNG TIN HÀNH CHÍNH (Thay vì dùng Table, dùng Paragraph) ---
                new Paragraph({
                    children: [
                        new TextRun({ text: "Họ và tên bệnh nhân: ", font: "Arial", size: 22 }),
                        new TextRun({ text: patientInfo.ho_ten || "...........................................................................................................", font: "Arial", size: 22 })
                    ],
                    spacing: { after: 150 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Ngày sinh: ", font: "Arial", size: 22 }),
                        new TextRun({ text: ngaySinhFormatted || "...........................................................................................................", font: "Arial", size: 22 })
                    ],
                    spacing: { after: 150 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Số hồ sơ: ", font: "Arial", size: 22 }),
                        new TextRun({ text: patientInfo.id || "...........................................................................................................", font: "Arial", size: 22 })
                    ],
                    spacing: { after: 150 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Khoa: ", font: "Arial", size: 22 }),
                        new TextRun({ text: patientInfo.ten_khoa || "...........................................................................................................", font: "Arial", size: 22 })
                    ],
                    spacing: { after: 150 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Chẩn đoán khi xuất viện: ", font: "Arial", size: 22 }),
                        new TextRun({ text: "...........................................................................................................", font: "Arial", size: 22 })
                    ],
                    spacing: { after: 400 } // Khoảng cách lớn hơn một chút trước khi sang phần QUÁ TRÌNH ĐIỀU TRỊ
                }),

                // Khoảng cách sau bảng hành chính
                new Paragraph({ spacing: { before: 400 } }),

                new Paragraph({
                    children: [
                        new TextRun({ text: "QUÁ TRÌNH ĐIỀU TRỊ", bold: true, underline: {}, font: "Arial", size: 24 })
                    ],
                    spacing: { after: 150 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: patientInfo.tom_tat_qua_trinh || "[Tóm tắt quá trình điều trị]",
                            font: "Arial",
                            size: 22
                        })
                    ],
                    spacing: { after: 400 }
                }),

                -
                new Paragraph({
                    children: [
                        new TextRun({ text: "HƯỚNG DẪN SAU KHI XUẤT VIỆN", bold: true, underline: {}, font: "Arial", size: 24 })
                    ],
                    spacing: { after: 150 }
                }),
                new Paragraph({ children: [new TextRun({ text: "1. Tuân thủ uống thuốc theo toa.", font: "Arial", size: 22 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: `2. Tái khám theo lịch hẹn: ...........`, font: "Arial", size: 22 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "3. Dấu hiệu cần nhập viện ngay: ...........", font: "Arial", size: 22 })], spacing: { after: 800 } }),

                // --- KHU VỰC CHỮ KÝ (Dùng bảng ẩn viền để chia đều 2 bên trái/phải) ---
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
                    },
                    rows: [
                        // Dòng 1: Ngày tháng năm đưa lên đầu chữ ký
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ngày .... tháng .... năm ....", font: "Arial", size: 22 })] })]
                                }),
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Ngày ${day} tháng ${month} năm ${year}`, font: "Arial", size: 22 })] })]
                                })
                            ]
                        }),
                        // Dòng 2: Chức vụ & Khoảng trống ký tên
                        new TableRow({
                            children: [
                                // Trưởng khoa duyệt (Bên trái)
                                new TableCell({
                                    children: [
                                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TRƯỞNG KHOA DUYỆT", bold: true, font: "Arial", size: 22 })], spacing: { before: 150 } }),
                                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký và đóng dấu)", italic: true, font: "Arial", size: 20 })] })
                                    ]
                                }),
                                // Bác sĩ điều trị (Bên phải)
                                new TableCell({
                                    children: [
                                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "BÁC SĨ ĐIỀU TRỊ", bold: true, font: "Arial", size: 22 })], spacing: { before: 150 } }),
                                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Ký và ghi rõ họ tên)", italic: true, font: "Arial", size: 20 })] }),
                                        // Khoảng trống giả lập để ký tên
                                        new Paragraph({ spacing: { before: 1000 } }),
                                        // Hiển thị họ tên bác sĩ ở dưới cùng của cột phải
                                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: patientInfo.fullname || "", bold: true, font: "Arial", size: 22 })] })
                                    ]
                                })
                            ]
                        })
                    ]
                })

            ],
        }],
    });

    // 5. Tiến hành tạo Blob và tải xuống máy người dùng (.docx)
    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `Phieu_Xuat_Vien_${patientInfo.ho_ten || "BN"}.docx`);
    });
};

export default ExportDischargeDocx;