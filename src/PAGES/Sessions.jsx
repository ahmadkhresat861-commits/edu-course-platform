import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const Sessions = () => {
  const { darkMode } = useLang();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── ألوان الـ dark / light mode ──────────────────────────────────
  const dm = {
    pageBg:  darkMode ? '#0f1117' : '#f5f5f5',
    card:    darkMode ? '#1e2130' : 'white',
    shadow:  darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.08)',
    border:  darkMode ? '#a0b4ff' : '#003366',
    heading: darkMode ? '#a0b4ff' : '#003366',
    text:    darkMode ? '#c8d0e0' : '#555',
    subtext: darkMode ? '#7a8499' : '#888',
  };

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase.from('sessions').select('*');
      if (data) setSessions(data);
      setLoading(false);
    };
    fetchSessions();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: dm.pageBg }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#003366' }}></i>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: dm.pageBg }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #003366, #005599)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <h1><i className="fas fa-video"></i> Live Sessions</h1>
        <p style={{ color: '#a8c8f0', marginTop: '10px' }}>Join our live Zoom sessions with expert instructors</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>

        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: dm.card, borderRadius: '12px', boxShadow: dm.shadow }}>
            <i className="fas fa-calendar-times" style={{ fontSize: '4rem', color: dm.heading, marginBottom: '20px', display: 'block' }}></i>
            <h2 style={{ color: dm.heading }}>No Sessions Yet</h2>
            <p style={{ color: dm.subtext }}>Check back soon for upcoming live sessions!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                style={{
                  background: dm.card,
                  borderRadius: '12px',
                  padding: '25px',
                  boxShadow: dm.shadow,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px',
                  borderLeft: `4px solid ${dm.border}`,
                }}
              >
                <div>
                  <h3 style={{ color: dm.heading, marginBottom: '8px' }}>
                    <i className="fas fa-video" style={{ color: '#f0a500', marginRight: '8px' }}></i>
                    {session.title}
                  </h3>
                  <p style={{ color: dm.text, marginBottom: '5px' }}>
                    <i className="fas fa-book" style={{ marginRight: '8px', color: dm.heading }}></i>
                    {session.course}
                  </p>
                  <p style={{ color: dm.text, marginBottom: '5px' }}>
                    <i className="fas fa-chalkboard-teacher" style={{ marginRight: '8px', color: dm.heading }}></i>
                    {session.instructor}
                  </p>
                  <p style={{ color: dm.text }}>
                    <i className="fas fa-calendar" style={{ marginRight: '8px', color: '#f0a500' }}></i>
                    {session.date} — {session.time}
                  </p>
                </div>
                <a
                  href={session.zoom_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '12px 25px',
                    background: '#2D8CFF',
                    color: 'white',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  <i className="fas fa-video"></i> Join Zoom
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;