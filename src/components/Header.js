import React from 'react';
import './Header.css';


const Header = ({ sortByTotal, toggleSort, attributeHeadings }) => {
  console.log("Header attributeHeadings:", attributeHeadings); // Debug log
  return (
    <div className="header-container">
      <div className="header-top">
      <img src="/images/logo.png" alt="Lonestar Logo" className="header-logo" />
       
        <h1>Player Profile Ranking</h1>
        <button onClick={toggleSort}>
          {sortByTotal ? "Show Original Order" : "Reorder by Total Rating"}
        </button>
      </div>
      <table className="header-table">
        <thead>
         
        </thead>
      </table>
    </div>
  );
};

export default Header;
