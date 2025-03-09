import React, { useRef } from "react";

const GroupPrintTable = ({ groupId, players }) => {
  const tableRef = useRef(null);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const playersWithLetter = players.map((player, index) => ({
    ...player,
    letter: letters[index] || `#${index + 1}`
  }));

  const printGroup = () => {
    const content = tableRef.current.innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>${groupId} - Print</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
            .black-cell { background-color: black; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
