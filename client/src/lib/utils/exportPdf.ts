import PDFDocument from 'pdfkit'
import { NextResponse } from 'next/server'

const toRoman = (num: number): string => {
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
  return roman[num] || num.toString();
}

export async function generateQuotationPDF(quotation: any, company: any): Promise<NextResponse> {
  return new Promise((resolve) => {
    // A4 size: 595.28 x 841.89
    const doc = new PDFDocument({ margin: 30, size: 'A4' })
    const buffers: Buffer[] = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      resolve(new NextResponse(pdfData, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename=Quotation-${quotation.code}.pdf`
        }
      }))
    })

    const setFont = (type: 'bold' | 'normal', size: number) => {
      doc.font(type === 'bold' ? 'Helvetica-Bold' : 'Helvetica').fontSize(size)
    }

    // HEADER
    setFont('bold', 14)
    doc.fillColor('#00b050').text(company?.name || 'QA Tech', 30, 30)
    setFont('bold', 10)
    doc.fillColor('black').text('DỊCH VỤ CNTT – ĐIỆN NHẸ – NHÀ THÔNG MINH', 30, 48)
    setFont('normal', 9)
    doc.text(`Địa chỉ: ${company?.address || 'Cầu Bè, đường Lạc Hoà 1, xã Diên Lạc, Tỉnh Khánh Hoà'}`, 30, 60)
    doc.text(`SĐT: ${company?.phone || '0935793070'}`, 30, 72)
    
    if (company?.taxCode) {
      doc.text(`MST: ${company.taxCode}`, 30, 84)
    } else {
      doc.text('Email: tech.quanganh@gmail.com', 30, 84)
    }

    // TITLE
    setFont('bold', 16)
    doc.text('BẢNG BÁO GIÁ', 0, 110, { align: 'center' })

    // INFO BOX
    let y = 135
    const boxX = 30
    const boxW = 535
    const col1 = boxX
    const col2 = boxX + 100
    const col3 = boxX + 350
    const col4 = boxX + 420
    
    doc.rect(boxX, y, boxW, 15).stroke()
    setFont('bold', 9)
    doc.text('Location: Nha Trang', 0, y + 4, { align: 'center' })
    y += 15

    const drawInfoRow = (l1: string, v1: string, l2: string, v2: string) => {
      doc.rect(boxX, y, boxW, 15).stroke()
      doc.moveTo(col2, y).lineTo(col2, y + 15).stroke()
      doc.moveTo(col3, y).lineTo(col3, y + 15).stroke()
      doc.moveTo(col4, y).lineTo(col4, y + 15).stroke()
      
      setFont('bold', 9)
      doc.text(l1, col1 + 5, y + 4)
      setFont('normal', 9)
      doc.text(v1, col2 + 5, y + 4)
      
      setFont('bold', 9)
      doc.text(l2, col3 + 5, y + 4)
      setFont('normal', 9)
      doc.text(v2, col4 + 5, y + 4)
      y += 15
    }

    drawInfoRow('Company:', quotation.lead.customer.name, 'Date:', new Date(quotation.createdAt).toLocaleDateString('vi-VN'))
    drawInfoRow('Attn:', '', 'From:', company?.name || 'QA Tech')
    drawInfoRow('Tel:', quotation.lead.customer.phone || '', 'Tel:', company?.phone || '0935 793 070')
    drawInfoRow('Email:', quotation.lead.customer.email || '', 'Email:', company?.taxCode ? `MST: ${company.taxCode}` : 'tech.quanganh@gmail.com')

    y += 10
    setFont('bold', 9)
    doc.text('Thank you very much for your interest in our business. Now I am please to serve you the price for your requirement', 0, y, { align: 'center' })
    
    y += 20

    // TABLE HEADER
    const drawRowBorder = (rowY: number, rowH: number) => {
      doc.rect(boxX, rowY, boxW, rowH).stroke()
      doc.moveTo(45, rowY).lineTo(45, rowY + rowH).stroke()    // Stt
      doc.moveTo(150, rowY).lineTo(150, rowY + rowH).stroke()  // Thiết bị
      doc.moveTo(350, rowY).lineTo(350, rowY + rowH).stroke()  // Mô tả
      doc.moveTo(380, rowY).lineTo(380, rowY + rowH).stroke()  // Đơn vị
      doc.moveTo(415, rowY).lineTo(415, rowY + rowH).stroke()  // S.lượng
      doc.moveTo(485, rowY).lineTo(485, rowY + rowH).stroke()  // Đơn giá
    }

    // draw header bg
    doc.rect(boxX, y, boxW, 20).fill('#8DB4E2').stroke()
    doc.fillColor('black')
    drawRowBorder(y, 20)

    setFont('bold', 9)
    doc.text('Stt', 30, y + 6, { width: 15, align: 'center' })
    doc.text('Thiết bị', 45, y + 6, { width: 105, align: 'center' })
    doc.text('Mô tả', 150, y + 6, { width: 200, align: 'center' })
    doc.text('Đơn vị', 350, y + 6, { width: 30, align: 'center' })
    doc.text('S.lượng', 380, y + 6, { width: 35, align: 'center' })
    doc.text('Đơn giá VNĐ', 415, y + 6, { width: 70, align: 'center' })
    doc.text('Thành tiền VND', 485, y + 6, { width: 80, align: 'center' })
    y += 20

    const checkPageBreak = (neededH: number) => {
      if (y + neededH > 800) {
        doc.addPage()
        y = 30
        // Redraw Header
        doc.rect(boxX, y, boxW, 20).fill('#8DB4E2').stroke()
        doc.fillColor('black')
        drawRowBorder(y, 20)
        setFont('bold', 9)
        doc.text('Stt', 30, y + 6, { width: 15, align: 'center' })
        doc.text('Thiết bị', 45, y + 6, { width: 105, align: 'center' })
        doc.text('Mô tả', 150, y + 6, { width: 200, align: 'center' })
        doc.text('Đơn vị', 350, y + 6, { width: 30, align: 'center' })
        doc.text('S.lượng', 380, y + 6, { width: 35, align: 'center' })
        doc.text('Đơn giá VNĐ', 415, y + 6, { width: 70, align: 'center' })
        doc.text('Thành tiền VND', 485, y + 6, { width: 80, align: 'center' })
        y += 20
      }
    }

    let sectionIndex = 1

    quotation.sections.forEach((section: any) => {
      checkPageBreak(20)
      
      // Section Header
      doc.rect(boxX, y, boxW, 20).fill('#D9E1F2').stroke()
      doc.fillColor('black')
      
      // Section border only outer and the last total col
      doc.moveTo(45, y).lineTo(45, y + 20).stroke()
      doc.moveTo(485, y).lineTo(485, y + 20).stroke()
      
      setFont('bold', 9)
      doc.text(toRoman(sectionIndex++), 30, y + 6, { width: 15, align: 'center' })
      doc.text(section.name, 50, y + 6)
      
      let sectionTotal = 0
      section.items.forEach((item: any) => { sectionTotal += item.total })
      
      doc.text(sectionTotal.toLocaleString('vi-VN'), 485, y + 6, { width: 75, align: 'right' })
      
      y += 20

      let itemStt = 1
      section.items.forEach((item: any) => {
        setFont('normal', 8)
        
        const nameH = doc.heightOfString(item.name, { width: 100 })
        const descText = item.catalogItem?.description || ''
        const descH = doc.heightOfString(descText, { width: 195 })
        const rowH = Math.max(nameH, descH, 15) + 8 // Padding
        
        checkPageBreak(rowH)

        drawRowBorder(y, rowH)
        
        doc.text((itemStt++).toString(), 30, y + 4, { width: 15, align: 'center' })
        doc.text(item.name, 48, y + 4, { width: 100 })
        doc.text(descText, 153, y + 4, { width: 195 })
        
        doc.text(item.unit || 'Cái', 350, y + 4, { width: 30, align: 'center' })
        doc.text(item.quantity.toString(), 380, y + 4, { width: 35, align: 'center' })
        doc.text(item.unitPrice.toLocaleString('vi-VN'), 415, y + 4, { width: 68, align: 'right' })
        doc.text(item.total.toLocaleString('vi-VN'), 485, y + 4, { width: 75, align: 'right' })

        y += rowH
      })
    })

    // Totals
    const drawTotalRow = (label: string, value: string, bold: boolean) => {
      checkPageBreak(20)
      doc.rect(boxX, y, boxW, 20).stroke()
      doc.moveTo(485, y).lineTo(485, y + 20).stroke()
      
      setFont(bold ? 'bold' : 'normal', 9)
      doc.text(label, boxX, y + 6, { width: 450, align: 'right' })
      doc.text(value, 485, y + 6, { width: 75, align: 'right' })
      y += 20
    }

    drawTotalRow('Tổng chưa bao gồm VAT (VND)', (quotation.totalAmount - quotation.discount).toLocaleString('vi-VN'), true)
    const taxVal = (quotation.totalAmount - quotation.discount) * (quotation.tax / 100)
    drawTotalRow(`VAT ${quotation.tax}%`, taxVal.toLocaleString('vi-VN'), true)
    drawTotalRow('Tổng Cộng (VND)', quotation.grandTotal.toLocaleString('vi-VN'), true)

    y += 20
    checkPageBreak(100)
    
    setFont('bold', 9)
    doc.text('ĐIỀU KHOẢN VÀ ĐIỀU KIỆN:', boxX, y, { underline: true })
    y += 15
    setFont('normal', 9)
    doc.text('- Bảo hành: 1 năm kể từ ngày giao hàng', boxX, y)
    y += 15
    doc.text('- Giá đã bao gồm: phí vận chuyển, và hỗ trợ tại chỗ', boxX, y)
    y += 15
    doc.text(`- Chưa bao gồm ${quotation.tax}% VAT`, boxX, y)
    y += 15
    doc.text('- Báo giá này có giá trị trong vòng 30 ngày', boxX, y)

    doc.end()
  })
}
