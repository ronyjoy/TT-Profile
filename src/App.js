import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import LeagueRosterPage from "./LeagueRosterPage";
import LeagueRosterPrintPage from "./LeagueRosterPrintPage";
import ProfileRankingPage from "./ProfileRankingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/league-roster" element={<LeagueRosterPage />} />
        <Route path="/league-roster/print" element={<LeagueRosterPrintPage />} />
        <Route path="/student-ratings" element={<ProfileRankingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
