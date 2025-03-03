import React, { useState, useEffect, useRef } from 'react';
import Slider from '@mui/material/Slider';
import './App.css';

const serverAddress = 'http://localhost:5001';

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
const prettifyAttribute = (attr) => {
  return attr.replace(/([A-Z])/g, ' $1').trim();
};
// Mapping attribute keys to header image paths
const attributeDisplayNames = {
  Footwork: "Foot Work",
  ForehandDrive: "Forehand Drive",
  BackhandDrive: "Backhand Drive",
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
  PlayAwayFromTheTable: "Play Away From The Table",
  ServingTechnics: "Serving Technics",
  ReceivingTechnics: "Receiving Technics",
  Chopblock: "Chopblock",
  Chopping: "Chopping"
};

{attributes.map(attr => (
  <th key={attr} style={{ width: `${70 / attributes.length}%` }}>
    {attributeDisplayNames[attr] || prettifyAttribute(attr)}
  </th>
))}

function ProfileRankingPage() {
  // Profiles stored as an object keyed by profile id.
  const [profiles, setProfiles] = useState({});
  // Ranking values per profile.
  const [rankingValues, setRankingValues] = useState({});
  // Comments per profile (plain text).
  const [comments, setComments] = useState({});

  // Refs for debouncing auto-updates.
  const autoUpdateTimers = useRef({});
  const rankingValuesRef = useRef(rankingValues);
  const commentsRef = useRef(comments);

  useEffect(() => {
    rankingValuesRef.current = rankingValues;
  }, [rankingValues]);
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // Fetch profiles from backend on mount.
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${serverAddress}/api/playerProfiles`);
        const data = await response.json();
        const profilesObj = {};
        const initialRankings = {};
        const initialComments = {};
        data.forEach(profile => {
          const id = profile._id || profile.id;
          profilesObj[id] = profile;
          initialRankings[id] = {};
          attributes.forEach(attr => {
            initialRankings[id][attr] = (profile.rankings && profile.rankings[attr]) || 0;
          });
          initialComments[id] = profile.comments || "";
        });
        setProfiles(profilesObj);
        setRankingValues(initialRankings);
        setComments(initialComments);
      } catch (error) {
        console.error("Error fetching player profiles:", error);
      }
    };
    fetchProfiles();
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
      const response = await fetch(`${serverAddress}/api/playerProfiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile)
      });
      const savedProfile = await response.json();
      const id = savedProfile._id || savedProfile.id;
      setProfiles(prev => ({ ...prev, [id]: savedProfile }));
      setRankingValues(prev => ({
        ...prev,
        [id]: attributes.reduce((acc, attr) => { acc[attr] = 0; return acc; }, {})
      }));
      setComments(prev => ({ ...prev, [id]: "" }));
      setNewFirstName("");
      setNewLastName("");
      setNewPhone("");
      setNewEmail("");
      setNewPicturePreview("");
    } catch (error) {
      console.error("Error adding player profile:", error);
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewPicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Auto-update function: updates both rankings and comments.
  const updateProfileForStudent = async (profileId) => {
    const payload = {
      rankings: rankingValuesRef.current[profileId],
      comments: commentsRef.current[profileId]
    };
    try {
      const response = await fetch(`${serverAddress}/api/playerProfiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const updatedProfile = await response.json();
      console.log("Profile updated:", updatedProfile);
      setProfiles(prev => ({ ...prev, [profileId]: updatedProfile }));
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Debounced slider change handler.
  const handleSliderChange = (profileId, attr, newValue) => {
    setRankingValues(prev => ({
      ...prev,
      [profileId]: {
        ...prev[profileId],
        [attr]: newValue
      }
    }));
    if (autoUpdateTimers.current[profileId]) {
      clearTimeout(autoUpdateTimers.current[profileId]);
    }
    autoUpdateTimers.current[profileId] = setTimeout(() => {
      updateProfileForStudent(profileId);
    }, 500);
  };

  // Debounced comment change handler.
  const handleCommentChange = (profileId, value) => {
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

  // Helper to compute total rating.
  const getTotalRating = (profileId) => {
    if (!rankingValues[profileId]) return 0;
    return Object.values(rankingValues[profileId]).reduce((sum, val) => sum + val, 0);
  };

  return (
    <div className="container" style={{ padding: '16px' }}>
      <h1>Player Profile Ranking</h1>
      <table style={{ width: '100%', tableLayout: 'auto', textAlign: 'center', borderCollapse: 'collapse' }} border="1" cellPadding="8" cellSpacing="0">
        <thead>
        <tr>
      <th style={{ width: '10%' }}>Player Name</th>
      {attributes.map(attr => (
        
        <th key={attr} style={{ width: `${60 / attributes.length}%` }}> {attributeDisplayNames[attr] || prettifyAttribute(attr)}</th>
      ))}
      <th style={{ width: '10%' }}>Total Rating</th>
     <th style={{ width: '20%' }}>Comments</th>
    </tr>
          {/* New Player Form Row */}
          <tr>
            <td colSpan={attributes.length + 3}>
              <form onSubmit={handleAddProfile} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                <input type="text" placeholder="First Name" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} required />
                <input type="text" placeholder="Last Name" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} required />
                <input type="text" placeholder="Phone (optional)" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                <input type="email" placeholder="Email (optional)" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                <input type="file" accept="image/*" onChange={handlePictureChange} />
                <button type="submit">Add Player</button>
              </form>
            </td>
          </tr>
        </thead>
        <tbody>
          {Object.keys(profiles).length === 0 ? (
            <tr>
              <td colSpan={attributes.length + 3}>No player profiles available.</td>
            </tr>
          ) : (
            Object.keys(profiles).map(id => (
              <tr key={id}>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profiles[id].firstName} {profiles[id].lastName}
                  {profiles[id].picture && <img src={profiles[id].picture} alt="Profile" width="50" style={{ marginLeft: '8px' }} />}
                </td>
                {attributes.map(attr => {
                  const value = rankingValues[id] ? rankingValues[id][attr] : 0;
                  return (
                    <td key={attr}>
  <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Slider
      orientation="vertical"
      value={value}
      onChange={(e, newValue) => handleSliderChange(id, attr, newValue)}
      valueLabelDisplay="auto"
      aria-label={attr}
      min={0}
      max={100}
      sx={{ height: 150 }}
    />
  </div>
  <div>{value}</div>
</td>

                  );
                })}
                <td style={{ fontWeight: 'bold' }}>{getTotalRating(id)}</td>
                <td style={{ textAlign: 'left' }}>
                  <textarea
                    rows="8"
                    style={{ width: '100%', padding: '8px' }}
                    placeholder="Enter your comments..."
                    value={comments[id] || ""}
                    onChange={(e) => handleCommentChange(id, e.target.value)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProfileRankingPage;
