import React from 'react';
import './PlayerRatingHeader.css';

const Header = ({ sortByTotal, toggleSort, attributeHeadings }) => {
  return (
    <div className="header-container">
      <div className="header-top">
        <h1>Player Profile Ranking</h1>
        <button onClick={toggleSort}>
          {sortByTotal ? "Show Original Order" : "Reorder by Total Rating"}
        </button>
      </div>
    
    </div>
  );
};

export default Header;
