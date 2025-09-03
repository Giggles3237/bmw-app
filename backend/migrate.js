const ExcelJS = require('exceljs');
const dotenv = require('dotenv');
const pool = require('./db');

// Load environment variables such as the path to the Excel file and
// database connection information.
dotenv.config();

async function clearDatabase() {
  console.log('Clearing existing data...');
  await pool.query('DELETE FROM deals');
  await pool.query('DELETE FROM salespersons');
  await pool.query('DELETE FROM finance_managers');
  console.log('Database cleared.');
}

/**
 * Helper to normalise strings.  If the input is a string, trim
 * whitespace; otherwise return null.  Used to clean up names from
 * Excel.
 */
function cleanString(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (value == null) return null;
  
  // Handle ExcelJS cell objects that might contain rich text or other objects
  if (typeof value === 'object') {
    // If it's a rich text object, extract the text
    if (value.richText) {
      return value.richText.map(rt => rt.text).join('').trim();
    }
    // If it has a text property, use that
    if (value.text) {
      return value.text.trim();
    }
    // If it has a value property, use that
    if (value.value) {
      return String(value.value).trim();
    }
    // If it has a result property (formula result), use that
    if (value.result) {
      return String(value.result).trim();
    }
    // If it has a formula property, use that
    if (value.formula) {
      return String(value.formula).trim();
    }
    // If it's an array, join it
    if (Array.isArray(value)) {
      return value.map(v => String(v)).join('').trim();
    }
    // Log the object structure for debugging
    console.log('Unexpected object in cleanString:', JSON.stringify(value, null, 2));
    // Otherwise, try to convert to string
    return String(value).trim();
  }
  
  return String(value).trim();
}

/**
 * Convert an Excel cell value into a JavaScript Date.  Accepts
 * instances of Date directly as well as strings.  Returns null if
 * the value is falsy or cannot be parsed.
 */
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Convert a value to a number.  Returns null if the input is
 * undefined or cannot be converted.  Strings containing commas or
 * currency symbols are also handled.
 */
function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove common formatting such as commas and dollar signs
    const cleaned = value.replace(/[$,]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }
  return null;
}

/**
 * Determine if a flag field from Excel should be true.  Many of
 * these fields are stored as 'Y', 'N', 'X' or other markers.  Any
 * non‑empty value that is not strictly equal to 'N' (case
 * insensitive) is considered true.
 */
function parseBoolean(value) {
  if (value === null || value === undefined || value === '') return null;
  const s = String(value).trim().toUpperCase();
  if (s === 'N' || s === 'NO' || s === '0') return false;
  return true;
}

/**
 * Fetch or create a salesperson record by name.  Returns the
 * salesperson's id.  If name is falsy, returns null.
 */
