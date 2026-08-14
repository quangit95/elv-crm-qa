const ExcelJS = require('exceljs');

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('d:/WEB/elv-crm/Bao gia hệ thống Wifi -ECOPARK NHÂN TÂM - Copy.xlsx');
  
  const sheet = workbook.worksheets[0];
  console.log(`Sheet name: ${sheet.name}`);
  
  for (let i = 1; i <= 30; i++) {
    const row = sheet.getRow(i);
    const rowValues = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      rowValues.push(`[${colNumber}] ${cell.value}`);
    });
    console.log(`Row ${i}: ${rowValues.join(' | ')}`);
  }
}

main().catch(console.error);
