import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';

const CourseLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useLang();

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [enrollment, setEnrollment] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const [message, setMessage] = useState('');
  const [showLessons, setShowLessons] = useState(false);

  // =========================
  // THEME
  // =========================

  const dm = {
    bg: darkMode ? '#0f1117' : '#f5f7fa',
    card: darkMode ? '#1e2130' : '#ffffff',
    heading: darkMode ? '#a0b4ff' : '#003366',
    text: darkMode ? '#c8d0e0' : '#444',
    subtext: darkMode ? '#7a8499' : '#777',
    border: darkMode ? '#2e3250' : '#e5e7eb',

    primary: '#003366',
    primaryLight: '#005599',

    success: '#10b981',
    danger: '#ef4444',

    lessonActive: darkMode
      ? '#2a3580'
      : '#eef4ff',

    lessonHover: darkMode
      ? '#252940'
      : '#f5f8ff',
  };

  // =========================
  // LOAD COURSE
  // =========================

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setMessage('');

      // =========================
      // GET USER
      // =========================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate('/');
        return;
      }

      setUser(user);

      // =========================
      // GET COURSE
      // =========================

      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Course error:', courseError);

        setMessage(
          'Could not load this course.'
        );

        return;
      }

      setCourse(courseData);

      // =========================
      // CHECK ENROLLMENT
      // =========================

      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (enrollmentError) {
        console.error(
          'Enrollment error:',
          enrollmentError
        );

        setMessage(
          'Could not verify your enrollment.'
        );

        return;
      }

      // =========================
      // NOT ENROLLED
      // =========================

      if (!enrollmentData) {
        navigate('/courses');
        return;
      }

      setEnrollment(enrollmentData);

      // =========================
      // GET LESSONS
      // =========================

      const {
        data: lessonsData,
        error: lessonsError,
      } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('id', {
          ascending: true,
        });

      if (lessonsError) {
        console.error(
          'Lessons error:',
          lessonsError
        );

        setMessage(
          'Could not load course lessons.'
        );

        return;
      }

      const loadedLessons =
        lessonsData || [];

      setLessons(loadedLessons);

      // =========================
      // GET COMPLETED LESSONS
      // =========================

      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (progressError) {
        console.error(
          'Progress error:',
          progressError
        );

        setMessage(
          'Could not load your progress.'
        );

        return;
      }

      const completedIds =
        progressData?.map(
          (item) => item.lesson_id
        ) || [];

      setCompletedLessons(
        completedIds
      );

      // =========================
      // SELECT FIRST UNCOMPLETED
      // =========================

      if (loadedLessons.length > 0) {
        const firstUncompleted =
          loadedLessons.find(
            (lesson) =>
              !completedIds.includes(
                lesson.id
              )
          );

        setSelectedLesson(
          firstUncompleted ||
            loadedLessons[0]
        );
      }

    } catch (error) {
      console.error(
        'Unexpected error:',
        error
      );

      setMessage(
        'Something went wrong.'
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SELECT LESSON
  // =========================

  const handleSelectLesson = (
    lesson
  ) => {
    setSelectedLesson(lesson);

    setMessage('');

    // Close menu on mobile
    setShowLessons(false);

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================
  // COMPLETE LESSON
  // =========================

  const handleCompleteLesson = async () => {
    if (
      !selectedLesson ||
      !user ||
      !enrollment
    ) {
      return;
    }

    const alreadyCompleted =
      completedLessons.includes(
        selectedLesson.id
      );

    if (alreadyCompleted) {
      goToNextLesson();
      return;
    }

    try {
      setCompleting(true);
      setMessage('');

      // =========================
      // SAVE LESSON PROGRESS
      // =========================

      const {
        error: progressError,
      } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            lesson_id:
              selectedLesson.id,
            completed: true,
            completed_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              'user_id,course_id,lesson_id',
          }
        );

      if (progressError) {
        console.error(
          'Progress save error:',
          progressError
        );

        setMessage(
          'Could not save your progress.'
        );

        return;
      }

      // =========================
      // UPDATE LOCAL STATE
      // =========================

      const updatedCompleted = [
        ...completedLessons,
        selectedLesson.id,
      ];

      const uniqueCompleted = [
        ...new Set(
          updatedCompleted
        ),
      ];

      setCompletedLessons(
        uniqueCompleted
      );

      // =========================
      // CALCULATE PROGRESS
      // =========================

      const totalLessons =
        lessons.length;

      const completedCount =
        uniqueCompleted.length;

      const newProgress =
        totalLessons > 0
          ? Math.round(
              (completedCount /
                totalLessons) *
                100
            )
          : 0;

      // =========================
      // UPDATE ENROLLMENT
      // =========================

      const {
        data: updatedEnrollment,
        error:
          enrollmentError,
      } = await supabase
        .from('enrollments')
        .update({
          progress: newProgress,
          completed:
            newProgress === 100,
        })
        .eq('id', enrollment.id)
        .select()
        .single();

      if (enrollmentError) {
        console.error(
          'Enrollment update error:',
          enrollmentError
        );
      } else {
        setEnrollment(
          updatedEnrollment
        );
      }

      // =========================
      // COURSE COMPLETED
      // =========================

      if (
        newProgress === 100
      ) {
        setMessage(
          '🎉 Congratulations! You completed this course!'
        );

        return;
      }

      // =========================
      // NEXT LESSON
      // =========================

      const currentIndex =
        lessons.findIndex(
          (lesson) =>
            lesson.id ===
            selectedLesson.id
        );

      const nextLesson =
        lessons[currentIndex + 1];

      if (nextLesson) {
        setMessage(
          `Great job! Progress ${newProgress}%`
        );

        setTimeout(() => {
          setSelectedLesson(
            nextLesson
          );

          setMessage('');

          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }, 900);
      }

    } catch (error) {
      console.error(
        'Complete error:',
        error
      );

      setMessage(
        'Something went wrong.'
      );

    } finally {
      setCompleting(false);
    }
  };

  // =========================
  // NEXT LESSON
  // =========================

  const goToNextLesson = () => {
    if (!selectedLesson) {
      return;
    }

    const currentIndex =
      lessons.findIndex(
        (lesson) =>
          lesson.id ===
          selectedLesson.id
      );

    const nextLesson =
      lessons[currentIndex + 1];

    if (nextLesson) {
      setSelectedLesson(
        nextLesson
      );

      setMessage('');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // =========================
  // PREVIOUS LESSON
  // =========================

  const goToPreviousLesson =
    () => {
      if (!selectedLesson) {
        return;
      }

      const currentIndex =
        lessons.findIndex(
          (lesson) =>
            lesson.id ===
            selectedLesson.id
        );

      if (currentIndex > 0) {
        setSelectedLesson(
          lessons[
            currentIndex - 1
          ]
        );

        setMessage('');

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
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
          }}
        >
          <i
            className="fas fa-spinner fa-spin"
            style={{
              fontSize: '3rem',
              color: dm.heading,
            }}
          />

          <p
            style={{
              color: dm.text,
              marginTop: '15px',
            }}
          >
            Loading your course...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // NO LESSONS
  // =========================

  if (
    !lessons.length
  ) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: dm.bg,
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <i
          className="fas fa-book-open"
          style={{
            fontSize: '4rem',
            color: dm.heading,
            marginBottom: '20px',
          }}
        />

        <h2
          style={{
            color: dm.heading,
          }}
        >
          {course?.title}
        </h2>

        <p
          style={{
            color: dm.text,
          }}
        >
          Lessons are not available yet.
        </p>

        <button
          onClick={() =>
            navigate('/courses')
          }
          style={{
            marginTop: '20px',
            padding: '12px 25px',
            background: dm.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Back to Courses
        </button>
      </div>
    );
  }

  // =========================
  // CURRENT LESSON
  // =========================

  const currentIndex =
    lessons.findIndex(
      (lesson) =>
        lesson.id ===
        selectedLesson?.id
    );

  const lessonNumber =
    currentIndex + 1;

  const progress =
    enrollment?.progress || 0;

  const isCompleted =
    selectedLesson &&
    completedLessons.includes(
      selectedLesson.id
    );

  const isLastLesson =
    currentIndex ===
    lessons.length - 1;

  // =========================
  // PAGE
  // =========================

  return (
    <div
      style={{
        minHeight: '100vh',
        background: dm.bg,
        color: dm.text,
      }}
    >

      {/* =========================
          TOP HEADER
      ========================= */}

      <header
        style={{
          background: dm.card,
          borderBottom:
            `1px solid ${dm.border}`,
          padding:
            '18px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: '20px',
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              minWidth: 0,
            }}
          >
            <button
              onClick={() =>
                navigate('/courses')
              }
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: 'none',
                background:
                  dm.primary,
                color: 'white',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <i className="fas fa-arrow-left" />
            </button>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: dm.heading,
                  fontSize:
                    '1.1rem',
                  whiteSpace:
                    'nowrap',
                  overflow:
                    'hidden',
                  textOverflow:
                    'ellipsis',
                }}
              >
                {course?.title}
              </h2>

              <span
                style={{
                  color:
                    dm.subtext,
                  fontSize:
                    '0.85rem',
                }}
              >
                Lesson {lessonNumber}{' '}
                of {lessons.length}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              setShowLessons(
                !showLessons
              )
            }
            style={{
              padding:
                '10px 16px',
              background:
                dm.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              flexShrink: 0,
            }}
          >
            <i className="fas fa-list" />{' '}
            Lessons
          </button>

        </div>
      </header>

      {/* =========================
          PROGRESS BAR
      ========================= */}

      <div
        style={{
          background:
            dm.card,
          borderBottom:
            `1px solid ${dm.border}`,
        }}
      >
        <div
          style={{
            maxWidth:
              '1100px',
            margin:
              '0 auto',
            padding:
              '12px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              marginBottom:
                '6px',
              fontSize:
                '0.85rem',
            }}
          >
            <span
              style={{
                color:
                  dm.subtext,
              }}
            >
              Course Progress
            </span>

            <strong
              style={{
                color:
                  dm.success,
              }}
            >
              {progress}%
            </strong>
          </div>

          <div
            style={{
              height: '8px',
              background:
                darkMode
                  ? '#2a2d3d'
                  : '#e5e7eb',
              borderRadius:
                '10px',
              overflow:
                'hidden',
            }}
          >
            <div
              style={{
                width:
                  `${progress}%`,
                height: '100%',
                background:
                  'linear-gradient(90deg, #003366, #f0a500)',
                transition:
                  'width 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* =========================
          LESSON MENU
      ========================= */}

      {showLessons && (
        <div
          style={{
            position:
              'fixed',
            top: 0,
            right: 0,
            width:
              '320px',
            maxWidth:
              '90%',
            height:
              '100vh',
            background:
              dm.card,
            boxShadow:
              '-10px 0 30px rgba(0,0,0,0.2)',
            zIndex: 1000,
            padding:
              '25px',
            overflowY:
              'auto',
            animation:
              'menuSlide 0.3s ease',
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center',
              marginBottom:
                '25px',
            }}
          >
            <h2
              style={{
                color:
                  dm.heading,
                margin: 0,
              }}
            >
              Lessons
            </h2>

            <button
              onClick={() =>
                setShowLessons(
                  false
                )
              }
              style={{
                width: '38px',
                height: '38px',
                borderRadius:
                  '50%',
                border: 'none',
                background:
                  dm.primary,
                color: 'white',
                cursor:
                  'pointer',
              }}
            >
              <i className="fas fa-times" />
            </button>
          </div>

          {lessons.map(
            (lesson, index) => {
              const done =
                completedLessons.includes(
                  lesson.id
                );

              const active =
                selectedLesson?.id ===
                lesson.id;

              return (
                <button
                  key={
                    lesson.id
                  }
                  onClick={() =>
                    handleSelectLesson(
                      lesson
                    )
                  }
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: '12px',
                    padding:
                      '14px',
                    marginBottom:
                      '10px',
                    borderRadius:
                      '10px',
                    border:
                      active
                        ? `2px solid ${dm.primary}`
                        : `1px solid ${dm.border}`,
                    background:
                      active
                        ? dm.lessonActive
                        : 'transparent',
                    color:
                      dm.text,
                    cursor:
                      'pointer',
                    textAlign:
                      'left',
                  }}
                >
                  <span
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius:
                        '50%',
                      background:
                        done
                          ? dm.success
                          : dm.primary,
                      color: 'white',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      flexShrink: 0,
                      fontSize:
                        '0.8rem',
                    }}
                  >
                    {done ? (
                      <i className="fas fa-check" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span
                    style={{
                      fontWeight:
                        '600',
                    }}
                  >
                    {lesson.title}
                  </span>
                </button>
              );
            }
          )}

        </div>
      )}

      {/* =========================
          MAIN LESSON
      ========================= */}

      <main
        style={{
          maxWidth:
            '850px',
          margin:
            '0 auto',
          padding:
            '50px 20px 80px',
        }}
      >

        {/* LESSON NUMBER */}

        <div
          style={{
            color:
              dm.subtext,
            fontSize:
              '0.9rem',
            marginBottom:
              '12px',
          }}
        >
          Lesson {lessonNumber}{' '}
          of {lessons.length}
        </div>

        {/* TITLE */}

        <h1
          style={{
            color:
              dm.heading,
            fontSize:
              'clamp(1.8rem, 5vw, 3rem)',
            lineHeight:
              '1.2',
            marginBottom:
              '15px',
          }}
        >
          {selectedLesson?.title}
        </h1>

        {/* DESCRIPTION */}

        {selectedLesson?.description && (
          <p
            style={{
              color:
                dm.subtext,
              fontSize:
                '1.1rem',
              lineHeight:
                '1.7',
              marginBottom:
                '35px',
            }}
          >
            {
              selectedLesson.description
            }
          </p>
        )}

        {/* CONTENT */}

        <article
          style={{
            background:
              dm.card,
            borderRadius:
              '16px',
            padding:
              'clamp(20px, 5vw, 45px)',
            boxShadow:
              '0 5px 25px rgba(0,0,0,0.08)',
            color:
              dm.text,
            fontSize:
              '1.05rem',
            lineHeight:
              '1.9',
            whiteSpace:
              'pre-wrap',
            minHeight:
              '300px',
          }}
        >
          {selectedLesson?.content}
        </article>

        {/* STATUS */}

        {isCompleted && (
          <div
            style={{
              marginTop:
                '25px',
              padding:
                '15px',
              background:
                darkMode
                  ? '#0d2318'
                  : '#f0fff4',
              color:
                dm.success,
              borderRadius:
                '10px',
              textAlign:
                'center',
              fontWeight:
                '700',
            }}
          >
            <i className="fas fa-check-circle" />{' '}
            You have completed this lesson.
          </div>
        )}

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              marginTop:
                '20px',
              padding:
                '15px',
              borderRadius:
                '10px',
              textAlign:
                'center',
              background:
                message.includes(
                  'Could not'
                ) ||
                message.includes(
                  'Something'
                )
                  ? darkMode
                    ? '#351616'
                    : '#fff1f2'
                  : darkMode
                    ? '#0d2318'
                    : '#f0fff4',
              color:
                message.includes(
                  'Could not'
                ) ||
                message.includes(
                  'Something'
                )
                  ? dm.danger
                  : dm.success,
              fontWeight:
                '600',
            }}
          >
            {message}
          </div>
        )}

        {/* =========================
            NAVIGATION
        ========================= */}

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '15px',
            marginTop:
              '35px',
            flexWrap:
              'wrap',
          }}
        >

          <button
            onClick={
              goToPreviousLesson
            }
            disabled={
              currentIndex <= 0
            }
            style={{
              flex: 1,
              minWidth:
                '180px',
              padding:
                '15px',
              background:
                currentIndex <= 0
                  ? '#999'
                  : dm.primary,
              color: 'white',
              border: 'none',
              borderRadius:
                '10px',
              cursor:
                currentIndex <= 0
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight:
                '700',
            }}
          >
            <i className="fas fa-arrow-left" />{' '}
            Previous Lesson
          </button>

          <button
            onClick={
              handleCompleteLesson
            }
            disabled={
              completing
            }
            style={{
              flex: 2,
              minWidth:
                '220px',
              padding:
                '15px',
              background:
                completing
                  ? '#888'
                  : isLastLesson &&
                      isCompleted
                    ? dm.success
                    : 'linear-gradient(90deg, #003366, #005599)',
              color: 'white',
              border: 'none',
              borderRadius:
                '10px',
              cursor:
                completing
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight:
                '700',
              fontSize:
                '1rem',
            }}
          >
            <i
              className={
                completing
                  ? 'fas fa-spinner fa-spin'
                  : isLastLesson &&
                      isCompleted
                    ? 'fas fa-check-circle'
                    : 'fas fa-check'
              }
            />{' '}
            {completing
              ? 'Saving...'
              : isLastLesson &&
                  isCompleted
                ? 'Course Completed'
                : isCompleted
                  ? 'Next Lesson'
                  : isLastLesson
                    ? 'Complete Course'
                    : 'Mark as Complete & Next'}
          </button>

        </div>

      </main>

      {/* =========================
          ANIMATION
      ========================= */}

      <style>
        {`
          @keyframes menuSlide {
            from {
              transform: translateX(100%);
              opacity: 0;
            }

            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @media (max-width: 600px) {
            main {
              padding-top: 35px !important;
            }
          }
        `}
      </style>

    </div>
  );
};

export default CourseLearning;
