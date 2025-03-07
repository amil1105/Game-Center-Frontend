// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Token'ın süresi dolmuş mu kontrol et (8 saat)
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Token geçerliyse kullanıcı bilgilerini set et
          setUser({ email: decoded.email });
        }
      } catch (error) {
        console.error('Token decoding error:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return null; // veya bir loading spinner
  }

  return (
    <UserContext.Provider value={{ user, login, logout, checkAuth }}>
      {children}
    </UserContext.Provider>
  );
};
