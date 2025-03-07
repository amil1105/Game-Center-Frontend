import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';

const GameContainer = styled.div`
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

const GameTitle = styled.h1`
  font-size: 2rem;
  margin: 0;
`;

const GameContent = styled.div`
  background: #12132d;
  border-radius: 20px;
  padding: 30px;
  min-height: 500px;
`;

function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const gameInfo = {
    pvp: {
      title: 'PvP Game',
      description: 'Rekabetçi oyun modu',
      icon: '⚔️'
    },
    roulette: {
      title: 'Rulet',
      description: 'Klasik kumar oyunu',
      icon: '🎲'
    },
    jackpot: {
      title: 'Jackpot',
      description: 'Büyük ödül şansı',
      icon: '🎰'
    },
    slots: {
      title: 'Slots',
      description: 'Slot makinesi oyunları',
      icon: '7️⃣'
    },
    crash: {
      title: 'Crash',
      description: 'Heyecan verici crash oyunu',
      icon: '📈'
    },
    cases: {
      title: 'Cases',
      description: 'Kasa açma deneyimi',
      icon: '📦'
    }
  };

  const currentGame = gameInfo[gameId];

  if (!currentGame) {
    return <Navigate to="/home" replace />;
  }

  return (
    <GameContainer>
      <Header>
        <BackButton onClick={() => navigate('/home')}>
          <FaArrowLeft />
        </BackButton>
        <div>
          <GameTitle>
            {currentGame.icon} {currentGame.title}
          </GameTitle>
          <p style={{ color: '#6c7293', marginTop: '5px' }}>{currentGame.description}</p>
        </div>
      </Header>
      
      <GameContent>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>Oyun Yükleniyor...</h2>
          <p style={{ color: '#6c7293' }}>Bu sayfa geliştirme aşamasındadır.</p>
        </div>
      </GameContent>
    </GameContainer>
  );
}

export default GamePage; 