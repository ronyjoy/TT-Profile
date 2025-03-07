import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Slider from '@mui/material/Slider';
import Header from './components/Header';
import './App.css';

const serverAddress = 'http://localhost:5001';

// Attribute keys used in your state and schema.
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

// Mapping attribute keys to the display text for headers.
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
  // Profiles stored as an object keyed by id.
  const [profiles, setProfiles] = useState({});
  // Ranking values per profile.
  const [rankingValues, setRankingValues] = useState({});
  // Comments per profile (plain text).
  const [comments, setComments] = useState({});
  // State to control reordering.
  const [sortByTotal, setSortByTotal] = useState(false);

  // Refs for debouncing updates.
  const autoUpdateTimers = useRef({});
  const rankingValuesRef = useRef(rankingValues);
  const commentsRef = useRef(comments);

  useEffect(() => {
    rankingValuesRef.current = rankingValues;
  }, [rankingValues]);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // Fetch profiles from the backend on mount.
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

  // Update profile with both rankings and comments.
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

  // Determine the order of profiles.
  const profileIds = Object.keys(profiles);
  const sortedIds = sortByTotal
    ? [...profileIds].sort((a, b) => getTotalRating(b) - getTotalRating(a))
    : profileIds;

  // Total columns in the main data row (Player Name + attribute columns + Total Rating).
  const totalColumns = 1 + attributes.length + 1;

  return (
    <div className="container" style={{ padding: '16px' }}>
      {/* Frozen Header Component with column headings */}
      <Header
        sortByTotal={sortByTotal}
        toggleSort={() => setSortByTotal(!sortByTotal)}
        attributeHeadings={attributeHeadings}
      />

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
                      const value = rankingValues[id] ? rankingValues[id][attr] : 0;
                      return (
                        <td key={attr}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                            <div>{value}</div>
                            {/* Add the attribute heading at the slider bottom */}
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
