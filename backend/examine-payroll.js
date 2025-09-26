const ExcelJS = require('exceljs');

async function examinePayrollSheets() {
  try {
    const excelPath = './data/Einstein3.0.xlsx';
    const workbook = new ExcelJS.Workbook();
    
    console.log('Loading Excel file:', excelPath);
    await workbook.xlsx.readFile(excelPath);
    
    // Examine SalesPerson worksheet (index 5)
    const salespersonSheet = workbook.getWorksheet('SalesPerson');
    console.log('\n=== SALESPERSON WORKSHEET DETAILED ANALYSIS ===');
    
    if (salespersonSheet) {
      console.log('Rows:', salespersonSheet.rowCount);
      console.log('Columns:', salespersonSheet.columnCount);
      
      // Show all rows with data
      console.log('\nAll rows with data:');
      for (let i = 1; i <= salespersonSheet.rowCount; i++) {
        const row = salespersonSheet.getRow(i);
        const values = [];
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          values.push(cell.value);
        });
        if (values.length > 0) {
          console.log(`Row ${i}:`, values);
        }
      }
    }
    
    // Examine Notes worksheet (index 6) - this seems to contain pay plan info
    const notesSheet = workbook.getWorksheet('Notes');
    console.log('\n=== NOTES WORKSHEET (PAY PLANS) DETAILED ANALYSIS ===');
    
    if (notesSheet) {
      console.log('Rows:', notesSheet.rowCount);
      console.log('Columns:', notesSheet.columnCount);
      
      // Show all rows with data
      console.log('\nAll rows with data:');
      for (let i = 1; i <= notesSheet.rowCount; i++) {
        const row = notesSheet.getRow(i);
        const values = [];
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          values.push(cell.value);
        });
        if (values.length > 0) {
          console.log(`Row ${i}:`, values);
        }
      }
    }
    
  } catch (error) {
    console.error('Error examining Excel file:', error.message);
  }
}

examinePayrollSheets();
