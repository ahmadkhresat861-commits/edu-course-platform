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
    pageBg: darkMode ? '#0f1117' : '#f5f5f5',
    card: darkMode ? '#1e2130' : 'white',
    shadow: darkMode
      ? '0 10px 35px rgba(0,0,0,0.4)'
      : '0 10px 30px rgba(0,0,0,0.08)',
    heading: darkMode ? '#a0b4ff' : '#003366',
    text: darkMode ? '#c8d0e0' : '#555',
    subtext: darkMode ? '#7a8499' : '#888',
    inputBg: darkMode ? '#262a3e' : 'white',
    inputBorder: darkMode ? '#3a4060' : '#ddd',
    inputColor: darkMode ? '#e0e6f0' : '#333',
    socialBg: darkMode ? '#262a3e' : '#f5f5f5',
    label: darkMode ? '#a0b4ff' : '#003366',
    btnBg: darkMode ? '#2a3580' : '#003366',
  };

  const handleSubmit = () => {
    if (form.name && form.email && form.message) {
      setSent(true);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: dm.pageBg,
        overflow: 'hidden',
      }}
    >

      {/* =========================
          Hero
      ========================= */}
      <div
        className="contact-hero"
        style={{
          background: 'linear-gradient(135deg, #003366, #005599)',
          padding: '80px 20px',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >

        <div className="contact-hero-glow"></div>

        <div className="contact-hero-content">
          <div className="contact-hero-icon">
            <i className="fas fa-headset"></i>
          </div>

          <h1>Contact & Support</h1>

          <p>
            We're here to help you 24/7
          </p>
        </div>
      </div>


      <div
        style={{
          maxWidth: '1000px',
          margin: '50px auto',
          padding: '0 20px',
        }}
      >

        {/* =========================
            Contact Cards
        ========================= */}
        <div
          className="contact-info-grid"
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '50px',
            justifyContent: 'center',
          }}
        >

          {[
            {
              icon: 'fas fa-envelope',
              title: 'Email',
              value: 'support@zephyracademy.com',
              color: '#003366',
            },
            {
              icon: 'fas fa-phone',
              title: 'Phone',
              value: '+962 7 9999 9999',
              color: '#10b981',
            },
            {
              icon: 'fas fa-map-marker-alt',
              title: 'Location',
              value: 'Amman, Jordan',
              color: '#f0a500',
            },
          ].map((item, index) => (

            <div
              key={item.title}
              className="contact-info-card"
              style={{
                flex: '1',
                minWidth: '200px',
                background: dm.card,
                borderRadius: '16px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: dm.shadow,
                borderTop: `4px solid ${item.color}`,
                animationDelay: `${index * 0.15}s`,
              }}
            >

              <div
                className="contact-card-icon"
                style={{
                  background: `${item.color}15`,
                  color: item.color,
                }}
              >
                <i className={item.icon}></i>
              </div>

              <h3 style={{ color: dm.heading }}>
                {item.title}
              </h3>

              <p style={{ color: dm.text }}>
                {item.value}
              </p>

            </div>

          ))}

        </div>


        {/* =========================
            Contact Form
        ========================= */}
        <div
          className="contact-form-card"
          style={{
            background: dm.card,
            borderRadius: '16px',
            padding: '40px',
            boxShadow: dm.shadow,
            marginBottom: '50px',
          }}
        >

          <h2
            className="contact-section-title"
            style={{
              color: dm.heading,
              marginBottom: '30px',
            }}
          >
            <i className="fas fa-paper-plane"></i>
            {' '}Send us a Message
          </h2>


          {sent ? (

            <div className="contact-success">

              <div className="success-icon">
                <i className="fas fa-check"></i>
              </div>

              <h3 style={{ color: dm.heading }}>
                Message Sent Successfully!
              </h3>

              <p style={{ color: dm.subtext }}>
                We'll get back to you soon.
              </p>

              <button
                onClick={() => {
                  setSent(false);
                  setForm({
                    name: '',
                    email: '',
                    message: '',
                  });
                }}
                className="contact-reset-button"
              >
                <i className="fas fa-plus"></i>
                {' '}Send Another Message
              </button>

            </div>

          ) : (

            <>

              {/* Name */}
              <div className="contact-field">

                <label style={{ color: dm.label }}>
                  <i className="fas fa-user"></i>
                  {' '}Your Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={e =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  style={{
                    background: dm.inputBg,
                    color: dm.inputColor,
                    border: `1px solid ${dm.inputBorder}`,
                  }}
                />

              </div>


              {/* Email */}
              <div className="contact-field">

                <label style={{ color: dm.label }}>
                  <i className="fas fa-envelope"></i>
                  {' '}Your Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={e =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  style={{
                    background: dm.inputBg,
                    color: dm.inputColor,
                    border: `1px solid ${dm.inputBorder}`,
                  }}
                />

              </div>


              {/* Message */}
              <div className="contact-field">

                <label style={{ color: dm.label }}>
                  <i className="fas fa-comment"></i>
                  {' '}Message
                </label>

                <textarea
                  placeholder="Write your message..."
                  rows={5}
                  value={form.message}
                  onChange={e =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                  style={{
                    background: dm.inputBg,
                    color: dm.inputColor,
                    border: `1px solid ${dm.inputBorder}`,
                  }}
                />

              </div>


              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="contact-submit-button"
                style={{
                  background: dm.btnBg,
                }}
              >
                <i className="fas fa-paper-plane"></i>
                {' '}Send Message
              </button>

            </>

          )}

        </div>


        {/* =========================
            Social Media
        ========================= */}
        <div
          className="contact-social-card"
          style={{
            background: dm.card,
            borderRadius: '16px',
            padding: '40px',
            boxShadow: dm.shadow,
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >

          <h2
            style={{
              color: dm.heading,
              marginBottom: '30px',
            }}
          >
            <i className="fas fa-share-alt"></i>
            {' '}Follow Us
          </h2>


          <div
            className="contact-social-grid"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >

            {[
              {
                icon: 'fab fa-facebook',
                color: '#1877F2',
                label: 'Facebook',
              },
              {
                icon: 'fab fa-instagram',
                color: '#E1306C',
                label: 'Instagram',
              },
              {
                icon: 'fab fa-twitter',
                color: '#1DA1F2',
                label: 'Twitter',
              },
              {
                icon: 'fab fa-linkedin',
                color: '#0077b5',
                label: 'LinkedIn',
              },
              {
                icon: 'fab fa-youtube',
                color: '#FF0000',
                label: 'YouTube',
              },
              {
                icon: 'fab fa-whatsapp',
                color: '#25D366',
                label: 'WhatsApp',
              },
            ].map(social => (

              <a
                key={social.label}
                href="#"
                className="contact-social-item"
                style={{
                  '--social-color': social.color,
                  background: dm.socialBg,
                }}
                onClick={e => e.preventDefault()}
              >

                <i
                  className={social.icon}
                  style={{
                    color: social.color,
                  }}
                ></i>

                <span style={{ color: dm.heading }}>
                  {social.label}
                </span>

              </a>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Contact;
