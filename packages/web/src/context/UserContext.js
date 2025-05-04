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

  // URL'leri birleştirmek için yardımcı fonksiyon
  const combineUrls = (baseUrl, relativePath) => {
    if (!relativePath) return baseUrl;
    
    if (relativePath.startsWith('/')) {
      return baseUrl.endsWith('/') 
        ? `${baseUrl.slice(0, -1)}${relativePath}`
        : `${baseUrl}${relativePath}`;
    } else {
      return baseUrl.endsWith('/')
        ? `${baseUrl}${relativePath}`
        : `${baseUrl}/${relativePath}`;
    }
  };

  // Profil resmini işlemek için yardımcı fonksiyon
  const processProfileImage = (imageUrl) => {
    if (!imageUrl) return null;
    
    const timestamp = new Date().getTime();
    let fullImageUrl;
    
    if (!imageUrl.includes('http')) {
      fullImageUrl = combineUrls(BACKEND_URL, imageUrl);
    } else {
      fullImageUrl = imageUrl.split('?')[0];
    }
    
    return `${fullImageUrl}?t=${timestamp}`;
  };

  const checkAuth = async () => {
    console.log("UserContext: checkAuth çalıştırılıyor...");
    
    try {
      const token = localStorage.getItem('token');
      console.log("UserContext: Token durumu:", token ? "Token var" : "Token yok");
      
      if (!token) {
        console.log("UserContext: Token bulunamadı, oturum açılmamış");
        setUser(null);
        setLoading(false);
        return false;
      }
      
      try {
        const decoded = jwtDecode(token);
        console.log("UserContext: Token decode edildi:", decoded);
        
        // Token'ın süresi dolmuş mu kontrol et (8 saat)
        if (decoded.exp * 1000 < Date.now()) {
          console.warn("UserContext: Token süresi dolmuş");
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return false;
        }
        
        // Token geçerliyse API'den kullanıcı bilgilerini al
        try {
          console.log("UserContext: Kullanıcı profili alınıyor...");
          const userData = await getUserProfile(token);
          console.log("UserContext: Kullanıcı profili alındı:", userData);
          
          // Profil resmini işle
          if (userData && userData.profileImage) {
            userData.profileImage = processProfileImage(userData.profileImage);
            console.log("UserContext: Güncellenmiş profil resmi URL'si:", userData.profileImage);
          }
          
          // _id'yi id olarak da ekle
          const userWithId = {
            ...userData,
            id: userData._id || userData.id // id yoksa _id kullan, o da yoksa null olacak
          };
          
          setUser(userWithId);
          
          // Daha sonra erişim için userData'yı localStorage'a kaydet
          localStorage.setItem('userData', JSON.stringify(userWithId));
          setLoading(false);
          return true;
        } catch (error) {
          console.error('UserContext: Kullanıcı verisi çekme hatası:', error);
          
          // API'den alınamazsa decoded'dan basic bilgileri al
          const basicUserData = { 
            userId: decoded.userId,
            email: decoded.email || 'unknown@email.com',
            id: decoded.userId
          };
          
          setUser(basicUserData);
          localStorage.setItem('userData', JSON.stringify(basicUserData));
          setLoading(false);
          return true;
        }
      } catch (error) {
        console.error('UserContext: Token decode hatası:', error);
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("UserContext: checkAuth ana hatası:", error);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const login = (userData) => {
    console.log("UserContext: Kullanıcı giriş yapıyor:", userData);
    
    // Profil resmini işle
    if (userData && userData.profileImage) {
      userData.profileImage = processProfileImage(userData.profileImage);
      console.log("UserContext: Güncellenmiş profil resmi URL'si:", userData.profileImage);
    }
    
    // _id'yi id olarak da ekle
    const userWithId = {
      ...userData,
      id: userData._id || userData.id // id yoksa _id kullan, o da yoksa null olacak
    };
    
    setUser(userWithId);
    // Kullanıcı bilgilerini localStorage'a da kaydet
    localStorage.setItem('userData', JSON.stringify(userWithId));
    console.log("UserContext: Kullanıcı giriş yaptı, localStorage güncellendi");
  };

  const logout = () => {
    console.log("UserContext: Kullanıcı çıkış yapıyor");
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  const updateUserData = (newData) => {
    console.log("UserContext: Kullanıcı bilgileri güncelleniyor:", newData);
    
    // Profil resmini işle
    if (newData && newData.profileImage) {
      newData.profileImage = processProfileImage(newData.profileImage);
      console.log("UserContext: Güncellenmiş profil resmi URL'si:", newData.profileImage);
    }
    
    // _id'yi id olarak da ekle
    const newDataWithId = {
      ...newData,
      id: newData._id || newData.id // id yoksa _id kullan, o da yoksa null olacak
    };
    
    setUser(prev => {
      const updated = { ...prev, ...newDataWithId };
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
