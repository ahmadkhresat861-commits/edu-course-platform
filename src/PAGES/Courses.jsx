import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const courses = [
  {
    id: 1,
    title: "React Development",
    description: "Learn React step by step",
    details: "React fundamentals, components, props, state, hooks.",
    icon: "fab fa-react",
    color: "#61dafb",
    category: "Frontend"
  },
  {
    id: 2,
    title: "JavaScript Advanced",
    description: "Deep dive into JS",
    details: "Closures, promises, async/await, ES6 features.",
    icon: "fab fa-js",
    color: "#f7df1e",
    category: "Frontend"
  },
  {
    id: 3,
    title: "HTML & CSS",
    description: "Design beautiful websites",
    details: "HTML, CSS, Flexbox, Grid, Responsive Design.",
    icon: "fab fa-html5",
    color: "#e34f26",
    category: "Frontend"
  },
  {
    id: 4,
    title: "Python Programming",
    description: "Start coding with Python",
    details: "Basics, OOP, libraries, data science intro.",
    icon: "fab fa-python",
    color: "#3776ab",
    category: "Backend"
  },
  {
    id: 5,
    title: "UI/UX Design",
    description: "Design user experiences",
    details: "Figma, wireframes, prototyping, user research.",
    icon: "fas fa-paint-brush",
    color: "#ff6b6b",
    category: "Design"
  },
  {
    id: 6,
    title: "Database & SQL",
    description: "Master databases",
    details: "SQL, MySQL, PostgreSQL, database design.",
    icon: "fas fa-database",
    color: "#f0a500",
    category: "Backend"
  },
];

