import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useLang();

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [message, setMessage] = useState('');

  const bg = darkMode ? '#0f1117' : '#f5f7fa';
  const card = darkMode ? '#1e2130' : '#ffffff';
  const text = darkMode ? '#e0e6f0' : '#003366';
  const text2 = darkMode ? '#a8b2c8' : '#666';
  const border = darkMode ? '#2e3250' : '#e5e7eb';
  const progressBg = darkMode ? '#2a2d3d' : '#e5e7eb';

  // =========================================
  // LOAD USER + COURSE + LESSONS
  // =========================================

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    setLoading(true);
    setMessage('');

    // Get logged user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/');
      return;
    }

    setUser(user);

    // Get course
    const {
      data: courseData,
      error: courseError,
    } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (courseError) {
      console.error('Course error:', courseError);
      setMessage('Course not found.');
      setLoading(false);
      return;
    }

    setCourse(courseData);

    // Check enrollment
    const {
      data: enrollment,
      error: enrollmentError,
    } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .maybeSingle();

    if (enrollmentError) {
      console.error('Enrollment error:', enrollmentError);
    }

    if (!enrollment) {
      setMessage(
        'You are not enrolled in this course. Please enroll first.'
      );

      setLoading(false);
      return;
    }

    // Get lessons
    const {
      data: lessonsData,
      error: lessonsError,
    } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('lesson_order', {
        ascending: true,
      });

    if (lessonsError) {
      console.error('Lessons error:', lessonsError);
      setMessage('Could not load lessons.');
      setLoading(false);
      return;
    }

    setLessons(lessonsData || []);

    // Get user progress
    const {
      data: progress,
      error: progressError,
    } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', id);

    if (progressError) {
      console.error('Progress error:', progressError);
    }

    setProgressData(progress || []);

    // Select first incomplete lesson
    const firstIncomplete = (lessonsData || []).find(
      (lesson) =>
        !(progress || []).some(
          (item) =>
            item.lesson_id === lesson.id &&
            item.completed === true
        )
    );

    if (firstIncomplete) {
      setSelectedLesson(firstIncomplete);
    } else if (lessonsData?.length > 0) {
      setSelectedLesson(lessonsData[0]);
    }

    setLoading(false);
  };

  // =========================================
  // CHECK LESSON COMPLETION
  // =========================================

  const isLessonCompleted = (lessonId) => {
    return progressData.some(
      (item) =>
        item.lesson_id === lessonId &&
        item.completed === true
    );
  };

  // =========================================
  // CALCULATE PROGRESS
  // =========================================

  const completedLessons = lessons.filter((lesson) =>
    isLessonCompleted(lesson.id)
  ).length;

  const progressPercentage =
    lessons.length > 0
      ? Math.round(
          (completedLessons / lessons.length) * 100
        )
      : 0;

  // =========================================
  // COMPLETE LESSON
  // =========================================

  const handleCompleteLesson = async () => {
    if (!user || !selectedLesson) return;

    setLessonLoading(true);
    setMessage('');

    const existingProgress = progressData.find(
      (item) =>
        item.lesson_id === selectedLesson.id
    );

    let error;

    if (existingProgress) {
      const result = await supabase
        .from('lesson_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id);

      error = result.error;
    } else {
      const result = await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          course_id: course.id,
          lesson_id: selectedLesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      error = result.error;
    }

    if (error) {
      console.error(
        'Complete lesson error:',
        error
      );

      setMessage(
        'Could not save your progress.'
      );

      setLessonLoading(false);
      return;
    }

    // Reload progress
    const {
      data: updatedProgress,
    } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course.id);

    setProgressData(
      updatedProgress || []
    );

    // Calculate new progress
    const newCompletedCount = lessons.filter(
      (lesson) =>
        lesson.id === selectedLesson.id ||
        (updatedProgress || []).some(
          (item) =>
            item.lesson_id === lesson.id &&
            item.completed === true
        )
    ).length;

    const newPercentage =
      lessons.length > 0
        ? Math.round(
            (newCompletedCount /
              lessons.length) *
              100
          )
        : 0;

    // Update enrollment
    const { error: enrollmentError } =
      await supabase
        .from('enrollments')
        .update({
          progress: newPercentage,
          completed:
            newPercentage === 100,
        })
        .eq('user_id', user.id)
        .eq('course_id', course.id);

    if (enrollmentError) {
      console.error(
        'Enrollment progress error:',
        enrollmentError
      );
    }

    setMessage(
      newPercentage === 100
        ? 'Congratulations! You completed the course! 🎉'
        : 'Lesson completed successfully! ✅'
    );

    // Move to next lesson
    const currentIndex =
      lessons.findIndex(
        (lesson) =>
          lesson.id === selectedLesson.id
      );

    const nextLesson =
      lessons[currentIndex + 1];

    if (nextLesson) {
      setTimeout(() => {
        setSelectedLesson(nextLesson);
        setMessage('');
      }, 1000);
    }

    setLessonLoading(false);
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <section
        style={{
          minHeight: '100vh',
          background: bg,
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
              color: '#003366',
            }}
          ></i>

          <p style={{ color: text2 }}>
            Loading course...
          </p>
        </div>
      </section>
    );
  }

  // =========================================
  // NOT ENROLLED / ERROR
  // =========================================

  if (!course || lessons.length === 0) {
    return (
      <section
        style={{
          minHeight: '100vh',
          background: bg,
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <i
          className="fas fa-book-open"
          style={{
            fontSize: '4rem',
            color: '#f0a500',
            marginBottom: '20px',
          }}
        ></i>

        <h2 style={{ color: text }}>
          {message ||
            'No lessons available yet.'}
        </h2>

        <button
          onClick={() => navigate('/courses')}
          style={{
            marginTop: '20px',
            padding: '12px 25px',
            background: '#003366',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Courses
        </button>
      </section>
    );
  }

  // =========================================
  // MAIN PAGE
  // =========================================

  return (
    <section
      style={{
        minHeight: '100vh',
        background: bg,
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >

        {/* BACK */}

        <button
          onClick={() => navigate('/courses')}
          style={{
            marginBottom: '25px',
            padding: '10px 20px',
            background: '#003366',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-arrow-left"></i>{' '}
          Back to Courses
        </button>

        {/* COURSE HEADER */}

        <div
          style={{
            background:
              'linear-gradient(135deg, #003366, #005599)',
            color: 'white',
            padding: '30px',
            borderRadius: '15px',
            marginBottom: '25px',
          }}
        >
          <h1>
            <i className="fas fa-graduation-cap"></i>{' '}
            {course.title}
          </h1>

          <p
            style={{
              color: '#c8d0e0',
            }}
          >
            {course.category}
          </p>

          {/* PROGRESS */}

          <div
            style={{
              marginTop: '25px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginBottom: '8px',
              }}
            >
              <span>
                Course Progress
              </span>

              <strong>
                {progressPercentage}%
              </strong>
            </div>

            <div
              style={{
                width: '100%',
                height: '10px',
                background:
                  'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  background: '#f0a500',
                  transition:
                    'width 0.5s ease',
                }}
              ></div>
            </div>

            <p
              style={{
                marginTop: '8px',
                fontSize: '0.9rem',
              }}
            >
              {completedLessons} of{' '}
              {lessons.length} lessons
              completed
            </p>
          </div>
        </div>

        {/* CONTENT GRID */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '300px 1fr',
            gap: '25px',
          }}
        >

          {/* LESSON LIST */}

          <div
            style={{
              background: card,
              borderRadius: '15px',
              padding: '20px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
              height: 'fit-content',
            }}
          >
            <h3
              style={{
                color: text,
                marginBottom: '20px',
              }}
            >
              <i className="fas fa-list"></i>{' '}
              Course Lessons
            </h3>

            {lessons.map(
              (lesson, index) => {
                const completed =
                  isLessonCompleted(
                    lesson.id
                  );

                const active =
                  selectedLesson?.id ===
                  lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() =>
                      setSelectedLesson(
                        lesson
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '15px',
                      marginBottom: '10px',
                      textAlign: 'left',
                      border: active
                        ? '2px solid #f0a500'
                        : `1px solid ${border}`,
                      background: active
                        ? darkMode
                          ? '#2a3050'
                          : '#f8fafc'
                        : 'transparent',
                      color: text,
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems:
                          'center',
                      }}
                    >
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius:
                            '50%',
                          background:
                            completed
                              ? '#10b981'
                              : '#003366',
                          color: 'white',
                          display: 'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          fontSize:
                            '0.8rem',
                        }}
                      >
                        {completed ? (
                          <i className="fas fa-check"></i>
                        ) : (
                          index + 1
                        )}
                      </span>

                      <span
                        style={{
                          fontWeight:
                            active
                              ? '700'
                              : '500',
                        }}
                      >
                        {lesson.title}
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* LESSON CONTENT */}

          <div
            style={{
              background: card,
              borderRadius: '15px',
              padding: '30px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
            }}
          >
            {selectedLesson && (
              <>
                <h2
                  style={{
                    color: text,
                  }}
                >
                  {selectedLesson.title}
                </h2>

                {selectedLesson.description && (
                  <p
                    style={{
                      color: text2,
                      marginTop: '10px',
                    }}
                  >
                    {
                      selectedLesson.description
                    }
                  </p>
                )}

                {selectedLesson.video_url && (
                  <div
                    style={{
                      marginTop: '25px',
                    }}
                  >
                    <iframe
                      width="100%"
                      height="400"
                      src={
                        selectedLesson.video_url
                      }
                      title={
                        selectedLesson.title
                      }
                      frameBorder="0"
                      allowFullScreen
                      style={{
                        borderRadius:
                          '10px',
                      }}
                    ></iframe>
                  </div>
                )}

                {selectedLesson.content && (
                  <div
                    style={{
                      marginTop: '25px',
                      color: text,
                      lineHeight: '1.8',
                      whiteSpace:
                        'pre-wrap',
                    }}
                  >
                    {
                      selectedLesson.content
                    }
                  </div>
                )}

                <div
                  style={{
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop:
                      `1px solid ${border}`,
                  }}
                >
                  {isLessonCompleted(
                    selectedLesson.id
                  ) ? (
                    <div
                      style={{
                        color: '#10b981',
                        fontWeight: '700',
                      }}
                    >
                      <i className="fas fa-check-circle"></i>{' '}
                      Lesson Completed
                    </div>
                  ) : (
                    <button
                      onClick={
                        handleCompleteLesson
                      }
                      disabled={
                        lessonLoading
                      }
                      style={{
                        width: '100%',
                        padding: '15px',
                        background:
                          lessonLoading
                            ? '#888'
                            : '#003366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor:
                          lessonLoading
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      <i
                        className={
                          lessonLoading
                            ? 'fas fa-spinner fa-spin'
                            : 'fas fa-check'
                        }
                      ></i>{' '}
                      {lessonLoading
                        ? 'Saving...'
                        : 'Complete Lesson'}
                    </button>
                  )}

                  {message && (
                    <p
                      style={{
                        marginTop: '15px',
                        color:
                          message.includes(
                            'successfully'
                          ) ||
                          message.includes(
                            'Congratulations'
                          )
                            ? '#10b981'
                            : '#ef4444',
                        fontWeight: '600',
                        textAlign: 'center',
                      }}
                    >
                      {message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RESPONSIVE */}

      <style>
        {`
          @media (max-width: 768px) {
            div[style*="grid-template-columns: 300px 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </section>
  );
};

export default CourseLearning;
