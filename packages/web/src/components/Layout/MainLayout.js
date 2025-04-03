import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import styled, { keyframes } from 'styled-components';
import { FaHome, FaTrophy, FaUsers, FaGamepad, FaCog, FaDice, FaBomb, FaRocket, 
         FaDharmachakra, FaCoins, FaChartLine, FaPlayCircle, FaChess, FaBuilding,
         FaCircle, FaArrowUp, FaBullseye, FaAngleLeft, FaUser, FaWallet, FaSignOutAlt } from 'react-icons/fa';
import { BiChat } from 'react-icons/bi';

// Animasyonlar
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

const MainContainer = styled.div`
  display: flex;
  background: linear-gradient(135deg, #0f1033 0%, #0a0b1e 100%);
  color: white;
  min-height: 100vh;
  position: relative;
  font-family: 'Poppins', sans-serif;
`;

const Sidebar = styled.div`
  width: 80px;
  background: rgba(30, 32, 68, 0.5);
  backdrop-filter: blur(10px);
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    background: linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    white-space: nowrap;
    letter-spacing: 1px;
    text-align: center;
  }
`;

const MenuSection = styled.div`
  margin-bottom: 20px;

  h3 {
    color: #6B7280;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 10px;
    text-align: center;
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  color: ${props => props.$active ? '#4a7dff' : 'rgba(255, 255, 255, 0.5)'};
  background: ${props => props.$active ? 'rgba(74, 125, 255, 0.1)' : 'transparent'};
  position: relative;

  &:hover {
    background: rgba(74, 125, 255, 0.1);
    color: #4a7dff;
    transform: translateX(5px);
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 5px;
    width: ${props => props.$active ? '3px' : '0'};
    height: 70%;
    background: linear-gradient(90deg, #4a7dff 0%, #ff53f0 100%);
    border-radius: 0 3px 3px 0;
    transition: all 0.3s;
  }

  &:hover::after {
    width: 3px;
  }

  .icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  height: 70px;
  background: rgba(30, 32, 68, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 5;
  animation: ${fadeIn} 0.5s ease;
`;

