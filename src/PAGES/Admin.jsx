import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../App.css';

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Notification states
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('');

  const stats = [
    { icon: 'fas fa-users', label: 'Total Users', value: '24', color: '#003366' },
    { icon: 'fas fa-book', label: 'Total Courses', value: '6', color: '#10b981' },
    { icon: 'fas fa-chart-line', label: 'Monthly Views', value: '1.2K', color: '#f0a500' },
    { icon: 'fas fa-star', label: 'Avg Rating', value: '4.8', color: '#6366f1' },
  ];

  const courses = [
    { title: 'React Development', students: 45, rating: 4.9, category: 'Frontend' },
    { title: 'JavaScript Advanced', students: 38, rating: 4.7, category: 'Frontend' },
    { title: 'HTML & CSS', students: 62, rating: 4.8, category: 'Frontend' },
    { title: 'Python Programming', students: 29, rating: 4.6, category: 'Backend' },
    { title: 'UI/UX Design', students: 21, rating: 4.9, category: 'Design' },
    { title: 'Database & SQL', students: 33, rating: 4.7, category: 'Backend' },
  ];

  // ── Check Admin ──────────────────────────────────────────────
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

  // ── Send Notification ───────────────────────────────────────
  const sendNotification = async (e) => {
    e.preventDefault();

    // Check empty fields
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

      // Success
      setNotificationStatus(
        'Notification sent successfully!'
      );

      // Clear inputs
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

  if (loading)
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          background: '#003366',
          color: 'white',
          padding: '30px 0',
          position: 'fixed',
          height: '100vh',
          zIndex: 100,
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
            style={{ color: '#a8c8f0' }}
          ></i>

          <span style={{ color: '#a8c8f0' }}>
            Back to Site
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: '250px',
          flex: 1,
          padding: '40px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#003366' }}>
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
          </h1>
        </div>

        {/* Overview Tab */}
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

            {/* Recent Activity */}
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
                  marginBottom: '20px',
                }}
              >
                <i className="fas fa-clock"></i>{' '}
                Recent Activity
              </h2>

              {[
                {
                  icon: 'fas fa-user-plus',
                  text: 'New user registered',
                  time: '2 min ago',
                  color: '#10b981',
                },
                {
                  icon: 'fas fa-book',
                  text: 'New course enrolled',
                  time: '15 min ago',
                  color: '#003366',
                },
                {
                  icon: 'fas fa-star',
                  text: 'New course rating',
                  time: '1 hour ago',
                  color: '#f0a500',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '15px 0',
                    borderBottom:
                      '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `${item.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i
                      className={item.icon}
                      style={{
                        color: item.color,
                      }}
                    ></i>
                  </div>

                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontWeight: '600',
                        color: '#003366',
                        margin: 0,
                      }}
                    >
                      {item.text}
                    </p>
                  </div>

                  <span
                    style={{
                      color: '#888',
                      fontSize: '0.85rem',
                    }}
                  >
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              boxShadow:
                '0 4px 15px rgba(0,0,0,0.08)',
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
                  <th
                    style={{
                      padding: '15px',
                      textAlign: 'left',
                      borderRadius:
                        '8px 0 0 8px',
                    }}
                  >
                    Course
                  </th>

                  <th
                    style={{
                      padding: '15px',
                      textAlign: 'left',
                    }}
                  >
                    Category
                  </th>

                  <th
                    style={{
                      padding: '15px',
                      textAlign: 'left',
                    }}
                  >
                    Students
                  </th>

                  <th
                    style={{
                      padding: '15px',
                      textAlign: 'left',
                      borderRadius:
                        '0 8px 8px 0',
                    }}
                  >
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
                          fontSize: '0.85rem',
                        }}
                      >
                        {course.category}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '15px',
                        color: '#555',
                      }}
                    >
                      <i
                        className="fas fa-users"
                        style={{
                          marginRight: '5px',
                          color: '#003366',
                        }}
                      ></i>
                      {course.students}
                    </td>

                    <td
                      style={{
                        padding: '15px',
                        color: '#f0a500',
                        fontWeight: '600',
                      }}
                    >
                      <i
                        className="fas fa-star"
                        style={{
                          marginRight: '5px',
                        }}
                      ></i>
                      {course.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
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

        {/* Notifications Tab */}
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
                style={{ marginRight: '10px' }}
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
              {/* Notification Title */}
              <div style={{ marginBottom: '20px' }}>
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

              {/* Notification Message */}
              <div style={{ marginBottom: '20px' }}>
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

              {/* Status Message */}
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

              {/* Send Button */}
              <button
                type="submit"
                disabled={sendingNotification}
                style={{
                  background: sendingNotification
                    ? '#999'
                    : '#003366',
                  color: 'white',
                  border: 'none',
                  padding: '14px 25px',
                  borderRadius: '8px',
                  cursor: sendingNotification
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
      </div>
    </div>
  );
};

export default Admin;
