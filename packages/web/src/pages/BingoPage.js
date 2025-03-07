import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaUsers } from 'react-icons/fa';

const PageContainer = styled.div`
  background-color: #0a0b1e;
  min-height: 100vh;
  color: white;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
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

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
`;

const OnlinePlayers = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6c7293;
`;

const GameArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
`;

const BingoCard = styled.div`
  background: #12132d;
  border-radius: 20px;
  padding: 20px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

const CardNumber = styled.div`
  background: ${props => props.marked ? '#4a7dff' : '#1e2044'};
  color: ${props => props.marked ? 'white' : '#6c7293'};
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.marked ? '#4a7dff' : '#2a2e4f'};
  }
`;

const Sidebar = styled.div`
  background: #12132d;
  border-radius: 20px;
  padding: 20px;
`;

const DrawnNumbers = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

const DrawnNumber = styled.div`
  background: #1e2044;
  color: #fff;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  font-size: 1rem;
`;

const ActionButton = styled.button`
  width: 100%;
  background: #4a7dff;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s;

  &:hover {
    background: #3d6ae8;
  }

  &:disabled {
    background: #2a2e4f;
    cursor: not-allowed;
  }
`;

function BingoPage() {
  const navigate = useNavigate();
  const [card, setCard] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Kart numaralarını oluştur
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5);
    setCard(numbers);
  }, []);

  const handleNumberClick = (number) => {
    if (drawnNumbers.includes(number)) {
      if (markedNumbers.includes(number)) {
        setMarkedNumbers(prev => prev.filter(n => n !== number));
      } else {
        setMarkedNumbers(prev => [...prev, number]);
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    // Simüle edilmiş sayı çekme
    const interval = setInterval(() => {
      const newNumber = Math.floor(Math.random() * 25) + 1;
      if (drawnNumbers.length < 25 && !drawnNumbers.includes(newNumber)) {
        setDrawnNumbers(prev => [...prev, newNumber]);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  return (
    <PageContainer>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/home')}>
            <FaArrowLeft />
          </BackButton>
          <GameInfo>
            <Title>🎯 Tombala</Title>
            <OnlinePlayers>
              <FaUsers />
              <span>12 Oyuncu Online</span>
            </OnlinePlayers>
          </GameInfo>
        </HeaderLeft>
      </Header>

      <GameArea>
        <BingoCard>
          <h2>Kartınız</h2>
          <CardGrid>
            {card.map((number, index) => (
              <CardNumber
                key={index}
                marked={markedNumbers.includes(number)}
                onClick={() => handleNumberClick(number)}
              >
                {number}
              </CardNumber>
            ))}
          </CardGrid>
        </BingoCard>

        <Sidebar>
          <h2>Çekilen Numaralar</h2>
          <DrawnNumbers>
            {drawnNumbers.map((number, index) => (
              <DrawnNumber key={index}>{number}</DrawnNumber>
            ))}
          </DrawnNumbers>
          <ActionButton 
            onClick={startGame}
            disabled={gameStarted}
          >
            {gameStarted ? 'Oyun Devam Ediyor' : 'Oyunu Başlat'}
          </ActionButton>
        </Sidebar>
      </GameArea>
    </PageContainer>
  );
}

export default BingoPage; 