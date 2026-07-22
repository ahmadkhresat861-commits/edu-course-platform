import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../App.css';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

const Login = () => {
  const navigate = useNavigate();

  const [fadeIn, setFadeIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFadeIn(true);
    }, 100);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const lockout = localStorage.getItem('lockout_until');

    if (lockout && Date.now() < parseInt(lockout)) {
      const mins = Math.ceil(
        (parseInt(lockout) - Date.now()) / 60000
      );

      setError(
        `Too many attempts. Please try again in ${mins} minutes.`
      );

      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const attempts =
        parseInt(
          localStorage.getItem('login_attempts') || '0'
        ) + 1;

      localStorage.setItem(
        'login_attempts',
        attempts
      );

      if (attempts >= MAX_ATTEMPTS) {
        localStorage.setItem(
          'lockout_until',
          Date.now() + LOCKOUT_TIME
        );

        localStorage.removeItem('login_attempts');

        setError(
          'Too many failed attempts. Login locked for 15 minutes. 🔒'
        );
      } else {
        setError(
          `Invalid email or password. ${
            MAX_ATTEMPTS - attempts
          } attempts remaining.`
        );
      }
    } else {
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('lockout_until');

      navigate('/home');
    }

    setLoading(false);
  };

  return (
    <div
      className={`login-page ${
        fadeIn ? 'login-page-visible' : ''
      }`}
    >

      {/* Animated Background */}
      <div className="login-background">

        <div className="login-orb login-orb-1"></div>

        <div className="login-orb login-orb-2"></div>

        <div className="login-orb login-orb-3"></div>

        <div className="login-grid"></div>

      </div>

      {/* Login Card */}
      <div className="login-glass-card">

        {/* Logo */}
        <div className="login-logo-wrapper">
          <div className="login-logo-ring">
            <i className="fas fa-graduation-cap"></i>
          </div>
        </div>

        {/* Title */}
        <h1 className="login-title">
          Zephyr Academy
        </h1>

        <p className="login-subtitle">
          Learn. Grow. Succeed.
        </p>

        <div className="login-line"></div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            <i className="fas fa-exclamation-circle"></i>

            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="login-field">

            <label>
              <i className="fas fa-envelope"></i>
              Email Address
            </label>

            <div className="login-input-wrapper">

              <i className="fas fa-envelope login-input-icon"></i>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

            </div>

          </div>

          {/* Password */}
          <div className="login-field">

            <label>
              <i className="fas fa-lock"></i>
              Password
            </label>

            <div className="login-input-wrapper">

              <i className="fas fa-lock login-input-icon"></i>

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                <i
                  className={
                    showPassword
                      ? 'fas fa-eye-slash'
                      : 'fas fa-eye'
                  }
                ></i>
              </button>

            </div>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`login-submit ${
              loading ? 'login-loading' : ''
            }`}
            disabled={loading}
          >

            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Signing you in...
              </>
            ) : (
              <>
                <span>Login to Your Account</span>
                <i className="fas fa-arrow-right"></i>
              </>
            )}

          </button>

        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>OR</span>
        </div>

        {/* Signup */}
        <div className="login-signup-box">

          <p>
            Don't have an account?
          </p>

          <button
            onClick={() => navigate('/signup')}
            className="login-signup-button"
          >
            <span>Create New Account</span>
            <i className="fas fa-user-plus"></i>
          </button>

        </div>

        {/* Footer */}
        <div className="login-footer">

          <i className="fas fa-shield-alt"></i>

          Secure & Trusted Learning Platform

        </div>

      </div>

    </div>
  );
};

export default Login;
