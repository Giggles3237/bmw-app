import React from 'react';
import './PayrollModal.css';

/**
 * PayrollModal component displays an individual payroll sheet
 * in a modal format that matches the exact PDF layout
 */
function PayrollModal({ isOpen, onClose, payrollData, month, year }) {
  if (!isOpen || !payrollData) return null;

  // Debug logging
  console.log('PayrollModal received data:', payrollData);
  console.log('Deal details:', payrollData?.deal_details);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const printPayroll = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the modal content
    const modalContent = document.querySelector('.payroll-modal-content');
    
    // Create print-optimized HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>BMW of Pittsburgh Payroll Sheet - ${payrollData.salesperson}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background: white;
            }
            
            .pdf-container {
              max-width: 8.5in;
              margin: 0 auto;
              padding: 0.5in;
              background: white;
            }
            
            .header-section {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #003366;
              padding-bottom: 15px;
            }
            
            .company-info {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            
            .company-logo {
              width: 50px;
              height: 50px;
              background: #003366;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
            }
            
            .company-details h1 {
              font-size: 24px;
              color: #003366;
              margin: 0;
            }
            
            .company-details h2 {
              font-size: 14px;
              color: #666;
              margin: 0;
              font-weight: normal;
            }
            
            .employee-info {
              text-align: right;
              font-size: 12px;
            }
            
            .employee-info div {
              margin-bottom: 3px;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #003366;
              margin: 20px 0 10px 0;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            
            .unit-breakdown {
              margin-bottom: 20px;
            }
            
            .unit-summary {
              display: inline-block;
              background: #f5f5f5;
              padding: 10px 15px;
              border-radius: 5px;
              font-weight: bold;
            }
            
            .pdf-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 11px;
            }
            
            .pdf-table th {
              background: #003366;
              color: white;
              padding: 8px 6px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #003366;
            }
            
            .pdf-table td {
              padding: 6px;
              border: 1px solid #ccc;
              vertical-align: top;
            }
            
            .pdf-table tr:nth-child(even) {
              background: #f9f9f9;
            }
            
            .number-cell {
              text-align: center;
              font-family: monospace;
            }
            
            .commission-section {
              margin: 20px 0;
            }
            
            .commission-breakdown {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              border: 1px solid #dee2e6;
            }
            
            .commission-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            
            .commission-item.total {
              border-top: 2px solid #003366;
              margin-top: 10px;
              padding-top: 10px;
              font-weight: bold;
              font-size: 14px;
            }
            
            .commission-label {
              font-weight: 500;
            }
            
            .commission-value {
              font-weight: bold;
              color: #003366;
            }
            
            .bonuses-section {
              margin: 20px 0;
            }
            
            .bonus-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-top: 15px;
            }
            
            .bonus-item {
              background: #f8f9fa;
              padding: 12px;
              border-radius: 5px;
              border: 1px solid #dee2e6;
              text-align: center;
            }
            
            .bonus-label {
              font-size: 11px;
              color: #666;
              margin-bottom: 5px;
            }
            
            .bonus-value {
              font-size: 16px;
              font-weight: bold;
              color: #003366;
            }
            
            .total-pay-section {
              margin: 30px 0;
              text-align: center;
              background: #003366;
              color: white;
              padding: 20px;
              border-radius: 10px;
            }
            
            .total-pay-label {
              font-size: 18px;
              margin-bottom: 10px;
            }
            
            .total-pay-value {
              font-size: 32px;
              font-weight: bold;
            }
            
            @media print {
              body { margin: 0; }
              .pdf-container { margin: 0; padding: 0.25in; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            ${modalContent.innerHTML}
          </div>
        </body>
      </html>
    `;
    
    // Write the HTML to the print window
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Calculate total units (consolidated from all vehicle types)
  const totalUnits = (payrollData.bmw_units || 0) + (payrollData.mini_units || 0) + (payrollData.used_units || 0);
  
  // Calculate unit-based commission (retroactive from first unit)
  const calculateUnitCommission = (units) => {
    if (units === 0) return 0;
    
    // Retroactive commission calculation
    // All units get paid at the rate of the highest tier achieved
    let ratePerUnit;
    if (units <= 5) ratePerUnit = 200;
    else if (units === 6) ratePerUnit = 225;
    else if (units === 7) ratePerUnit = 250;
    else if (units === 8) ratePerUnit = 300;
    else if (units === 9) ratePerUnit = 325;
    else if (units === 10) ratePerUnit = 350;
    else if (units === 11) ratePerUnit = 375;
    else ratePerUnit = 425; // 12+ units
    
    return units * ratePerUnit;
  };

  const unitCommission = calculateUnitCommission(totalUnits);
  
  // Calculate performance bonuses
  const rewardsUpgradeBonus = payrollData.rewards_upgrade_bonus || 0;
  const vscBonus = payrollData.vsc_bonus || 0;
  const cilajetBonus = payrollData.cilajet_bonus || 0;
  const tireWheelBonus = payrollData.tire_wheel_bonus || 0;
  const gapBonus = payrollData.gap_bonus || 0;
  const maintenanceBonus = payrollData.maintenance_bonus || 0;
  const diamonBonus = payrollData.diamon_bonus || 0;
  const lojackBonus = payrollData.lojack_bonus || 0;
  const collisionBonus = payrollData.collision_bonus || 0;
  const dentBonus = payrollData.dent_bonus || 0;
  const excessBonus = payrollData.excess_bonus || 0;
  const ppfBonus = payrollData.ppf_bonus || 0;
  const productBonus = payrollData.product_bonus || 0;
  
  // Get spiff information
  const approvedSpiffAmount = payrollData.approved_spiff_amount || 0;
  const approvedSpiffCount = payrollData.approved_spiff_count || 0;
  const paidSpiffAmount = payrollData.paid_spiff_amount || 0;
  const paidSpiffCount = payrollData.paid_spiff_count || 0;
  
  // Get payplan and demo eligibility information
  const payplan = payrollData.payplan || 'BMW';
  const demoEligible = payrollData.demo_eligible !== false;
  
  // Calculate demonstration vehicle allowance (if demo eligible and 8+ units)
  const demoVehicleAllowance = (demoEligible && totalUnits >= 8) ? 300 : 0;
  
  // Calculate total pay (including approved spiffs)
  const totalPay = unitCommission + rewardsUpgradeBonus + productBonus + demoVehicleAllowance + approvedSpiffAmount;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="payroll-modal-backdrop" onClick={onClose}>
        <div className="payroll-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="payroll-modal-header">
            <h2>BMW of Pittsburgh Payroll Sheet</h2>
            <div className="payroll-modal-controls">
              <button className="btn-print" onClick={printPayroll}>
                🖨️ Print
              </button>
              <button className="btn-close" onClick={onClose}>
                ✕ Close
              </button>
            </div>
          </div>

          {/* Payroll Content - PDF Style Layout */}
          <div className="payroll-sheet">
            {/* Header Section - Matching PDF */}
            <div className="payroll-header">
              <div className="company-logo">
                <div className="logo-placeholder">BMW</div>
              </div>
              <div className="company-info">
                <h1>BMW of Pittsburgh</h1>
                <p className="company-subtitle">Client Advisor Payroll Sheet</p>
              </div>
              <div className="payroll-info">
                <div className="info-row">
                  <span className="label">Employee:</span>
                  <span className="value">{payrollData.salesperson || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Payplan:</span>
                  <span className="value">{payplan}</span>
                </div>
                <div className="info-row">
                  <span className="label">Demo Eligible:</span>
                  <span className="value">{demoEligible ? 'Yes' : 'No'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Period:</span>
                  <span className="value">{formatDate(month, year)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>


            {/* Unit Breakdown - Simplified */}
            <div className="unit-breakdown-section">
              <h3 className="section-title">Unit Breakdown</h3>
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th>Total Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="number-cell"><strong>{totalUnits}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Product Breakdown Section */}
            <div className="product-breakdown-section">
              <h3 className="section-title">Product Sales Breakdown</h3>
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th>Unit #</th>
                    <th>Client Name</th>
                    <th>Stock #</th>
                    <th>Vehicle</th>
                    <th>VSC</th>
                    <th>GAP</th>
                    <th>Maintenance</th>
                    <th>Cilajet</th>
                    <th>Diamon</th>
                    <th>LoJack</th>
                    <th>Collision</th>
                    <th>Dent</th>
                    <th>Excess</th>
                    <th>PPF</th>
                    <th>Tire & Wheel</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Use real deal details if available, otherwise show placeholder */}
                  {payrollData.deal_details && payrollData.deal_details.length > 0 ? (
                    payrollData.deal_details.map((deal, index) => (
                      <tr key={deal.id}>
                        <td className="number-cell">{index + 1}</td>
                        <td>{deal.customer_name || 'N/A'}</td>
                        <td className="number-cell">{deal.stock_number || 'N/A'}</td>
                        <td>{deal.vehicle_description || 'N/A'}</td>
                        <td className="number-cell">{deal.vsc > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.gap > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.maintenance > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.cilajet > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.diamon > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.key_product > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.collision_product > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.dent_product > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.excess > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.ppf > 0 ? '✓' : '-'}</td>
                        <td className="number-cell">{deal.wheel_and_tire > 0 ? '✓' : '-'}</td>
                      </tr>
                    ))
                  ) : (
                    // Fallback to placeholder data if no deal details
                    Array.from({ length: totalUnits }, (_, index) => (
                      <tr key={index}>
                        <td className="number-cell">{index + 1}</td>
                        <td>Client {index + 1}</td>
                        <td className="number-cell">ST{String(index + 1).padStart(3, '0')}</td>
                        <td>Vehicle {index + 1}</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                        <td className="number-cell">-</td>
                      </tr>
                    ))
                  )}
                  {totalUnits === 0 && (
                    <tr>
                      <td colSpan="15" className="text-center">No units sold</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Commission Calculation - PDF Style */}
            <div className="commission-section">
              <h3 className="section-title">Commission Calculation</h3>
              <div className="commission-breakdown">
                <div className="commission-item">
                  <span className="commission-label">Total Units Sold:</span>
                  <span className="commission-value">{totalUnits}</span>
                </div>
                <div className="commission-item">
                  <span className="commission-label">Commission Rate (Retroactive):</span>
                  <span className="commission-value">
                    {totalUnits === 0 ? '$0.00' : 
                     totalUnits <= 5 ? '$200.00 per unit' :
                     totalUnits === 6 ? '$225.00 per unit' :
                     totalUnits === 7 ? '$250.00 per unit' :
                     totalUnits === 8 ? '$300.00 per unit' :
                     totalUnits === 9 ? '$325.00 per unit' :
                     totalUnits === 10 ? '$350.00 per unit' :
                     totalUnits === 11 ? '$375.00 per unit' :
                     '$425.00 per unit'}
                  </span>
                </div>
                <div className="commission-item total">
                  <span className="commission-label"><strong>Total Unit Commission:</strong></span>
                  <span className="commission-value"><strong>{formatCurrency(unitCommission)}</strong></span>
                </div>
              </div>
            </div>

            {/* Performance Bonuses Section */}
            <div className="bonuses-section">
              <h3 className="section-title">Performance Bonuses</h3>
              <div className="bonuses-grid">
                <div className="bonus-item">
                  <span className="bonus-label">Rewards Upgrade Bonus:</span>
                  <span className="bonus-value">{formatCurrency(rewardsUpgradeBonus)}</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-label">Demo Vehicle Allowance:</span>
                  <span className="bonus-value">{formatCurrency(demoVehicleAllowance)}</span>
                </div>
              </div>
              
              <h4 className="subsection-title">Product Bonuses ($50 each)</h4>
              <div className="bonuses-grid">
                <div className="bonus-item">
                  <span className="bonus-label">VSC Bonus:</span>
                  <span className="bonus-value">{formatCurrency(vscBonus)}</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-label">Cilajet Bonus:</span>
                  <span className="bonus-value">{formatCurrency(cilajetBonus)}</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-label">Tire & Wheel Protection Bonus:</span>
                  <span className="bonus-value">{formatCurrency(tireWheelBonus)}</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-label">LoJack Bonus:</span>
                  <span className="bonus-value">{formatCurrency(lojackBonus)}</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-label">Maintenance Bonus (MINI):</span>
                  <span className="bonus-value">{formatCurrency(maintenanceBonus)}</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-label">Excess Wear & Tear Bonus (MINI):</span>
                  <span className="bonus-value">{formatCurrency(excessBonus)}</span>
                </div>
              </div>
            </div>

            {/* Pay Summary - PDF Style */}
            <div className="pay-summary-section">
              <h3 className="section-title">Pay Summary</h3>
              <div className="pay-summary">
                <div className="pay-item">
                  <span>Unit Commission:</span>
                  <span className="amount">{formatCurrency(unitCommission)}</span>
                </div>
                <div className="pay-item">
                  <span>Rewards Upgrade Bonus:</span>
                  <span className="amount">{formatCurrency(rewardsUpgradeBonus)}</span>
                </div>
                <div className="pay-item">
                  <span>VSC Bonus:</span>
                  <span className="amount">{formatCurrency(0)}</span>
                </div>
                <div className="pay-item">
                  <span>Cilajet Bonus:</span>
                  <span className="amount">{formatCurrency(0)}</span>
                </div>
                <div className="pay-item">
                  <span>Tire & Wheel Protection Bonus:</span>
                  <span className="amount">{formatCurrency(0)}</span>
                </div>
                <div className="pay-item">
                  <span>Demo Vehicle Allowance:</span>
                  <span className="amount">{formatCurrency(demoVehicleAllowance)}</span>
                </div>
                {approvedSpiffAmount > 0 && (
                  <div className="pay-item">
                    <span>Approved Spiffs ({approvedSpiffCount}):</span>
                    <span className="amount">{formatCurrency(approvedSpiffAmount)}</span>
                  </div>
                )}
                {paidSpiffAmount > 0 && (
                  <div className="pay-item">
                    <span>Paid Spiffs ({paidSpiffCount}):</span>
                    <span className="amount">{formatCurrency(paidSpiffAmount)}</span>
                  </div>
                )}
                <div className="pay-item total">
                  <span><strong>Total Pay:</strong></span>
                  <span className="amount"><strong>{formatCurrency(totalPay)}</strong></span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="performance-section">
              <h3 className="section-title">Performance Metrics</h3>
              <div className="performance-metrics">
                <div className="metric">
                  <span>Total Units Sold:</span>
                  <span>{totalUnits}</span>
                </div>
                <div className="metric">
                  <span>Demo Vehicle Eligible:</span>
                  <span>{totalUnits >= 8 ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="payroll-footer">
              <p>This payroll sheet is generated automatically based on sales data.</p>
              <p>For questions or discrepancies, contact HR.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
  }
  
  export default PayrollModal;