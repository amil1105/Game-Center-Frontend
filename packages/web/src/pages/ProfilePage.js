// ProfilePage.js
import React, { useContext } from 'react';
import styled from 'styled-components';
import { UserContext } from '../context/UserContext';

const ProfileContainer = styled.div`
  padding: 40px;
  color: white;
  background-color: #0a0b1e;
  min-height: 100vh;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #4a7dff;
`;

const UserDetails = styled.div`
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  p {
    color: #6c7293;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  padding: 20px;
  border-radius: 15px;
  text-align: center;

  h3 {
    font-size: 2rem;
    color: #4a7dff;
    margin-bottom: 10px;
  }

  p {
    color: #6c7293;
  }
`;

const GameHistory = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  padding: 20px;
  border-radius: 15px;

  h2 {
    margin-bottom: 20px;
  }
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #2a2c4e;

  &:last-child {
    border-bottom: none;
  }
`;

const GameInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }
`;

function ProfilePage() {
  const { user } = useContext(UserContext);

  const stats = [
    { label: 'Toplam Oyun', value: '156' },
    { label: 'Kazanılan Oyun', value: '89' },
    { label: 'Kaybedilen Oyun', value: '67' },
    { label: 'Kazanma Oranı', value: '57%' }
  ];

  const gameHistory = [
    { game: 'Tombala', result: 'Kazandı', amount: '+500', date: '2024-01-15' },
    { game: 'Blackjack', result: 'Kaybetti', amount: '-200', date: '2024-01-14' },
    { game: 'Tombala', result: 'Kazandı', amount: '+300', date: '2024-01-14' },
    { game: 'Mines', result: 'Kaybetti', amount: '-150', date: '2024-01-13' }
  ];

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="avatar" />
        <UserDetails>
          <h1>{user?.email}</h1>
          <p>Üyelik Tarihi: Ocak 2024</p>
        </UserDetails>
      </ProfileHeader>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </StatCard>
        ))}
      </StatsGrid>

      <GameHistory>
        <h2>Oyun Geçmişi</h2>
        {gameHistory.map((history, index) => (
          <HistoryItem key={index}>
            <GameInfo>
              <img src={`/img/game/${history.game.toLowerCase()}.svg`} alt={history.game} />
              <div>
                <h4>{history.game}</h4>
                <small>{history.date}</small>
              </div>
            </GameInfo>
            <div style={{ 
              color: history.result === 'Kazandı' ? '#4CAF50' : '#f44336',
              fontWeight: 'bold' 
            }}>
              {history.amount}
            </div>
          </HistoryItem>
        ))}
      </GameHistory>
    </ProfileContainer>
  );
}

export default ProfilePage;
