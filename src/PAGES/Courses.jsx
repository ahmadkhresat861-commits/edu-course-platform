import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const StarRating = ({ rating = 0, onRate }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '5px',
        animation: 'fadeIn 0.5s ease both',
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={star <= Math.round(rating) ? 'fas fa-star' : 'far fa-star'}
          style={{
            color: '#f0a500',
            cursor: onRate ? 'pointer' : 'default',
            fontSize: '1.2rem',
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

const getCourseIcon = (category) => {
  const icons = {
    Frontend: 'fas fa-code',
    Backend: 'fas fa-server',
    Design: 'fas fa-paint-brush',
    Programming: 'fas fa-laptop-code',
    Database: 'fas fa-database',
    Marketing: 'fas fa-bullhorn',
    Business: 'fas fa-briefcase',
  };

  return icons[category] || 'fas fa-book-open';
};

const getCourseColor = (category) => {
  const colors = {
    Frontend: '#61dafb',
    Backend: '#10b981',
    Design: '#ff6b6b',
    Programming: '#f0a500',
    Database: '#6366f1',
    Marketing: '#ec4899',
    Business: '#8b5cf6',
  };

  return colors[category] || '#003366';
};

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

  const [pageVisible, setPageVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // ==========================================
  // LOAD COURSES FROM SUPABASE
  // ==========================================

  useEffect(() => {
    setPageVisible(true);
    fetchCourses();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const fetchCourses = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
    } else {
      setCourses(data || []);
    }

    setLoading(false);
  };

  // ==========================================
  // OPEN COURSE DETAILS
  // ==========================================

  useEffect(() => {
    if (selected) {
      setDetailsVisible(false);

      const timer = setTimeout(() => {
        setDetailsVisible(true);
      }, 100);

      fetchReviews();

      return () => clearTimeout(timer);
    }
  }, [selected]);

  // ==========================================
  // FETCH REVIEWS
  // ==========================================

  const fetchReviews = async () => {
    if (!selected) return;

    setReviewsLoading(true);

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

    setReviewsLoading(false);
  };

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleSubmitReview = async () => {
    if (!myRating) return;

    if (!user) {
      alert('Please login first to submit a review.');
      return;
    }

    setReviewsLoading(true);

    const { error } = await supabase
      .from('reviews')
      .upsert(
        {
          course_id: selected.id,
          user_id: user.id,
          rating: myRating,
          comment: comment,
        },
        {
          onConflict: 'user_id,course_id',
        }
      );

    if (error) {
      console.error('Error submitting review:', error);
      alert(error.message);
    } else {
      setSubmitted(true);
      await fetchReviews();
    }

    setReviewsLoading(false);
  };

  // ==========================================
  // BACK TO COURSES
  // ==========================================

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

  // ==========================================
  // CALCULATE REVIEWS RATING
  // ==========================================

  const avgReviewRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + Number(review.rating), 0) /
        reviews.length
      ).toFixed(1)
    : null;

  // ==========================================
  // CATEGORIES FROM DATABASE
  // ==========================================

  const categories = [
    'All',
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ];

  // ==========================================
  // FILTER COURSES
  // ==========================================

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      category === 'All' || course.category === category;

    const searchText = search.toLowerCase();

    const matchesSearch =
      course.title?.toLowerCase().includes(searchText) ||
      course.category?.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  // ==========================================
  // LOADING
  // ==========================================

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
        <div
          style={{
            width: '60px',
            height: '60px',
            border: '5px solid rgba(0,51,102,0.15)',
            borderTop: '5px solid #003366',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />

        <p
          style={{
            marginTop: '20px',
            color: dm.heading,
            fontWeight: '600',
          }}
        >
          Loading courses...
        </p>

        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </section>
    );
  }

  // ==========================================
  // COURSE DETAILS
  // ==========================================

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
          transition: 'opacity 0.5s ease, transform 0.5s ease',
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
            transition: 'all 0.3s ease',
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

        {/* COURSE INFO */}

        <div
          style={{
            textAlign: 'center',
            marginBottom: '40px',
            animation: 'slideUp 0.7s ease both',
          }}
        >
          <i
            className={getCourseIcon(selected.category)}
            style={{
              fontSize: '4rem',
              color: getCourseColor(selected.category),
              marginBottom: '15px',
              display: 'block',
              animation: 'courseIconFloat 3s ease-in-out infinite',
            }}
          ></i>

          <span
            style={{
              display: 'inline-block',
              background: dm.tagBg,
              color: dm.tagColor,
              padding: '6px 15px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '15px',
            }}
          >
            {selected.category || 'General'}
          </span>

          <h1 style={{ color: dm.heading }}>
            {selected.title}
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '25px',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            <div style={{ color: dm.text }}>
              <i className="fas fa-users"></i>{' '}
              {selected.students || 0} Students
            </div>

            <div style={{ color: dm.text }}>
              <StarRating rating={selected.rating || 0} />
            </div>

            <div style={{ color: dm.text }}>
              {selected.rating
                ? `${Number(selected.rating).toFixed(1)} / 5`
                : 'No rating'}
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
            animation: 'slideUp 0.7s 0.2s ease both',
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
            <p
              style={{
                color: dm.subtext,
                textAlign: 'center',
              }}
            >
              <i className="fas fa-spinner fa-spin"></i>{' '}
              Loading reviews...
            </p>
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
            <>
              {avgReviewRating && (
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '25px',
                  }}
                >
                  <h3 style={{ color: dm.heading }}>
                    {avgReviewRating} / 5
                  </h3>

                  <StarRating
                    rating={Math.round(avgReviewRating)}
                  />

                  <p style={{ color: dm.subtext }}>
                    Based on {reviews.length} reviews
                  </p>
                </div>
              )}

              {reviews.map((review, index) => (
                <div
                  key={review.id || index}
                  style={{
                    padding: '15px 0',
                    borderBottom: `1px solid ${dm.cardBorder}`,
                    animation: 'fadeIn 0.5s ease both',
                  }}
                >
                  <StarRating rating={review.rating} />

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
              ))}
            </>
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
              animation: 'slideUp 0.7s 0.3s ease both',
            }}
          >
            <h2
              style={{
                color: dm.heading,
                marginBottom: '20px',
              }}
            >
              <i className="fas fa-pen"></i> Add Your Review
            </h2>

            {!user ? (
              <p
                style={{
                  textAlign: 'center',
                  color: dm.subtext,
                  marginBottom: '20px',
                }}
              >
                Please login to leave a review.
              </p>
            ) : (
              <>
                <div style={{ marginBottom: '15px' }}>
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
                  onChange={(e) => setComment(e.target.value)}
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
                  disabled={!myRating || reviewsLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background:
                      myRating && !reviewsLoading
                        ? dm.btnBack
                        : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor:
                      myRating && !reviewsLoading
                        ? 'pointer'
                        : 'not-allowed',
                  }}
                >
                  <i className="fas fa-paper-plane"></i>{' '}
                  {reviewsLoading
                    ? 'Submitting...'
                    : 'Submit Review'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              background: dm.successBg,
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center',
              animation: 'successPop 0.6s ease both',
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
              Review Submitted! Thank you 🎉
            </h3>
          </div>
        )}

        <style>
          {`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
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
  }

  // ==========================================
  // COURSES LIST
  // ==========================================

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
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* TITLE */}

      <h1
        style={{
          color: dm.heading,
          textAlign: 'center',
          animation: 'slideUp 0.7s ease both',
        }}
      >
        <i className="fas fa-book-open"></i> Our Courses
      </h1>

      {/* SEARCH */}

      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto 40px',
          padding: '0 20px',
          animation: 'slideUp 0.7s 0.15s ease both',
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
              transform: 'translateY(-50%)',
              color: dm.subtext,
            }}
          ></i>

          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* NO COURSES */}

      {courses.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: dm.subtext,
            animation: 'fadeIn 0.5s ease both',
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
            No Courses Available
          </h2>

          <p>
            There are no courses available at the moment.
            Check back soon!
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            color: dm.subtext,
          }}
        >
          <i
            className="fas fa-search"
            style={{
              fontSize: '3rem',
              marginBottom: '15px',
              display: 'block',
            }}
          ></i>

          <p>No courses found</p>
        </div>
      ) : (
        /* COURSES */

        <div className="courses-container">
          {filteredCourses.map((course, index) => (
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
                cursor: 'pointer',
              }}
            >
              {/* ICON */}

              <div
                className="card-icon"
                style={{
                  color: getCourseColor(course.category),
                }}
              >
                <i
                  className={getCourseIcon(course.category)}
                ></i>
              </div>

              {/* CATEGORY */}

              <span
                style={{
                  background: dm.tagBg,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: dm.tagColor,
                  marginBottom: '10px',
                  display: 'inline-block',
                }}
              >
                {course.category || 'General'}
              </span>

              {/* TITLE */}

              <h3 style={{ color: dm.heading }}>
                {course.title}
              </h3>

              {/* STUDENTS + RATING */}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '15px 0',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    color: dm.subtext,
                    fontSize: '0.85rem',
                  }}
                >
                  <i className="fas fa-users"></i>{' '}
                  {course.students || 0}
                </span>

                <span
                  style={{
                    color: dm.subtext,
                    fontSize: '0.85rem',
                  }}
                >
                  <i
                    className="fas fa-star"
                    style={{ color: '#f0a500' }}
                  ></i>{' '}
                  {course.rating
                    ? Number(course.rating).toFixed(1)
                    : 'New'}
                </span>
              </div>

              {/* BUTTON */}

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
                  width: '100%',
                }}
              >
                <i className="fas fa-arrow-right"></i>{' '}
                View Details
              </button>
            </div>
          ))}
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

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
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
