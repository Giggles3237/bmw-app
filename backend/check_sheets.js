const ExcelJS = require('exceljs');

async function checkSheets() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./data/DataMaster.xlsx');
    
    console.log('Available sheets:');
    workbook.eachSheet((sheet, id) => {
      console.log(`- ${sheet.name} (ID: ${id})`);
    });
  } catch (err) {
    console.error('Error reading Excel file:', err);
  }
}

checkSheets();
