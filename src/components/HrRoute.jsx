import React from 'react';
import { Navigate } from 'react-router-dom';

const HrRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/" replace />;
  if (role !== 'HR') return <Navigate to="/dashboard" replace />;

  return children;
};

export default HrRoute;
