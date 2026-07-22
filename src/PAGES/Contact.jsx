import React, { useState } from 'react';
import { useLang } from '../LanguageContext';
import '../App.css';

const Contact = () => {
  const { darkMode } = useLang();

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [sent, setSent] = useState(false);

  const dm = {
    pageBg: darkMode ? '#0f1117' : '#f5f7fa',
    card: darkMode ? '#1e2130' : '#ffffff',
    heading: darkMode ? '#a0b4ff' : '#003366',
    text: darkMode ? '#c8d0e0' : '#555',
    subtext: darkMode ? '#7a8499' : '#888',
    inputBg: darkMode ? '#262a3e' : '#ffffff',
    inputBorder: darkMode ? '#3a4060' : '#ddd',
    inputColor: darkMode ? '#e0e6f0' : '#333',
    btnBg: darkMode ? '#2a3580' : '#003366',
    socialBg: darkMode ? '#262a3e' : '#f5f7fa',
    shadow: darkMode
      ? '0 10px 35px rgba(0,0,0,0.35)'
      : '0 10px 30px rgba(0,0,0,0.08)',
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      return;
    }

    setSent(true);
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      message: '',
    });

    setSent(false);
  };

  const contactInfo = [
    {
      icon: 'fas fa-envelope',
      title: 'Email Us',
      value: 'support@zephyracademy.com',
      color: '#003366',
    },
    {
      icon: 'fas fa-phone',
      title: 'Call Us',
      value: '+962 7 9999 9999',
      color: '#10b981',
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Our Location',
      value: 'Amman, Jordan',
      color: '#f0a500',
    },
  ];

  const socialMedia = [
    {
      icon: 'fab fa-facebook-f',
      label: 'Facebook',
      color: '#1877F2',
    },
    {
      icon: 'fab fa-instagram',
      label: 'Instagram',
      color: '#E1306C',
    },
    {
      icon: 'fab fa-twitter',
      label: 'Twitter',
      color: '#1DA1F2',
    },
    {
      icon: 'fab fa-linkedin-in',
      label: 'LinkedIn',
      color: '#0077B5',
    },
    {
      icon: 'fab fa-youtube',
      label: 'YouTube',
      color: '#FF0000',
    },
    {
      icon: 'fab fa-whatsapp',
      label: 'WhatsApp',
      color: '#25D366',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: dm.pageBg,
        transition: 'background 0.3s ease',
      }}
    >

      {/* =========================
          Hero
      ========================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #003366, #005599)',
          padding: '80px 20px',
          textAlign: 'center',
          color: 'white',
          animation: 'contactHeroFade 0.8s ease both',
        }}
      >
        <div
          style={{
            width: '75px',
            height: '75px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'rgba(240,165,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'contactIconFloat 3s ease-in-out infinite',
          }}
        >
          <i
            className="fas fa-headset"
            style={{
              fontSize: '2.5rem',
              color: '#f0a500',
            }}
          ></i>
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '12px',
          }}
        >
          Contact & Support
        </h1>

        <p
          style={{
            color: '#a8c8f0',
            fontSize: '1.05rem',
          }}
        >
          We're here to help you whenever you need us
        </p>
      </div>

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '60px 20px',
        }}
      >

        {/* =========================
            Contact Info
        ========================= */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '50px',
          }}
        >
          {contactInfo.map((item, index) => (
            <div
              key={item.title}
              style={{
                flex: '1',
                minWidth: '220px',
                background: dm.card,
                borderRadius: '16px',
                padding: '30px 20px',
                textAlign: 'center',
                boxShadow: dm.shadow,
                borderTop: `4px solid ${item.color}`,
                animation: 'contactCardEnter 0.7s ease both',
                animationDelay: `${index * 0.15}s`,
                transition:
                  'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-8px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform =
                  'translateY(0)';
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 15px',
                  borderRadius: '50%',
                  background: `${item.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className={item.icon}
                  style={{
                    fontSize: '1.7rem',
                    color: item.color,
                  }}
                ></i>
              </div>

              <h3
                style={{
                  color: dm.heading,
                  marginBottom: '8px',
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: dm.text,
                  fontSize: '0.9rem',
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* =========================
            Contact Form
        ========================= */}
        <div
          style={{
            background: dm.card,
            borderRadius: '18px',
            padding: '40px',
            boxShadow: dm.shadow,
            marginBottom: '50px',
            animation: 'contactCardEnter 0.8s ease both',
          }}
        >

          {!sent ? (
            <>
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '35px',
                }}
              >
                <div
                  style={{
                    width: '65px',
                    height: '65px',
                    margin: '0 auto 15px',
                    borderRadius: '50%',
                    background: darkMode
                      ? '#2a3580'
                      : '#eef4ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i
                    className="fas fa-paper-plane"
                    style={{
                      fontSize: '1.7rem',
                      color: '#f0a500',
                    }}
                  ></i>
                </div>

                <h2
                  style={{
                    color: dm.heading,
                    marginBottom: '8px',
                  }}
                >
                  Send Us a Message
                </h2>

                <p
                  style={{
                    color: dm.subtext,
                    fontSize: '0.95rem',
                  }}
                >
                  Have a question? We'd love to hear from you.
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      color: dm.heading,
                      fontWeight: '600',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    <i className="fas fa-user"></i>{' '}
                    Your Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${dm.inputBorder}`,
                      fontSize: '1rem',
                      background: dm.inputBg,
                      color: dm.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition:
                        'border 0.3s ease, box-shadow 0.3s ease',
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      color: dm.heading,
                      fontWeight: '600',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    <i className="fas fa-envelope"></i>{' '}
                    Your Email
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${dm.inputBorder}`,
                      fontSize: '1rem',
                      background: dm.inputBg,
                      color: dm.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '25px' }}>
                  <label
                    style={{
                      color: dm.heading,
                      fontWeight: '600',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    <i className="fas fa-comment"></i>{' '}
                    Your Message
                  </label>

                  <textarea
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        message: e.target.value,
                      })
                    }
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${dm.inputBorder}`,
                      fontSize: '1rem',
                      resize: 'vertical',
                      background: dm.inputBg,
                      color: dm.inputColor,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '15px',
                    background:
                      'linear-gradient(135deg, #003366, #005599)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition:
                      'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform =
                      'translateY(-3px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 20px rgba(0,51,102,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform =
                      'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      'none';
                  }}
                >
                  <i className="fas fa-paper-plane"></i>{' '}
                  Send Message
                </button>

              </form>
            </>
          ) : (
            /* =========================
               Success Message
            ========================= */
            <div
              style={{
                textAlign: 'center',
                padding: '35px 20px',
                animation: 'successMessage 0.6s ease both',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  margin: '0 auto 25px',
                  borderRadius: '50%',
                  background: '#10b98120',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className="fas fa-check"
                  style={{
                    fontSize: '3rem',
                    color: '#10b981',
                  }}
                ></i>
              </div>

              <h2
                style={{
                  color: dm.heading,
                  marginBottom: '12px',
                }}
              >
                Message Sent Successfully!
              </h2>

              <p
                style={{
                  color: dm.text,
                  marginBottom: '25px',
                }}
              >
                Thank you for contacting us. Our support team
                will get back to you as soon as possible.
              </p>

              <button
                onClick={resetForm}
                style={{
                  padding: '12px 25px',
                  background: dm.btnBg,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(0)';
                }}
              >
                <i className="fas fa-plus"></i>{' '}
                Send Another Message
              </button>
            </div>
          )}
        </div>

        {/* =========================
            Follow Us
        ========================= */}
        <div
          style={{
            background: dm.card,
            borderRadius: '18px',
            padding: '40px 25px',
            boxShadow: dm.shadow,
            textAlign: 'center',
            animation: 'contactCardEnter 0.9s ease both',
          }}
        >
          <h2
            style={{
              color: dm.heading,
              marginBottom: '8px',
            }}
          >
            <i className="fas fa-share-alt"></i>{' '}
            Follow Us
          </h2>

          <p
            style={{
              color: dm.subtext,
              marginBottom: '30px',
            }}
          >
            Stay connected with Zephyr Academy
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              flexWrap: 'wrap',
            }}
          >
            {socialMedia.map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                style={{
                  width: '55px',
                  height: '55px',
                  borderRadius: '50%',
                  background: dm.socialBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  transition:
                    'transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background =
                    social.color;
                  e.currentTarget.style.transform =
                    'translateY(-6px) scale(1.08)';
                  e.currentTarget.style.boxShadow =
                    `0 8px 20px ${social.color}55`;

                  const icon =
                    e.currentTarget.querySelector('i');

                  if (icon) {
                    icon.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background =
                    dm.socialBg;
                  e.currentTarget.style.transform =
                    'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    'none';

                  const icon =
                    e.currentTarget.querySelector('i');

                  if (icon) {
                    icon.style.color = social.color;
                  }
                }}
              >
                <i
                  className={social.icon}
                  style={{
                    fontSize: '1.4rem',
                    color: social.color,
                    transition: 'color 0.3s ease',
                  }}
                ></i>
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* =========================
          Animation Styles
      ========================= */}
      <style>
        {`
          @keyframes contactHeroFade {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes contactIconFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes contactCardEnter {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes successMessage {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @media (max-width: 600px) {
            .contact-form {
              padding: 25px !important;
            }
          }
        `}
      </style>

    </div>
  );
};

export default Contact;
