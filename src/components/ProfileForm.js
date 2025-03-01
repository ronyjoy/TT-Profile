// ProfileForm.js
import React, { useState } from 'react';

function ProfileForm({ addProfile }) {
  const [profileType, setProfileType] = useState("Student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(null);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProfile = {
      profileType,
      firstName,
      lastName,
      phone,
      email,
      picture: preview,
    };

    try {
      const response = await fetch('http://localhost:5001/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });
      const savedProfile = await response.json();
      addProfile(savedProfile);
      // Reset form
      setProfileType("Student");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setPicture(null);
      setPreview(null);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Profile</h2>
      <div>
        <label>Profile Type: </label>
        <select value={profileType} onChange={(e) => setProfileType(e.target.value)}>
          <option value="Student">Student</option>
          <option value="Coach">Coach</option>
        </select>
      </div>
      <div>
        <label>First Name: </label>
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>
      <div>
        <label>Last Name: </label>
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <div>
        <label>Phone: </label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div>
        <label>Email: </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Picture: </label>
        <input type="file" accept="image/*" onChange={handlePictureChange} />
        {preview && <img src={preview} alt="preview" width="100" />}
      </div>
      <button type="submit">Create Profile</button>
    </form>
  );
}

export default ProfileForm;
