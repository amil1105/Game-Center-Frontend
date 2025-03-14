import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import GameDetailPage from './pages/GameDetailPage';
import LobbyJoinPage from './pages/LobbyJoinPage';
import LobbiesPage from './pages/LobbiesPage';
import LobbyManagementPage from './pages/LobbyManagementPage';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Varsayılan olarak "/" adresine gidildiğinde, /login'e yönlendir */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
