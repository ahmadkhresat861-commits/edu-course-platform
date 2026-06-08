import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
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
    {[1, 2, 3, 4, 5].map(star => (
      <i
        key={star}
        className={star <= rating ? 'fas fa-star' : 'far fa-star'}
        style={{ color: '#f0a500', cursor: onRate ? 'pointer' : 'default', fontSize: '1.2rem' }}
        onClick={() => onRate && onRate(star)}
      />
    ))}
  </div>
);

const Courses = () => {
  const { darkMode } = useLang();

  // ── ألوان الـ dark / light mode ──────────────────────────────────
  const dm = {
    bg:          darkMode ? '#0f1117' : '#f5f7fa',
    card:        darkMode ? '#1e2130' : 'white',
    cardBorder:  darkMode ? '#2e3250' : '#f0f0f0',
    heading:     darkMode ? '#a0b4ff' : '#003366',
    text:        darkMode ? '#c8d0e0' : '#555',
    subtext:     darkMode ? '#7a8499' : '#888',
    input:       darkMode ? '#1e2130' : 'white',
    inputBorder: darkMode ? '#3a4060' : '#ddd',
    inputColor:  darkMode ? '#e0e6f0' : '#333',
    catActive:   darkMode ? '#a0b4ff' : 'white',
    catActiveBg: darkMode ? '#2a3580' : '#003366',
    catBorder:   darkMode ? '#a0b4ff' : '#003366',
    catInactive: darkMode ? '#a0b4ff' : '#003366',
    reviewBg:    darkMode ? '#161a28' : 'white',
    successBg:   darkMode ? '#0d2318' : '#f0fff4',
    shadow:      darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.08)',
    tagBg:       darkMode ? '#2a3050' : '#f0f0f0',
    tagColor:    darkMode ? '#a0b4ff' : '#555',
    btnBack:     darkMode ? '#2a3580' : '#003366',
  };

  const [selected, setSelected]   = useState(null);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [reviews, setReviews]     = useState([]);
  const [myRating, setMyRating]   = useState(0);
  const [comment, setComment]     = useState('');
  const [user, setUser]           = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    if (selected) fetchReviews();
  }, [selected]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*').eq('course_id', selected.id);
    if (data) setReviews(data);
    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!myRating || !user) return;
    await supabase.from('reviews').upsert({
      course_id: selected.id,
      user_id: user.id,
      rating: myRating,
      comment,
    });
    setSubmitted(true);
    fetchReviews();
  };

  const avgRating = reviews.length
    ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
    : null;

  const filtered = courses.filter(c =>
    (category === 'All' || c.category === category) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()))
  );

  // ── صفحة تفاصيل الكورس ──────────────────────────────────────────
  if (selected) {
    return (
      <section style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', background: dm.bg, minHeight: '100vh' }}>
        <button
          onClick={() => { setSelected(null); setReviews([]); setSubmitted(false); setMyRating(0); setComment(''); }}
          style={{ marginBottom: '30px', padding: '10px 20px', background: dm.btnBack, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>

        {/* معلومات الكورس */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <i className={selected.icon} style={{ fontSize: '4rem', color: selected.color, marginBottom: '15px', display: 'block' }}></i>
          <h1 style={{ color: dm.heading }}>{selected.title}</h1>
          <p style={{ color: dm.text, fontSize: '1.1rem', margin: '15px 0' }}>{selected.details}</p>
          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <StarRating rating={Math.round(avgRating)} />
              <span style={{ color: dm.subtext }}>{avgRating} ({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* قسم التقييمات */}
        <div style={{ background: dm.reviewBg, borderRadius: '12px', padding: '30px', boxShadow: dm.shadow, marginBottom: '30px' }}>
          <h2 style={{ color: dm.heading, marginBottom: '20px' }}>
            <i className="fas fa-star"></i> Reviews
          </h2>
          {loading ? (
            <p style={{ color: dm.subtext, textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin"></i> Loading...
            </p>
          ) : reviews.length === 0 ? (
            <p style={{ color: dm.subtext, textAlign: 'center' }}>No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} style={{ padding: '15px 0', borderBottom: `1px solid ${dm.cardBorder}` }}>
                <StarRating rating={r.rating} />
                {r.comment && <p style={{ color: dm.text, marginTop: '8px' }}>{r.comment}</p>}
              </div>
            ))
          )}
        </div>

        {/* إضافة تقييم */}
        {!submitted ? (
          <div style={{ background: dm.reviewBg, borderRadius: '12px', padding: '30px', boxShadow: dm.shadow }}>
            <h2 style={{ color: dm.heading, marginBottom: '20px' }}>
              <i className="fas fa-pen"></i> Add Your Review
            </h2>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ marginBottom: '8px', fontWeight: '600', color: dm.heading }}>Your Rating:</p>
              <StarRating rating={myRating} onRate={setMyRating} />
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your review..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${dm.inputBorder}`,
                fontSize: '1rem',
                marginBottom: '15px',
                background: dm.input,
                color: dm.inputColor,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleSubmitReview}
              disabled={!myRating}
              style={{
                width: '100%',
                padding: '14px',
                background: myRating ? dm.btnBack : (darkMode ? '#2a2a3a' : '#ccc'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: myRating ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
            >
              <i className="fas fa-paper-plane"></i> Submit Review
            </button>
          </div>
        ) : (
          <div style={{ background: dm.successBg, borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#10b981', marginBottom: '15px', display: 'block' }}></i>
            <h3 style={{ color: dm.heading }}>Review Submitted! Thank you 🎉</h3>
          </div>
        )}
      </section>
    );
  }

  // ── صفحة قائمة الكورسات ─────────────────────────────────────────
  return (
    <section id="courses" style={{ background: dm.bg, minHeight: '100vh', padding: '40px 20px' }}>
      <h1 style={{ color: dm.heading, textAlign: 'center' }}>
        <i className="fas fa-book-open"></i> Our Courses
      </h1>

      <div style={{ maxWidth: '700px', margin: '0 auto 40px', padding: '0 20px' }}>
        {/* حقل البحث */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: dm.subtext }}></i>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 45px',
              borderRadius: '10px',
              border: `2px solid ${dm.inputBorder}`,
              fontSize: '1rem',
              outline: 'none',
              background: dm.input,
              color: dm.inputColor,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        {/* فلاتر الفئات */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['All', 'Frontend', 'Backend', 'Design'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: `2px solid ${dm.catBorder}`,
                background: category === cat ? dm.catActiveBg : 'transparent',
                color: category === cat ? dm.catActive : dm.catInactive,
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* لا نتائج */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: dm.subtext }}>
          <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '15px', display: 'block' }}></i>
          <p>No courses found</p>
        </div>
      ) : (
        <div className="courses-container">
          {filtered.map(course => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => setSelected(course)}
              style={{ background: dm.card, boxShadow: dm.shadow, transition: 'transform 0.2s, box-shadow 0.2s' }}
            >
              <div className="card-icon" style={{ color: course.color }}>
                <i className={course.icon}></i>
              </div>
              <span style={{ background: dm.tagBg, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', color: dm.tagColor, marginBottom: '10px', display: 'inline-block' }}>
                {course.category}
              </span>
              <h3 style={{ color: dm.heading }}>{course.title}</h3>
              <p style={{ color: dm.text }}>{course.description}</p>
              <button style={{ background: dm.btnBack, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                <i className="fas fa-arrow-right"></i> View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Courses;