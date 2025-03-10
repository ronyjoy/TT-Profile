import React, { useRef } from "react";
import "./GroupPrintTable.css"
const GroupPrintTable = ({ groupId, players }) => {
  const tableRef = useRef(null);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const playersWithLetter = players.map((player, index) => ({
    ...player,
    letter: letters[index] || `#${index + 1}`
  }));

  const printGroup = () => {
    // Get longest player name to determine column width
    const playerNames = Array.from(tableRef.current.querySelectorAll("td:first-child"))
      .map(td => td.textContent.trim());
    const longestName = playerNames.reduce((max, name) => name.length > max.length ? name : max, "");
  
    // Estimate width based on longest name (each character ~8px width)
    const estimatedNameWidth = Math.max(100, longestName.length * 8) + "px";
  
    const content = `
      <div style="text-align: center; margin-bottom: 10px;">
        <img 
          src="images/logo.png" 
          alt="Academy Logo"
          style="width: 100px; height: 100px;"
        />
      </div>
      ${tableRef.current.innerHTML}
    `;
  
    const printWindow = window.open("", "_blank");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${groupId} - Print</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
            th:first-child, td:first-child { max-width: ${estimatedNameWidth}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } /* ✅ Fixed */
            .black-cell { background-color: black; width: 50px; height: 50px; }
            @media print {
              .black-cell { background-color: black !important; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
         <div ref={tableRef} className="group-print-table" style={{ marginTop: "16px" }}>
          ${content}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  

  return (
    <div ref={tableRef} className="group-print-table" style={{ marginTop: "16px" }}>
      
  
      <h2>{groupId}</h2>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            {playersWithLetter.map(player => (
              <th key={player.letter}>{player.letter}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {playersWithLetter.map(playerRow => (
            <tr key={playerRow.letter}>
              <td><strong>{playerRow.name}</strong> ({playerRow.letter})</td>
              {playersWithLetter.map(playerCol => (
                <td key={playerCol.letter} className={playerRow.letter === playerCol.letter ? "black-cell" : ""}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={printGroup}>Print Group</button>
    </div>
  );
  
};

export default GroupPrintTable;
