// PlayerHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const serverAddress = 'http://localhost:5001';

function PlayerHistoryPage() {
  const { id } = useParams(); // player's id from the URL
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    // Fetch ranking history for the given player id.
    fetch(`${serverAddress}/api/playerProfiles/${id}/rankingHistory`)
      .then((res) => res.json())
      .then((data) => setHistoryData(data))
      .catch((err) => console.error(err));
  }, [id]);

  // Choose an attribute to display or let the user select one.
  const attribute = "LongPushes"; // Example attribute

  // Build labels (timestamps) and data for the graph.
  const labels = historyData.map((entry) =>
    new Date(entry.createdAt).toLocaleString()
  );
  const values = historyData.map((entry) => entry.rankings[attribute]);

  const chartData = {
    labels,
    datasets: [
      {
        label: attribute,
        data: values,
        fill: false,
        borderColor: 'blue',
        tension: 0.1,
      },
    ],
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1>Ranking History for Player {id}</h1>
      <Line data={chartData} />
      <br />
      <Link to="/">Back to Player List</Link>
    </div>
  );
}

export default PlayerHistoryPage;
