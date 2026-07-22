import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pageVisible, setPageVisible] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);

  const { darkMode } = useLang();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/');
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }

      setTimeout(() => {
        setPageVisible(true);
      }, 100);

      setTimeout(() => {
        setProgressVisible(true);
      }, 700);
    };

    getUser();
  }, [navigate]);

  const bg = darkMode ? '#0f0f0f' : '#f5f5f5';
  const card = darkMode ? '#1a1a2e' : 'white';
  const text = darkMode ? 'white' : '#003366';
  const text2 = darkMode ? '#a8c8f0' : '#888';
  const progressBg = darkMode ? '#2e2e4e' : '#f0f0f0';

  const stats = [
    {
      icon: 'fas fa-book-open',
      label: 'Enrolled Courses',
      value: '3',
      color: '#003366'
    },
    {
      icon: 'fas fa-check-circle',
      label: 'Completed',
      value: '1',
      color: '#10b981'
    },
    {
      icon: 'fas fa-clock',
      label: 'Hours Learned',
      value: '12',
      color: '#f0a500'
    },
    {
      icon: 'fas fa-certificate',
      label: 'Certificates',
      value: '1',
      color: '#6366f1'
    }
  ];

  const myCourses = [
    {
      title: 'React Development',
      progress: 75,
      icon: 'fab fa-react',
      color: '#61dafb'
    },
    {
      title: 'JavaScript Advanced',
      progress: 40,
      icon: 'fab fa-js',
      color: '#f7df1e'
    },
    {
      title: 'HTML & CSS',
      progress: 100,
      icon: 'fab fa-html5',
      color: '#e34f26'
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bg,
        padding: '40px 20px',
        transition: 'background 0.3s ease',
        opacity: pageVisible ? 1 : 0,
        transform: pageVisible
          ? 'translateY(0)'
          : 'translateY(20px)',
        transitionProperty: 'opacity, transform, background',
        transitionDuration: '0.7s',
        transitionTimingFunction: 'ease'
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto'
        }}
      >

        {/* =========================
            Welcome Section
        ========================= */}

        <div
          style={{
            background:
              'linear-gradient(135deg, #003366, #005599)',
            borderRadius: '12px',
            padding: '40px',
            color: 'white',
            marginBottom: '30px',
            animation: 'dashboardWelcome 0.8s ease both',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.15)'
          }}
        >
          <h1
            style={{
              marginBottom: '10px'
            }}
          >
            <i className="fas fa-graduation-cap"></i>{' '}
            Welcome back, {profile?.username || user?.email}!
          </h1>

          <p
            style={{
              color: '#a8c8f0'
            }}
          >
            Continue your learning journey at Zephyr Academy
          </p>
        </div>

        {/* =========================
            Stats
        ========================= */}

        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '30px'
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                flex: '1',
                minWidth: '200px',
                background: card,
                borderRadius: '12px',
                padding: '25px',
                boxShadow:
                  '0 4px 15px rgba(0,0,0,0.08)',
                borderTop:
                  `4px solid ${stat.color}`,
                textAlign: 'center',
                transition:
                  'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                animation:
                  'dashboardCardEnter 0.7s ease both',
                animationDelay:
                  `${0.15 + i * 0.12}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-8px)';

                e.currentTarget.style.boxShadow =
                  '0 12px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  'translateY(0)';

                e.currentTarget.style.boxShadow =
                  '0 4px 15px rgba(0,0,0,0.08)';
              }}
            >
              <i
                className={stat.icon}
                style={{
                  fontSize: '2rem',
                  color: stat.color,
                  marginBottom: '10px',
                  display: 'block',
                  transition:
                    'transform 0.3s ease'
                }}
              ></i>

              <h2
                style={{
                  color: stat.color,
                  fontSize: '2rem',
                  margin: '0 0 5px'
                }}
              >
                {stat.value}
              </h2>

              <p
                style={{
                  color: text2,
                  fontSize: '0.9rem'
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* =========================
            My Courses
        ========================= */}

        <div
          style={{
            background: card,
            borderRadius: '12px',
            padding: '30px',
            boxShadow:
              '0 4px 15px rgba(0,0,0,0.08)',
            marginBottom: '30px',
            transition:
              'background 0.3s ease, transform 0.3s ease',
            animation:
              'dashboardSectionEnter 0.8s 0.5s ease both'
          }}
        >
          <h2
            style={{
              color: text,
              marginBottom: '25px'
            }}
          >
            <i className="fas fa-book"></i>{' '}
            My Courses
          </h2>

          {myCourses.map((course, i) => (
            <div
              key={i}
              style={{
                marginBottom:
                  i === myCourses.length - 1
                    ? '0'
                    : '25px',
                animation:
                  'courseProgressEnter 0.6s ease both',
                animationDelay:
                  `${0.7 + i * 0.15}s`
              }}
            >
              {/* Course Header */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}
              >
                <span
                  style={{
                    fontWeight: '600',
                    color: text
                  }}
                >
                  <i
                    className={course.icon}
                    style={{
                      color: course.color,
                      marginRight: '8px'
                    }}
                  ></i>

                  {course.title}
                </span>

                <span
                  style={{
                    color: text2,
                    fontWeight: '600'
                  }}
                >
                  {course.progress}%
                </span>
              </div>

              {/* Progress Bar */}

              <div
                style={{
                  background: progressBg,
                  borderRadius: '10px',
                  height: '10px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    background:
                      course.progress === 100
                        ? '#10b981'
                        : '#003366',
                    width:
                      progressVisible
                        ? `${course.progress}%`
                        : '0%',
                    height: '10px',
                    borderRadius: '10px',
                    transition:
                      'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* =========================
            Quick Actions
        ========================= */}

        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            animation:
              'dashboardSectionEnter 0.8s 0.8s ease both'
          }}
        >
          <button
            onClick={() =>
              navigate('/courses')
            }
            style={{
              flex: '1',
              padding: '20px',
              background: '#003366',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition:
                'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                'translateY(-5px)';

              e.currentTarget.style.boxShadow =
                '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                'translateY(0)';

              e.currentTarget.style.boxShadow =
                'none';
            }}
          >
            <i className="fas fa-plus"></i>{' '}
            Browse Courses
          </button>

          <button
            onClick={() =>
              navigate('/profile')
            }
            style={{
              flex: '1',
              padding: '20px',
              background: '#f0a500',
              color: '#003366',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition:
                'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                'translateY(-5px)';

              e.currentTarget.style.boxShadow =
                '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform =
                'translateY(0)';

              e.currentTarget.style.boxShadow =
                'none';
            }}
          >
            <i className="fas fa-user"></i>{' '}
            Edit Profile
          </button>
        </div>

      </div>

      {/* =========================
          Dashboard Animations
      ========================= */}

      <style>
        {`
          @keyframes dashboardWelcome {
            from {
              opacity: 0;
              transform: translateY(-25px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes dashboardCardEnter {
            from {
              opacity: 0;
              transform: translateY(35px) scale(0.95);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes dashboardSectionEnter {
            from {
              opacity: 0;
              transform: translateY(30px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes courseProgressEnter {
            from {
              opacity: 0;
              transform: translateX(-25px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

    </div>
  );
};

export default Dashboard;
