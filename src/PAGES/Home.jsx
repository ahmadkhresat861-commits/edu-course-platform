import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import '../App.css';

const Home = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);
  const { darkMode } = useLang();
  
  useEffect(() => { setFadeIn(true); }, []);

  return (
    <div style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 1s' }}>
      {/* Hero */}
      <section id="home">
        <h1><i className="fas fa-graduation-cap"></i> Welcome to Zephyr Academy</h1>
        <p>Jordan's premier online learning platform. Learn from expert instructors and grow your career.</p>
        <button onClick={() => navigate('/courses')}>
          <i className="fas fa-rocket"></i> Start Learning
        </button>
      </section>

      {/* Stats */}
      <section style={{ background: darkMode ? '#1a1a2e' : 'white', padding: '60px 20px', textAlign: 'center', transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          {[
            { value: '500+', label: 'Students', icon: 'fas fa-users' },
            { value: '20+', label: 'Courses', icon: 'fas fa-book' },
            { value: '10+', label: 'Instructors', icon: 'fas fa-chalkboard-teacher' },
            { value: '95%', label: 'Satisfaction', icon: 'fas fa-star' },
          ].map((stat, i) => (
            <div key={i}>
              <h2 style={{ color: '#f0a500', fontSize: '2.5rem' }}>{stat.value}</h2>
              <p style={{ color: darkMode ? '#a8c8f0' : '#555' }}><i className={stat.icon}></i> {stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section style={{ background: darkMode ? '#0f0f0f' : '#f5f5f5', padding: '80px 40px', textAlign: 'center', transition: 'all 0.3s' }}>
        <h1 style={{ color: darkMode ? 'white' : '#003366', marginBottom: '50px' }}>Why Zephyr Academy?</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          {[
            { icon: 'fas fa-laptop', title: 'Learn Online', desc: 'Study anytime, anywhere at your own pace' },
            { icon: 'fas fa-certificate', title: 'Get Certified', desc: 'Earn certificates recognized by top companies' },
            { icon: 'fas fa-headset', title: '24/7 Support', desc: 'Our team is always here to help you succeed' },
          ].map((item, i) => (
            <div key={i} style={{ background: darkMode ? '#1a1a2e' : 'white', padding: '40px 30px', borderRadius: '12px', width: '250px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: '4px solid #f0a500', transition: 'all 0.3s' }}>
              <i className={item.icon} style={{ fontSize: '2.5rem', color: '#f0a500', marginBottom: '15px', display: 'block' }}></i>
              <h3 style={{ color: darkMode ? 'white' : '#003366', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: darkMode ? '#a8c8f0' : '#555', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;