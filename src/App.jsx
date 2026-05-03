import React, { useState, useEffect } from 'react';
import './App.css';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

/* ================= NAVBAR ================= */
const Navbar = () => {
  const [active, setActive] = useState('home');

  const links = [
    { id: 'home', label: 'Home', icon: 'icon-home' },
    { id: 'courses', label: 'Courses', icon: 'icon-courses' },
    { id: 'login', label: 'Login', icon: 'icon-dashboard' },
    { id: 'contact', label: 'Contact', icon: 'icon-quiz' },
  ];

  return (
    <nav className="navbar">
      <div className="logo">EduCourses</div>

      <div className="nav-links">
        {links.map(link => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={() => setActive(link.id)}
            className={`nav-item ${active === link.id ? 'active' : ''}`}
          >
            <svg className="icon">
              <use href={`/icons.svg#${link.icon}`}></use>
            </svg>
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
    <div className="hero-content">
      <h1>Learn Skills That Matter 🚀</h1>
      <p>Build your future with modern courses in programming & design</p>

      <div className="hero-buttons">
        <button onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}>
          Start Learning
        </button>
      </div>
    </div>

    <div className="hero-images">
      <img src={heroImg} alt="hero" />
      <img src={reactLogo} alt="react" />
      <img src={viteLogo} alt="vite" />
    </div>
  </section>
);

/* ================= COURSES ================= */
const courses = [
  { id: 1, title: "React Basics", desc: "Learn React step by step" },
  { id: 2, title: "JavaScript Advanced", desc: "Deep dive into JS" },
  { id: 3, title: "HTML & CSS", desc: "Design beautiful websites" }
];

const Courses = () => (
  <section id="courses" className="courses">
    <h2>Popular Courses</h2>

    <div className="course-grid">
      {courses.map(c => (
        <div key={c.id} className="course-card">
          <h3>{c.title}</h3>
          <p>{c.desc}</p>
          <button>View</button>
        </div>
      ))}
    </div>
  </section>
);

/* ================= LOGIN ================= */
const Login = () => (
  <section id="login" className="login">
    <h2>Login</h2>

    <input placeholder="Username" />
    <input type="password" placeholder="Password" />
    <button>Login</button>
  </section>
);

/* ================= CONTACT ================= */
const Contact = () => (
  <section id="contact" className="contact">
    <h2>Contact</h2>
    <p>📞 +1 234 567 890</p>
  </section>
);

/* ================= FOOTER ================= */
const Footer = () => (
  <footer className="footer">
    <p>© 2026 EduCourses</p>
  </footer>
);

/* ================= APP ================= */
export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Courses />
      <Login />
      <Contact />
      <Footer />
    </>
  );
}
