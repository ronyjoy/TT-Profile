import React from 'react';

function ProfileList({ profiles }) {
  return (
    <div>
      <h2>Profiles List</h2>
      {profiles.length === 0 ? (
        <p>No profiles created yet.</p>
      ) : (
        <ul>
          {profiles.map(profile => (
            <li key={profile.id}>
              <h3>{profile.profileType}: {profile.firstName} {profile.lastName}</h3>
              <p>Phone: {profile.phone}</p>
              <p>Email: {profile.email}</p>
              {profile.picture && <img src={profile.picture} alt={`${profile.firstName}'s profile`} width="100" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProfileList;
