import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check session on initial load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/auth/check-session', {
        headers: {
          'X-Session-ID': sessionId
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('userId', response.data.user.id);
      } else {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userId');
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userId');
      setUser(null);
      setError('Session expired or invalid');
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setUser(userData);
    setError(null);
  };

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        await axios.post('http://localhost:5000/auth/logout', {}, {
          headers: {
            'X-Session-ID': sessionId
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userId');
      setUser(null);
      setError(null);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      checkSession,
      setError 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 