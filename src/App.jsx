import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import LeagueRosterPage from "./LeagueRosterPage";
import PlayerRatingsPage from "./ProfileRankingPage";
import HomePage from "./HomePage";

const App = () => {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/league-roster" element={<LeagueRosterPage />} />
          <Route path="/player-ratings" element={<PlayerRatingsPage />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
};

export default App;
