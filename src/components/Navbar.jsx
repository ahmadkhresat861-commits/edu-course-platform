import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../App.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        setNotifications(data);
        setUnread(data.length);
      }
    };
    fetchNotifications();
  }, []);

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
        <a onClick={() => navigate('/sessions')} style={{ cursor: 'pointer' }}><i className="fas fa-video"></i> Sessions</a>
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
                <span style={{ fontSize: '0.8rem', color: '#a8c8f0' }}>{notifications.length} messages</span>
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                  <i className="fas fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif, i) => (
                  <div key={i} style={{ padding: '15px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#003366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fas fa-bell" style={{ color: '#f0a500', fontSize: '0.9rem' }}></i>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', fontWeight: '600' }}>{notif.title}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#555' }}>{notif.message}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#888' }}>
                          {new Date(notif.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;