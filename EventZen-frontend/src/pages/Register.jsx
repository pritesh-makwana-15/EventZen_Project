// src/pages/Register.jsx
import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  Upload,
} from "lucide-react";
import "../styles/main pages/Register.css"

export default function Register() {
  const [formData, setFormData] = useState({
    profileImage: null,
    userName: "",
    mobileNumber: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register Data:", formData);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* ===== Left Section (Image + Overlay) ===== */}
        <div className="register-left">
          <img
            src="./src/assets/hero-img.jpg"
            alt="Register Illustration"
            className="register-left-img"
          />
          <h1 className="welcome-title">Join EventZen</h1>
          <p className="welcome-text">
            Create an account to explore, host, and register for amazing events.
          </p>
        </div>


        {/* ===== Right Section (Form) ===== */}
        <div className="register-right">
          <form className="form-box" onSubmit={handleSubmit}>
            <h2 className="form-title">Create Account</h2>

            {/* Profile Image Upload */}
            <div className="form-group image-upload">
              <label htmlFor="profileImage" className="upload-label">
                <Upload size={18} />
                {formData.profileImage ? "Change Image" : "Upload Profile Image"}
              </label>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              {formData.profileImage && (
                <div className="image-preview">
                  <img
                    src={formData.profileImage}
                    alt="Profile Preview"
                  />
                </div>
              )}
            </div>

            {/* Username */}
            <div className="form-group icon-input">
              <User className="input-icon" size={18} />
              <input
                type="text"
                placeholder="Username"
                value={formData.userName}
                onChange={(e) =>
                  handleInputChange("userName", e.target.value)
                }
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="form-group icon-input">
              <Phone className="input-icon" size={18} />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value)
                }
                required
              />
            </div>

            {/* Email */}
            <div className="form-group icon-input">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.emailAddress}
                onChange={(e) =>
                  handleInputChange("emailAddress", e.target.value)
                }
                required
              />
            </div>

            {/* Password */}
            <div className="form-group icon-input">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={(e) =>
                  handleInputChange("password", e.target.value)
                }
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group icon-input">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                required
              />
            </div>

            {/* Create Account Button */}
            <button type="submit" className="btn-create">
              Create Account
            </button>

            {/* Login Redirect */}
            <p className="login-text">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
