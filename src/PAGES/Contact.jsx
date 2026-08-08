from pathlib import Path

code = r'''import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const StarRating = ({ rating = 0, onRate }) => (
  <div style={{ display: 'flex', gap: '5px' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <i
        key={star}
        className={star <= Number(rating) ? 'fas fa-star' : 'far fa-star'}
        style={{
          color: '#f0a500',
          cursor: onRate ? 'pointer' : 'default',
          fontSize: '1.2rem',
        }}
        onClick={() => onRate && onRate(star)}
      />
    ))}
  </div>
);

const Courses = () => {
  const { darkMode } = useLang();

  const dm = {
    bg: darkMode ? '#0f1117' : '#f5f7fa',
    card: darkMode ? '#1e2130' : '#ffffff',
    cardBorder: darkMode ? '#2e3250' : '#f0f0f0',
    heading: darkMode ? '#a0b4ff' : '#003366',
    text: darkMode ? '#c8d0e0' : '#555555',
    subtext: darkMode ? '#7a8499' : '#888888',
    input: darkMode ? '#1e2130' : '#ffffff',
    inputBorder: darkMode ? '#3a4060' : '#dddddd',
    inputColor: darkMode ? '#e0e6f0' : '#333333',
    catActive: '#ffffff',
    catActiveBg: darkMode ? '#2a3580' : '#003366',
    catBorder: darkMode ? '#a0b4ff' : '#003366',
    catInactive: darkMode ? '#a0b4ff' : '#003366',
    reviewBg: darkMode ? '#161a28' : '#ffffff',
    successBg: darkMode ? '#0d2318' : '#f0fff4',
    shadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.4)'
      : '0 4px 15px rgba(0,0,0,0.08)',
    tagBg: darkMode ? '#2a3050' : '#f0f0f0',
    tagColor: darkMode ? '#a0b4ff' : '#555555',
    btnBack: darkMode ? '#2a3580' : '#003366',
  };

  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [user, setUser] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  const [lessons, setLessons] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [learningStarted, setLearningStarted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);

  const [pageVisible, setPageVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!mounted) return;
        setUser(currentUser || null);

        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading courses:', error);
        }

        if (mounted) {
          setCourses(data || []);
          setTimeout(() => {
            if (mounted) setPageVisible(true);
          }, 100);
        }
      } catch (error) {
        console.error('Unexpected loading error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return;

    setDetailsVisible(false);
    setLearningStarted(false);
    setSelectedLesson(null);
    setLessons([]);
    setLessonProgress([]);
    setReviews([]);
    setEnrollment(null);

    const timer = setTimeout(() => setDetailsVisible(true), 100);

    fetchCourseData();

    return () => clearTimeout(timer);
  }, [selected?.id, user?.id]);

  const fetchCourseData = async () => {
    if (!selected) return;

    await Promise.all([
      fetchReviews(),
      checkEnrollment(),
      fetchLessons(),
    ]);
  };

  const fetchReviews = async () => {
    if (!selected) return;

    setReviewLoading(true);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('course_id', selected.id)
        .order('id', { ascending: false });

      if (error) {
        console.error('Error loading reviews:', error);
        setReviews([]);
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      console.error('Unexpected reviews error:', error);
      setReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user || !selected) {
      setEnrollment(null);
      setLessonProgress([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', selected.id)
        .maybeSingle();

      if (error) {
        console.error('Enrollment check error:', error);
        setEnrollment(null);
        return;
      }

      setEnrollment(data || null);

      if (data) {
        await fetchLessonProgress();
      }
    } catch (error) {
      console.error('Unexpected enrollment error:', error);
      setEnrollment(null);
    }
  };

  const fetchLessons = async () => {
    if (!selected) return;

    setLessonsLoading(true);

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(
          'id, course_id, title, description, content, lesson_order, video_uri, created_at'
        )
        .eq('course_id', selected.id)
        .order('lesson_order', { ascending: true });

      if (error) {
        console.error('Error loading lessons:', error);
        setLessons([]);
        return;
      }

      setLessons(data || []);
    } catch (error) {
      console.error('Unexpected lessons error:', error);
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  const fetchLessonProgress = async () => {
    if (!user || !selected) return;

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select(
          'id, user_id, course_id, lesson_id, completed, completed_at'
        )
        .eq('user_id', user.id)
        .eq('course_id', selected.id);

      if (error) {
        console.error('Error loading lesson progress:', error);
        setLessonProgress([]);
        return;
      }

      setLessonProgress(data || []);
    } catch (error) {
      console.error('Unexpected lesson progress error:', error);
      setLessonProgress([]);
    }
  };

  const handleEnroll = async () => {
    setMessage('');

    if (!user) {
      setMessage('Please login first to enroll in this course.');
      return;
    }

    if (!selected || enrollment) return;

    setEnrolling(true);

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: selected.id,
          progress: 0,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Enrollment error:', error);

        if (error.code === '23505') {
          setMessage('You are already enrolled in this course.');
          await checkEnrollment();
        } else {
          setMessage('Something went wrong. Please try again.');
        }

        return;
      }

      setEnrollment(data);

      const currentStudents = Number(selected.students) || 0;
      const newStudents = currentStudents + 1;

      const { error: updateError } = await supabase
        .from('courses')
        .update({ students: newStudents })
        .eq('id', selected.id);

      if (updateError) {
        console.error('Students count update error:', updateError);
      }

      const updatedCourse = {
        ...selected,
        students: newStudents,
      };

      setSelected(updatedCourse);

      setCourses((previousCourses) =>
        previousCourses.map((course) =>
          course.id === selected.id
            ? { ...course, students: newStudents }
            : course
        )
      );

      setMessage('You have successfully enrolled in this course! 🎉');
    } catch (error) {
      console.error('Unexpected enrollment error:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const isLessonCompleted = (lessonId) =>
    lessonProgress.some(
      (item) =>
        String(item.lesson_id) === String(lessonId) &&
        item.completed === true
    );

  const completedLessonsCount = useMemo(
    () => lessons.filter((lesson) => isLessonCompleted(lesson.id)).length,
    [lessons, lessonProgress]
  );

  const calculatedProgress =
    lessons.length > 0
      ? Math.round((completedLessonsCount / lessons.length) * 100)
      : Number(enrollment?.progress || 0);

  const handleStartLearning = () => {
    if (!enrollment) {
      setMessage('Please enroll in this course first.');
      return;
    }

    if (lessons.length === 0) {
      setMessage('No lessons have been added to this course yet.');
      return;
    }

    const firstIncomplete =
      lessons.find((lesson) => !isLessonCompleted(lesson.id)) ||
      lessons[0];

    setSelectedLesson(firstIncomplete);
    setLearningStarted(true);
    setMessage('');

    setTimeout(() => {
      const learningElement = document.getElementById('course-learning-area');
      if (learningElement) {
        learningElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 50);
  };

  const handleSelectLesson = (lesson) => {
    if (!enrollment) return;

    setSelectedLesson(lesson);
    setLearningStarted(true);
    setMessage('');
  };

  const handleCompleteLesson = async () => {
    if (!user || !selected || !enrollment || !selectedLesson) {
      return;
    }

    if (isLessonCompleted(selectedLesson.id)) {
      return;
    }

    setProgressLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: selected.id,
            lesson_id: selectedLesson.id,
            completed: true,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,course_id,lesson_id',
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Complete lesson error:', error);
        setMessage('Could not save lesson progress.');
        return;
      }

      setLessonProgress((previous) => {
        const exists = previous.some(
          (item) => String(item.lesson_id) === String(selectedLesson.id)
        );

        if (exists) {
          return previous.map((item) =>
            String(item.lesson_id) === String(selectedLesson.id)
              ? data
              : item
          );
        }

        return [...previous, data];
      });

      const newCompletedCount = completedLessonsCount + 1;
      const newProgress =
        lessons.length > 0
          ? Math.round((newCompletedCount / lessons.length) * 100)
          : 0;

      const completed = newProgress >= 100;

      const { data: updatedEnrollment, error: enrollmentError } =
        await supabase
          .from('enrollments')
          .update({
            progress: newProgress,
            completed,
          })
          .eq('id', enrollment.id)
          .select()
          .single();

      if (enrollmentError) {
        console.error(
          'Enrollment progress update error:',
          enrollmentError
        );
      } else {
        setEnrollment(updatedEnrollment);
      }

      setMessage(
        completed
          ? 'Congratulations! You completed this course! 🎉'
          : 'Lesson completed successfully! ✅'
      );

      const nextLesson = lessons.find(
        (lesson) =>
          lesson.lesson_order > selectedLesson.lesson_order &&
          !isLessonCompleted(lesson.id)
      );

      if (nextLesson) {
        setTimeout(() => {
          setSelectedLesson(nextLesson);
          setMessage('');
        }, 800);
      }
    } catch (error) {
      console.error('Unexpected complete lesson error:', error);
      setMessage('Could not save lesson progress.');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      setMessage('Please login first to leave a review.');
      return;
    }

    if (!myRating) {
      setMessage('Please select a rating first.');
      return;
    }

    if (!selected) return;

    setReviewLoading(true);
    setMessage('');

    try {
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
        console.error('Review error:', error);
        setMessage('Could not submit your review.');
        return;
      }

      setSubmitted(true);
      setMessage('Your review has been submitted successfully! ⭐');
      await fetchReviews();
    } catch (error) {
      console.error('Unexpected review error:', error);
      setMessage('Could not submit your review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBack = () => {
    setDetailsVisible(false);

    setTimeout(() => {
      setSelected(null);
      setReviews([]);
      setLessons([]);
      setLessonProgress([]);
      setSelectedLesson(null);
      setLearningStarted(false);
      setEnrollment(null);
      setSubmitted(false);
      setMyRating(0);
      setComment('');
      setMessage('');
    }, 250);
  };

  const avgRating = reviews.length
    ? (
        reviews.reduce(
          (total, review) => total + Number(review.rating || 0),
          0
        ) / reviews.length
      ).toFixed(1)
    : null;

  const categories = [
    'All',
    ...new Set(
      courses.map((course) => course.category).filter(Boolean)
    ),
  ];

  const filtered = courses.filter((course) => {
    const searchText = search.toLowerCase().trim();

    const matchesCategory =
      category === 'All' || course.category === category;

    const matchesSearch =
      course.title?.toLowerCase().includes(searchText) ||
      course.category?.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <section
        style={{
          minHeight: '100vh',
          background: dm.bg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <i
            className="fas fa-spinner fa-spin"
            style={{
              fontSize: '3rem',
              color: dm.heading,
              marginBottom: '15px',
            }}
          />
          <p style={{ color: dm.text }}>Loading courses...</p>
        </div>
      </section>
    );
  }

  if (selected) {
    return (
      <section
        style={{
          padding: '40px 20px 60px',
          maxWidth: '1000px',
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
        <button
          onClick={handleBack}
          style={{
            marginBottom: '30px',
            padding: '10px 20px',
            background: dm.btnBack,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          <i className="fas fa-arrow-left" /> Back
        </button>

        <div
          style={{
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '90px',
              height: '90px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #003366, #005599)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,51,102,0.25)',
            }}
          >
            <i
              className="fas fa-book-open"
              style={{ fontSize: '2.5rem', color: '#f0a500' }}
            />
          </div>

          <h1 style={{ color: dm.heading, marginBottom: '10px' }}>
            {selected.title}
          </h1>

          {selected.category && (
            <span
              style={{
                display: 'inline-block',
                padding: '6px 15px',
                background: dm.tagBg,
                color: dm.tagColor,
                borderRadius: '20px',
                fontSize: '0.85rem',
              }}
            >
              {selected.category}
            </span>
          )}

          {selected.description && (
            <p
              style={{
                maxWidth: '700px',
                margin: '20px auto 0',
                color: dm.text,
                lineHeight: '1.8',
              }}
            >
              {selected.description}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              flexWrap: 'wrap',
              marginTop: '25px',
            }}
          >
            <div>
              <i className="fas fa-users" style={{ color: '#10b981' }} />
              <p style={{ color: dm.text, marginTop: '5px' }}>
                {selected.students || 0} Students
              </p>
            </div>

            <div>
              <i className="fas fa-star" style={{ color: '#f0a500' }} />
              <p style={{ color: dm.text, marginTop: '5px' }}>
                {avgRating || selected.rating || 'No rating'}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            background: dm.reviewBg,
            borderRadius: '15px',
            padding: '25px',
            boxShadow: dm.shadow,
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          {enrollment ? (
            <>
              <div
                style={{
                  color: '#10b981',
                  fontSize: '2rem',
                  marginBottom: '10px',
                }}
              >
                <i className="fas fa-check-circle" />
              </div>

              <h3 style={{ color: dm.heading }}>
                You are enrolled 🎉
              </h3>

              <p style={{ color: dm.text, marginTop: '10px' }}>
                Your progress: <strong>{calculatedProgress}%</strong>
              </p>

              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: darkMode ? '#2a2d3d' : '#e5e7eb',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginTop: '15px',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(Math.max(calculatedProgress, 0), 100)}%`,
                    height: '100%',
                    background:
                      'linear-gradient(90deg, #003366, #f0a500)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>

              <button
                onClick={handleStartLearning}
                disabled={lessonsLoading || lessons.length === 0}
                style={{
                  width: '100%',
                  padding: '14px',
                  marginTop: '20px',
                  background:
                    lessonsLoading || lessons.length === 0
                      ? '#888888'
                      : 'linear-gradient(90deg, #003366, #005599)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor:
                    lessonsLoading || lessons.length === 0
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                <i
                  className={
                    lessonsLoading
                      ? 'fas fa-spinner fa-spin'
                      : 'fas fa-play-circle'
                  }
                />{' '}
                {lessonsLoading
                  ? 'Loading Lessons...'
                  : lessons.length === 0
                  ? 'No Lessons Available'
                  : 'Start Learning'}
              </button>
            </>
          ) : (
            <>
              <h3 style={{ color: dm.heading }}>
                Ready to start learning?
              </h3>

              <p style={{ color: dm.text, margin: '10px 0 20px' }}>
                Enroll now and start your learning journey.
              </p>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: enrolling
                    ? '#888888'
                    : 'linear-gradient(90deg, #003366, #005599)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: enrolling ? 'not-allowed' : 'pointer',
                }}
              >
                <i
                  className={
                    enrolling
                      ? 'fas fa-spinner fa-spin'
                      : 'fas fa-graduation-cap'
                  }
                />{' '}
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </>
          )}

          {message && (
            <p
              style={{
                marginTop: '15px',
                color:
                  message.includes('successfully') ||
                  message.includes('Congratulations')
                    ? '#10b981'
                    : dm.heading,
                fontWeight: '600',
              }}
            >
              {message}
            </p>
          )}
        </div>

        {enrollment && learningStarted && (
          <div
            id="course-learning-area"
            style={{
              background: dm.reviewBg,
              borderRadius: '15px',
              padding: '25px',
              boxShadow: dm.shadow,
              marginBottom: '30px',
            }}
          >
            <h2
              style={{
                color: dm.heading,
                marginBottom: '20px',
              }}
            >
              <i className="fas fa-graduation-cap" /> Course Learning
            </h2>

            {lessonsLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: dm.subtext,
                }}
              >
                <i className="fas fa-spinner fa-spin" /> Loading lessons...
              </div>
            ) : lessons.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '30px',
                  color: dm.subtext,
                }}
              >
                <i
                  className="fas fa-book"
                  style={{ fontSize: '2rem', marginBottom: '15px' }}
                />
                <p>No lessons have been added to this course yet.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(220px, 280px) 1fr',
                  gap: '25px',
                }}
              >
                <div>
                  <h3 style={{ color: dm.heading, marginBottom: '15px' }}>
                    Lessons
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    {lessons.map((lesson, index) => {
                      const completed = isLessonCompleted(lesson.id);
                      const active =
                        selectedLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          style={{
                            textAlign: 'left',
                            padding: '14px',
                            borderRadius: '10px',
                            border: active
                              ? `2px solid ${dm.btnBack}`
                              : `1px solid ${dm.cardBorder}`,
                            background: active
                              ? dm.btnBack
                              : dm.card,
                            color: active ? '#ffffff' : dm.text,
                            cursor: 'pointer',
                          }}
                        >
                          <strong>
                            {completed ? '✓ ' : ''}
                            Lesson {lesson.lesson_order || index + 1}
                          </strong>

                          <div
                            style={{
                              marginTop: '5px',
                              fontSize: '0.9rem',
                            }}
                          >
                            {lesson.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  {!selectedLesson ? (
                    <div
                      style={{
                        minHeight: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: dm.subtext,
                        border: `1px solid ${dm.cardBorder}`,
                        borderRadius: '12px',
                        padding: '30px',
                      }}
                    >
                      <div>
                        <i
                          className="fas fa-play-circle"
                          style={{ fontSize: '3rem', marginBottom: '15px' }}
                        />
                        <p>Select a lesson to start learning.</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2
                        style={{
                          color: dm.heading,
                          marginBottom: '10px',
                        }}
                      >
                        {selectedLesson.title}
                      </h2>

                      {selectedLesson.description && (
                        <p
                          style={{
                            color: dm.subtext,
                            lineHeight: '1.7',
                            marginBottom: '20px',
                          }}
                        >
                          {selectedLesson.description}
                        </p>
                      )}

                      {selectedLesson.video_uri && (
                        <div style={{ marginBottom: '25px' }}>
                          <video
                            controls
                            style={{
                              width: '100%',
                              maxHeight: '500px',
                              borderRadius: '12px',
                              background: '#000000',
                            }}
                          >
                            <source
                              src={selectedLesson.video_uri}
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}

                      {selectedLesson.content && (
                        <div
                          style={{
                            color: dm.text,
                            lineHeight: '1.8',
                            whiteSpace: 'pre-wrap',
                            fontSize: '1rem',
                            marginBottom: '25px',
                          }}
                        >
                          {selectedLesson.content}
                        </div>
                      )}

                      <div
                        style={{
                          paddingTop: '20px',
                          borderTop: `1px solid ${dm.cardBorder}`,
                        }}
                      >
                        {isLessonCompleted(selectedLesson.id) ? (
                          <div
                            style={{
                              color: '#10b981',
                              fontWeight: '700',
                            }}
                          >
                            <i className="fas fa-check-circle" /> Lesson Completed
                          </div>
                        ) : (
                          <button
                            onClick={handleCompleteLesson}
                            disabled={progressLoading}
                            style={{
                              padding: '12px 20px',
                              background: progressLoading
                                ? '#888888'
                                : dm.btnBack,
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: progressLoading
                                ? 'not-allowed'
                                : 'pointer',
                              fontWeight: '700',
                            }}
                          >
                            <i
                              className={
                                progressLoading
                                  ? 'fas fa-spinner fa-spin'
                                  : 'fas fa-check'
                              }
                            />{' '}
                            {progressLoading
                              ? 'Saving...'
                              : 'Complete Lesson'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            background: dm.reviewBg,
            borderRadius: '12px',
            padding: '30px',
            boxShadow: dm.shadow,
            marginBottom: '30px',
          }}
        >
          <h2 style={{ color: dm.heading, marginBottom: '20px' }}>
            <i className="fas fa-star" /> Reviews
          </h2>

          {reviewLoading ? (
            <p style={{ color: dm.subtext, textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin" /> Loading...
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
                  <p style={{ color: dm.text, marginTop: '8px' }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {!submitted ? (
          <div
            style={{
              background: dm.reviewBg,
              borderRadius: '12px',
              padding: '30px',
              boxShadow: dm.shadow,
            }}
          >
            <h2 style={{ color: dm.heading, marginBottom: '20px' }}>
              <i className="fas fa-pen" /> Add Your Review
            </h2>

            {!user ? (
              <p style={{ color: dm.subtext, textAlign: 'center' }}>
                Please login to leave a review.
              </p>
            ) : (
              <>
                <p style={{ color: dm.heading, fontWeight: '600' }}>
                  Your Rating:
                </p>

                <StarRating rating={myRating} onRate={setMyRating} />

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
                    background: myRating ? dm.btnBack : '#999999',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: myRating ? 'pointer' : 'not-allowed',
                  }}
                >
                  <i className="fas fa-paper-plane" />{' '}
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
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
            }}
          >
            <i
              className="fas fa-check-circle"
              style={{
                fontSize: '3rem',
                color: '#10b981',
                marginBottom: '15px',
              }}
            />
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

            @media (max-width: 768px) {
              #course-learning-area > div {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </section>
    );
  }

  return (
    <section
      id="courses"
      style={{
        background: dm.bg,
        minHeight: '100vh',
        padding: '40px 20px',
        opacity: pageVisible ? 1 : 0,
        transform: pageVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <h1 style={{ color: dm.heading, textAlign: 'center' }}>
        <i className="fas fa-book-open" /> Our Courses
      </h1>

      <div
        style={{
          maxWidth: '700px',
          margin: '30px auto 40px',
        }}
      >
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <i
            className="fas fa-search"
            style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: dm.subtext,
            }}
          />

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
                  category === cat ? dm.catActiveBg : 'transparent',
                color:
                  category === cat ? dm.catActive : dm.catInactive,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

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
            }}
          />
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
                animation: 'courseCardEntrance 0.7s ease both',
                animationDelay: `${index * 0.1}s`,
                cursor: 'pointer',
              }}
            >
              <div
                className="card-icon"
                style={{ color: '#f0a500' }}
              >
                <i className="fas fa-book-open" />
              </div>

              {course.category && (
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
              )}

              <h3 style={{ color: dm.heading }}>
                {course.title}
              </h3>

              <p style={{ color: dm.text }}>
                {course.description ||
                  'Explore this course and start learning today.'}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  margin: '15px 0',
                  color: dm.subtext,
                  fontSize: '0.85rem',
                }}
              >
                <span>
                  <i className="fas fa-users" /> {course.students || 0}
                </span>

                <span>
                  <i
                    className="fas fa-star"
                    style={{ color: '#f0a500' }}
                  />{' '}
                  {course.rating || '0'}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(course);
                }}
                style={{
                  background: dm.btnBack,
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                <i className="fas fa-arrow-right" /> View Details
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
''
