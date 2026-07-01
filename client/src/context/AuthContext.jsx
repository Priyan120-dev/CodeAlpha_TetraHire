import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll notifications every 30s
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadNotificationsCount(0);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        const fullProfile = res.data.data;
        const mergedUser = {
          ...fullProfile.user,
          ...fullProfile.profile,
          user: fullProfile.user,
          profile: fullProfile.profile
        };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadNotificationsCount(res.data.data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const res = await api.put(`/notifications/${notificationId}/read`);
      if (res.data.success) {
        fetchNotifications();
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
    return { success: false };
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.data.success) {
        fetchNotifications();
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
    return { success: false };
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: loggedUser, accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      await fetchUserProfile();
      return { success: true };
    }
    return { success: false, message: res.data.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { user: registeredUser, accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      await fetchUserProfile();
      return { success: true };
    }
    return { success: false, message: res.data.message || 'Registration failed' };
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      await fetchUserProfile();
      return { success: true, message: 'Profile updated successfully' };
    }
    return { success: false, message: res.data.message || 'Failed to update profile' };
  };

  const changePassword = async (passwords) => {
    const res = await api.put('/auth/change-password', passwords);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      fetchUserProfile,
      notifications,
      unreadNotificationsCount,
      fetchNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
