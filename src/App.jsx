import React, { useState, useEffect } from 'react';
import './App.css';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

/* ================= NAVBAR ================= */
const Navbar = () => {
  const [active, setActive] = useState('home');

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'features', label: 'Features' },
    { id: 'login', label: 'Login' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar">
      <h2>EduCourses</h2>

      <div className="nav-links">
        {links.map(link => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={active === link.id ? 'active' : ''}
            onClick={() => setActive(link.id)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

/* ================= HERO ================= */
const Hero = () => (
  <section id="home" className="hero">
    <div>
      <h1>Learn, Code & Grow 🚀</h1>
      <p>Modern learning platform for developers</p>

      <button onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}>
        Start Learning
      </button>
    </div>

    <div>
      <img src={heroImg} width="250" alt="hero" />
    </div>
  </section>
);

/* ================= COURSES ================= */
const Courses = () => (
  <section id="courses">
    <h2>Courses</h2>

    <div className="grid">
      <div className="card">React Basics</div>
      <div className="card">JavaScript Advanced</div>
      <div className="card">HTML & CSS</div>
      <div className="card">Node.js</div>
      <div className="card">UI/UX Design</div>
      <div className="card">Git & GitHub</div>
    </div>
  </section>
);

/* ================= FEATURES ================= */
const Features = () => (
  <section id="features">
    <h2>Features</h2>

    <div className="grid">
      <div className="card">⚡ Fast Learning</div>
      <div className="card">📜 Certificates</div>
      <div className="card">💡 Real Projects</div>
    </div>
  </section>
);

/* ================= LOGIN ================= */
const Login = () => (
  <section id="login">
    <h2>Login</h2>

    <div className="grid login-box">
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Password" />
      <button>Login</button>
    </div>
  </section>
);

/* ================= PRICING ================= */
const Pricing = () => (
  <section id="pricing">
    <h2>Pricing</h2>

    <div className="grid">
      <div className="card">Free</div>
      <div className="card">Pro</div>
      <div className="card">Premium</div>
    </div>
  </section>
);

/* ================= CONTACT ================= */
const Contact = () => (
  <section id="contact">
    <h2>Contact</h2>

    <div className="grid">
      <div className="card">📞 Phone</div>
      <div className="card">📧 Email</div>
      <div className="card">💬 Support</div>
    </div>
  </section>
);

/* ================= APP ================= */
export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Courses />
      <Features />
      <Login />
      <Pricing />
      <Contact />
    </>
  );
}
