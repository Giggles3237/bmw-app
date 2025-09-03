import React, { useState } from 'react';
import axios from 'axios';

/**
 * Displays aggregated totals per salesperson.  The user can choose a
 * month and year.  If a salespersonId prop is provided, only
 * that salesperson's totals will be returned.  This component
 * produces similar information to the Salesperson tab in the Excel
 * workbook, showing how salespeople are paid based on their deals.
 */
function SalespersonReport({ salespersonId }) {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      if (salespersonId) params.salesperson_id = salespersonId;
      const response = await axios.get('/api/reports/salesperson', { params });
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Salesperson Report</h2>
      <div style={{ marginBottom: '1em' }}>
          <label style={{ marginRight: '0.5em' }}>
            Month:
            <input
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ width: '4em', marginLeft: '0.3em' }}
              min="1"
              max="12"
            />
          </label>
          <label style={{ marginRight: '0.5em' }}>
            Year:
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: '5em', marginLeft: '0.3em' }}
            />
          </label>
          <button onClick={fetchReport}>Generate</button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : data.length === 0 ? (
        <p>No data. Choose a month/year and click Generate.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Salesperson</th>
              <th>Deals</th>
              <th>FE Gross</th>
              <th>AVP</th>
              <th>BE Gross</th>
              <th>Reserve</th>
              <th>Rewards</th>
              <th>VSC</th>
              <th>Maintenance</th>
              <th>GAP</th>
              <th>Cilajet</th>
              <th>Diamon</th>
              <th>Key</th>
              <th>Collision</th>
              <th>Dent</th>
              <th>Excess</th>
              <th>PPF</th>
              <th>Wheel & Tire</th>
              <th>Product Count</th>
              <th>Money</th>
              <th>Titling</th>
              <th>Mileage</th>
              <th>License/Ins</th>
              <th>Fees</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.salesperson || 'none'}>
                <td>{row.salesperson || 'Unassigned'}</td>
                <td>{row.deal_count}</td>
                <td>{row.fe_gross_total}</td>
                <td>{row.avp_total}</td>
                <td>{row.be_gross_total}</td>
                <td>{row.reserve_total}</td>
                <td>{row.rewards_total}</td>
                <td>{row.vsc_total}</td>
                <td>{row.maintenance_total}</td>
                <td>{row.gap_total}</td>
                <td>{row.cilajet_total}</td>
                <td>{row.diamon_total}</td>
                <td>{row.key_total}</td>
                <td>{row.collision_total}</td>
                <td>{row.dent_total}</td>
                <td>{row.excess_total}</td>
                <td>{row.ppf_total}</td>
                <td>{row.wheel_and_tire_total}</td>
                <td>{row.product_count_total}</td>
                <td>{row.money_total}</td>
                <td>{row.titling_total}</td>
                <td>{row.mileage_total}</td>
                <td>{row.license_insurance_total}</td>
                <td>{row.fees_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SalespersonReport;