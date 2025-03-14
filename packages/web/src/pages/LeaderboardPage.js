import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { 
  FaTrophy, FaMedal, FaSearch, FaArrowLeft,
  FaGamepad, FaChartLine, FaCalendarAlt, FaFireAlt, FaStar, FaCrown, FaUser
} from 'react-icons/fa';
import { UserContext } from '../context/UserContext';
import MainLayout from '../components/Layout/MainLayout';

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

const PageContainer = styled.div`
  color: white;
  padding: 40px;
`;

const PageContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;



const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 15px;
  
  svg {
    color: #4a7dff;
    animation: ${float} 3s ease-in-out infinite;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c7293;
    z-index: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(26, 27, 38, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4a7dff;
    background: rgba(74, 125, 255, 0.1);
  }
  
  &::placeholder {
    color: #6c7293;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(26, 27, 38, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(74, 125, 255, 0.1);
    border-color: #4a7dff;
  }
  
  svg {
    color: #4a7dff;
  }
`;

const CategoriesContainer = styled.div`
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

const CategoryButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.$active ? 'linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%)' : 'rgba(26, 27, 38, 0.5)'};
  border: 1px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 30px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%)' : 'rgba(74, 125, 255, 0.1)'};
    transform: translateY(-3px);
  }
  
  ${props => props.$active && css`
    box-shadow: 0 5px 15px rgba(74, 125, 255, 0.3);
  `}
`;

const LeaderboardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeaderboardContainer = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const TopThreeContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 15px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

const TopPlayerCard = styled.div`
  position: relative;
  background: ${props => {
    switch(props.$rank) {
      case 1: return 'linear-gradient(145deg, #ffd700 0%, #f2c94c 100%)';
      case 2: return 'linear-gradient(145deg, #c0c0c0 0%, #a4a4a4 100%)';
      case 3: return 'linear-gradient(145deg, #cd7f32 0%, #a56b29 100%)';
      default: return 'linear-gradient(145deg, #1e2044 0%, #171934 100%)';
    }
  }};
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  order: ${props => props.$rank === 1 ? 2 : props.$rank === 2 ? 1 : 3};
  transform: ${props => props.$rank === 1 ? 'scale(1.1)' : 'scale(1)'};
  box-shadow: ${props => props.$rank === 1 ? '0 15px 30px rgba(242, 201, 76, 0.3)' : 'none'};
  animation: ${props => props.$rank === 1 ? css`${pulse} 3s infinite` : 'none'};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200px 100%;
    animation: ${props => props.$rank === 1 ? css`${shine} 4s infinite` : 'none'};
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    order: ${props => props.$rank};
    transform: scale(1);
  }
`;

const CrownIcon = styled.div`
  position: absolute;
  top: -25px;
  font-size: 30px;
  color: #ffd700;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.7));
  z-index: 2;
`;

const TopPlayerAvatar = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
  z-index: 2;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  ${props => props.$rank === 1 && css`
    width: 120px;
    height: 120px;
  `}
`;

const TopPlayerRank = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background: ${props => {
    switch(props.$rank) {
      case 1: return '#f2c94c';
      case 2: return '#a4a4a4';
      case 3: return '#a56b29';
      default: return '#4a7dff';
    }
  }};
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 3;
`;

const TopPlayerName = styled.h3`
  font-size: ${props => props.$rank === 1 ? '1.4rem' : '1.2rem'};
  margin-bottom: 5px;
  color: ${props => props.$rank === 1 ? 'black' : props.$rank === 2 || props.$rank === 3 ? 'black' : 'white'};
  z-index: 2;
`;

const TopPlayerScore = styled.div`
  font-size: ${props => props.$rank === 1 ? '1.2rem' : '1rem'};
  font-weight: bold;
  color: ${props => props.$rank === 1 ? 'black' : props.$rank === 2 || props.$rank === 3 ? 'black' : '#4a7dff'};
  z-index: 2;
`;

const LeaderboardList = styled.div`
  margin-top: 20px;
`;

const LeaderboardItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: rgba(26, 27, 38, 0.4);
  border-radius: 15px;
  margin-bottom: 10px;
  transition: all 0.3s;

  &:hover {
    background: rgba(74, 125, 255, 0.1);
    transform: translateX(5px);
  }
`;

const Rank = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(26, 27, 38, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => {
    switch(props.$rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#6c7293';
    }
  }};
`;

const PlayerInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 0 20px;

  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #2a2c4e;
  }
`;

const PlayerDetails = styled.div``;

const PlayerName = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 5px;
`;

const PlayerStats = styled.div`
  font-size: 0.9rem;
  color: #8f90a3;
