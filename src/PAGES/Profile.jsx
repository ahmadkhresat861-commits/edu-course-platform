import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import '../App.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ username: '', full_name: '', bio: '', phone: '', country: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({ 
      id: user.id,
      user_id: user.id,
      ...profile 
    });
    if (error) setMessage('Error: ' + error.message);
    else setMessage('Profile saved successfully! ✅');
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <i className="fas fa-user-circle" style={{ fontSize: '5rem', color: '#003366' }}></i>
          <h2 style={{ color: '#003366', marginTop: '10px' }}>My Profile</h2>
          <p style={{ color: '#888' }}>{user?.email}</p>
        </div>

        {message && <p style={{ color: message.includes('Error') ? 'red' : 'green', textAlign: 'center', marginBottom: '20px' }}>{message}</p>}

        {[
          { label: 'Username', key: 'username', icon: 'fas fa-user' },
          { label: 'Full Name', key: 'full_name', icon: 'fas fa-id-card' },
          { label: 'Bio', key: 'bio', icon: 'fas fa-pen' },
          { label: 'Phone', key: 'phone', icon: 'fas fa-phone' },
          { label: 'Country', key: 'country', icon: 'fas fa-globe' },
        ].map(field => (
          <div key={field.key} style={{ marginBottom: '20px' }}>
            <label style={{ color: '#003366', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              <i className={field.icon}></i> {field.label}
            </label>
            <input
              type="text"
              value={profile[field.key] || ''}
              onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>
        ))}

        <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '14px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginBottom: '10px' }}>
          <i className="fas fa-save"></i> {loading ? 'Saving...' : 'Save Profile'}
        </button>

        <button onClick={handleLogout} style={{ width: '100%', padding: '14px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;