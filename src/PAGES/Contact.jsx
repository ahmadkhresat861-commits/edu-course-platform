import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (form.name && form.email && form.message) {
      setSent(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #003366, #005599)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <h1><i className="fas fa-headset"></i> Contact & Support</h1>
        <p style={{ color: '#a8c8f0', marginTop: '10px' }}>We're here to help you 24/7</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>

        {/* Contact Cards */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px', justifyContent: 'center' }}>
          {[
            { icon: 'fas fa-envelope', title: 'Email', value: 'support@zephyracademy.com', color: '#003366' },
            { icon: 'fas fa-phone', title: 'Phone', value: '+962 7 9999 9999', color: '#10b981' },
            { icon: 'fas fa-map-marker-alt', title: 'Location', value: 'Amman, Jordan', color: '#f0a500' },
          ].map((item, i) => (
            <div key={i} style={{ flex: '1', minWidth: '200px', background: 'white', borderRadius: '12px', padding: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: `4px solid ${item.color}` }}>
              <i className={item.icon} style={{ fontSize: '2.5rem', color: item.color, marginBottom: '15px', display: 'block' }}></i>
              <h3 style={{ color: '#003366', marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: '#555' }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
          <h2 style={{ color: '#003366', marginBottom: '25px' }}><i className="fas fa-paper-plane"></i> Send us a Message</h2>
          
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#10b981', marginBottom: '20px', display: 'block' }}></i>
              <h3 style={{ color: '#003366' }}>Message Sent Successfully!</h3>
              <p style={{ color: '#888' }}>We'll get back to you soon.</p>
            </div>
          ) : (
            <>
              {[
                { label: 'Your Name', key: 'name', type: 'text', icon: 'fas fa-user' },
                { label: 'Your Email', key: 'email', type: 'email', icon: 'fas fa-envelope' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#003366', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    <i className={field.icon}></i> {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#003366', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  <i className="fas fa-comment"></i> Message
                </label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', resize: 'vertical' }}
                />
              </div>
              <button onClick={handleSubmit} style={{ width: '100%', padding: '14px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </>
          )}
        </div>

        {/* Social Media */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#003366', marginBottom: '25px' }}><i className="fas fa-share-alt"></i> Follow Us</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { icon: 'fab fa-facebook', color: '#1877F2', label: 'Facebook' },
              { icon: 'fab fa-instagram', color: '#E1306C', label: 'Instagram' },
              { icon: 'fab fa-twitter', color: '#1DA1F2', label: 'Twitter' },
              { icon: 'fab fa-linkedin', color: '#0077b5', label: 'LinkedIn' },
              { icon: 'fab fa-youtube', color: '#FF0000', label: 'YouTube' },
              { icon: 'fab fa-whatsapp', color: '#25D366', label: 'WhatsApp' },
            ].map((social, i) => (
              <a key={i} href="#" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '20px', borderRadius: '12px', background: '#f5f5f5', width: '100px', transition: 'all 0.3s' }}
                onMouseOver={e => e.currentTarget.style.background = social.color}
                onMouseOut={e => e.currentTarget.style.background = '#f5f5f5'}>
                <i className={social.icon} style={{ fontSize: '2rem', color: social.color }}></i>
                <span style={{ color: '#003366', fontWeight: '600', fontSize: '0.85rem' }}>{social.label}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;