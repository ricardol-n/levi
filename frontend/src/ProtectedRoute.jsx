import { useContext } from 'react';
import { AuthContext } from './context/Authcontext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
