import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import '../App.css';

const courses = [
  { id: 1, title: "React Development", description: "Learn React step by step", details: "React fundamentals, components, props, state, hooks.", icon: "fab fa-react", color: "#61dafb", category: "Frontend" },
  { id: 2, title: "JavaScript Advanced", description: "Deep dive into JS", details: "Closures, promises, async/await, ES6 features.", icon: "fab fa-js", color: "#f7df1e", category: "Frontend" },
  { id: 3, title: "HTML & CSS", description: "Design beautiful websites", details: "HTML, CSS, Flexbox, Grid, Responsive Design.", icon: "fab fa-html5", color: "#e34f26", category: "Frontend" },
  { id: 4, title: "Python Programming", description: "Start coding with Python", details: "Basics, OOP, libraries, data science intro.", icon: "fab fa-python", color: "#3776ab", category: "Backend" },
  { id: 5, title: "UI/UX Design", description: "Design user experiences", details: "Figma, wireframes, prototyping, user research.", icon: "fas fa-paint-brush", color: "#ff6b6b", category: "Design" },
  { id: 6, title: "Database & SQL", description: "Master databases", details: "SQL, MySQL, PostgreSQL, database design.", icon: "fas fa-database", color: "#f0a500", category: "Backend" },
];

const StarRating = ({ rating, onRate }) => (
  <div style={{ display: 'flex', gap: '5px' }}>
    {[1,2,3,4,5].map(star => (
      <i key={star} className={star <= rating ? 'fas fa-star' : 'far fa-star'}
        style={{ color: '#f0a500', cursor: onRate ? 'pointer' : 'default', fontSize: '1.2rem' }}
        onClick={() => onRate && onRate(star)} />
    ))}
  </div>
);

const Courses = () => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (selected) fetchReviews();
  }, [selected]);

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').eq('course_id', selected.id);
    if (data) setReviews(data);
  };

  const handleSubmitReview = async () => {
    if (!myRating) return;
    await supabase.from('reviews').upsert({
      course_id: selected.id,
      user_id: user.id,
      rating: myRating,
      comment
    });
    setSubmitted(true);
    fetchReviews();
  };

  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : null;

  const filtered = courses.filter(c =>
    (category === 'All' || c.category === category) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (selected) {
    return (
      <section style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => { setSelected(null); setReviews([]); setSubmitted(false); setMyRating(0); setComment(''); }}
          style={{ marginBottom: '30px', padding: '10px 20px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <i className="fas fa-arrow-left"></i> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <i className={selected.icon} style={{ fontSize: '4rem', color: selected.color, marginBottom: '15px', display: 'block' }}></i>
          <h1 style={{ color: '#003366' }}>{selected.title}</h1>
          <p style={{ color: '#555', fontSize: '1.1rem', margin: '15px 0' }}>{selected.details}</p>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <StarRating rating={Math.round(avgRating)} />
              <span style={{ color: '#888' }}>{avgRating} ({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
          <h2 style={{ color: '#003366', marginBottom: '20px' }}><i className="fas fa-star"></i> Reviews</h2>
          {reviews.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center' }}>No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r, i) => (
              <div key={i} style={{ padding: '15px 0', borderBottom: '1px solid #f0f0f0' }}>
                <StarRating rating={r.rating} />
                {r.comment && <p style={{ color: '#555', marginTop: '8px' }}>{r.comment}</p>}
              </div>
            ))
          )}
        </div>

        {/* Add Review */}
        {!submitted ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <h2 style={{ color: '#003366', marginBottom: '20px' }}><i className="fas fa-pen"></i> Add Your Review</h2>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ marginBottom: '8px', fontWeight: '600', color: '#003366' }}>Your Rating:</p>
              <StarRating rating={myRating} onRate={setMyRating} />
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your review..."
              rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '15px' }}
            />
            <button onClick={handleSubmitReview} disabled={!myRating}
              style={{ width: '100%', padding: '14px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              <i className="fas fa-paper-plane"></i> Submit Review
            </button>
          </div>
        ) : (
          <div style={{ background: '#f0fff4', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#10b981', marginBottom: '15px', display: 'block' }}></i>
            <h3 style={{ color: '#003366' }}>Review Submitted! Thank you 🎉</h3>
          </div>
        )}
      </section>
    );
  }

  return (
    <section id="courses">
      <h1><i className="fas fa-book-open"></i> Our Courses</h1>
      <div style={{ maxWidth: '700px', margin: '0 auto 40px', padding: '0 20px' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
          <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '10px', border: '2px solid #ddd', fontSize: '1rem', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['All', 'Frontend', 'Backend', 'Design'].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ padding: '8px 20px', borderRadius: '20px', border: '2px solid #003366', background: category === cat ? '#003366' : 'white', color: category === cat ? 'white' : '#003366', fontWeight: '600', cursor: 'pointer' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '15px', display: 'block' }}></i>
          <p>No courses found</p>
        </div>
      ) : (
        <div className="courses-container">
          {filtered.map(course => (
            <div key={course.id} className="course-card" onClick={() => setSelected(course)}>
              <div className="card-icon" style={{ color: course.color }}><i className={course.icon}></i></div>
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