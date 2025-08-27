import React, { useState } from "react";

export default function ProfileCard() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    location: "Mumbai",
    avatar: "https://source.unsplash.com/100x100/?face",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <section className="profile-settings">
      <h3>My Profile</h3>
      {!editing ? (
        <div className="profile-card">
          <img src={profile.avatar} alt={profile.name} />
          <p><strong>{profile.name}</strong></p>
          <p>{profile.email}</p>
          <p>{profile.location}</p>
          <button className="edit-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
          />
          <button onClick={() => setEditing(false)}>Save</button>
        </form>
      )}
    </section>
  );
}
