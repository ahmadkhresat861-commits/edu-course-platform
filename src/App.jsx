import React from 'react';
import './App.css';
import heroImg from './assets/hero.png';

const Navbar = () => {
  const links = [
    'home',
    'courses',
    'features',
    'pricing',
    'contact'
  ];

  return (
    <nav className="navbar">
      <div className="logo">EduCourses</div>

      <div className="nav-links">
        {links.map(link => (
          <a key={link} href={`#${link}`}>
            {link.charAt(0).toUpperCase() + link.slice(1)}
          </a>
        ))}
      </div>
    </nav>
  );
};

/* HERO */
const Hero = () => (
  <section id="home" className="hero">
    <div>
      <h1>Learn Skills Fast 🚀</h1>
      <p>Modern platform for coding & design</p>
    </div>
    <img src={heroImg} alt="hero" />
  </section>
);

/* COURSES (GRID) */
const Courses = () => (
  <section id="courses">
    <h2>Courses</h2>

    <div className="grid">
      <div className="card">React Basics</div>
      <div className="card">JavaScript</div>
      <div className="card">HTML & CSS</div>
      <div className="card">Node.js</div>
      <div className="card">UI/UX</div>
      <div className="card">Git & GitHub</div>
    </div>
  </section>
);

/* FEATURES (GRID) */
const Features = () => (
  <section id="features">
    <h2>Features</h2>

    <div className="grid">
      <div className="card">✔ Fast Learning</div>
      <div className="card">✔ Certificates</div>
      <div className="card">✔ Real Projects</div>
    </div>
  </section>
);

/* PRICING (GRID) */
const Pricing = () => (
  <section id="pricing">
    <h2>Pricing</h2>

    <div className="grid">
      <div className="card">Free Plan</div>
      <div className="card">Pro Plan</div>
      <div className="card">Premium Plan</div>
    </div>
  </section>
);

/* CONTACT */
const Contact = () => (
  <section id="contact">
    <h2>Contact</h2>

    <div className="grid">
      <div className="card">📞 Call us</div>
      <div className="card">📧 Email</div>
      <div className="card">💬 Support</div>
    </div>
  </section>
);

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Courses />
      <Features />
      <Pricing />
      <Contact />
    </>
  );
}
