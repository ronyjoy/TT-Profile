// RankingForm.js
import React, { useState } from 'react';

const attributes = [
  "Footwork", 
  "Forehand Drive",
  "Backhand Drive",
  "Forehand Loop",
  "Backhand Loop",
  "Forehand Block",
  "Backhand Block",
  "Backhand Push",
  "Forehand Push",
  "Short Pushes",
  "Long Pushes",
  "Underspin Loop",
  "Counter Looping",
  "Play Away From The Table",
  "Serving Technics",
  "Receiving Technics",
  "Chopblock",
  "Chopping"
];

function RankingForm({ profiles, addRanking }) {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [ratings, setRatings] = useState(() => {
    const initialRatings = {};
    attributes.forEach(attr => {
      initialRatings[attr] = "";
    });
    return initialRatings;
  });

  const handleRatingChange = (attr, value) => {
    setRatings({
      ...ratings,
      [attr]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rankingData = {
      studentId: selectedStudentId,
      ratings,
    };

    try {
      const response = await fetch('http://localhost:5000/api/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rankingData),
      });
      const savedRanking = await response.json();
      addRanking(savedRanking);
      // Reset form
      setSelectedStudentId("");
      const resetRatings = {};
      attributes.forEach(attr => {
        resetRatings[attr] = "";
      });
      setRatings(resetRatings);
    } catch (error) {
      console.error("Error saving ranking:", error);
    }
  };

  // Filter only student profiles
  const students = profiles.filter(p => p.profileType === "Student");

  return (
    <form onSubmit={handleSubmit}>
      <h2>Rank Student</h2>
      <div>
        <label>Select Student: </label>
        <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required>
          <option value="">--Select--</option>
          {students.map(student => (
            <option key={student._id} value={student._id}>
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>
      </div>
      {attributes.map(attr => (
        <div key={attr}>
          <label>{attr}: </label>
          <input
            type="number"
            min="1"
            max="10"
            value={ratings[attr]}
            onChange={(e) => handleRatingChange(attr, e.target.value)}
            required
          />
        </div>
      ))}
      <button type="submit">Submit Ranking</button>
    </form>
  );
}

export default RankingForm;
