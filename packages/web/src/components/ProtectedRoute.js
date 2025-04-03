// src/components/ProtectedRoute.js
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { user, checkAuth } = useContext(UserContext);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  // Kullanıcının tombala oyununa erişip erişemeyeceğini kontrol et
  const isTombalaRoute = location.pathname.includes('/game/tombala/') || 
                          location.pathname.includes('/game/bingo/');
  
  // URL'den lobi kodunu çıkartalım (tombala için)
  const getLobbyCodeFromPath = () => {
    try {
      if (isTombalaRoute) {
        // /game/tombala/XYZ123 -> XYZ123
        const pathParts = location.pathname.split('/');
        return pathParts[pathParts.length - 1];
      }
    } catch (e) {
      console.error('Lobi kodu çıkarılırken hata:', e);
    }
    return null;
  };
  
  const lobbyCode = getLobbyCodeFromPath();
  console.log("ProtectedRoute: Yönlendirilen sayfa için lobi kodu:", lobbyCode);
    
  // Yükleme efekti için
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log("ProtectedRoute: Kimlik doğrulama kontrolü başlıyor...");
        console.log("ProtectedRoute: Mevcut kullanıcı durumu:", user ? "Var" : "Yok");
        console.log("ProtectedRoute: İstenen sayfa:", location.pathname);
        
        // Localstorage'den token kontrolü
        const token = localStorage.getItem('token');
        console.log("ProtectedRoute: Token durumu:", token ? "Var" : "Yok");
        
        if (!user) {
          const result = await checkAuth();
          setCheckResult(result);
          console.log("ProtectedRoute: checkAuth sonucu:", result ? "Başarılı" : "Başarısız");
        }
      } catch (error) {
        console.error("ProtectedRoute: Kimlik doğrulama hatası:", error);
        setCheckResult(false);
      } finally {
        setIsLoading(false);
        setIsChecked(true);
      }
    };
    
    checkAuthentication();
  }, [user, checkAuth, location.pathname]);
  
  // Yükleniyor göster
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          bgcolor: '#0B0E17'
        }}
      >
        <CircularProgress color="primary" size={60} thickness={4} />
        <Typography variant="h6" color="primary.light" sx={{ mt: 2 }}>
          Kimlik doğrulanıyor...
        </Typography>
      </Box>
    );
  }

  // Kullanıcı oturum açmamışsa
  if (!user && isChecked) {
    console.log("ProtectedRoute: Kullanıcı oturum açmamış, yönlendiriliyor...");
    console.log("ProtectedRoute: İstenilen sayfa:", location.pathname);
    
    // Eğer tombala sayfasına erişmeye çalışıyorsa, önce login sayfasına yönlendir
    // ve sonra geri dönmek istediği sayfayı state olarak sakla
    if (isTombalaRoute && lobbyCode) {
      console.log("ProtectedRoute: Tombala sayfasına yönlendirme state ile yapılıyor, lobi kodu:", lobbyCode);
      
      // Lobi kodunu da state olarak geçir, böylece giriş sonrası doğru lobiye yönlendirilebilir
      return <Navigate to="/login" state={{ 
        from: location.pathname,
        lobbyCode: lobbyCode 
      }} replace />;
    }
    
    // Diğer korumalı sayfalar için normal yönlendirme
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: Kullanıcı oturum açmış, erişim izni verildi");
  return children;
};

export default ProtectedRoute;
