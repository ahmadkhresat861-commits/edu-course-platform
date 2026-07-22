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

  // =========================
  // THEME
  // =========================

  const dm = {
    bg: darkMode ? '#0f1117' : '#f5f7fa',
    card: darkMode ? '#1e2130' : '#ffffff',
    heading: darkMode ? '#a0b4ff' : '#003366',
    text: darkMode ? '#c8d0e0' : '#555',
    subtext: darkMode ? '#7a8499' : '#888',
    border: darkMode ? '#2e3250' : '#e5e7eb',
    primary: darkMode ? '#2a3580' : '#003366',
    success: '#10b981',
    danger: '#ef4444',
  };

  // =========================
  // LOAD EVERYTHING
  // =========================

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setMessage('');

      // =========================
      // GET CURRENT USER
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
        setMessage('Could not load this course.');
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
      }

      // User is not enrolled
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
        .order('id', { ascending: true });

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

      setLessons(lessonsData || []);

      // =========================
      // GET COMPLETED LESSONS
      // =========================

      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (progressError) {
        console.error(
          'Progress loading error:',
          progressError
        );
      }

      const completedIds =
        progressData?.map(
          (item) => item.lesson_id
        ) || [];

      setCompletedLessons(completedIds);

      // =========================
      // SELECT FIRST UNCOMPLETED LESSON
      // =========================

      if (lessonsData && lessonsData.length > 0) {
        const firstUncompleted =
          lessonsData.find(
            (lesson) =>
              !completedIds.includes(
                lesson.id
              )
          );

        setSelectedLesson(
          firstUncompleted ||
            lessonsData[0]
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

    // Already completed
    if (
      completedLessons.includes(
        selectedLesson.id
      )
    ) {
      return;
    }

    try {
      setCompleting(true);
      setMessage('');

      // =========================
      // INSERT PROGRESS
      // =========================

      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: selectedLesson.id,
          completed: true,
          completed_at:
            new Date().toISOString(),
        })
        .select()
        .single();

      if (progressError) {
        // Duplicate lesson progress
        if (
          progressError.code === '23505'
        ) {
          setMessage(
            'This lesson is already completed.'
          );
        } else {
          console.error(
            'Complete lesson error:',
            progressError
          );

          setMessage(
            'Could not save your progress.'
          );
        }

        return;
      }

      // =========================
      // UPDATE LOCAL COMPLETED LESSONS
      // =========================

      const updatedCompletedLessons = [
        ...completedLessons,
        selectedLesson.id,
      ];

      setCompletedLessons(
        updatedCompletedLessons
      );

      // =========================
      // CALCULATE PROGRESS
      // =========================

      const totalLessons =
        lessons.length;

      const completedCount =
        updatedCompletedLessons.length;

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
        error: enrollmentUpdateError,
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

      if (enrollmentUpdateError) {
        console.error(
          'Enrollment update error:',
          enrollmentUpdateError
        );
      } else {
        setEnrollment(
          updatedEnrollment
        );
      }

      // =========================
      // COURSE COMPLETED
      // =========================

      if (newProgress === 100) {
        setMessage(
          '🎉 Congratulations! You completed the entire course!'
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
          `Lesson completed! Your progress is now ${newProgress}%.`
        );

        setTimeout(() => {
          setSelectedLesson(
            nextLesson
          );

          setMessage('');
        }, 1200);
      }
    } catch (error) {
      console.error(
        'Unexpected completion error:',
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
          textAlign: 'center',
        }}
      >
        <div>
          <i
            className="fas fa-spinner fa-spin"
            style={{
              fontSize: '3rem',
              color: dm.heading,
            }}
          ></i>

          <p
            style={{
              color: dm.text,
              marginTop: '15px',
            }}
          >
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div
      style={{
        minHeight: '100vh',
        background: dm.bg,
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
          onClick={() =>
            navigate('/courses')
          }
          style={{
            background: dm.primary,
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '25px',
          }}
        >
          <i className="fas fa-arrow-left"></i>{' '}
          Back to Courses
        </button>

        {/* COURSE HEADER */}

        <div
          style={{
            background: dm.card,
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '25px',
            boxShadow:
              '0 5px 20px rgba(0,0,0,0.08)',
          }}
        >
          <h1
            style={{
              color: dm.heading,
              marginBottom: '10px',
            }}
          >
            <i className="fas fa-graduation-cap"></i>{' '}
            {course?.title}
          </h1>

          <p
            style={{
              color: dm.text,
            }}
          >
            Continue your learning journey.
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
              <span
                style={{
                  color: dm.text,
                  fontWeight: '600',
                }}
              >
                Your Progress
              </span>

              <span
                style={{
                  color: dm.success,
                  fontWeight: '700',
                }}
              >
                {enrollment?.progress || 0}%
              </span>
            </div>

            <div
              style={{
                height: '12px',
                background: darkMode
                  ? '#2a2d3d'
                  : '#e5e7eb',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${
                    enrollment?.progress || 0
                  }%`,
                  height: '100%',
                  background:
                    'linear-gradient(90deg, #003366, #f0a500)',
                  transition:
                    'width 0.5s ease',
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* MAIN */}

        <div
          className="learning-layout"
          style={{
            display: 'grid',
            gridTemplateColumns:
              '280px 1fr',
            gap: '25px',
          }}
        >

          {/* LESSONS */}

          <div
            style={{
              background: dm.card,
              borderRadius: '15px',
              padding: '20px',
              boxShadow:
                '0 5px 20px rgba(0,0,0,0.08)',
              height: 'fit-content',
            }}
          >
            <h3
              style={{
                color: dm.heading,
                marginBottom: '20px',
              }}
            >
              <i className="fas fa-list"></i>{' '}
              Course Lessons
            </h3>

            {lessons.length === 0 ? (
              <p
                style={{
                  color: dm.subtext,
                }}
              >
                No lessons available yet.
              </p>
            ) : (
              lessons.map(
                (lesson, index) => {
                  const isCompleted =
                    completedLessons.includes(
                      lesson.id
                    );

                  const isSelected =
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
                        textAlign: 'left',
                        padding: '15px',
                        marginBottom: '10px',
                        borderRadius: '10px',
                        border: isSelected
                          ? `2px solid ${dm.primary}`
                          : `1px solid ${dm.border}`,
                        background:
                          isSelected
                            ? darkMode
                              ? '#2a3580'
                              : '#eef4ff'
                            : 'transparent',
                        color: dm.text,
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
                            minWidth: '30px',
                            height: '30px',
                            borderRadius:
                              '50%',
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            background:
                              isCompleted
                                ? dm.success
                                : dm.primary,
                            color: 'white',
                            fontSize:
                              '0.8rem',
                          }}
                        >
                          {isCompleted ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            index + 1
                          )}
                        </span>

                        <span
                          style={{
                            fontWeight: '600',
                          }}
                        >
                          {lesson.title}
                        </span>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>

          {/* LESSON CONTENT */}

          <div
            style={{
              background: dm.card,
              borderRadius: '15px',
              padding: '35px',
              boxShadow:
                '0 5px 20px rgba(0,0,0,0.08)',
              minHeight: '450px',
            }}
          >
            {selectedLesson ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <h2
                    style={{
                      color: dm.heading,
                      margin: 0,
                    }}
                  >
                    {selectedLesson.title}
                  </h2>

                  {completedLessons.includes(
                    selectedLesson.id
                  ) && (
                    <span
                      style={{
                        color: dm.success,
                        fontWeight: '700',
                      }}
                    >
                      <i className="fas fa-check-circle"></i>{' '}
                      Completed
                    </span>
                  )}
                </div>

                {selectedLesson.description && (
                  <p
                    style={{
                      color: dm.subtext,
                      fontSize: '1.05rem',
                      marginBottom: '25px',
                    }}
                  >
                    {selectedLesson.description}
                  </p>
                )}

                <div
                  style={{
                    color: dm.text,
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedLesson.content}
                </div>

                {/* COMPLETE */}

                <div
                  style={{
                    marginTop: '35px',
                    paddingTop: '25px',
                    borderTop:
                      `1px solid ${dm.border}`,
                  }}
                >
                  {!completedLessons.includes(
                    selectedLesson.id
                  ) ? (
                    <button
                      onClick={
                        handleCompleteLesson
                      }
                      disabled={completing}
                      style={{
                        width: '100%',
                        padding: '15px',
                        background:
                          completing
                            ? '#888'
                            : 'linear-gradient(90deg, #003366, #005599)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor:
                          completing
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      <i
                        className={
                          completing
                            ? 'fas fa-spinner fa-spin'
                            : 'fas fa-check'
                        }
                      ></i>{' '}
                      {completing
                        ? 'Saving...'
                        : 'Mark as Complete'}
                    </button>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '15px',
                        background:
                          darkMode
                            ? '#0d2318'
                            : '#f0fff4',
                        color: dm.success,
                        borderRadius: '10px',
                        fontWeight: '700',
                      }}
                    >
                      <i className="fas fa-check-circle"></i>{' '}
                      Lesson Completed
                    </div>
                  )}
                </div>

                {/* MESSAGE */}

                {message && (
                  <p
                    style={{
                      textAlign: 'center',
                      color:
                        message.includes(
                          'Could not'
                        ) ||
                        message.includes(
                          'Something'
                        )
                          ? dm.danger
                          : dm.success,
                      fontWeight: '600',
                      marginTop: '20px',
                    }}
                  >
                    {message}
                  </p>
                )}
              </>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: dm.subtext,
                }}
              >
                <i
                  className="fas fa-book-open"
                  style={{
                    fontSize: '3rem',
                    marginBottom: '15px',
                  }}
                ></i>

                <p>
                  Select a lesson to start learning.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESPONSIVE */}

      <style>
        {`
          @media (max-width: 768px) {
            .learning-layout {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CourseLearning;
