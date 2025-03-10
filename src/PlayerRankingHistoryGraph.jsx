import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Box, Typography } from "@mui/material";

// Register Chart.js Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function PlayerRankingHistoryGraph() {
  const { playerId } = useParams(); // ✅ Get Player ID from URL
  const [historyData, setHistoryData] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!playerId) {
      setError("No player ID found in the URL.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5001/api/playerProfiles/${playerId}/rankingHistory`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch ranking history.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.length > 0) {
          setHistoryData(data);
          const firstEntry = data[0];

          // Extract all coach names from ranking history
          const coachNames = Object.keys(firstEntry.coachRankings || {});
          setCoaches(coachNames);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching ranking history:", err);
        setError("Error fetching ranking history.");
        setLoading(false);
      });
  }, [playerId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (historyData.length === 0) return <Typography>No ranking history found.</Typography>;

  // Extract timestamps for x-axis
  const labels = historyData.map((entry) =>
    new Date(entry.createdAt).toLocaleString()
  );

  // Function to calculate total rating for each coach
  const calculateTotal = (ratings) => {
    if (!ratings) return 0;
    return Object.values(ratings).reduce((sum, val) => sum + val, 0);
  };

  // ✅ Create datasets for each coach (No Academy Line)
  const datasets = coaches.map((coach, index) => ({
    label: coach, // ✅ Display coach name
    data: historyData.map((entry) => calculateTotal(entry.coachRankings?.[coach])),
    borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`, // Unique color per coach
    fill: false,
    tension: 0.1,
  }));

  // ✅ Construct chart data
  const chartData = { labels, datasets };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Total Rating History Per Coach</Typography>

      {/* ✅ Render Chart if Data Exists */}
      {datasets.length > 0 ? (
        <Line data={chartData} />
      ) : (
        <Typography sx={{ mt: 2 }}>No data available.</Typography>
      )}
    </Box>
  );
}

export default PlayerRankingHistoryGraph;
