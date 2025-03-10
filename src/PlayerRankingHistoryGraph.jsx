// PlayerRankingHistoryGraph.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


function PlayerRankingHistoryGraph({ playerId, attribute }) {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5001/api/playerProfiles/${playerId}/rankingHistory`)
      .then(res => res.json())
      .then(data => setHistoryData(data))
      .catch(err => console.error(err));
  }, [playerId]);

  // Create labels (timestamps) and data (values for the attribute)
  const labels = historyData.map(entry =>
    new Date(entry.createdAt).toLocaleString()
  );
  const values = historyData.map(entry => entry.rankings[attribute]);

  const chartData = {
    labels,
    datasets: [
      {
        label: attribute,
        data: values,
        fill: false,
        borderColor: 'blue',
        tension: 0.1
      }
    ]
  };

  return <Line data={chartData} />;
}

export default PlayerRankingHistoryGraph;
