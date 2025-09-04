// src/pages/Register.jsx
import React, { useState } from "react";
import { User, Mail, Lock, Phone, Upload } from "lucide-react";
import "../styles/main pages/Register.css";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    profileImage: null,
    userName: "",
    mobileNumber: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const payload = {
      name: formData.userName,
      mobileNumber: formData.mobileNumber,
      email: formData.emailAddress,
      password: formData.password,
      profileImage: formData.profileImage,
      role: "VISITOR", // default role
    };

    try {
      setLoading(true);
      const response = await API.post("/auth/register", payload);

      // Save token & role (if backend returns auto-login token)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role || "VISITOR");
      }

      alert("Registration successful!");
      // Redirect to login page
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Section */}
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

        {/* Right Section */}
        <div className="register-right">
          <form className="form-box" onSubmit={handleSubmit}>
            <h2 className="form-title">Create Account</h2>

            {error && <p className="error-text">{error}</p>}

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
                  <img src={formData.profileImage} alt="Profile Preview" />
                </div>
              )}
            </div>

            <div className="form-group icon-input">
              <User className="input-icon" size={18} />
              <input
                type="text"
                placeholder="Username"
                value={formData.userName}
                onChange={(e) => handleInputChange("userName", e.target.value)}
                required
              />
            </div>

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

            <div className="form-group icon-input">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

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

            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? "Registering..." : "Create Account"}
            </button>

            <p className="login-text">
              Already have an account? <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
