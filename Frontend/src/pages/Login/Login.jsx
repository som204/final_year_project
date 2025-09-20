import React, { useState } from 'react';
import { BookOpenCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.example.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials.');
      }
      console.log('Login successful!', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        {/* Branding Section */}
        <div className="login-branding">
          <a href="/" className="logo">
            <BookOpenCheck className="logo-icon" />
            Reportify
          </a>
          <p className="branding-quote">
            Transforming Data into Insight.
          </p>
        </div>

        {/* Form Section */}
        <div className="login-form-section">
          <h2>Welcome Back</h2>
          <p className="form-intro">
            Log in to access your institution's portal.
          </p>
          <form onSubmit={handleLogin}>

            {/* Email Input Group */}
            <div className="input-group">
              {/* FIXED: Re-added the Mail icon */}
              <Mail className="input-icon" size={20} />
              <label htmlFor="email" className="sr-only">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            {/* Password Input Group */}
            <div className="input-group">
              {/* FIXED: Re-added the Lock icon */}
              <Lock className="input-icon" size={20} />
              <label htmlFor="password" className="sr-only">Password</label>
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="form-actions">
              <a href="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </a>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button 
              type="submit" 
              className="button button-accent login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
          <div className="signup-prompt">
            <p>
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;