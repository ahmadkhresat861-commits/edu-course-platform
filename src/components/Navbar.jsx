import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav>
      <h2 onClick={() => navigate('/home')}>
        <i className="fas fa-graduation-cap"></i> Zephyr Academy
      </h2>
      <div>
        <a onClick={() => navigate('/home')}><i className="fas fa-home"></i> Home</a>
        <a onClick={() => navigate('/courses')}><i className="fas fa-book"></i> Courses</a>
        <a onClick={() => navigate('/dashboard')}><i className="fas fa-chart-bar"></i> Dashboard</a>
        <a onClick={() => navigate('/contact')}><i className="fas fa-headset"></i> Contact</a>
        <a onClick={() => navigate('/profile')}><i className="fas fa-user"></i> Profile</a>
      </div>
    </nav>
  );
};

export default Navbar;