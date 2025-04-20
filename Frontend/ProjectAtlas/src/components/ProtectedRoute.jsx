import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has required roles (if any are specified)
  if (requiredRoles.length > 0 && !requiredRoles.some(role => user.roles.includes(role))) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute; 