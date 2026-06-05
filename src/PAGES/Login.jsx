import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../App.css';

const Login = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setFadeIn(true); }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/home');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setError('Check your email to confirm your account!');
    }
    setLoading(false);
  };

  return (
    <div id="login" style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 1s' }}>
      <div className="login-logo">
        <i className="fas fa-graduation-cap"></i>
      </div>
      <h1>Zephyr Academy</h1>
      <p className="login-tagline">Learn. Grow. Succeed.</p>
      <h2>Welcome Back</h2>
      {error && <p style={{ color: error.includes('Check') ? '#f0a500' : '#ff4444', marginBottom: '15px' }}>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin} disabled={loading}>
        <i className="fas fa-sign-in-alt"></i> {loading ? 'Loading...' : 'Login'}
      </button>
      <p className="login-signup">
        Don't have an account? <a onClick={handleSignUp} style={{ cursor: 'pointer' }}>Sign Up</a>
      </p>
    </div>
  );
};

export default Login;