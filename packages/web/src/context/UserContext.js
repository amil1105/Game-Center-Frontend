// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getUserProfile, BACKEND_URL } from '../api/auth';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        
        // Token'ın süresi dolmuş mu kontrol et (8 saat)
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Token geçerliyse API'den kullanıcı bilgilerini al
          try {
            console.log('Fetching user profile with token');
            const userData = await getUserProfile(token);
            console.log('User data received:', userData);
            
            // Profil resminin önbelleğe alınmamasını sağlamak için timestamp ekle
            // Ve backend URL'sini ekle
            if (userData && userData.profileImage) {
              const timestamp = new Date().getTime();
              // Eğer tam URL yoksa, backend URL'sini ekle
              if (!userData.profileImage.includes('http')) {
                userData.profileImage = `${BACKEND_URL}${userData.profileImage}?t=${timestamp}`;
              } else {
                userData.profileImage = `${userData.profileImage}?t=${timestamp}`;
              }
              console.log('Updated profile image with timestamp:', userData.profileImage);
            }
            
            setUser(userData);
            
            // Daha sonra erişim için userData'yı localStorage'a kaydet
            localStorage.setItem('userData', JSON.stringify(userData));
          } catch (error) {
            console.error('User data fetch error:', error);
            // API'den alınamazsa decoded'dan basic bilgileri al
            setUser({ 
              userId: decoded.userId,
              email: decoded.email || 'unknown@email.com'
            });
          }
        }
      } catch (error) {
        console.error('Token decoding error:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      console.log('No token found');
    }
    setLoading(false);
  };

  const login = (userData) => {
    // Profil resminin önbelleğe alınmamasını sağlamak için timestamp ekle
    if (userData && userData.profileImage) {
      const timestamp = new Date().getTime();
      // Eğer tam URL yoksa, backend URL'sini ekle
      if (!userData.profileImage.includes('http')) {
        userData.profileImage = `${BACKEND_URL}${userData.profileImage}?t=${timestamp}`;
      } else {
        userData.profileImage = `${userData.profileImage}?t=${timestamp}`;
      }
    }
    
    setUser(userData);
    // Kullanıcı bilgilerini localStorage'a da kaydet
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  const updateUserData = (newData) => {
    // Profil resminin önbelleğe alınmamasını sağlamak için timestamp ekle
    if (newData && newData.profileImage) {
      const timestamp = new Date().getTime();
      // Eğer tam URL yoksa ve HTTP içermiyorsa, backend URL'sini ekle
      if (!newData.profileImage.includes('http')) {
        newData.profileImage = `${BACKEND_URL}${newData.profileImage}?t=${timestamp}`;
      } else {
        // Zaten tam URL varsa, sadece timestamp ekle
        newData.profileImage = `${newData.profileImage.split('?')[0]}?t=${timestamp}`;
      }
    }
    
    setUser(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('userData', JSON.stringify(updated));
      return updated;
    });
  };

  if (loading) {
    return null; // veya bir loading spinner
  }

  return (
    <UserContext.Provider value={{ user, login, logout, checkAuth, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};
