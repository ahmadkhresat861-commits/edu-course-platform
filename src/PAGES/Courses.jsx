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
        alignItems: 'center',
        animation: 'fadeIn 0.5s ease both',
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
            transition: 'transform 0.2s ease, color 0.2s ease',
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
  const [submittingReview, setSubmittingReview] = useState(false);

  const [pageVisible, setPageVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // ============================================================
  // LOAD COURSES
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageVisible(true);
    }, 100);

    fetchCourses();
    getCurrentUser();

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // GET CURRENT USER
  // ============================================================

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  };

  // ============================================================
  // FETCH COURSES FROM SUPABASE
  // ============================================================

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

  // ============================================================
  // OPEN COURSE DETAILS
  // ============================================================

  const openCourse = async (course) => {
    setDetailsVisible(false);
    setSelected(course);
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } else {
      setReviews(data || []);

      // Check if current user already reviewed this course
      if (user) {
        const existingReview = data?.find(
          (review) => review.user_id === user.id
        );

        if (existingReview) {
          setMyRating(existingReview.rating);
          setComment(existingReview.comment || '');
          setSubmitted(true);
        }
      }
    }

    setReviewsLoading(false);
  };

  // ============================================================
  // SUBMIT / UPDATE REVIEW
  // ============================================================

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Please login first to submit a review.');
      return;
    }

    if (!myRating) {
      alert('Please select a rating first.');
      return;
    }

    setSubmittingReview(true);

    const { error } = await supabase
      .from('reviews')
      .upsert(
        {
          user_id: user.id,
          course_id: selected.id,
          rating: myRating,
          comment: comment,
        },
        {
          onConflict: 'user_id,course_id',
        }
      );

    if (error) {
      console.error('Review error:', error);
      alert(error.message);
    } else {
      setSubmitted(true);

      await fetchReviews(selected.id);

      // Recalculate course rating
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('course_id', selected.id);

      if (allReviews && allReviews.length > 0) {
        const newRating =
          allReviews.reduce((sum, item) => sum + item.rating, 0) /
          allReviews.length;

        await supabase
          .from('courses')
          .update({
            rating: Number(newRating.toFixed(1)),
          })
          .eq('id', selected.id);

        setSelected({
          ...selected,
          rating: Number(newRating.toFixed(1)),
        });

        fetchCourses();
      }
    }

    setSubmittingReview(false);
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

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : selected?.rating || null;

  // ============================================================
  // FILTER COURSES
  // ============================================================

  const categories = [
    'All',
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ];

  const filtered = courses.filter((course) => {
    const matchesCategory =
      category === 'All' || course.category === category;

    const searchText = search.toLowerCase();

    const matchesSearch =
      course.title?.toLowerCase().includes(searchText) ||
      course.category?.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  // ============================================================
  // LOADING COURSES
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
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: dm.heading,
            animation: 'fadeIn 0.5s ease both',
          }}
        >
          <i
            className="fas fa-spinner fa-spin"
            style={{
              fontSize: '3rem',
              marginBottom: '15px',
            }}
          ></i>

          <p>Loading courses...</p>
        </div>
      </section>
    );
  }

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
            animation: 'slideUp 0.7s ease both',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, #003366, #005599)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 10px 30px rgba(0,51,102,0.25)',
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
              color: dm.tagColor,
              padding: '6px 15px',
              borderRadius: '20px',
              fontSize: '0.85rem',
            }}
          >
            {selected.category || 'Course'}
          </span>

          <h1
            style={{
              color: dm.heading,
              marginTop: '15px',
            }}
          >
            {selected.title}
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            <div>
              <i
                className="fas fa-users"
                style={{
                  color: '#10b981',
                  marginRight: '6px',
                }}
              ></i>

              <span style={{ color: dm.text }}>
                {selected.students || 0} Students
              </span>
            </div>

            <div>
              <i
                className="fas fa-star"
                style={{
                  color: '#f0a500',
                  marginRight: '6px',
                }}
              ></i>

              <span style={{ color: dm.text }}>
                {avgRating || 'No rating'}
              </span>
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
            reviews.map((review, index) => (
              <div
                key={review.id || index}
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

            <p
              style={{
                color: dm.subtext,
                marginBottom: '20px',
              }}
            >
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
              disabled={
                !myRating || submittingReview
              }
              style={{
                width: '100%',
                padding: '14px',
                background:
                  myRating && !submittingReview
                    ? dm.btnBack
                    : darkMode
                    ? '#2a2a3a'
                    : '#ccc',

                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',

                cursor:
                  myRating && !submittingReview
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              <i className="fas fa-paper-plane"></i>{' '}

              {submittingReview
                ? 'Submitting...'
                : 'Submit Review'}
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
              Thank you for sharing your experience 🎉
            </p>
          </div>
        )}

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

            @keyframes fadeIn {
              from {
                opacity: 0;
              }

              to {
                opacity: 1;
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

        transform:
          pageVisible
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

      {/* Search + Categories */}

      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto 40px',
          padding: '0 20px',
          animation:
            'slideUp 0.7s 0.15s ease both',
        }}
      >
        {/* Search */}

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

      {/* No Results */}

      {filtered.length === 0 ? (
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

          <p>
            No courses found
          </p>
        </div>
      ) : (
        <div className="courses-container">
          {filtered.map(
            (course, index) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() =>
                  openCourse(course)
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
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color:
                      dm.tagColor,
                    marginBottom:
                      '10px',
                    display:
                      'inline-block',
                  }}
                >
                  {course.category}
                </span>

                {/* Title */}

                <h3
                  style={{
                    color: dm.heading,
                  }}
                >
                  {course.title}
                </h3>

                {/* Stats */}

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    margin:
                      '15px 0',
                    color:
                      dm.subtext,
                    fontSize:
                      '0.9rem',
                  }}
                >
                  <span>
                    <i className="fas fa-users"></i>{' '}
                    {course.students || 0}
                  </span>

                  <span>
                    <i
                      className="fas fa-star"
                      style={{
                        color:
                          '#f0a500',
                      }}
                    ></i>{' '}
                    {course.rating || 'New'}
                  </span>
                </div>

                {/* Button */}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCourse(course);
                  }}
                  style={{
                    background:
                      dm.btnBack,
                    color: 'white',
                    border: 'none',
                    padding:
                      '10px 20px',
                    borderRadius:
                      '8px',
                    cursor:
                      'pointer',
                    fontWeight:
                      '600',
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

      <style>
        {`
          @keyframes courseCardEntrance {
            from {
              opacity: 0;
              transform:
                translateY(35px)
                scale(0.96);
            }

            to {
              opacity: 1;
              transform:
                translateY(0)
                scale(1);
            }
          }
        `}
      </style>
    </section>
  );
};

export default Courses;
