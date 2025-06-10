import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('smartStudyLogin');
      const userId = localStorage.getItem('smartStudyUserId');
      if (token && userId) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            // Set user with string ID from decoded token
            setUser({ id: decoded.userId, username: decoded.username });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Fetch user data to ensure consistency
            await getUser(userId);
          } else {
            localStorage.removeItem('smartStudyLogin');
            localStorage.removeItem('smartStudyUserId');
            setUser(null);
          }
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('smartStudyLogin');
          localStorage.removeItem('smartStudyUserId');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/login`, {
        email,
        password,
      });
      localStorage.setItem('smartStudyLogin', response.data.token);
      localStorage.setItem('smartStudyUserId', response.data.user.id);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      const decoded = jwtDecode(response.data.token);
      setUser({
        id: decoded.userId, // String ID
        username: decoded.username,
        bonusPoints: response.data.user.bonusPoints,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/register`, {
        username,
        email,
        password,
      });
      localStorage.setItem('smartStudyLogin', response.data.token);
      localStorage.setItem('smartStudyUserId', response.data.user.id);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      const decoded = jwtDecode(response.data.token);
      setUser({
        id: decoded.userId, // String ID
        username: decoded.username,
        bonusPoints: response.data.user.bonusPoints,
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('smartStudyLogin');
    localStorage.removeItem('smartStudyUserId');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const getUser = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/user/${userId}`);
      if (response.data.success) {
        setUser((prev) => ({
          ...prev,
          id: response.data.user.id || response.data.user._id, // Ensure string ID
          username: response.data.user.username,
          bonusPoints: response.data.user.bonusPoints,
          email: response.data.user.email,
        }));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;