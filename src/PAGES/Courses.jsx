import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const getCourseVisuals = (category) => {
  const visuals = {
    Frontend: {
      icon: 'fab fa-react',
      color: '#61dafb',
      description: 'Learn modern frontend development and build amazing web applications.',
      details: 'Learn React, JavaScript, HTML, CSS, components, state, hooks and modern frontend development.'
    },
    Backend: {
      icon: 'fas fa-server',
      color: '#3776ab',
      description: 'Build powerful backend systems and work with databases.',
      details: 'Learn backend development, APIs, databases, SQL and server-side programming.'
    },
    Design: {
      icon: 'fas fa-paint-brush',
      color: '#ff6b6b',
      description: 'Learn how to create beautiful and user-friendly digital experiences.',
      details: 'Learn UI/UX design, wireframes, prototyping, user research and modern design principles.'
    },
    default: {
      icon: 'fas fa-book-open',
      color: '#f0a500',
      description: 'Expand your knowledge and develop new skills.',
      details: 'Explore this course and start your learning journey with Zephyr Academy.'
    }
  };

  return visuals[category] || visuals.default;
};

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
    shadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.4)'
      : '0 4px 15px rgba(0,0,0,0.08)',
    tagBg: darkMode ? '#2a3050' : '#f0f0f0',
    tagColor: darkMode ? '#a0b4ff' : '#555',
    btnBack: darkMode ? '#2a3580' : '#003366',
  };

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');

  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pageVisible, setPageVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

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
  // FETCH COURSES FROM SUPABASE
  // ============================================================

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }

      setCoursesLoading(false);
    };

    fetchCourses();
  }, []);

  // ============================================================
  // SELECTED COURSE
  // ============================================================

  useEffect(() => {
    if (!selected) return;

    setDetailsVisible(false);

    const timer = setTimeout(() => {
      setDetailsVisible(true);
    }, 100);

    fetchReviews();

    return () => clearTimeout(timer);
  }, [selected]);

  // ============================================================
  // FETCH REVIEWS
  // ============================================================

  const fetchReviews = async () => {
    if (!selected) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('course_id', selected.id)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }

    setLoading(false);
  };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const handleSubmitReview = async () => {
    if (!myRating) return;

    if (!user) {
      alert('Please login first to submit a review.');
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
          comment: comment.trim()
        },
        {
          onConflict: 'user_id,course_id'
        }
      );

    if (error) {
      console.error('Error submitting review:', error);
      alert(error.message);
    } else {
      setSubmitted(true);
      await fetchReviews();
    }

    setLoading(false);
  };

  // ============================================================
  // BACK TO COURSES
  // ============================================================

  const handleBack = () => {
    setDetailsVisible(false);

    setTimeout(() => {
      setSelected(null);
      setReviews([]);
      setSubmitted(false);
      setMyRating(0);
      setComment('');
    }, 250);
  };

  // ============================================================
  // AVERAGE RATING
  // ============================================================

  const avgRating = reviews.length
    ? (
        reviews.reduce((total, review) => {
          return total + Number(review.rating || 0);
        }, 0) / reviews.length
      ).toFixed(1)
    : null;

  // ============================================================
  // FILTER COURSES
  // ============================================================

  const filtered = courses.filter(course => {
    const title = course.title || '';
    const categoryName = course.category || '';

    return (
      (category === 'All' || categoryName === category) &&
      title.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ============================================================
  // COURSE DETAILS
  // ============================================================

  if (selected) {
    const visual = getCourseVisuals(selected.category);

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
            marginBottom: '40px',
            animation: 'slideUp 0.7s ease both'
          }}
        >

          <i
            className={visual.icon}
            style={{
              fontSize: '4rem',
              color: visual.color,
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
            {visual.details}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '25px',
              flexWrap: 'wrap',
              marginTop: '20px'
            }}
          >

            <span style={{ color: dm.subtext }}>
              <i className="fas fa-tag"></i>{' '}
              {selected.category || 'General'}
            </span>

            <span style={{ color: dm.subtext }}>
              <i className="fas fa-users"></i>{' '}
              {selected.students || 0} Students
            </span>

            {avgRating && (
              <span style={{ color: dm.subtext }}>
                <i className="fas fa-star" style={{ color: '#f0a500' }}></i>{' '}
                {avgRating}
              </span>
            )}

          </div>

          {avgRating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '15px',
                animation: 'fadeIn 0.8s ease both'
              }}
            >
              <StarRating rating={Math.round(Number(avgRating))} />

              <span style={{ color: dm.subtext }}>
                {avgRating} ({reviews.length} reviews)
              </span>
            </div>
          )}

        </div>

        {/* Reviews */}

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
              <i className="fas fa-spinner fa-spin"></i> Loading...
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
            reviews.map((review, index) => (
              <div
                key={review.id}
                style={{
                  padding: '15px 0',
                  borderBottom: `1px solid ${dm.cardBorder}`,
                  animation: 'fadeIn 0.5s ease both',
                  animationDelay: `${index * 0.1}s`
                }}
              >

                <StarRating rating={review.rating} />

                {review.comment && (
                  <p
                    style={{
                      color: dm.text,
                      marginTop: '8px'
                    }}
                  >
                    {review.comment}
                  </p>
                )}

              </div>
            ))
          )}

        </div>

        {/* Add Review */}

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

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(25px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }

              to {
                opacity: 1;
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

      {/* Title */}

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

        {/* Search */}

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
              boxSizing: 'border-box',
              transition:
                'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease'
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

          {[
            'All',
            ...new Set(
              courses
                .map(course => course.category)
                .filter(Boolean)
            )
          ].map(cat => (

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
                transition: 'all 0.3s ease',
                transform:
                  category === cat
                    ? 'scale(1.05)'
                    : 'scale(1)'
              }}
            >
              {cat}
            </button>

          ))}

        </div>

      </div>

      {/* Loading */}

      {coursesLoading ? (

        <div
          style={{
            textAlign: 'center',
            padding: '80px',
            color: dm.heading
          }}
        >

          <i
            className="fas fa-spinner fa-spin"
            style={{
              fontSize: '3rem',
              marginBottom: '20px'
            }}
          ></i>

          <p>Loading courses...</p>

        </div>

      ) : filtered.length === 0 ? (

        /* No Results */

        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            color: dm.subtext,
            animation: 'fadeIn 0.5s ease both'
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

        /* Courses */

        <div className="courses-container">

          {filtered.map((course, index) => {

            const visual = getCourseVisuals(course.category);

            return (

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

                {/* Icon */}

                <div
                  className="card-icon"
                  style={{
                    color: visual.color
                  }}
                >
                  <i className={visual.icon}></i>
                </div>

                {/* Category */}

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
                  {course.category || 'General'}
                </span>

                {/* Title */}

                <h3 style={{ color: dm.heading }}>
                  {course.title}
                </h3>

                {/* Description */}

                <p style={{ color: dm.text }}>
                  {visual.description}
                </p>

                {/* Course Stats */}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: '15px 0',
                    color: dm.subtext,
                    fontSize: '0.85rem'
                  }}
                >

                  <span>
                    <i className="fas fa-users"></i>{' '}
                    {course.students || 0}
                  </span>

                  <span>
                    <i
                      className="fas fa-star"
                      style={{ color: '#f0a500' }}
                    ></i>{' '}
                    {course.rating || 'New'}
                  </span>

                </div>

                {/* Button */}

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
                    fontWeight: '600',
                    transition:
                      'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                >
                  <i className="fas fa-arrow-right"></i>{' '}
                  View Details
                </button>

              </div>

            );
          })}

        </div>

      )}

      {/* Local Animation Styles */}

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

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }
        `}
      </style>

    </section>
  );
};

export default Courses;
