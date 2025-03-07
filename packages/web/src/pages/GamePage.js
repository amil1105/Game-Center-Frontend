import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const GameContainer = styled.div`
  padding: 40px;
  color: white;
  background-color: #0a0b1e;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  p {
    color: #6c7293;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding-bottom: 10px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1b38;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a7dff;
    border-radius: 4px;
  }
`;

const Tab = styled.button`
  background: ${props => props.active ? '#4a7dff' : 'transparent'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;

  &:hover {
    background: ${props => props.active ? '#4a7dff' : 'rgba(74, 125, 255, 0.1)'};
  }
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const GameCard = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }
`;

const GameImage = styled.div`
  width: 100%;
  height: 150px;
  background-color: #1a1b38;
  border-radius: 10px;
  margin-bottom: 15px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const GameStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  color: #6c7293;
  font-size: 0.9rem;
`;

const PlayButton = styled.button`
  background-color: #4a7dff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
  margin-top: 15px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3d6ae8;
  }

  &:disabled {
    background-color: #2a2c4e;
    cursor: not-allowed;
  }
`;

function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'Tüm Oyunlar' },
    { id: 'popular', name: 'Popüler' },
    { id: 'new', name: 'Yeni' },
    { id: 'card', name: 'Kart Oyunları' },
    { id: 'dice', name: 'Zar Oyunları' }
  ];

  const games = [
    {
      id: 'bingo',
      title: 'Tombala',
      image: '/img/game/bingo.jpg',
      category: 'popular',
      players: '1,234',
      winRate: '65%',
      isActive: true
    },
    {
      id: 'blackjack',
      title: 'Blackjack',
      image: '/img/game/blackjack.svg',
      category: 'card',
      players: '856',
      winRate: '48%',
      isActive: false
    },
    {
      id: 'dice',
      title: 'Dice',
      image: '/img/game/dice1.png',
      category: 'dice',
      players: '654',
      winRate: '52%',
      isActive: false
    },
    {
      id: 'roulette',
      title: 'Roulette',
      image: '/img/game/roulette.svg',
      category: 'popular',
      players: '987',
      winRate: '47%',
      isActive: false
    },
    {
      id: 'crash',
      title: 'Crash',
      image: '/img/game/crash.png',
      category: 'popular',
      players: '1,543',
      winRate: '51%',
      isActive: false
    },
    {
      id: 'mines',
      title: 'Mines',
      image: '/img/game/mines.svg',
      category: 'popular',
      players: '876',
      winRate: '49%',
      isActive: false
    }
  ];

  const filteredGames = gameId === 'all' 
    ? games 
    : games.filter(game => game.category === gameId);

  const handleGameClick = (game) => {
    if (game.isActive) {
      navigate(`/games/${game.id}`);
    }
  };

  return (
    <GameContainer>
      <Header>
        <h1>Oyunlar</h1>
        <p>Tüm oyunlarımızı keşfedin ve eğlenceye katılın</p>
      </Header>

      <CategoryTabs>
        {categories.map(category => (
          <Tab 
            key={category.id} 
            active={category.id === gameId}
            onClick={() => navigate(`/games/${category.id}`)}
          >
            {category.name}
          </Tab>
        ))}
      </CategoryTabs>

      <GameGrid>
        {filteredGames.map(game => (
          <GameCard 
            key={game.id}
            onClick={() => handleGameClick(game)}
            style={{
              opacity: game.isActive ? 1 : 0.7
            }}
          >
            <GameImage>
              <img src={game.image} alt={game.title} />
            </GameImage>
            <h3>{game.title}</h3>
            <GameStats>
              <span>👥 {game.players} Oyuncu</span>
              <span>🎯 {game.winRate} Kazanma</span>
            </GameStats>
            <PlayButton disabled={!game.isActive}>
              {game.isActive ? 'Oyna' : 'Yakında'}
            </PlayButton>
          </GameCard>
        ))}
      </GameGrid>
    </GameContainer>
  );
}

export default GamePage; 