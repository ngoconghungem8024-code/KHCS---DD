/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { MedicalRecord } from '../types';

export const exportToWord = async (data: MedicalRecord) => {
  const formatMultiLine = (text: string | undefined) => {
    if (!text) return [new TextRun("...")];
    const lines = text.split('\n');
    return lines.map((line, i) => new TextRun({
      text: line,
      break: i > 0 ? 1 : 0
    }));
  };

  const createTableCell = (text: string, bold = false) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
    verticalAlign: AlignmentType.CENTER,
    margins: { top: 100, bottom: 100, left: 100, right: 100 }
  });

  const testResultsTable = data.testResults.length > 0 ? new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createTableCell("Tên xét nghiệm", true),
          createTableCell("Giá trị", true),
          createTableCell("Đơn vị", true),
          createTableCell("Giá trị bình thường", true),
          createTableCell("Nhận xét", true),
        ]
      }),
      ...data.testResults.map(res => new TableRow({
        children: [
          createTableCell(res.name || "..."),
          createTableCell(res.value || "..."),
          createTableCell(res.unit || "..."),
          createTableCell(res.normalValue || "..."),
          createTableCell(res.remark || "..."),
        ]
      }))
    ]
  }) : new Paragraph({ text: "(Chưa có kết quả xét nghiệm)" });

  const drugOrderList = data.drugOrderRows.length > 0 ? data.drugOrderRows.map(row => {
    const qty = row.quantity ? (row.quantity.startsWith('x') ? row.quantity : `x${row.quantity}`) : "";
    const timeStr = row.time ? `lúc ${row.time}` : "";
    const formattedLine = `${row.name || "..."} ${qty} ${row.route || "..."} ${row.speed || "..."} ${timeStr}`.replace(/\s+/g, ' ').trim();
    return new Paragraph({
      children: [new TextRun({ text: formattedLine })],
      indent: { left: 720 }
    });
  }) : [new Paragraph({ text: "(Chưa có y lệnh thuốc)" })];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `BỆNH ÁN LÂM SÀNG ĐIỀU DƯỠNG BỆNH ${data.title.toUpperCase()}`,
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // I. PHẦN HÀNH CHÁNH
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "I. PHẦN HÀNH CHÁNH (1đ)", bold: true })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `1. Họ và tên: ${data.fullName || "..."}` }),
              new TextRun({ text: `    Tuổi: ${data.age || "..."}`, break: 0 }),
              new TextRun({ text: `    Giới: ${data.gender || "..."}`, break: 0 }),
            ],
          }),
          new Paragraph({ children: [new TextRun({ text: `2. Nghề nghiệp: ${data.occupation || "..."}` })] }),
          new Paragraph({ children: [new TextRun({ text: `3. Dân tộc: ${data.ethnicity || "..."}` })] }),
          new Paragraph({ children: [new TextRun({ text: `4. Địa chỉ: ${data.address || "..."}` })] }),
          new Paragraph({ 
            children: [
              new TextRun({ text: `5. Ngày vào viện: ${data.admissionHour || "..."} giờ ${data.admissionMinute || "..."} phút, ngày ${data.admissionDay || "..."} tháng ${data.admissionMonth || "..."} năm ${data.admissionYear || "..."}` })
            ] 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: `6. Ngày vào khoa điều trị: ${data.departmentHour || "..."} giờ ${data.departmentMinute || "..."} phút, ngày ${data.departmentDay || "..."} tháng ${data.departmentMonth || "..."} năm ${data.departmentYear || "..."}` })
            ] 
          }),
          new Paragraph({ text: "" }),

          // II. PHẦN CHUYÊN MÔN
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "II. PHẦN CHUYÊN MÔN", bold: true })],
          }),
          new Paragraph({ children: [new TextRun({ text: `1. Lý do vào viện: ` }), ...formatMultiLine(data.reason)] }),
          new Paragraph({ children: [new TextRun({ text: `2. Bệnh sử: ` }), ...formatMultiLine(data.history)] }),
          new Paragraph({ children: [new TextRun({ text: `3. Tiền sử:`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `- Bản thân:` })] }),
          new Paragraph({ children: [new TextRun({ text: `    + Bệnh nội khoa: ` }), ...formatMultiLine(data.personalInternal)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Bệnh ngoại khoa: ` }), ...formatMultiLine(data.personalExternal)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Dị ứng thuốc: ` }), ...formatMultiLine(data.allergy)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Hút thuốc lá: ${data.smokingPacksPerYear || "..."} gói/năm (hút ${data.smokingYears || "..."} năm)` })] }),
          new Paragraph({ children: [new TextRun({ text: `    + Uống rượu: ` }), ...formatMultiLine(data.alcohol)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Thói quen ăn uống: ` }), ...formatMultiLine(data.eatingHabits)] }),
          new Paragraph({ children: [new TextRun({ text: `- Gia đình: ` }), ...formatMultiLine(data.familyHistory)] }),

          new Paragraph({ children: [new TextRun({ text: `4. Tình trạng lúc vào viện: ${data.admissionStateHour || "..."} giờ ${data.admissionStateMinute || "..."} phút, ngày ${data.admissionStateDay || "..."} tháng ${data.admissionStateMonth || "..."} năm ${data.admissionStateYear || "..."} (0.5đ)`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `- Toàn thân:` })] }),
          new Paragraph({ children: [new TextRun({ text: `    + Tri giác: ` }), ...formatMultiLine(data.consciousness)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Thể trạng: ` }), ...formatMultiLine(data.physique)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Da niêm: ` }), ...formatMultiLine(data.skinMucosa)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Lông, tóc, móng: ` }), ...formatMultiLine(data.hairNails)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Sinh hiệu (DHST):` })] }),
          new Paragraph({ 
            children: [
              new TextRun({ text: `        Mạch: ${data.pulse || "..."} lần/phút` }),
              new TextRun({ text: `        Nhịp thở: ${data.respiration || "..."} lần/phút`, break: 0 }),
            ] 
          }),
          new Paragraph({ 
            children: [
              new TextRun({ text: `        HA: ${data.bloodPressure || "..."} mmHg` }),
              new TextRun({ text: `        SPO2: ${data.spo2 || "..."}%` }),
              new TextRun({ text: `        Nhiệt độ: ${data.temperature || "..."}`, break: 0 }),
            ] 
          }),
          
          new Paragraph({ children: [new TextRun({ text: `- Tuần hoàn: ` }), ...formatMultiLine(data.circulatory)] }),
          new Paragraph({ children: [new TextRun({ text: `- Hô hấp: ` }), ...formatMultiLine(data.respiratory)] }),
          new Paragraph({ children: [new TextRun({ text: `- Tiêu hóa: ` }), ...formatMultiLine(data.digestive)] }),
          new Paragraph({ children: [new TextRun({ text: `- Tiết niệu-sinh dục: ` }), ...formatMultiLine(data.urogenital)] }),
          new Paragraph({ children: [new TextRun({ text: `- Thần kinh: ` }), ...formatMultiLine(data.nervous)] }),
          new Paragraph({ children: [new TextRun({ text: `- Cơ-xuong-khớp: ` }), ...formatMultiLine(data.musculoskeletal)] }),
          new Paragraph({ children: [new TextRun({ text: `- Mắt, tai-mũi-họng, răng-hàm-mặt: ` }), ...formatMultiLine(data.entEyesDental)] }),

          new Paragraph({ children: [new TextRun({ text: `5. Chẩn đoán:`, bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: `+ Lúc vào viện: ${data.diagnosisAdmission || "..."}` })] }),
          new Paragraph({ children: [new TextRun({ text: `+ Tại khoa điều trị: ${data.diagnosisDepartment || "..."}` })] }),
          new Paragraph({ children: [new TextRun({ text: `+ Tại khoa điều trị hiện tại: ` }), ...formatMultiLine(data.diagnosisCurrent)] }),

          new Paragraph({ children: [new TextRun({ text: `6. Cận lâm sàng:`, bold: true })] }),
          testResultsTable,
          
          new Paragraph({ children: [new TextRun({ text: `7. Tóm tắt bệnh án: ` }), ...formatMultiLine(data.summary)] }),
          new Paragraph({ children: [new TextRun({ text: `8. Xử trí lúc vào viện: ` }), ...formatMultiLine(data.initialTreatment)] }),

          new Paragraph({ 
            children: [
              new TextRun({ text: `9. Tình trạng hiện tại lúc làm KHCS: ngày ${data.currentStateDay || "..."} tháng ${data.currentStateMonth || "..."} năm ${data.currentStateYear || "..."} (Ngày điều trị thứ ${data.treatmentDay || "..."})`, bold: true })
            ] 
          }),
          new Paragraph({ children: [new TextRun({ text: `- Toàn thân:` })] }),
          new Paragraph({ children: [new TextRun({ text: `    + Tri giác: ` }), ...formatMultiLine(data.currentConsciousness)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Thể trạng: ` }), ...formatMultiLine(data.currentPhysique)] }),
          new Paragraph({ children: [new TextRun({ text: `    + Da niêm: ` }), ...formatMultiLine(data.currentSkinMucosa)] }),
          new Paragraph({ children: [new TextRun({ text: `- Tuần hoàn: ` }), ...formatMultiLine(data.currentCirculatory)] }),
          new Paragraph({ children: [new TextRun({ text: `- Hô hấp: ` }), ...formatMultiLine(data.currentRespiratory)] }),
          new Paragraph({ children: [new TextRun({ text: `- Tiêu hóa: ` }), ...formatMultiLine(data.currentDigestive)] }),
          new Paragraph({ children: [new TextRun({ text: `- Tiết niệu-sinh dục: ` }), ...formatMultiLine(data.currentUrogenital)] }),
          new Paragraph({ children: [new TextRun({ text: `- Thần kinh: ` }), ...formatMultiLine(data.currentNervous)] }),
          new Paragraph({ children: [new TextRun({ text: `- Cơ-xuong-khớp: ` }), ...formatMultiLine(data.currentMusculoskeletal)] }),
          new Paragraph({ children: [new TextRun({ text: `- Mắt, tai-mũi-họng, răng-hàm-mặt: ` }), ...formatMultiLine(data.currentEntEyesDental)] }),

          new Paragraph({ children: [new TextRun({ text: `10. Y lệnh thuốc:`, bold: true })] }),
          ...drugOrderList,
          
          new Paragraph({ children: [new TextRun({ text: `11. Y lệnh chăm sóc:`, bold: true })] }),
          new Paragraph({ children: formatMultiLine(data.careOrders) }),
          new Paragraph({ children: [new TextRun({ text: `12. Phân cấp điều dưỡng: ${data.nursingLevel || "..."}` })] }),

          new Paragraph({ text: "" }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: "III. CHẨN ĐOÁN VÀ CAN THIỆP CHĂM SÓC", bold: true })],
          }),
          
          new Paragraph({ children: [new TextRun({ text: `1. Chẩn đoán chăm sóc:`, bold: true })] }),
          ...data.nursingDiagnoses.map((item, index) => new Paragraph({
            children: [new TextRun({ text: `1.${index + 1}. ` }), ...formatMultiLine(item)]
          })),

          new Paragraph({ children: [new TextRun({ text: `2. Can thiệp chăm sóc:`, bold: true })] }),
          ...data.nursingInterventions.map((item, index) => new Paragraph({
            children: [new TextRun({ text: `2.${index + 1}. ` }), ...formatMultiLine(item)]
          })),

          new Paragraph({ children: [new TextRun({ text: `3. Đánh giá chăm sóc:`, bold: true })] }),
          ...data.nursingEvaluations.map((item, index) => new Paragraph({
            children: [new TextRun({ text: `3.${index + 1}. ` }), ...formatMultiLine(item)]
          })),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `BenhAn_${data.fullName || "Unknow"}.docx`);
};
