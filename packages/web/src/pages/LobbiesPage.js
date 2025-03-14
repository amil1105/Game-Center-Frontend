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

  return (
    <MainLayout>
      <PageContainer>
        <Header>
          <Title>Aktif Lobiler</Title>
          <HeaderActions>
            <ManageButton
              variant="contained"
              onClick={() => navigate('/lobbies/manage')}
              startIcon={<SettingsIcon />}
            >
              Lobilerimi Yönet
            </ManageButton>
            <FilterButton
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
            >
              Filtreler
            </FilterButton>
          </HeaderActions>
        </Header>

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
              <FaUsers />
              Açık Lobiler
            </FilterChip>
            <FilterChip
              active={filters.private}
              onClick={() => handleFilterChange('private')}
            >
              <FaLock />
              Özel Lobiler
            </FilterChip>
            <FilterChip
              active={filters.events}
              onClick={() => handleFilterChange('events')}
            >
              <FaCalendarAlt />
              Etkinlikler
            </FilterChip>
          </FiltersContainer>
        )}

        {loading ? (
          <NoLobbies>Lobiler yükleniyor...</NoLobbies>
        ) : filteredLobbies.length === 0 ? (
          <NoLobbies>Aktif lobi bulunamadı</NoLobbies>
        ) : (
          <LobbiesList>
            {filteredLobbies.map(lobby => (
              <LobbyCard key={lobby._id} onClick={() => handleJoinLobby(lobby)}>
                <LobbyHeader>
                  <LobbyTitle>{lobby.name}</LobbyTitle>
                  <GameBadge>
                    <FaGamepad />
                    {lobby.game}
                  </GameBadge>
                </LobbyHeader>
                <LobbyInfo>
                  <InfoRow>
                    <FaUsers />
                    {lobby.players.length} / {lobby.maxPlayers} Oyuncu
                  </InfoRow>
                  {lobby.betAmount && (
                    <InfoRow>
                      <FaCoins />
                      {lobby.betAmount} Token
                    </InfoRow>
                  )}
                  {lobby.isPrivate && (
                    <InfoRow>
                      <FaLock />
                      Özel Lobi
                    </InfoRow>
                  )}
                  {lobby.isEventLobby && (
                    <InfoRow>
                      <FaCalendarAlt />
                      Etkinlik
                    </InfoRow>
                  )}
                </LobbyInfo>
              </LobbyCard>
            ))}
          </LobbiesList>
        )}
      </PageContainer>
    </MainLayout>
  );
}

export default LobbiesPage; 