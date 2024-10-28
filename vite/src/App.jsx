import React, { useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Spinner } from 'react-bootstrap';
import './App.css';

Chart.register(...registerables);

function Dashboard() {
  const [chartData, setChartData] = useState({});
  const [barData, setBarData] = useState({});
  const [pieData, setPieData] = useState({});
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [makeFilter, setMakeFilter] = useState(''); // Filter by Make
  const [yearRange, setYearRange] = useState([2000, 2023]); // Default range

  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost:5000/free/api/vehicles")
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setTableData(data);
          setFilteredData(data); // Initialize filtered data with all data
          processChartData(data);
          calculateMetrics(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setError(error.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    filterData();
  }, [makeFilter, yearRange]);

  const filterData = () => {
    const filtered = tableData.filter((item) => {
      const withinMake = makeFilter ? item.Make === makeFilter : true;
      const withinYear = item['Model Year'] >= yearRange[0] && item['Model Year'] <= yearRange[1];
      return withinMake && withinYear;
    });
    setFilteredData(filtered);
    processChartData(filtered); // Update all charts with filtered data
    calculateMetrics(filtered); // Update metrics with filtered data
  };

  const processChartData = (data) => {
    // Line Chart: Prices over Model Year
    const years = data.map((item) => item['Model Year']);
    const prices = data.map((item) => item['Base MSRP']);

    setChartData({
      labels: years,
      datasets: [
        {
          label: 'Vehicle Prices',
          data: prices,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });

    // Bar Chart: Count of Vehicles by Make
    const makeCounts = data.reduce((acc, item) => {
      acc[item.Make] = (acc[item.Make] || 0) + 1;
      return acc;
    }, {});
    setBarData({
      labels: Object.keys(makeCounts),
      datasets: [
        {
          label: 'Vehicle Count by Make',
          data: Object.values(makeCounts),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    });

    // Pie Chart: Distribution by Model Year
    const yearCounts = data.reduce((acc, item) => {
      acc[item['Model Year']] = (acc[item['Model Year']] || 0) + 1;
      return acc;
    }, {});
    setPieData({
      labels: Object.keys(yearCounts),
      datasets: [
        {
          label: 'Model Year Distribution',
          data: Object.values(yearCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
        },
      ],
    });
  };

  const calculateMetrics = (data) => {
    const totalVehicles = data.length;
    const avgPrice =
      data.reduce((acc, item) => acc + item['Base MSRP'], 0) / totalVehicles || 0;
    const minYear = Math.min(...data.map((item) => item['Model Year']));
    const maxYear = Math.max(...data.map((item) => item['Model Year']));

    setMetrics({
      totalVehicles,
      avgPrice: avgPrice.toFixed(2),
      yearRange: `${minYear} - ${maxYear}`,
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <Spinner animation="border" />
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="dashboard-container">
    <div className="dashboard">
      <h1 className="dashboard-heading">Vehicles Dashboard</h1>

      {/* Filters */}
      <div className="filters">
  <label>
    Filter by Make:
    <select value={makeFilter} onChange={(e) => setMakeFilter(e.target.value)}>
      <option value="">All</option>
      {Array.from(new Set(tableData.map((item) => item.Make))).map((make) => (
        <option key={make} value={make}>
          {make}
        </option>
      ))}
    </select>
  </label>

  <label>
    Model Year Range:
    <input
      type="number"
      placeholder="Start Year"
      value={yearRange[0]}
      onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
    />
    <input
      type="number"
      placeholder="End Year"
      value={yearRange[1]}
      onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
    />
  </label>
</div>


      {/* Key Metrics Section */}
      <div className="metrics">
  <div className="metric total-vehicles">
    <h3>Total Vehicles</h3>
    <p>{metrics.totalVehicles}</p>
  </div>
  <div className="metric avg-price">
    <h3>Average Price</h3>
    <p>${metrics.avgPrice}</p>
  </div>
  <div className="metric year-range">
    <h3>Model Year Range</h3>
    <p>{metrics.yearRange}</p>
  </div>
</div>


      {/* Line Chart */}
      <div className="chart-container">
        <h2>Vehicle Prices Over Years</h2>
        <Line data={chartData} />
      </div>

      {/* Bar Chart */}
      <div className="chart-container">
        <h2>Vehicle Count by Make</h2>
        <Bar data={barData} />
      </div>

      {/* Pie Chart */}
      <div className="chart-container">
        <h2>Model Year Distribution</h2>
        <Pie data={pieData} />
      </div>

      {/* Data Table */}
      <h2>Vehicle Data Table</h2>
      <table>
        <thead>
          <tr>
            <th>Model Year</th>
            <th>Make</th>
            <th>Model</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item['Model Year']}</td>
              <td>{item.Make}</td>
              <td>{item.Model}</td>
              <td>${item['Base MSRP']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default Dashboard;
