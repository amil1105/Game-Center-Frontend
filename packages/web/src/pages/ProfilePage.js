// ProfilePage.js
import React, { useContext, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { UserContext } from '../context/UserContext';
import { FaTrophy, FaGamepad, FaChartLine, FaCalendarAlt, FaCog, FaBell, FaArrowLeft } from 'react-icons/fa';
import { BACKEND_URL } from '../api/auth';
import { Link, useNavigate } from 'react-router-dom';

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

const ProfileContainer = styled.div`
  padding: 40px;
  color: white;
  background: linear-gradient(135deg, #0f1033 0%, #0a0b1e 100%);
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ProfileWrapper = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileSidebar = styled.div`
  position: relative;
`;

const ProfileCard = styled.div`
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

const AvatarWrapper = styled.div`
  position: relative;
  margin: 20px auto 30px;
  width: 150px;
  height: 150px;
  z-index: 1;
`;

const AvatarBorder = styled.div`
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

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #1e2044;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1;
  background-color: #171934;
`;

const Username = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 5px;
`;

const Email = styled.p`
  color: #8f90a3;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin: 25px 0;
`;

const StatItem = styled.div`
  padding: 15px;
  background: rgba(26, 27, 38, 0.7);
  border-radius: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(74, 125, 255, 0.1);
  }
  
  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #4a7dff;
    margin-bottom: 5px;
  }
  
  p {
    color: #8f90a3;
    font-size: 0.9rem;
  }
`;

const ProfileActions = styled.div`
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

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg {
      color: #4a7dff;
    }
  }
`;

const ContentCard = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.5s ease-out;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: rgba(26, 27, 38, 0.7);
  padding: 25px 20px;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    background: rgba(74, 125, 255, 0.1);
  }
  
  h3 {
    font-size: 2rem;
    color: #4a7dff;
    margin-bottom: 10px;
  }
  
  p {
    color: #8f90a3;
  }
`;

const GameHistoryList = styled.div`
  margin-top: 20px;
`;

const HistoryItem = styled.div`
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

const GameInfo = styled.div`
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
    h4 {
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

const ResultIndicator = styled.div`
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

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const AchievementCard = styled.div`
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
  
  h4 {
    font-size: 1rem;
    margin-bottom: 5px;
  }
  
  p {
    color: #8f90a3;
    font-size: 0.85rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
`;

const BackButton = styled.button`
  background: rgba(74, 125, 255, 0.1);
  border: none;
  color: #4a7dff;
  font-size: 20px;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    background: rgba(74, 125, 255, 0.2);
    transform: translateX(-5px);
  }
`;

const HeaderContent = styled.div`
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  p {
    color: #6c7293;
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
    <ProfileContainer>
      <Header>
        <BackButton onClick={() => navigate('/home')}>
          <FaArrowLeft />
        </BackButton>
        <HeaderContent>
          <h1>Profil</h1>
          <p>Profil bilgilerinizi ve istatistiklerinizi görüntüleyin</p>
        </HeaderContent>
      </Header>
      
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
            
            <Username>{userData?.username || 'Kullanıcı'}</Username>
            <Email>{userData?.email || 'kullanıcı@örnek.com'}</Email>
            
            <UserStats>
              <StatItem>
                <h3>156</h3>
                <p>Oyun</p>
              </StatItem>
              <StatItem>
                <h3>57%</h3>
                <p>Kazanma</p>
              </StatItem>
            </UserStats>
            
            <ProfileActions>
              <ProfileAction to="/settings">
                <FaCog /> Hesap Ayarları
              </ProfileAction>
              <ProfileAction to="/notifications">
                <FaBell /> Bildirimler
              </ProfileAction>
            </ProfileActions>
          </ProfileCard>
        </ProfileSidebar>
        
        <ContentArea>
          <ContentCard>
            <ContentHeader>
              <h2><FaChartLine /> İstatistikler</h2>
            </ContentHeader>
            
            <StatsGrid>
              {stats.map((stat, index) => (
                <StatCard key={index}>
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </StatCard>
              ))}
            </StatsGrid>
          </ContentCard>
          
          <ContentCard>
            <ContentHeader>
              <h2><FaGamepad /> Oyun Geçmişi</h2>
            </ContentHeader>
            
            <GameHistoryList>
              {gameHistory.map((history, index) => (
                <HistoryItem key={index}>
                  <GameInfo>
                    <div className="game-icon">
                      {history.icon}
                    </div>
                    <div className="game-details">
                      <h4>{history.game}</h4>
                      <div className="date">
                        <FaCalendarAlt />
                        {history.date}
                      </div>
                    </div>
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
              <h2><FaTrophy /> Başarımlar</h2>
            </ContentHeader>
            
            <AchievementGrid>
              {achievements.map((achievement, index) => (
                <AchievementCard key={index}>
                  <div className="achievement-icon">
                    {achievement.icon}
                  </div>
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                </AchievementCard>
              ))}
            </AchievementGrid>
          </ContentCard>
        </ContentArea>
      </ProfileWrapper>
    </ProfileContainer>
  );
}

export default ProfilePage;
