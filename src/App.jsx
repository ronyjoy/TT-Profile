import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import LeagueRosterPage from "./LeagueRosterPage";
import PlayerRatingsPage from "./ProfileRankingPage";
import HomePage from "./HomePage";
import PlayerRankingHistoryGraph from "./PlayerRankingHistoryGraph";
import GoogleLoginButton from "./GoogleLoginButton"; // Import the login button

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // Extract token from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get("token");

    if (authToken) {
      localStorage.setItem("token", authToken);
      setToken(authToken);
      window.history.replaceState({}, document.title, "/"); // Clean URL
    }
  }, []);

  return (
    <Router>
      {token ? (
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/league-roster" element={<LeagueRosterPage />} />
            <Route path="/player-ratings" element={<PlayerRatingsPage />} />
            <Route path="/rating-history/:playerId" element={<PlayerRankingHistoryGraph />} />
          </Routes>
        </DashboardLayout>
      ) : (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h1>Lonestar Table Tennis Academy</h1>
          <p>Please sign in to continue</p>
          <GoogleLoginButton />
        </div>
      )}
    </Router>
  );
};

export default App;
