import PDFDocument from 'pdfkit'
import { Response } from 'express'

const toRoman = (num: number): string => {
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
  return roman[num] || num.toString();
}

export function generateContractPDF(contract: any, company: any, res: Response) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename=Contract-${contract.code}.pdf`)
  
  doc.pipe(res)

  const fontBold = 'C:\\Windows\\Fonts\\arialbd.ttf'
  const fontNormal = 'C:\\Windows\\Fonts\\arial.ttf'
  
  try { doc.font(fontNormal) } catch (e) { doc.font('Helvetica') }

  const setFont = (type: 'bold' | 'normal', size: number) => {
    try {
        doc.font(type === 'bold' ? fontBold : fontNormal).fontSize(size)
    } catch(e) {
        doc.font(type === 'bold' ? 'Helvetica-Bold' : 'Helvetica').fontSize(size)
    }
  }

  const checkPageBreak = (neededH: number) => {
    if (doc.y + neededH > 800) {
      doc.addPage()
      return true
    }
    return false
  }

  // --- HEADER ---
  setFont('bold', 10)
  doc.text(company?.name || 'CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VIỄN ĐÔNG', 40, 40)
  setFont('normal', 9)
  doc.text(company?.address || 'Lô 17 đường 18A, KĐT Lê Hồng Phong 2, P Nam Nha Trang, Tỉnh Khánh Hòa', 40, 55)

  setFont('bold', 10)
  doc.text('CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', 0, 40, { align: 'center' })
  setFont('bold', 9)
  doc.text('Độc lập – Tự do – Hạnh phúc', 0, 55, { align: 'center', underline: true })

  // --- TITLE ---
  doc.moveDown(4)
  setFont('bold', 16)
  doc.text('HỢP ĐỒNG MUA BÁN', { align: 'center' })
  setFont('normal', 10)
  doc.text(`Số: ${contract.code}`, { align: 'center' })
  doc.moveDown(2)

  // --- BASIS ---
  setFont('normal', 10)
  doc.text('Căn cứ Bộ luật dân sự số 91/2015/QH13 ngày 24/11/2015.')
  doc.text('Căn cứ Bộ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005.')
  doc.text('Căn cứ nhu cầu và khả năng của hai bên.')
  
  const createdDate = new Date(contract.createdAt)
  doc.moveDown(1)
  doc.text(`Hôm nay, ngày ${createdDate.getDate()} tháng ${createdDate.getMonth()+1} năm ${createdDate.getFullYear()} chúng tôi gồm:`)
  doc.moveDown(1)

  // --- PARTIES ---
  setFont('bold', 11)
  doc.text('Bên Mua (Bên A):')
  setFont('bold', 10)
  doc.text(contract.lead?.customer?.name || '...')
  setFont('normal', 10)
  doc.text(`Điện thoại: ${contract.lead?.customer?.phone || '...'}`)
  doc.text(`Email: ${contract.lead?.customer?.email || '...'}`)
  doc.text(`Địa chỉ: ${contract.lead?.customer?.address || '...'}`)
  
  doc.moveDown(1)
  setFont('bold', 11)
  doc.text('Bên Bán (Bên B):')
  setFont('bold', 10)
  doc.text(company?.name || 'CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VIỄN ĐÔNG')
  setFont('normal', 10)
  doc.text(`Địa chỉ: ${company?.address || 'Lô 17 đường 18A, KĐT Lê Hồng Phong 2, Phường Nam Nha Trang, Tỉnh Khánh Hòa'}`)
  doc.text(`Điện thoại: ${company?.phone || '0905.399.636'}`)
  doc.text(`Mã số thuế: ${company?.taxCode || '4201341631'}`)
  doc.text('Tài khoản: 121992319 - Ngân hàng TMCP Á Châu ACB Khánh Hòa PGD Phương Sơn')

  doc.moveDown(2)
  doc.text('Sau khi thỏa thuận, hai bên đồng ý ký kết hợp đồng mua với nội dung như sau:')
  doc.moveDown(1)

  // --- ARTICLE 1 & TABLE ---
  setFont('bold', 11)
  doc.text('ĐIỀU 1: NỘI DUNG CÔNG VIỆC VÀ GIÁ TRỊ HỢP ĐỒNG')
  setFont('normal', 10)
  doc.text('Bên B đồng ý cung cấp hàng hóa cho Bên A theo những nội dung sau:')
  doc.moveDown(1)

  // Table setup
  let y = doc.y
  const boxX = 40
  const boxW = 515
  
  const drawRowBorder = (rowY: number, rowH: number) => {
    doc.rect(boxX, rowY, boxW, rowH).stroke()
    doc.moveTo(70, rowY).lineTo(70, rowY + rowH).stroke()    // Stt
    doc.moveTo(150, rowY).lineTo(150, rowY + rowH).stroke()  // Thiết bị
    doc.moveTo(350, rowY).lineTo(350, rowY + rowH).stroke()  // Mô tả
    doc.moveTo(380, rowY).lineTo(380, rowY + rowH).stroke()  // Đơn vị
    doc.moveTo(415, rowY).lineTo(415, rowY + rowH).stroke()  // S.lượng
    doc.moveTo(480, rowY).lineTo(480, rowY + rowH).stroke()  // Đơn giá
  }

  // Table Header
  checkPageBreak(25)
  doc.rect(boxX, y, boxW, 25).fill('#E2EFDA').stroke()
  doc.fillColor('black')
  drawRowBorder(y, 25)

  setFont('bold', 9)
  doc.text('Stt', 40, y + 8, { width: 30, align: 'center' })
  doc.text('Thiết bị', 75, y + 8, { width: 70, align: 'center' })
  doc.text('Mô tả', 155, y + 8, { width: 190, align: 'center' })
  doc.text('ĐVT', 350, y + 8, { width: 30, align: 'center' })
  doc.text('SL', 380, y + 8, { width: 35, align: 'center' })
  doc.text('Đơn giá', 415, y + 8, { width: 65, align: 'center' })
  doc.text('Thành tiền', 480, y + 8, { width: 75, align: 'center' })
  
  y += 25
  doc.y = y

  // Loop through quotation sections & items
  const quotation = contract.quotation;
  if (quotation && quotation.sections) {
    let sectionIndex = 1
    
    quotation.sections.forEach((section: any) => {
      if(checkPageBreak(20)) { y = doc.y; drawRowBorder(y, 20); }
      
      // Section Header
      doc.rect(boxX, y, boxW, 20).fill('#F2F2F2').stroke()
      doc.fillColor('black')
      
      doc.moveTo(70, y).lineTo(70, y + 20).stroke()
      doc.moveTo(480, y).lineTo(480, y + 20).stroke()
      
      setFont('bold', 9)
      doc.text(toRoman(sectionIndex++), 40, y + 6, { width: 30, align: 'center' })
      doc.text(section.name, 75, y + 6)
      
      let sectionTotal = 0
      section.items.forEach((item: any) => { sectionTotal += item.total })
      doc.text(sectionTotal.toLocaleString('vi-VN'), 480, y + 6, { width: 70, align: 'right' })
      
      y += 20
      doc.y = y

      let itemStt = 1
      section.items.forEach((item: any) => {
        setFont('normal', 8)
        const nameH = doc.heightOfString(item.name, { width: 70 })
        const descText = item.catalogItem?.description || ''
        const descH = doc.heightOfString(descText, { width: 190 })
        const rowH = Math.max(nameH, descH, 15) + 8
        
        if (checkPageBreak(rowH)) { y = doc.y; }

        drawRowBorder(y, rowH)
        
        doc.text((itemStt++).toString(), 40, y + 4, { width: 30, align: 'center' })
        doc.text(item.name, 73, y + 4, { width: 74 })
        doc.text(descText, 153, y + 4, { width: 194 })
        doc.text(item.unit || 'Cái', 350, y + 4, { width: 30, align: 'center' })
        doc.text(item.quantity.toString(), 380, y + 4, { width: 35, align: 'center' })
        doc.text(item.unitPrice.toLocaleString('vi-VN'), 415, y + 4, { width: 63, align: 'right' })
        doc.text(item.total.toLocaleString('vi-VN'), 480, y + 4, { width: 70, align: 'right' })

        y += rowH
        doc.y = y
      })
    })

    // Totals row
    if (checkPageBreak(20)) { y = doc.y; }
    doc.rect(boxX, y, boxW, 20).stroke()
    doc.moveTo(480, y).lineTo(480, y + 20).stroke()
    
    setFont('bold', 9)
    doc.text('Tổng Cộng (VND) đã bao gồm VAT', boxX, y + 6, { width: 430, align: 'right' })
    doc.text(quotation.grandTotal.toLocaleString('vi-VN'), 480, y + 6, { width: 70, align: 'right' })
    
    y += 20
    doc.y = y
  }

  doc.moveDown(2)
  doc.y = y + 20

  // --- DYNAMIC TERMS ---
  setFont('normal', 10)
  
  // The terms string from DB (Điều 2, Điều 3, v.v...)
  if (contract.terms) {
    const lines = contract.terms.split('\n')
    lines.forEach((line: string) => {
      if (line.trim().startsWith('Điều') || line.trim().match(/^[0-9]\./)) {
        setFont('bold', 11)
      } else {
        setFont('normal', 10)
      }
      doc.text(line, { align: 'justify' })
      doc.moveDown(0.2)
    })
  }

  doc.moveDown(2)

  // --- SIGNATURES ---
  checkPageBreak(100)
  const sigY = doc.y
  setFont('bold', 11)
  doc.text('ĐẠI DIỆN BÊN A', 40, sigY, { width: 250, align: 'center' })
  doc.text('ĐẠI DIỆN BÊN B', 300, sigY, { width: 250, align: 'center' })
  
  doc.end()
}
