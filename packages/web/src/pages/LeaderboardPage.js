import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { UserContext } from '../context/UserContext';
import MainLayout from '../components/Layout/MainLayout';
import { FaTrophy, FaSearch, FaChartLine, FaFireAlt, FaUser, FaCrown, FaStar } from 'react-icons/fa';
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

const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40%, 100% {
    background-position: 140px;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const PageContainer = styled(Box)`
  width: 100%;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageContent = styled(Box)`
  width: 100%;
`;

const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const HeaderLeft = styled(Box)`
  display: flex;
  align-items: center;
`;

const Title = styled(Typography)`
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #FFD700;
    font-size: 1.8rem;
  }
`;

const HeaderRight = styled(Box)`
  display: flex;
  align-items: center;
`;

const SearchBar = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 15px;
    color: #6e7191;
    font-size: 14px;
  }
`;

const SearchInput = styled(Box)`
  padding: 12px 12px 12px 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 14px;
  width: 250px;
  
  & input {
    background: transparent;
    border: none;
    color: #fff;
    width: 100%;
    outline: none;
  }
  
  &:focus-within {
    border-color: #4a7dff;
  }
  
  &::placeholder {
    color: #6e7191;
  }
`;

const CategoriesContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 30px;
  gap: 10px;
`;

const CategoryButton = styled(Box)`
  padding: 8px 16px;
  border-radius: 50px;
  background: ${props => props.$active ? '#4a7dff' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active ? '#fff' : '#6e7191'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.$active ? '#4a7dff' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const LeaderboardWrapper = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const LeaderboardContainer = styled(Box)`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const TopThreeContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

const TopPlayerCard = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 15px 20px;
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(to bottom, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))';
    if (props.$rank === 2) return 'linear-gradient(to bottom, rgba(192, 192, 192, 0.15), rgba(192, 192, 192, 0.05))';
    if (props.$rank === 3) return 'linear-gradient(to bottom, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05))';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  border-radius: 15px;
  border: 1px solid ${props => {
    if (props.$rank === 1) return 'rgba(255, 215, 0, 0.3)';
    if (props.$rank === 2) return 'rgba(192, 192, 192, 0.3)';
    if (props.$rank === 3) return 'rgba(205, 127, 50, 0.3)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  
  animation: ${props => props.$rank === 1 ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: row;
    padding: 15px;
    gap: 15px;
    justify-content: flex-start;
    
    > * {
      margin-top: 0 !important;
    }
  }
`;

const CrownIcon = styled(Box)`
  position: absolute;
  top: -15px;
  color: #FFD700;
  font-size: 2rem;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  
  @media (max-width: 768px) {
    position: relative;
    top: 0;
    font-size: 1.5rem;
  }
`;

const TopPlayerAvatar = styled(Box)`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(45deg, #ffd700, #ff9d00)';
    if (props.$rank === 2) return 'linear-gradient(45deg, #c0c0c0, #e0e0e0)';
    if (props.$rank === 3) return 'linear-gradient(45deg, #cd7f32, #e0955b)';
    return 'linear-gradient(45deg, #2a2c4e, #4a5568)';
  }};
  padding: 3px;
  
  .MuiAvatar-root {
    width: 100%;
    height: 100%;
    border: 2px solid #14162d;
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    margin-bottom: 0;
  }
`;

const Avatar = styled(MuiAvatar)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2a2c4e;
  
  &.profile-image {
    width: 45px;
    height: 45px;
  }
`;

const TopPlayerRank = styled(Box)`
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  background: ${props => {
    if (props.$rank === 1) return '#ffd700';
    if (props.$rank === 2) return '#c0c0c0';
    if (props.$rank === 3) return '#cd7f32';
    return '#4a7dff';
  }};
  color: ${props => props.$rank === 1 ? '#000' : '#fff'};
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
`;

const TopPlayerName = styled(Typography)`
  font-weight: 600;
  margin-top: 5px;
  color: ${props => {
    if (props.$rank === 1) return '#ffd700';
    if (props.$rank === 2) return '#c0c0c0';
    if (props.$rank === 3) return '#cd7f32';
    return '#fff';
  }};
  
  @media (max-width: 768px) {
    margin-top: 0;
    margin-bottom: 0;
  }
`;

const TopPlayerScore = styled(Typography)`
  margin-top: 5px;
  font-weight: bold;
  color: ${props => {
    if (props.$rank === 1) return '#ffd700';
    if (props.$rank === 2) return '#c0c0c0';
    if (props.$rank === 3) return '#cd7f32';
    return '#4a7dff';
  }};
  
  @media (max-width: 768px) {
    margin-top: 0;
    margin-left: auto;
  }
`;

const LeaderboardList = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LeaderboardItem = styled(Box)`
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }
`;

const Rank = styled(Box)`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  margin-right: 15px;
  background: ${props => {
    if (props.$rank === 1) return '#ffd700';
    if (props.$rank === 2) return '#c0c0c0';
    if (props.$rank === 3) return '#cd7f32';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => (props.$rank <= 3) ? '#000' : '#fff'};
`;

const PlayerInfo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const PlayerDetails = styled(Box)`
  display: flex;
  flex-direction: column;
  
  .player-name {
    font-weight: 500;
    line-height: 1.2;
  }
  
  .player-stats {
    font-size: 0.8rem;
    color: #6e7191;
  }
`;

const Score = styled(Typography)`
  font-weight: bold;
  color: #4a7dff;
`;

const SideContent = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SideCard = styled(Box)`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SideCardTitle = styled(Typography)`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #4a7dff;
  }
`;

const CategoryStats = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const CategoryItem = styled(Box)`
  text-align: center;
  padding: 15px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
`;

const PlayerRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  
  .player-name {
    flex: 1;
    font-size: 0.9rem;
  }
  
  .player-score {
    font-weight: bold;
    color: #4a7dff;
  }
`;

const CategoryContainer = styled(Box)`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;
  
  &::-webkit-scrollbar {
    height: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(74, 125, 255, 0.3);
    border-radius: 10px;
  }
`;

const HighlightCard = styled(Box)`
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(74, 125, 255, 0.2) 0%,
    rgba(106, 90, 255, 0.2) 100%
  );
  border-radius: 15px;
  padding: 20px;
  
  .highlight-icon {
    position: absolute;
    top: -15px;
    right: 20px;
    font-size: 24px;
    color: #FFD700;
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
  }
