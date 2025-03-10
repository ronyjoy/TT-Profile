import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper, MenuItem, Select, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import {
  DndContext,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GroupPrintTable from "./GroupPrintTable";

const ACADEMY_LOGO_URL = "images/logo.png"; // Update this with the actual image path

const LeagueRosterPage = () => {
  const [roster, setRoster] = useState([]); // Unassigned players
  const [numGroups, setNumGroups] = useState(2);
  const [groups, setGroups] = useState(generateGroups(2));
  const [newPlayerName, setNewPlayerName] = useState("");
  const navigate = useNavigate();

  // Function to Generate Groups Based on Selected Number
  function generateGroups(count) {
    let newGroups = {};
    for (let i = 1; i <= count; i++) {
      newGroups[`Group ${i}`] = [];
    }
    return newGroups;
  }

  // Handle Number of Groups Change
  const handleNumGroupsChange = (event) => {
    const newCount = event.target.value;
    setNumGroups(newCount);
    setGroups(generateGroups(newCount));
  };

  // Add Player to Unassigned List
  const addPlayer = () => {
    if (newPlayerName.trim() === "") return;
    const newPlayer = { id: `p${Date.now()}`, name: newPlayerName };
    setRoster((prev) => [...prev, newPlayer]); // ✅ Player now appears in the Unassigned Players list
    setNewPlayerName("");
  };

  // Handle Enter Key for Adding Players
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  // Drag End Handler
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let sourceKey = "roster";
    let sourceList = [...roster];

    Object.keys(groups).forEach((group) => {
      if (groups[group].some((player) => player.id === activeId)) {
        sourceKey = group;
        sourceList = [...groups[group]];
      }
    });

    let destinationKey = "roster";
    let destinationList = [...roster];

    Object.keys(groups).forEach((group) => {
      if (group === overId || groups[group].some((player) => player.id === overId)) {
        destinationKey = group;
        destinationList = [...groups[group]];
      }
    });

    if (sourceKey === destinationKey) return;

    const playerIndex = sourceList.findIndex((player) => player.id === activeId);
    if (playerIndex === -1) return;
    const [movedPlayer] = sourceList.splice(playerIndex, 1);

    destinationList.push(movedPlayer);

    if (sourceKey === "roster") {
      setRoster(sourceList);
    } else {
      setGroups((prev) => ({
        ...prev,
        [sourceKey]: sourceList
      }));
    }

    if (destinationKey === "roster") {
      setRoster(destinationList);
    } else {
      setGroups((prev) => ({
        ...prev,
        [destinationKey]: destinationList
      }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">League Roster</Typography>

      {/* Select Number of Groups */}
      <Box sx={{ mb: 2 }}>
        <Typography>Select Number of Groups:</Typography>
        <Select value={numGroups} onChange={handleNumGroupsChange}>
          {[...Array(10).keys()].map((num) => (
            <MenuItem key={num + 1} value={num + 1}>{num + 1}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Add Player Section */}
      <Box sx={{ display: "flex", gap: 2, my: 2 }}>
        <TextField
          label="Enter Player Name"
          variant="outlined"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyPress={handleKeyPress} // ✅ Press Enter to add player
        />
        <Button variant="contained" onClick={addPlayer}>
          Add Player
        </Button>
      </Box>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {/* Unassigned Players */}
        <SortableContext items={roster} strategy={rectSortingStrategy}>
          <DroppableArea id="roster" title="Unassigned Players">
            {roster.map((player) => (
              <DraggableItem key={player.id} id={player.id} name={player.name} />
            ))}
          </DroppableArea>
        </SortableContext>

        {/* Groups Section */}
        <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
          {Object.keys(groups).map((groupId) => (
            <SortableContext key={groupId} items={groups[groupId]} strategy={rectSortingStrategy}>
              <DroppableArea id={groupId} title={<GroupTitle name={groupId} />}>
                {groups[groupId].map((player) => (
                  <DraggableItem key={player.id} id={player.id} name={player.name} />
                ))}
                <GroupPrintTable groupId={groupId} players={groups[groupId]} />
              </DroppableArea>
            </SortableContext>
          ))}
        </Box>
      </DndContext>

      <Box sx={{ mt: 3 }}>
        <Link to="/">Back to Home</Link>
      </Box>
    </Box>
  );
};

// Group Title with Logo Component
const GroupTitle = ({ name }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <img src={ACADEMY_LOGO_URL} alt="Academy Logo" style={{ width: 40, height: 40 }} />
    <Typography>{name}</Typography>
  </Box>
);

// Draggable Item Component
const DraggableItem = ({ id, name }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "8px",
    marginBottom: "4px",
    backgroundColor: "#e0e0e0",
    border: "1px solid black",
    cursor: "grab",
    userSelect: "none"
  };

  return (
    <Paper ref={setNodeRef} {...attributes} {...listeners} sx={style}>
      {name}
    </Paper>
  );
};

// Droppable Area Component
const DroppableArea = ({ id, title, children }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <Box ref={setNodeRef} sx={{ width: 300, minHeight: 200, border: "1px solid black", p: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {children}
    </Box>
  );
};

export default LeagueRosterPage;
