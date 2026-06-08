import React, { useState } from 'react';
import { useLang } from '../LanguageContext';
import '../App.css';

const Contact = () => {
  const { darkMode } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  // ── ألوان الـ dark / light mode ──────────────────────────────────
  const dm = {
    pageBg:      darkMode ? '#0f1117' : '#f5f5f5',
    card:        darkMode ? '#1e2130' : 'white',
    shadow:      darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.08)',
    heading:     darkMode ? '#a0b4ff' : '#003366',
    text:        darkMode ? '#c8d0e0' : '#555',
    subtext:     darkMode ? '#7a8499' : '#888',
    inputBg:     darkMode ? '#262a3e' : 'white',
    inputBorder: darkMode ? '#3a4060' : '#ddd',
    inputColor:  darkMode ? '#e0e6f0' : '#333',
    socialBg:    darkMode ? '#262a3e' : '#f5f5f5',
    label:       darkMode ? '#a0b4ff' : '#003366',
    btnBg:       darkMode ? '#2a3580' : '#003366',
  };

  const handleSubmit = () => {
    if (form.name && form.email && form.message) setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: dm.pageBg }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #003366, #005599)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <h1><i className="fas fa-headset"></i> Contact & Support</h1>
        <p style={{ color: '#a8c8f0', marginTop: '10px' }}>We're here to help you 24/7</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>

        {/* كروت التواصل */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px', justifyContent: 'center' }}>
          {[
            { icon: 'fas fa-envelope',     title: 'Email',    value: 'support@zephyracademy.com', color: '#003366' },
            { icon: 'fas fa-phone',         title: 'Phone',    value: '+962 7 9999 9999',          color: '#10b981' },
            { icon: 'fas fa-map-marker-alt',title: 'Location', value: 'Amman, Jordan',             color: '#f0a500' },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                flex: '1',
                minWidth: '200px',
                background: dm.card,
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: dm.shadow,
                borderTop: `4px solid ${item.color}`,
              }}
            >
              <i className={item.icon} style={{ fontSize: '2.5rem', color: item.color, marginBottom: '15px', display: 'block' }}></i>
              <h3 style={{ color: dm.heading, marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: dm.text }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* فورم التواصل */}
        <div style={{ background: dm.card, borderRadius: '12px', padding: '40px', boxShadow: dm.shadow, marginBottom: '40px' }}>
          <h2 style={{ color: dm.heading, marginBottom: '25px' }}>
            <i className="fas fa-paper-plane"></i> Send us a Message
          </h2>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#10b981', marginBottom: '20px', display: 'block' }}></i>
              <h3 style={{ color: dm.heading }}>Message Sent Successfully!</h3>
              <p style={{ color: dm.subtext }}>We'll get back to you soon.</p>
            </div>
          ) : (
            <>
              {[
                { label: 'Your Name',  key: 'name',  type: 'text',  icon: 'fas fa-user'    },
                { label: 'Your Email', key: 'email', type: 'email', icon: 'fas fa-envelope' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '20px' }}>
                  <label style={{ color: dm.label, fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    <i className={field.icon}></i> {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${dm.inputBorder}`,
                      fontSize: '1rem',
                      background: dm.inputBg,
                      color: dm.inputColor,
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: dm.label, fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  <i className="fas fa-comment"></i> Message
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${dm.inputBorder}`,
                    fontSize: '1rem',
                    resize: 'vertical',
                    background: dm.inputBg,
                    color: dm.inputColor,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: dm.btnBg,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </>
          )}
        </div>

        {/* وسائل التواصل الاجتماعي */}
        <div style={{ background: dm.card, borderRadius: '12px', padding: '40px', boxShadow: dm.shadow, textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: dm.heading, marginBottom: '25px' }}>
            <i className="fas fa-share-alt"></i> Follow Us
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { icon: 'fab fa-facebook',  color: '#1877F2', label: 'Facebook'  },
              { icon: 'fab fa-instagram', color: '#E1306C', label: 'Instagram' },
              { icon: 'fab fa-twitter',   color: '#1DA1F2', label: 'Twitter'   },
              { icon: 'fab fa-linkedin',  color: '#0077b5', label: 'LinkedIn'  },
              { icon: 'fab fa-youtube',   color: '#FF0000', label: 'YouTube'   },
              { icon: 'fab fa-whatsapp',  color: '#25D366', label: 'WhatsApp'  },
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  padding: '20px',
                  borderRadius: '12px',
                  background: dm.socialBg,
                  width: '100px',
                  transition: 'all 0.3s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = social.color;
                  e.currentTarget.querySelector('i').style.color = 'white';
                  e.currentTarget.querySelector('span').style.color = 'white';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = dm.socialBg;
                  e.currentTarget.querySelector('i').style.color = social.color;
                  e.currentTarget.querySelector('span').style.color = dm.heading;
                }}
              >
                <i className={social.icon} style={{ fontSize: '2rem', color: social.color }}></i>
                <span style={{ color: dm.heading, fontWeight: '600', fontSize: '0.85rem' }}>{social.label}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;