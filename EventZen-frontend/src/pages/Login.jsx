import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../styles/main pages/login.css"
import { Link } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login attempted with:", { email, password });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* ===== Left Side Section ===== */}
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

        {/* ===== Right Side - Login Form ===== */}
        <div className="login-right">
          <div className="form-box">
            <h2 className="form-title">Login</h2>

            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />

              {/* Password Input */}
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

              {/* Login Button */}
              <button type="submit" className="login-form-btn">
                Login
              </button>

              {/* Back Button */}
              <Link to={"/"}>
                <button type="button" className="login-form-back-btn">
                  Back
                </button>
              </Link>
            </form>

            {/* Forgot Password */}
            <div className="forgot-box">
              <Link to={"/forgotpassword"}>
                <button type="button" className="forgot-btn">
                  Forgot Password?
                </button>
              </Link>
            </div>

            {/* Sign Up Link */}
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
