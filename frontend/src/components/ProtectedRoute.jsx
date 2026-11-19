import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LimitProvider } from '../context/LimitContext';

const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <LimitProvider key={user.id}><Outlet /></LimitProvider> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
