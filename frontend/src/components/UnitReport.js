import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Generates a summary of deals grouped by vehicle type.  Users can
 * filter by month and year.  This corresponds to the Unit Report
 * sheet in the Excel workbook.
 */
function UnitReport() {
  // Default to current month and year (MTD)
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // getMonth() returns 0-11
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const response = await axios.get('/api/reports/unit', { params });
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch report when component mounts with MTD defaults
  useEffect(() => {
    fetchReport();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <h2>Unit Report</h2>
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
        <button onClick={fetchReport}>Refresh</button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : data.length === 0 ? (
        <p>No data found for the selected month/year.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Units</th>
              <th>FE Gross</th>
              <th>BE Gross</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.type || 'none'}>
                <td>{row.type || 'Unknown'}</td>
                <td>{row.units}</td>
                <td>{row.fe_gross_total}</td>
                <td>{row.be_gross_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UnitReport;