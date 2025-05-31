import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MainPage from './pages/MainPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import GameDetailPage from './pages/GameDetailPage';
import LobbyJoinPage from './pages/LobbyJoinPage';
import LobbyPage from './pages/LobbyPage';
import LobbiesPage from './pages/LobbiesPage';
import LobbyManagementPage from './pages/LobbyManagementPage';
import { UserProvider, UserContext } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';

// Bingo'dan Tombala'ya yönlendirme için özel bileşen
function BingoRedirect() {
  const { lobbyCode } = useParams();
  return <Navigate to={`/game/tombala/${lobbyCode}`} replace />;
}

// Tombala iframe bileşeni
function TombalaGame() {
  const { lobbyCode } = useParams();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const { user } = useContext(UserContext) || { user: null };
  
  useEffect(() => {
    console.log("TombalaGame bileşeni yüklendi. LobbyCode:", lobbyCode);
    
    // Lobby bilgilerini localStorage'a kaydet (iframe için)
    if (lobbyCode) {
      localStorage.setItem('tombala_lobbyId', lobbyCode);
    }
    
    // Oyuncu bilgilerini kaydet
    const playerId = user?.id || localStorage.getItem('tombala_playerId') || '';
    const playerName = user?.username || localStorage.getItem('username') || 'Oyuncu';
    
    if (playerId) {
      localStorage.setItem('tombala_playerId', playerId);
    }
    
    if (playerName) {
      localStorage.setItem('tombala_playerName', playerName);
    }
    
    // iframe yüklendiyse veri gönder
    if (iframeLoaded && lobbyCode) {
      sendDataToIframe();
    }
  }, [iframeLoaded, lobbyCode, user]);

  // iframe'e veri gönderme fonksiyonu
  const sendDataToIframe = () => {
    try {
      const frame = document.getElementById('tombalaFrame');
      if (frame && frame.contentWindow) {
        console.log('Tombala iframe lobbyId gönderiliyor:', lobbyCode);
        
        // Kullanıcı kimliği ve lobi bilgilerini hazırla
        const userData = {
          type: 'LOBBY_DATA', 
          lobbyId: lobbyCode,
          source: 'game-center',
          playerId: user?.id || localStorage.getItem('tombala_playerId') || '',
          playerName: user?.username || localStorage.getItem('username') || 'Oyuncu',
          lobbyName: localStorage.getItem('tombala_lobbyName') || 'Tombala Lobisi'
        };
        
        console.log('iframe\'e gönderilen veriler:', userData);
        
        // Veriyi iframe'e gönder
        frame.contentWindow.postMessage(userData, '*');
      }
    } catch (error) {
      console.error('Tombala iframe ile iletişim hatası:', error);
    }
  };
  
  // iframe mesajlarını dinle
  useEffect(() => {
    const messageListener = (event) => {
      // Mesaj kaynağını kontrol et
      if (event.data && event.data.type === 'TOMBALA_LOADED') {
        console.log('Tombala iframe yüklendi');
        
        // Mesajı hemen gönder
        sendDataToIframe();
        
        // 500ms sonra tekrar gönder
        setTimeout(sendDataToIframe, 500);
        
        // 1.5s sonra bir kez daha gönder
        setTimeout(sendDataToIframe, 1500);
      }
      
      // Oyundan ana sayfaya yönlendirme mesajını dinle
      if (event.data && event.data.type === 'NAVIGATE_HOME' && event.data.source === 'tombala-game') {
        console.log('Tombala oyunundan ana sayfaya yönlendirme isteği alındı');
        // Ana sayfaya yönlendir
        window.location.href = '/home';
      }
    };
    
    // Mesaj dinleyicisi ekle
    window.addEventListener('message', messageListener);
    
    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [lobbyCode, user]);

  if (!lobbyCode) {
    console.error('LobbyCode bulunamadı!');
    return (
      <MainLayout>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
            height: 'calc(100vh - 180px)',
          bgcolor: '#0B0E17'
        }}
      >
        <Typography variant="h5" color="error">
          Lobi kodu bulunamadı!
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => window.location.href = '/home'}
        >
          Ana Sayfaya Dön
        </Button>
      </Box>
      </MainLayout>
    );
  }

  // Vite ile build edilmiş Tombala uygulamasına doğru path - port 3100'e yönlendir
  const hostname = window.location.hostname; // localhost veya domain adı
  // Kullanıcı parametrelerini URL'ye ekle
  const playerId = user?.id || localStorage.getItem('tombala_playerId') || '';
  const playerName = user?.username || localStorage.getItem('username') || 'Oyuncu';
  const lobbyName = localStorage.getItem('tombala_lobbyName') || 'Tombala Lobisi';
  
  // URL'yi hem query parametreleriyle hem de path parametresiyle oluştur (ikili güvenlik)
  const tombalaUrl = `http://${hostname}:3100/tombala/game/${lobbyCode}?playerId=${encodeURIComponent(playerId)}&playerName=${encodeURIComponent(playerName)}&lobbyName=${encodeURIComponent(lobbyName)}`;
  
  console.log('Tombala iframe URL:', tombalaUrl);
  
  return (
    <MainLayout>
      <Box sx={{ 
        height: 'calc(100vh - 70px)', 
        width: '100%', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        position: 'relative'
      }}>
        <iframe 
          src={tombalaUrl}
          style={{ 
            border: 'none', 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0B0E17' 
          }}
          title="Tombala Oyunu"
          allow="fullscreen; autoplay; microphone; camera"
          id="tombalaFrame"
          onLoad={() => {
            console.log('Tombala iframe yüklendi');
            setIframeLoaded(true);
          }}
        />
      </Box>
    </MainLayout>
  );
}

