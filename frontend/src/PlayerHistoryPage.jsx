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

// Register Chart.js components.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


// Define attribute keys (must match your DB schema for ranking history).
const attributes = [
  "Footwork", 
  "ForehandDrive",
  "BackhandDrive",
  "ForehandLoop",
  "BackhandLoop",
  "ForehandBlock",
  "BackhandBlock",
  "BackhandPush",
  "ForehandPush",
  "ShortPushes",
  "LongPushes",
  "UnderspinLoop",
  "CounterLooping",
  "PlayAwayFromTheTable",
  "ServingTechnics",
  "ReceivingTechnics",
  "Chopblock",
  "Chopping"
];

// Mapping attribute keys to display headings.
const attributeHeadings = {
  Footwork: "Foot Work",
  ForehandDrive: "Forehand Power",
  BackhandDrive: "Backhand Force",
  ForehandLoop: "Forehand Loop",
  BackhandLoop: "Backhand Loop",
  ForehandBlock: "Forehand Block",
  BackhandBlock: "Backhand Block",
  BackhandPush: "Backhand Push",
  ForehandPush: "Forehand Push",
  ShortPushes: "Short Pushes",
  LongPushes: "Long Pushes",
  UnderspinLoop: "Underspin Loop",
  CounterLooping: "Counter Looping",
  PlayAwayFromTheTable: "Play Away",
  ServingTechnics: "Serving",
  ReceivingTechnics: "Receiving",
  Chopblock: "Chopblock",
  Chopping: "Chopping"
};

function PlayerHistoryPage() {
  const { id } = useParams(); // Player ID from URL
  const [historyData, setHistoryData] = useState([]);
  // The view dropdown: "academy" for average or a specific coach's id.
  const [selectedView, setSelectedView] = useState("academy");
  // Simulated coach list; you can fetch this from your backend if needed.
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    // Simulate fetching coaches.
    setCoaches([
      { id: "coach1", name: "Coach One" },
      { id: "coach2", name: "Coach Two" }
    ]);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/playerProfiles/${id}/rankingHistory`);
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching ranking history:", error);
      }
    };
    fetchHistory();
  }, [id]);

  // Compute average value for an attribute across coaches (ignoring zeros).
  const getAcademyValue = (record, attr) => {
    if (!record.rankings) return 0;
    let sum = 0, count = 0;
    Object.values(record.rankings).forEach(coachRanking => {
      const val = coachRanking[attr] || 0;
      if (val > 0) {
        sum += val;
        count++;
      }
    });
    return count > 0 ? Math.round(sum / count) : 0;
  };

  // Get displayed value for an attribute in a record.
  const getDisplayedValue = (record, attr) => {
    if (selectedView === "academy") {
      return getAcademyValue(record, attr);
    } else {
      // For a specific coach, check if that coach's rating exists.
      return record.rankings && record.rankings[selectedView] && record.rankings[selectedView][attr] !== undefined
        ? record.rankings[selectedView][attr]
        : 0;
    }
  };

  // Compute total rating for a record.
  const getTotalRatingForRecord = (record) => {
    let total = 0;
    attributes.forEach(attr => {
      total += getDisplayedValue(record, attr);
    });
    return total;
  };

  // Prepare chart labels and data.
  const labels = historyData.map(entry => new Date(entry.createdAt).toLocaleString());
  const totalRatings = historyData.map(entry => getTotalRatingForRecord(entry));

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
      title: { display: true, text: 'Total Rating vs. Time' },
    },
    scales: {
      x: { type: 'category', title: { display: true, text: 'Time' } },
      y: { title: { display: true, text: 'Total Rating' }, beginAtZero: true },
    },
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1>Ranking History for Player {id}</h1>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ marginRight: '8px' }}>Select View: </label>
        <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
          <option value="academy">Academy (Average)</option>
          {coaches.map(coach => (
            <option key={coach.id} value={coach.id}>{coach.name}</option>
          ))}
        </select>
      </div>
      <Line data={chartData} options={options} />
      <br />
      <Link to="/">Back to Player List</Link>
    </div>
  );
}

export default PlayerHistoryPage;
