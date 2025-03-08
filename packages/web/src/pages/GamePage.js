import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

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

  const fetchLobbies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum açmanız gerekiyor');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/lobbies', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Geçersiz veri formatı');
      }

      setLobbies(response.data);
      setError(null);
    } catch (error) {
      console.error('Lobiler yüklenirken hata:', error);
      if (error.response?.status === 401) {
        setError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('Lobi servisi bulunamadı. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError('Lobiler yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLobby = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return;
      }

      if (!user) {
        toast.error('Kullanıcı bilgileri yüklenemedi');
        return;
      }

      // Kullanıcının aktif lobisi var mı kontrol et
      const response = await axios.get('http://localhost:5000/api/lobbies', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const existingLobby = response.data.find(
        lobby => lobby.creator._id === user._id && lobby.status !== 'finished'
      );

      if (existingLobby) {
        toast.error('Zaten aktif bir lobiniz var');
        return;
      }

      const lobbyData = {
        name: `Lobi ${Math.floor(Math.random() * 1000)}`,
        game: gameId,
        maxPlayers: 2,
        isPrivate: false,
        status: 'waiting'
      };

      const result = await axios.post('http://localhost:5000/api/lobbies', lobbyData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lobi başarıyla oluşturuldu');
      fetchLobbies();
    } catch (error) {
      console.error('Lobi oluşturulurken hata:', error);
      toast.error('Lobi oluşturulurken bir hata oluştu');
    }
  };

  const handleDeleteLobby = async (lobbyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return;
      }

      await axios.delete(`http://localhost:5000/api/lobbies/${lobbyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lobi başarıyla silindi');
      fetchLobbies();
    } catch (error) {
      console.error('Lobi silinirken hata:', error);
      toast.error('Lobi silinirken bir hata oluştu');
    }
  };

  const handleJoinLobby = async (lobbyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return;
      }

      await axios.post(`http://localhost:5000/api/lobbies/${lobbyId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lobiye başarıyla katıldınız');
      fetchLobbies();
    } catch (error) {
      console.error('Lobiye katılırken hata:', error);
      toast.error('Lobiye katılırken bir hata oluştu');
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedGame(tab);
  };

  useEffect(() => {
    // Kullanıcı bilgilerini al
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
      }
    };

    fetchUser();
  }, []);

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
            active={category.id === selectedGame}
            onClick={() => handleTabClick(category.id)}
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