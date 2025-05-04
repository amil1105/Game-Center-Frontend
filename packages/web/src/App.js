import React, { useState, useEffect } from 'react';
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
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

// Bingo'dan Tombala'ya yönlendirme için özel bileşen
function BingoRedirect() {
  const { lobbyCode } = useParams();
  return <Navigate to={`/game/tombala/${lobbyCode}`} replace />;
}

// Tombala iframe bileşeni
function TombalaGame() {
  const { lobbyCode } = useParams();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  
  useEffect(() => {
    console.log("TombalaGame bileşeni yüklendi. LobbyCode:", lobbyCode);
    
    if (iframeLoaded && lobbyCode) {
      try {
        const frame = document.getElementById('tombalaFrame');
        if (frame && frame.contentWindow) {
          console.log('Tombala iframe lobbyId gönderiliyor:', lobbyCode);
          
          // Veriyi iframe'e gönder
          frame.contentWindow.postMessage({ 
            type: 'LOBBY_DATA', 
            lobbyId: lobbyCode 
          }, '*');
        }
      } catch (error) {
        console.error('Tombala iframe ile iletişim hatası:', error);
      }
    }
  }, [iframeLoaded, lobbyCode]);

  if (!lobbyCode) {
    console.error('LobbyCode bulunamadı!');
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
    );
  }

  // Vite ile build edilmiş Tombala uygulamasına doğru path
  const tombalaUrl = `/tombala/index.html?lobbyId=${encodeURIComponent(lobbyCode)}`;
  
  console.log('Tombala iframe URL:', tombalaUrl);
  
  return (
    <iframe 
      src={tombalaUrl}
      style={{ 
        border: 'none', 
        width: '100%', 
        height: '100vh', 
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
              <TombalaGame />
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
