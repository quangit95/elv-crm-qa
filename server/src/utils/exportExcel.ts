import ExcelJS from 'exceljs'
import { Response } from 'express'

const toRoman = (num: number): string => {
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
  return roman[num] || num.toString();
}

export async function generateQuotationExcel(quotation: any, company: any, res: Response) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Báo Giá')

  // Header - Company Info
  sheet.getCell('A1').value = company?.name || 'QA Tech'
  sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0000FF' } }
  
  sheet.getCell('A2').value = 'DỊCH VỤ CNTT – ĐIỆN NHẸ – NHÀ THÔNG MINH'
  sheet.getCell('A2').font = { name: 'Arial', size: 11, bold: true }
  
  sheet.getCell('A3').value = `Địa chỉ: ${company?.address || 'Cầu Bè, đường Lạc Hoà 1, xã Diên Lạc, Tỉnh Khánh Hoà'}`
  sheet.getCell('A4').value = `SĐT: ${company?.phone || '0935793070'}`
  
  if (company?.taxCode) {
    sheet.getCell('A5').value = `MST: ${company.taxCode}`
  } else {
    sheet.getCell('A5').value = 'Email: tech.quanganh@gmail.com'
  }

  // Title
  sheet.mergeCells('A7:G7')
  const titleRow = sheet.getCell('A7')
  titleRow.value = 'BẢNG BÁO GIÁ'
  titleRow.font = { name: 'Arial', size: 16, bold: true }
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

  // Metadata Table
  sheet.mergeCells('A8:G8')
  sheet.getCell('A8').value = 'Location: Nha Trang'
  sheet.getCell('A8').alignment = { horizontal: 'center' }
  sheet.getCell('A8').border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  sheet.getCell('A8').font = { bold: true }

  const formatMetaCell = (cell: ExcelJS.Cell) => {
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    cell.font = { bold: true }
  }
  const formatMetaValueCell = (cell: ExcelJS.Cell) => {
    cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
  }

  // Row 9
  sheet.mergeCells('A9:D9')
  sheet.getCell('A9').value = 'Company:'
  formatMetaCell(sheet.getCell('A9'))
  sheet.getCell('B9').value = quotation.lead.customer.name
  
  sheet.getCell('E9').value = 'Date:'
  formatMetaCell(sheet.getCell('E9'))
  sheet.mergeCells('F9:G9')
  sheet.getCell('F9').value = new Date(quotation.createdAt).toLocaleDateString('vi-VN')
  formatMetaValueCell(sheet.getCell('F9'))

  // Row 10
  sheet.mergeCells('A10:D10')
  sheet.getCell('A10').value = 'Attn:'
  formatMetaCell(sheet.getCell('A10'))
  
  sheet.getCell('E10').value = 'From:'
  formatMetaCell(sheet.getCell('E10'))
  sheet.mergeCells('F10:G10')
  sheet.getCell('F10').value = company?.name || 'QA Tech'
  formatMetaValueCell(sheet.getCell('F10'))

  // Row 11
  sheet.mergeCells('A11:D11')
  sheet.getCell('A11').value = 'Tel:'
  formatMetaCell(sheet.getCell('A11'))
  sheet.getCell('B11').value = quotation.lead.customer.phone || ''
  
  sheet.getCell('E11').value = 'Tel:'
  formatMetaCell(sheet.getCell('E11'))
  sheet.mergeCells('F11:G11')
  sheet.getCell('F11').value = company?.phone || '0935 793 070'
  formatMetaValueCell(sheet.getCell('F11'))

  // Row 12
  sheet.mergeCells('A12:D12')
  sheet.getCell('A12').value = 'Email:'
  formatMetaCell(sheet.getCell('A12'))
  sheet.getCell('B12').value = quotation.lead.customer.email || ''
  
  sheet.getCell('E12').value = company?.taxCode ? 'MST:' : 'Email:'
  formatMetaCell(sheet.getCell('E12'))
  sheet.mergeCells('F12:G12')
  sheet.getCell('F12').value = company?.taxCode || 'tech.quanganh@gmail.com'
  formatMetaValueCell(sheet.getCell('F12'))

  // Thank you message
  sheet.mergeCells('A14:G14')
  sheet.getCell('A14').value = 'Thank you very much for your interest in our business. Now I am please to serve you the price for your requirement'
  sheet.getCell('A14').font = { bold: true }
  sheet.getCell('A14').alignment = { horizontal: 'center' }

  // Table Headers
  const headerRow = sheet.getRow(16)
  headerRow.values = ['Stt', 'Thiết bị', 'Mô tả', 'Đơn vị', 'S.lượng', 'Đơn giá VNĐ', 'Thành tiền VND']
  headerRow.font = { bold: true }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8DB4E2' } }
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  })

  // Columns width
  sheet.getColumn(1).width = 5
  sheet.getColumn(2).width = 25
  sheet.getColumn(3).width = 50
  sheet.getColumn(4).width = 8
  sheet.getColumn(5).width = 8
  sheet.getColumn(6).width = 15
  sheet.getColumn(7).width = 15

  // Enable text wrapping for 'Mô tả' and 'Thiết bị'
  sheet.getColumn(2).alignment = { wrapText: true, vertical: 'top' }
  sheet.getColumn(3).alignment = { wrapText: true, vertical: 'top' }

  let rowIndex = 17
  let sectionIndex = 1

  const formatCellBorder = (cell: ExcelJS.Cell) => {
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  }

  quotation.sections.forEach((section: any) => {
    // Section Header
    const secRow = sheet.getRow(rowIndex)
    secRow.getCell(1).value = toRoman(sectionIndex++)
    secRow.getCell(1).font = { bold: true }
    secRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    
    sheet.mergeCells(`B${rowIndex}:F${rowIndex}`)
    secRow.getCell(2).value = section.name
    secRow.getCell(2).font = { bold: true }
    secRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
    
    let sectionTotal = 0
    section.items.forEach((item: any) => { sectionTotal += item.total })
    
    secRow.getCell(7).value = sectionTotal
    secRow.getCell(7).font = { bold: true }
    secRow.getCell(7).numFmt = '#,##0'
    secRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' }
    
    secRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
      formatCellBorder(cell)
    })
    
    rowIndex++

    let itemStt = 1
    section.items.forEach((item: any) => {
      const row = sheet.getRow(rowIndex)
      row.getCell(1).value = itemStt++
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'top' }
      row.getCell(2).value = item.name
      row.getCell(3).value = item.catalogItem?.description || ''
      row.getCell(4).value = item.unit || 'Cái'
      row.getCell(4).alignment = { horizontal: 'center', vertical: 'top' }
      row.getCell(5).value = item.quantity
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'top' }
      row.getCell(6).value = item.unitPrice
      row.getCell(6).numFmt = '#,##0'
      row.getCell(6).alignment = { horizontal: 'right', vertical: 'top' }
      row.getCell(7).value = item.total
      row.getCell(7).numFmt = '#,##0'
      row.getCell(7).alignment = { horizontal: 'right', vertical: 'top' }

      for(let i=1; i<=7; i++) {
        formatCellBorder(row.getCell(i))
      }
      rowIndex++
    })
  })

  // Totals
  const formatTotalRow = (row: ExcelJS.Row, title: string, value: number, isBold: boolean = false) => {
    sheet.mergeCells(`A${rowIndex}:F${rowIndex}`)
    row.getCell(1).value = title
    row.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' }
    row.getCell(7).value = value
    row.getCell(7).numFmt = '#,##0'
    if (isBold) {
      row.font = { bold: true }
    }
    for(let i=1; i<=7; i++) {
      if (i === 1 || i === 7 || i === 6) { // To keep borders right for merged cells we just border all
         formatCellBorder(row.getCell(i))
      } else {
         row.getCell(i).border = { top: { style: 'thin' }, bottom: { style: 'thin' } }
      }
    }
  }

  const subTotalRow = sheet.getRow(rowIndex)
  formatTotalRow(subTotalRow, 'Tổng chưa bao gồm VAT (VND)', quotation.totalAmount - quotation.discount, true)
  rowIndex++

  const taxVal = (quotation.totalAmount - quotation.discount) * (quotation.tax / 100)
  const taxRow = sheet.getRow(rowIndex)
  formatTotalRow(taxRow, `VAT ${quotation.tax}%`, taxVal, true)
  rowIndex++

  const grandTotalRow = sheet.getRow(rowIndex)
  formatTotalRow(grandTotalRow, 'Tổng Cộng (VND)', quotation.grandTotal, true)
  rowIndex++

  // Terms and conditions
  rowIndex += 2
  sheet.getCell(`A${rowIndex}`).value = 'ĐIỀU KHOẢN VÀ ĐIỀU KIỆN:'
  sheet.getCell(`A${rowIndex}`).font = { bold: true, underline: true }
  rowIndex++
  sheet.getCell(`A${rowIndex}`).value = '- Bảo hành: 1 năm kể từ ngày giao hàng'
  rowIndex++
  sheet.getCell(`A${rowIndex}`).value = '- Giá đã bao gồm: phí vận chuyển, và hỗ trợ tại chỗ'
  rowIndex++
  sheet.getCell(`A${rowIndex}`).value = `- Chưa bao gồm ${quotation.tax}% VAT`
  rowIndex++
  sheet.getCell(`A${rowIndex}`).value = '- Báo giá này có giá trị trong vòng 30 ngày'

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename=Quotation-${quotation.code}.xlsx`)

  await workbook.xlsx.write(res)
  res.end()
}
