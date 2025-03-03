import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useParams, Link } from 'react-router-dom';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const serverAddress = 'http://localhost:5001';

function PlayerHistoryPage() {
  const { id } = useParams(); // The player's ID from the URL
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${serverAddress}/api/playerProfiles/${id}/rankingHistory`);
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching ranking history:", error);
      }
    };
    fetchHistory();
  }, [id]);

  // Process the history data to compute total ratings over time.
  const labels = historyData.map((entry) => new Date(entry.createdAt).toLocaleString());
  const totalRatings = historyData.map((entry) => {
    // Compute total rating as the sum of all ranking attribute values
    return entry.rankings
      ? Object.values(entry.rankings).reduce((sum, val) => sum + val, 0)
      : 0;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Rating Over Time',
        data: totalRatings,
        fill: false,
        borderColor: 'blue',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Total Rating vs. Time',
      },
    },
    scales: {
      x: {
        type: 'category', // using category scale for date labels
        title: { display: true, text: 'Time' },
      },
      y: {
        title: { display: true, text: 'Total Rating' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1>Ranking History for Player {id}</h1>
      <Line data={chartData} options={options} />
      <br />
      <Link to="/">Back to Player List</Link>
    </div>
  );
}

export default PlayerHistoryPage;
