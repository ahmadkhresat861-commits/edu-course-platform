import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const StarRating = ({ rating, onRate }) => (
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
        className={star <= rating ? 'fas fa-star' : 'far fa-star'}
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

const Courses = () => {
  const { darkMode } = useLang();

  const dm = {
    bg: darkMode ? '#0f1117' : '#f5f7fa',
    card: darkMode ? '#1e2130' : '#ffffff',
    cardBorder: darkMode ? '#2e3250' : '#eeeeee',
    heading: darkMode ? '#a0b4ff' : '#003366',
    text: darkMode ? '#c8d0e0' : '#555',
    subtext: darkMode ? '#7a8499' : '#888',
    input: darkMode ? '#1e2130' : '#ffffff',
    inputBorder: darkMode ? '#3a4060' : '#dddddd',
    inputColor: darkMode ? '#e0e6f0' : '#333',
    catActive: darkMode ? '#ffffff' : '#ffffff',
    catActiveBg: darkMode ? '#2a3580' : '#003366',
    catBorder: darkMode ? '#a0b4ff' : '#003366',
    catInactive: darkMode ? '#a0b4ff' : '#003366',
    reviewBg: darkMode ? '#161a28' : '#ffffff',
    successBg: darkMode ? '#0d2318' : '#f0fff4',
    shadow: darkMode
      ? '0 8px 30px rgba(0,0,0,0.4)'
      : '0 8px 25px rgba(0,0,0,0.08)',
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

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [pageVisible, setPageVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

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
  // PAGE ANIMATION
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // FETCH COURSES FROM SUPABASE
  // ============================================================

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Courses error:', error);
    } else {
      setCourses(data || []);
    }

    setLoadingCourses(false);
  };

  // ============================================================
  // FETCH REVIEWS
  // ============================================================

  const fetchReviews = async (courseId) => {
    if (!courseId) return;

    setLoadingReviews(true);

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('course_id', courseId)
      .order('id', { ascending: false });

    if (error) {
      console.error('Reviews error:', error);
      setReviews([]);
    } else {
      setReviews(data || []);

      // Find user's existing review
      if (user) {
        const existingReview = (data || []).find(
          (review) => review.user_id === user.id
        );

        if (existingReview) {
          setMyRating(existingReview.rating);
          setComment(existingReview.comment || '');
        }
      }
    }

    setLoadingReviews(false);
  };

  // ============================================================
  // SELECT COURSE
  // ============================================================

  const handleSelectCourse = async (course) => {
    setSelected(course);
    setDetailsVisible(false);
    setSubmitted(false);
    setMyRating(0);
    setComment('');
    setReviews([]);

    setTimeout(() => {
      setDetailsVisible(true);
    }, 100);

    await fetchReviews(course.id);
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
    }, 300);
  };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Please login first to submit a review.');
      return;
    }

    if (!selected) {
      return;
    }

    if (!myRating) {
      alert('Please select a rating.');
      return;
    }

    setSubmittingReview(true);

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
      console.error('Review submit error:', error);

      alert(
        'Could not submit your review. Please make sure you are logged in.'
      );

      setSubmittingReview(false);
      return;
    }

    setSubmitted(true);

    await fetchReviews(selected.id);

    setSubmittingReview(false);
  };

  // ============================================================
  // CALCULATE RATING
  // ============================================================

  const avgRating = reviews.length
    ? (
        reviews.reduce(
          (total, review) => total + Number(review.rating || 0),
          0
        ) / reviews.length
      ).toFixed(1)
    : selected?.rating || null;

  // ============================================================
  // GET CATEGORIES
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
      course.title?.toLowerCase().includes(searchText) ||
      course.category?.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

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

          transition:
            'opacity 0.5s ease, transform 0.5s ease',
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

        {/* Course Info */}

        <div
          style={{
            textAlign: 'center',
            marginBottom: '40px',
            animation:
              'slideUp 0.7s ease both',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 20px',
              borderRadius: '25px',
              background:
                'linear-gradient(135deg, #003366, #005599)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 15px 35px rgba(0,51,102,0.25)',
              animation:
                'courseIconFloat 3s ease-in-out infinite',
            }}
          >
            <i
              className="fas fa-book-open"
              style={{
                fontSize: '3rem',
                color: '#f0a500',
              }}
            ></i>
          </div>

          <span
            style={{
              background: dm.tagBg,
              padding: '6px 15px',
              borderRadius: '20px',
              color: dm.tagColor,
              fontSize: '0.85rem',
            }}
          >
            {selected.category || 'General'}
          </span>

          <h1
            style={{
              color: dm.heading,
              marginTop: '20px',
            }}
          >
            {selected.title}
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            <div style={{ color: dm.text }}>
              <i className="fas fa-users"></i>{' '}
              {selected.students || 0} Students
            </div>

            <div style={{ color: dm.text }}>
              <i
                className="fas fa-star"
                style={{ color: '#f0a500' }}
              ></i>{' '}
              {avgRating || 'No rating'}
            </div>
          </div>
        </div>

        {/* Reviews */}

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

          {loadingReviews ? (
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
                  color: dm.heading,
                }}
              ></i>

              <p style={{ color: dm.subtext }}>
                Loading reviews...
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px',
              }}
            >
              <i
                className="far fa-comment-dots"
                style={{
                  fontSize: '3rem',
                  color: dm.subtext,
                  marginBottom: '15px',
                }}
              ></i>

              <p style={{ color: dm.subtext }}>
                No reviews yet.
              </p>

              <p style={{ color: dm.subtext }}>
                Be the first student to review this course!
              </p>
            </div>
          ) : (
            reviews.map((review, index) => (
              <div
                key={review.id || index}
                style={{
                  padding: '20px 0',
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
                      marginTop: '10px',
                      lineHeight: '1.6',
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

        {!user ? (
          <div
            style={{
              background: dm.reviewBg,
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center',
              boxShadow: dm.shadow,
            }}
          >
            <i
              className="fas fa-lock"
              style={{
                fontSize: '2.5rem',
                color: '#f0a500',
                marginBottom: '15px',
              }}
            ></i>

            <h3 style={{ color: dm.heading }}>
              Login Required
            </h3>

            <p style={{ color: dm.subtext }}>
              Please login to leave a review.
            </p>
          </div>
        ) : !submitted ? (
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

            <p
              style={{
                color: dm.heading,
                fontWeight: '600',
              }}
            >
              Your Rating:
            </p>

            <StarRating
              rating={myRating}
              onRate={setMyRating}
            />

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
                marginTop: '15px',
                marginBottom: '15px',
                background: dm.input,
                color: dm.inputColor,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            <button
              onClick={handleSubmitReview}
              disabled={
                !myRating ||
                submittingReview
              }
              style={{
                width: '100%',
                padding: '14px',
                background:
                  myRating && !submittingReview
                    ? dm.btnBack
                    : '#999',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor:
                  myRating &&
                  !submittingReview
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              {submittingReview ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>{' '}
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>{' '}
                  Submit Review
                </>
              )}
            </button>
          </div>
        ) : (
          <div
            style={{
              background: dm.successBg,
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              animation:
                'successPop 0.6s ease both',
            }}
          >
            <i
              className="fas fa-check-circle"
              style={{
                fontSize: '4rem',
                color: '#10b981',
                marginBottom: '15px',
              }}
            ></i>

            <h3 style={{ color: dm.heading }}>
              Review Submitted!
            </h3>

            <p style={{ color: dm.text }}>
              Thank you for sharing your experience 🎉
            </p>
          </div>
        )}

        {/* Animations */}

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

  // ============================================================
  // COURSES LIST
  // ============================================================

  return (
    <section
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
      {/* Title */}

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

      {/* Search */}

      <div
        style={{
          maxWidth: '700px',
          margin: '30px auto 40px',
          padding: '0 20px',
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

        {/* Categories */}

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
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}

      {loadingCourses ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '25px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(
            (item) => (
              <div
                key={item}
                style={{
                  height: '280px',
                  borderRadius: '15px',
                  background:
                    darkMode
                      ? '#1e2130'
                      : '#eeeeee',
                  animation:
                    'pulse 1.5s infinite',
                }}
              />
            )
          )}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: dm.subtext,
          }}
        >
          <i
            className="fas fa-search"
            style={{
              fontSize: '4rem',
              marginBottom: '20px',
              display: 'block',
            }}
          ></i>

          <h2>
            No Courses Found
          </h2>

          <p>
            Try another search or category.
          </p>
        </div>
      ) : (
        <div
          className="courses-container"
        >
          {filteredCourses.map(
            (course, index) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() =>
                  handleSelectCourse(course)
                }
                style={{
                  background: dm.card,
                  boxShadow: dm.shadow,
                  cursor: 'pointer',

                  animation:
                    'courseCardEntrance 0.7s ease both',

                  animationDelay:
                    `${index * 0.1}s`,
                }}
              >
                {/* Icon */}

                <div
                  className="card-icon"
                  style={{
                    color: '#f0a500',
                  }}
                >
                  <i className="fas fa-book-open"></i>
                </div>

                {/* Category */}

                <span
                  style={{
                    background: dm.tagBg,
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

                {/* Title */}

                <h3
                  style={{
                    color:
                      dm.heading,
                  }}
                >
                  {course.title}
                </h3>

                {/* Students */}

                <p
                  style={{
                    color:
                      dm.text,
                  }}
                >
                  <i className="fas fa-users"></i>{' '}
                  {course.students || 0}{' '}
                  Students
                </p>

                {/* Rating */}

                <div
                  style={{
                    margin:
                      '10px 0',
                  }}
                >
                  <StarRating
                    rating={Math.round(
                      Number(
                        course.rating || 0
                      )
                    )}
                  />

                  <span
                    style={{
                      color:
                        dm.subtext,
                      fontSize:
                        '0.85rem',
                    }}
                  >
                    {course.rating
                      ? Number(
                          course.rating
                        ).toFixed(1)
                      : 'No rating'}
                  </span>
                </div>

                {/* Button */}

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
                    width:
                      '100%',
                    marginTop:
                      '10px',
                  }}
                >
                  <i className="fas fa-arrow-right"></i>{' '}
                  View Details
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Local Animations */}

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

          @keyframes pulse {
            0%, 100% {
              opacity: 0.6;
            }

            50% {
              opacity: 1;
            }
          }
        `}
      </style>
    </section>
  );
};

export default Courses;
