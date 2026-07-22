import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../App.css';

const Admin = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [profiles, setProfiles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Loading states
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Notification states
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('');

  // Courses - نفس البيانات الموجودة عندك
  const courses = [
    {
      title: 'React Development',
      students: 45,
      rating: 4.9,
      category: 'Frontend',
    },
    {
      title: 'JavaScript Advanced',
      students: 38,
      rating: 4.7,
      category: 'Frontend',
    },
    {
      title: 'HTML & CSS',
      students: 62,
      rating: 4.8,
      category: 'Frontend',
    },
    {
      title: 'Python Programming',
      students: 29,
      rating: 4.6,
      category: 'Backend',
    },
    {
      title: 'UI/UX Design',
      students: 21,
      rating: 4.9,
      category: 'Design',
    },
    {
      title: 'Database & SQL',
      students: 33,
      rating: 4.7,
      category: 'Backend',
    },
  ];

  // ─────────────────────────────────────────────
  // Check Admin
  // ─────────────────────────────────────────────
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/');
        return;
      }

      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  // ─────────────────────────────────────────────
  // Fetch Profiles
  // ─────────────────────────────────────────────
  const fetchProfiles = async () => {
    setProfilesLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, type, bio')
        .order('username', { ascending: true });

      if (error) throw error;

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      alert('Failed to load profiles: ' + error.message);
    } finally {
      setProfilesLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Fetch Reviews
  // ─────────────────────────────────────────────
  const fetchReviews = async () => {
    setReviewsLoading(true);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, course_id, user_id, rating, comment')
        .order('id', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      alert('Failed to load reviews: ' + error.message);
    } finally {
      setReviewsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Fetch Sessions
  // ─────────────────────────────────────────────
  const fetchSessions = async () => {
    setSessionsLoading(true);

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, title, course, data, time')
        .order('id', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      alert('Failed to load sessions: ' + error.message);
    } finally {
      setSessionsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Load data when opening tabs
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'profiles') {
      fetchProfiles();
    }

    if (activeTab === 'reviews') {
      fetchReviews();
    }

    if (activeTab === 'sessions') {
      fetchSessions();
    }
  }, [activeTab]);

  // ─────────────────────────────────────────────
  // Send Notification
  // ─────────────────────────────────────────────
  const sendNotification = async (e) => {
    e.preventDefault();

    if (
      !notificationTitle.trim() ||
      !notificationMessage.trim()
    ) {
      setNotificationStatus(
        'Please enter notification title and message.'
      );
      return;
    }

    setSendingNotification(true);
    setNotificationStatus('');

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([
          {
            title: notificationTitle.trim(),
            message: notificationMessage.trim(),
          },
        ]);

      if (error) {
        throw error;
      }

      setNotificationStatus(
        'Notification sent successfully!'
      );

      setNotificationTitle('');
      setNotificationMessage('');
    } catch (error) {
      console.error(
        'Error sending notification:',
        error
      );

      setNotificationStatus(
        'Failed to send notification: ' +
          error.message
      );
    } finally {
      setSendingNotification(false);
    }
  };

  // ─────────────────────────────────────────────
  // Loading Screen
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <i
          className="fas fa-spinner fa-spin"
          style={{
            fontSize: '3rem',
            color: '#003366',
          }}
        ></i>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────
  const stats = [
    {
      icon: 'fas fa-users',
      label: 'Total Profiles',
      value: profiles.length,
      color: '#003366',
    },
    {
      icon: 'fas fa-book',
      label: 'Total Courses',
      value: courses.length,
      color: '#10b981',
    },
    {
      icon: 'fas fa-star',
      label: 'Total Reviews',
      value: reviews.length,
      color: '#f0a500',
    },
    {
      icon: 'fas fa-video',
      label: 'Total Sessions',
      value: sessions.length,
      color: '#6366f1',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
      }}
    >

      {/* ═══════════════════════════════════════ */}
      {/* Sidebar */}
      {/* ═══════════════════════════════════════ */}

      <div
        style={{
          width: '250px',
          background: '#003366',
          color: 'white',
          padding: '30px 0',
          position: 'fixed',
          height: '100vh',
          zIndex: 100,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            padding: '0 25px 30px',
            borderBottom:
              '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h2
            style={{
              color: 'white',
              fontSize: '1.2rem',
            }}
          >
            <i
              className="fas fa-graduation-cap"
              style={{
                color: '#f0a500',
                marginRight: '8px',
              }}
            ></i>
            Zephyr Admin
          </h2>
        </div>

        {[
          {
            icon: 'fas fa-chart-pie',
            label: 'Overview',
            tab: 'overview',
          },
          {
            icon: 'fas fa-book',
            label: 'Courses',
            tab: 'courses',
          },
          {
            icon: 'fas fa-users',
            label: 'Users',
            tab: 'users',
          },
          {
            icon: 'fas fa-bell',
            label: 'Notifications',
            tab: 'notifications',
          },
          {
            icon: 'fas fa-user-circle',
            label: 'Profiles',
            tab: 'profiles',
          },
          {
            icon: 'fas fa-star',
            label: 'Reviews',
            tab: 'reviews',
          },
          {
            icon: 'fas fa-video',
            label: 'Sessions',
            tab: 'sessions',
          },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() =>
              setActiveTab(item.tab)
            }
            style={{
              padding: '15px 25px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background:
                activeTab === item.tab
                  ? 'rgba(240,165,0,0.2)'
                  : 'transparent',
              borderLeft:
                activeTab === item.tab
                  ? '3px solid #f0a500'
                  : '3px solid transparent',
              transition: 'all 0.3s',
            }}
          >
            <i
              className={item.icon}
              style={{
                color:
                  activeTab === item.tab
                    ? '#f0a500'
                    : '#a8c8f0',
              }}
            ></i>

            <span
              style={{
                color:
                  activeTab === item.tab
                    ? 'white'
                    : '#a8c8f0',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}

        <div
          onClick={() => navigate('/home')}
          style={{
            padding: '15px 25px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
          }}
        >
          <i
            className="fas fa-arrow-left"
            style={{
              color: '#a8c8f0',
            }}
          ></i>

          <span
            style={{
              color: '#a8c8f0',
            }}
          >
            Back to Site
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* Main Content */}
      {/* ═══════════════════════════════════════ */}

      <div
        style={{
          marginLeft: '250px',
          flex: 1,
          padding: '40px',
        }}
      >

        {/* Header */}
        <div
          style={{
            marginBottom: '30px',
          }}
        >
          <h1
            style={{
              color: '#003366',
            }}
          >
            {activeTab === 'overview' && (
              <>
                <i className="fas fa-chart-pie"></i>{' '}
                Overview
              </>
            )}

            {activeTab === 'courses' && (
              <>
                <i className="fas fa-book"></i>{' '}
                Courses Management
              </>
            )}

            {activeTab === 'users' && (
              <>
                <i className="fas fa-users"></i>{' '}
                Users Management
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <i className="fas fa-bell"></i>{' '}
                Notifications
              </>
            )}

            {activeTab === 'profiles' && (
              <>
                <i className="fas fa-user-circle"></i>{' '}
                Profiles Management
              </>
            )}

            {activeTab === 'reviews' && (
              <>
                <i className="fas fa-star"></i>{' '}
                Reviews Management
              </>
            )}

            {activeTab === 'sessions' && (
              <>
                <i className="fas fa-video"></i>{' '}
                Sessions Management
              </>
            )}
          </h1>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* Overview */}
        {/* ═══════════════════════════════════════ */}

        {activeTab === 'overview' && (
          <>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                marginBottom: '30px',
              }}
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  style={{
                    flex: '1',
                    minWidth: '200px',
                    background: 'white',
                    borderRadius: '12px',
                    padding: '25px',
                    textAlign: 'center',
                    boxShadow:
                      '0 4px 15px rgba(0,0,0,0.08)',
                    borderTop: `4px solid ${stat.color}`,
                  }}
                >
                  <i
                    className={stat.icon}
                    style={{
                      fontSize: '2rem',
                      color: stat.color,
                      marginBottom: '10px',
                      display: 'block',
                    }}
                  ></i>

                  <h2
                    style={{
                      color: stat.color,
                      fontSize: '2rem',
                      margin: '0',
                    }}
                  >
                    {stat.value}
                  </h2>

                  <p
                    style={{
                      color: '#888',
                      fontSize: '0.9rem',
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '30px',
                boxShadow:
                  '0 4px 15px rgba(0,0,0,0.08)',
              }}
            >
              <h2
                style={{
                  color: '#003366',
                }}
              >
                <i className="fas fa-cogs"></i>{' '}
                Admin Control Panel
              </h2>

              <p
                style={{
                  color: '#888',
                }}
              >
                Use the sidebar to manage profiles,
                reviews, sessions and send notifications
                to your users.
              </p>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* Courses */}
        {/* ═══════════════════════════════════════ */}

        {activeTab === 'courses' && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#003366',
                    color: 'white',
                  }}
                >
                  <th style={{ padding: '15px', textAlign: 'left' }}>
                    Course
                  </th>

                  <th style={{ padding: '15px', textAlign: 'left' }}>
                    Category
                  </th>

                  <th style={{ padding: '15px', textAlign: 'left' }}>
                    Students
                  </th>

                  <th style={{ padding: '15px', textAlign: 'left' }}>
                    Rating
                  </th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        '1px solid #f0f0f0',
                    }}
                  >
                    <td
                      style={{
                        padding: '15px',
                        fontWeight: '600',
                        color: '#003366',
                      }}
                    >
                      {course.title}
                    </td>

                    <td style={{ padding: '15px' }}>
                      <span
                        style={{
                          background: '#f0f0f0',
                          padding: '4px 12px',
                          borderRadius: '20px',
                        }}
                      >
                        {course.category}
                      </span>
                    </td>

                    <td style={{ padding: '15px' }}>
                      {course.students}
                    </td>

                    <td
                      style={{
                        padding: '15px',
                        color: '#f0a500',
                        fontWeight: '600',
                      }}
                    >
                      ⭐ {course.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* Users */}
        {/* ═══════════════════════════════════════ */}

        {activeTab === 'users' && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
            }}
          >
            <p
              style={{
                color: '#888',
                textAlign: 'center',
                padding: '40px',
              }}
            >
              <i
                className="fas fa-lock"
                style={{
                  fontSize: '3rem',
                  marginBottom: '15px',
                  display: 'block',
                  color: '#003366',
                }}
              ></i>

              User management requires Supabase
              admin access
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* Notifications */}
        {/* ═══════════════════════════════════════ */}

        {activeTab === 'notifications' && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '700px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
            }}
          >
            <h2
              style={{
                color: '#003366',
                marginBottom: '10px',
              }}
            >
              <i
                className="fas fa-bell"
                style={{
                  marginRight: '10px',
                }}
              ></i>

              Send Notification
            </h2>

            <p
              style={{
                color: '#888',
                marginBottom: '25px',
              }}
            >
              Send a notification to all users of
              your website.
            </p>

            <form onSubmit={sendNotification}>

              <div
                style={{
                  marginBottom: '20px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#003366',
                  }}
                >
                  Notification Title
                </label>

                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) =>
                    setNotificationTitle(
                      e.target.value
                    )
                  }
                  placeholder="Enter notification title"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: '20px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#003366',
                  }}
                >
                  Notification Message
                </label>

                <textarea
                  value={notificationMessage}
                  onChange={(e) =>
                    setNotificationMessage(
                      e.target.value
                    )
                  }
                  placeholder="Write your notification message..."
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {notificationStatus && (
                <div
                  style={{
                    padding: '12px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    background:
                      notificationStatus.includes(
                        'successfully'
                      )
                        ? '#ecfdf5'
                        : '#fef2f2',
                    color:
                      notificationStatus.includes(
                        'successfully'
                      )
                        ? '#10b981'
                        : '#ef4444',
                  }}
                >
                  <i
                    className={
                      notificationStatus.includes(
                        'successfully'
                      )
                        ? 'fas fa-check-circle'
                        : 'fas fa-exclamation-circle'
                    }
                    style={{
                      marginRight: '8px',
                    }}
                  ></i>

                  {notificationStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={sendingNotification}
                style={{
                  background:
                    sendingNotification
                      ? '#999'
                      : '#003366',
                  color: 'white',
                  border: 'none',
                  padding: '14px 25px',
                  borderRadius: '8px',
                  cursor:
                    sendingNotification
                      ? 'not-allowed'
                      : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                }}
              >
                <i
                  className={
                    sendingNotification
                      ? 'fas fa-spinner fa-spin'
                      : 'fas fa-paper-plane'
                  }
                  style={{
                    marginRight: '8px',
                  }}
                ></i>

                {sendingNotification
                  ? 'Sending...'
                  : 'Send Notification'}
              </button>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* Profiles */}
        {/* ═══════════════════════════════════════ */}

        {activeTab === 'profiles' && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  color: '#003366',
                  margin: 0,
                }}
              >
                <i className="fas fa-user-circle"></i>{' '}
                Profiles
              </h2>

              <button
                onClick={fetchProfiles}
                style={{
                  background: '#003366',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-sync"></i>{' '}
                Refresh
              </button>
            </div>

            {profilesLoading ? (
              <p style={{ textAlign: 'center', color: '#888' }}>
                <i className="fas fa-spinner fa-spin"></i>{' '}
                Loading profiles...
              </p>
            ) : profiles.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>
                No profiles found.
              </p>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#003366',
                      color: 'white',
                    }}
                  >
                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      ID
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Username
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Type
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Bio
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {profiles.map((profile) => (
                    <tr
                      key={profile.id}
                      style={{
                        borderBottom:
                          '1px solid #f0f0f0',
                      }}
                    >
                      <td
                        style={{
                          padding: '15px',
                          fontSize: '0.8rem',
                          color: '#777',
                        }}
                      >
                        {profile.id}
                      </td>

                      <td
                        style={{
                          padding: '15px',
                          fontWeight: '600',
                          color: '#003366',
                        }}
                      >
                        {profile.username || '-'}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {profile.type || '-'}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {profile.bio || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* Reviews */}
        {/* ═══════════════════════════════════════ */}

        {activeTab === 'reviews' && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  color: '#003366',
                  margin: 0,
                }}
              >
                <i className="fas fa-star"></i>{' '}
                Reviews
              </h2>

              <button
                onClick={fetchReviews}
                style={{
                  background: '#003366',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-sync"></i>{' '}
                Refresh
              </button>
            </div>

            {reviewsLoading ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                <i className="fas fa-spinner fa-spin"></i>{' '}
                Loading reviews...
              </p>
            ) : reviews.length === 0 ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                No reviews found.
              </p>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#003366',
                      color: 'white',
                    }}
                  >
                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      ID
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Course ID
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      User ID
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Rating
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Comment
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reviews.map((review) => (
                    <tr
                      key={review.id}
                      style={{
                        borderBottom:
                          '1px solid #f0f0f0',
                      }}
                    >
                      <td style={{ padding: '15px' }}>
                        {review.id}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {review.course_id}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {review.user_id}
                      </td>

                      <td
                        style={{
                          padding: '15px',
                          color: '#f0a500',
                          fontWeight: '600',
                        }}
                      >
                        ⭐ {review.rating}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {review.comment || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* Sessions */}
        {/* ═══════════════════════════════════════ */}

        {activeTab === 'sessions' && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
              overflowX: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  color: '#003366',
                  margin: 0,
                }}
              >
                <i className="fas fa-video"></i>{' '}
                Sessions
              </h2>

              <button
                onClick={fetchSessions}
                style={{
                  background: '#003366',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-sync"></i>{' '}
                Refresh
              </button>
            </div>

            {sessionsLoading ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                <i className="fas fa-spinner fa-spin"></i>{' '}
                Loading sessions...
              </p>
            ) : sessions.length === 0 ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                No sessions found.
              </p>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#003366',
                      color: 'white',
                    }}
                  >
                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      ID
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Title
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Course
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Date
                    </th>

                    <th style={{ padding: '15px', textAlign: 'left' }}>
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      style={{
                        borderBottom:
                          '1px solid #f0f0f0',
                      }}
                    >
                      <td style={{ padding: '15px' }}>
                        {session.id}
                      </td>

                      <td
                        style={{
                          padding: '15px',
                          fontWeight: '600',
                          color: '#003366',
                        }}
                      >
                        {session.title || '-'}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {session.course || '-'}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {session.data || '-'}
                      </td>

                      <td style={{ padding: '15px' }}>
                        {session.time || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
