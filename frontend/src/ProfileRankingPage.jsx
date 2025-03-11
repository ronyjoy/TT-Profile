import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Slider from '@mui/material/Slider';
import Header from './PlayerRatingHeader';
import './App.css';
import api from './api'

const token = localStorage.getItem("token");


// Define the attribute keys (must match your DB schema for ratings)
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
  "Chopping"
];

// Mapping attribute keys to display headings.
const attributeHeadings = {
  Footwork: "Foot Work",
  ForehandDrive: "Forehand Power",
  BackhandDrive: "Backhand Force",
  ForehandLoop: "Forehand Loop",
  BackhandLoop: "Backhand Loop",
  ForehandBlock: "Forehand Block",
  BackhandBlock: "Backhand Block",
  BackhandPush: "Backhand Push",
  ForehandPush: "Forehand Push",
  ShortPushes: "Short Pushes",
  LongPushes: "Long Pushes",
  UnderspinLoop: "Underspin Loop",
  CounterLooping: "Counter Looping",
  PlayAwayFromTheTable: "Play Away",
  ServingTechnics: "Serving",
  ReceivingTechnics: "Receiving",
  Chopblock: "Chopblock",
  Chopping: "Chopping"
};

function ProfileRankingPage() {
  // State for player profiles.
  const [profiles, setProfiles] = useState({});
  // For each player, store coach-specific ratings.
  // rankingValues[playerId] = { coach1: { Footwork: 50, ... }, coach2: { Footwork: 60, ... } }
  const [rankingValues, setRankingValues] = useState({});
  // Comments per player.
  const [comments, setComments] = useState({});
  // Control ordering.
  const [sortByTotal, setSortByTotal] = useState(false);
  // Coach list and selected coach.
  const [coaches, setCoaches] = useState([]);
  // "academy" means average view; otherwise, a specific coach ID.
  const [selectedCoach, setSelectedCoach] = useState("academy");

  // Refs for debouncing.
  const autoUpdateTimers = useRef({});
  const rankingValuesRef = useRef(rankingValues);
  const commentsRef = useRef(comments);

  useEffect(() => {
    rankingValuesRef.current = rankingValues;
  }, [rankingValues]);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // Fetch player profiles from backend.
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await api.get(`/api/playerProfiles`);
        const data = await response.json();
        const profilesObj = {};
        const initialRankings = {};
        const initialComments = {};
        data.forEach(profile => {
          const id = profile._id || profile.id;
          profilesObj[id] = profile;
          // Assume backend stores coach-specific ratings in profile.coachRankings
          initialRankings[id] = profile.coachRankings || {};
          initialComments[id] = profile.comments || "";
        });
        setProfiles(profilesObj);
        setRankingValues(initialRankings);
        setComments(initialComments);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };
    fetchProfiles();
  }, []);

  // Simulate fetching coach list.
  useEffect(() => {
    setCoaches([
      { id: "Bright", name: "Bright" },
      { id: "Maba", name: "Maba" },
      { id: "Eday", name: "Eday" }
    ]);
  }, []);

  // New player form state.
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPicturePreview, setNewPicturePreview] = useState("");

  const handleAddProfile = async (e) => {
    e.preventDefault();
    const newProfile = {
      profileType: "Student",
      firstName: newFirstName,
      lastName: newLastName,
      phone: newPhone,
      email: newEmail,
      picture: newPicturePreview
    };
    try {
      const response =  await api.get(`/api/playerProfiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      const savedProfile = await response.json();
      const id = savedProfile._id || savedProfile.id;
      setProfiles(prev => ({ ...prev, [id]: savedProfile }));
      // Initialize with an empty object for coach-specific data.
      setRankingValues(prev => ({ ...prev, [id]: {} }));
      setComments(prev => ({ ...prev, [id]: "" }));
      setNewFirstName("");
      setNewLastName("");
      setNewPhone("");
      setNewEmail("");
      setNewPicturePreview("");
    } catch (error) {
      console.error("Error adding profile:", error);
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewPicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Updated PUT endpoint call to update the coach-specific data.
  const  updateProfileForStudent = async (profileId) => {
    if (selectedCoach === "academy") return; // Read-only in academy view
  
    const coachData = rankingValuesRef.current[profileId]?.[selectedCoach] || {};
    const payload = {
      coachName: selectedCoach,
      rankings: coachData, // ✅ Only send the selected coach's rankings
      comments: commentsRef.current[profileId] || "",
    };
  
    console.log("Updating profile:", profileId, "Payload:", payload);
  
    try {
      const response =  await api.get(`/api/playerProfiles/${profileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const updatedProfile = await response.json();
      console.log("Profile updated:", updatedProfile);
  
      setProfiles((prev) => ({
        ...prev,
        [profileId]: updatedProfile,
      }));
  
      setRankingValues((prev) => ({
        ...prev,
        [profileId]: updatedProfile.coachRankings || {},
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  

  // Handle slider changes.
  const handleSliderChange = (profileId, attr, newValue) => {
    if (selectedCoach === "academy") return; // Prevent updates in academy mode
  
    setRankingValues((prev) => {
      const updatedRankings = {
        ...prev,
        [profileId]: {
          ...(prev[profileId] || {}),
          [selectedCoach]: {
            ...(prev[profileId]?.[selectedCoach] || {}),
            [attr]: newValue,
          },
        },
      };
  
      rankingValuesRef.current = updatedRankings; // ✅ Update reference
      return updatedRankings;
    });
  
    if (autoUpdateTimers.current[profileId]) {
      clearTimeout(autoUpdateTimers.current[profileId]);
    }
    
    autoUpdateTimers.current[profileId] = setTimeout(() => {
      updateProfileForStudent(profileId);
    }, 500);
  };
  
  // Handle comment changes.
  const handleCommentChange = (profileId, value) => {
    if (selectedCoach === "academy") return; // Read-only in academy view
    setComments(prev => ({
      ...prev,
      [profileId]: value
    }));
    if (autoUpdateTimers.current[profileId]) {
      clearTimeout(autoUpdateTimers.current[profileId]);
    }
    autoUpdateTimers.current[profileId] = setTimeout(() => {
      updateProfileForStudent(profileId);
    }, 500);
  };



  const getDisplayedValue = (profileId, attr) => {
    if (selectedCoach === "academy") {
      return getAcademyValue(profileId, attr); // ✅ Compute average
    } else {
      return rankingValues[profileId]?.[selectedCoach]?.[attr] ?? 0;
    }
  };
  
  // ✅ Function to compute the average for the academy view
  const getAcademyValue = (profileId, attr) => {
    const coachData = rankingValues[profileId] || {};
    let sum = 0, count = 0;
  
    Object.values(coachData).forEach((coachRanking) => {
      const val = coachRanking[attr] || 0;
      if (val > 0) {
        sum += val;
        count++;
      }
    });
  
    return count > 0 ? Math.round(sum / count) : 0;
  };
  
  

  // Compute total rating for a player.
  const getTotalRating = (profileId) => {
    if (selectedCoach === "academy") {
      return attributes.reduce((sum, attr) => sum + getAcademyValue(profileId, attr), 0);
    } else {
      if (!rankingValues[profileId] || !rankingValues[profileId][selectedCoach]) return 0;
      return Object.values(rankingValues[profileId][selectedCoach]).reduce((sum, val) => sum + (val || 0), 0);
    }
  };
  
  // Order profiles.
  const profileIds = Object.keys(profiles);
  const sortedIds = sortByTotal
    ? [...profileIds].sort((a, b) => getTotalRating(b) - getTotalRating(a))
    : profileIds;

  // Total columns in main row: Player Name + attribute columns + Total Rating.
  const totalColumns = 1 + attributes.length + 1;

  return (
    <div className="container" style={{ padding: '16px' }}>
      {/* Frozen Header Component */}
      <Header
        sortByTotal={sortByTotal}
        toggleSort={() => setSortByTotal(!sortByTotal)}
        attributeHeadings={attributeHeadings}
      />

      {/* Coach Dropdown */}
      <div style={{ margin: '16px 0' }}>
        <label style={{ marginRight: '8px' }}>Select Coach:</label>
        <select value={selectedCoach} onChange={(e) => setSelectedCoach(e.target.value)}>
          <option value="academy">Academy (Average)</option>
          {coaches.map(coach => (
            <option key={coach.id} value={coach.id}>{coach.name}</option>
          ))}
        </select>
      </div>

      {/* New Player Form */}
      <div style={{ margin: '16px 0' }}>
        <form onSubmit={handleAddProfile} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          <input type="text" placeholder="First Name" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} required />
          <input type="text" placeholder="Last Name" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} required />
          <input type="text" placeholder="Phone (optional)" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <input type="email" placeholder="Email (optional)" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <input type="file" accept="image/*" onChange={handlePictureChange} />
          <button type="submit">Add Player</button>
        </form>
      </div>

      {/* Scrollable Table Body */}
      <div className="table-container">
        <table style={{ width: '100%', tableLayout: 'auto', textAlign: 'center', borderCollapse: 'collapse' }} border="1" cellPadding="8" cellSpacing="0">
          <tbody>
            {sortedIds.length === 0 ? (
              <tr>
                <td colSpan={totalColumns}>No player profiles available.</td>
              </tr>
            ) : (
              sortedIds.map(id => (
                <React.Fragment key={id}>
                  {/* Main Data Row */}
                  <tr>
                    <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link to={`/rating-history/${id}`}>
                        {profiles[id].firstName} {profiles[id].lastName}
                      </Link>
                      {profiles[id].picture && (
                        <img src={profiles[id].picture} alt="Profile" width="50" style={{ marginLeft: '8px' }} />
                      )}
                    </td>
                    {attributes.map(attr => {
                      const value = getDisplayedValue(id, attr);
                      return (
                        <td key={attr}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Slider
                            orientation="vertical"
                            value={getDisplayedValue(id, attr)} // ✅ Read from updated state
                            onChange={(e, newValue) => handleSliderChange(id, attr, newValue)}
                            valueLabelDisplay="auto"
                            aria-label={attr}
                            min={0}
                            max={100}
                            sx={{ height: 150 }}
                            disabled={selectedCoach === "academy"} // Prevent moving in academy view
/>

                            <div>{value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              {attributeHeadings[attr]}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td style={{ fontWeight: 'bold' }}>{getTotalRating(id)}</td>
                  </tr>
                  {/* Comment Row */}
                  <tr>
                    <td colSpan={totalColumns} style={{ textAlign: 'left', padding: '8px' }}>
                      <textarea
                        rows="4"
                        style={{ width: '100%', padding: '8px' }}
                        placeholder="Enter your comments..."
                        value={comments[id] || ""}
                        onChange={(e) => handleCommentChange(id, e.target.value)}
                        disabled={selectedCoach === "academy"}
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProfileRankingPage;
