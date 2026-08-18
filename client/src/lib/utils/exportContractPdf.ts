import PDFDocument from 'pdfkit'
import { NextResponse } from 'next/server'
import path from 'path'

const toRoman = (num: number): string => {
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
  return roman[num] || num.toString();
}

export async function generateContractPDF(contract: any, company: any): Promise<NextResponse> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 57, margins: { top: 57, bottom: 57, left: 85, right: 57 }, size: 'A4' })
    const buffers: Buffer[] = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers)
      resolve(new NextResponse(pdfData as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename=Contract-${contract.code}.pdf`
        }
      }))
    })

    const fontRegular = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf')
    const fontBold = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf')
    
    doc.registerFont('Roboto', fontRegular)
    doc.registerFont('Roboto-Bold', fontBold)

    // Use default Helvetica instead of Windows Arial to ensure Vercel compatibility
    const setFont = (type: 'bold' | 'normal', size: number) => {
      doc.font(type === 'bold' ? 'Roboto-Bold' : 'Roboto').fontSize(size)
    }

    const checkPageBreak = (neededH: number, currentY: number = doc.y) => {
      if (currentY + neededH > 750) {
        doc.addPage()
        return true
      }
      return false
    }

    // --- HEADER ---
    setFont('bold', 10)
    doc.text(company?.name || 'CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VIỄN ĐÔNG', 85, 57)
    setFont('normal', 9)
    doc.text(company?.address || 'Lô 17 đường 18A, KĐT Lê Hồng Phong 2, P Nam Nha Trang, Tỉnh Khánh Hòa', 85, 72)

    setFont('bold', 10)
    doc.text('CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', 85, 57, { width: 453, align: 'right' })
    setFont('bold', 9)
    doc.text('Độc lập – Tự do – Hạnh phúc', 85, 72, { width: 453, align: 'right', underline: true })

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
    const boxX = 85
    const boxW = 453
    
    const drawRowBorder = (rowY: number, rowH: number) => {
      doc.rect(boxX, rowY, boxW, rowH).stroke()
      doc.moveTo(boxX + 25, rowY).lineTo(boxX + 25, rowY + rowH).stroke()    // Stt
      doc.moveTo(boxX + 90, rowY).lineTo(boxX + 90, rowY + rowH).stroke()  // Thiết bị
      doc.moveTo(boxX + 230, rowY).lineTo(boxX + 230, rowY + rowH).stroke()  // Mô tả
      doc.moveTo(boxX + 260, rowY).lineTo(boxX + 260, rowY + rowH).stroke()  // Đơn vị
      doc.moveTo(boxX + 290, rowY).lineTo(boxX + 290, rowY + rowH).stroke()  // S.lượng
      doc.moveTo(boxX + 370, rowY).lineTo(boxX + 370, rowY + rowH).stroke()  // Đơn giá
    }

    // Table Header
    checkPageBreak(25, y)
    if (doc.y !== y && doc.y === 57) { y = doc.y } // Sync if page broke
    doc.rect(boxX, y, boxW, 25).fill('#E2EFDA').stroke()
    doc.fillColor('black')
    drawRowBorder(y, 25)

    setFont('bold', 9)
    doc.text('Stt', boxX, y + 8, { width: 25, align: 'center' })
    doc.text('Thiết bị', boxX + 25, y + 8, { width: 65, align: 'center' })
    doc.text('Mô tả', boxX + 90, y + 8, { width: 140, align: 'center' })
    doc.text('ĐVT', boxX + 230, y + 8, { width: 30, align: 'center' })
    doc.text('SL', boxX + 260, y + 8, { width: 30, align: 'center' })
    doc.text('Đơn giá', boxX + 290, y + 8, { width: 80, align: 'center' })
    doc.text('Thành tiền', boxX + 370, y + 8, { width: 83, align: 'center' })
    
    y += 25
    doc.y = y

    // Loop through quotation sections & items
    const quotation = contract.quotation;
    if (quotation && quotation.sections) {
      let sectionIndex = 1
      
      quotation.sections.forEach((section: any) => {
        if(checkPageBreak(20, y)) { y = doc.y; drawRowBorder(y, 20); }
        
        // Section Header
        doc.rect(boxX, y, boxW, 20).fill('#F2F2F2').stroke()
        doc.fillColor('black')
        
        doc.moveTo(boxX + 25, y).lineTo(boxX + 25, y + 20).stroke()
        doc.moveTo(boxX + 370, y).lineTo(boxX + 370, y + 20).stroke()
        
        setFont('bold', 9)
        doc.text(toRoman(sectionIndex++), boxX, y + 6, { width: 25, align: 'center' })
        doc.text(section.name, boxX + 30, y + 6)
        
        let sectionTotal = 0
        section.items.forEach((item: any) => { sectionTotal += item.total })
        doc.text(sectionTotal.toLocaleString('vi-VN'), boxX + 370, y + 6, { width: 80, align: 'right' })
        
        y += 20
        doc.y = y

        let itemStt = 1
        section.items.forEach((item: any) => {
          setFont('normal', 8)
          const nameH = doc.heightOfString(item.name, { width: 65 })
          const descText = item.catalogItem?.description || ''
          const descH = doc.heightOfString(descText, { width: 140 })
          const rowH = Math.max(nameH, descH, 15) + 8
          
          if (checkPageBreak(rowH, y)) { y = doc.y; }

          drawRowBorder(y, rowH)
          
          doc.text((itemStt++).toString(), boxX, y + 4, { width: 25, align: 'center' })
          doc.text(item.name, boxX + 28, y + 4, { width: 59 })
          doc.text(descText, boxX + 93, y + 4, { width: 134 })
          doc.text(item.unit || 'Cái', boxX + 230, y + 4, { width: 30, align: 'center' })
          doc.text(item.quantity.toString(), boxX + 260, y + 4, { width: 30, align: 'center' })
          doc.text(item.unitPrice.toLocaleString('vi-VN'), boxX + 290, y + 4, { width: 77, align: 'right' })
          doc.text(item.total.toLocaleString('vi-VN'), boxX + 370, y + 4, { width: 80, align: 'right' })

          y += rowH
          doc.y = y
        })
      })

      // Totals row
      if (checkPageBreak(20, y)) { y = doc.y; }
      doc.rect(boxX, y, boxW, 20).stroke()
      doc.moveTo(boxX + 370, y).lineTo(boxX + 370, y + 20).stroke()
      
      setFont('bold', 9)
      doc.text(`Tổng Cộng (VND)${quotation.tax > 0 ? ' đã bao gồm VAT' : ''}`, boxX, y + 6, { width: 360, align: 'right' })
      doc.text(quotation.grandTotal.toLocaleString('vi-VN'), boxX + 370, y + 6, { width: 80, align: 'right' })
      
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
        
        checkPageBreak(15)
        doc.text(line, boxX, doc.y, { width: boxW, align: 'justify' })
        doc.moveDown(0.2)
      })
    }

    doc.moveDown(2)

    // --- SIGNATURES ---
    checkPageBreak(100, doc.y)
    const sigY = doc.y
    setFont('bold', 11)
    doc.text('ĐẠI DIỆN BÊN A', boxX, sigY, { width: 226, align: 'center' })
    doc.text('ĐẠI DIỆN BÊN B', boxX + 226, sigY, { width: 226, align: 'center' })
    
    doc.end()
  })
}
