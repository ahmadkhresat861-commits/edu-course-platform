import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const notifications = [
  { icon: 'fas fa-book', text: 'New course available: Node.js Basics', time: '2 min ago', color: '#003366' },
  { icon: 'fas fa-star', text: 'Your profile was viewed', time: '15 min ago', color: '#f0a500' },
  { icon: 'fas fa-check-circle', text: 'You completed HTML & CSS!', time: '1 hour ago', color: '#10b981' },
  { icon: 'fas fa-bell', text: 'Welcome to Zephyr Academy!', time: '1 day ago', color: '#6366f1' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [unread, setUnread] = useState(3);

  const handleNotif = () => {
    setShowNotif(!showNotif);
    if (!showNotif) setUnread(0);
  };

  return (
    <nav style={{ position: 'relative' }}>
      <h2 onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
        <i className="fas fa-graduation-cap" style={{ color: '#f0a500', marginRight: '8px' }}></i>
        Zephyr Academy
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <a onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}><i className="fas fa-home"></i> Home</a>
        <a onClick={() => navigate('/courses')} style={{ cursor: 'pointer' }}><i className="fas fa-book"></i> Courses</a>
        <a onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}><i className="fas fa-chart-bar"></i> Dashboard</a>
        <a onClick={() => navigate('/contact')} style={{ cursor: 'pointer' }}><i className="fas fa-headset"></i> Contact</a>
        <a onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}><i className="fas fa-user"></i> Profile</a>

        {/* Notification Bell */}
        <div style={{ position: 'relative', marginLeft: '10px' }}>
          <div onClick={handleNotif} style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <i className="fas fa-bell" style={{ fontSize: '1.1rem', color: 'white' }}></i>
            {unread > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ff4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                {unread}
              </span>
            )}
          </div>

          {/* Dropdown */}
          {showNotif && (
            <div style={{ position: 'absolute', top: '50px', right: '0', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', width: '320px', zIndex: 1000, overflow: 'hidden' }}>
              <div style={{ padding: '15px 20px', background: '#003366', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}><i className="fas fa-bell"></i> Notifications</h3>
                <span style={{ fontSize: '0.8rem', color: '#a8c8f0' }}>Mark all read</span>
              </div>
              {notifications.map((notif, i) => (
                <div key={i} style={{ padding: '15px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f9f9f9'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: `${notif.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={notif.icon} style={{ color: notif.color, fontSize: '0.9rem' }}></i>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', fontWeight: '500' }}>{notif.text}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#888' }}>{notif.time}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', color: '#003366', fontWeight: '600', fontSize: '0.9rem' }}>
                View All Notifications
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;