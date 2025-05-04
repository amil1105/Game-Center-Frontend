import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaUsers, FaLock, FaDoorOpen } from 'react-icons/fa';
import axiosInstance from '../api/axios';
import { UserContext } from '../context/UserContext';
import MainLayout from '../components/Layout/MainLayout';
import { 
  Box, 
  Typography, 
  Button as MuiButton, 
  InputBase,
  InputLabel,
  Avatar,
  Paper
} from '@mui/material';

const PageContainer = styled(Box)`
  min-height: 100vh;
  color: white;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const JoinCard = styled(Paper)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(74, 125, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const Header = styled(Box)`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const BackButton = styled(MuiButton)`
  && {
    background: rgba(124, 77, 255, 0.1);
    border: none;
    color: #7C4DFF;
    font-size: 16px;
    cursor: pointer;
    padding: 10px;
    border-radius: 10px;
    transition: all 0.3s;
    min-width: auto;

    &:hover {
      background: rgba(124, 77, 255, 0.2);
      transform: translateX(-5px);
    }
  }
`;

const Title = styled(Typography)`
  margin: 0;
  font-size: 1.8rem;
  color: white;
`;

const FormGroup = styled(Box)`
  margin-bottom: 20px;
`;

const StyledInputLabel = styled(InputLabel)`
  && {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
`;

const StyledInputBase = styled(InputBase)`
  && {
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

    &.Mui-focused {
      border-color: #4a7dff;
      background: rgba(255, 255, 255, 0.08);
    }

    & input::placeholder {
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: normal;
    }
  }
`;

const SubmitButton = styled(MuiButton)`
  && {
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

    &.Mui-disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
`;

const ErrorMessage = styled(Box)`
  color: #ff5353;
  background: rgba(255, 83, 83, 0.1);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
`;

const LobbyInfo = styled(Box)`
  background: rgba(124, 77, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  .host {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 15px;
  }
`;

const LobbyTitle = styled(Typography)`
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: #7C4DFF;
`;

const LobbyText = styled(Typography)`
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const HostText = styled(Typography)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const StyledAvatar = styled(Avatar)`
  && {
    width: 30px;
    height: 30px;
    border-radius: 8px;
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
      
      // Eğer oyun "tombala" (veya bingo) ise, tombala oyun sayfasına yönlendir
      if (response.data.game === 'tombala' || response.data.game === 'bingo') {
        // Kullanıcının token bilgisini ve lobi kimliğini parametre olarak ekle
        const token = localStorage.getItem('token');
        
        // .env dosyasından Tombala URL'sini al veya varsayılan değeri kullan
        const tombalUrl = `${process.env.REACT_APP_TOMBALA_URL || 'http://localhost:5173'}?token=${token}&lobbyId=${response.data._id}`;
        
        console.log('Tombala oyununa yönlendiriliyor:', tombalUrl);
        
        // Doğrudan mevcut pencerede oyunu başlat
        window.location.href = tombalUrl;
        
        // Artık normal lobi sayfasına yönlendirmeye gerek yok
        return;
      } else {
        // Diğer oyunlar için normal yönlendirme yap
        navigate(`/game/${response.data.game}/lobby/${response.data._id}`);
      }
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
            <Title variant="h1">Lobiye Katıl</Title>
          </Header>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {!lobby ? (
            <Box component="form" onSubmit={handleCodeSubmit}>
              <FormGroup>
                <StyledInputLabel htmlFor="lobby-code">Lobi Kodu</StyledInputLabel>
                <StyledInputBase 
                  id="lobby-code"
                  type="text" 
                  placeholder="6 haneli kodu girin" 
                  inputProps={{ maxLength: 6 }}
                  value={lobbyCode}
                  onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                  required
                />
              </FormGroup>
              
              <SubmitButton type="submit" disabled={isLoading || lobbyCode.length !== 6}>
                {isLoading ? 'Aranıyor...' : 'Lobi Ara'}
              </SubmitButton>
            </Box>
          ) : (
            <>
              <LobbyInfo>
                <LobbyTitle variant="h3">{lobby.name}</LobbyTitle>
                <LobbyText>
                  <FaUsers style={{ marginRight: '5px' }} />
                  {lobby.players.length} / {lobby.maxPlayers} Oyuncu
                </LobbyText>
                {lobby.isPrivate && (
                  <LobbyText sx={{ color: '#FF9F43' }}>
                    <FaLock style={{ marginRight: '5px' }} />
                    Özel Lobi (Şifre gerekli)
                  </LobbyText>
                )}
                <Box className="host">
                  <StyledAvatar 
                    src={typeof lobby.creator === 'object' ? lobby.creator.profileImage : ''}
                    alt="Host" 
                    sx={{ borderRadius: '8px' }}
                    variant="square"
                    children={typeof lobby.creator === 'object' ? lobby.creator.username?.[0] || 'U' : 'U'}
                  />
                  <HostText>{typeof lobby.creator === 'object' ? lobby.creator.username : ''} (Lobi Sahibi)</HostText>
                </Box>
              </LobbyInfo>

              <Box component="form" onSubmit={handleJoinLobby}>
                {lobby.isPrivate && (
                  <FormGroup>
                    <StyledInputLabel htmlFor="lobby-password">Lobi Şifresi</StyledInputLabel>
                    <StyledInputBase
                      id="lobby-password"
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
              </Box>
            </>
          )}
        </JoinCard>
      </PageContainer>
    </MainLayout>
  );
}

export default LobbyJoinPage; 