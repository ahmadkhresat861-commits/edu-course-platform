import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Home = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);
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
      <section style={{ background: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ color: '#003366', fontSize: '2.5rem' }}>500+</h2>
            <p style={{ color: '#555' }}><i className="fas fa-users"></i> Students</p>
          </div>
          <div>
            <h2 style={{ color: '#003366', fontSize: '2.5rem' }}>20+</h2>
            <p style={{ color: '#555' }}><i className="fas fa-book"></i> Courses</p>
          </div>
          <div>
            <h2 style={{ color: '#003366', fontSize: '2.5rem' }}>10+</h2>
            <p style={{ color: '#555' }}><i className="fas fa-chalkboard-teacher"></i> Instructors</p>
          </div>
          <div>
            <h2 style={{ color: '#003366', fontSize: '2.5rem' }}>95%</h2>
            <p style={{ color: '#555' }}><i className="fas fa-star"></i> Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section style={{ background: '#f5f5f5', padding: '80px 40px', textAlign: 'center' }}>
        <h1 style={{ color: '#003366', marginBottom: '50px' }}>Why Zephyr Academy?</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          {[
            { icon: 'fas fa-laptop', title: 'Learn Online', desc: 'Study anytime, anywhere at your own pace' },
            { icon: 'fas fa-certificate', title: 'Get Certified', desc: 'Earn certificates recognized by top companies' },
            { icon: 'fas fa-headset', title: '24/7 Support', desc: 'Our team is always here to help you succeed' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'white', padding: '40px 30px', borderRadius: '12px', width: '250px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: '4px solid #f0a500' }}>
              <i className={item.icon} style={{ fontSize: '2.5rem', color: '#003366', marginBottom: '15px', display: 'block' }}></i>
              <h3 style={{ color: '#003366', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: '#555', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;