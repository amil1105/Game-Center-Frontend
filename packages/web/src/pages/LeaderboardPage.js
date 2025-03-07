import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaTrophy, FaMedal } from 'react-icons/fa';

const PageContainer = styled.div`
  background-color: #0a0b1e;
  min-height: 100vh;
  color: white;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4a7dff;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s;

  &:hover {
    background-color: rgba(74, 125, 255, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LeaderboardContainer = styled.div`
  background: #12132d;
  border-radius: 20px;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
`;

const LeaderboardItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background: ${props => props.rank <= 3 ? '#1e2044' : 'transparent'};
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.3s;

  &:hover {
    background: #1e2044;
  }
`;

const Rank = styled.div`
  width: 40px;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => {
    switch(props.rank) {
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
  gap: 10px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
`;

const PlayerName = styled.div`
  font-weight: bold;
`;

const Score = styled.div`
  font-weight: bold;
  color: #4a7dff;
`;

function LeaderboardPage() {
  const navigate = useNavigate();

  const leaderboardData = [
    { id: 1, name: 'Ahmet Y.', score: 15000, avatar: 'ahmet@example.com' },
    { id: 2, name: 'Mehmet K.', score: 12500, avatar: 'mehmet@example.com' },
    { id: 3, name: 'Ayşe S.', score: 10000, avatar: 'ayse@example.com' },
    { id: 4, name: 'Fatma D.', score: 8500, avatar: 'fatma@example.com' },
    { id: 5, name: 'Ali R.', score: 7500, avatar: 'ali@example.com' },
    { id: 6, name: 'Zeynep B.', score: 6000, avatar: 'zeynep@example.com' },
    { id: 7, name: 'Can M.', score: 5500, avatar: 'can@example.com' },
    { id: 8, name: 'Deniz T.', score: 4500, avatar: 'deniz@example.com' },
    { id: 9, name: 'Ece K.', score: 4000, avatar: 'ece@example.com' },
    { id: 10, name: 'Burak S.', score: 3500, avatar: 'burak@example.com' },
  ];

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <FaTrophy color="#FFD700" />;
      case 2: return <FaTrophy color="#C0C0C0" />;
      case 3: return <FaTrophy color="#CD7F32" />;
      default: return rank;
    }
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/home')}>
          <FaArrowLeft />
        </BackButton>
        <Title>
          <FaMedal />
          Liderlik Tablosu
        </Title>
      </Header>

      <LeaderboardContainer>
        {leaderboardData.map((player, index) => (
          <LeaderboardItem key={player.id} rank={index + 1}>
            <Rank rank={index + 1}>
              {getRankIcon(index + 1)}
            </Rank>
            <PlayerInfo>
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatar}`} 
                alt={player.name} 
              />
              <PlayerName>{player.name}</PlayerName>
            </PlayerInfo>
            <Score>{player.score.toLocaleString()} Puan</Score>
          </LeaderboardItem>
        ))}
      </LeaderboardContainer>
    </PageContainer>
  );
}

export default LeaderboardPage; 