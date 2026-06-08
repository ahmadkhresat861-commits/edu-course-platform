import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useLang } from '../LanguageContext';
import '../App.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const { darkMode } = useLang();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      setUser(user);
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) setProfile(data);
    };
    getUser();
  }, []);

  const bg = darkMode ? '#0f0f0f' : '#f5f5f5';
  const card = darkMode ? '#1a1a2e' : 'white';
  const text = darkMode ? 'white' : '#003366';
  const text2 = darkMode ? '#a8c8f0' : '#888';
  const progressBg = darkMode ? '#2e2e4e' : '#f0f0f0';

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '40px 20px', transition: 'all 0.3s' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Welcome */}
        <div style={{ background: 'linear-gradient(135deg, #003366, #005599)', borderRadius: '12px', padding: '40px', color: 'white', marginBottom: '30px' }}>
          <h1><i className="fas fa-graduation-cap"></i> Welcome back, {profile?.username || user?.email}!</h1>
          <p style={{ color: '#a8c8f0', marginTop: '10px' }}>Continue your learning journey at Zephyr Academy</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {[
            { icon: 'fas fa-book-open', label: 'Enrolled Courses', value: '3', color: '#003366' },
            { icon: 'fas fa-check-circle', label: 'Completed', value: '1', color: '#10b981' },
            { icon: 'fas fa-clock', label: 'Hours Learned', value: '12', color: '#f0a500' },
            { icon: 'fas fa-certificate', label: 'Certificates', value: '1', color: '#6366f1' },
          ].map((stat, i) => (
            <div key={i} style={{ flex: '1', minWidth: '200px', background: card, borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: `4px solid ${stat.color}`, textAlign: 'center', transition: 'all 0.3s' }}>
              <i className={stat.icon} style={{ fontSize: '2rem', color: stat.color, marginBottom: '10px', display: 'block' }}></i>
              <h2 style={{ color: stat.color, fontSize: '2rem', margin: '0' }}>{stat.value}</h2>
              <p style={{ color: text2, fontSize: '0.9rem' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <div style={{ background: card, borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '30px', transition: 'all 0.3s' }}>
          <h2 style={{ color: text, marginBottom: '20px' }}><i className="fas fa-book"></i> My Courses</h2>
          {[
            { title: 'React Development', progress: 75, icon: 'fab fa-react', color: '#61dafb' },
            { title: 'JavaScript Advanced', progress: 40, icon: 'fab fa-js', color: '#f7df1e' },
            { title: 'HTML & CSS', progress: 100, icon: 'fab fa-html5', color: '#e34f26' },
          ].map((course, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: text }}>
                  <i className={course.icon} style={{ color: course.color, marginRight: '8px' }}></i>
                  {course.title}
                </span>
                <span style={{ color: text2 }}>{course.progress}%</span>
              </div>
              <div style={{ background: progressBg, borderRadius: '10px', height: '10px' }}>
                <div style={{ background: course.progress === 100 ? '#10b981' : '#003366', width: `${course.progress}%`, height: '10px', borderRadius: '10px', transition: 'width 1s' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/courses')} style={{ flex: '1', padding: '20px', background: '#003366', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
            <i className="fas fa-plus"></i> Browse Courses
          </button>
          <button onClick={() => navigate('/profile')} style={{ flex: '1', padding: '20px', background: '#f0a500', color: '#003366', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
            <i className="fas fa-user"></i> Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;