const NavMenu = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  position: relative;
  background: ${props => props.$active ? 'rgba(124, 77, 255, 0.1)' : 'transparent'};

  &:hover {
    color: white;
    background: rgba(124, 77, 255, 0.1);
  }

  &.active {
    color: white;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, #4a7dff 0%, #ff53f0 100%);
      border-radius: 2px;
    }
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #4a7dff 0%, #ff53f0 100%);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Balance = styled.div`
  background: rgba(74, 125, 255, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  border: 1px solid rgba(74, 125, 255, 0.3);
  transition: all 0.3s;
  backdrop-filter: blur(5px);

  &:hover {
    border-color: #4a7dff;
    transform: translateY(-2px);
  }

  .amount {
    color: #4a7dff;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 9999;

  img {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    border: 2px solid rgba(124, 77, 255, 0.3);
    transition: all 0.3s ease;

    &:hover {
      border-color: #4a7dff;
      transform: scale(1.05);
    }
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const ProfileMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 200px;
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 99999;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 5px;
  animation: ${fadeIn} 0.3s ease;
`;

const ProfileMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;

  &:hover {
    background: rgba(124, 77, 255, 0.1);
    color: white;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #4a7dff 0%, #ff53f0 100%);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }

  svg {
    color: #4a7dff;
  }

  &.logout {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: 8px;
    padding-top: 12px;
    color: #ff5353;

    svg {
      color: #ff5353;
    }

    &:hover {
      background: rgba(255, 83, 83, 0.1);
    }

    &:hover::after {
      background: linear-gradient(90deg, #ff5353 0%, #ff8f53 100%);
    }
  }
`;

const ChatToggleButton = styled.button`
  position: fixed;
  right: ${props => props.$isOpen ? '320px' : '20px'};
  bottom: 20px;
  background: rgba(30, 32, 68, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 125, 255, 0.3);
  color: #4a7dff;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(74, 125, 255, 0.1);
    transform: scale(1.05);
    border-color: #4a7dff;
  }

  svg {
    transition: transform 0.3s;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const ChatSidebar = styled.div`
  width: ${props => props.$isOpen ? '300px' : '0'};
  background: rgba(30, 32, 68, 0.7);
  backdrop-filter: blur(10px);
  padding: ${props => props.$isOpen ? '20px' : '0'};
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  transition: all 0.3s;
  overflow: hidden;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;

  h3 {
    font-size: 1.2rem;
    font-weight: 500;
    color: white;
  }

  .online-count {
    background: rgba(255, 59, 59, 0.1);
    color: #FF3B3B;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const ChatMessages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(124, 77, 255, 0.3);
    border-radius: 3px;
  }
`;

const ChatMessage = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(26, 27, 38, 0.5);
  transition: all 0.3s;

  &:hover {
    background: rgba(74, 125, 255, 0.1);
    transform: translateX(5px);
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid rgba(74, 125, 255, 0.3);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .message-content {
    flex: 1;

    .user-name {
      font-size: 0.95rem;
      font-weight: 500;
      color: #4a7dff;
      margin-bottom: 4px;
    }

    .message-text {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.4;
    }
  }
`;

const ChatInput = styled.div`
  position: relative;
  z-index: 1;
  margin-top: auto;

  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px 15px;
    color: white;
    font-size: 0.95rem;
    transition: all 0.3s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    &:focus {
      outline: none;
      border-color: rgba(255, 59, 59, 0.5);
      background: rgba(255, 255, 255, 0.08);
    }
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #0B0E17;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #151921;
  }

  &::-webkit-scrollbar-thumb {
    background: #1F2937;
    border-radius: 3px;
  }
`;

function MainLayout({ children }) {
  const { user, logout, checkAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('games');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Sayfa yüklendiğinde kullanıcı bilgilerini yenile
  useEffect(() => {
    checkAuth();
  }, []);
  
  // URL'e göre aktif menüyü belirle
  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/games/')) {
      const gameId = path.split('/games/')[1];
      setActiveMenu(gameId);
    } else if (path === '/home' || path === '/') {
      setActiveMenu('games');
    } else {
      // /leaderboard, /lobbies, /profile, /settings gibi sayfalar için
      const route = path.substring(1); // başındaki / işaretini kaldır
      setActiveMenu(route);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (route) => {
    setActiveMenu(route);
    if (games.find(game => game.id === route)) {
      navigate(`/games/${route}`);
    } else if (route === 'games') {
      navigate('/home');
    } else {
      navigate(`/${route}`);
    }
  };

  const games = [
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
  ];

  const gameIcons = {
    bingo: FaCircle,
    mines: FaBomb,
    crash: FaRocket,
    wheel: FaDharmachakra,
    dice: FaDice,
    coinflip: FaCoins,
    hilo: FaChartLine,
    blackjack: FaPlayCircle,
    tower: FaBuilding,
    roulette: FaCircle,
    stairs: FaArrowUp,
    keno: FaBullseye
  };

  return (
    <MainContainer>
      <Sidebar>
        <Logo>
          <span>
            Game<br/>Center
          </span>
        </Logo>
        <MenuSection>
          <h3>Games</h3>
          {games.map(game => (
            <MenuItem 
              key={game.id}
              $active={activeMenu === game.id}
              onClick={() => handleNavClick(game.id)}
            >
              <div className="icon">
                {React.createElement(gameIcons[game.id], { size: 24 })}
              </div>
            </MenuItem>
          ))}
        </MenuSection>
      </Sidebar>

      <MainContent>
        <TopBar>
          <NavMenu>
            <NavLink 
              className={activeMenu === 'games' ? 'active' : ''} 
              $active={activeMenu === 'games'}
              onClick={() => handleNavClick('games')}
            >
              Oyunlar
            </NavLink>
            <NavLink 
              className={activeMenu === 'leaderboard' ? 'active' : ''} 
              $active={activeMenu === 'leaderboard'}
              onClick={() => handleNavClick('leaderboard')}
            >
              Sıralama
            </NavLink>
            <NavLink 
              className={activeMenu === 'lobbies' ? 'active' : ''} 
              $active={activeMenu === 'lobbies'}
              onClick={() => handleNavClick('lobbies')}
            >
              Lobiler
            </NavLink>
            <NavLink 
              className={activeMenu === 'profile' ? 'active' : ''} 
              $active={activeMenu === 'profile'}
              onClick={() => handleNavClick('profile')}
            >
              Profil
            </NavLink>
            <NavLink 
              className={activeMenu === 'settings' ? 'active' : ''} 
              $active={activeMenu === 'settings'}
              onClick={() => handleNavClick('settings')}
            >
              Ayarlar
            </NavLink>
          </NavMenu>

          <UserSection>
            <Balance>
              <span>🪙</span>
              <span className="amount">{user?.balance || 0}</span>
            </Balance>
            <UserInfo>
              <img 
                src={user?.profileImage}
                alt="Profile"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40"><rect width="100" height="100" fill="#1F2937"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + (user?.username?.[0] || 'U') + '</text></svg>')}`;
                }}
              />
              <div style={{ position: 'relative' }}>
                <ProfileMenu $isOpen={isProfileMenuOpen}>
                  <ProfileMenuItem onClick={() => handleNavClick('profile')}>
                    <FaUser size={16} />
                    <span>Profilim</span>
                  </ProfileMenuItem>
                  <ProfileMenuItem onClick={() => handleNavClick('settings')}>
                    <FaCog size={16} />
                    <span>Ayarlar</span>
                  </ProfileMenuItem>
                  <ProfileMenuItem onClick={() => handleNavClick('wallet')}>
                    <FaWallet size={16} />
                    <span>Cüzdan</span>
                  </ProfileMenuItem>
                  <ProfileMenuItem className="logout" onClick={handleLogout}>
                    <FaSignOutAlt size={16} />
                    <span>Çıkış Yap</span>
                  </ProfileMenuItem>
                </ProfileMenu>
              </div>
            </UserInfo>
          </UserSection>
        </TopBar>

        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>

      <ChatToggleButton 
        $isOpen={isChatOpen} 
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <BiChat size={24} />
      </ChatToggleButton>

      <ChatSidebar $isOpen={isChatOpen}>
        <ChatHeader>
          <BiChat size={24} color="#4a7dff" />
          <h3>Online Sohbet</h3>
          <span className="online-count">1857</span>
        </ChatHeader>

        <ChatMessages>
          <ChatMessage>
            <div className="avatar">
              <img src="https://i.pravatar.cc/150?img=1" alt="User avatar" />
            </div>
            <div className="message-content">
              <div className="user-name">Darlene Robertson</div>
              <div className="message-text">A casino is a facility for certain types of gambling.</div>
            </div>
          </ChatMessage>

          <ChatMessage>
            <div className="avatar">
              <img src="https://i.pravatar.cc/150?img=2" alt="User avatar" />
            </div>
            <div className="message-content">
              <div className="user-name">Jane Cooper</div>
              <div className="message-text">Life always starts the morning with a cup of coffee.</div>
            </div>
          </ChatMessage>

          <ChatMessage>
            <div className="avatar">
              <img src="https://i.pravatar.cc/150?img=3" alt="User avatar" />
            </div>
            <div className="message-content">
              <div className="user-name">Ralph Edwards</div>
              <div className="message-text">The sun is shining brightly in the sky today.</div>
            </div>
          </ChatMessage>
        </ChatMessages>

        <ChatInput>
          <input type="text" placeholder="Mesajınızı yazın..." />
        </ChatInput>
      </ChatSidebar>
    </MainContainer>
  );
}

export default MainLayout; 