import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver';


const ExcelModal = async (data, selectedMonth) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo tháng');


    worksheet.columns = [
        { header: '', key: 'category', width: 35 },
        { header: '', key: 'value', width: 20 },
    ];

    worksheet.mergeCells('A1:B1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `BÁO CÁO HOẠT ĐỘNG BỆNH VIỆN - THÁNG ${selectedMonth}`;
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E78' }
    };

    const headerRow = worksheet.addRow(['HẠNG MỤC THỐNG KÊ', 'SỐ LIỆU']);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });


    const reportRows = [
        ['I. NHÂN SỰ', ''],
        ['Tổng số nhân viên', data.total_users],
        ['Bác sĩ', data.total_doctors],
        ['Y tá', data.total_nurses],
        ['Tài khoản đang hoạt động', data.active_account],
        ['', ''],
        ['II. BỆNH NHÂN', ''],
        ['Số ca nhập viện mới (trong tháng)', data.total_patients_monthly],
        ['Số ca đã xuất viện', data.discharge_patients],
        ['Bệnh nhân đang điều trị (hiện tại)', data.active_patients],
        ['', ''],
        ['III. HIỆU SUẤT GIƯỜNG BỆNH', ''],
        ['Tổng quy mô giường', data.total_beds],
        ['Số giường đang sử dụng', data.occupied_beds],
        ['Tỷ lệ lấp đầy hiện tại', data.occupancy_rate],
        ['Hiệu suất xoay vòng tháng', data.occupancy_Rate_Month]
    ];

    reportRows.forEach((rowData) => {
        const row = worksheet.addRow(rowData);

        if (rowData[0].includes('I.') || rowData[0].includes('II.') || rowData[0].includes('III.')) {
            row.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFC00000' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
            });
        }


        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    });

    worksheet.addRow([]);
    const footerRow = worksheet.addRow([`Ngày lập báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, '']);
    worksheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);
    footerRow.getCell(1).font = { italic: true };


    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Bao_Cao_Benh_Vien_${selectedMonth}.xlsx`);
};
export default ExcelModal;