`;

const Score = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  color: #4a7dff;
`;

const SideContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const SideCard = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const SideCardTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #4a7dff;
  }
`;

const CategoryStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const CategoryItem = styled.div`
  background: rgba(26, 27, 38, 0.5);
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  
  h4 {
    font-size: 1.5rem;
    color: #4a7dff;
    margin-bottom: 5px;
  }
  
  p {
    font-size: 0.9rem;
    color: #8f90a3;
  }
`;

const HighlightCard = styled.div`
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
  
  h4 {
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
`;

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  
  img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .player-name {
    flex: 1;
    font-size: 0.9rem;
  }
  
  .player-score {
    font-weight: bold;
    color: #4a7dff;
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
             
              <Title>
                <FaTrophy />
                Liderlik Tablosu
              </Title>
            </HeaderLeft>
            
            <HeaderRight>
              <SearchBar>
                <FaSearch />
                <SearchInput 
                  type="text" 
                  placeholder="Oyuncu ara..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                        <img 
                          src={getProfileImage(player)} 
                          alt={player.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`;
                          }}
                        />
                        <TopPlayerRank $rank={index + 1}>{index + 1}</TopPlayerRank>
                      </TopPlayerAvatar>
                      <TopPlayerName $rank={index + 1}>{player.name}</TopPlayerName>
                      <TopPlayerScore $rank={index + 1}>{player.score.toLocaleString()} Puan</TopPlayerScore>
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
                      <img 
                        src={getProfileImage(player)} 
                        alt={player.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`;
                        }}
                      />
                      <PlayerDetails>
                        <PlayerName>{player.name}</PlayerName>
                        <PlayerStats>{player.games} Oyun • %{player.winRate} Kazanma</PlayerStats>
                      </PlayerDetails>
                    </PlayerInfo>
                    <Score>{player.score.toLocaleString()} Puan</Score>
                  </LeaderboardItem>
                ))}
              </LeaderboardList>
            </LeaderboardContainer>
            
            <SideContent>
              <SideCard>
                <SideCardTitle>
                  <FaChartLine /> İstatistikler
                </SideCardTitle>
                <CategoryStats>
                  <CategoryItem>
                    <h4>250+</h4>
                    <p>Aktif Oyuncu</p>
                  </CategoryItem>
                  <CategoryItem>
                    <h4>1.2M</h4>
                    <p>Toplam Oyun</p>
                  </CategoryItem>
                  <CategoryItem>
                    <h4>120K</h4>
                    <p>Haftalık Oyun</p>
                  </CategoryItem>
                  <CategoryItem>
                    <h4>%54</h4>
                    <p>Ort. Kazanma</p>
                  </CategoryItem>
                </CategoryStats>
              </SideCard>
              
              <SideCard>
                <SideCardTitle>
                  <FaFireAlt /> Haftanın En İyileri
                </SideCardTitle>
                <HighlightCard>
                  <div className="highlight-icon"><FaStar /></div>
                  <h4>Kart Oyunları</h4>
                  <PlayerRow>
                    <img 
                      src={getProfileImage(getBestPlayer('kart'))} 
                      alt={getBestPlayer('kart').name} 
                    />
                    <span className="player-name">{getBestPlayer('kart').name}</span>
                    <span className="player-score">{getBestPlayer('kart').score.toLocaleString()}</span>
                  </PlayerRow>
                </HighlightCard>
                
                <HighlightCard style={{ marginTop: '15px' }}>
                  <div className="highlight-icon"><FaStar /></div>
                  <h4>Zar Oyunları</h4>
                  <PlayerRow>
                    <img 
                      src={getProfileImage(getBestPlayer('zar'))} 
                      alt={getBestPlayer('zar').name} 
                    />
                    <span className="player-name">{getBestPlayer('zar').name}</span>
                    <span className="player-score">{getBestPlayer('zar').score.toLocaleString()}</span>
                  </PlayerRow>
                </HighlightCard>
              </SideCard>
              
              {user && (
                <SideCard>
                  <SideCardTitle>
                    <FaUser /> Senin Sıralamanız
                  </SideCardTitle>
                  <LeaderboardItem style={{ background: 'rgba(74, 125, 255, 0.1)' }}>
                    <Rank $rank={4}>4</Rank>
                    <PlayerInfo>
                      <img 
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
                        <PlayerName>{user.username || user.email}</PlayerName>
                        <PlayerStats>76 Oyun • %55 Kazanma</PlayerStats>
                      </PlayerDetails>
                    </PlayerInfo>
                    <Score>8,500 Puan</Score>
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