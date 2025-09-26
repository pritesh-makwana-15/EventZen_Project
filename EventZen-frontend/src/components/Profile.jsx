// src/components/Profile.jsx
import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/main pages/profile.css";

export default function Profile({ onCancel, onSuccess }) {
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    role: "",
    mobileNumber: "",
    imageUrl: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/users/profile");
      setProfile(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => ({ ...prev, imageUrl: response.data.url }));
      setError("");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.response?.data?.error || "Failed to upload image");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");

      const profileData = {
        name: profile.name,
        mobileNumber: profile.mobileNumber,
        profileImage: profile.imageUrl
      };

      const response = await API.put("/users/profile", profileData);
      setProfile(response.data);
      setIsEditing(false);
      onSuccess("Profile updated successfully!");
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.id) {
    return <div className="loading">Loading profile...</div>;
  }
console.log(profile.imageUrl);
  return (
    <div className="profile-settings">
      <h3>My Profile</h3>
      
      {error && <div className="alert error">{error}</div>}

      {!isEditing ? (
        // View Profile Mode
        <div className="profile-card">
          <div className="profile-avatar">
            <img 
              src={profile.imageUrl || "/src/assets/EZ-logo1.png"} 
              // src={"/src/assets/EZ-logo1.png"} 
              alt="Profile" 
            />
          </div>
          <div className="profile-info">
            <h4>{profile.name}</h4>
            <p>{profile.email}</p>
            <span className="role-tag">{profile.role}</span>
            <div className="profile-meta">
              <p><strong>Mobile:</strong> {profile.mobileNumber || "Not provided"}</p>
            </div>
          </div>
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        // Edit Profile Mode
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Profile Image</label>
            <div className="image-upload-section">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  handleImageUpload(file);
                }}
                className="file-input"
              />
              {profile.imageUrl && (
                <div className="image-preview profile-preview">
                  <img src={profile.imageUrl} alt="Profile preview" />
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email (Cannot be changed)</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="disabled-input"
            />
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="disabled-input"
            />
          </div>
          
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobileNumber"
              value={profile.mobileNumber || ""}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setError("");
                fetchProfile(); // Reset any changes
                onCancel();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}