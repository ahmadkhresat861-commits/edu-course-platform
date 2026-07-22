import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const StarRating = ({ rating, onRate }) => (
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
        className={star <= Math.round(rating || 0) ? 'fas fa-star' : 'far fa-star'}
        style={{
          color: '#f0a500',
          cursor: onRate ? 'pointer' : 'default',
          fontSize: '1.2rem',
          transition: 'transform 0.2s ease',
        }}
        onClick={() => onRate && onRate(star)}
        onMouseEnter={(e) => {
          if (onRate) e.currentTarget.style.transform = 'scale(1.25)';
        }}
        onMouseLeave={(e) => {
          if (onRate) e.currentTarget.style.transform = 'scale(1)';
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
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [pageVisible, setPageVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // ============================================================
  // LOAD PAGE
  // ============================================================

  useEffect(() => {
    setTimeout(() => {
      setPageVisible(true);
    }, 100);

    fetchCourses();
    getUser();
  }, []);

  // ============================================================
  // GET USER
  // ============================================================

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  };

  // ============================================================
  // FETCH COURSES
  // ============================================================

  const fetchCourses = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
    }

    if (data) {
      setCourses(data);
    }

    setLoading(false);
  };

  // ============================================================
  // SELECT COURSE
  // ============================================================

  const handleSelectCourse = async (course) => {
    setSelected(course);
    setDetailsVisible(false);

    setTimeout(() => {
      setDetailsVisible(true);
    }, 100);

    setReviews([]);
    setSubmitted(false);
    setMyRating(0);
    setComment('');

    await fetchReviews(course.id);

    if (user) {
      await checkEnrollment(course.id);
    }
  };

  // ============================================================
  // FETCH REVIEWS
  // ============================================================

  const fetchReviews = async (courseId) => {
    setReviewLoading(true);

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    }

    if (data) {
      setReviews(data);
    }

    setReviewLoading(false);
  };

  // ============================================================
  // CHECK ENROLLMENT
  // ============================================================

  const checkEnrollment = async (courseId) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error('Error checking enrollment:', error);
      return;
    }

    setIsEnrolled(!!data);
  };

  // ============================================================
  // ENROLL
  // ============================================================

  const handleEnroll = async () => {
    if (!user) {
      alert('Please login first to enroll in this course.');
      return;
    }

    if (!selected) return;

    if (isEnrolled) return;

    setEnrollLoading(true);

    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: selected.id,
        progress: 0,
        completed: false,
      });

    if (error) {
      console.error('Enrollment error:', error);

      if (error.code === '23505') {
        alert('You are already enrolled in this course.');
        setIsEnrolled(true);
      } else {
        alert('Something went wrong. Please try again.');
      }

      setEnrollLoading(false);
      return;
    }

    // Update students count
    await supabase
      .from('courses')
      .update({
        students: (selected.students || 0) + 1,
      })
      .eq('id', selected.id);

    setSelected({
      ...selected,
      students: (selected.students || 0) + 1,
    });

    setIsEnrolled(true);

    setEnrollLoading(false);
  };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Please login first to submit a review.');
      return;
    }

    if (!myRating) {
      alert('Please select a rating.');
      return;
    }

    setReviewLoading(true);

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
      console.error('Review error:', error);
      alert('Could not submit your review.');
      setReviewLoading(false);
      return;
    }

    setSubmitted(true);

    await fetchReviews(selected.id);

    setReviewLoading(false);
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
    }, 250);
  };

  // ============================================================
  // AVERAGE RATING
  // ============================================================

  const avgRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + Number(review.rating), 0) /
        reviews.length
      ).toFixed(1)
    : selected?.rating || 0;

  // ============================================================
  // CATEGORIES
  // ============================================================

  const categories = [
    'All',
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ];

  // ============================================================
  // FILTER COURSES
  // ============================================================

  const filtered = courses.filter((course) => {
    const matchesCategory =
      category === 'All' || course.category === category;

    const matchesSearch =
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.category?.toLowerCase().includes(search.toLowerCase());

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
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >

        {/* Back */}
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
          <i
            className="fas fa-book-open"
            style={{
              fontSize: '4rem',
              color: '#f0a500',
              marginBottom: '15px',
              display: 'block',
              animation: 'courseIconFloat 3s ease-in-out infinite',
            }}
          ></i>

          <h1 style={{ color: dm.heading }}>
            {selected.title}
          </h1>

          <p style={{ color: dm.text }}>
            {selected.category}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: dm.text }}>
              <i className="fas fa-users"></i>{' '}
              {selected.students || 0} Students
            </span>

            <span style={{ color: dm.text }}>
              <i className="fas fa-star" style={{ color: '#f0a500' }}></i>{' '}
              {avgRating || 'No rating'}
            </span>
          </div>
        </div>

        {/* Enrollment Card */}
        <div
          style={{
            background: dm.reviewBg,
            borderRadius: '12px',
            padding: '30px',
            boxShadow: dm.shadow,
            marginBottom: '30px',
            textAlign: 'center',
            animation: 'slideUp 0.7s 0.1s ease both',
          }}
        >
          {isEnrolled ? (
            <>
              <i
                className="fas fa-check-circle"
                style={{
                  fontSize: '3rem',
                  color: '#10b981',
                  marginBottom: '15px',
                }}
              ></i>

              <h2 style={{ color: dm.heading }}>
                You are enrolled!
              </h2>

              <p style={{ color: dm.text }}>
                You can continue learning from your dashboard.
              </p>

              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  marginTop: '15px',
                  padding: '12px 25px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-chart-line"></i> Go to Dashboard
              </button>
            </>
          ) : (
            <>
              <h2 style={{ color: dm.heading }}>
                Start Learning Today
              </h2>

              <p style={{ color: dm.text }}>
                Enroll in this course and start your learning journey.
              </p>

              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                style={{
                  marginTop: '15px',
                  padding: '14px 35px',
                  background: enrollLoading
                    ? '#888'
                    : 'linear-gradient(90deg, #003366, #005599)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: enrollLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(0,51,102,0.25)',
                }}
              >
                <i className="fas fa-graduation-cap"></i>{' '}
                {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </>
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
          }}
        >
          <h2 style={{ color: dm.heading }}>
            <i className="fas fa-star"></i> Reviews
          </h2>

          {reviewLoading ? (
            <p style={{ color: dm.subtext, textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin"></i> Loading...
            </p>
          ) : reviews.length === 0 ? (
            <p style={{ color: dm.subtext, textAlign: 'center' }}>
              No reviews yet. Be the first!
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: '15px 0',
                  borderBottom: `1px solid ${dm.cardBorder}`,
                }}
              >
                <StarRating rating={review.rating} />

                {review.comment && (
                  <p style={{ color: dm.text }}>
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
            }}
          >
            <h2 style={{ color: dm.heading }}>
              <i className="fas fa-pen"></i> Add Your Review
            </h2>

            <p style={{ color: dm.text }}>
              Your Rating:
            </p>

            <StarRating
              rating={myRating}
              onRate={setMyRating}
            />

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
              disabled={!myRating || reviewLoading}
              style={{
                width: '100%',
                padding: '14px',
                background:
                  myRating && !reviewLoading
                    ? dm.btnBack
                    : '#888',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor:
                  myRating && !reviewLoading
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              <i className="fas fa-paper-plane"></i>{' '}
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
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
              }}
            ></i>

            <h3 style={{ color: dm.heading }}>
              Review Submitted! Thank you 🎉
            </h3>
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
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >

      <h1
        style={{
          color: dm.heading,
          textAlign: 'center',
        }}
      >
        <i className="fas fa-book-open"></i> Our Courses
      </h1>

      {/* Search */}
      <div
        style={{
          maxWidth: '700px',
          margin: '30px auto 40px',
        }}
      >
        <div style={{ position: 'relative' }}>
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
              background: dm.input,
              color: dm.inputColor,
              fontSize: '1rem',
              boxSizing: 'border-box',
              outline: 'none',
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
            marginTop: '20px',
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

      {/* Loading */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px',
            color: dm.heading,
          }}
        >
          <i
            className="fas fa-spinner fa-spin"
            style={{ fontSize: '3rem' }}
          ></i>

          <p>Loading courses...</p>
        </div>
      ) : filtered.length === 0 ? (
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
              onClick={() => handleSelectCourse(course)}
              style={{
                background: dm.card,
                boxShadow: dm.shadow,
                animation: 'courseCardEntrance 0.7s ease both',
                animationDelay: `${index * 0.1}s`,
                cursor: 'pointer',
              }}
            >
              <div
                className="card-icon"
                style={{
                  color: '#f0a500',
                }}
              >
                <i className="fas fa-book-open"></i>
              </div>

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
                {course.category}
              </span>

              <h3 style={{ color: dm.heading }}>
                {course.title}
              </h3>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  margin: '15px 0',
                  color: dm.subtext,
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
                  {course.rating || 0}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCourse(course);
                }}
                style={{
                  background: dm.btnBack,
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
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
        `}
      </style>
    </section>
  );
};

export default Courses;
