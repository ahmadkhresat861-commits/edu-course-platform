import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';
// ============================================================
// STAR RATING
// ============================================================
const StarRating = ({ rating = 0, onRate }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={star <= Math.round(rating) ? 'fas fa-star' : 'far fa-star'}
          style={{
            color: '#f0a500',
            cursor: onRate ? 'pointer' : 'default',
            fontSize: '1.15rem',
            transition: 'all 0.2s ease',
          }}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={(e) => {
            if (onRate) {
              e.currentTarget.style.transform = 'scale(1.3)';
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
};
// ============================================================
// COURSE ICON
// ============================================================
const getCourseIcon = (category) => {
  const icons = {
    Frontend: {
      icon: 'fas fa-laptop-code',
      color: '#61dafb',
    },
    Backend: {
      icon: 'fas fa-server',
      color: '#3776ab',
    },
    Design: {
      icon: 'fas fa-paint-brush',
      color: '#ff6b6b',
    },
    Database: {
      icon: 'fas fa-database',
      color: '#f0a500',
    },
  };
  return (
    icons[category] || {
      icon: 'fas fa-book-open',
      color: '#6366f1',
    }
  );
};
// ============================================================
// COURSES COMPONENT
// ============================================================
const Courses = () => {
  const { darkMode } = useLang();
  // ============================================================
  // THEME
  // ============================================================
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
  // ============================================================
  // STATE
  // ============================================================
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageVisible, setPageVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  // ============================================================
  // LOAD COURSES FROM SUPABASE
  // ============================================================
  useEffect(() => {
    fetchCourses();
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
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);
  // ============================================================
  // FETCH COURSES
  // ============================================================
  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching courses:', error);
      setError('Unable to load courses. Please try again.');
      setCourses([]);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };
  // ============================================================
  // OPEN COURSE DETAILS
  // ============================================================
  const handleSelectCourse = async (course) => {
    setSelected(course);
    setDetailsVisible(false);
    setSubmitted(false);
    setMyRating(0);
    setComment('');
    setTimeout(() => {
      setDetailsVisible(true);
    }, 100);
    await fetchReviews(course.id);
  };
  // ============================================================
  // FETCH REVIEWS
  // ============================================================
  const fetchReviews = async (courseId) => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('course_id', courseId)
      .order('id', { ascending: false });
    if (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } else {
      setReviews(data || []);
    }
    setReviewsLoading(false);
  };
  // ============================================================
  // SUBMIT / UPDATE REVIEW
  // ============================================================
  const handleSubmitReview = async () => {
    if (!myRating) {
      return;
    }
    if (!user) {
      alert('Please login to submit a review.');
      return;
    }
    const { error } = await supabase
      .from('reviews')
      .upsert(
        {
          course_id: selected.id,
          user_id: user.id,
          rating: myRating,
          comment: comment.trim(),
        },
        {
          onConflict: 'user_id,course_id',
        }
      );
    if (error) {
      console.error('Error submitting review:', error);
      alert('Unable to submit your review. Please try again.');
      return;
    }
    setSubmitted(true);
    await fetchReviews(selected.id);
    // Refresh courses to update rating/students data if needed
    await fetchCourses();
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
    }, 300);
  };
  // ============================================================
  // AVERAGE REVIEW RATING
  // ============================================================
  const avgRating = reviews.length
    ? (
        reviews.reduce(
          (total, review) => total + Number(review.rating || 0),
          0
        ) / reviews.length
      ).toFixed(1)
    : null;
  // ============================================================
  // CATEGORIES FROM DATABASE
  // ============================================================
  const categories = [
    'All',
    ...new Set(
      courses
        .map((course) => course.category)
        .filter(Boolean)
    ),
  ];
  // ============================================================
  // FILTER COURSES
  // ============================================================
  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      category === 'All' ||
      course.category === category;
    const searchText = search.toLowerCase();
    const matchesSearch =
      (course.title || '')
        .toLowerCase()
        .includes(searchText) ||
      (course.category || '')
        .toLowerCase()
        .includes(searchText);
    return matchesCategory && matchesSearch;
  });
  // ============================================================
  // LOADING SCREEN
  // ============================================================
  if (loading) {
    return (
      <section
        style={{
          minHeight: '100vh',
          background: dm.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <i
          className="fas fa-spinner fa-spin"
          style={{
            fontSize: '3rem',
            color: '#f0a500',
            marginBottom: '20px',
          }}
        ></i>
        <p style={{ color: dm.heading }}>
          Loading courses...
        </p>
      </section>
    );
  }
  // ============================================================
  // COURSE DETAILS
  // ============================================================
  if (selected) {
    const courseIcon = getCourseIcon(selected.category);
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
          transition:
            'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* BACK BUTTON */}
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
            transition:
              'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              'translateX(-5px)';
            e.currentTarget.style.boxShadow =
              '0 6px 15px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              'translateX(0)';
            e.currentTarget.style.boxShadow =
              'none';
          }}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        {/* COURSE INFO */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '40px',
            animation:
              'slideUp 0.7s ease both',
          }}
        >
          <i
            className={courseIcon.icon}
            style={{
              fontSize: '4rem',
              color: courseIcon.color,
              marginBottom: '15px',
              display: 'block',
              animation:
                'courseIconFloat 3s ease-in-out infinite',
            }}
          ></i>
          <h1 style={{ color: dm.heading }}>
            {selected.title}
          </h1>
          <span
            style={{
              display: 'inline-block',
              marginTop: '10px',
              background: dm.tagBg,
              color: dm.tagColor,
              padding: '6px 15px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            {selected.category || 'General'}
          </span>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              flexWrap: 'wrap',
              marginTop: '25px',
            }}
          >
            <div style={{ color: dm.text }}>
              <i
                className="fas fa-users"
                style={{
                  color: '#f0a500',
                  marginRight: '7px',
                }}
              ></i>
              {selected.students || 0} Students
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <StarRating
                rating={
                  avgRating ||
                  selected.rating ||
                  0
                }
              />
              <span style={{ color: dm.subtext }}>
                {avgRating ||
                  selected.rating ||
                  'No rating'}
              </span>
            </div>
          </div>
        </div>
        {/* REVIEWS */}
        <div
          style={{
            background: dm.reviewBg,
            borderRadius: '12px',
            padding: '30px',
            boxShadow: dm.shadow,
            marginBottom: '30px',
            animation:
              'slideUp 0.7s 0.2s ease both',
          }}
        >
          <h2
            style={{
              color: dm.heading,
              marginBottom: '20px',
            }}
          >
            <i className="fas fa-star"></i> Reviews
          </h2>
          {reviewsLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px',
              }}
            >
              <i
                className="fas fa-spinner fa-spin"
                style={{
                  fontSize: '2rem',
                  color: '#f0a500',
                }}
              ></i>
            </div>
          ) : reviews.length === 0 ? (
            <p
              style={{
                color: dm.subtext,
                textAlign: 'center',
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
                  borderBottom:
                    `1px solid ${dm.cardBorder}`,
                  animation:
                    'fadeIn 0.5s ease both',
                  animationDelay:
                    `${index * 0.1}s`,
                }}
              >
                <StarRating
                  rating={review.rating}
                />
                {review.comment && (
                  <p
                    style={{
                      color: dm.text,
                      marginTop: '8px',
                    }}
                  >
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        {/* ADD REVIEW */}
        {!submitted ? (
          <div
            style={{
              background: dm.reviewBg,
              borderRadius: '12px',
              padding: '30px',
              boxShadow: dm.shadow,
              animation:
                'slideUp 0.7s 0.3s ease both',
            }}
          >
            <h2
              style={{
                color: dm.heading,
                marginBottom: '20px',
              }}
            >
              <i className="fas fa-pen"></i>{' '}
              Add Your Review
            </h2>
            <div
              style={{
                marginBottom: '15px',
              }}
            >
              <p
                style={{
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: dm.heading,
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
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Write your review..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border:
                  `1px solid ${dm.inputBorder}`,
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
                background: myRating
                  ? dm.btnBack
                  : darkMode
                    ? '#2a2a3a'
                    : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: myRating
                  ? 'pointer'
                  : 'not-allowed',
                transition:
                  'all 0.3s ease',
              }}
            >
              <i className="fas fa-paper-plane"></i>{' '}
              Submit Review
            </button>
          </div>
        ) : (
          <div
            style={{
              background: dm.successBg,
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center',
              animation:
                'successPop 0.6s ease both',
            }}
          >
            <i
              className="fas fa-check-circle"
              style={{
                fontSize: '3rem',
                color: '#10b981',
                marginBottom: '15px',
                display: 'block',
              }}
            ></i>
            <h3 style={{ color: dm.heading }}>
              Review Submitted!
            </h3>
            <p style={{ color: dm.text }}>
              Thank you for your feedback 🎉
            </p>
          </div>
        )}
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
          'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* TITLE */}
      <h1
        style={{
          color: dm.heading,
          textAlign: 'center',
          animation:
            'slideUp 0.7s ease both',
        }}
      >
        <i className="fas fa-book-open"></i>{' '}
        Our Courses
      </h1>
      {/* SEARCH */}
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto 40px',
          padding: '0 20px',
          animation:
            'slideUp 0.7s 0.15s ease both',
        }}
      >
        <div
          style={{
            position: 'relative',
            marginBottom: '20px',
          }}
        >
          <i
            className="fas fa-search"
            style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform:
                'translateY(-50%)',
              color: dm.subtext,
            }}
          ></i>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              width: '100%',
              padding:
                '14px 14px 14px 45px',
              borderRadius: '10px',
              border:
                `2px solid ${dm.inputBorder}`,
              fontSize: '1rem',
              outline: 'none',
              background: dm.input,
              color: dm.inputColor,
              boxSizing: 'border-box',
            }}
          />
        </div>
        {/* CATEGORIES */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setCategory(cat)
              }
              style={{
                padding:
                  '8px 20px',
                borderRadius: '20px',
                border:
                  `2px solid ${dm.catBorder}`,
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
                transition:
                  'all 0.3s ease',
                transform:
                  category === cat
                    ? 'scale(1.05)'
                    : 'scale(1)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* ERROR */}
      {error && (
        <div
          style={{
            maxWidth: '700px',
            margin: '0 auto 30px',
            padding: '15px',
            background: '#fff1f2',
            color: '#dc2626',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <i className="fas fa-exclamation-circle"></i>{' '}
          {error}
          <button
            onClick={fetchCourses}
            style={{
              marginLeft: '10px',
              border: 'none',
              background: '#dc2626',
              color: 'white',
              padding: '7px 15px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
      {/* NO COURSES */}
      {filteredCourses.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: dm.subtext,
            animation:
              'fadeIn 0.5s ease both',
          }}
        >
          <i
            className="fas fa-book-open"
            style={{
              fontSize: '4rem',
              marginBottom: '20px',
              display: 'block',
              color: dm.heading,
            }}
          ></i>
          <h2 style={{ color: dm.heading }}>
            No Courses Found
          </h2>
          <p>
            Try another search or category.
          </p>
        </div>
      ) : (
        /* COURSES */
        <div className="courses-container">
          {filteredCourses.map(
            (course, index) => {
              const courseIcon =
                getCourseIcon(
                  course.category
                );
              return (
                <div
                  key={course.id}
                  className="course-card"
                  onClick={() =>
                    handleSelectCourse(course)
                  }
                  style={{
                    background: dm.card,
                    boxShadow: dm.shadow,
                    animation:
                      'courseCardEntrance 0.7s ease both',
                    animationDelay:
                      `${index * 0.1}s`,
                    cursor: 'pointer',
                  }}
                >
                  {/* ICON */}
                  <div
                    className="card-icon"
                    style={{
                      color:
                        courseIcon.color,
                    }}
                  >
                    <i
                      className={
                        courseIcon.icon
                      }
                    ></i>
                  </div>
                  {/* CATEGORY */}
                  <span
                    style={{
                      background:
                        dm.tagBg,
                      padding:
                        '4px 12px',
                      borderRadius:
                        '20px',
                      fontSize:
                        '0.8rem',
                      color:
                        dm.tagColor,
                      marginBottom:
                        '10px',
                      display:
                        'inline-block',
                    }}
                  >
                    {course.category ||
                      'General'}
                  </span>
                  {/* TITLE */}
                  <h3
                    style={{
                      color:
                        dm.heading,
                    }}
                  >
                    {course.title}
                  </h3>
                  {/* STUDENTS + RATING */}
                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      margin:
                        '15px 0',
                      gap: '10px',
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <span
                      style={{
                        color:
                          dm.subtext,
                        fontSize:
                          '0.9rem',
                      }}
                    >
                      <i className="fas fa-users"></i>{' '}
                      {course.students ||
                        0}{' '}
                      students
                    </span>
                    <span
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: '5px',
                        color:
                          dm.subtext,
                        fontSize:
                          '0.9rem',
                      }}
                    >
                      <i
                        className="fas fa-star"
                        style={{
                          color:
                            '#f0a500',
                        }}
                      ></i>
                      {course.rating ||
                        'No rating'}
                    </span>
                  </div>
                  {/* BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCourse(
                        course
                      );
                    }}
                    style={{
                      background:
                        dm.btnBack,
                      color:
                        'white',
                      border:
                        'none',
                      padding:
                        '10px 20px',
                      borderRadius:
                        '8px',
                      cursor:
                        'pointer',
                      fontWeight:
                        '600',
                      transition:
                        'all 0.3s ease',
                    }}
                  >
                    <i className="fas fa-arrow-right"></i>{' '}
                    View Details
                  </button>
                </div>
              );
            }
          )}
        </div>
      )}
      {/* ANIMATIONS */}
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
