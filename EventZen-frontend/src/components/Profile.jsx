import React, { useState } from "react";
import "./profile.css";

const Profile = ({ activePage, profile, setProfile }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {activePage === "profile" && (
        <section className="profile-settings">
          <h3>My Profile</h3>
          {!isEditing ? (
            <div className="profile-card">
              <div className="profile-avatar">
                <img src={profile.image} alt="Profile" />
              </div>
              <div className="profile-info">
                <h4>{profile.name}</h4>
                <p>{profile.email}</p>
                <span className="role-tag">{profile.role}</span>
                <div className="profile-meta">
                  <p>
                    <strong>Password:</strong> ********
                  </p>
                </div>
              </div>
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form className="profile-form">
              <div className="form-group">
                <label>Profile Image</label>
                <input type="file" accept="image/*" />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={profile.password}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={profile.role} readOnly />
              </div>
              <button
                type="button"
                className="save-btn"
                onClick={() => setIsEditing(false)}
              >
                Save Changes
              </button>
            </form>
          )}
        </section>
      )}
    </>
  );
};

export default Profile;
