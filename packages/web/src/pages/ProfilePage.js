// ProfilePage.js
import React, { useContext, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { UserContext } from '../context/UserContext';
import { FaTrophy, FaGamepad, FaChartLine, FaCalendarAlt, FaCog, FaBell } from 'react-icons/fa';
import { BACKEND_URL } from '../api/auth';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { Box, Typography, Avatar as MuiAvatar } from '@mui/material';

// Animasyonlar
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(74, 125, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 125, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 125, 255, 0);
  }
`;

const ProfileContainer = styled(Box)`
  padding: 40px;
  color: white;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ProfileWrapper = styled(Box)`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled(Box)`
  position: relative;
`;

const ProfileCard = styled(Box)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 40px;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%);
    z-index: 0;
  }
`;

const AvatarWrapper = styled(Box)`
  position: relative;
  margin: 20px auto 30px;
  width: 150px;
  height: 150px;
  z-index: 1;
`;

const AvatarBorder = styled(Box)`
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%);
  animation: ${pulse} 2s infinite;
  z-index: -1;
`;

const Avatar = styled(MuiAvatar)`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #1e2044;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1;
  background-color: #171934;
`;

const Username = styled(Typography)`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 5px;
`;

const Email = styled(Typography)`
  color: #8f90a3;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const UserStats = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin: 25px 0;
`;

const StatItem = styled(Box)`
  padding: 15px;
  background: rgba(26, 27, 38, 0.7);
  border-radius: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(74, 125, 255, 0.1);
  }
`;

const ContentArea = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const ContentHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ContentCard = styled(Box)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.5s ease-out;
`;

const StatsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StatCard = styled(Box)`
  background: rgba(26, 27, 38, 0.7);
  padding: 25px 20px;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(74, 125, 255, 0.1);
  }
`;

const GameHistoryList = styled(Box)`
  margin-top: 20px;
`;

const HistoryItem = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(26, 27, 38, 0.5);
    border-radius: 12px;
  }
`;

const GameInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 20px;
  
  .game-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #4a7dff;
  }
  
  .game-details {
    .MuiTypography-root {
      font-size: 1.1rem;
      margin-bottom: 5px;
    }
    
    .date {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #8f90a3;
      font-size: 0.85rem;
      
      svg {
        font-size: 0.8rem;
      }
    }
  }
`;

const ResultIndicator = styled(Box)`
  font-weight: 700;
  font-size: 1.1rem;
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.$win ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  color: ${props => props.$win ? '#4CAF50' : '#f44336'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AchievementGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const AchievementCard = styled(Box)`
  background: rgba(26, 27, 38, 0.7);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(74, 125, 255, 0.1);
  }
  
  .achievement-icon {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background: linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%);
    margin: 0 auto 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
  }
`;

const ProfileActions = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 25px;
`;

const ProfileAction = styled(Link)`
  padding: 12px 20px;
  background: rgba(26, 27, 38, 0.7);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(74, 125, 255, 0.1);
    transform: translateX(5px);
  }
  
  svg {
    color: #4a7dff;
  }
