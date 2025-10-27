import { Navigate } from 'react-router';
import { ReactNode } from 'react';
import { useAuth } from '../contexts/useAuth';

/**
 * Private route component props
 */
interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * Private route component
 * Redirects to login if user is not authenticated
 */
export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};