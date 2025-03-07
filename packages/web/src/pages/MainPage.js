// src/pages/MainPage.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import styled from 'styled-components';
import { FaHome, FaTrophy, FaUsers, FaGamepad, FaCog } from 'react-icons/fa';
import { BiChat } from 'react-icons/bi';

const MainContainer = styled.div`
  display: flex;
  background-color: #0a0b1e;
  color: white;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 80px;
  background-color: #12132d;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 30px;
`;

const GameGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const GameCard = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    
    &::after {
      opacity: 1;
    }
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(74,125,255,0.1) 0%, rgba(74,125,255,0) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
`;

const GameImage = styled.div`
  width: 100%;
  height: 150px;
  background-color: #1a1b38;
  border-radius: 10px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
`;

const GameTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #fff;
`;

const GameDescription = styled.p`
  font-size: 0.9rem;
  color: #6c7293;
  margin-bottom: 15px;
`;

const PlayButton = styled.button`
  background-color: #4a7dff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3d6ae8;
  }
`;

const ChatSidebar = styled.div`
  width: 300px;
  background-color: #12132d;
  padding: 20px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? '#4a7dff' : '#6c7293'};
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s;

  &:hover {
    color: #4a7dff;
    background-color: rgba(74, 125, 255, 0.1);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
`;

const Balance = styled.div`
  background-color: #1e2044;
  padding: 8px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

function MainPage() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('home');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    switch(menu) {
      case 'home':
        navigate('/home');
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'profile':
        // Profile sayfası henüz hazır değil
        break;
      case 'games':
        // Oyunlar sayfası henüz hazır değil
        break;
      case 'settings':
        // Ayarlar sayfası henüz hazır değil
        break;
      default:
        break;
    }
  };

  const games = [
    { 
      id: 'bingo', 
      title: 'Tombala', 
      description: 'Klasik Türk Tombalası',
      icon: '🎯',
      isActive: true
    },
    { 
      id: 'pvp', 
      title: 'PvP Game', 
      description: 'Rekabetçi oyun modu',
      icon: '⚔️',
      isActive: false
    },
    { 
      id: 'roulette', 
      title: 'Rulet', 
      description: 'Klasik kumar oyunu',
      icon: '🎲',
      isActive: false
    },
    { 
      id: 'jackpot', 
      title: 'Jackpot', 
      description: 'Büyük ödül şansı',
      icon: '🎰',
      isActive: false
    },
    { 
      id: 'slots', 
      title: 'Slots', 
      description: 'Slot makinesi oyunları',
      icon: '7️⃣',
      isActive: false
    },
    { 
      id: 'crash', 
      title: 'Crash', 
      description: 'Heyecan verici crash oyunu',
      icon: '📈',
      isActive: false
    }
  ];

  const handleGameClick = (gameId) => {
    navigate(`/games/${gameId}`);
  };

  return (
    <MainContainer>
      <Sidebar>
        <IconButton 
          active={activeMenu === 'home'} 
          onClick={() => handleMenuClick('home')}
        >
          <FaHome />
        </IconButton>
        <IconButton 
          active={activeMenu === 'leaderboard'} 
          onClick={() => handleMenuClick('leaderboard')}
        >
          <FaTrophy />
        </IconButton>
        <IconButton 
          active={activeMenu === 'profile'} 
          onClick={() => handleMenuClick('profile')}
        >
          <FaUsers />
        </IconButton>
        <IconButton 
          active={activeMenu === 'games'} 
          onClick={() => handleMenuClick('games')}
        >
          <FaGamepad />
        </IconButton>
        <IconButton 
          active={activeMenu === 'settings'} 
          onClick={() => handleMenuClick('settings')}
        >
          <FaCog />
        </IconButton>
      </Sidebar>

      <Content>
        <Header>
          <UserInfo>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="avatar" />
            <div>
              <h3>{user?.email}</h3>
            </div>
          </UserInfo>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Balance>
              <span>🪙</span>
              <span>1000</span>
            </Balance>
            <button onClick={handleLogout} style={{ 
              padding: '8px 16px', 
              borderRadius: '20px',
              background: '#4a7dff',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}>
              Çıkış Yap
            </button>
          </div>
        </Header>

        <GameGrid>
          {games.map(game => (
            <GameCard 
              key={game.id} 
              onClick={() => handleGameClick(game.id)}
              style={{
                opacity: game.isActive ? 1 : 0.5,
                cursor: game.isActive ? 'pointer' : 'not-allowed'
              }}
            >
              <GameImage>
                {game.icon}
              </GameImage>
              <GameTitle>{game.title}</GameTitle>
              <GameDescription>{game.description}</GameDescription>
              <PlayButton disabled={!game.isActive}>
                {game.isActive ? 'Oyna' : 'Yakında'}
              </PlayButton>
            </GameCard>
          ))}
        </GameGrid>
      </Content>

      <ChatSidebar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <BiChat size={24} />
          <h3>Online Sohbet</h3>
        </div>
        <div style={{ color: '#6c7293' }}>
          Henüz mesaj yok...
        </div>
      </ChatSidebar>
    </MainContainer>
  );
}

export default MainPage;
