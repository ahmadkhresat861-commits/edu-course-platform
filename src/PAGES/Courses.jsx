import React, { useState } from 'react';
import '../App.css';

const courses = [
  { id: 1, title: "React Development", description: "Learn React step by step", details: "React fundamentals, components, props, state, hooks.", icon: "fab fa-react", color: "#61dafb", category: "Frontend" },
  { id: 2, title: "JavaScript Advanced", description: "Deep dive into JS", details: "Closures, promises, async/await, ES6 features.", icon: "fab fa-js", color: "#f7df1e", category: "Frontend" },
  { id: 3, title: "HTML & CSS", description: "Design beautiful websites", details: "HTML, CSS, Flexbox, Grid, Responsive Design.", icon: "fab fa-html5", color: "#e34f26", category: "Frontend" },
  { id: 4, title: "Python Programming", description: "Start coding with Python", details: "Basics, OOP, libraries, data science intro.", icon: "fab fa-python", color: "#3776ab", category: "Backend" },
  { id: 5, title: "UI/UX Design", description: "Design user experiences", details: "Figma, wireframes, prototyping, user research.", icon: "fas fa-paint-brush", color: "#ff6b6b", category: "Design" },
  { id: 6, title: "Database & SQL", description: "Master databases", details: "SQL, MySQL, PostgreSQL, database design.", icon: "fas fa-database", color: "#f0a500", category: "Backend" },
];

const Courses = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = courses.filter(c =>
    (category === 'All' || c.category === category) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
  );

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

      {/* Search & Filter */}
      <div style={{ maxWidth: '700px', margin: '0 auto 40px', padding: '0 20px' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '1rem', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#003366'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['All', 'Frontend', 'Backend', 'Design'].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '8px 20px', borderRadius: '20px', border: '2px solid #003366', background: category === cat ? '#003366' : 'white', color: category === cat ? 'white' : '#003366', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '15px', display: 'block' }}></i>
          <p>No courses found for "{search}"</p>
        </div>
      ) : (
        <div className="courses-container">
          {filtered.map(course => (
            <div key={course.id} className="course-card" onClick={() => setSelected(course)}>
              <div className="card-icon" style={{ color: course.color }}>
                <i className={course.icon}></i>
              </div>
              <span style={{ background: '#f0f0f0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', color: '#555', marginBottom: '10px', display: 'inline-block' }}>{course.category}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <button><i className="fas fa-arrow-right"></i> View Details</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Courses;