import React from 'react';

const attributes = [
    "Footwork", 
    "ForehandDrive",
    "BackhandDrive",
    "ForehandLoop",
    "BackhandLoop",
    "ForehandBlock",
    "BackhandBlock",
    "BackhandPush",
    "ForehandPush",
    "ShortPushes",
    "LongPushes",
    "UnderspinLoop",
    "CounterLooping",
    "PlayAwayFromTheTable",
    "ServingTechnics",
    "ReceivingTechnics",
    "Chopblock",
    "Chopping",
    "Gameplay",
    "PracticeFocus",
    "Sportsmanship",
    "OverallAttitude"
  ];
  
  
  

function RankingTable({ rankings, profiles }) {
  // Helper function to get a student's name from their profile
  const getStudentName = (studentId) => {
    const student = profiles.find(p => p.id.toString() === studentId.toString());
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
  };

  return (
    <div>
      <h2>Student Ranking List</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Student Name</th>
            {attributes.map(attr => (
              <th key={attr}>{attr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rankings.length === 0 ? (
            <tr>
              <td colSpan={attributes.length + 1}>No rankings available.</td>
            </tr>
          ) : (
            rankings.map(ranking => (
              <tr key={ranking.id}>
                <td>{getStudentName(ranking.studentId)}</td>
                {attributes.map(attr => (
                  <td key={attr}>{ranking.ratings[attr]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RankingTable;
