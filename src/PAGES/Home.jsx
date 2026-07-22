import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import '../App.css';

const Home = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);
  const { darkMode } = useLang();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const stats = [
    {
      value: '500+',
      label: 'Students',
      icon: 'fas fa-users',
    },
    {
      value: '20+',
      label: 'Courses',
      icon: 'fas fa-book',
    },
    {
      value: '10+',
      label: 'Instructors',
      icon: 'fas fa-chalkboard-teacher',
    },
    {
      value: '95%',
      label: 'Satisfaction',
      icon: 'fas fa-star',
    },
  ];

  const features = [
    {
      icon: 'fas fa-laptop',
      title: 'Learn Online',
      desc: 'Study anytime, anywhere at your own pace',
    },
    {
      icon: 'fas fa-certificate',
      title: 'Get Certified',
      desc: 'Earn certificates recognized by top companies',
    },
    {
      icon: 'fas fa-headset',
      title: '24/7 Support',
      desc: 'Our team is always here to help you succeed',
    },
  ];

  return (
    <div className={`home-page ${fadeIn ? 'home-visible' : ''}`}>

      {/* ===========================
          Hero Section
      =========================== */}

      <section className="home-hero">
        <div className="home-hero-content">

          <div className="home-hero-icon">
            <i
              className="fas fa-graduation-cap"
              style={{
                fontSize: '3.5rem',
                color: '#f0a500',
                marginBottom: '20px',
                display: 'inline-block',
              }}
            ></i>
          </div>

          <h1>Welcome to Zephyr Academy</h1>

          <p>
            Jordan's premier online learning platform.
            Learn from expert instructors and grow your career.
          </p>

          <button
            className="home-start-button"
            onClick={() => navigate('/courses')}
          >
            <i className="fas fa-rocket"></i>
            Start Learning
          </button>

        </div>
      </section>

      {/* ===========================
          Stats Section
      =========================== */}

      <section
        className="home-stats"
        style={{
          background: darkMode ? '#1a1a2e' : 'white',
        }}
      >
        <div className="home-stats-container">

          {stats.map((stat, index) => (
            <div
              className="home-stat-card"
              key={index}
            >
              <i className={`${stat.icon} home-stat-icon`}></i>

              <h2>{stat.value}</h2>

              <p
                style={{
                  color: darkMode ? '#a8c8f0' : '#555',
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* ===========================
          Why Us Section
      =========================== */}

      <section
        className="home-why-us"
        style={{
          background: darkMode ? '#0f0f0f' : '#f5f5f5',
        }}
      >

        <h1
          style={{
            color: darkMode ? 'white' : '#003366',
            marginBottom: '50px',
          }}
        >
          Why Zephyr Academy?
        </h1>

        <div className="home-features-container">

          {features.map((item, index) => (
            <div
              className="home-feature-card"
              key={index}
              style={{
                background: darkMode ? '#1a1a2e' : 'white',
                padding: '40px 30px',
                borderRadius: '12px',
                width: '250px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                borderTop: '4px solid #f0a500',
                animationDelay: `${0.1 + index * 0.15}s`,
              }}
            >

              <i
                className={`${item.icon} home-feature-icon`}
                style={{
                  fontSize: '2.5rem',
                  color: '#f0a500',
                  marginBottom: '15px',
                  display: 'block',
                }}
              ></i>

              <h3
                style={{
                  color: darkMode ? 'white' : '#003366',
                  marginBottom: '10px',
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: darkMode ? '#a8c8f0' : '#555',
                  fontSize: '0.9rem',
                }}
              >
                {item.desc}
              </p>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
};

export default Home;
