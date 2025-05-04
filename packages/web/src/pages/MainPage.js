// src/pages/MainPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BsController, BsTrophy, BsPeople } from 'react-icons/bs';
import MainLayout from '../components/Layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const Content = styled(Box)`
  padding: 30px;
`;

const PromoBanner = styled(Box)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%);
    opacity: 0.1;
    transform: skewX(-20deg) translateX(50%);
  }
`;

const PromoContent = styled(Box)`
  flex: 1;
  z-index: 1;

  h2 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 10px;
    background: linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1rem;
    margin-bottom: 20px;
  }

  .features {
    display: flex;
    gap: 30px;

    .feature {
      display: flex;
      align-items: center;
      gap: 10px;
      color: rgba(255, 255, 255, 0.9);

      svg {
        color: #4a7dff;
      }
    }
  }
`;

const PromoImage = styled(Box)`
  position: relative;
  z-index: 1;
  transform: perspective(1000px) rotateY(-10deg);
  transition: transform 0.3s ease;

  img {
    width: 200px;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;
  }

  &:hover {
    transform: perspective(1000px) rotateY(-5deg) translateX(-10px);
    
    img {
      filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.4));
    }
  }
`;

const GameGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const GameCard = styled(Box)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-5px);
    border-color: #4a7dff;
    box-shadow: 0 10px 20px rgba(74, 125, 255, 0.2);
  }
`;

const GameImage = styled(Box)`
  width: 100%;
  height: 140px;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .game-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  }
`;

const GameTitle = styled(Typography)`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const GameStats = styled(Box)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(26, 27, 38, 0.5);

  .stat {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #8f90a3;
    font-size: 12px;
    transition: all 0.3s;

    &:hover {
      color: #4a7dff;
    }
  }
`;

function MainPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([
    { 
      id: 'bingo', 
      title: 'Tombala', 
      description: 'Klasik Türk Tombalası',
      image: '/img/game/bingo.jpg',
      isActive: true
    },
    { 
      id: 'mines', 
      title: 'Mines', 
      description: 'Mayın tarlası oyunu',
      image: '/img/game/mines.svg',
      isActive: false
    },
    { 
      id: 'crash', 
      title: 'Crash', 
      description: 'Heyecan verici crash oyunu',
      image: '/img/game/crash.png',
      isActive: false
    },
    { 
      id: 'wheel', 
      title: 'Wheel', 
      description: 'Şans çarkı oyunu',
      image: '/img/game/wheel.svg',
      isActive: false
    },
    { 
      id: 'dice', 
      title: 'Dice', 
      description: 'Zar atma oyunu',
      image: '/img/game/dice.svg',
      isActive: false
    },
    { 
      id: 'coinflip', 
      title: 'Coinflip', 
      description: 'Yazı tura oyunu',
      image: '/img/game/coinflip.svg',
      isActive: false
    },
    { 
      id: 'hilo', 
      title: 'HiLo', 
      description: 'Yüksek mi alçak mı',
      image: '/img/game/hilo.svg',
      isActive: false
    },
    { 
      id: 'blackjack', 
      title: 'Blackjack', 
      description: '21 kart oyunu',
      image: '/img/game/blackjack.svg',
      isActive: false
    },
    { 
      id: 'tower', 
      title: 'Tower', 
      description: 'Kule tırmanma oyunu',
      image: '/img/game/tower.svg',
      isActive: false
    },
    { 
      id: 'roulette', 
      title: 'Roulette', 
      description: 'Klasik rulet oyunu',
      image: '/img/game/roulette.svg',
      isActive: false
    },
    { 
      id: 'stairs', 
      title: 'Stairs', 
      description: 'Merdiven tırmanma oyunu',
      image: '/img/game/stairs.svg',
      isActive: false
    },
    { 
      id: 'keno', 
      title: 'Keno', 
      description: 'Sayısal tahmin oyunu',
      image: '/img/game/keno.svg',
      isActive: false
    }
  ]);

  const handleGameClick = (gameId) => {
    navigate(`/games/${gameId}`);
  };

  return (
    <MainLayout>
      <Content>
        <PromoBanner>
          <PromoContent>
            <Typography variant="h2" component="h2" sx={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '10px',
              background: 'linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              OYUN MERKEZİ PLATFORMU
            </Typography>
            <Typography variant="body1" component="p" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.1rem',
              marginBottom: '20px'
            }}>
              Gerçek zamanlı çok oyunculu oyunların keyfini çıkarın!
            </Typography>
            <Box className="features" sx={{ display: 'flex', gap: '30px' }}>
              <Box className="feature" sx={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.9)' }}>
                <BsController size={20} />
                <Typography variant="span" component="span">Tombala, Okey ve Daha Fazlası</Typography>
              </Box>
              <Box className="feature" sx={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.9)' }}>
                <BsTrophy size={20} />
                <Typography variant="span" component="span">Gerçek Zamanlı Turnuvalar</Typography>
              </Box>
              <Box className="feature" sx={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255, 255, 255, 0.9)' }}>
                <BsPeople size={20} />
                <Typography variant="span" component="span">Arkadaşlarınızla Oynayın</Typography>
              </Box>
            </Box>
          </PromoContent>
          <PromoImage>
            <Box component="img" src="https://cdn.dribbble.com/userupload/16528532/file/original-d7f5a5167a2bf86f6710665cf6d8b72b.png?resize=752x&vertical=center" alt="Promo" sx={{
              width: '200px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
              transition: 'all 0.3s ease'
            }} />
          </PromoImage>
        </PromoBanner>

        <GameGrid>
          {games.map(game => (
            <GameCard key={game.id} onClick={() => handleGameClick(game.id)}>
              <GameImage>
                <Box component="img" src={game.image} alt={game.title} sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} />
                <Box className="game-info" sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '15px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                }}>
                  <GameTitle variant="h6">{game.title}</GameTitle>
                </Box>
              </GameImage>
              <GameStats>
                <Box className="stat" sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8f90a3', fontSize: '12px', transition: 'all 0.3s' }}>
                  <Typography variant="span" component="span">👥</Typography>
                  <Typography variant="span" component="span">1.2K</Typography>
                </Box>
                <Box className="stat" sx={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8f90a3', fontSize: '12px', transition: 'all 0.3s' }}>
                  <Typography variant="span" component="span">💰</Typography>
                  <Typography variant="span" component="span">5.6K</Typography>
                </Box>
              </GameStats>
            </GameCard>
          ))}
        </GameGrid>
      </Content>
    </MainLayout>
  );
}

export default MainPage;
