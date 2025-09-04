// src/pages/Login.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../styles/main pages/login.css";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });

      if (res.role?.name === "VISITOR") {
        navigate("/visitor");
      } else if (res.role?.name === "ORGANIZER") {
        navigate("/organizer");
      } else if (res.role?.name === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left */}
        <div className="login-left">
          <img src="./src/assets/hero-img.jpg" alt="Login Illustration" className="login-left-img" />
          <h1 className="welcome-title">Welcome Back</h1>
          <p className="welcome-text">Sign in to continue your journey and access your account.</p>
        </div>

        {/* Right */}
        <div className="login-right">
          <div className="form-box">
            <h2 className="form-title">Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />

              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-btn"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button type="submit" className="login-form-btn">Login</button>
              {error && <p className="error-msg">{error}</p>}

              <Link to={"/"}>
                <button type="button" className="login-form-back-btn">Back</button>
              </Link>
            </form>

            <div className="forgot-box">
              <Link to={"/forgotpassword"}>
                <button type="button" className="forgot-btn">Forgot Password?</button>
              </Link>
            </div>

            <div className="signup-box">
              <span>Don't have an account? </span>
              <Link to={"/register"}><button className="login-form-signup-btn">Sign up</button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
