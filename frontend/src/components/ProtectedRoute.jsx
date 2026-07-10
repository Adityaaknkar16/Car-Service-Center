import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps routes that require authentication.
 * Optionally restrict to a specific role (e.g. "admin").
 */
const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
