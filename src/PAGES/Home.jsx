import React, { useEffect, useState } from ‘react’;
import { useNavigate } from ‘react-router-dom’;
import { useLang } from ‘../LanguageContext’;
import ‘../App.css’;

const Home = () => {
const navigate = useNavigate();
const [fadeIn, setFadeIn] = useState(false);
const { darkMode } = useLang();

useEffect(() => {
setFadeIn(true);
}, []);

const stats = [
{
value: ‘500+’,
label: ‘Students’,
icon: ‘fas fa-users’,
},
{
value: ‘20+’,
label: ‘Courses’,
icon: ‘fas fa-book’,
},
{
value: ‘10+’,
label: ‘Instructors’,
icon: ‘fas fa-chalkboard-teacher’,
},
{
value: ‘95%’,
label: ‘Satisfaction’,
icon: ‘fas fa-star’,
},
];

const features = [
{
icon: ‘fas fa-laptop’,
title: ‘Learn Online’,
desc: ‘Study anytime, anywhere at your own pace’,
},
{
icon: ‘fas fa-certificate’,
title: ‘Get Certified’,
desc: ‘Earn certificates recognized by top companies’,
},
{
icon: ‘fas fa-headset’,
title: ‘24/7 Support’,
desc: ‘Our team is always here to help you succeed’,
},
];

return (
<div
className={fadeIn ? ‘home-page home-visible’ : ‘home-page’}
>
{/* =========================
Hero Section
========================== */}
      <h1>
        Welcome to Zephyr Academy
      </h1>
      <p>
        Jordan's premier online learning platform.
        Learn from expert instructors and grow your career.
      </p>
      <button
        onClick={() => navigate('/courses')}
        className="home-start-button"
      >
        <i className="fas fa-rocket"></i>
        Start Learning
      </button>
    </div>
  </section>
  {/* =========================
      Stats Section
  ========================== */}
  <section
    className="home-stats"
    style={{
      background: darkMode ? '#1a1a2e' : 'white',
    }}
  >
    <div className="home-stats-container">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="home-stat-card"
          style={{
            animationDelay: `${0.2 + i * 0.15}s`,
          }}
        >
          <div className="home-stat-icon">
            <i className={stat.icon}></i>
          </div>
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
  {/* =========================
      Why Us Section
  ========================== */}
  <section
    className="home-why-us"
    style={{
      background: darkMode ? '#0f0f0f' : '#f5f5f5',
    }}
  >
    <h1
      style={{
        color: darkMode ? 'white' : '#003366',
      }}
    >
      Why Zephyr Academy?
    </h1>
    <div className="home-features-container">
      {features.map((item, i) => (
        <div
          key={i}
          className="home-feature-card"
          style={{
            animationDelay: `${0.3 + i * 0.2}s`,
            background: darkMode
              ? '#1a1a2e'
              : 'white',
          }}
        >
          <div className="home-feature-icon">
            <i className={item.icon}></i>
          </div>
          <h3
            style={{
              color: darkMode ? 'white' : '#003366',
            }}
          >
            {item.title}
          </h3>
          <p
            style={{
              color: darkMode ? '#a8c8f0' : '#555',
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
