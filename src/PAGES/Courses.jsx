import React, { useState } from 'react';
import '../App.css';

const courses = [
  { id: 1, title: "React Development", description: "Learn React step by step", details: "React fundamentals, components, props, state, hooks.", icon: "fab fa-react", color: "#61dafb" },
  { id: 2, title: "JavaScript Advanced", description: "Deep dive into JS", details: "Closures, promises, async/await, ES6 features.", icon: "fab fa-js", color: "#f7df1e" },
  { id: 3, title: "HTML & CSS", description: "Design beautiful websites", details: "HTML, CSS, Flexbox, Grid, Responsive Design.", icon: "fab fa-html5", color: "#e34f26" },
  { id: 4, title: "Python Programming", description: "Start coding with Python", details: "Basics, OOP, libraries, data science intro.", icon: "fab fa-python", color: "#3776ab" },
  { id: 5, title: "UI/UX Design", description: "Design user experiences", details: "Figma, wireframes, prototyping, user research.", icon: "fas fa-paint-brush", color: "#ff6b6b" },
  { id: 6, title: "Database & SQL", description: "Master databases", details: "SQL, MySQL, PostgreSQL, database design.", icon: "fas fa-database", color: "#f0a500" },
];

const Courses = () => {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <section style={{ padding: '80px 20px', textAlign: 'center', minHeight: '80vh' }}>
        <i className={selected.icon} style={{ fontSize: '4rem', color: selected.color, marginBottom: '20px', display: 'block' }}></i>
        <h1 style={{ color: '#003366' }}>{selected.title}</h1>
        <p style={{ maxWidth: '600px', margin: '15px auto', color: '#555', fontSize: '1.1rem' }}>{selected.details}</p>
        <button onClick={() => setSelected(null)} style={{ marginTop: '30px', padding: '12px 30px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          <i className="fas fa-arrow-left"></i> Back to Courses
        </button>
      </section>
    );
  }

  return (
    <section id="courses">
      <h1><i className="fas fa-book-open"></i> Our Courses</h1>
      <div className="courses-container">
        {courses.map(course => (
          <div key={course.id} className="course-card" onClick={() => setSelected(course)}>
            <div className="card-icon" style={{ color: course.color }}>
              <i className={course.icon}></i>
            </div>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <button><i className="fas fa-arrow-right"></i> View Details</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Courses;