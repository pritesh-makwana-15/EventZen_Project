// src/pages/Login.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../styles/main pages/login.css";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });

      const { token, role } = res.data;

      // Save token & role in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // Redirect based on role
      if (role === "VISITOR") {
        navigate("/visitor/dashboard");
      } else if (role === "ORGANIZER") {
        navigate("/organizer/dashboard");
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard");
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
        <div className="login-left">
          <img
            src="./src/assets/hero-img.jpg"
            alt="Login Illustration"
            className="login-left-img"
          />
          <h1 className="welcome-title">Welcome Back</h1>
          <p className="welcome-text">
            Sign in to continue your journey and access your account.
          </p>
        </div>

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
              <Link to={"/register"}>
                <button className="login-form-signup-btn">Sign up</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
