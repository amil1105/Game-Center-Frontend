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
    
    if (iframeLoaded && lobbyCode) {
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
          
          // 1 saniye sonra tekrar gönder (iframe tam yüklenmemiş olabilir)
          setTimeout(() => {
            frame.contentWindow.postMessage(userData, '*');
          }, 1000);
          
          // 3 saniye sonra bir kez daha gönder (bazı durumlarda gecikme olabilir)
          setTimeout(() => {
            frame.contentWindow.postMessage(userData, '*');
          }, 3000);
        }
      } catch (error) {
        console.error('Tombala iframe ile iletişim hatası:', error);
      }
    }
  }, [iframeLoaded, lobbyCode, user]);

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
      <Box sx={{ height: 'calc(100vh - 180px)', width: '100%', overflow: 'hidden' }}>
        <iframe 
          src={tombalaUrl}
          style={{ 
            border: 'none', 
            width: '100%', 
            height: '100%',
            backgroundColor: '#0B0E17' 
          }}
          title="Tombala Oyunu"
          allow="fullscreen"
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