// Mayın Tarlası iframe bileşeni
function MinesGame() {
  const { lobbyCode } = useParams();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const { user } = useContext(UserContext) || { user: null };
  
  useEffect(() => {
    console.log("MinesGame bileşeni yüklendi. LobbyCode:", lobbyCode);
    
    // Lobby bilgilerini localStorage'a kaydet (iframe için)
    if (lobbyCode) {
      localStorage.setItem('mines_lobbyId', lobbyCode);
    }
    
    // Oyuncu bilgilerini kaydet
    const playerId = user?.id || localStorage.getItem('mines_playerId') || '';
    const playerName = user?.username || localStorage.getItem('username') || 'Oyuncu';
    
    if (playerId) {
      localStorage.setItem('mines_playerId', playerId);
    }
    
    if (playerName) {
      localStorage.setItem('mines_playerName', playerName);
    }
    
    // iframe yüklendiyse veri gönder
    if (iframeLoaded && lobbyCode) {
      sendDataToIframe();
    }
  }, [iframeLoaded, lobbyCode, user]);

  // iframe'e veri gönderme fonksiyonu
  const sendDataToIframe = () => {
    try {
      const frame = document.getElementById('minesFrame');
      if (frame && frame.contentWindow) {
        console.log('Mayın Tarlası iframe lobbyId gönderiliyor:', lobbyCode);
        
        // Kullanıcı kimliği ve lobi bilgilerini hazırla
        const userData = {
          type: 'LOBBY_DATA', 
          lobbyId: lobbyCode,
          source: 'game-center',
          playerId: user?.id || localStorage.getItem('mines_playerId') || '',
          playerName: user?.username || localStorage.getItem('username') || 'Oyuncu',
          lobbyName: localStorage.getItem('mines_lobbyName') || 'Mayın Tarlası Lobisi'
        };
        
        console.log('iframe\'e gönderilen veriler:', userData);
        
        // Veriyi iframe'e gönder
        frame.contentWindow.postMessage(userData, '*');
      }
    } catch (error) {
      console.error('Mayın Tarlası iframe ile iletişim hatası:', error);
    }
  };
  
  // iframe mesajlarını dinle
  useEffect(() => {
    const messageListener = (event) => {
      // Mesaj kaynağını kontrol et
      if (event.data && event.data.type === 'MINES_LOADED') {
        console.log('Mayın Tarlası iframe yüklendi');
        
        // Mesajı hemen gönder
        sendDataToIframe();
        
        // 500ms sonra tekrar gönder
        setTimeout(sendDataToIframe, 500);
        
        // 1.5s sonra bir kez daha gönder
        setTimeout(sendDataToIframe, 1500);
      }
      
      // Oyundan ana sayfaya yönlendirme mesajını dinle
      if (event.data && event.data.type === 'NAVIGATE_HOME' && event.data.source === 'mines-game') {
        console.log('Mayın Tarlası oyunundan ana sayfaya yönlendirme isteği alındı');
        // Ana sayfaya yönlendir
        window.location.href = '/home';
      }
    };
    
    // Mesaj dinleyicisi ekle
    window.addEventListener('message', messageListener);
    
    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [lobbyCode, user]);

  if (!lobbyCode) {
    console.error('LobbyCode bulunamadı!');
    return (
      <MainLayout>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 180px)',
          bgcolor: '#0B0E17'
        }}
      >
        <Typography variant="h5" color="error">
          Lobi kodu bulunamadı!
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => window.location.href = '/home'}
        >
          Ana Sayfaya Dön
        </Button>
      </Box>
      </MainLayout>
    );
  }

  // Vite ile build edilmiş Mayın Tarlası uygulamasına doğru path
  // Kullanıcı parametrelerini URL'ye ekle
  const playerId = user?.id || localStorage.getItem('mines_playerId') || '';
  const playerName = user?.username || localStorage.getItem('username') || 'Oyuncu';
  const lobbyName = localStorage.getItem('mines_lobbyName') || 'Mayın Tarlası Lobisi';
  
  // Doğrudan port 3001'deki uygulamaya yönlendir (hostname değişkenini kullanma)
  const minesUrl = `http://localhost:3001/?lobbyId=${encodeURIComponent(lobbyCode)}&playerId=${encodeURIComponent(playerId)}&playerName=${encodeURIComponent(playerName)}&lobbyName=${encodeURIComponent(lobbyName)}`;
  
  console.log('Mayın Tarlası iframe URL:', minesUrl);
  
  return (
    <MainLayout>
      <Box sx={{ 
        height: 'calc(100vh - 70px)', 
        width: '100%', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        position: 'relative'
      }}>
        <iframe 
          src={minesUrl}
          style={{ 
            border: 'none', 
            width: '100%', 
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0B0E17' 
          }}
          title="Mayın Tarlası Oyunu"
          allow="fullscreen; autoplay; microphone; camera"
          id="minesFrame"
          onLoad={() => {
            console.log('Mayın Tarlası iframe yüklendi');
            setIframeLoaded(true);
          }}
        />
      </Box>
    </MainLayout>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Varsayılan olarak "/" adresine gidildiğinde, /login'e yönlendir */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/home" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lobbies"
            element={
              <ProtectedRoute>
                <LobbiesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lobbies/manage"
            element={
              <ProtectedRoute>
                <LobbyManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Oyun detay sayfası */}
          <Route
            path="/games/:gameId"
            element={
              <ProtectedRoute>
                <GameDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Mayın Tarlası Oyunu */}
          <Route
            path="/game/mines/:lobbyCode"
            element={
              <ProtectedRoute>
                <MinesGame />
              </ProtectedRoute>
            }
          />

          {/* Tombala Oyunu */}
          <Route
            path="/game/tombala/:lobbyCode"
            element={
              <ProtectedRoute>
              <TombalaGame />
              </ProtectedRoute>
            }
          />

          {/* Bingo Oyunu için yönlendirme */}
          <Route
            path="/game/bingo/:lobbyCode"
            element={
              <BingoRedirect />
            }
          />

          {/* Lobi katılım sayfası */}
          <Route
            path="/join/lobby/:lobbyCode"
            element={
              <ProtectedRoute>
                <LobbyJoinPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/join"
            element={
              <ProtectedRoute>
                <LobbyJoinPage />
              </ProtectedRoute>
            }
          />

          {/* Liderlik Tablosu */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lobby/:lobbyCode"
            element={
              <LobbyPage />
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
