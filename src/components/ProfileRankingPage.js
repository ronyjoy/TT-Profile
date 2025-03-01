import React, { useState, useEffect, useRef } from 'react';
// import rich text editor styles
import '../App.css'; // if you have custom styles

// Use the correct backend port.
const serverAddress = 'http://localhost:5001';

// Define the ranking attributes (keys must match your schema exactly).
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

function ProfileRankingPage() {
  // Local state for profiles and their ranking values.
  const [profiles, setProfiles] = useState({});
  const [rankingValues, setRankingValues] = useState({});
  const [comments, setComments] = useState({});

  // Refs to store the latest values for debouncing updates.
  const rankingValuesRef = useRef(rankingValues);
  const commentsRef = useRef(comments);
  const autoUpdateTimers = useRef({});

  // Update refs when state changes.
  useEffect(() => {
    rankingValuesRef.current = rankingValues;
  }, [rankingValues]);
  
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  // Fetch existing player profiles on mount.
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${serverAddress}/api/playerProfiles`);
        const data = await response.json();
        // Convert array to object keyed by id for easier state management.
        const profilesObj = {};
        const initialRankings = {};
        const initialComments = {};
        data.forEach(profile => {
          const id = profile._id || profile.id;
          profilesObj[id] = profile;
          // Initialize rankings: use profile.rankings if it exists, otherwise zeros.
          initialRankings[id] = {};
          attributes.forEach(attr => {
            initialRankings[id][attr] = (profile.rankings && profile.rankings[attr]) || 0;
          });
          // Initialize comments.
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

  // Handler for adding a new player.
  const handleAddProfile = async (e) => {
    e.preventDefault();
    // Build new profile with minimal required fields.
    const newProfile = {
      profileType: "Student",
      firstName: newFirstName,
      lastName: newLastName,
      phone: newPhone,         // Optional
      email: newEmail,         // Optional
      picture: newPicturePreview
      // Your backend should default rankings to zeros and comments to empty.
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
      // Clear form fields.
      setNewFirstName("");
      setNewLastName("");
      setNewPhone("");
      setNewEmail("");
      setNewPicturePreview("");
    } catch (error) {
      console.error("Error adding player profile:", error);
    }
  };

  // Rich text for picture preview is handled similarly.
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewPicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Unified update function: updates both rankings and comments.
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
      // Optionally update local profiles state.
      setProfiles(prev => ({ ...prev, [profileId]: updatedProfile }));
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Debounced slider change handler.
  const handleSliderChange = (profileId, attr, value) => {
    setRankingValues(prev => ({
      ...prev,
      [profileId]: {
        ...prev[profileId],
        [attr]: parseInt(value, 10)
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

  // Local state for new player form fields.
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPicturePreview, setNewPicturePreview] = useState("");

  // Custom slider styling for vertical slider remains the same.
  const getSliderColor = (value) => {
    if (value < 33) return 'green';
    else if (value < 66) return 'orange';
    else return 'red';
  };

  const getVerticalSliderStyle = (value) => {
    const color = getSliderColor(value);
    return {
      WebkitAppearance: 'none',
      appearance: 'none',
      width: '150px',  // track length
      height: '20px',  // fixed track thickness
      transform: 'rotate(-90deg)',
      background: `linear-gradient(90deg, ${color} ${value}%, #ddd ${value}%)`,
      outline: 'none'
    };
  };

  return (
    <div className="container" style={{ padding: '16px' }}>
      <h1>Player Profile Ranking</h1>
      <table style={{ width: '100%', tableLayout: 'fixed', textAlign: 'center', borderCollapse: 'collapse' }} border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th style={{ width: '10%' }}>Player Name</th>
            {attributes.map(attr => (
              <th key={attr} style={{ width: `${70 / attributes.length}%` }}>{attr}</th>
            ))}
            <th style={{ width: '20%' }}>Comments</th>
          </tr>
          {/* New Player Form Row */}
          <tr>
            <td colSpan={attributes.length + 1}>
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
              <td colSpan={attributes.length + 1}>No player profiles available.</td>
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ height: '150px', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) => handleSliderChange(id, attr, e.target.value)}
                            style={getVerticalSliderStyle(value)}
                          />
                        </div>
                        <div>{value}</div>
                      </div>
                    </td>
                  );
                })}
                <td style={{ textAlign: 'left' }}>
                <textarea
  rows="10"
  style={{ width: '100%', padding: '8px' }}
  placeholder="Enter your comments here..."
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
