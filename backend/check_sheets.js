const ExcelJS = require('exceljs');
const path = require('path');

async function checkExcelFile() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, 'data', 'DataMaster.xlsx');
  
  try {
    await workbook.xlsx.readFile(filePath);
    console.log('📊 DataMaster.xlsx Analysis\n');
    
    // Check all worksheets
    workbook.worksheets.forEach((worksheet, index) => {
      console.log(`📋 Worksheet ${index + 1}: "${worksheet.name}"`);
      console.log(`   Rows: ${worksheet.rowCount}`);
      console.log(`   Columns: ${worksheet.columnCount}`);
      
      // Get headers from first row
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        if (cell.value) {
          headers.push({
            column: colNumber,
            name: cell.value.toString().trim(),
            address: cell.address
          });
        }
      });
      
      console.log(`   Headers (${headers.length}):`);
      headers.forEach(header => {
        console.log(`     ${header.column}: ${header.name} (${header.address})`);
      });
      
      // Check first few data rows for date formats
      console.log('\n   📅 Date Analysis (first 5 rows):');
      const dateColumns = headers.filter(h => 
        h.name.toLowerCase().includes('date') || 
        h.name.toLowerCase().includes('funded')
      );
      
      dateColumns.forEach(dateCol => {
        console.log(`     ${dateCol.name}:`);
        for (let rowNum = 2; rowNum <= Math.min(6, worksheet.rowCount); rowNum++) {
          const cell = worksheet.getCell(rowNum, dateCol.column);
          const value = cell.value;
          const cellType = cell.type;
          
          if (value !== null && value !== undefined) {
            console.log(`       Row ${rowNum}: Type=${cellType}, Value="${value}" (${typeof value})`);
            
            // Try to parse as date
            if (value instanceof Date) {
              console.log(`         → Parsed as Date: ${value.toISOString()}`);
            } else if (typeof value === 'number') {
              // Excel serial number
              const excelEpoch = new Date(1900, 0, 1);
              const daysSinceEpoch = value - 1;
              const milliseconds = daysSinceEpoch * 24 * 60 * 60 * 1000;
              const date = new Date(excelEpoch.getTime() + milliseconds);
              console.log(`         → Excel serial ${value} → ${date.toISOString()}`);
            } else if (typeof value === 'string') {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                console.log(`         → String parsed: ${date.toISOString()}`);
              } else {
                console.log(`         → String not parseable as date`);
              }
            }
          } else {
            console.log(`       Row ${rowNum}: NULL/undefined`);
          }
        }
      });
      
      // Check for other important columns
      const importantCols = headers.filter(h => 
        h.name.toLowerCase().includes('stock') ||
        h.name.toLowerCase().includes('name') ||
        h.name.toLowerCase().includes('salesperson') ||
        h.name.toLowerCase().includes('gross') ||
        h.name.toLowerCase().includes('type')
      );
      
      if (importantCols.length > 0) {
        console.log('\n   🔍 Important Columns Sample Data:');
        importantCols.forEach(col => {
          console.log(`     ${col.name}:`);
          for (let rowNum = 2; rowNum <= Math.min(4, worksheet.rowCount); rowNum++) {
            const cell = worksheet.getCell(rowNum, col.column);
            const value = cell.value;
            if (value !== null && value !== undefined) {
              console.log(`       Row ${rowNum}: "${value}"`);
            }
          }
        });
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    });
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
  }
}

checkExcelFile();
