import React from "react";
import GroupPrintTable from "./GroupPrintTable";
import { Link, useLocation } from "react-router-dom";
import "./LeagueRosterPrintPage.css";

const LeagueRosterPrintPage = () => {
  const location = useLocation();
  const { groups } = location.state || { groups: {} }; // Get groups from navigation state

  return (
    <div style={{ padding: "16px" }}>
      <h1>Print League Roster</h1>
      {Object.keys(groups).length === 0 ? (
        <p>No groups available. Please add players in the League Roster page.</p>
      ) : (
        Object.keys(groups).map((groupId) => (
          <GroupPrintTable key={groupId} groupId={groupId} players={groups[groupId]} />
        ))
      )}
      <div style={{ marginTop: "16px" }}>
        <Link to="/league-roster">
          <button>Back to League Roster</button>
        </Link>
      </div>
    </div>
  );
};

export default LeagueRosterPrintPage;
