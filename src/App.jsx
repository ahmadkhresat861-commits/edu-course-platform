import React, { useState, useEffect } from 'react';
import './App.css';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

// Navbar
const Navbar = () => {
  const [active, setActive] = useState('home');
  return (
    <nav>
      <h2>EduCourses</h2>
      <div>
        {['home', 'courses', 'login', 'contact'].map(section => (
          <a
            key={section}
            href={`#${section}`}
            className={active === section ? 'active' : ''}
            onClick={() => setActive(section)}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </a>
        ))}
      </div>
    </nav>
  );
};

// Footer
const Footer = () => (
  <footer>
    <p>© 2026 EduCourses. All rights reserved.</p>
    <div>
      <a href="#">GitHub</a>
      <a href="#">Discord</a>
      <a href="#">Twitter</a>
    </div>
  </footer>
);

// CourseCard
const CourseCard = ({ course, onViewDetails }) => (
  <div className={`course-card ${course.color}`} onClick={() => onViewDetails(course)}>
    <img src={heroImg} alt={course.title} />
    <h3>{course.title}</h3>
    <p>{course.description}</p>
    <button>View Details</button>
  </div>
);

const courses = [
  { id: 1, title: "React Basics", description: "Learn React step by step", details: "React fundamentals, components, props, state, hooks.", color: 'color1' },
  { id: 2, title: "JavaScript Advanced", description: "Deep dive into JS", details: "Closures, promises, async/await, ES6 features.", color: 'color2' },
  { id: 3, title: "HTML & CSS", description: "Design beautiful websites", details: "HTML, CSS, Flexbox, Grid, Responsive Design.", color: 'color3' }
];

// Hero + Login
const HeroAndLogin = () => {
  const [fadeIn, setFadeIn] = useState(false);
  useEffect(() => { setFadeIn(true); }, []);
  return (
    <section id="home" style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 1s' }}>
      <div className="hero">
        <img src={heroImg} width="180" alt="Hero" />
        <img src={reactLogo} width="60" alt="React" />
        <img src={viteLogo} width="60" alt="Vite" />
      </div>
      <h1>Learn, Code, and Grow with EduCourses</h1>
      <button onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}>
        Start Learning
      </button>

      <div id="login">
        <h2>Login</h2>
        <input type="text" placeholder="Username" /><br />
        <input type="password" placeholder="Password" /><br />
        <button>Login</button>
      </div>
    </section>
  );
};

// Courses Section
const CoursesSection = ({ onViewDetails }) => (
  <section id="courses">
    <h1>Our Courses</h1>
    <div className="courses-container">
      {courses.map(course => <CourseCard key={course.id} course={course} onViewDetails={onViewDetails} />)}
    </div>
  </section>
);

// Course Detail
const CourseDetail = ({ course, onBack }) => (
  <section style={{ padding: "40px", textAlign: "center" }}>
    <h1>{course.title}</h1>
    <p style={{ maxWidth: "600px", margin: "15px auto" }}>{course.details}</p>
    <button onClick={onBack}>Back to Courses</button>
  </section>
);

// Contact / Ads Section
const ContactSection = () => (
  <section id="contact" className="contact">
    <h2>Contact & Advertisements</h2>

    <div className="ads">
      <img src="https://via.placeholder.com/200x100?text=Ad+1" alt="Ad 1" />
      <img src="https://via.placeholder.com/200x100?text=Ad+2" alt="Ad 2" />
      <img src="https://via.placeholder.com/200x100?text=Ad+3" alt="Ad 3" />
    </div>

    <div className="contact-info">
      📞 Call us: <a href="tel:+1234567890">+1 234 567 890</a>
    </div>

    <div className="social-icons">
      <a href="#">📘</a>
      <a href="#">📸</a>
      <a href="#">🐦</a>
      <a href="#">💼</a>
    </div>
  </section>
);

// Main App
function App() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const handleViewDetails = (course) => setSelectedCourse(course);
  const handleBack = () => setSelectedCourse(null);

  return (
    <div>
      <Navbar />
      {selectedCourse
        ? <CourseDetail course={selectedCourse} onBack={handleBack} />
        : <>
            <HeroAndLogin />
            <CoursesSection onViewDetails={handleViewDetails} />
            <ContactSection />
          </>
      }
      <Footer />
    </div>
  );
}

export default App;
