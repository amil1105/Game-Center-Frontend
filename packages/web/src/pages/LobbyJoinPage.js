import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaUsers, FaLock, FaDoorOpen } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import { UserContext } from '../context/UserContext';
import MainLayout from '../components/Layout/MainLayout';

const PageContainer = styled.div`
  min-height: 100vh;
  color: white;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const JoinCard = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(74, 125, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  background: rgba(124, 77, 255, 0.1);
  border: none;
  color: #7C4DFF;
  font-size: 16px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  transition: all 0.3s;

  &:hover {
    background: rgba(124, 77, 255, 0.2);
    transform: translateX(-5px);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  color: white;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px;
    color: white;
    font-size: 1.2rem;
    letter-spacing: 2px;
    text-align: center;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: #4a7dff;
      background: rgba(255, 255, 255, 0.08);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: normal;
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(145deg, #4a7dff 0%, #ff53f0 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(74, 125, 255, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff5353;
  background: rgba(255, 83, 83, 0.1);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const LobbyInfo = styled.div`
  background: rgba(124, 77, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  h3 {
    margin: 0 0 15px 0;
    font-size: 1.2rem;
    color: #7C4DFF;
  }

  p {
    margin: 5px 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .host {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 15px;

    img {
      width: 30px;
      height: 30px;
      border-radius: 8px;
    }
  }
`;

function LobbyJoinPage() {
  const { lobbyCode: urlLobbyCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [lobbyCode, setLobbyCode] = useState(urlLobbyCode || '');
  const [password, setPassword] = useState('');
  const [lobby, setLobby] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // URL'den veya query parametresi olarak lobi kodu varsa, otomatik olarak lobi bilgilerini getir
    const queryParams = new URLSearchParams(location.search);
    const codeFromQuery = queryParams.get('code');
    
    if (urlLobbyCode || codeFromQuery) {
      const code = urlLobbyCode || codeFromQuery;
      setLobbyCode(code);
      fetchLobbyInfo(code);
    }
  }, [urlLobbyCode, location.search]);

  const fetchLobbyInfo = async (code) => {
    if (!code) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get(`/lobbies/code/${code}`);
      setLobby(response.data);
    } catch (error) {
      console.error('Lobi bilgisi alınırken hata:', error);
      setError(error.response?.data?.error || 'Lobi bilgisi alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    fetchLobbyInfo(lobbyCode);
  };

  const handleJoinLobby = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axiosInstance.post('/lobbies/join-by-code', {
        lobbyCode,
        password: password || undefined
      });
      
      // Başarılı katılımdan sonra lobi sayfasına yönlendir
      navigate(`/game/${response.data.game}/lobby/${response.data._id}`);
    } catch (error) {
      console.error('Lobiye katılım hatası:', error);
      setError(error.response?.data?.error || 'Lobiye katılırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <JoinCard>
          <Header>
            <BackButton onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </BackButton>
            <Title>Lobiye Katıl</Title>
          </Header>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {!lobby ? (
            <form onSubmit={handleCodeSubmit}>
              <FormGroup>
                <label>Lobi Kodu</label>
                <input 
                  type="text" 
                  placeholder="6 haneli kodu girin" 
                  maxLength={6}
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  required
                />
              </FormGroup>
              
              <SubmitButton type="submit" disabled={isLoading || lobbyCode.length !== 6}>
                {isLoading ? 'Aranıyor...' : 'Lobi Ara'}
              </SubmitButton>
            </form>
          ) : (
            <>
              <LobbyInfo>
                <h3>{lobby.name}</h3>
                <p>
                  <FaUsers style={{ marginRight: '5px' }} />
                  {lobby.players.length} / {lobby.maxPlayers} Oyuncu
                </p>
                {lobby.isPrivate && (
                  <p style={{ color: '#FF9F43' }}>
                    <FaLock style={{ marginRight: '5px' }} />
                    Özel Lobi (Şifre gerekli)
                  </p>
                )}
                <div className="host">
                  <img 
                    src={typeof lobby.creator === 'object' ? lobby.creator.profileImage : ''}
                    alt="Host" 
                    onError={(e) => {
                      const username = typeof lobby.creator === 'object' ? lobby.creator.username : '';
                      const initial = username?.[0] || 'U';
                      e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="30" height="30"><rect width="100" height="100" fill="#1F2937"/><text x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + initial + '</text></svg>')}`;
                    }}
                  />
                  <span>{typeof lobby.creator === 'object' ? lobby.creator.username : ''} (Lobi Sahibi)</span>
                </div>
              </LobbyInfo>

              <form onSubmit={handleJoinLobby}>
                {lobby.isPrivate && (
                  <FormGroup>
                    <label>Lobi Şifresi</label>
                    <input
                      type="password"
                      placeholder="Şifreyi girin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </FormGroup>
                )}
                
                <SubmitButton type="submit" disabled={isSubmitting || (lobby.isPrivate && !password)}>
                  <FaDoorOpen />
                  {isSubmitting ? 'Katılınıyor...' : 'Lobiye Katıl'}
                </SubmitButton>
              </form>
            </>
          )}
        </JoinCard>
      </PageContainer>
    </MainLayout>
  );
}

export default LobbyJoinPage; 