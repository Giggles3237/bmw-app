const ExcelJS = require('exceljs');
const path = require('path');

async function examineExcelFile() {
  try {
    const excelPath = './data/Einstein3.0.xlsx';
    const workbook = new ExcelJS.Workbook();
    
    console.log('Loading Excel file:', excelPath);
    await workbook.xlsx.readFile(excelPath);
    
    console.log('\n=== WORKBOOK INFO ===');
    console.log('Number of worksheets:', workbook.worksheets.length);
    
    workbook.worksheets.forEach((worksheet, index) => {
      console.log(`\n=== WORKSHEET ${index + 1}: "${worksheet.name}" ===`);
      console.log('Rows:', worksheet.rowCount);
      console.log('Columns:', worksheet.columnCount);
      
      // Show first few rows
      console.log('\nFirst 5 rows:');
      for (let i = 1; i <= Math.min(5, worksheet.rowCount); i++) {
        const row = worksheet.getRow(i);
        const values = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          values.push(cell.value || '');
        });
        console.log(`Row ${i}:`, values.slice(0, 10)); // Show first 10 columns
      }
      
      // Show column headers (first row)
      if (worksheet.rowCount > 0) {
        console.log('\nColumn headers:');
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          console.log(`  Column ${colNumber}: "${cell.value}"`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error examining Excel file:', error.message);
  }
}

examineExcelFile();
