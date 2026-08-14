import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, HeadingLevel } from "docx";
import { NextResponse } from "next/server";

const toRoman = (num: number): string => {
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
  return roman[num] || num.toString();
}

export async function generateContractWord(contract: any, company: any) {
  
  const createdDate = new Date(contract.createdAt);
  const quotation = contract.quotation;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } }
        },
        children: [
          // Header
          new Paragraph({
            text: company?.name || "CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VIỄN ĐÔNG",
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            text: company?.address || "Lô 17 đường 18A, KĐT Lê Hồng Phong 2, P Nam Nha Trang, Tỉnh Khánh Hòa",
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({ text: "" }),
          
          new Paragraph({
            children: [
              new TextRun({ text: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Độc lập – Tự do – Hạnh phúc", bold: true, size: 22, underline: {} }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Title
          new Paragraph({
            children: [
              new TextRun({ text: "HỢP ĐỒNG MUA BÁN", bold: true, size: 32 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Số: ${contract.code}`, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),

          // Basis
          new Paragraph({ text: "Căn cứ Bộ luật dân sự số 91/2015/QH13 ngày 24/11/2015." }),
          new Paragraph({ text: "Căn cứ Bộ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005." }),
          new Paragraph({ text: "Căn cứ nhu cầu và khả năng của hai bên." }),
          new Paragraph({ text: "" }),
          
          new Paragraph({ text: `Hôm nay, ngày ${createdDate.getDate()} tháng ${createdDate.getMonth()+1} năm ${createdDate.getFullYear()} chúng tôi gồm:` }),
          new Paragraph({ text: "" }),

          // Parties
          new Paragraph({ children: [new TextRun({ text: "Bên Mua (Bên A):", bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: contract.lead?.customer?.name || "...", bold: true, size: 22 })] }),
          new Paragraph({ text: `Điện thoại: ${contract.lead?.customer?.phone || "..."}` }),
          new Paragraph({ text: `Email: ${contract.lead?.customer?.email || "..."}` }),
          new Paragraph({ text: `Địa chỉ: ${contract.lead?.customer?.address || "..."}` }),
          new Paragraph({ text: "" }),

          new Paragraph({ children: [new TextRun({ text: "Bên Bán (Bên B):", bold: true, size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: company?.name || "CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VIỄN ĐÔNG", bold: true, size: 22 })] }),
          new Paragraph({ text: `Địa chỉ: ${company?.address || "Lô 17 đường 18A, KĐT Lê Hồng Phong 2, Phường Nam Nha Trang, Tỉnh Khánh Hòa"}` }),
          new Paragraph({ text: `Điện thoại: ${company?.phone || "0905.399.636"}` }),
          new Paragraph({ text: `Mã số thuế: ${company?.taxCode || "4201341631"}` }),
          new Paragraph({ text: "Tài khoản: 121992319 - Ngân hàng TMCP Á Châu ACB Khánh Hòa PGD Phương Sơn" }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "Sau khi thỏa thuận, hai bên đồng ý ký kết hợp đồng mua với nội dung như sau:" }),
          new Paragraph({ text: "" }),

          // Article 1
          new Paragraph({ children: [new TextRun({ text: "ĐIỀU 1: NỘI DUNG CÔNG VIỆC VÀ GIÁ TRỊ HỢP ĐỒNG", bold: true, size: 24 })] }),
          new Paragraph({ text: "Bên B đồng ý cung cấp hàng hóa cho Bên A theo những nội dung sau:" }),
          new Paragraph({ text: "" }),
          
          // Generate Table
          createContractTable(quotation),

          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tổng Cộng (VND) đã bao gồm VAT: ", bold: true }),
              new TextRun({ text: quotation?.grandTotal.toLocaleString("vi-VN") || "0", bold: true }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: "" }),

          // Terms
          ...createTermsParagraphs(contract.terms || ""),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Signatures table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "ĐẠI DIỆN BÊN A", bold: true, size: 24 })], alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "ĐẠI DIỆN BÊN B", bold: true, size: 24 })], alignment: AlignmentType.CENTER })],
                  })
                ]
              })
            ]
          })
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=Contract-${contract.code}.docx`
    }
  });
}

function createTermsParagraphs(terms: string): Paragraph[] {
  const lines = terms.split('\n');
  return lines.map(line => {
    const isHeader = line.trim().startsWith('Điều') || line.trim().match(/^[0-9]\./);
    return new Paragraph({
      children: [new TextRun({ text: line, bold: isHeader, size: isHeader ? 24 : 22 })],
      alignment: AlignmentType.JUSTIFIED,
    });
  });
}

function createContractTable(quotation: any): Table {
  const rows: TableRow[] = [];

  // Header Row
  rows.push(new TableRow({
    tableHeader: true,
    children: [
      new TableCell({ children: [new Paragraph({ text: "Stt", alignment: AlignmentType.CENTER })], shading: { fill: "E2EFDA" } }),
      new TableCell({ children: [new Paragraph({ text: "Thiết bị", alignment: AlignmentType.CENTER })], shading: { fill: "E2EFDA" } }),
      new TableCell({ children: [new Paragraph({ text: "Mô tả", alignment: AlignmentType.CENTER })], shading: { fill: "E2EFDA" } }),
      new TableCell({ children: [new Paragraph({ text: "ĐVT", alignment: AlignmentType.CENTER })], shading: { fill: "E2EFDA" } }),
      new TableCell({ children: [new Paragraph({ text: "SL", alignment: AlignmentType.CENTER })], shading: { fill: "E2EFDA" } }),
      new TableCell({ children: [new Paragraph({ text: "Đơn giá", alignment: AlignmentType.CENTER })], shading: { fill: "E2EFDA" } }),
      new TableCell({ children: [new Paragraph({ text: "Thành tiền", alignment: AlignmentType.CENTER })], shading: { fill: "E2EFDA" } }),
    ]
  }));

  if (quotation && quotation.sections) {
    let sectionIndex = 1;
    quotation.sections.forEach((section: any) => {
      let sectionTotal = 0;
      section.items.forEach((item: any) => { sectionTotal += item.total });

      // Section row
      rows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: toRoman(sectionIndex++), alignment: AlignmentType.CENTER })], shading: { fill: "F2F2F2" } }),
          new TableCell({ children: [new Paragraph({ text: section.name })], shading: { fill: "F2F2F2" }, columnSpan: 5 }),
          new TableCell({ children: [new Paragraph({ text: sectionTotal.toLocaleString('vi-VN'), alignment: AlignmentType.RIGHT })], shading: { fill: "F2F2F2" } }),
        ]
      }));

      // Item rows
      let itemStt = 1;
      section.items.forEach((item: any) => {
        rows.push(new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: (itemStt++).toString(), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: item.name })] }),
            new TableCell({ children: [new Paragraph({ text: item.catalogItem?.description || "" })] }),
            new TableCell({ children: [new Paragraph({ text: item.unit || "Cái", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: item.quantity.toString(), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: item.unitPrice.toLocaleString('vi-VN'), alignment: AlignmentType.RIGHT })] }),
            new TableCell({ children: [new Paragraph({ text: item.total.toLocaleString('vi-VN'), alignment: AlignmentType.RIGHT })] }),
          ]
        }));
      });
    });
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows
  });
}