async function getSalespersonId(name) {
  const cleaned = cleanString(name);
  if (!cleaned) return null;
  const [rows] = await pool.query('SELECT id FROM salespersons WHERE name = ?', [cleaned]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  const [result] = await pool.query('INSERT INTO salespersons (name) VALUES (?)', [cleaned]);
  return result.insertId;
}

/**
 * Fetch or create a finance manager record by name.  Returns the
 * finance manager's id.  If name is falsy, returns null.
 */
async function getFinanceManagerId(name) {
  const cleaned = cleanString(name);
  if (!cleaned) return null;
  const [rows] = await pool.query('SELECT id FROM finance_managers WHERE name = ?', [cleaned]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  const [result] = await pool.query('INSERT INTO finance_managers (name) VALUES (?)', [cleaned]);
  return result.insertId;
}

async function importData() {
  const excelPath = './data/DataMaster.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  const sheet = workbook.getWorksheet('Sheet1');
  if (!sheet) {
    throw new Error('Could not find Sheet1 in the workbook');
  }
  // Build a map from column header to column index.  ExcelJS uses
  // 1‑based indexes for both rows and columns.
  const headerRow = sheet.getRow(1);
  const headerMap = {};
  headerRow.eachCell((cell, colNumber) => {
    const header = cleanString(cell.value);
    if (header) {
      headerMap[header] = colNumber;
    }
  });
  // Required columns
  const required = ['#', 'Date', 'Salesperson', 'Finance Manager'];
  required.forEach((key) => {
    if (!headerMap[key]) {
      throw new Error(`Missing required column "${key}" in Data Master sheet`);
    }
  });
  let insertedCount = 0;
  const totalRows = sheet.lastRow.number - 1; // Subtract 1 for header row
  console.log(`Starting import of ${totalRows} rows...`);
  
  // Iterate over each row starting from row 2 (skip header).  Stop
  // processing after the last non‑empty row.
  for (let i = 2; i <= sheet.lastRow.number; i++) {
    const row = sheet.getRow(i);
    
    // Skip completely empty rows to prevent "A Cell needs a Row" error
    if (!row || !row.hasValues) {
      continue;
    }
    
    // Check if the required column exists before trying to access it
    if (!headerMap['#'] || !row.getCell(headerMap['#'])) {
      continue;
    }
    
    const externalId = row.getCell(headerMap['#']).value;
    if (!externalId) {
      continue; // skip empty rows
    }
    // Parse each field using helper functions.  Some columns may
    // contain Excel dates which ExcelJS returns as JavaScript Date
    // objects.  Others are plain strings or numbers.
    const dateVal = parseDate(headerMap['Date'] ? row.getCell(headerMap['Date']).value : null);
    const monthVal = toNumber(headerMap['Month'] ? row.getCell(headerMap['Month']).value : null);
    const yearVal = toNumber(headerMap['Year'] ? row.getCell(headerMap['Year']).value : null);
    const bankVal = cleanString(headerMap['Bank'] ? row.getCell(headerMap['Bank']).value : null);
    const fundedVal = parseDate(headerMap['Funded'] ? row.getCell(headerMap['Funded']).value : null);
    const stockNumberCell = headerMap['Stock #'] ? row.getCell(headerMap['Stock #']) : null;
    const nameCell = headerMap['Name'] ? row.getCell(headerMap['Name']) : null;
    const salespersonCell = headerMap['Salesperson'] ? row.getCell(headerMap['Salesperson']) : null;
    
    const stockNumberVal = cleanString(stockNumberCell?.value);
    const nameVal = cleanString(nameCell?.value);
    const salespersonName = cleanString(salespersonCell?.value);
    
    // Debug logging for first few rows
    if (insertedCount < 3) {
      console.log(`Row ${i} - Stock # cell:`, stockNumberCell?.value);
      console.log(`Row ${i} - Name cell:`, nameCell?.value);
      console.log(`Row ${i} - Salesperson cell:`, salespersonCell?.value);
      console.log(`Row ${i} - Stock # cleaned:`, stockNumberVal);
      console.log(`Row ${i} - Name cleaned:`, nameVal);
      console.log(`Row ${i} - Salesperson cleaned:`, salespersonName);
    }
    const splitVal = toNumber(headerMap['Split'] ? row.getCell(headerMap['Split']).value : null);
    const typeVal = cleanString(headerMap['Type'] ? row.getCell(headerMap['Type']).value : null);
    const usedCarSourceVal = cleanString(headerMap['Used Car Source'] ? row.getCell(headerMap['Used Car Source']).value : null);
    const ageVal = toNumber(headerMap['Age'] ? row.getCell(headerMap['Age']).value : null);
    const feGrossVal = toNumber(headerMap['FE Gross'] ? row.getCell(headerMap['FE Gross']).value : null);
    const avpVal = toNumber(headerMap['AVP'] ? row.getCell(headerMap['AVP']).value : null);
    const beGrossVal = toNumber(headerMap['BE Gross'] ? row.getCell(headerMap['BE Gross']).value : null);
    const financeManagerName = cleanString(headerMap['Finance Manager'] ? row.getCell(headerMap['Finance Manager']).value : null);
    const reserveVal = toNumber(headerMap['Reserve'] ? row.getCell(headerMap['Reserve']).value : null);
    const rewardsVal = toNumber(headerMap['Rewards'] ? row.getCell(headerMap['Rewards']).value : null);
    const vscVal = toNumber(headerMap['VSC'] ? row.getCell(headerMap['VSC']).value : null);
    const maintenanceVal = toNumber(headerMap['Maintenance'] ? row.getCell(headerMap['Maintenance']).value : null);
    const gapVal = toNumber(headerMap['GAP'] ? row.getCell(headerMap['GAP']).value : null);
    const cilajetVal = toNumber(headerMap['Cilajet'] ? row.getCell(headerMap['Cilajet']).value : null);
    const diamonVal = toNumber(headerMap['Diamon'] ? row.getCell(headerMap['Diamon']).value : null);
    const keyVal = toNumber(headerMap['Key'] ? row.getCell(headerMap['Key']).value : null);
    const collisionVal = toNumber(headerMap['Collision'] ? row.getCell(headerMap['Collision']).value : null);
    const dentVal = toNumber(headerMap['Dent'] ? row.getCell(headerMap['Dent']).value : null);
    const excessVal = toNumber(headerMap['Excess'] ? row.getCell(headerMap['Excess']).value : null);
    const ppfVal = toNumber(headerMap['PPF'] ? row.getCell(headerMap['PPF']).value : null);
    const wheelVal = toNumber(headerMap['Wheel and Tire'] ? row.getCell(headerMap['Wheel and Tire']).value : null);
    const productCountVal = toNumber(headerMap['ProductCount'] ? row.getCell(headerMap['ProductCount']).value : null);
    const moneyVal = toNumber(headerMap['MONEY'] ? row.getCell(headerMap['MONEY']).value : null);
    const titlingVal = toNumber(headerMap['TITLING'] ? row.getCell(headerMap['TITLING']).value : null);
    const mileageVal = toNumber(headerMap['MILEAGE'] ? row.getCell(headerMap['MILEAGE']).value : null);
    const licenseVal = toNumber(headerMap['LICENSE/INSURANCE'] ? row.getCell(headerMap['LICENSE/INSURANCE']).value : null);
    const feesVal = toNumber(headerMap['FEES'] ? row.getCell(headerMap['FEES']).value : null);
    const cleanVal = parseBoolean(headerMap['Clean'] ? row.getCell(headerMap['Clean']).value : null);
    const payoffFlagVal = parseBoolean(headerMap['Payoff Flag'] ? row.getCell(headerMap['Payoff Flag']).value : null);
    const payoffSentVal = parseDate(headerMap['Payoff Sent'] ? row.getCell(headerMap['Payoff Sent']).value : null);
    const atcFlagVal = parseBoolean(headerMap['ATC Flag'] ? row.getCell(headerMap['ATC Flag']).value : null);
    const registrationSentVal = parseDate(headerMap['Registration Sent'] ? row.getCell(headerMap['Registration Sent']).value : null);
    const notesVal = cleanString(headerMap['Notes'] ? row.getCell(headerMap['Notes']).value : null);
    const split2Val = toNumber(headerMap['Split.1'] ? row.getCell(headerMap['Split.1']).value : null);

    // Resolve salesperson and finance manager IDs
    const salespersonId = await getSalespersonId(salespersonName);
    const financeManagerId = await getFinanceManagerId(financeManagerName);
    // Build insert object
    const dealData = {
      external_id: toNumber(externalId),
      date: dateVal,
      month: monthVal,
      year: yearVal,
      bank: bankVal,
      funded_date: fundedVal,
      stock_number: stockNumberVal,
      name: nameVal,
      salesperson_id: salespersonId,
      split: splitVal,
      type: typeVal,
      used_car_source: usedCarSourceVal,
      age: ageVal,
      fe_gross: feGrossVal,
      avp: avpVal,
      be_gross: beGrossVal,
      finance_manager_id: financeManagerId,
      reserve: reserveVal,
      rewards: rewardsVal,
      vsc: vscVal,
      maintenance: maintenanceVal,
      gap: gapVal,
      cilajet: cilajetVal,
      diamon: diamonVal,
      key_product: keyVal,
      collision_product: collisionVal,
      dent_product: dentVal,
      excess: excessVal,
      ppf: ppfVal,
      wheel_and_tire: wheelVal,
      product_count: productCountVal,
      money: moneyVal,
      titling: titlingVal,
      mileage: mileageVal,
      license_insurance: licenseVal,
      fees: feesVal,
      clean: cleanVal,
      payoff_flag: payoffFlagVal,
      payoff_sent: payoffSentVal,
      atc_flag: atcFlagVal,
      registration_sent: registrationSentVal,
      notes: notesVal,
      split2: split2Val
    };
    // Prepare SQL insert statement
    const columns = Object.keys(dealData).filter((key) => dealData[key] !== undefined);
    const values = columns.map((key) => dealData[key]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO deals (${columns.join(', ')}) VALUES (${placeholders})`;
    await pool.query(sql, values);
    insertedCount++;
    
    // Show progress every 100 records
    if (insertedCount % 100 === 0) {
      console.log(`Processed ${insertedCount} records...`);
    }
  }
  console.log(`Import completed! Imported ${insertedCount} deal records.`);
}

async function main() {
  try {
    console.log('Starting BMW data migration...');
    await clearDatabase();
    console.log('Starting data import...');
    await importData();
    console.log('Data import completed successfully');
  } catch (err) {
    console.error('Data import failed:', err);
  } finally {
    console.log('Closing database connection...');
    pool.end();
  }
}

main();