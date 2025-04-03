import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaUsers, FaLock, FaCalendarAlt, FaCoins, FaGamepad } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import { Button } from '@mui/material';
import { theme } from '../styles/theme';
import { Settings as SettingsIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';

const PageContainer = styled.div`
  color: white;
  padding: 40px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: ${theme.palette.text.primary};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ManageButton = styled(Button)`
  && {
    background-color: ${theme.palette.secondary.main};
    color: white;
    &:hover {
      background-color: ${theme.palette.secondary.dark};
    }
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 10px;
  flex: 1;
  max-width: 600px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4a7dff;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterButton = styled(Button)`
  && {
    background: rgba(124, 77, 255, 0.1);
    color: #7C4DFF;
    padding: 12px 20px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;

    &:hover {
      background: rgba(124, 77, 255, 0.2);
    }
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  background: ${props => props.active ? '#7C4DFF' : 'rgba(124, 77, 255, 0.1)'};
  color: ${props => props.active ? 'white' : '#7C4DFF'};
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.active ? '#6236FF' : 'rgba(124, 77, 255, 0.2)'};
  }
`;

const LobbiesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const LobbyCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const LobbyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const LobbyTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: white;
`;

const GameBadge = styled.div`
  background: rgba(124, 77, 255, 0.1);
  color: #7C4DFF;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LobbyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;

  svg {
    color: #7C4DFF;
  }
`;

const NoLobbies = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
`;

// Tarih formatlama fonksiyonu
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Geri sayım hesaplama fonksiyonu
const getCountdown = (dateString) => {
  const targetDate = new Date(dateString);
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff <= 0) return null;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}s ${minutes}dk`;
};

// Etkinlik durumu bileşeni
const EventStatus = styled.div`
  background: ${props => {
    if (props.status === 'waiting') return 'rgba(255, 193, 7, 0.1)';
    if (props.status === 'playing') return 'rgba(76, 175, 80, 0.1)';
    return 'rgba(244, 67, 54, 0.1)';
  }};
  color: ${props => {
    if (props.status === 'waiting') return '#FFC107';
    if (props.status === 'playing') return '#4CAF50';
    return '#F44336';
  }};
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

// Geri sayım bileşeni
const Countdown = styled.div`
  background: rgba(255, 193, 7, 0.1);
  color: #FFC107;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 1;
    }
  }
`;

function LobbiesPage() {
  const navigate = useNavigate();
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    all: true,
    public: false,
    private: false,
    events: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLobbies();
  }, []);

  const fetchLobbies = async () => {
    try {
      const response = await axiosInstance.get('/lobbies');
      console.log('Gelen lobi yanıtı:', response.data);
      // API yanıtı { lobbies: [...], total, hasMore } formatında
      const lobbiesData = response.data.lobbies || [];
      setLobbies(lobbiesData);
    } catch (error) {
      console.error('Lobiler yüklenirken hata:', error);
      setLobbies([]); // Hata durumunda boş array
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName) => {
    if (filterName === 'all') {
      setFilters({
        all: true,
        public: false,
        private: false,
        events: false,
      });
    } else {
      setFilters({
        ...filters,
        all: false,
        [filterName]: !filters[filterName],
      });
    }
  };

  const filteredLobbies = lobbies.filter(lobby => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!lobby.name.toLowerCase().includes(searchLower) &&
          !lobby.game.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (filters.all) return true;

    if (filters.public && !lobby.isPrivate) return true;
    if (filters.private && lobby.isPrivate) return true;
    if (filters.events && lobby.isEventLobby) return true;

    return false;
  });

  const handleJoinLobby = (lobby) => {
    navigate(`/join/lobby/${lobby.lobbyCode}`);
  };

  const renderLobbyCards = () => {
    if (loading) {
      return <NoLobbies>Lobiler yükleniyor...</NoLobbies>;
    }

    if (filteredLobbies.length === 0) {
      return <NoLobbies>Aktif lobi bulunamadı</NoLobbies>;
    }

    return filteredLobbies.map(lobby => (
      <LobbyCard key={lobby._id} onClick={() => handleJoinLobby(lobby)}>
        <LobbyHeader>
          <LobbyTitle>{lobby.name}</LobbyTitle>
          <GameBadge>
            <FaGamepad size={12} />
            {lobby.game}
          </GameBadge>
        </LobbyHeader>

        <LobbyInfo>
          <InfoRow>
            <FaUsers size={14} />
            {lobby.players.length}/{lobby.maxPlayers} Oyuncu
          </InfoRow>
          
          {lobby.betAmount > 0 && (
            <InfoRow>
              <FaCoins size={14} />
              {lobby.betAmount} Jeton
            </InfoRow>
          )}
          
          {lobby.isPrivate && (
            <InfoRow>
              <FaLock size={14} />
              Özel Lobi
            </InfoRow>
          )}
          
          {lobby.isEventLobby && lobby.eventDetails && (
            <>
              <InfoRow>
                <FaCalendarAlt size={14} />
                Etkinlik Lobisi
              </InfoRow>
              
              {lobby.eventDetails.startDate && (
                <InfoRow>
                  <FaCalendarAlt size={14} />
                  Başlangıç: {formatDate(lobby.eventDetails.startDate)}
                </InfoRow>
              )}
              
              {lobby.status === 'waiting' && lobby.eventDetails.startDate && (
                (() => {
                  const now = new Date();
                  const startDate = new Date(lobby.eventDetails.startDate);
                  const diff = startDate - now;
                  const lessThan24Hours = diff > 0 && diff < 24 * 60 * 60 * 1000;
                  
                  if (lessThan24Hours) {
                    return (
                      <Countdown>
                        <FaCalendarAlt size={14} />
                        Başlamasına: {getCountdown(lobby.eventDetails.startDate)}
                      </Countdown>
                    );
                  }
                  return null;
                })()
              )}
              
              <EventStatus status={lobby.status}>
                {lobby.status === 'waiting' ? 'Bekliyor' : 
                 lobby.status === 'playing' ? 'Aktif' : 'Tamamlandı'}
              </EventStatus>
            </>
          )}
        </LobbyInfo>
      </LobbyCard>
    ));
  };

  return (
    <MainLayout>
      <PageContainer>
        <Header>
          <Title>Lobiler</Title>
          <HeaderActions>
            <ManageButton 
              variant="contained" 
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/lobbies/manage')}
            >
              Lobilerimi Yönet
            </ManageButton>
          </HeaderActions>
        </Header>

        <SearchBar>
          <SearchInput 
            type="text" 
            placeholder="Lobi adı veya oyun ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterButton 
            variant="contained" 
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtrele
          </FilterButton>
        </SearchBar>

        {showFilters && (
          <FiltersContainer>
            <FilterChip 
              active={filters.all} 
              onClick={() => handleFilterChange('all')}
            >
              Tümü
            </FilterChip>
            <FilterChip 
              active={filters.public} 
              onClick={() => handleFilterChange('public')}
            >
              <FaUsers size={12} />
              Açık Lobiler
            </FilterChip>
            <FilterChip 
              active={filters.private} 
              onClick={() => handleFilterChange('private')}
            >
              <FaLock size={12} />
              Özel Lobiler
            </FilterChip>
            <FilterChip 
              active={filters.events} 
              onClick={() => handleFilterChange('events')}
            >
              <FaCalendarAlt size={12} />
              Etkinlikler
            </FilterChip>
          </FiltersContainer>
        )}

        <LobbiesList>
          {renderLobbyCards()}
        </LobbiesList>
      </PageContainer>
    </MainLayout>
  );
}

export default LobbiesPage; 