const StarRating = ({ rating, onRate }) => (
  <div
    style={{
      display: 'flex',
      gap: '5px',
      animation: 'fadeIn 0.5s ease both'
    }}
  >
    {[1, 2, 3, 4, 5].map(star => (
      <i
        key={star}
        className={star <= rating ? 'fas fa-star' : 'far fa-star'}
        style={{
          color: '#f0a500',
          cursor: onRate ? 'pointer' : 'default',
          fontSize: '1.2rem',
          transition: 'transform 0.2s ease, color 0.2s ease'
        }}
        onClick={() => onRate && onRate(star)}
        onMouseEnter={(e) => {
          if (onRate) {
            e.currentTarget.style.transform = 'scale(1.25)';
          }
        }}
        onMouseLeave={(e) => {
          if (onRate) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      />
    ))}
  </div>
);

const Courses = () => {
  const { darkMode } = useLang();
  const navigate = useNavigate();

  const dm = {
    bg: darkMode ? '#0f1117' : '#f5f7fa',
    card: darkMode ? '#1e2130' : 'white',
    cardBorder: darkMode ? '#2e3250' : '#f0f0f0',
    heading: darkMode ? '#a0b4ff' : '#003366',
    text: darkMode ? '#c8d0e0' : '#555',
    subtext: darkMode ? '#7a8499' : '#888',
    input: darkMode ? '#1e2130' : 'white',
    inputBorder: darkMode ? '#3a4060' : '#ddd',
    inputColor: darkMode ? '#e0e6f0' : '#333',
    catActive: darkMode ? '#a0b4ff' : 'white',
    catActiveBg: darkMode ? '#2a3580' : '#003366',
    catBorder: darkMode ? '#a0b4ff' : '#003366',
    catInactive: darkMode ? '#a0b4ff' : '#003366',
    reviewBg: darkMode ? '#161a28' : 'white',
    successBg: darkMode ? '#0d2318' : '#f0fff4',
    errorBg: darkMode ? '#351b1b' : '#fff1f1',
    shadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.4)'
      : '0 4px 15px rgba(0,0,0,0.08)',
    tagBg: darkMode ? '#2a3050' : '#f0f0f0',
    tagColor: darkMode ? '#a0b4ff' : '#555',
    btnBack: darkMode ? '#2a3580' : '#003366',
  };

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');

  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  // Enrollment states
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');
  const [enrollError, setEnrollError] = useState('');

  // Animation
  const [pageVisible, setPageVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // ============================================================
  // GET CURRENT USER
  // ============================================================

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  // ============================================================
  // PAGE ANIMATION
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // WHEN COURSE SELECTED
  // ============================================================

  useEffect(() => {
    if (!selected) return;

    setDetailsVisible(false);
    setIsEnrolled(false);
    setEnrollMessage('');
    setEnrollError('');

    const timer = setTimeout(() => {
      setDetailsVisible(true);
    }, 100);

    fetchReviews();
    checkEnrollment();

    return () => clearTimeout(timer);
  }, [selected]);

  // ============================================================
  // FETCH REVIEWS
  // ============================================================

  const fetchReviews = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('course_id', selected.id);

    if (!error && data) {
      setReviews(data);
    }

    setLoading(false);
  };

  // ============================================================
  // CHECK IF USER IS ENROLLED
  // ============================================================

  const checkEnrollment = async () => {
    if (!user || !selected) {
      setIsEnrolled(false);
      return;
    }

    const { data, error } = await supabase
      .from('enrollments')
      .select('id, progress, completed')
      .eq('user_id', user.id)
      .eq('course_id', selected.id)
      .maybeSingle();

    if (!error && data) {
      setIsEnrolled(true);
    } else {
      setIsEnrolled(false);
    }
  };

  // ============================================================
  // ENROLL IN COURSE
  // ============================================================

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selected) return;

    setEnrollLoading(true);
    setEnrollMessage('');
    setEnrollError('');

    // Check again before inserting
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', selected.id)
      .maybeSingle();

    if (checkError) {
      setEnrollError('Unable to check enrollment. Please try again.');
      setEnrollLoading(false);
      return;
    }

    if (existingEnrollment) {
      setIsEnrolled(true);
      setEnrollMessage('You are already enrolled in this course.');
      setEnrollLoading(false);
      return;
    }

    // Create enrollment
    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: selected.id,
        progress: 0,
        completed: false
      });

    if (error) {
      console.error('Enrollment Error:', error);

      if (error.code === '23505') {
        setIsEnrolled(true);
        setEnrollMessage('You are already enrolled in this course.');
      } else {
        setEnrollError(
          'Something went wrong while enrolling. Please try again.'
        );
      }

      setEnrollLoading(false);
      return;
    }

    setIsEnrolled(true);
    setEnrollMessage(
      `Successfully enrolled in ${selected.title}! 🎉`
    );

    setEnrollLoading(false);
  };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const handleSubmitReview = async () => {
    if (!myRating) return;

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('reviews')
      .upsert(
        {
          course_id: selected.id,
          user_id: user.id,
          rating: myRating,
          comment,
        },
        {
          onConflict: 'course_id,user_id'
        }
      );

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    await fetchReviews();
    setLoading(false);
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    setDetailsVisible(false);

    setTimeout(() => {
      setSelected(null);
      setReviews([]);
      setSubmitted(false);
      setMyRating(0);
      setComment('');
      setIsEnrolled(false);
      setEnrollMessage('');
      setEnrollError('');
    }, 250);
  };

  // ============================================================
  // AVERAGE RATING
  // ============================================================

  const avgRating = reviews.length
    ? (
        reviews.reduce((a, b) => a + b.rating, 0) /
        reviews.length
      ).toFixed(1)
    : null;

  // ============================================================
  // FILTER COURSES
  // ============================================================

  const filtered = courses.filter(c =>
    (category === 'All' || c.category === category) &&
    (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    )
  );

  // ============================================================
  // COURSE DETAILS
  // ============================================================

  if (selected) {
    return (
      <section
        style={{
          padding: '60px 20px',
          maxWidth: '800px',
          margin: '0 auto',
          background: dm.bg,
          minHeight: '100vh',
          opacity: detailsVisible ? 1 : 0,
          transform: detailsVisible
            ? 'translateY(0)'
            : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}
      >

        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            marginBottom: '30px',
            padding: '10px 20px',
            background: dm.btnBack,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-5px)';
            e.currentTarget.style.boxShadow =
              '0 6px 15px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>

        {/* Course Info */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '25px',
            animation: 'slideUp 0.7s ease both'
          }}
        >
          <i
            className={selected.icon}
            style={{
              fontSize: '4rem',
              color: selected.color,
              marginBottom: '15px',
              display: 'block',
              animation: 'courseIconFloat 3s ease-in-out infinite'
            }}
          ></i>

          <h1 style={{ color: dm.heading }}>
            {selected.title}
          </h1>

          <p
            style={{
              color: dm.text,
              fontSize: '1.1rem',
              margin: '15px 0'
            }}
          >
            {selected.details}
          </p>

          {avgRating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                animation: 'fadeIn 0.8s ease both'
              }}
            >
              <StarRating rating={Math.round(avgRating)} />

              <span style={{ color: dm.subtext }}>
                {avgRating} ({reviews.length} reviews)
              </span>
            </div>
          )}
        </div>

        {/* =====================================================
            ENROLLMENT CARD
        ====================================================== */}

        <div
          style={{
            background: dm.reviewBg,
            borderRadius: '12px',
            padding: '25px',
            boxShadow: dm.shadow,
            marginBottom: '30px',
            textAlign: 'center',
            animation: 'slideUp 0.7s 0.1s ease both'
          }}
        >
          {!isEnrolled ? (
            <>
              <h2
                style={{
                  color: dm.heading,
                  marginBottom: '10px'
                }}
              >
                <i className="fas fa-graduation-cap"></i>{' '}
                Start Learning
              </h2>

              <p
                style={{
                  color: dm.text,
                  marginBottom: '20px'
                }}
              >
                Enroll now and start your learning journey.
              </p>

              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: enrollLoading
                    ? '#888'
                    : 'linear-gradient(90deg, #003366, #005599)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: enrollLoading
                    ? 'not-allowed'
                    : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 20px rgba(0,51,102,0.25)'
                }}
              >
                {enrollLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>{' '}
                    Enrolling...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle"></i>{' '}
                    Enroll Now
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  animation: 'successPop 0.6s ease both'
                }}
              >
                <i
                  className="fas fa-check-circle"
                  style={{
                    fontSize: '3rem',
                    color: '#10b981',
                    marginBottom: '10px'
                  }}
                ></i>

                <h2 style={{ color: dm.heading }}>
                  You're Enrolled! 🎉
                </h2>

                <p
                  style={{
                    color: dm.text,
                    marginBottom: '20px'
                  }}
                >
                  You can now continue your learning journey.
                </p>

                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="fas fa-play"></i>{' '}
                  Go to My Dashboard
                </button>
              </div>
            </>
          )}

          {enrollMessage && (
            <div
              style={{
                marginTop: '15px',
                padding: '12px',
                borderRadius: '8px',
                background: dm.successBg,
                color: '#10b981',
                fontWeight: '600',
                animation: 'fadeIn 0.5s ease both'
              }}
            >
              {enrollMessage}
            </div>
          )}

          {enrollError && (
            <div
              style={{
                marginTop: '15px',
                padding: '12px',
                borderRadius: '8px',
                background: dm.errorBg,
                color: '#ef4444',
                fontWeight: '600',
                animation: 'fadeIn 0.5s ease both'
              }}
            >
              <i className="fas fa-exclamation-circle"></i>{' '}
              {enrollError}
            </div>
          )}
        </div>

        {/* =====================================================
            REVIEWS
        ====================================================== */}

        <div
          style={{
            background: dm.reviewBg,
            borderRadius: '12px',
            padding: '30px',
            boxShadow: dm.shadow,
            marginBottom: '30px',
            animation: 'slideUp 0.7s 0.2s ease both'
          }}
        >
          <h2
            style={{
              color: dm.heading,
              marginBottom: '20px'
            }}
          >
            <i className="fas fa-star"></i> Reviews
          </h2>

          {loading ? (
            <p
              style={{
                color: dm.subtext,
                textAlign: 'center'
              }}
            >
              <i className="fas fa-spinner fa-spin"></i>{' '}
              Loading...
            </p>
          ) : reviews.length === 0 ? (
            <p
              style={{
                color: dm.subtext,
                textAlign: 'center'
              }}
            >
              No reviews yet. Be the first!
            </p>
          ) : (
            reviews.map((r, index) => (
              <div
                key={r.id}
                style={{
                  padding: '15px 0',
                  borderBottom: `1px solid ${dm.cardBorder}`,
                  animation: 'fadeIn 0.5s ease both',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <StarRating rating={r.rating} />

                {r.comment && (
                  <p
                    style={{
                      color: dm.text,
                      marginTop: '8px'
                    }}
                  >
                    {r.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* =====================================================
            ADD REVIEW
        ====================================================== */}

        {!submitted ? (
          <div
            style={{
              background: dm.reviewBg,
              borderRadius: '12px',
              padding: '30px',
              boxShadow: dm.shadow,
              animation: 'slideUp 0.7s 0.3s ease both'
            }}
          >
            <h2
              style={{
                color: dm.heading,
                marginBottom: '20px'
              }}
            >
              <i className="fas fa-pen"></i> Add Your Review
            </h2>

            <div style={{ marginBottom: '15px' }}>
              <p
                style={{
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: dm.heading
                }}
              >
                Your Rating:
              </p>

              <StarRating
                rating={myRating}
                onRate={setMyRating}
              />
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
                transition:
                  'border 0.3s ease, box-shadow 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow =
                  `0 0 0 3px ${
                    darkMode ? '#2a3580' : '#dce7f5'
                  }`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            />

            <button
              onClick={handleSubmitReview}
              disabled={!myRating || loading}
              style={{
                width: '100%',
                padding: '14px',
                background: myRating
                  ? dm.btnBack
                  : (darkMode ? '#2a2a3a' : '#ccc'),
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: myRating
                  ? 'pointer'
                  : 'not-allowed',
                transition:
                  'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              <i className="fas fa-paper-plane"></i>{' '}
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        ) : (
          <div
            style={{
              background: dm.successBg,
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center',
              animation: 'successPop 0.6s ease both'
            }}
          >
            <i
              className="fas fa-check-circle"
              style={{
                fontSize: '3rem',
                color: '#10b981',
                marginBottom: '15px',
                display: 'block'
              }}
            ></i>

            <h3 style={{ color: dm.heading }}>
              Review Submitted! Thank you 🎉
            </h3>
          </div>
        )}

        {/* Local Animation Styles */}
        <style>
          {`
            @keyframes successPop {
              0% {
                opacity: 0;
                transform: scale(0.8);
              }

              70% {
                transform: scale(1.05);
              }

              100% {
                opacity: 1;
                transform: scale(1);
              }
            }

            @keyframes courseIconFloat {
              0%, 100% {
                transform: translateY(0);
              }

              50% {
                transform: translateY(-8px);
              }
            }
          `}
        </style>

      </section>
    );
  }

  // ============================================================
  // COURSES LIST
  // ============================================================

  return (
    <section
      id="courses"
      style={{
        background: dm.bg,
        minHeight: '100vh',
        padding: '40px 20px',
        opacity: pageVisible ? 1 : 0,
        transform: pageVisible
          ? 'translateY(0)'
          : 'translateY(20px)',
        transition:
          'opacity 0.7s ease, transform 0.7s ease'
      }}
    >

      <h1
        style={{
          color: dm.heading,
          textAlign: 'center',
          animation: 'slideUp 0.7s ease both'
        }}
      >
        <i className="fas fa-book-open"></i> Our Courses
      </h1>

      {/* Search + Categories */}
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto 40px',
          padding: '0 20px',
          animation: 'slideUp 0.7s 0.15s ease both'
        }}
      >

        <div
          style={{
            position: 'relative',
            marginBottom: '20px'
          }}
        >
          <i
            className="fas fa-search"
            style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: dm.subtext
            }}
          ></i>

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
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Categories */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          {['All', 'Frontend', 'Backend', 'Design'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                border: `2px solid ${dm.catBorder}`,
                background:
                  category === cat
                    ? dm.catActiveBg
                    : 'transparent',
                color:
                  category === cat
                    ? dm.catActive
                    : dm.catInactive,
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* No Results */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            color: dm.subtext
          }}
        >
          <i
            className="fas fa-search"
            style={{
              fontSize: '3rem',
              marginBottom: '15px',
              display: 'block'
            }}
          ></i>

          <p>No courses found</p>
        </div>
      ) : (

        <div className="courses-container">
          {filtered.map((course, index) => (
            <div
              key={course.id}
              className="course-card"
              onClick={() => setSelected(course)}
              style={{
                background: dm.card,
                boxShadow: dm.shadow,
                animation:
                  'courseCardEntrance 0.7s ease both',
                animationDelay:
                  `${index * 0.1}s`,
                cursor: 'pointer'
              }}
            >

              <div
                className="card-icon"
                style={{
                  color: course.color
                }}
              >
                <i className={course.icon}></i>
              </div>

              <span
                style={{
                  background: dm.tagBg,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: dm.tagColor,
                  marginBottom: '10px',
                  display: 'inline-block'
                }}
              >
                {course.category}
              </span>

              <h3 style={{ color: dm.heading }}>
                {course.title}
              </h3>

              <p style={{ color: dm.text }}>
                {course.description}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(course);
                }}
                style={{
                  background: dm.btnBack,
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <i className="fas fa-arrow-right"></i>{' '}
                View Details
              </button>

            </div>
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes courseCardEntrance {
            from {
              opacity: 0;
              transform: translateY(35px) scale(0.96);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes courseIconFloat {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes successPop {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }

            70% {
              transform: scale(1.05);
            }

            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

    </section>
  );
};

export default Courses;
