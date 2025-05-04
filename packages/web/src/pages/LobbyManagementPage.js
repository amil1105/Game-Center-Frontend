import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '../context/UserContext';
import { FaEdit, FaTrash, FaClock, FaUsers, FaLock, FaCalendarAlt, FaCoins, FaArrowLeft, FaPlay } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import MainLayout from '../components/Layout/MainLayout';
import { Box, Typography, Button, TextField, Checkbox as MuiCheckbox, FormControlLabel, FormGroup as MuiFormGroup } from '@mui/material';

// Özel stil bileşenleri
const PageContainer = styled(Box)`
  color: white;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const HeaderLeft = styled(Box)`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StyledBackButton = styled(Button)`
  background: rgba(124, 77, 255, 0.1);
  color: #7C4DFF;
  font-size: 20px;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s;
  min-width: auto;
  line-height: 1;

  &:hover {
    background: rgba(124, 77, 255, 0.2);
    transform: translateX(-5px);
  }
`;

const TitleTypography = styled(Typography)`
  font-size: 2rem;
  margin: 0;
`;

const LobbyCard = styled(Box)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const LobbyHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const LobbyInfo = styled(Box)`
  .MuiTypography-h2 {
    font-size: 1.5rem;
    margin: 0 0 10px 0;
  }
`;

const LobbyActions = styled(Box)`
  display: flex;
  gap: 10px;
`;

