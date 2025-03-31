import React from 'react';
import { Navigate } from 'react-router-dom';

// This component checks if the user is authenticated
// If authenticated, it renders the children components
// If not authenticated, it redirects to the login page
const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('authToken');
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute; 