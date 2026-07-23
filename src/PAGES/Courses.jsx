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
        className={
          star <= Number(rating)
            ? 'fas fa-star'
            : 'far fa-star'
        }
        style={{
          color: '#f0a500',
          cursor: onRate ? 'pointer' : 'default',
          fontSize: '1.2rem',
          transition: 'transform 0.2s ease',
        }}
        onClick={() =>
          onRate && onRate(star)
        }
        onMouseEnter={(e) => {
          if (onRate) {
            e.currentTarget.style.transform =
              'scale(1.25)';
          }
        }}
        onMouseLeave={(e) => {
          if (onRate) {
            e.currentTarget.style.transform =
              'scale(1)';
          }
        }}
      />
    ))}
  </div>
);

const Courses = () => {
  const { darkMode } = useLang();

  // ============================================================
  // THEME
  // ============================================================

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
    catActive: darkMode ? '#ffffff' : '#ffffff',
    catActiveBg: darkMode ? '#2a3580' : '#003366',
    catBorder: darkMode ? '#a0b4ff' : '#003366',
    catInactive: darkMode ? '#a0b4ff' : '#003366',
    reviewBg: darkMode ? '#161a28' : '#ffffff',
    successBg: darkMode
      ? '#0d2318'
      : '#f0fff4',
    shadow: darkMode
      ? '0 4px 20px rgba(0,0,0,0.4)'
      : '0 4px 15px rgba(0,0,0,0.08)',
    tagBg: darkMode
      ? '#2a3050'
      : '#f0f0f0',
    tagColor: darkMode
      ? '#a0b4ff'
      : '#555555',
    btnBack: darkMode
      ? '#2a3580'
      : '#003366',
  };

  // ============================================================
  // COURSES
  // ============================================================

  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // ============================================================
  // REVIEWS
  // ============================================================

  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ============================================================
  // USER + ENROLLMENT
  // ============================================================

  const [user, setUser] = useState(null);
  const [enrollment, setEnrollment] =
    useState(null);

  // ============================================================
  // LESSONS
  // ============================================================

  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] =
    useState(null);

  const [lessonProgress, setLessonProgress] =
    useState([]);

  const [learningMode, setLearningMode] =
    useState(false);

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] =
    useState(true);

  const [reviewLoading, setReviewLoading] =
    useState(false);

  const [enrolling, setEnrolling] =
    useState(false);

  const [lessonsLoading, setLessonsLoading] =
    useState(false);

  const [completingLesson, setCompletingLesson] =
    useState(false);

  // ============================================================
  // UI
  // ============================================================

  const [pageVisible, setPageVisible] =
    useState(false);

  const [detailsVisible, setDetailsVisible] =
    useState(false);

  const [message, setMessage] =
    useState('');

  // ============================================================
  // LOAD COURSES + USER
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const {
          data: {
            user: currentUser,
          },
        } =
          await supabase.auth.getUser();

        setUser(currentUser);

        const {
          data: coursesData,
          error: coursesError,
        } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', {
            ascending: false,
          });

        if (coursesError) {
          console.error(
            'Error loading courses:',
            coursesError
          );
        } else {
          setCourses(
            coursesData || []
          );
        }

        setTimeout(() => {
          setPageVisible(true);
        }, 100);
      } catch (error) {
        console.error(
          'Unexpected loading error:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ============================================================
  // SELECTED COURSE
  // ============================================================

  useEffect(() => {
    if (!selected) return;

    setDetailsVisible(false);

    setTimeout(() => {
      setDetailsVisible(true);
    }, 100);

    fetchReviews();
    checkEnrollment();
  }, [selected, user]);

  // ============================================================
  // FETCH REVIEWS
  // ============================================================

  const fetchReviews = async () => {
    if (!selected) return;

    setReviewLoading(true);

    try {
      const {
        data,
        error,
      } = await supabase
        .from('reviews')
        .select('*')
        .eq(
          'course_id',
          selected.id
        )
        .order('id', {
          ascending: false,
        });

      if (error) {
        console.error(
          'Error loading reviews:',
          error
        );
      }

      setReviews(data || []);
    } catch (error) {
      console.error(
        'Unexpected reviews error:',
        error
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // ============================================================
  // CHECK ENROLLMENT
  // ============================================================

  const checkEnrollment = async () => {
    if (!user || !selected) {
      setEnrollment(null);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq(
        'course_id',
        selected.id
      )
      .maybeSingle();

    if (error) {
      console.error(
        'Enrollment check error:',
        error
      );

      setEnrollment(null);
      return;
    }

    setEnrollment(data);
  };

  // ============================================================
  // LOAD LESSONS
  // ============================================================

  const loadLessons = async (
    courseId
  ) => {
    if (!courseId) return [];

    setLessonsLoading(true);

    try {
      // ========================================================
      // GET LESSONS FOR CURRENT COURSE
      // ========================================================

      const {
        data: lessonsData,
        error: lessonsError,
      } = await supabase
        .from('lessons')
        .select(
          `
          id,
          course_id,
          title,
          description,
          content,
          lesson_order
          `
        )
        .eq(
          'course_id',
          courseId
        )
        .order('lesson_order', {
          ascending: true,
        });

      if (lessonsError) {
        console.error(
          'Error loading lessons:',
          lessonsError
        );

        setMessage(
          'Could not load course lessons.'
        );

        return [];
      }

      const loadedLessons =
        lessonsData || [];

      setLessons(
        loadedLessons
      );

      // ========================================================
      // LOAD PROGRESS
      // IMPORTANT:
      // user_id + course_id
      // ========================================================

      if (
        user &&
        loadedLessons.length > 0
      ) {
        const lessonIds =
          loadedLessons.map(
            (lesson) =>
              lesson.id
          );

        const {
          data: progressData,
          error: progressError,
        } = await supabase
          .from('lesson_progress')
          .select(
            `
            id,
            user_id,
            course_id,
            lesson_id,
            completed,
            completed_at
            `
          )
          .eq(
            'user_id',
            user.id
          )
          .eq(
            'course_id',
            courseId
          )
          .in(
            'lesson_id',
            lessonIds
          );

        if (progressError) {
          console.error(
            'Error loading lesson progress:',
            progressError
          );

          setLessonProgress([]);
        } else {
          setLessonProgress(
            progressData || []
          );
        }
      } else {
        setLessonProgress([]);
      }

      return loadedLessons;
    } catch (error) {
      console.error(
        'Unexpected lessons error:',
        error
      );

      setMessage(
        'Something went wrong while loading lessons.'
      );

      return [];
    } finally {
      setLessonsLoading(false);
    }
  };

  // ============================================================
  // ENROLL
  // ============================================================

  const handleEnroll = async () => {
    setMessage('');

    if (!user) {
      setMessage(
        'Please login first to enroll in this course.'
      );
      return;
    }

    if (!selected) return;

    if (enrollment) {
      setMessage(
        'You are already enrolled in this course.'
      );
      return;
    }

    setEnrolling(true);

    try {
      const {
        data,
        error,
      } = await supabase
        .from('enrollments')
        .insert([
          {
            user_id: user.id,
            course_id: selected.id,
            progress: 0,
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(
          'Enrollment error:',
          error
        );

        if (
          error.code === '23505'
        ) {
          setMessage(
            'You are already enrolled in this course.'
          );

          await checkEnrollment();
        } else {
          setMessage(
            'Something went wrong. Please try again.'
          );
        }

        return;
      }

      setEnrollment(data);

      // ========================================================
      // UPDATE STUDENTS COUNT
      // ========================================================

      const currentStudents =
        Number(
          selected.students
        ) || 0;

      const {
        error: updateError,
      } = await supabase
        .from('courses')
        .update({
          students:
            currentStudents + 1,
        })
        .eq(
          'id',
          selected.id
        );

      if (updateError) {
        console.error(
          'Students count update error:',
          updateError
        );
      }

      setSelected({
        ...selected,
        students:
          currentStudents + 1,
      });

      setCourses(
        (prevCourses) =>
          prevCourses.map(
            (course) =>
              course.id ===
              selected.id
                ? {
                    ...course,
                    students:
                      currentStudents +
                      1,
                  }
                : course
          )
      );

      setMessage(
        'You have successfully enrolled in this course! 🎉'
      );
    } catch (error) {
      console.error(
        'Unexpected enrollment error:',
        error
      );

      setMessage(
        'Something went wrong. Please try again.'
      );
    } finally {
      setEnrolling(false);
    }
  };

  // ============================================================
  // START LEARNING
  // ============================================================

  const handleStartLearning =
    async () => {
      if (
        !selected ||
        !enrollment ||
        !user
      ) {
        return;
      }

      setMessage('');

      const lessonsData =
        await loadLessons(
          selected.id
        );

      if (
        !lessonsData ||
        lessonsData.length === 0
      ) {
        setMessage(
          'No lessons are available for this course yet.'
        );

        return;
      }

      // ========================================================
      // LOAD CURRENT COURSE PROGRESS
      // ========================================================

      const lessonIds =
        lessonsData.map(
          (lesson) =>
            lesson.id
        );

      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from('lesson_progress')
        .select(
          `
          id,
          user_id,
          course_id,
          lesson_id,
          completed,
          completed_at
          `
        )
        .eq(
          'user_id',
          user.id
        )
        .eq(
          'course_id',
          selected.id
        )
        .in(
          'lesson_id',
          lessonIds
        );

      if (progressError) {
        console.error(
          'Error loading current progress:',
          progressError
        );
      }

      const currentProgress =
        progressData || [];

      setLessonProgress(
        currentProgress
      );

      // ========================================================
      // COMPLETED LESSON IDS
      // ========================================================

      const completedIds =
        currentProgress
          .filter(
            (item) =>
              item.completed ===
              true
          )
          .map(
            (item) =>
              item.lesson_id
          );

      // ========================================================
      // FIRST UNCOMPLETED LESSON
      // ========================================================

      const firstUncompleted =
        lessonsData.find(
          (lesson) =>
            !completedIds.includes(
              lesson.id
            )
        );

      // If everything is completed,
      // open the last lesson
      const firstLesson =
        firstUncompleted ||
        lessonsData[
          lessonsData.length - 1
        ];

      setSelectedLesson(
        firstLesson
      );

      setLearningMode(true);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

  // ============================================================
  // CHECK LESSON COMPLETED
  // ============================================================

  const isLessonCompleted = (
    lessonId
  ) => {
    if (!lessonId) {
      return false;
    }

    return lessonProgress.some(
      (item) =>
        item.lesson_id ===
          lessonId &&
        item.course_id ===
          selected?.id &&
        item.completed === true
    );
  };

  // ============================================================
  // CALCULATE PROGRESS
  // ============================================================

  const calculateProgress = (
    currentLessons = lessons
  ) => {
    if (
      !currentLessons ||
      currentLessons.length === 0
    ) {
      return 0;
    }

    const completedCount =
      currentLessons.filter(
        (lesson) =>
          isLessonCompleted(
            lesson.id
          )
      ).length;

    return Math.round(
      (completedCount /
        currentLessons.length) *
        100
    );
  };

  // ============================================================
  // COMPLETE LESSON
  // ============================================================

  const handleCompleteLesson =
    async () => {
      if (
        !user ||
        !selected ||
        !selectedLesson
      ) {
        return;
      }

      if (
        isLessonCompleted(
          selectedLesson.id
        )
      ) {
        return;
      }

      setCompletingLesson(true);
      setMessage('');

      try {
        // ======================================================
        // SAVE LESSON PROGRESS
        // IMPORTANT:
        // course_id INCLUDED
        // ======================================================

        const {
          data,
          error,
        } = await supabase
          .from('lesson_progress')
          .upsert(
            {
              user_id: user.id,
              course_id:
                selected.id,
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
          )
          .select()
          .single();

        if (error) {
          console.error(
            'Lesson progress error:',
            error
          );

          setMessage(
            'Could not save lesson progress.'
          );

          return;
        }

        // ======================================================
        // UPDATE LOCAL PROGRESS
        // ======================================================

        setLessonProgress(
          (prev) => {
            const exists =
              prev.some(
                (item) =>
                  item.lesson_id ===
                    selectedLesson.id &&
                  item.course_id ===
                    selected.id
              );

            if (exists) {
              return prev.map(
                (item) =>
                  item.lesson_id ===
                      selectedLesson.id &&
                    item.course_id ===
                      selected.id
                    ? data
                    : item
              );
            }

            return [
              ...prev,
              data,
            ];
          }
        );

        // ======================================================
        // CALCULATE NEW PROGRESS
        // ======================================================

        const completedCount =
          lessons.filter(
            (lesson) => {
              if (
                lesson.id ===
                selectedLesson.id
              ) {
                return true;
              }

              return isLessonCompleted(
                lesson.id
              );
            }
          ).length;

        const newProgress =
          lessons.length > 0
            ? Math.round(
                (completedCount /
                  lessons.length) *
                  100
              )
            : 0;

        // ======================================================
        // UPDATE ENROLLMENT
        // ======================================================

        const {
          data: updatedEnrollment,
          error:
            enrollmentError,
        } = await supabase
          .from('enrollments')
          .update({
            progress:
              newProgress,
            completed:
              newProgress >= 100,
          })
          .eq(
            'user_id',
            user.id
          )
          .eq(
            'course_id',
            selected.id
          )
          .select()
          .single();

        if (enrollmentError) {
          console.error(
            'Enrollment progress error:',
            enrollmentError
          );
        } else {
          setEnrollment(
            updatedEnrollment
          );
        }

        setMessage(
          newProgress >= 100
            ? 'Congratulations! You completed the course! 🎉'
            : 'Lesson completed successfully! ✅'
        );
      } catch (error) {
        console.error(
          'Unexpected complete lesson error:',
          error
        );

        setMessage(
          'Something went wrong. Please try again.'
        );
      } finally {
        setCompletingLesson(false);
      }
    };

  // ============================================================
  // NEXT LESSON
  // ============================================================

  const handleNextLesson =
    () => {
      if (
        !selectedLesson ||
        lessons.length === 0
      ) {
        return;
      }

      if (
        !isLessonCompleted(
          selectedLesson.id
        )
      ) {
        setMessage(
          'Please complete the current lesson first.'
        );

        return;
      }

      const currentIndex =
        lessons.findIndex(
          (lesson) =>
            lesson.id ===
            selectedLesson.id
        );

      if (
        currentIndex === -1
      ) {
        return;
      }

      const nextLesson =
        lessons[
          currentIndex + 1
        ];

      if (nextLesson) {
        setSelectedLesson(
          nextLesson
        );

        setMessage('');

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      } else {
        setMessage(
          'You have completed all available lessons! 🎉'
        );
      }
    };

  // ============================================================
  // SELECT LESSON
  // ============================================================

  const handleSelectLesson = (
    lesson
  ) => {
    setSelectedLesson(
      lesson
    );

    setMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ============================================================
  // EXIT LEARNING
  // ============================================================

  const handleExitLearning =
    () => {
      setLearningMode(false);
      setSelectedLesson(null);
      setLessons([]);
      setLessonProgress([]);
      setMessage('');
    };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const handleSubmitReview =
    async () => {
      if (!user) {
        setMessage(
          'Please login first to leave a review.'
        );
        return;
      }

      if (!myRating) {
        setMessage(
          'Please select a rating first.'
        );
        return;
      }

      if (!selected) return;

      setReviewLoading(true);

      try {
        const {
          error,
        } = await supabase
          .from('reviews')
          .upsert(
            {
              course_id:
                selected.id,
              user_id: user.id,
              rating: myRating,
              comment:
                comment.trim(),
            },
            {
              onConflict:
                'user_id,course_id',
            }
          );

        if (error) {
          console.error(
            'Review error:',
            error
          );

          setMessage(
            'Could not submit your review.'
          );

          return;
        }

        setSubmitted(true);

        setMessage(
          'Your review has been submitted successfully! ⭐'
        );

        await fetchReviews();
      } catch (error) {
        console.error(
          'Unexpected review error:',
          error
        );

        setMessage(
          'Something went wrong. Please try again.'
        );
      } finally {
        setReviewLoading(false);
      }
    };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    setDetailsVisible(false);

    setTimeout(() => {
      setSelected(null);
      setReviews([]);
      setEnrollment(null);
      setSubmitted(false);
      setMyRating(0);
      setComment('');
      setMessage('');
      setLessons([]);
      setLessonProgress([]);
      setSelectedLesson(null);
      setLearningMode(false);
    }, 250);
  };

  // ============================================================
  // AVERAGE RATING
  // ============================================================

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total +
              Number(
                review.rating || 0
              ),
            0
          ) /
          reviews.length
        ).toFixed(1)
      : null;

  // ============================================================
  // CATEGORIES
  // ============================================================

  const categories = [
    'All',
    ...new Set(
      courses
        .map(
          (course) =>
            course.category
        )
        .filter(Boolean)
    ),
  ];

  // ============================================================
  // FILTER
  // ============================================================

  const filtered =
    courses.filter(
      (course) => {
        const matchesCategory =
          category === 'All' ||
          course.category ===
            category;

        const searchText =
          search
            .trim()
            .toLowerCase();

        const matchesSearch =
          !searchText ||
          course.title
            ?.toLowerCase()
            .includes(
              searchText
            ) ||
          course.category
            ?.toLowerCase()
            .includes(
              searchText
            );

        return (
          matchesCategory &&
          matchesSearch
        );
      }
    );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <section
        style={{
          minHeight: '100vh',
          background: dm.bg,
          display: 'flex',
          justifyContent:
            'center',
          alignItems: 'center',
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
              marginBottom: '15px',
            }}
          />

          <p
            style={{
              color: dm.text,
            }}
          >
            Loading courses...
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // LEARNING MODE
  // ============================================================

  if (
    learningMode &&
    selected &&
    selectedLesson
  ) {
    const currentProgress =
      calculateProgress();

    const currentIndex =
      lessons.findIndex(
        (lesson) =>
          lesson.id ===
          selectedLesson.id
      );

    const hasNextLesson =
      currentIndex <
      lessons.length - 1;

    const completed =
      isLessonCompleted(
        selectedLesson.id
      );

    return (
      <section
        style={{
          minHeight: '100vh',
          background: dm.bg,
          padding:
            '30px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* TOP BAR */}

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center',
              gap: '15px',
              flexWrap:
                'wrap',
              marginBottom:
                '25px',
            }}
          >
            <button
              onClick={
                handleExitLearning
              }
              style={{
                padding:
                  '10px 18px',
                background:
                  dm.btnBack,
                color:
                  'white',
                border:
                  'none',
                borderRadius:
                  '8px',
                cursor:
                  'pointer',
                fontWeight:
                  '600',
              }}
            >
              <i className="fas fa-arrow-left" />{' '}
              Back to Course
            </button>

            <div
              style={{
                color:
                  dm.heading,
                fontWeight:
                  '700',
              }}
            >
              {selected.title}
            </div>
          </div>

          {/* PROGRESS */}

          <div
            style={{
              background:
                dm.reviewBg,
              padding:
                '20px',
              borderRadius:
                '12px',
              boxShadow:
                dm.shadow,
              marginBottom:
                '25px',
            }}
          >
            <div
              style={{
                display:
                  'flex',
                justifyContent:
                  'space-between',
                marginBottom:
                  '10px',
              }}
            >
              <strong
                style={{
                  color:
                    dm.heading,
                }}
              >
                Course Progress
              </strong>

              <span
                style={{
                  color:
                    dm.text,
                }}
              >
                {currentProgress}%
              </span>
            </div>

            <div
              style={{
                width:
                  '100%',
                height:
                  '10px',
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
                  width: `${currentProgress}%`,
                  height:
                    '100%',
                  background:
                    'linear-gradient(90deg, #003366, #f0a500)',
                  transition:
                    'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {/* LEARNING LAYOUT */}

          <div
            className="learning-layout"
            style={{
              display:
                'grid',
              gridTemplateColumns:
                'minmax(0, 2fr) minmax(280px, 1fr)',
              gap: '25px',
              alignItems:
                'start',
            }}
          >
            {/* LESSON CONTENT */}

            <div
              style={{
                background:
                  dm.reviewBg,
                borderRadius:
                  '15px',
                padding:
                  '30px',
                boxShadow:
                  dm.shadow,
              }}
            >
              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: '12px',
                  marginBottom:
                    '20px',
                }}
              >
                <div
                  style={{
                    width:
                      '50px',
                    height:
                      '50px',
                    borderRadius:
                      '12px',
                    background:
                      'linear-gradient(135deg, #003366, #005599)',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    color:
                      '#f0a500',
                    fontSize:
                      '1.4rem',
                  }}
                >
                  <i className="fas fa-play" />
                </div>

                <div>
                  <p
                    style={{
                      color:
                        dm.subtext,
                      margin:
                        '0 0 5px',
                      fontSize:
                        '0.85rem',
                    }}
                  >
                    Lesson{' '}
                    {currentIndex +
                      1}{' '}
                    of{' '}
                    {
                      lessons.length
                    }
                  </p>

                  <h1
                    style={{
                      color:
                        dm.heading,
                      margin: 0,
                    }}
                  >
                    {
                      selectedLesson.title
                    }
                  </h1>
                </div>
              </div>

              {/* DESCRIPTION */}

              {selectedLesson.description && (
                <p
                  style={{
                    color:
                      dm.subtext,
                    fontSize:
                      '1.05rem',
                    lineHeight:
                      '1.7',
                    marginBottom:
                      '25px',
                  }}
                >
                  {
                    selectedLesson.description
                  }
                </p>
              )}

              {/* CONTENT */}

              <div
                style={{
                  color:
                    dm.text,
                  fontSize:
                    '1rem',
                  lineHeight:
                    '1.9',
                  whiteSpace:
                    'pre-wrap',
                  wordBreak:
                    'break-word',
                  borderTop:
                    `1px solid ${dm.cardBorder}`,
                  paddingTop:
                    '25px',
                }}
              >
                {selectedLesson.content ||
                  'No content available for this lesson yet.'}
              </div>

              {/* MESSAGE */}

              {message && (
                <div
                  style={{
                    marginTop:
                      '25px',
                    padding:
                      '15px',
                    borderRadius:
                      '10px',
                    background:
                      message.includes(
                        'successfully'
                      ) ||
                      message.includes(
                        'Congratulations'
                      )
                        ? dm.successBg
                        : dm.tagBg,
                    color:
                      message.includes(
                        'successfully'
                      ) ||
                      message.includes(
                        'Congratulations'
                      )
                        ? '#10b981'
                        : dm.heading,
                    fontWeight:
                      '600',
                    textAlign:
                      'center',
                  }}
                >
                  {message}
                </div>
              )}

              {/* ACTIONS */}

              <div
                style={{
                  display:
                    'flex',
                  gap: '12px',
                  marginTop:
                    '30px',
                  flexWrap:
                    'wrap',
                }}
              >
                {!completed ? (
                  <button
                    onClick={
                      handleCompleteLesson
                    }
                    disabled={
                      completingLesson
                    }
                    style={{
                      flex: 1,
                      minWidth:
                        '200px',
                      padding:
                        '14px 20px',
                      background:
                        completingLesson
                          ? '#888'
                          : 'linear-gradient(90deg, #10b981, #059669)',
                      color:
                        'white',
                      border:
                        'none',
                      borderRadius:
                        '10px',
                      fontWeight:
                        '700',
                      cursor:
                        completingLesson
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    <i
                      className={
                        completingLesson
                          ? 'fas fa-spinner fa-spin'
                          : 'fas fa-check'
                      }
                    />{' '}
                    {completingLesson
                      ? 'Saving...'
                      : 'Mark as Complete'}
                  </button>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      minWidth:
                        '200px',
                      padding:
                        '14px 20px',
                      background:
                        dm.successBg,
                      color:
                        '#10b981',
                      borderRadius:
                        '10px',
                      fontWeight:
                        '700',
                      textAlign:
                        'center',
                    }}
                  >
                    <i className="fas fa-check-circle" />{' '}
                    Lesson Completed
                  </div>
                )}

                {hasNextLesson && (
                  <button
                    onClick={
                      handleNextLesson
                    }
                    disabled={
                      !completed
                    }
                    style={{
                      flex: 1,
                      minWidth:
                        '200px',
                      padding:
                        '14px 20px',
                      background:
                        completed
                          ? dm.btnBack
                          : '#999',
                      color:
                        'white',
                      border:
                        'none',
                      borderRadius:
                        '10px',
                      fontWeight:
                        '700',
                      cursor:
                        completed
                          ? 'pointer'
                          : 'not-allowed',
                    }}
                  >
                    Next Lesson{' '}
                    <i className="fas fa-arrow-right" />
                  </button>
                )}
              </div>
            </div>

            {/* LESSON LIST */}

            <div
              style={{
                background:
                  dm.reviewBg,
                borderRadius:
                  '15px',
                padding:
                  '20px',
                boxShadow:
                  dm.shadow,
                position:
                  'sticky',
                top: '20px',
              }}
            >
              <h3
                style={{
                  color:
                    dm.heading,
                  marginTop: 0,
                  marginBottom:
                    '20px',
                }}
              >
                <i className="fas fa-list" />{' '}
                Course Lessons
              </h3>

              {lessons.map(
                (
                  lesson,
                  index
                ) => {
                  const isActive =
                    selectedLesson.id ===
                    lesson.id;

                  const isCompleted =
                    isLessonCompleted(
                      lesson.id
                    );

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
                        width:
                          '100%',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap:
                          '12px',
                        padding:
                          '14px',
                        marginBottom:
                          '10px',
                        textAlign:
                          'left',
                        background:
                          isActive
                            ? darkMode
                              ? '#2a3580'
                              : '#eaf2f8'
                            : darkMode
                            ? '#1e2130'
                            : '#f8fafc',
                        border:
                          isActive
                            ? `2px solid ${dm.btnBack}`
                            : `1px solid ${dm.cardBorder}`,
                        borderRadius:
                          '10px',
                        color:
                          dm.text,
                        cursor:
                          'pointer',
                      }}
                    >
                      <div
                        style={{
                          width:
                            '32px',
                          height:
                            '32px',
                          minWidth:
                            '32px',
                          borderRadius:
                            '50%',
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          background:
                            isCompleted
                              ? '#10b981'
                              : dm.btnBack,
                          color:
                            'white',
                          fontSize:
                            '0.8rem',
                          fontWeight:
                            '700',
                        }}
                      >
                        {isCompleted ? (
                          <i className="fas fa-check" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            color:
                              isActive
                                ? dm.heading
                                : dm.text,
                            fontWeight:
                              '700',
                            fontSize:
                              '0.9rem',
                          }}
                        >
                          {
                            lesson.title
                          }
                        </div>

                        <div
                          style={{
                            color:
                              isCompleted
                                ? '#10b981'
                                : dm.subtext,
                            fontSize:
                              '0.75rem',
                            marginTop:
                              '4px',
                          }}
                        >
                          {isCompleted
                            ? 'Completed'
                            : 'Not completed'}
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <style>
          {`
            @media (max-width: 800px) {
              .learning-layout {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
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
          padding:
            '60px 20px',
          maxWidth:
            '800px',
          margin:
            '0 auto',
          background:
            dm.bg,
          minHeight:
            '100vh',
          opacity:
            detailsVisible
              ? 1
              : 0,
          transform:
            detailsVisible
              ? 'translateY(0)'
              : 'translateY(20px)',
          transition:
            'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* BACK */}

        <button
          onClick={
            handleBack
          }
          style={{
            marginBottom:
              '30px',
            padding:
              '10px 20px',
            background:
              dm.btnBack,
            color:
              'white',
            border:
              'none',
            borderRadius:
              '8px',
            cursor:
              'pointer',
          }}
        >
          <i className="fas fa-arrow-left" />{' '}
          Back
        </button>

        {/* COURSE INFO */}

        <div
          style={{
            textAlign:
              'center',
            marginBottom:
              '40px',
          }}
        >
          <div
            style={{
              width:
                '90px',
              height:
                '90px',
              margin:
                '0 auto 20px',
              borderRadius:
                '50%',
              background:
                'linear-gradient(135deg, #003366, #005599)',
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              boxShadow:
                '0 10px 30px rgba(0,51,102,0.25)',
            }}
          >
            <i
              className="fas fa-book-open"
              style={{
                fontSize:
                  '2.5rem',
                color:
                  '#f0a500',
              }}
            />
          </div>

          <h1
            style={{
              color:
                dm.heading,
            }}
          >
            {
              selected.title
            }
          </h1>

          <span
            style={{
              display:
                'inline-block',
              marginTop:
                '10px',
              padding:
                '6px 15px',
              background:
                dm.tagBg,
              color:
                dm.tagColor,
              borderRadius:
                '20px',
              fontSize:
                '0.85rem',
            }}
          >
            {
              selected.category
            }
          </span>

          <div
            style={{
              display:
                'flex',
              justifyContent:
                'center',
              gap:
                '30px',
              flexWrap:
                'wrap',
              marginTop:
                '25px',
            }}
          >
            <div>
              <i
                className="fas fa-users"
                style={{
                  color:
                    '#10b981',
                }}
              />

              <p
                style={{
                  color:
                    dm.text,
                  marginTop:
                    '5px',
                }}
              >
                {selected.students ||
                  0}{' '}
                Students
              </p>
            </div>

            <div>
              <i
                className="fas fa-star"
                style={{
                  color:
                    '#f0a500',
                }}
              />

              <p
                style={{
                  color:
                    dm.text,
                  marginTop:
                    '5px',
                }}
              >
                {avgRating ||
                  selected.rating ||
                  'No rating'}
              </p>
            </div>
          </div>
        </div>

        {/* ENROLLMENT */}

        <div
          style={{
            background:
              dm.reviewBg,
            borderRadius:
              '15px',
            padding:
              '25px',
            boxShadow:
              dm.shadow,
            marginBottom:
              '30px',
            textAlign:
              'center',
          }}
        >
          {enrollment ? (
            <>
              <div
                style={{
                  color:
                    '#10b981',
                  fontSize:
                    '2rem',
                  marginBottom:
                    '10px',
                }}
              >
                <i className="fas fa-check-circle" />
              </div>

              <h3
                style={{
                  color:
                    dm.heading,
                }}
              >
                You are enrolled 🎉
              </h3>

              <p
                style={{
                  color:
                    dm.text,
                  marginTop:
                    '10px',
                }}
              >
                Your progress:{' '}
                <strong>
                  {enrollment.progress ||
                    0}
                  %
                </strong>
              </p>

              <div
                style={{
                  width:
                    '100%',
                  height:
                    '10px',
                  background:
                    darkMode
                      ? '#2a2d3d'
                      : '#e5e7eb',
                  borderRadius:
                    '10px',
                  overflow:
                    'hidden',
                  marginTop:
                    '15px',
                }}
              >
                <div
                  style={{
                    width: `${
                      enrollment.progress ||
                      0
                    }%`,
                    height:
                      '100%',
                    background:
                      'linear-gradient(90deg, #003366, #f0a500)',
                    borderRadius:
                      '10px',
                  }}
                />
              </div>

              <button
                onClick={
                  handleStartLearning
                }
                disabled={
                  lessonsLoading
                }
                style={{
                  width:
                    '100%',
                  padding:
                    '14px',
                  marginTop:
                    '20px',
                  background:
                    lessonsLoading
                      ? '#888'
                      : 'linear-gradient(90deg, #003366, #005599)',
                  color:
                    'white',
                  border:
                    'none',
                  borderRadius:
                    '10px',
                  fontWeight:
                    '700',
                  fontSize:
                    '1rem',
                  cursor:
                    lessonsLoading
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
                  : 'Start Learning'}
              </button>
            </>
          ) : (
            <>
              <h3
                style={{
                  color:
                    dm.heading,
                }}
              >
                Ready to start learning?
              </h3>

              <p
                style={{
                  color:
                    dm.text,
                  margin:
                    '10px 0 20px',
                }}
              >
                Enroll now and start your learning journey.
              </p>

              <button
                onClick={
                  handleEnroll
                }
                disabled={
                  enrolling
                }
                style={{
                  width:
                    '100%',
                  padding:
                    '14px',
                  background:
                    enrolling
                      ? '#888'
                      : 'linear-gradient(90deg, #003366, #005599)',
                  color:
                    'white',
                  border:
                    'none',
                  borderRadius:
                    '10px',
                  fontWeight:
                    '700',
                  fontSize:
                    '1rem',
                  cursor:
                    enrolling
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                <i
                  className={
                    enrolling
                      ? 'fas fa-spinner fa-spin'
                      : 'fas fa-graduation-cap'
                  }
                />{' '}
                {enrolling
                  ? 'Enrolling...'
                  : 'Enroll Now'}
              </button>
            </>
          )}

          {message && (
            <p
              style={{
                marginTop:
                  '15px',
                color:
                  message.includes(
                    'successfully'
                  ) ||
                  message.includes(
                    'Congratulations'
                  )
                    ? '#10b981'
                    : dm.heading,
                fontWeight:
                  '600',
              }}
            >
              {message}
            </p>
          )}
        </div>

        {/* REVIEWS */}

        <div
          style={{
            background:
              dm.reviewBg,
            borderRadius:
              '12px',
            padding:
              '30px',
            boxShadow:
              dm.shadow,
            marginBottom:
              '30px',
          }}
        >
          <h2
            style={{
              color:
                dm.heading,
              marginBottom:
                '20px',
            }}
          >
            <i className="fas fa-star" /> Reviews
          </h2>

          {reviewLoading ? (
            <p
              style={{
                color:
                  dm.subtext,
                textAlign:
                  'center',
              }}
            >
              <i className="fas fa-spinner fa-spin" />{' '}
              Loading...
            </p>
          ) : reviews.length ===
            0 ? (
            <p
              style={{
                color:
                  dm.subtext,
                textAlign:
                  'center',
              }}
            >
              No reviews yet. Be the first!
            </p>
          ) : (
            reviews.map(
              (review) => (
                <div
                  key={
                    review.id
                  }
                  style={{
                    padding:
                      '15px 0',
                    borderBottom:
                      `1px solid ${dm.cardBorder}`,
                  }}
                >
                  <StarRating
                    rating={
                      review.rating
                    }
                  />

                  {review.comment && (
                    <p
                      style={{
                        color:
                          dm.text,
                        marginTop:
                          '8px',
                      }}
                    >
                      {
                        review.comment
                      }
                    </p>
                  )}
                </div>
              )
            )
          )}
        </div>

        {/* ADD REVIEW */}

        {!submitted ? (
          <div
            style={{
              background:
                dm.reviewBg,
              borderRadius:
                '12px',
              padding:
                '30px',
              boxShadow:
                dm.shadow,
            }}
          >
            <h2
              style={{
                color:
                  dm.heading,
                marginBottom:
                  '20px',
              }}
            >
              <i className="fas fa-pen" /> Add Your Review
            </h2>

            {!user ? (
              <p
                style={{
                  color:
                    dm.subtext,
                  textAlign:
                    'center',
                }}
              >
                Please login to leave a review.
              </p>
            ) : (
              <>
                <p
                  style={{
                    color:
                      dm.heading,
                    fontWeight:
                      '600',
                  }}
                >
                  Your Rating:
                </p>

                <StarRating
                  rating={
                    myRating
                  }
                  onRate={
                    setMyRating
                  }
                />

                <textarea
                  value={
                    comment
                  }
                  onChange={(
                    e
                  ) =>
                    setComment(
                      e.target
                        .value
                    )
                  }
                  placeholder="Write your review..."
                  rows={4}
                  style={{
                    width:
                      '100%',
                    padding:
                      '12px',
                    borderRadius:
                      '8px',
                    border:
                      `1px solid ${dm.inputBorder}`,
                    fontSize:
                      '1rem',
                    marginTop:
                      '15px',
                    marginBottom:
                      '15px',
                    background:
                      dm.input,
                    color:
                      dm.inputColor,
                    resize:
                      'vertical',
                    boxSizing:
                      'border-box',
                  }}
                />

                <button
                  onClick={
                    handleSubmitReview
                  }
                  disabled={
                    !myRating ||
                    reviewLoading
                  }
                  style={{
                    width:
                      '100%',
                    padding:
                      '14px',
                    background:
                      myRating
                        ? dm.btnBack
                        : '#999',
                    color:
                      'white',
                    border:
                      'none',
                    borderRadius:
                      '8px',
                    fontWeight:
                      '700',
                    cursor:
                      myRating
                        ? 'pointer'
                        : 'not-allowed',
                  }}
                >
                  <i className="fas fa-paper-plane" />{' '}
                  {reviewLoading
                    ? 'Submitting...'
                    : 'Submit Review'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              background:
                dm.successBg,
              borderRadius:
                '12px',
              padding:
                '30px',
              textAlign:
                'center',
            }}
          >
            <i
              className="fas fa-check-circle"
              style={{
                fontSize:
                  '3rem',
                color:
                  '#10b981',
                marginBottom:
                  '15px',
              }}
            />

            <h3
              style={{
                color:
                  dm.heading,
              }}
            >
              Review Submitted! Thank you 🎉
            </h3>
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
        background:
          dm.bg,
        minHeight:
          '100vh',
        padding:
          '40px 20px',
        opacity:
          pageVisible
            ? 1
            : 0,
        transform:
          pageVisible
            ? 'translateY(0)'
            : 'translateY(20px)',
        transition:
          'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <h1
        style={{
          color:
            dm.heading,
          textAlign:
            'center',
        }}
      >
        <i className="fas fa-book-open" /> Our Courses
      </h1>

      {/* SEARCH */}

      <div
        style={{
          maxWidth:
            '700px',
          margin:
            '30px auto 40px',
        }}
      >
        <div
          style={{
            position:
              'relative',
            marginBottom:
              '20px',
          }}
        >
          <i
            className="fas fa-search"
            style={{
              position:
                'absolute',
              left:
                '15px',
              top:
                '50%',
              transform:
                'translateY(-50%)',
              color:
                dm.subtext,
            }}
          />

          <input
            type="text"
            placeholder="Search courses..."
            value={
              search
            }
            onChange={(
              e
            ) =>
              setSearch(
                e.target
                  .value
              )
            }
            style={{
              width:
                '100%',
              padding:
                '14px 14px 14px 45px',
              borderRadius:
                '10px',
              border:
                `2px solid ${dm.inputBorder}`,
              fontSize:
                '1rem',
              outline:
                'none',
              background:
                dm.input,
              color:
                dm.inputColor,
              boxSizing:
                'border-box',
            }}
          />
        </div>

        {/* CATEGORIES */}

        <div
          style={{
            display:
              'flex',
            gap:
              '10px',
            justifyContent:
              'center',
            flexWrap:
              'wrap',
          }}
        >
          {categories.map(
            (cat) => (
              <button
                key={
                  cat
                }
                onClick={() =>
                  setCategory(
                    cat
                  )
                }
                style={{
                  padding:
                    '8px 20px',
                  borderRadius:
                    '20px',
                  border:
                    `2px solid ${dm.catBorder}`,
                  background:
                    category ===
                    
