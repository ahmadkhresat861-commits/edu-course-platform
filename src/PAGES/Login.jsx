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
    if (error) { setError(error.message); } 
    else { navigate('/home'); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a2e 0%, #003366 40%, #005599 70%, #0077b6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 1s',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background circles */}
      {[
        { size: 300, top: '-100px', left: '-100px', color: 'rgba(240,165,0,0.15)' },
        { size: 400, bottom: '-150px', right: '-150px', color: 'rgba(0,119,182,0.2)' },
        { size: 200, top: '50%', left: '30%', color: 'rgba(255,255,255,0.05)' },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: c.size, height: c.size,
          borderRadius: '50%', background: c.color,
          top: c.top, bottom: c.bottom, left: c.left, right: c.right,
          filter: 'blur(40px)'
        }} />
      ))}

      {/* Glass Card */}
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '24px',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        zIndex: 1,
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '25px' }}>
          <i className="fas fa-graduation-cap" style={{ fontSize: '3.5rem', color: '#f0a500' }}></i>
        </div>
        <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '5px' }}>Zephyr Academy</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '30px' }}>
          Learn. Grow. Succeed.
        </p>

        {error && <p style={{ color: '#ff6b6b', marginBottom: '15px', fontSize: '0.9rem', background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: '8px' }}>{error}</p>}

        {/* Inputs */}
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
            <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#f0a500' }}></i> Email
          </label>
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(10px)' }} />
        </div>

        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>
            <i className="fas fa-lock" style={{ marginRight: '6px', color: '#f0a500' }}></i> Password
          </label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', outline: 'none', backdropFilter: 'blur(10px)' }} />
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'linear-gradient(90deg, #f0a500, #f7c948)', color: '#003366', fontWeight: '700', fontSize: '1rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s', marginBottom: '20px', boxShadow: '0 8px 20px rgba(240,165,0,0.3)' }}>
          <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
          {loading ? 'Loading...' : 'Login'}
        </button>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <a onClick={() => navigate('/signup')} style={{ color: '#f0a500', cursor: 'pointer', fontWeight: '600', textDecoration: 'none' }}>Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;