const StyledActionButton = styled(Button)`
  background: ${props => props.secondary ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(145deg, #4a7dff 0%, #7c4dff 100%)'};
  color: white;
  border-radius: 12px;
  padding: 10px 15px;
  margin-right: ${props => props.mr ? '10px' : '0'};
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s;
  text-transform: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    background: ${props => props.secondary ? 'rgba(255, 255, 255, 0.15)' : 'linear-gradient(145deg, #5a8dff 0%, #8c5dff 100%)'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StartGameButton = styled(StyledActionButton)`
  background: linear-gradient(145deg, #00bcd4 0%, #2196f3 100%);
  margin-top: 15px;
  width: 100%;
  padding: 12px;
  font-weight: 500;
  font-size: 1rem;
  
  &:hover {
    background: linear-gradient(145deg, #10cce4 0%, #31a6ff 100%);
  }
`;

const LobbyDetails = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const DetailItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.7);

  svg {
    color: #7C4DFF;
  }
`;

const EditFormBox = styled(Box)`
  display: grid;
  gap: 20px;
  margin-top: 20px;
`;

const FormGroupBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .MuiFormLabel-root {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const StyledTextField = styled(TextField)`
  .MuiInputBase-root {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;
  }
  
  .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #7C4DFF;
  }
  
  .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .MuiInputLabel-root.Mui-focused {
    color: #7C4DFF;
  }
  
  .MuiInputBase-input {
    padding: 12px;
  }
`;

const CheckboxContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .MuiFormControlLabel-root {
    margin: 0;
  }
  
  .MuiCheckbox-root {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .MuiCheckbox-root.Mui-checked {
    color: #7C4DFF;
  }
  
  .MuiTypography-root {
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
  }
`;

const StyledSaveButton = styled(Button)`
  background: linear-gradient(45deg, #4a7dff 0%, #7C4DFF 100%);
  color: white;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  font-weight: 600;
  text-transform: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(124, 77, 255, 0.3);
    background: linear-gradient(45deg, #5a8dff 0%, #8c5dff 100%);
  }
`;

const NoLobbiesMessage = styled(Box)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  margin-top: 40px;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #7C4DFF;
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 20px;
  }
`;

const StyledCreateLobbyButton = styled(Button)`
  background: linear-gradient(45deg, #4a7dff 0%, #7C4DFF 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px auto;
  transition: all 0.3s;
  font-weight: 600;
  text-transform: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(124, 77, 255, 0.3);
    background: linear-gradient(45deg, #5a8dff 0%, #8c5dff 100%);
  }
`;

// Etkinlik durumu bileşeni
const EventStatus = styled(Box)`
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
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
`;

// Geri sayım bileşeni
const Countdown = styled(Box)`
  background: rgba(255, 193, 7, 0.1);
  color: #FFC107;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
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

function LobbyManagementPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [lobbies, setLobbies] = useState([]);
  const [editingLobby, setEditingLobby] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchLobbies();
    }
  }, [user]);

  const fetchLobbies = async () => {
    try {
      console.log('Mevcut kullanıcı:', user);
      const response = await axiosInstance.get('/lobbies/my');
      console.log('API Yanıtı (Kendi lobilerim):', response.data);

      const userLobbies = Array.isArray(response.data) ? response.data : (response.data.lobbies || []);
      
      console.log('Kullanıcı Lobileri:', userLobbies);
      setLobbies(userLobbies);
    } catch (error) {
      console.error('Lobiler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lobby) => {
    // Tarihleri ISO formatına çevir
    const editableLobby = {
      ...lobby,
      eventDetails: {
        ...lobby.eventDetails,
        startTime: lobby.eventDetails?.startDate ? new Date(lobby.eventDetails.startDate).toISOString().slice(0, 16) : '',
        endTime: lobby.eventDetails?.endDate ? new Date(lobby.eventDetails.endDate).toISOString().slice(0, 16) : ''
      }
    };
    setEditingLobby(editableLobby);
  };

  const handleDelete = async (lobbyId) => {
    if (!window.confirm('Bu lobiyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/lobbies/${lobbyId}`);
      setLobbies(lobbies.filter(lobby => lobby._id !== lobbyId));
    } catch (error) {
      console.error('Lobi silinirken hata:', error);
    }
  };

  const handleSubmit = async (e, lobbyId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const isEventLobby = formData.get('isEventLobby') === 'on';
    const isPrivate = formData.get('isPrivate') === 'on';
    
    // Bahis miktarını sayıya çevir
    const betAmount = parseInt(formData.get('betAmount')) || 0;
    
    const updatedLobby = {
      name: formData.get('name'),
      maxPlayers: parseInt(formData.get('maxPlayers')),
      betAmount: betAmount,
      isPrivate,
      password: isPrivate ? formData.get('password') : undefined,
      isEventLobby,
      eventDetails: isEventLobby ? {
        title: formData.get('name'),
        description: formData.get('description') || '',
        startDate: formData.get('startTime'),
        endDate: formData.get('endTime')
      } : undefined
    };

    try {
      console.log('Lobi güncelleme isteği gönderiliyor:', {
        lobbyId,
        updatedLobby
      });
      
      // Backend'deki endpoint'e uygun olarak güncelleme
      const response = await axiosInstance.put(`/lobbies/${lobbyId}`, updatedLobby);
      console.log('Lobi güncelleme yanıtı:', response.data);
      
      setLobbies(lobbies.map(lobby => 
        lobby._id === lobbyId ? response.data : lobby
      ));
      setEditingLobby(null);
    } catch (error) {
      console.error('Lobi güncellenirken hata:', error);
      console.error('Hata detayları:', error.response?.data);
      alert('Lobi güncellenirken bir hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  // Tarih formatlama fonksiyonu
  const formatDate = (dateString) => {
    if (!dateString) return '';
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

  // Tombala oyununu başlatma fonksiyonu
  const handleStartGame = (lobby) => {
    if (lobby.game === 'tombala' || lobby.game === 'bingo') {
      // Şu anki kullanıcı veya varsayılan değer
      const currentUser = user || { id: `guest_${Date.now()}` };
      
      // localStorage üzerinden ek bilgileri saklayalım
      try {
        // Oyuncunun kendi ID'sini sakla
        localStorage.setItem('tombala_playerId', currentUser.id);
        localStorage.setItem('tombala_lobbyId', lobby._id);
        localStorage.setItem('tombala_lobbyCode', lobby.lobbyCode);
        localStorage.setItem('tombala_timestamp', Date.now());
        localStorage.setItem('tombala_lobbyName', lobby.name || "Tombala Lobisi");
      } catch (e) {
        console.warn('localStorage hatası:', e);
      }
      
      // URL parametreleri ile direct-tombala'ya yönlendir
      const playerId = currentUser.id;
      const lobbyName = lobby?.name || 'Tombala Lobisi';
      
      // URL parametrelerini oluştur
      const directTombalaURL = `/direct-tombala/${lobby.lobbyCode}?playerId=${encodeURIComponent(playerId)}&lobbyName=${encodeURIComponent(lobbyName)}`;
      
      console.log(`Oyun başlatılıyor, yönlendiriliyor: ${directTombalaURL}`);
      window.location.href = directTombalaURL;
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <Header>
          <HeaderLeft>
            <StyledBackButton onClick={() => navigate('/lobbies')}>
              <FaArrowLeft />
            </StyledBackButton>
            <TitleTypography variant="h1">Lobilerimi Yönet</TitleTypography>
          </HeaderLeft>
        </Header>

        {editingLobby ? (
          <EditFormBox component="form" onSubmit={(e) => handleSubmit(e, editingLobby._id)}>
            <FormGroupBox>
              <Typography component="label" htmlFor="name">Lobi Adı</Typography>
              <StyledTextField 
                id="name"
                name="name"
                defaultValue={editingLobby.name}
                required
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </FormGroupBox>

            <FormGroupBox>
              <Typography component="label" htmlFor="maxPlayers">Maksimum Oyuncu</Typography>
              <StyledTextField 
                id="maxPlayers"
                name="maxPlayers"
                type="number"
                defaultValue={editingLobby.maxPlayers}
                inputProps={{ min: "2", max: "8" }}
                required
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </FormGroupBox>

            <FormGroupBox>
              <Typography component="label" htmlFor="betAmount">Bahis Miktarı</Typography>
              <StyledTextField 
                id="betAmount"
                name="betAmount"
                type="number"
                defaultValue={editingLobby.betAmount}
                inputProps={{ min: "0" }}
                required
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </FormGroupBox>

            <CheckboxContainer>
              <FormControlLabel
                control={
                  <MuiCheckbox 
                    name="isPrivate"
                    defaultChecked={editingLobby.isPrivate}
                  />
                }
                label="Özel Lobi"
              />
            </CheckboxContainer>

            <FormGroupBox>
              <Typography component="label" htmlFor="password">Şifre (Özel lobi için)</Typography>
              <StyledTextField 
                id="password"
                name="password"
                type="password"
                defaultValue={editingLobby.password}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </FormGroupBox>

            <CheckboxContainer>
              <FormControlLabel
                control={
                  <MuiCheckbox 
                    name="isEventLobby"
                    defaultChecked={editingLobby.isEventLobby}
                    onChange={(e) => {
                      const form = e.target.form;
                      const startTimeInput = form.querySelector('input[name="startTime"]');
                      const endTimeInput = form.querySelector('input[name="endTime"]');
                      if (startTimeInput && endTimeInput) {
                        startTimeInput.required = e.target.checked;
                        endTimeInput.required = e.target.checked;
                      }
                    }}
                  />
                }
                label="Etkinlik Lobisi"
              />
            </CheckboxContainer>

            {(editingLobby.isEventLobby || editingLobby?.isEventLobby) && (
              <>
                <FormGroupBox>
                  <Typography component="label" htmlFor="startTime" sx={{ display: 'flex', alignItems: 'center' }}>
                    <FaClock style={{ marginRight: '8px' }} />
                    Başlangıç Zamanı
                  </Typography>
                  <StyledTextField 
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    defaultValue={editingLobby?.eventDetails?.startTime}
                    required={editingLobby.isEventLobby}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </FormGroupBox>

                <FormGroupBox>
                  <Typography component="label" htmlFor="endTime" sx={{ display: 'flex', alignItems: 'center' }}>
                    <FaClock style={{ marginRight: '8px' }} />
                    Bitiş Zamanı
                  </Typography>
                  <StyledTextField 
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    defaultValue={editingLobby?.eventDetails?.endTime}
                    required={editingLobby.isEventLobby}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </FormGroupBox>
              </>
            )}

            <StyledSaveButton type="submit">Kaydet</StyledSaveButton>
          </EditFormBox>
        ) : (
          <>
            {loading ? (
              <Typography>Lobiler yükleniyor...</Typography>
            ) : lobbies.length === 0 ? (
              <NoLobbiesMessage>
                <Typography variant="h3" component="h3">Henüz bir lobiniz yok</Typography>
                <Typography component="p">Yeni bir lobi oluşturarak oyunculara ev sahipliği yapabilirsiniz.</Typography>
                <StyledCreateLobbyButton onClick={() => navigate('/games/bingo')}>
                  Yeni Lobi Oluştur
                </StyledCreateLobbyButton>
              </NoLobbiesMessage>
            ) : (
              <>
                <StyledCreateLobbyButton onClick={() => navigate('/games/bingo')}>
                  Yeni Lobi Oluştur
                </StyledCreateLobbyButton>
                
                {lobbies.map(lobby => (
                  <LobbyCard key={lobby._id}>
                    <LobbyHeader>
                      <LobbyInfo>
                        <Typography variant="h2">{lobby.name}</Typography>
                        <Typography>{lobby.game}</Typography>
                      </LobbyInfo>
                      <LobbyActions>
                        <StyledActionButton onClick={() => handleEdit(lobby)}>
                          <FaEdit />
                          Düzenle
                        </StyledActionButton>
                        <StyledActionButton onClick={() => handleDelete(lobby._id)}>
                          <FaTrash />
                          Sil
                        </StyledActionButton>
                      </LobbyActions>
                    </LobbyHeader>
                    
                    <LobbyDetails>
                      <DetailItem>
                        <FaUsers />
                        <Typography component="span">{lobby.players.length} / {lobby.maxPlayers} Oyuncu</Typography>
                      </DetailItem>
                      
                      {lobby.betAmount > 0 && (
                        <DetailItem>
                          <FaCoins />
                          <Typography component="span">{lobby.betAmount} Jeton</Typography>
                        </DetailItem>
                      )}
                      
                      {lobby.isPrivate && (
                        <DetailItem>
                          <FaLock />
                          <Typography component="span">Özel Lobi</Typography>
                        </DetailItem>
                      )}
                      
                      {lobby.isEventLobby && lobby.eventDetails && (
                        <>
                          <DetailItem>
                            <FaCalendarAlt />
                            <Typography component="span">Etkinlik Lobisi</Typography>
                          </DetailItem>
                          
                          {lobby.eventDetails.startDate && (
                            <DetailItem>
                              <FaCalendarAlt />
                              <Typography component="span">Başlangıç: {formatDate(lobby.eventDetails.startDate)}</Typography>
                            </DetailItem>
                          )}
                          
                          {lobby.eventDetails.endDate && (
                            <DetailItem>
                              <FaCalendarAlt />
                              <Typography component="span">Bitiş: {formatDate(lobby.eventDetails.endDate)}</Typography>
                            </DetailItem>
                          )}
                        </>
                      )}
                    </LobbyDetails>
                    
                    {lobby.isEventLobby && lobby.eventDetails && (
                      <>
                        {lobby.status === 'waiting' && lobby.eventDetails.startDate && (
                          (() => {
                            const now = new Date();
                            const startDate = new Date(lobby.eventDetails.startDate);
                            const diff = startDate - now;
                            const lessThan24Hours = diff > 0 && diff < 24 * 60 * 60 * 1000;
                            
                            if (lessThan24Hours) {
                              return (
                                <Countdown>
                                  <FaCalendarAlt />
                                  Başlamasına: {getCountdown(lobby.eventDetails.startDate)}
                                </Countdown>
                              );
                            }
                            return null;
                          })()
                        )}
                        
                        <EventStatus status={lobby.status}>
                          <FaClock />
                          <Typography component="span">
                            {lobby.status === 'waiting' ? 'Bekliyor' : 
                             lobby.status === 'playing' ? 'Aktif' : 'Tamamlandı'}
                          </Typography>
                        </EventStatus>
                      </>
                    )}
                    
                    <Box sx={{ marginTop: '20px' }}>
                      <Typography component="p">Lobi Kodu: <Box component="strong">{lobby.lobbyCode}</Box></Typography>
                      <Typography component="p">Lobi Linki: <Box component="strong">{window.location.origin}/join/lobby/{lobby.lobbyCode}</Box></Typography>
                    </Box>
                  </LobbyCard>
                ))}
              </>
            )}
          </>
        )}
      </PageContainer>
    </MainLayout>
  );
}

export default LobbyManagementPage; 