import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => (
  <div style={{ padding: "16px" }}>
    <h1>Welcome to the League Management System</h1>
    <ul>
      <li>
        <Link to="/league-roster">League Roster</Link>
      </li>
      <li>
        <Link to="/student-ratings">Student Ratings</Link>
      </li>
    </ul>
  </div>
);

export default HomePage;
