import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../App.css';

const SignUp = () => {
  const [fadeIn, setFadeIn] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleSignUp = async () => {
    // =========================
    // Validation
    // =========================

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters!'
      );
      return;
    }

    // =========================
    // Start Loading
    // =========================

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // =========================
      // Sign Up User
      // =========================

      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.user) {
        throw new Error(
          'Failed to create account.'
        );
      }

      // =========================
      // Send OTP
      // =========================
      // This sends a new OTP code
      // to the user's email.

      const {
        error: otpError,
      } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        throw otpError;
      }

      // =========================
      // Save Email Temporarily
      // =========================

      sessionStorage.setItem(
        'zephyr_otp_email',
        cleanEmail
      );

      // =========================
      // Success
      // =========================

      setSuccess(
        'Account created! A verification code has been sent to your email.'
      );

      // =========================
      // Go To OTP Page
      // =========================

      setTimeout(() => {
        navigate('/verify-otp');
      }, 800);

    } catch (error) {
      console.error(
        'Sign up error:',
        error
      );

      setError(
        error.message ||
          'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="login"
      style={{
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 1s',
      }}
    >
      {/* =========================
          Logo
      ========================= */}

      <div className="login-logo">
        <i className="fas fa-user-plus"></i>
      </div>

      {/* =========================
          Title
      ========================= */}

      <h1>Zephyr Academy</h1>

      <p className="login-tagline">
        Start Your Journey Today
      </p>

      <h2>Create Account</h2>

      {/* =========================
          Error Message
      ========================= */}

      {error && (
        <p
          style={{
            color: '#ff4444',
            marginBottom: '15px',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </p>
      )}

      {/* =========================
          Success Message
      ========================= */}

      {success && (
        <p
          style={{
            color: '#10b981',
            marginBottom: '15px',
            fontSize: '0.9rem',
          }}
        >
          {success}
        </p>
      )}

      {/* =========================
          Email
      ========================= */}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        disabled={loading}
      />

      {/* =========================
          Password
      ========================= */}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        disabled={loading}
      />

      {/* =========================
          Confirm Password
      ========================= */}

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) =>
          setConfirm(e.target.value)
        }
        disabled={loading}
      />

      {/* =========================
          Sign Up Button
      ========================= */}

      <button
        onClick={handleSignUp}
        disabled={loading}
      >
        <i
          className={
            loading
              ? 'fas fa-spinner fa-spin'
              : 'fas fa-user-plus'
          }
        ></i>{' '}
        {loading
          ? 'Creating Account...'
          : 'Sign Up'}
      </button>

      {/* =========================
          Login Link
      ========================= */}

      <p className="login-signup">
        Already have an account?{' '}
        <a
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
          }}
        >
          Login
        </a>
      </p>
    </div>
  );
};

export default SignUp;
