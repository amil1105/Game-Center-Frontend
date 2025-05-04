import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaUsers, FaLock, FaCalendarAlt, FaCoins, FaGamepad, FaCrown, FaStar } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import { 
  Button, 
  Box, 
  Typography, 
  InputBase, 
  Card, 
  CardContent, 
  Chip, 
  Skeleton, 
  Fade, 
  Grow,
  Divider,
  Badge,
  IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { theme } from '../styles/theme';
import { 
  Settings as SettingsIcon, 
  FilterList as FilterListIcon, 
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import MainLayout from '../components/Layout/MainLayout';

const PageContainer = styled(Box)`
  color: white;
  padding: 40px 20px;
  max-width: 1600px;
  margin: 0 auto;
  
  @media (max-width: 600px) {
    padding: 20px 16px;
  }
`;

const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled(Typography)`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.palette.text.primary};
  margin: 0;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #7C4DFF, #4A7DFF);
    border-radius: 4px;
  }
`;

const HeaderActions = styled(Box)`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const CreateButton = styled(Button)`
  && {
    background: linear-gradient(45deg, #7C4DFF, #4A7DFF);
    color: white;
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(124, 77, 255, 0.2);
    
    &:hover {
      background: linear-gradient(45deg, #6236FF, #3A6AE8);
      box-shadow: 0 6px 16px rgba(124, 77, 255, 0.3);
      transform: translateY(-2px);
    }
  }
`;

const ManageButton = styled(Button)`
  && {
    background-color: ${alpha(theme.palette.secondary.main, 0.1)};
    color: ${theme.palette.secondary.main};
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 600;
    border: 1px solid ${alpha(theme.palette.secondary.main, 0.2)};
    
    &:hover {
      background-color: ${alpha(theme.palette.secondary.main, 0.2)};
    }
  }
`;

const SearchFilterContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  background: ${alpha('#2A2C4E', 0.5)};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${alpha(theme.palette.primary.main, 0.1)};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
`;

const SearchBar = styled(Box)`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
`;

const SearchInput = styled(InputBase)`
  flex: 1;
  background: ${alpha(theme.palette.background.paper, 0.1)};
  border: 1px solid ${alpha(theme.palette.primary.main, 0.1)};
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  & .MuiInputBase-input {
    padding: 0;
  }

  &.Mui-focused {
    border-color: #4a7dff;
    box-shadow: 0 0 0 3px ${alpha('#4a7dff', 0.2)};
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SearchIcon = styled(Box)`
  color: ${alpha(theme.palette.text.primary, 0.5)};
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

const FilterButton = styled(Button)`
  && {
    background: ${alpha('#7C4DFF', 0.1)};
    color: #7C4DFF;
    padding: 12px 20px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
    min-width: 120px;

    &:hover {
      background: ${alpha('#7C4DFF', 0.2)};
    }
  }
`;

const RefreshButtonWrapper = styled(Box)`
  display: flex;
  justify-content: flex-end;
  margin: -8px 0 16px;
`;

const FiltersContainer = styled(Box)`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid ${alpha(theme.palette.divider, 0.1)};
`;

const FilterChip = styled(Chip)`
  background: ${props => props.active ? 'linear-gradient(45deg, #7C4DFF, #4A7DFF)' : alpha('#7C4DFF', 0.1)};
  color: ${props => props.active ? 'white' : '#7C4DFF'};
  border-radius: 20px;
  padding: 4px;
  transition: all 0.3s;
  font-weight: ${props => props.active ? '600' : '400'};
  border: 1px solid ${props => props.active ? 'transparent' : alpha('#7C4DFF', 0.2)};
  box-shadow: ${props => props.active ? '0 4px 12px rgba(124, 77, 255, 0.2)' : 'none'};

  .MuiChip-label {
    padding: 0 12px;
  }

  &:hover {
    background: ${props => props.active ? 'linear-gradient(45deg, #6236FF, #3A6AE8)' : alpha('#7C4DFF', 0.2)};
    transform: ${props => props.active ? 'translateY(-2px)' : 'none'};
  }
`;

const LobbiesList = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const LobbyCard = styled(Card)`
  && {
    background: ${alpha('#2A2C4E', 0.5)};
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    border: 1px solid ${alpha(theme.palette.primary.main, 0.1)};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    height: 100%;
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      border-color: ${alpha(theme.palette.primary.main, 0.3)};
      
      .hover-effect {
        opacity: 1;
      }
    }
    
    ${props => props.isFeatured && `
      border: 2px solid ${alpha('#FFD700', 0.5)};
      box-shadow: 0 8px 24px rgba(255, 215, 0, 0.15);
      
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #FFC107, #FFD700);
      }
    `}
  }
`;

const EventBadge = styled(Box)`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
`;

const LobbyCardContent = styled(CardContent)`
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const LobbyHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const LobbyTitle = styled(Typography)`
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin-right: 12px;
  flex: 1;
`;

const GameBadge = styled(Chip)`
  && {
    background: ${alpha('#7C4DFF', 0.1)};
    color: #7C4DFF;
    border-radius: 8px;
    height: auto;
    padding: 4px 2px;
    font-size: 0.8rem;
    border: 1px solid ${alpha('#7C4DFF', 0.2)};
    
    .MuiChip-label {
      padding: 0 8px 0 4px;
    }
    
    .MuiChip-icon {
      margin-left: 6px;
      color: #7C4DFF;
    }
  }
`;

const LobbyInfo = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
`;

const LobbyDivider = styled(Divider)`
  && {
    margin: 12px 0;
    background-color: ${alpha(theme.palette.divider, 0.1)};
  }
`;

const InfoRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${alpha(theme.palette.text.primary, 0.8)};
  font-size: 0.9rem;

  svg {
    color: #7C4DFF;
  }
`;

const JoinButton = styled(Button)`
  && {
    margin-top: 20px;
    background: linear-gradient(45deg, #7C4DFF, #4A7DFF);
    color: white;
    border-radius: 12px;
    padding: 10px 0;
    font-weight: 600;
    transition: all 0.3s;
    opacity: 0;
    transform: translateY(10px);
    
    &.hover-effect {
      opacity: 0;
      transition: all 0.3s ease;
    }
  }
`;

const FeatureBadge = styled(Box)`
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(45deg, #FFC107, #FFD700);
  color: #000;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  z-index: 2;
`;

const NoLobbies = styled(Box)`
  text-align: center;
  padding: 60px 20px;
  background: ${alpha('#2A2C4E', 0.3)};
  border-radius: 16px;
  color: ${alpha(theme.palette.text.primary, 0.7)};
  border: 1px dashed ${alpha(theme.palette.divider, 0.3)};
  grid-column: 1 / -1;
`;

const NoLobbiesText = styled(Typography)`
  font-size: 1.2rem;
  margin-bottom: 16px;
`;

const NoLobbiesSubText = styled(Typography)`
  font-size: 0.9rem;
  color: ${alpha(theme.palette.text.primary, 0.5)};
  margin-bottom: 24px;
`;

// Etkinlik durumu bileşeni
const EventStatus = styled(Chip)`
  && {
    background: ${props => {
      if (props.status === 'waiting') return alpha('#FFC107', 0.1);
      if (props.status === 'playing') return alpha('#4CAF50', 0.1);
      return alpha('#F44336', 0.1);
    }};
    color: ${props => {
      if (props.status === 'waiting') return '#FFC107';
      if (props.status === 'playing') return '#4CAF50';
      return '#F44336';
    }};
    border: 1px solid ${props => {
      if (props.status === 'waiting') return alpha('#FFC107', 0.3);
      if (props.status === 'playing') return alpha('#4CAF50', 0.3);
      return alpha('#F44336', 0.3);
    }};
    height: auto;
    font-size: 0.8rem;
    margin-top: 8px;
    border-radius: 8px;
    
    .MuiChip-label {
      padding: 2px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

// Geri sayım bileşeni
const Countdown = styled(Chip)`
  && {
    background: ${alpha('#FFC107', 0.1)};
    color: #FFC107;
    height: auto;
    font-size: 0.8rem;
    margin-top: 8px;
    animation: pulse 2s infinite;
    border: 1px solid ${alpha('#FFC107', 0.3)};
    border-radius: 8px;
    
    .MuiChip-label {
      padding: 2px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
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
  }
`;

const LobbyBackground = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isEvent ? 
    `linear-gradient(135deg, ${alpha('#7C4DFF', 0.3)}, ${alpha('#4A7DFF', 0.1)})` : 
    'transparent'
  };
  z-index: 0;
  pointer-events: none;
`;

const LoadingSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <Card key={item} sx={{ 
        background: alpha('#2A2C4E', 0.5), 
        borderRadius: '16px',
        height: '100%',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}>
        <CardContent sx={{ padding: '24px', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ bgcolor: alpha('#fff', 0.1) }} />
            <Skeleton variant="rectangular" width="30%" height={24} sx={{ bgcolor: alpha('#fff', 0.1), borderRadius: '8px' }} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="text" width="100%" height={24} sx={{ bgcolor: alpha('#fff', 0.1) }} />
            <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1, bgcolor: alpha('#fff', 0.1) }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1, bgcolor: alpha('#fff', 0.1) }} />
          </Box>
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={42} sx={{ bgcolor: alpha('#fff', 0.1), borderRadius: '12px', mt: 2 }} />
          </Box>
        </CardContent>
      </Card>
    ))}
  </>
);

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
    setLoading(true);
    try {
      const response = await axiosInstance.get('/lobbies');
      console.log('Gelen lobi yanıtı:', response.data);
      // API yanıtı { lobbies: [...], total, hasMore } formatında
      const lobbiesData = response.data.lobbies || [];
      
      // Bir miktar gecikme ekleyelim ki animasyonları görebilelim
      setTimeout(() => {
        setLobbies(lobbiesData);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Lobiler yüklenirken hata:', error);
      setLobbies([]); // Hata durumunda boş array
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

  const handleRefresh = () => {
    fetchLobbies();
  };

  const renderLobbyCards = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    if (filteredLobbies.length === 0) {
      return (
        <NoLobbies>
          <NoLobbiesText variant="h6">Aktif lobi bulunamadı</NoLobbiesText>
          <NoLobbiesSubText variant="body2">
            Yeni bir lobi oluşturabilir veya filtrelerinizi değiştirebilirsiniz
          </NoLobbiesSubText>
          <CreateButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/games/bingo')}
          >
            Yeni Lobi Oluştur
          </CreateButton>
        </NoLobbies>
      );
    }

    return filteredLobbies.map((lobby, index) => (
      <Grow
        in={true}
        style={{ transformOrigin: '0 0 0' }}
        timeout={(index % 6) * 100 + 300}
        key={lobby._id}
      >
        <LobbyCard 
          onClick={() => handleJoinLobby(lobby)} 
          isFeatured={lobby.isEventLobby && lobby.status === 'waiting'}
        >
          <LobbyBackground $isEvent={lobby.isEventLobby} />
          
          {lobby.isEventLobby && lobby.status === 'waiting' && (
            <FeatureBadge>
              <FaCrown size={12} /> Özel Etkinlik
            </FeatureBadge>
          )}
          
          <LobbyCardContent>
            <LobbyHeader>
              <LobbyTitle variant="h3">{lobby.name}</LobbyTitle>
              <GameBadge
                icon={<FaGamepad size={14} />}
                label={lobby.game}
              />
            </LobbyHeader>

            <LobbyInfo>
              <InfoRow>
                <FaUsers size={16} />
                <Typography variant="body2">
                  {lobby.players.length}/{lobby.maxPlayers} Oyuncu
                </Typography>
              </InfoRow>
              
              {lobby.betAmount > 0 && (
                <InfoRow>
                  <FaCoins size={16} />
                  <Typography variant="body2">
                    {lobby.betAmount} Jeton
                  </Typography>
                </InfoRow>
              )}
              
              {lobby.isPrivate && (
                <InfoRow>
                  <FaLock size={16} />
                  <Typography variant="body2">
                    Özel Lobi
                  </Typography>
                </InfoRow>
              )}
              
              {lobby.isEventLobby && lobby.eventDetails && (
                <>
                  <LobbyDivider />
                  <InfoRow>
                    <FaCalendarAlt size={16} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Etkinlik Lobisi
                    </Typography>
                  </InfoRow>
                  
                  {lobby.eventDetails.startDate && (
                    <InfoRow>
                      <FaCalendarAlt size={16} />
                      <Typography variant="body2">
                        Başlangıç: {formatDate(lobby.eventDetails.startDate)}
                      </Typography>
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
                          <Countdown
                            icon={<FaCalendarAlt size={14} />}
                            label={`Başlamasına: ${getCountdown(lobby.eventDetails.startDate)}`}
                          />
                        );
                      }
                      return null;
                    })()
                  )}
                  
                  <EventStatus 
                    status={lobby.status}
                    icon={
                      lobby.status === 'waiting' ? <FaUsers size={14} /> : 
                      lobby.status === 'playing' ? <FaGamepad size={14} /> : 
                      <FaStar size={14} />
                    }
                    label={
                      lobby.status === 'waiting' ? 'Bekliyor' : 
                      lobby.status === 'playing' ? 'Aktif' : 'Tamamlandı'
                    }
                  />
                </>
              )}
            </LobbyInfo>
            
            <JoinButton
              variant="contained"
              fullWidth
              className="hover-effect"
            >
              Lobiye Katıl
            </JoinButton>
          </LobbyCardContent>
        </LobbyCard>
      </Grow>
    ));
  };

  return (
    <MainLayout>
      <PageContainer>
        <Header>
          <Title variant="h1">Lobiler</Title>
          <HeaderActions>
            <CreateButton 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/games/bingo')}
            >
              Lobi Oluştur
            </CreateButton>
            <ManageButton 
              variant="outlined" 
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/lobbies/manage')}
            >
              Lobilerimi Yönet
            </ManageButton>
          </HeaderActions>
        </Header>

        <SearchFilterContainer>
          <SearchBar>
            <SearchInput 
              placeholder="Lobi adı veya oyun ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              startAdornment={<SearchIcon><FaSearch size={16} /></SearchIcon>}
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
            <Fade in={showFilters}>
              <FiltersContainer>
                <FilterChip 
                  active={filters.all} 
                  onClick={() => handleFilterChange('all')}
                  label="Tümü"
                />
                <FilterChip 
                  active={filters.public} 
                  onClick={() => handleFilterChange('public')}
                  icon={<FaUsers size={12} />}
                  label="Açık Lobiler"
                />
                <FilterChip 
                  active={filters.private} 
                  onClick={() => handleFilterChange('private')}
                  icon={<FaLock size={12} />}
                  label="Özel Lobiler"
                />
                <FilterChip 
                  active={filters.events} 
                  onClick={() => handleFilterChange('events')}
                  icon={<FaCalendarAlt size={12} />}
                  label="Etkinlikler"
                />
              </FiltersContainer>
            </Fade>
          )}
        </SearchFilterContainer>

        <RefreshButtonWrapper>
          <IconButton onClick={handleRefresh} size="small" sx={{ color: alpha('#fff', 0.7) }}>
            <RefreshIcon />
          </IconButton>
        </RefreshButtonWrapper>

        <LobbiesList>
          {renderLobbyCards()}
        </LobbiesList>
      </PageContainer>
    </MainLayout>
  );
}

export default LobbiesPage; 