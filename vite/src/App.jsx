import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import vehicles from './data/vehicles.json'; // Adjust the path as necessary
import { Chart, registerables } from 'chart.js';

// Register all components
Chart.register(...registerables);

function Dashboard() {
  const [chartData, setChartData] = useState({});
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    processChartData(vehicles);
  }, []);

  const processChartData = (data) => {
    const years = data.map((item) => item["Model Year"]); // Adjust the key based on your JSON structure
    const prices = data.map((item) => item["Base MSRP"]); // Adjust the key based on your JSON structure

    setChartData({
      labels: years,
      datasets: [
        {
          label: 'Vehicle Prices',
          data: prices,
          backgroundColor: 'rgba(75, 192, 192, 0.5)', // Bar color
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });

    const formattedTableData = data.map((item) => ({
      year: item["Model Year"],
      make: item["Make"],
      model: item["Model"],
      price: item["Base MSRP"],
    }));

    setTableData(formattedTableData);
  };

  // Log chart data for debugging
  console.log(chartData); // Debugging line

  return (
    <div>
      <h1>Vehicles Dashboard</h1>
      <div>
        {chartData.labels ? (
          <>
            <h2>Line Chart of Vehicle Prices Over Years</h2>
            <Line data={chartData} />

            <h2>Bar Chart of Vehicle Prices Over Years</h2>
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Vehicle Prices Over Years',
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Model Year',
                    },
                    ticks: {
                      autoSkip: false, // Prevent skipping labels
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Price',
                    },
                    beginAtZero: true, // Start y-axis from zero
                  },
                },
              }} 
            />

            {/* Table to showcase vehicle data */}
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
                {tableData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.year}</td>
                    <td>{item.make}</td>
                    <td>{item.model}</td>
                    <td>{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>Loading chart...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
