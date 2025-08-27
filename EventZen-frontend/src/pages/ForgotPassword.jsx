import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../styles/main pages/ForgotPassword.css";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Old password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      formData.oldPassword &&
      formData.newPassword &&
      formData.oldPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from old password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Password reset successfully!");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  // const handleBack = () => {
  //   alert("Navigating back to login page");
  // };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        {/* Left Side */}
        <div className="forgot-left">
          <img
            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80"
            alt="Concert"
            className="forgot-image"
          />
          <h2>Reset Password</h2>
          <p>
            Secure your account with a new password and continue your journey.
          </p>
        </div>

        {/* Right Side */}
        <div className="forgot-right">
          <h1>Change Password</h1>
          <p>Enter your current password and choose a new one</p>

          {/* Old Password */}
          <div className="input-group">
            <input
              type={showPasswords.old ? "text" : "password"}
              name="oldPassword"
              placeholder="Enter your old password"
              value={formData.oldPassword}
              onChange={handleInputChange}
              className={errors.oldPassword ? "error" : ""}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => togglePasswordVisibility("old")}
            >
              {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.oldPassword && (
              <span className="error-text">{errors.oldPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div className="input-group">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChange={handleInputChange}
              className={errors.newPassword ? "error" : ""}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => togglePasswordVisibility("new")}
            >
              {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.newPassword && (
              <span className="error-text">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? "error" : ""}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Buttons */}
          <button className="forgot-reset-btn" onClick={handleResetPassword}>
            Reset Password
          </button>
          <Link to={"/login"}>
            <button className="forgot-back-btn" >
              {/* onClick={handleBack} */}
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