`;

function LeaderboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  
  // Örnek veri
  const leaderboardData = [
    { id: 1, name: 'Ahmet Y.', username: 'ahmetY', score: 15000, avatar: 'ahmet@example.com', games: 120, winRate: 68, category: 'genel' },
    { id: 2, name: 'Mehmet K.', username: 'mehmetK', score: 12500, avatar: 'mehmet@example.com', games: 95, winRate: 62, category: 'genel' },
    { id: 3, name: 'Ayşe S.', username: 'ayseS', score: 10000, avatar: 'ayse@example.com', games: 87, winRate: 59, category: 'genel' },
    { id: 4, name: 'Fatma D.', username: 'fatmaD', score: 8500, avatar: 'fatma@example.com', games: 76, winRate: 55, category: 'kart' },
    { id: 5, name: 'Ali R.', username: 'aliR', score: 7500, avatar: 'ali@example.com', games: 68, winRate: 52, category: 'kart' },
    { id: 6, name: 'Zeynep B.', username: 'zeynepB', score: 6000, avatar: 'zeynep@example.com', games: 54, winRate: 48, category: 'zar' },
    { id: 7, name: 'Can M.', username: 'canM', score: 5500, avatar: 'can@example.com', games: 47, winRate: 45, category: 'zar' },
    { id: 8, name: 'Deniz T.', username: 'denizT', score: 4500, avatar: 'deniz@example.com', games: 43, winRate: 42, category: 'tombala' },
    { id: 9, name: 'Ece K.', username: 'eceK', score: 4000, avatar: 'ece@example.com', games: 38, winRate: 39, category: 'tombala' },
    { id: 10, name: 'Burak S.', username: 'burakS', score: 3500, avatar: 'burak@example.com', games: 35, winRate: 37, category: 'diğer' },
  ];
  
  // Kullanıcı profil fotoğrafını almak için yardımcı fonksiyon
  const getProfileImage = (player) => {
    // Gerçek bir profil fotoğrafı olup olmadığını kontrol et
    // Eğer yoksa Dicebear avatar servisi kullan
    return player.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`;
  };
  
  // Filtreleme ve arama işlemleri
  useEffect(() => {
    let filtered = [...leaderboardData];
    
    // Kategori filtreleme
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(player => player.category === selectedCategory);
    }
    
    // Arama filtreleme
    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLeaderboard(filtered);
  }, [selectedCategory, searchTerm]);
  
  // Bileşen yüklendiğinde filtrelenmiş listeyi varsayılan olarak ayarla
  useEffect(() => {
    setFilteredLeaderboard(leaderboardData);
  }, []);
  
  // Üst 3 oyuncuyu göstermek için
  const topThreePlayers = leaderboardData.slice(0, 3);
  
  // Kategori başına en yüksek skorlu oyuncuyu bul
  const getBestPlayer = (category) => {
    return leaderboardData
      .filter(player => player.category === category)
      .sort((a, b) => b.score - a.score)[0];
  };

  return (
    <MainLayout>
      <PageContainer>
        <PageContent>
          <Header>
            <HeaderLeft>
             
              <Title variant="h1">
                <FaTrophy />
                Liderlik Tablosu
              </Title>
            </HeaderLeft>
            
            <HeaderRight>
              <SearchBar>
                <FaSearch />
                <SearchInput component="div">
                  <input 
                    type="text" 
                    placeholder="Oyuncu ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchInput>
              </SearchBar>
            </HeaderRight>
          </Header>
          
          <CategoriesContainer>
            <CategoryButton 
              $active={selectedCategory === 'all'} 
              onClick={() => setSelectedCategory('all')}
            >
              Tümü
            </CategoryButton>
            <CategoryButton 
              $active={selectedCategory === 'genel'} 
              onClick={() => setSelectedCategory('genel')}
            >
              Genel
            </CategoryButton>
            <CategoryButton 
              $active={selectedCategory === 'kart'} 
              onClick={() => setSelectedCategory('kart')}
            >
              Kart Oyunları
            </CategoryButton>
            <CategoryButton 
              $active={selectedCategory === 'zar'} 
              onClick={() => setSelectedCategory('zar')}
            >
              Zar Oyunları
            </CategoryButton>
            <CategoryButton 
              $active={selectedCategory === 'tombala'} 
              onClick={() => setSelectedCategory('tombala')}
            >
              Tombala
            </CategoryButton>
            <CategoryButton 
              $active={selectedCategory === 'diğer'} 
              onClick={() => setSelectedCategory('diğer')}
            >
              Diğer Oyunlar
            </CategoryButton>
          </CategoriesContainer>
          
          <LeaderboardWrapper>
            <LeaderboardContainer>
              {selectedCategory === 'all' && (
                <TopThreeContainer>
                  {topThreePlayers.map((player, index) => (
                    <TopPlayerCard key={player.id} $rank={index + 1}>
                      {index === 0 && <CrownIcon><FaCrown /></CrownIcon>}
                      <TopPlayerAvatar $rank={index + 1}>
                        <Avatar
                          src={getProfileImage(player)} 
                          alt={player.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`;
                          }}
                        />
                        <TopPlayerRank $rank={index + 1}>{index + 1}</TopPlayerRank>
                      </TopPlayerAvatar>
                      <TopPlayerName $rank={index + 1} variant="body1">{player.name}</TopPlayerName>
                      <TopPlayerScore $rank={index + 1} variant="body2">{player.score.toLocaleString()} Puan</TopPlayerScore>
                    </TopPlayerCard>
                  ))}
                </TopThreeContainer>
              )}
              
              <LeaderboardList>
                {filteredLeaderboard.map((player, index) => (
                  <LeaderboardItem key={player.id}>
                    <Rank $rank={leaderboardData.findIndex(p => p.id === player.id) + 1}>
                      {leaderboardData.findIndex(p => p.id === player.id) + 1}
                    </Rank>
                    <PlayerInfo>
                      <Avatar
                        src={getProfileImage(player)} 
                        alt={player.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`;
                        }}
                      />
                      <PlayerDetails>
                        <Typography variant="body1" className="player-name">{player.name}</Typography>
                        <Typography variant="body2" className="player-stats">{player.games} Oyun • %{player.winRate} Kazanma</Typography>
                      </PlayerDetails>
                    </PlayerInfo>
                    <Score variant="body1">{player.score.toLocaleString()} Puan</Score>
                  </LeaderboardItem>
                ))}
              </LeaderboardList>
            </LeaderboardContainer>
            
            <SideContent>
              <SideCard>
                <SideCardTitle variant="h6">
                  <FaChartLine /> İstatistikler
                </SideCardTitle>
                <CategoryStats>
                  <CategoryItem>
                    <Typography variant="h4">250+</Typography>
                    <Typography variant="body2">Aktif Oyuncu</Typography>
                  </CategoryItem>
                  <CategoryItem>
                    <Typography variant="h4">1.2M</Typography>
                    <Typography variant="body2">Toplam Oyun</Typography>
                  </CategoryItem>
                  <CategoryItem>
                    <Typography variant="h4">120K</Typography>
                    <Typography variant="body2">Haftalık Oyun</Typography>
                  </CategoryItem>
                  <CategoryItem>
                    <Typography variant="h4">%54</Typography>
                    <Typography variant="body2">Ort. Kazanma</Typography>
                  </CategoryItem>
                </CategoryStats>
              </SideCard>
              
              <SideCard>
                <SideCardTitle variant="h6">
                  <FaFireAlt /> Haftanın En İyileri
                </SideCardTitle>
                <HighlightCard>
                  <Box className="highlight-icon"><FaStar /></Box>
                  <Typography variant="h4" sx={{ fontSize: '1.1rem', marginBottom: '15px' }}>Kart Oyunları</Typography>
                  <PlayerRow>
                    <Avatar
                      src={getProfileImage(getBestPlayer('kart'))} 
                      alt={getBestPlayer('kart').name} 
                    />
                    <Typography component="span" className="player-name">{getBestPlayer('kart').name}</Typography>
                    <Typography component="span" className="player-score">{getBestPlayer('kart').score.toLocaleString()}</Typography>
                  </PlayerRow>
                </HighlightCard>
                
                <HighlightCard style={{ marginTop: '15px' }}>
                  <Box className="highlight-icon"><FaStar /></Box>
                  <Typography variant="h4" sx={{ fontSize: '1.1rem', marginBottom: '15px' }}>Zar Oyunları</Typography>
                  <PlayerRow>
                    <Avatar 
                      src={getProfileImage(getBestPlayer('zar'))} 
                      alt={getBestPlayer('zar').name} 
                    />
                    <Typography component="span" className="player-name">{getBestPlayer('zar').name}</Typography>
                    <Typography component="span" className="player-score">{getBestPlayer('zar').score.toLocaleString()}</Typography>
                  </PlayerRow>
                </HighlightCard>
              </SideCard>
              
              {user && (
                <SideCard>
                  <SideCardTitle variant="h6">
                    <FaUser /> Senin Sıralamanız
                  </SideCardTitle>
                  <LeaderboardItem style={{ background: 'rgba(74, 125, 255, 0.1)' }}>
                    <Rank $rank={4}>4</Rank>
                    <PlayerInfo>
                      <Avatar 
                        src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                        alt={user.username} 
                        className="profile-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';
                          e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + initial + '</text></svg>')}`;
                        }}
                      />
                      <PlayerDetails>
                        <Typography variant="body1" className="player-name">{user.username || user.email}</Typography>
                        <Typography variant="body2" className="player-stats">76 Oyun • %55 Kazanma</Typography>
                      </PlayerDetails>
                    </PlayerInfo>
                    <Score variant="body1">8,500 Puan</Score>
                  </LeaderboardItem>
                </SideCard>
              )}
            </SideContent>
          </LeaderboardWrapper>
        </PageContent>
      </PageContainer>
    </MainLayout>
  );
}

export default LeaderboardPage; 