`;

function ProfilePage() {
  const { user } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Komponentin yüklenmesi sırasında kullanıcı verilerini UserContext'ten al
    if (user) {
      setUserData(user);
      console.log('User data loaded in profile page:', user);
    }
  }, [user]);
  
  // Profil avatarı için doğru URL oluştur
  const getProfileImage = () => {
    if (!userData || !userData.profileImage) {
      // Kullanıcı adının baş harfini içeren bir SVG döndür
      const initial = userData?.username ? userData.username.charAt(0).toUpperCase() : 'U';
      return `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + initial + '</text></svg>')}`;
    }
    return userData.profileImage;
  };
  
  // Örnek istatistikler
  const stats = [
    { label: 'Toplam Oyun', value: '156' },
    { label: 'Kazanılan', value: '89' },
    { label: 'Kaybedilen', value: '67' },
    { label: 'Kazanma %', value: '57%' }
  ];
  
  // Örnek oyun geçmişi
  const gameHistory = [
    { game: 'Tombala', icon: '🎮', result: 'Kazandı', amount: '+500', date: '2024-01-15' },
    { game: 'Blackjack', icon: '🃏', result: 'Kaybetti', amount: '-200', date: '2024-01-14' },
    { game: 'Tombala', icon: '🎮', result: 'Kazandı', amount: '+300', date: '2024-01-14' },
    { game: 'Mines', icon: '💣', result: 'Kaybetti', amount: '-150', date: '2024-01-13' }
  ];
  
  // Örnek başarımlar
  const achievements = [
    { name: 'İlk Kazanç', icon: '🏆', description: 'İlk oyununu kazandın!' },
    { name: 'Hızlı Başlangıç', icon: '🚀', description: '10 oyun oynadın' },
    { name: 'Seri Kazanan', icon: '🔥', description: 'Arka arkaya 5 oyun kazandın' },
    { name: 'Tombala Uzmanı', icon: '🎯', description: '50 tombala oyunu tamamladın' }
  ];

  return (
    <MainLayout>
      <ProfileContainer>
        <ProfileWrapper>
          <ProfileSidebar>
            <ProfileCard>
              <AvatarWrapper>
                <AvatarBorder />
                <Avatar 
                  className="profile-image"
                  src={getProfileImage()} 
                  alt={userData?.username || 'Kullanıcı'} 
                  onError={(e) => {
                    e.target.onerror = null;
                    const initial = userData?.username ? userData.username.charAt(0).toUpperCase() : 'U';
                    e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + initial + '</text></svg>')}`;
                  }}
                />
              </AvatarWrapper>
              
              <Username variant="h1">{userData?.username || 'Kullanıcı'}</Username>
              <Email variant="body2">{userData?.email || 'kullanıcı@örnek.com'}</Email>
              
              <UserStats>
                <StatItem>
                  <Typography variant="h3" sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#4a7dff', marginBottom: '5px' }}>156</Typography>
                  <Typography variant="body2" sx={{ color: '#8f90a3', fontSize: '0.9rem' }}>Oyun</Typography>
                </StatItem>
                <StatItem>
                  <Typography variant="h3" sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#4a7dff', marginBottom: '5px' }}>57%</Typography>
                  <Typography variant="body2" sx={{ color: '#8f90a3', fontSize: '0.9rem' }}>Kazanma</Typography>
                </StatItem>
              </UserStats>
              
              <ProfileActions>
                <ProfileAction to="/settings">
                  <FaCog /> Hesap Ayarları
                </ProfileAction>
                <ProfileAction to="/settings">
                  <FaBell /> Bildirimler
                </ProfileAction>
              </ProfileActions>
            </ProfileCard>
          </ProfileSidebar>
          
          <ContentArea>
            <ContentCard>
              <ContentHeader>
                <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaChartLine style={{ color: '#4a7dff' }} /> İstatistikler
                </Typography>
              </ContentHeader>
              
              <StatsGrid>
                {stats.map((stat, index) => (
                  <StatCard key={index}>
                    <Typography variant="h3" sx={{ fontSize: '2rem', color: '#4a7dff', marginBottom: '10px' }}>{stat.value}</Typography>
                    <Typography variant="body2" sx={{ color: '#8f90a3' }}>{stat.label}</Typography>
                  </StatCard>
                ))}
              </StatsGrid>
            </ContentCard>
            
            <ContentCard>
              <ContentHeader>
                <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaGamepad style={{ color: '#4a7dff' }} /> Oyun Geçmişi
                </Typography>
              </ContentHeader>
              
              <GameHistoryList>
                {gameHistory.map((history, index) => (
                  <HistoryItem key={index}>
                    <GameInfo>
                      <Box className="game-icon">
                        {history.icon}
                      </Box>
                      <Box className="game-details">
                        <Typography variant="h4" sx={{ fontSize: '1.1rem', marginBottom: '5px' }}>{history.game}</Typography>
                        <Box className="date" sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8f90a3', fontSize: '0.85rem' }}>
                          <FaCalendarAlt style={{ fontSize: '0.8rem' }} />
                          {history.date}
                        </Box>
                      </Box>
                    </GameInfo>
                    <ResultIndicator $win={history.result === 'Kazandı'}>
                      {history.amount}
                    </ResultIndicator>
                  </HistoryItem>
                ))}
              </GameHistoryList>
            </ContentCard>
            
            <ContentCard>
              <ContentHeader>
                <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaTrophy style={{ color: '#4a7dff' }} /> Başarımlar
                </Typography>
              </ContentHeader>
              
              <AchievementGrid>
                {achievements.map((achievement, index) => (
                  <AchievementCard key={index}>
                    <Box className="achievement-icon">
                      {achievement.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontSize: '1rem', marginBottom: '5px' }}>{achievement.name}</Typography>
                    <Typography variant="body2" sx={{ color: '#8f90a3', fontSize: '0.85rem' }}>{achievement.description}</Typography>
                  </AchievementCard>
                ))}
              </AchievementGrid>
            </ContentCard>
          </ContentArea>
        </ProfileWrapper>
      </ProfileContainer>
    </MainLayout>
  );
}

export default ProfilePage;
