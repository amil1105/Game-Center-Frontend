import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '../context/UserContext';
import { FaEdit, FaTrash, FaClock, FaUsers, FaLock, FaCalendarAlt, FaCoins, FaArrowLeft, FaPlay } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import MainLayout from '../components/Layout/MainLayout';

const PageContainer = styled.div`
  color: white;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
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
  background: rgba(124, 77, 255, 0.1);
  border: none;
  color: #7C4DFF;
  font-size: 20px;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    background: rgba(124, 77, 255, 0.2);
    transform: translateX(-5px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
`;

const LobbyCard = styled.div`
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

const LobbyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const LobbyInfo = styled.div`
  h2 {
    font-size: 1.5rem;
    margin: 0 0 10px 0;
  }
`;

const LobbyActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: ${props => props.secondary ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(145deg, #4a7dff 0%, #7c4dff 100%)'};
  color: white;
  border: none;
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StartGameButton = styled(ActionButton)`
  background: linear-gradient(145deg, #00bcd4 0%, #2196f3 100%);
  margin-top: 15px;
  width: 100%;
  padding: 12px;
  font-weight: 500;
  font-size: 1rem;
`;

const LobbyDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.7);

  svg {
    color: #7C4DFF;
  }
`;

const EditForm = styled.form`
  display: grid;
  gap: 20px;
  margin-top: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #7C4DFF;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  
  label {
    cursor: pointer;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(45deg, #4a7dff 0%, #7C4DFF 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  font-weight: 600;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(124, 77, 255, 0.3);
  }
`;

const NoLobbiesMessage = styled.div`
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

const CreateLobbyButton = styled.button`
  background: linear-gradient(45deg, #4a7dff 0%, #7C4DFF 100%);
  color: white;
  border: none;
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(124, 77, 255, 0.3);
  }
`;

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
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
`;

// Geri sayım bileşeni
const Countdown = styled.div`
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
            <BackButton onClick={() => navigate('/lobbies')}>
              <FaArrowLeft />
            </BackButton>
            <Title>Lobilerimi Yönet</Title>
          </HeaderLeft>
        </Header>

        {editingLobby ? (
          <EditForm onSubmit={(e) => handleSubmit(e, editingLobby._id)}>
            <FormGroup>
              <label>Lobi Adı</label>
              <Input 
                name="name"
                defaultValue={editingLobby.name}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Maksimum Oyuncu</label>
              <Input 
                name="maxPlayers"
                type="number"
                defaultValue={editingLobby.maxPlayers}
                min="2"
                max="8"
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Bahis Miktarı</label>
              <Input 
                name="betAmount"
                type="number"
                defaultValue={editingLobby.betAmount}
                min="0"
                required
              />
            </FormGroup>

            <Checkbox>
              <input 
                name="isPrivate"
                type="checkbox"
                defaultChecked={editingLobby.isPrivate}
              />
              <label>Özel Lobi</label>
            </Checkbox>

            <FormGroup>
              <label>Şifre (Özel lobi için)</label>
              <Input 
                name="password"
                type="password"
                defaultValue={editingLobby.password}
              />
            </FormGroup>

            <Checkbox>
              <input 
                name="isEventLobby"
                type="checkbox"
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
              <label>Etkinlik Lobisi</label>
            </Checkbox>

            {(editingLobby.isEventLobby || editingLobby?.isEventLobby) && (
              <>
                <FormGroup>
                  <label>
                    <FaClock style={{ marginRight: '8px' }} />
                    Başlangıç Zamanı
                  </label>
                  <Input 
                    name="startTime"
                    type="datetime-local"
                    defaultValue={editingLobby?.eventDetails?.startTime}
                    required={editingLobby.isEventLobby}
                  />
                </FormGroup>

                <FormGroup>
                  <label>
                    <FaClock style={{ marginRight: '8px' }} />
                    Bitiş Zamanı
                  </label>
                  <Input 
                    name="endTime"
                    type="datetime-local"
                    defaultValue={editingLobby?.eventDetails?.endTime}
                    required={editingLobby.isEventLobby}
                  />
                </FormGroup>
              </>
            )}

            <SaveButton type="submit">Kaydet</SaveButton>
          </EditForm>
        ) : (
          <>
            {loading ? (
              <div>Lobiler yükleniyor...</div>
            ) : lobbies.length === 0 ? (
              <NoLobbiesMessage>
                <h3>Henüz bir lobiniz yok</h3>
                <p>Yeni bir lobi oluşturarak oyunculara ev sahipliği yapabilirsiniz.</p>
                <CreateLobbyButton onClick={() => navigate('/games/bingo')}>
                  Yeni Lobi Oluştur
                </CreateLobbyButton>
              </NoLobbiesMessage>
            ) : (
              <>
                <CreateLobbyButton onClick={() => navigate('/games/bingo')}>
                  Yeni Lobi Oluştur
                </CreateLobbyButton>
                
                {lobbies.map(lobby => (
                  <LobbyCard key={lobby._id}>
                    <LobbyHeader>
                      <LobbyInfo>
                        <h2>{lobby.name}</h2>
                        <p>{lobby.game}</p>
                      </LobbyInfo>
                      <LobbyActions>
                        <ActionButton onClick={() => handleEdit(lobby)}>
                          <FaEdit />
                          Düzenle
                        </ActionButton>
                        <ActionButton danger onClick={() => handleDelete(lobby._id)}>
                          <FaTrash />
                          Sil
                        </ActionButton>
                      </LobbyActions>
                    </LobbyHeader>
                    
                    <LobbyDetails>
                      <DetailItem>
                        <FaUsers />
                        <span>{lobby.players.length} / {lobby.maxPlayers} Oyuncu</span>
                      </DetailItem>
                      
                      {lobby.betAmount > 0 && (
                        <DetailItem>
                          <FaCoins />
                          <span>{lobby.betAmount} Jeton</span>
                        </DetailItem>
                      )}
                      
                      {lobby.isPrivate && (
                        <DetailItem>
                          <FaLock />
                          <span>Özel Lobi</span>
                        </DetailItem>
                      )}
                      
                      {lobby.isEventLobby && lobby.eventDetails && (
                        <>
                          <DetailItem>
                            <FaCalendarAlt />
                            <span>Etkinlik Lobisi</span>
                          </DetailItem>
                          
                          {lobby.eventDetails.startDate && (
                            <DetailItem>
                              <FaCalendarAlt />
                              <span>Başlangıç: {formatDate(lobby.eventDetails.startDate)}</span>
                            </DetailItem>
                          )}
                          
                          {lobby.eventDetails.endDate && (
                            <DetailItem>
                              <FaCalendarAlt />
                              <span>Bitiş: {formatDate(lobby.eventDetails.endDate)}</span>
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
                          {lobby.status === 'waiting' ? 'Bekliyor' : 
                           lobby.status === 'playing' ? 'Aktif' : 'Tamamlandı'}
                        </EventStatus>
                      </>
                    )}
                    
                    <div style={{ marginTop: '20px' }}>
                      <p>Lobi Kodu: <strong>{lobby.lobbyCode}</strong></p>
                      <p>Lobi Linki: <strong>{window.location.origin}/join/lobby/{lobby.lobbyCode}</strong></p>
                    </div>

                    {(lobby.game === 'tombala' || lobby.game === 'bingo') && lobby.status === 'waiting' && (
                      <StartGameButton onClick={() => handleStartGame(lobby)}>
                        <FaPlay /> Oyunu Başlat
                      </StartGameButton>
                    )}
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