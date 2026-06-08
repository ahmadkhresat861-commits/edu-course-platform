import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase';

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); setLoading(false); return; }
      
      const { data } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single();
      
      setIsAdmin(!!data);
      setLoading(false);
    };
    checkAdmin();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#003366' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#f0a500' }}></i>
    </div>
  );

  return isAdmin ? children : <Navigate to="/home" />;
};

export default AdminRoute;