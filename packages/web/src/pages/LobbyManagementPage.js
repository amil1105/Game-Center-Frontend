import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '../context/UserContext';
import { FaEdit, FaTrash, FaClock, FaUsers, FaLock, FaCalendarAlt, FaCoins } from 'react-icons/fa';
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
  background: ${props => props.danger ? 'rgba(255, 59, 59, 0.1)' : 'rgba(124, 77, 255, 0.1)'};
  color: ${props => props.danger ? '#FF3B3B' : '#7C4DFF'};
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.danger ? 'rgba(255, 59, 59, 0.2)' : 'rgba(124, 77, 255, 0.2)'};
    transform: translateY(-2px);
  }
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Geçersiz Tarih';
      
      // Türkçe tarih formatı
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      return new Intl.DateTimeFormat('tr-TR', options).format(date);
    } catch (error) {
      console.error('Tarih formatlanırken hata:', error);
      return 'Geçersiz Tarih';
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <Header>
          <Title>Lobi Yönetimi</Title>
        </Header>

        {loading ? (
          <div>Yükleniyor...</div>
        ) : lobbies.length === 0 ? (
          <NoLobbiesMessage>
            <h3>Henüz bir lobi oluşturmadınız</h3>
            <p>Oyun sayfasına giderek yeni bir lobi oluşturabilirsiniz.</p>
            <CreateLobbyButton onClick={() => navigate('/home')}>
              <FaUsers />
              Oyunlara Git
            </CreateLobbyButton>
          </NoLobbiesMessage>
        ) : (
          lobbies.map(lobby => (
            <LobbyCard key={lobby._id}>
              {editingLobby?._id === lobby._id ? (
                <EditForm onSubmit={(e) => handleSubmit(e, lobby._id)}>
                  <FormGroup>
                    <label>Lobi Adı</label>
                    <Input 
                      name="name"
                      defaultValue={lobby.name}
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Maksimum Oyuncu</label>
                    <Input 
                      name="maxPlayers"
                      type="number"
                      defaultValue={lobby.maxPlayers}
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
                      defaultValue={lobby.betAmount}
                      min="0"
                      required
                    />
                  </FormGroup>

                  <Checkbox>
                    <input 
                      name="isPrivate"
                      type="checkbox"
                      defaultChecked={lobby.isPrivate}
                    />
                    <label>Özel Lobi</label>
                  </Checkbox>

                  <FormGroup>
                    <label>Şifre (Özel lobi için)</label>
                    <Input 
                      name="password"
                      type="password"
                      defaultValue={lobby.password}
                    />
                  </FormGroup>

                  <Checkbox>
                    <input 
                      name="isEventLobby"
                      type="checkbox"
                      defaultChecked={lobby.isEventLobby}
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

                  {(lobby.isEventLobby || editingLobby?.isEventLobby) && (
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
                          required={lobby.isEventLobby}
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
                          required={lobby.isEventLobby}
                        />
                      </FormGroup>
                    </>
                  )}

                  <SaveButton type="submit">Kaydet</SaveButton>
                </EditForm>
              ) : (
                <>
                  <LobbyHeader>
                    <LobbyInfo>
                      <h2>{lobby.name}</h2>
                      <span style={{ 
                        display: 'inline-block', 
                        background: 'rgba(124, 77, 255, 0.1)', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem',
                        color: '#7C4DFF',
                        marginTop: '5px'
                      }}>
                        {lobby.game.charAt(0).toUpperCase() + lobby.game.slice(1)}
                      </span>
                      <span style={{ 
                        display: 'inline-block', 
                        background: lobby.status === 'waiting' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)', 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem',
                        color: lobby.status === 'waiting' ? '#4CAF50' : '#FF9800',
                        marginLeft: '10px',
                        marginTop: '5px'
                      }}>
                        {lobby.status === 'waiting' ? 'Bekliyor' : 'Oynanıyor'}
                      </span>
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
                      {lobby.players.length} / {lobby.maxPlayers} Oyuncu
                    </DetailItem>
                    <DetailItem>
                      <FaCoins />
                      {lobby.betAmount} Token
                    </DetailItem>
                    {lobby.isPrivate && (
                      <DetailItem>
                        <FaLock />
                        Özel Lobi
                      </DetailItem>
                    )}
                    {lobby.isEventLobby && lobby.eventDetails && (
                      <>
                        <DetailItem>
                          <FaCalendarAlt />
                          Etkinlik Lobisi
                        </DetailItem>
                        {lobby.eventDetails.startDate && (
                          <DetailItem>
                            <FaClock />
                            Başlangıç: {formatDate(lobby.eventDetails.startDate)}
                          </DetailItem>
                        )}
                        {lobby.eventDetails.endDate && (
                          <DetailItem>
                            <FaClock />
                            Bitiş: {formatDate(lobby.eventDetails.endDate)}
                          </DetailItem>
                        )}
                      </>
                    )}
                    <DetailItem style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        width: '100%'
                      }}>
                        <span>Lobi Kodu:</span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          letterSpacing: '1px',
                          color: '#7C4DFF'
                        }}>
                          {lobby.lobbyCode}
                        </span>
                        <button 
                          style={{
                            marginLeft: 'auto',
                            background: 'rgba(124, 77, 255, 0.1)',
                            border: 'none',
                            color: '#7C4DFF',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            navigator.clipboard.writeText(lobby.lobbyCode);
                            alert('Lobi kodu kopyalandı!');
                          }}
                        >
                          Kopyala
                        </button>
                      </div>
                    </DetailItem>
                  </LobbyDetails>
                </>
              )}
            </LobbyCard>
          ))
        )}
      </PageContainer>
    </MainLayout>
  );
}

export default LobbyManagementPage; 