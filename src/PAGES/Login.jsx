import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => { setFadeIn(true); }, []);

  const handleLogin = () => {
    if (username && password) {
      navigate('/home');
    }
  };

  return (
    <div id="login" style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 1s' }}>
      <div className="login-logo">
        <i className="fas fa-graduation-cap"></i>
      </div>
      <h1>Zephyr Academy</h1>
      <p className="login-tagline">Learn. Grow. Succeed.</p>
      <h2>Welcome Back</h2>
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>
        <i className="fas fa-sign-in-alt"></i> Login
      </button>
      <p className="login-signup">Don't have an account? <a href="#">Sign Up</a></p>
    </div>
  );
};

export default Login;