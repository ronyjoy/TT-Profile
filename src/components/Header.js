// Header.js
import React from 'react';
import '../App.css'; // if you have styles defined here

const Header = ({ text }) => (
    <div className="header-text-container">
      <h2>{text}</h2>
    </div>
  );
  
export default Header;
