import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  IconButton,
  Avatar,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  Card,
  TextField,
  Badge,
  Chip,
  Divider,
  Paper,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  createTheme,
  ThemeProvider,
  Grow,
  Zoom,
  Fade,
  Slide,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axios';
import MainLayout from '../components/Layout/MainLayout';
import { 
  ArrowBack as BackIcon, 
  ContentCopy as CopyIcon, 
  Check as CheckIcon,
  ExitToApp as ExitIcon,
  SmartToy as BotIcon,
  PeopleOutline as PeopleIcon,
  CheckCircleOutlined,
  CancelOutlined,
  CheckCircle as ReadyIcon,
  Cancel as NotReadyIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
  Celebration as CelebrationIcon,
  Send as SendIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

// Glow efekti için animasyon
const glow = (color) => `
  box-shadow: 0 0 10px ${color}40,
              0 0 20px ${color}20,
              0 0 30px ${color}10,
              inset 0 0 10px ${color}05;
`;

// Yeni stil tanımlamaları
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 'calc(100vh - 100px)',
  background: '#0B0E17',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at top right, #4a7dff10, transparent 70%)`,
    zIndex: 0,
    pointerEvents: 'none',
  }
}));

const LobbyContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 2fr',
  gap: theme.spacing(3),
  height: 'calc(100vh - 180px)',
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr',
    height: 'auto',
    gap: theme.spacing(2)
  }
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(30, 32, 68, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.05)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 0 16px #4a7dff20`,
    transform: 'translateY(-5px)',
  }
}));

const PlayerListContainer = styled(GlassPaper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column'
}));

const ChatContainer = styled(GlassPaper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column'
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  '& .MuiSvgIcon-root': {
    color: '#4a7dff'
  }
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: '#151921'
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#1F2937',
    borderRadius: '3px'
  }
}));

const MessageInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
}));

const Message = styled(Box, {
  shouldForwardProp: (prop) => !['$isCurrentUser', '$isSystem'].includes(prop)
})(({ theme, $isCurrentUser, $isSystem }) => ({
  alignSelf: $isCurrentUser ? 'flex-end' : $isSystem ? 'center' : 'flex-start',
  backgroundColor: $isSystem 
    ? 'rgba(74, 125, 255, 0.1)' 
    : $isCurrentUser 
      ? 'rgba(74, 125, 255, 0.15)' 
      : 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  maxWidth: $isSystem ? '85%' : '70%',
  wordBreak: 'break-word',
  position: 'relative',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.01)',
    backgroundColor: $isSystem 
      ? 'rgba(74, 125, 255, 0.15)' 
      : $isCurrentUser 
        ? 'rgba(74, 125, 255, 0.25)' 
        : 'rgba(255, 255, 255, 0.08)',
  }
}));

const PlayerListContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: '#151921'
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#1F2937',
    borderRadius: '3px'
  }
}));

const PlayerActions = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  alignItems: 'center',
  flexWrap: 'wrap'
}));

const LobbyInfoContainer = styled(GlassPaper)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  marginBottom: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  backgroundImage: 'linear-gradient(145deg, #1e2044 0%, #171934 100%)',
  '&:hover': {
    boxShadow: glow('#4a7dff'),
  }
}));

const ReadyButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== '$isReady'
})(({ theme, $isReady }) => ({
  backgroundColor: $isReady 
    ? 'rgba(76, 175, 80, 0.15)' 
    : 'rgba(244, 67, 54, 0.15)',
  color: $isReady ? '#4CAF50' : '#F44336',
  transition: 'all 0.3s ease',
  borderRadius: 8,
  padding: theme.spacing(1, 2),
  border: $isReady ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(244, 67, 54, 0.3)',
  '&:hover': {
    backgroundColor: $isReady 
      ? 'rgba(76, 175, 80, 0.25)' 
      : 'rgba(244, 67, 54, 0.25)',
    transform: 'translateY(-2px)',
    boxShadow: $isReady 
      ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
      : '0 4px 12px rgba(244, 67, 54, 0.3)',
  }
}));

const StartGameButton = styled(Button)(({ theme }) => ({
  backgroundImage: 'linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%)',
  color: 'white',
  padding: theme.spacing(1, 3),
  borderRadius: 12,
  fontWeight: 600,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(74, 125, 255, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'all 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 25px rgba(74, 125, 255, 0.4)',
    '&::before': {
      left: '100%'
    }
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'rgba(255, 255, 255, 0.4)',
    boxShadow: 'none',
    transform: 'none'
  }
}));

const LobbyCode = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  background: 'rgba(74, 125, 255, 0.1)',
  borderRadius: 12,
  padding: theme.spacing(0.8, 2),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(74, 125, 255, 0.3)',
  '&:hover': {
    background: 'rgba(74, 125, 255, 0.2)',
    transform: 'translateY(-2px)',
    borderColor: '#4a7dff',
  }
}));

const AnimatedChip = styled(Chip)(({ theme }) => ({
  animation: 'pulse 2s infinite',
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
  color: '#4CAF50',
  border: '1px solid rgba(76, 175, 80, 0.3)',
  fontWeight: 500,
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)'
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)'
    }
  }
}));

// StyledListItem'ı div yerine Box'a dayalı olarak tanımlayalım ve shouldForwardProp ekleyelim
const StyledListItem = styled(Box, {
  shouldForwardProp: (prop) => !['$isReady', '$isCurrentUser'].includes(prop)
})(({ theme, $isReady, $isCurrentUser }) => ({
  borderRadius: 8,
  margin: theme.spacing(0.5, 0),
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  background: $isReady 
    ? 'rgba(76, 175, 80, 0.1)' 
    : $isCurrentUser 
      ? 'rgba(74, 125, 255, 0.1)' 
      : 'rgba(26, 27, 38, 0.5)',
  border: `1px solid ${$isReady 
    ? 'rgba(76, 175, 80, 0.15)' 
    : $isCurrentUser 
      ? 'rgba(74, 125, 255, 0.15)' 
      : 'transparent'}`,
  '&:hover': {
    background: $isReady 
      ? 'rgba(76, 175, 80, 0.15)' 
      : $isCurrentUser 
        ? 'rgba(74, 125, 255, 0.15)' 
        : 'rgba(255, 255, 255, 0.05)',
    transform: 'translateX(5px)'
  }
}));

// Çıkış butonu için stil
const LeaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(244, 67, 54, 0.1)',
  color: '#F44336',
  padding: theme.spacing(1, 2),
  borderRadius: 8,
  border: '1px solid rgba(244, 67, 54, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
  }
}));

// Avatar oluşturma yardımcı fonksiyonu ekleyelim
function getPlayerAvatar(player) {
  if (!player || !player.avatar) {
    // Kullanıcı adının baş harfini içeren bir SVG döndür
    const initial = player?.name ? player.name.charAt(0).toUpperCase() : 'U';
    return `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + initial + '</text></svg>')}`;
  }
  return player.avatar;
}

function LobbyPage() {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const [startCountdown, setStartCountdown] = useState(null);
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false); // Kullanıcının lobiye katılıp katılmadığını takip eder
  const messagesEndRef = useRef(null);
  
  // Socket.io bağlantısı
  const socket = useMemo(() => {
    // Socket.io client oluştur
    return io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true
    });
  }, []);
  
  // Socket kimlik bilgisi tanımlama
  useEffect(() => {
    if (socket && user?.id) {
      console.log("Socket kimlik tanımlama gönderiliyor", user.id);
      socket.emit('identify', user.id);
      
      // Socket bağlantısı başarılı olduğunda lobiye katılmaya çalış
      if (lobbyCode) {
        console.log("Socket bağlantısı hazır, lobiye katılma kontrolü yapılıyor");
        // Lobi sahibi mi kontrol et
        const isLobbyOwner = lobby && (lobby.createdBy === user.id || lobby.owner === user.id);
        
        if (isLobbyOwner) {
          console.log("Lobi sahibiyim, katılma işlemi gerekmez");
          setHasJoinedLobby(true);
        } else if (!hasJoinedLobby) {
          console.log("Socket bağlantısı sonrası lobiye katılma işlemi başlatılıyor");
          registerPlayerToLobby();
        }
      }
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket, user?.id, lobbyCode, lobby]);
  
  // Polling mekanizması için polling intervalini kısaltalım ve zorunlu güncelleme ekleyelim
  const pollingIntervalRef = useRef(null);
  // Hazır durum geçişlerini takip etmek için
  const readyStateTransitionTimeRef = useRef(0);
  // Son değerleri saklama referansları
  const lastKnownReadyState = useRef(null);
  const hasClientSideReadyUpdate = useRef(false);

  // CustomTheme tanımını düzeltiyorum
  const customTheme = useMemo(() => 
    createTheme({
      ...theme,
      components: {
        ...theme.components,
        MuiTypography: {
          styleOverrides: {
            root: {
              color: 'white',
            },
            body2: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            caption: {
              color: 'rgba(255, 255, 255, 0.6)',
            },
          },
        },
      },
    }),
  [theme]);
  
  // useEffect içinde lobi bilgilerini doğrudan yükle
  useEffect(() => {
    if (lobbyCode && user?.id) {
      // Doğrudan oyuncuları göstermek için ilk veri yüklemesi
      const initialFetch = async () => {
      try {
        setLoading(true);
          console.log("İlk lobi verilerini yükleme başlatılıyor...");
        
        // API'den lobi bilgilerini al
        const response = await axiosInstance.get(`/lobbies/code/${lobbyCode}`);
          console.log("İlk lobi verileri yüklendi:", response.data);
          
          if (!response.data) {
            console.error("Lobi verisi alınamadı");
          setLoading(false);
          return;
        }
        
          // Lobi bilgisini set et
          setLobby(response.data);
          
          // Tüm oyuncuları kontrol et - players ve playersDetail dizilerini birleştir
          let allPlayers = [];
          const playerIds = new Set();
          
          // Önce players dizisinden bilgileri topla
        if (response.data.players && Array.isArray(response.data.players)) {
            console.log("players dizisinden veriler alınıyor:", response.data.players);
            response.data.players.forEach(player => {
            const playerId = player._id || player.id;
              if (playerId) {
                const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId);
                
                // ID'yi daha önce görmediysen ekle
                if (!playerIds.has(playerIdStr)) {
                  allPlayers.push({
                    id: playerIdStr,
                    name: player.username || player.name || 'Oyuncu',
            avatar: player.profileImage || player.avatar,
                    isReady: player.isReady || false,
                    isBot: player.isBot || false,
                    isOwner: response.data.createdBy === playerIdStr || response.data.owner === playerIdStr
                  });
                  
                  playerIds.add(playerIdStr);
                }
              }
            });
          }
          
          // Sonra playersDetail dizisinden bilgileri topla
          if (response.data.playersDetail && Array.isArray(response.data.playersDetail)) {
            console.log("playersDetail dizisinden veriler alınıyor:", response.data.playersDetail);
            response.data.playersDetail.forEach(player => {
              let playerId = player.user;
              if (typeof playerId === 'object') {
                playerId = playerId?._id || playerId?.id;
              }
              
              if (playerId) {
                const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId);
                
                // ID'yi daha önce görmediysen ekle
                if (!playerIds.has(playerIdStr)) {
                  allPlayers.push({
                    id: playerIdStr,
                    name: player.name || player.user?.username || 'Oyuncu',
                    avatar: player.user?.profileImage,
                    isReady: player.isReady || false,
                    isBot: player.isBot || false,
                    isOwner: response.data.createdBy === playerIdStr || response.data.owner === playerIdStr
                  });
                  
                  playerIds.add(playerIdStr);
                }
              }
            });
          }
          
          // Kendimizi ekleyelim
          if (user?.id && !playerIds.has(user.id)) {
            console.log("İlk yüklemede kendimi listeye ekliyorum");
            allPlayers.push({
              id: user.id,
            name: user.username || 'Oyuncu',
            avatar: user.profileImage,
              isReady: false,
              isBot: false,
              isOwner: response.data.createdBy === user.id || response.data.owner === user.id
            });
          }
          
          // Oturup hazır durumuzu güncelle
          const currentUserInLobby = response.data.playersDetail?.find(p => {
            const pId = p.user?._id || p.user || '';
            return pId.toString() === user.id.toString();
          }) || response.data.players?.find(p => (p._id || p.id).toString() === user.id.toString());
          
          if (currentUserInLobby) {
            setIsReady(currentUserInLobby.isReady || false);
            console.log("Hazır durumu API'den yüklendi:", currentUserInLobby.isReady);
          }
          
          // Oyuncular listesini güncelle ve tüm hazır durumlarını yansıt
          console.log("İlk oyuncu listesi oluşturuldu:", allPlayers);
          setPlayers(allPlayers);
          
          // Son olarak lobiye katılma durumunu kontrol et
          if (response.data.createdBy === user.id || response.data.owner === user.id) {
            console.log("Ben lobi sahibiyim, katılmış sayılıyorum");
            setHasJoinedLobby(true);
        } else {
            const amIInLobby = allPlayers.some(p => p.id === user.id);
            if (amIInLobby) {
              console.log("Lobide zaten varım");
              setHasJoinedLobby(true);
            }
        }
        
        setLoading(false);
        
        // Polling başlat
        startPolling();
      } catch (error) {
          console.error("İlk lobi verilerini yüklerken hata:", error);
          setError("Lobi bilgileri yüklenemedi");
        setLoading(false);
      }
    };
    
      // İlk veri yüklemesini başlat
      initialFetch();
    }
    
    // Temizleme fonksiyonu
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [lobbyCode, user?.id]);

  // Polling mekanizmasını iyileştirelim - daha sık güncelleme için
  const startPolling = () => {
    // Sayfa yüklenince ilk verileri hemen al
    fetchLobbyData(true); // İlk seferde API'den hazır durumunu al
    
    // Polling sıklığını 2 saniyeye ayarlayalım
    if (!pollingIntervalRef.current) {
      console.log('Polling başlatılıyor...');
      
      pollingIntervalRef.current = setInterval(() => {
        // Hazır durum geçişinden itibaren belirli bir süre geçtiyse zorunlu güncelleme yap
        const timeSinceLastTransition = Date.now() - readyStateTransitionTimeRef.current;
        const shouldOverride = timeSinceLastTransition > 5000; // 5 saniyeden fazla geçtiyse
        
        // Güncellenme zamanına göre override değerini ayarla
        fetchLobbyData(shouldOverride);
      }, 2000); // 2 saniyede bir güncelle
    }
  };

  // Lobby katılım işlemi için iyileştirilmiş fonksiyon
  const registerPlayerToLobby = async () => {
    if (!lobbyCode || !user?.id) {
      console.error("Lobiye katılma için gerekli bilgiler eksik:", { lobbyCode, userId: user?.id });
      return;
    }
    
    // Eğer kullanıcı zaten katıldıysa, tekrar katılma
    if (hasJoinedLobby) {
      console.log("Kullanıcı zaten lobiye katılmış, tekrar katılma işlemini atlıyorum");
      return;
    }
    
    try {
      // Önce API'den tüm lobi bilgilerini alalım
      console.log("Lobiye katılmadan önce API'den tüm oyuncuları alıyorum");
      const lobbyResponse = await axiosInstance.get(`/lobbies/code/${lobbyCode}`);
      
      if (lobbyResponse.data) {
        console.log("API'den tüm lobi bilgileri alındı:", lobbyResponse.data);
        setLobby(lobbyResponse.data);
        
        // Lobi yanıtında hem players hem de playersDetail var mı kontrol et
        console.log("Lobi yanıtında bulunabilecek oyuncu verileri:", {
          oyuncuSayısı: lobbyResponse.data.players?.length || 0,
          detaylıOyuncuSayısı: lobbyResponse.data.playersDetail?.length || 0,
          hazırOyuncular: lobbyResponse.data.players?.filter(p => p.isReady)?.length || 0,
          hazırDetaylıOyuncular: lobbyResponse.data.playersDetail?.filter(p => p.isReady)?.length || 0
        });
        
        // TÜM mevcut oyuncuları çıkar ve ekle
        let allLobbyPlayers = [];
        
        // Önce players dizisini kontrol et (bu kısımda tüm oyuncular olabilir)
        if (lobbyResponse.data.players && Array.isArray(lobbyResponse.data.players)) {
          const playersFromBasic = lobbyResponse.data.players.map(player => {
            const playerId = player._id || player.id;
            const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
            
            return {
              id: playerIdStr,
              name: player.username || player.name || 'Oyuncu',
              avatar: player.profileImage || player.avatar || null,
              isReady: player.isReady || false,
              isBot: player.isBot || false,
              isOwner: lobbyResponse.data.createdBy === playerIdStr || lobbyResponse.data.owner === playerIdStr
            };
          });
          
          allLobbyPlayers = [...allLobbyPlayers, ...playersFromBasic];
        }
        
        // Sonra playersDetail dizisini kontrol et (daha detaylı bilgiler içerir)
        if (lobbyResponse.data.playersDetail && Array.isArray(lobbyResponse.data.playersDetail)) {
          const playersFromDetail = lobbyResponse.data.playersDetail.map(player => {
            // ID'yi güvenli şekilde çıkar
            let playerId = player.user;
            if (typeof playerId === 'object') {
              playerId = playerId?._id || playerId?.id || null;
            }
            const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
            
            return {
              id: playerIdStr,
              name: player.name || player.user?.username || `Oyuncu #${playerIdStr?.substring(0, 6) || 'Bilinmeyen'}`,
              avatar: player.user?.profileImage || null,
              isReady: player.isReady || false,
              isBot: player.isBot || false,
              isOwner: lobbyResponse.data.createdBy === playerIdStr || lobbyResponse.data.owner === playerIdStr
            };
          });
          
          allLobbyPlayers = [...allLobbyPlayers, ...playersFromDetail];
        }
        
        // Benzersiz oyuncuları çıkar
        const uniquePlayers = [];
        const playerIds = new Set();
        
        for (const player of allLobbyPlayers) {
          if (!player || !player.id) continue;
          
          // Zaten eklenmiş oyuncuları atlayalım
          if (playerIds.has(player.id)) continue;
          
          uniquePlayers.push(player);
          playerIds.add(player.id);
        }
        
        // Kendimizi ekle
        const selfExists = uniquePlayers.some(p => p.id === user.id);
        if (!selfExists) {
          console.log("Kendimi oyuncu listesine ekliyorum");
          uniquePlayers.push({
            id: user.id,
            name: user.username || 'Oyuncu',
            avatar: user.profileImage,
            isReady: false,
            isBot: false,
            isOwner: lobbyResponse.data.createdBy === user.id || lobbyResponse.data.owner === user.id
          });
        }
        
        // Oyuncu listesini güncelle, benzersiz oyuncuları kullan
        if (uniquePlayers.length > 0) {
          console.log("API verileriyle oyuncu listesi güncelleniyor:", uniquePlayers);
          setPlayers(uniquePlayers);
        } else {
          console.warn("API oyuncu verileri boş, bu beklenmeyen bir durum!");
        }
      }
      
      // Şimdi API'ye katılma isteği gönder
      console.log("API'ye katılma isteği gönderiliyor:", { lobbyCode, userId: user.id });
      const joinResponse = await axiosInstance.post(`/lobbies/join`, {
        lobbyCode: lobbyCode,
        playerId: user.id,
        playerName: user.username || 'Oyuncu',
        playerAvatar: user.profileImage
      });
      
      if (joinResponse.data.success) {
        console.log("Lobiye başarıyla katıldı:", joinResponse.data);
        
        // Katılma durumunu güncelle
        setHasJoinedLobby(true);
        
        // Sistem mesajı ekle
        addSystemMessage(`${user.username || 'Oyuncu'} lobiye katıldı.`);
        
        // Socket üzerinden diğer oyunculara bildir
        if (socket) {
          socket.emit('playerJoined', {
            lobbyCode: lobbyCode,
            player: {
              id: user.id,
              name: user.username || 'Oyuncu',
              avatar: user.profileImage,
              isReady: false
            }
          });
        }
        
        // API'den tekrar lobi bilgilerini al ve güncel tut - tüm oyuncuları göstermek için
        await fetchLobbyData(false);
        
        // Tam bir güncelleme için 1 saniye sonra tekrar çağır
        setTimeout(() => fetchLobbyData(false), 1000);
      } else {
        console.error("Lobiye katılma başarısız:", joinResponse.data);
        enqueueSnackbar(`Lobiye katılırken hata: ${joinResponse.data.error || 'Bilinmeyen hata'}`, { 
          variant: 'error',
          autoHideDuration: 3000
        });
      }
    } catch (error) {
      console.error("Lobiye katılırken hata:", error);
      enqueueSnackbar('Lobiye katılırken bir hata oluştu', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };

  // useEffect içinde lobiye katılma işlemini çağıralım
  useEffect(() => {
    if (lobbyCode && user?.id && socket) {
      console.log("Lobiye katılma işlemi başlatılıyor...");
      // Eğer lobi zaten inceleniyorsa tekrar kaydolmamıza gerek yok
      if (lobby && (lobby.createdBy === user.id || lobby.owner === user.id)) {
        console.log("Ben lobi sahibiyim, ayrıca katılma işlemi gereksiz.");
        setHasJoinedLobby(true); // Lobi sahibi olarak katılmış sayılırız
        return;
      }
      
      // Henüz katılmadıysak, lobiye katıl
      if (!hasJoinedLobby) {
        console.log("Socket ve kullanıcı bilgileri hazır, lobiye katılıyorum");
      registerPlayerToLobby();
    }
    }
  }, [lobbyCode, user?.id, lobby, hasJoinedLobby, socket]);

  // Hazır durumu değiştirme fonksiyonu
  const toggleReadyStatus = async () => {
    // Lobi ID kontrolü
    if (!lobby || !lobby._id) {
      enqueueSnackbar('Lobi bilgisi bulunamadı', { 
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    const newReadyState = !isReady;
    
    try {
      // Client tarafında işlem yaptığımızı işaretle
      hasClientSideReadyUpdate.current = true;
      
      // Hazır durum geçiş zamanını güncelle
      readyStateTransitionTimeRef.current = Date.now();
      
      // Önce UI'da durumu güncelle (iyi kullanıcı deneyimi için)
      setIsReady(newReadyState);
      
      // Son bilinen durum referansını güncelle
      lastKnownReadyState.current = newReadyState;
      
      // Oyuncular listesinde kendi durumunu güncelle
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === user.id ? { ...player, isReady: newReadyState } : player
        )
      );
      
      // Sistem mesajı ekleyelim
      addSystemMessage(`${user?.username || 'Oyuncu'} ${newReadyState ? 'hazır' : 'hazır değil'}.`);
      
      // Sonra API'ye hazır durumunu gönderiyoruz
      console.log(`API'ye hazır durumu gönderiliyor: ${newReadyState}`);
      const response = await axiosInstance.post(`/lobbies/player-ready`, {
        lobbyId: lobby._id, 
        isReady: newReadyState
      });
      
      if (response.data && response.data.success) {
        console.log("API'ye hazır durumu gönderildi ve başarılı cevap alındı:", response.data);
        
        // Socket üzerinden diğer oyunculara bildirelim
        if (socket) {
          // Herkesin görebilmesi için önce socket event'ini gönder
          const socketData = {
            lobbyId: lobby._id,
            lobbyCode: lobbyCode,
            userId: user.id,
            isReady: newReadyState,
            timestamp: Date.now()
          };
          
          console.log("Socket üzerinden hazır durumu gönderiliyor:", socketData);
          socket.emit('playerStatusUpdate', socketData);
          
          // Kendimize özel status güncelleme event'i
          socket.emit('myStatusUpdate', socketData);
        }
        
        // 5 saniye sonra client-side güncellemeyi sıfırla
        setTimeout(() => {
          hasClientSideReadyUpdate.current = false;
          console.log("Client tarafı değişiklik koruması kaldırıldı");
        }, 5000);
        
        // Polling sırasında hazır durumunu ezmeyi engellemek için geçici olarak polling'i durdur
        if (pollingIntervalRef.current) {
          console.log("Polling geçici olarak duraklatılıyor (4 saniye)");
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          
          // 4 saniye sonra polling'i yeniden başlat
          setTimeout(() => {
            if (!pollingIntervalRef.current) {
              console.log("Polling yeniden başlatılıyor");
              startPolling();
            }
          }, 4000);
        }
        
        // UI'da hazır durumun doğru göründüğünden emin ol
        setTimeout(() => {
          if (isReady !== newReadyState) {
            console.log(`Hazır durumu kontrolü sonrası senkronizasyon: ${newReadyState}`);
            setIsReady(newReadyState);
          }
        }, 300);
        
        // Ekstra doğrulama - 3 saniye sonra bir kez daha UI ile server durumunu karşılaştır
        setTimeout(async () => {
          try {
            const checkResponse = await axiosInstance.get(`/lobbies/code/${lobbyCode}`);
            if (checkResponse.data && checkResponse.data.playersDetail) {
              const myDetails = checkResponse.data.playersDetail.find(p => {
                const playerId = p.user?._id || p.user;
                return playerId === user.id || 
                       (typeof playerId === 'object' && playerId?._id === user.id);
              });
              
              if (myDetails && myDetails.isReady !== isReady) {
                console.log(`Server durumu (${myDetails.isReady}) ile UI durumu (${isReady}) uyuşmuyor, düzeltiliyor`);
                setIsReady(myDetails.isReady);
                lastKnownReadyState.current = myDetails.isReady;
              }
            }
          } catch (error) {
            console.error("Durum doğrulama hatası:", error);
          }
        }, 3000);
      } else {
        console.error("Hazır durumu güncellenemedi:", response.data);
        
        // Başarısız olursa UI'ı geri al
        setIsReady(!newReadyState);
        lastKnownReadyState.current = !newReadyState;
        
        setPlayers(prevPlayers => 
          prevPlayers.map(player => 
            player.id === user.id ? { ...player, isReady: !newReadyState } : player
          )
        );
        
        // Client-side güncelleme işaretini kaldır
        hasClientSideReadyUpdate.current = false;
        
        // Kullanıcıya bildirim göster
        enqueueSnackbar(response.data?.message || 'Hazır durumu güncellenirken bir hata oluştu', { 
          variant: 'error',
          autoHideDuration: 3000
        });
      }
    } catch (error) {
      console.error("Hazır durumu güncellenirken hata oluştu:", error);
      
      // Hata durumunda UI'ı geri al
      setIsReady(!newReadyState);
      lastKnownReadyState.current = !newReadyState;
      
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === user.id ? { ...player, isReady: !newReadyState } : player
        )
      );
      
      // Client-side güncelleme işaretini kaldır
      hasClientSideReadyUpdate.current = false;
      
      // Hata mesajını detaylı göster
      const errorMessage = error.response?.data?.message || error.message || 'Hazır durumu güncellenirken bir hata oluştu';
      
      // Kullanıcıya bildirim göster
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };

  // Duplikasyonları kaldırmak için yardımcı fonksiyon - isOwner alanını da koruyarak
  function removeDuplicatePlayers(players) {
    if (!players || !Array.isArray(players)) return [];
    
    // ÖNEMLİ: Boş liste gelirse mevcut oyuncuları koru
    if (players.length === 0) {
      console.log("removeDuplicatePlayers: Boş liste, mevcut oyuncular korunuyor");
      return []; // Boş liste döndür, çağıran fonksiyon mevcut oyuncuları kullanacak
    }
    
    console.log("removeDuplicatePlayers çağrıldı, oyuncu sayısı:", players.length);
    
    // Önce geçersiz oyuncuları filtrele
    const validPlayerObjects = players.filter(player => player && typeof player === 'object' && player.id);
    
    // Benzersiz ID'leri tutmak için set kullanıyoruz
    const uniqueIds = new Set();
    const uniquePlayers = [];
    
    // Lobi sahibi bilgisi kontrolü
    const isLobbyOwner = user?.id && lobby && (lobby.createdBy === user.id || lobby.owner === user.id);
    
    // Mevcut kullanıcı bilgisi kontrolü
    if (user?.id) {
      // Önce kendimizi ekleyelim (her zaman öncelikli olsun)
      const currentUser = validPlayerObjects.find(player => 
        player && (
          player.id === user.id || 
          (typeof player.id === 'object' && player.id?._id === user.id)
        )
    );
    
    if (currentUser) {
        // Kendimize ait özel bilgileri ekle
        const enhancedCurrentUser = {
          ...currentUser,
          isOwner: isLobbyOwner,
          avatar: user.profileImage || currentUser.avatar // Her zaman güncel avatarı kullan
        };
        uniquePlayers.push(enhancedCurrentUser);
        uniqueIds.add(user.id.toString());
      } else if (isLobbyOwner || hasJoinedLobby) {
        // Kullanıcı listede değil ama lobi sahibiyse veya katılmışsa kendimizi ekleyelim
        console.log("Kendimi oyuncu listesine ekliyorum (removeDuplicatePlayers içinde)");
        const ownPlayer = {
          id: user.id,
          name: user.username || 'Oyuncu',
          avatar: user.profileImage,
          isReady: isReady || false,
          isBot: false,
          isOwner: isLobbyOwner
        };
        uniquePlayers.push(ownPlayer);
        uniqueIds.add(user.id.toString());
      }
    }
    
    // Sonra diğer oyuncuları ekleyelim
    for (const player of validPlayerObjects) {
      if (!player || !player.id) continue; // Geçersiz oyuncuları atla
      
      const playerId = player.id;
      const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
      
      // Zaten eklenmiş ID'li oyuncuları atla
      if (uniqueIds.has(playerIdStr)) continue;
      
      // Kendimiz değilse ekle
      if (user?.id && (
          playerIdStr === user.id.toString() || 
          (typeof playerId === 'object' && playerId?._id === user.id))
      ) continue;
      
      uniquePlayers.push(player);
      uniqueIds.add(playerIdStr);
    }
    
    console.log("removeDuplicatePlayers sonucu, benzersiz oyuncu sayısı:", uniquePlayers.length);
    return uniquePlayers;
  }
  
  // API yanıt formatları için doğrudan erişim uyarlaması
  const fetchLobbyData = async (overrideReady = false) => {
    try {
      if (!lobbyCode) {
        console.error('Lobi kodu bulunamadı, veri alınamadı');
        return;
      }
      
      // Client tarafında güncelleme varsa ve override true değilse, işlemi atla
      if (hasClientSideReadyUpdate.current && !overrideReady) {
        console.log("Client tarafında yakın zamanda bir güncelleme yapıldı, mevcut veriyi koruyorum");
        return;
      }
      
      // Mevcut hazır durumu koru
      const currentReadyState = isReady;
      console.log(`Polling: Mevcut hazır durumum: ${currentReadyState}, override: ${overrideReady}`);
      
      // Bağlantı durumunu önceden bilinen hazır durumunu güncelle
      if (currentReadyState !== null) {
        lastKnownReadyState.current = currentReadyState;
      }
      
      console.log('API\'den güncel lobi bilgileri alınıyor:', lobbyCode);
      
      try {
        const response = await axiosInstance.get(`/lobbies/code/${lobbyCode}`);
        
        if (!response.data) {
          console.error('API yanıtı geçersiz');
          return;
        }
        
        // API yanıtında kendi hazır durumumu kontrol et ve logla
        const apiPlayerData = response.data.players?.find(p => (p._id || p.id) === user?.id) || 
                              response.data.playersDetail?.find(p => {
                                const playerId = p.user?._id || p.user;
                                return playerId === user?.id || 
                                       (typeof playerId === 'object' && playerId?._id === user?.id);
                              });
                              
        if (apiPlayerData) {
          console.log("Database'deki hazır durumu:", apiPlayerData.isReady);
          console.log("Mevcut UI hazır durumu:", currentReadyState);
          
          // Eğer socket bağlantısı kopuksa veya override true ise ve database yanıtı güvenilir ise
          if (apiPlayerData.isReady !== undefined && (overrideReady || !isSocketConnected)) {
            // Database'den gelen hazır durumu kullan
            const databaseReadyState = apiPlayerData.isReady;
            
            if (databaseReadyState !== currentReadyState) {
              console.log(`Hazır durumunu database'den güncelliyorum: ${databaseReadyState} (önceki durum: ${currentReadyState})`);
              setIsReady(databaseReadyState);
              lastKnownReadyState.current = databaseReadyState;
            }
          }
        }
        
        // Lobi bilgisini güncelle
        setLobby(response.data);
        
        // Lobi sahibi mi kontrol et
        const isLobbyOwner = response.data.createdBy === user?.id || response.data.owner === user?.id;
        
        // Lobi sahibiyse katılmış olarak işaretle
        if (isLobbyOwner && !hasJoinedLobby) {
          console.log("Lobi sahibi olduğum tespit edildi, katılmış olarak işaretliyorum");
          setHasJoinedLobby(true);
        }
        
        // API'den oyuncu bilgilerini al
        let apiPlayers = [];
        let foundApiPlayers = false;
        
        // ÖNCE playersDetail dizisini kontrol et (daha güvenilir bilgiler içerir)
        if (response.data.playersDetail && Array.isArray(response.data.playersDetail) && response.data.playersDetail.length > 0) {
          apiPlayers = response.data.playersDetail;
          foundApiPlayers = true;
          console.log('API\'den oyuncular alındı (playersDetail):', apiPlayers);
        }
        // Sonra players dizisiyle çalış
        else if (response.data.players && Array.isArray(response.data.players) && response.data.players.length > 0) {
          apiPlayers = response.data.players;
          foundApiPlayers = true;
          console.log('API\'den oyuncular alındı (players):', apiPlayers);
        }
        
        // API'den oyuncu bilgisi bulunamadıysa mevcut oyuncuları koru
        if (!foundApiPlayers || apiPlayers.length === 0) {
          console.log('API\'den oyuncu bilgisi alınamadı, mevcut listeyi koruyorum');
          return;
        }
        
        // TÜM oyuncuları işle
        let allProcessedPlayers = [];
        let currentUserReadyState = null;
        
        // ÖNCELİKLE playersDetail dizisinden bilgileri çek (daha güvenilir)
        if (response.data.playersDetail && Array.isArray(response.data.playersDetail)) {
          const processedFromDetails = response.data.playersDetail.map(player => {
            let playerId = player.user;
            if (typeof playerId === 'object') {
              playerId = playerId?._id || playerId?.id || null;
            }
            const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
            
            // Kullanıcının kendisi mi kontrol et
            if (playerIdStr === user?.id) {
              // Kullanıcı hazır durumu kontrolü
              const apiReadyStatus = player.isReady || false;
              currentUserReadyState = apiReadyStatus; // Kullanıcı hazır durumunu kaydet
              
              console.log(`API'den gelen kendi hazır durumum (detail): ${apiReadyStatus}, mevcut durumum: ${currentReadyState}`);
              
              // Durum değiştiyse ve override yapılması gerekiyorsa local state'i güncelle
              if (apiReadyStatus !== currentReadyState && overrideReady) {
                console.log(`Hazır durumumu API'den güncelliyorum (detail): ${apiReadyStatus}`);
                setIsReady(apiReadyStatus);
                lastKnownReadyState.current = apiReadyStatus;
              }
              
              return {
                id: user?.id,
                name: user?.username || player.name || 'Oyuncu',
                avatar: user?.profileImage || null,
                isReady: overrideReady ? apiReadyStatus : currentReadyState,
                isBot: false,
                isOwner: isLobbyOwner
              };
            }
            
            // Diğer oyuncuları ekle
            const existingPlayer = players.find(p => p.id === playerIdStr);
            return {
              id: playerIdStr,
              name: player.name || player.user?.username || (existingPlayer?.name || `Oyuncu #${playerIdStr?.substring(0, 6) || 'Bilinmeyen'}`),
              avatar: player.user?.profileImage || (existingPlayer?.avatar || null),
              isReady: player.isReady || false,
              isBot: player.isBot || false,
              isOwner: response.data.createdBy === playerIdStr || response.data.owner === playerIdStr
            };
          });
          
          allProcessedPlayers = [...allProcessedPlayers, ...processedFromDetails];
        }
        
        // SONRA players dizisinden bilgileri çek (daha az güvenilir)
        if (response.data.players && Array.isArray(response.data.players)) {
          const processedFromPlayers = response.data.players.map(player => {
            const playerId = player._id || player.id;
            const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
            
            // Kullanıcının kendisi mi kontrol et
            if (playerIdStr === user?.id) {
              // Kullanıcı hazır durumu kontrolü
              const apiReadyStatus = player.isReady || false;
              
              // Eğer detail'den zaten hazır durumu aldıysak, onu kullan
              if (currentUserReadyState !== null) {
                return {
                  id: user?.id,
                  name: user?.username || player.username || player.name || 'Oyuncu',
                  avatar: user?.profileImage || player.profileImage || player.avatar || null,
                  isReady: overrideReady ? currentUserReadyState : currentReadyState,
                  isBot: false,
                  isOwner: isLobbyOwner
                };
              }
              
              // Detail'den hazır durumu almadıysak, bu durumu kullan
              console.log(`API'den gelen kendi hazır durumum: ${apiReadyStatus}, mevcut durumum: ${currentReadyState}`);
              currentUserReadyState = apiReadyStatus; // Kullanıcı hazır durumunu kaydet
              
              // Durum değiştiyse ve override yapılması gerekiyorsa local state'i güncelle
              if (apiReadyStatus !== currentReadyState && overrideReady) {
                console.log(`Hazır durumumu API'den güncelliyorum: ${apiReadyStatus}`);
                setIsReady(apiReadyStatus);
                lastKnownReadyState.current = apiReadyStatus;
              }
              
              return {
                id: user?.id,
                name: user?.username || player.username || player.name || 'Oyuncu',
                avatar: user?.profileImage || player.profileImage || player.avatar || null,
                isReady: overrideReady ? apiReadyStatus : currentReadyState,
                isBot: false,
                isOwner: isLobbyOwner
              };
            }
            
            // Diğer oyuncuları ekle
            const existingPlayer = players.find(p => p.id === playerIdStr);
            return {
              id: playerIdStr,
              name: player.username || player.name || (existingPlayer?.name || 'Oyuncu'),
              avatar: player.profileImage || player.avatar || (existingPlayer?.avatar || null),
              isReady: player.isReady || false,
              isBot: player.isBot || false,
              isOwner: response.data.createdBy === playerIdStr || response.data.owner === playerIdStr
            };
          });
          
          // Eğer playersDetail'den oyuncu bulamadıysak players'dan bilgileri kullan
          if (allProcessedPlayers.length === 0) {
            allProcessedPlayers = [...allProcessedPlayers, ...processedFromPlayers];
          } else {
            // playersDetail'de bulunamayan oyuncuları ekle
            for (const player of processedFromPlayers) {
              if (!allProcessedPlayers.some(p => p.id === player.id)) {
                allProcessedPlayers.push(player);
              }
            }
          }
        }
        
        // Benzersiz oyuncuları çıkar (aynı ID'ye sahip oyuncuları birleştir)
        const uniquePlayers = [];
        const playerIds = new Set();
        
        // Önce kendimizi ekle (her zaman listenin başına)
        if (user?.id) {
          const selfPlayer = allProcessedPlayers.find(p => p.id === user?.id);
          if (selfPlayer) {
            // Eğer hazır durumu API'den alındıysa ve override istendiyse kullan, değilse mevcut durumu koru
            const finalReadyState = overrideReady && currentUserReadyState !== null ? 
                                    currentUserReadyState : currentReadyState;
            
            uniquePlayers.push({
              ...selfPlayer,
              isReady: finalReadyState // Hazır durumu kontrolünü sağlamlaştır
            });
            playerIds.add(user.id);
            
            console.log(`Kendi hazır durumumu ${overrideReady ? 'API\'den güncelliyorum' : 'koruyorum'}: ${finalReadyState}`);
          } else {
            uniquePlayers.push({
              id: user.id,
              name: user.username || 'Oyuncu',
              avatar: user.profileImage,
              isReady: currentReadyState, // Kendi hazır durumunu koru
              isBot: false,
              isOwner: isLobbyOwner
            });
            playerIds.add(user.id);
            
            console.log(`Kendimi oyuncu listesine ekliyorum, hazır durumum: ${currentReadyState}`);
          }
        }
        
        // Sonra diğer oyuncuları ekle
        for (const player of allProcessedPlayers) {
          if (!player || !player.id) continue;
          
          // Zaten eklenmiş oyuncuları atla
          if (playerIds.has(player.id)) continue;
          
          uniquePlayers.push(player);
          playerIds.add(player.id);
        }
        
        console.log('İşlenmiş benzersiz oyuncular (final liste):', uniquePlayers);
        
        // Hazır durumlarını detaylı kontrol et
        uniquePlayers.forEach(player => {
          console.log(`Oyuncu: ${player.name}, Hazır: ${player.isReady}, Ben mi: ${player.id === user?.id}`);
        });
        
        // Oyuncuları güncelle
        setPlayers(uniquePlayers);
        
        // Mesaj bilgilerini al
        if (response.data.messages && Array.isArray(response.data.messages)) {
          const apiMessages = response.data.messages.map(msg => ({
            id: msg._id || msg.id || Date.now(),
            sender: {
              id: msg.sender?._id || msg.sender?.id || 'unknown',
              name: msg.sender?.username || msg.sender?.name || 'Bilinmeyen'
            },
            text: msg.text || msg.content || '',
            timestamp: msg.createdAt || msg.timestamp || new Date().toISOString()
          }));
          
          // Mesajları güncelle
          updateMessages(apiMessages);
        }
      } catch (apiError) {
        // API 404 hatası (lobi bulunamadı) - kullanıcıya yönlendirme yap
        if (apiError.response && apiError.response.status === 404) {
          console.error('Lobi bulunamadı (404):', lobbyCode);
          enqueueSnackbar('Lobi artık mevcut değil veya silinmiş.', {
            variant: 'error',
            autoHideDuration: 3000
          });
          
          // Ana sayfaya yönlendir (5 saniye bekle)
          setTimeout(() => {
            navigate('/home');
          }, 5000);
          
          return;
        }
        
        // Diğer API hataları
        throw apiError;
      }
    } catch (error) {
      console.error('API\'den lobi verileri alınırken hata:', error);
      
      // Belirli hata türlerini işle
      if (error.response) {
        // Sunucu yanıtı ama hata kodu (500, 403 vb.)
        console.error('API hata kodu:', error.response.status);
        
        // Özel hata mesajları
        if (error.response.status === 500) {
          enqueueSnackbar('Sunucu hatası, lütfen daha sonra tekrar deneyin.', {
            variant: 'error',
            autoHideDuration: 5000
          });
        } else if (error.response.status === 403) {
          enqueueSnackbar('Bu lobiye erişim izniniz yok.', {
            variant: 'warning',
            autoHideDuration: 5000
          });
          
          // Ana sayfaya yönlendir
          setTimeout(() => {
            navigate('/home');
          }, 3000);
        }
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        console.error('API yanıt vermedi:', error.request);
        enqueueSnackbar('Sunucuya bağlanılamıyor, lütfen internet bağlantınızı kontrol edin.', {
          variant: 'error',
          autoHideDuration: 5000
        });
      }
      
      // Hata durumunda kendimizi koruyalım
      if (user?.id && (hasJoinedLobby || (lobby && (lobby.createdBy === user.id || lobby.owner === user.id)))) {
        console.log("Hata durumunda kendimi oyuncu listesinde koruyorum");
        
        setPlayers(prevPlayers => {
          if (!prevPlayers.some(p => p.id === user.id)) {
            return [...prevPlayers, {
              id: user.id,
              name: user.username || 'Oyuncu',
              avatar: user.profileImage,
              isReady: isReady, // Mevcut hazır durumunu koru
              isBot: false,
              isOwner: lobby?.createdBy === user.id || lobby?.owner === user.id
            }];
          }
          return prevPlayers;
        });
      }
      
      // Polling olmadan tekrar denemek için 10 saniye sonra manuel güncelleme
      setTimeout(() => {
        console.log("Hata sonrası 10 saniye beklenildi, tekrar deneniyor...");
        try {
          fetchLobbyData(false);
        } catch (retryError) {
          console.error("Yeniden deneme başarısız oldu:", retryError);
        }
      }, 10000);
    }
  };

  // Yeni mesajları eklemek için yardımcı fonksiyon
  const updateMessages = (newMessages) => {
    setMessages(prevMessages => {
      // Mevcut ID'leri tut
      const existingIds = new Set(prevMessages.map(msg => msg.id));
      
      // Sadece yeni mesajları ekle
      const messagesToAdd = newMessages.filter(msg => !existingIds.has(msg.id));
      
      if (messagesToAdd.length === 0) return prevMessages;
      
      // Yeni mesajları ekle ve zamana göre sırala
      return [...prevMessages, ...messagesToAdd].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    });
  };

  // Mesaj gönderme - API entegrasyonu ekleyelim
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    // Yeni mesajı oluştur
    const newMsg = {
      id: Date.now(),
      sender: { id: user.id, name: user.username },
      text: newMessage,
      timestamp: new Date().toISOString()
    };
    
    // Önce mesajı yerel olarak ekle
    setMessages(prevMessages => [...prevMessages, newMsg]);
    setNewMessage('');
    
    // API'ye mesajı gönder - /api/ öneki olmadan
    try {
      await axiosInstance.post(`/lobbies/${lobbyCode}/messages`, {
        lobbyCode,
        senderId: user.id,
        message: newMessage
      });
      console.log('Mesaj API\'ye gönderildi');
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
    }
  };

  // Mesajlar güncellendiğinde otomatik olarak en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Hazır durumu değiştiğinde oyuncu durumunu güncelle - bu da duplikasyonlara neden olabilir
  useEffect(() => {
    if (!user?.id) return;
    
    // Oyuncular listesinde mevcut kullanıcıyı bul ve güncelle
    // Önce mevcut kullanıcının listede olup olmadığını kontrol edelim
    const currentPlayerExists = Array.isArray(players) && players.some(player => 
      player.id === user.id || 
      (typeof player.id === 'object' && player.id?._id === user.id)
    );
    
    if (currentPlayerExists) {
      // Mevcut kullanıcı varsa, durum güncelleniyor
      const updatedPlayers = players.map(player => {
        if (player.id === user.id || (typeof player.id === 'object' && player.id?._id === user.id)) {
          return { ...player, isReady };
        }
        return player;
      });
      
      // Geri dön ve duplikasyonları temizle
      setPlayers(removeDuplicatePlayers(updatedPlayers));
    } else if (Array.isArray(players)) {
      // Mevcut kullanıcı yoksa, ekle
      const newPlayer = {
        id: user.id,
        name: user.username || 'Oyuncu',
        avatar: user.profileImage,
        isReady: isReady,
        isBot: false
      };
      
      // Yeni oyuncuyu ekle ve duplikasyonları temizle
      setPlayers(prevPlayers => removeDuplicatePlayers([...prevPlayers, newPlayer]));
    }
    
  }, [isReady, user?.id]);
  
  // Tüm oyuncular hazır mı kontrol et ve 10 saniyelik geri sayımı başlat
  useEffect(() => {
    // Geri sayım başlatılmışsa players değiştiğinde geri sayımı yeniden başlatma
    if (startCountdown !== null) {
      return;
    }
    
    // Maksimum oyuncu sayısını al
    const maxPlayers = lobby?.maxPlayers || 6;
    
    // Lobi tam dolu değilse veya oyuncular minimum sayıdan az ise işlemi durdur
    if (players.length < maxPlayers) {
      setAllPlayersReady(false);
      setStartCountdown(null);
      return;
    }
    
    // Tüm oyuncuların hazır olup olmadığını kontrol et
    const allReady = players.every(player => player.isReady);
    
    // State'i güncelle
    setAllPlayersReady(allReady);
    
    // Eğer tüm oyuncular hazırsa ve lobi tamamen doluysa geri sayımı başlat
    if (allReady && players.length === maxPlayers) {
      console.log(`Lobi tam dolu (${players.length}/${maxPlayers}) ve tüm oyuncular hazır! Geri sayım başlatılıyor: 10 saniye`);
      console.log("Hazır oyuncular:", players.filter(p => p.isReady).length);
      console.log("Toplam oyuncular:", players.length);
      setStartCountdown(10);
    } else {
      // Debug için hazır olmayan oyuncuları logla
      if (!allReady) {
        const notReadyPlayers = players.filter(p => !p.isReady);
        console.log("Hazır olmayan oyuncular:", notReadyPlayers.map(p => p.name));
      }
      setStartCountdown(null);
    }
  }, [players, startCountdown, lobby?.maxPlayers]);
  
  // Geri sayım efekti - oyun otomatik başlayacak
  useEffect(() => {
    if (startCountdown === null) return;
    
    // Maksimum oyuncu sayısını al
    const maxPlayers = lobby?.maxPlayers || 6;
    
    // Oyuncu hazır durumlarını kontrol et
    const checkAllPlayersReady = () => {
      // Hem tüm oyuncuların hazır olduğunu hem de oyuncuların tam kapasitede olduğunu kontrol et
      const allPlayersReady = players.every(player => player.isReady) && players.length === maxPlayers;
      
      if (!allPlayersReady) {
        if (players.length < maxPlayers) {
          console.log(`Lobi tam dolu değil: ${players.length}/${maxPlayers}`);
        } else {
          console.log("Hazır olmayan oyuncular bulundu:", 
            players.filter(p => !p.isReady).map(p => p.name));
        }
      }
      return allPlayersReady;
    };
    
    if (startCountdown > 0) {
      // Yeni bir timeout başlatmadan önce oyuncuların hazır durumunu kontrol et
      if (!checkAllPlayersReady()) {
        console.log("Oyuncuların hazır durumu değişti veya lobi tam dolu değil, geri sayım iptal ediliyor");
        setStartCountdown(null);
        return;
      }
      
      const timer = setTimeout(() => {
        // Timeout tetiklendiğinde tekrar kontrol et
        if (!checkAllPlayersReady()) {
          console.log("Oyuncuların hazır durumu değişti veya lobi tam dolu değil, geri sayım iptal ediliyor (timer)");
          setStartCountdown(null);
          return;
        }
        
        // Oyuncular halen hazırsa geri sayımı devam ettir
        setStartCountdown(prevCount => prevCount - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } 
    
    if (startCountdown === 0) {
      // Oyun başlamadan önce son bir kontrol yapalım
      if (!checkAllPlayersReady()) {
        console.log("Oyuncuların hazır durumu değişti veya lobi tam dolu değil, geri sayım iptal edildi!");
        setStartCountdown(null);
        return;
      }
      
      console.log("Geri sayım bitti, oyun başlatılıyor!");
      startGame(); // Oyunu başlat
    }
  }, [startCountdown, players, lobby?.maxPlayers]);
  
  // Oyuncu hazır durumu değiştiğinde geri sayımı kontrol et
  useEffect(() => {
    // Geri sayım varsa ve herhangi bir oyuncu hazır değilse, iptal et
    if (startCountdown !== null) {
      const allStillReady = players.every(player => player.isReady);
      
      if (!allStillReady) {
        console.log("Bir oyuncu hazır olmaktan çıktı, geri sayım iptal ediliyor");
        setStartCountdown(null);
      }
    }
  }, [isReady, players, startCountdown]);
  
  // Lobi kodunu kopyala
  const handleCopyLobbyCode = () => {
    if (lobbyCode) {
      navigator.clipboard.writeText(lobbyCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };
  
  // Oyunu başlat
  const startGame = () => {
    console.log("Oyun başlatılıyor...");
    
    // Sistem mesajı ekle
    addSystemMessage('Oyun başlatılıyor...');
    
    try {
      // Şu anki kullanıcı veya varsayılan değer
      const currentUser = user || { id: `guest_${Date.now()}` };
      
      // Önce lobi durumunu "playing" olarak güncelle
      try {
        // Lobi ID kontrolü
        if (lobby?._id) {
          console.log("Lobi durumu 'playing' olarak güncelleniyor...");
          
          // API isteği gönder
          axiosInstance.patch(`/lobbies/${lobby._id}`, { 
            status: 'playing' 
          })
          .then(response => {
            console.log("Lobi durumu başarıyla güncellendi:", response.data);
            
            // Socket üzerinden diğer oyunculara bildirelim
            if (socket) {
              socket.emit('lobbyStatusUpdated', {
                lobbyId: lobby._id,
                status: 'playing'
              });
            }
          })
          .catch(err => {
            console.error("Lobi durumu güncellenirken hata:", err);
          });
          
          // Lobi kodu ile de güncelleme yapalım (yedekleme)
          axiosInstance.patch(`/lobbies/code/${lobbyCode}`, { 
            status: 'playing' 
          })
          .then(response => {
            console.log("Lobi durumu (kod ile) başarıyla güncellendi:", response.data);
          })
          .catch(err => {
            console.error("Lobi durumu (kod ile) güncellenirken hata:", err);
          });
        } else if (lobbyCode) {
          // Sadece lobbyCode varsa onunla güncelle
          axiosInstance.patch(`/lobbies/code/${lobbyCode}`, { 
            status: 'playing' 
          })
          .then(response => {
            console.log("Lobi durumu (kod ile) başarıyla güncellendi:", response.data);
          })
          .catch(err => {
            console.error("Lobi durumu (kod ile) güncellenirken hata:", err);
          });
        }
      } catch (updateError) {
        console.error("Lobi durumu güncellenirken beklenmeyen hata:", updateError);
      }
      
      // LocalStorage'a oyuncu bilgilerini kaydet
      try {
        localStorage.setItem('tombala_playerId', currentUser.id);
        localStorage.setItem('tombala_lobbyId', lobby?._id || "");
        localStorage.setItem('tombala_lobbyCode', lobbyCode);
        localStorage.setItem('tombala_timestamp', Date.now());
        localStorage.setItem('tombala_lobbyName', lobby?.name || "Tombala Lobisi");
      } catch (e) {
        console.warn('localStorage hatası:', e);
      }
      
      // Oyun başlatılırken socket üzerinden bildirim gönder (eğer socket bağlantısı varsa)
      if (socket) {
        socket.emit('gameStarted', {
          lobbyId: lobby?._id || lobbyCode,
          startedBy: currentUser.id,
          status: 'playing' // Status bilgisini de ekleyelim
        });
      }
      
      // URL parametreleri ile direct-tombala'ya yönlendir
      const playerId = currentUser.id;
      const lobbyName = lobby?.name || 'Tombala Lobisi';
      
      // Frontend için sabit URL oluştur (port 5174)
      const hostname = window.location.hostname; // localhost veya domain adı
      const frontendURL = `http://${hostname}:5174`; // Doğrudan 5174 portunu belirt
      
      // URL parametrelerini oluştur - sabit frontend URL kullanarak
      const directTombalaURL = `${frontendURL}/direct-tombala/${lobbyCode}?playerId=${encodeURIComponent(playerId)}&lobbyName=${encodeURIComponent(lobbyName)}`;
      
      console.log(`Oyun başlatılıyor, yönlendiriliyor: ${directTombalaURL}`);
      
      // Kısa bir gecikme ile yönlendir (status güncellemesinin tamamlanması için)
      setTimeout(() => {
        window.location.href = directTombalaURL;
      }, 1000);
      
    } catch (error) {
      console.error("Oyun başlatılırken hata oluştu:", error);
      addSystemMessage('Oyun başlatılırken bir hata oluştu.');
      enqueueSnackbar('Oyun başlatılırken bir hata oluştu.', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };
  
  // Sistem mesajı ekle
  const addSystemMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      sender: { id: 'system', name: 'Sistem' },
      text,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMsg]);
  };

  // Bot ekleme - API kullanarak
  const addBot = async () => {
    try {
      // Lobi bilgisi kontrolü
      if (!lobbyCode && (!lobby || !lobby._id)) {
        enqueueSnackbar('Lobi bilgisi bulunamadı', { 
          variant: 'error',
          autoHideDuration: 3000
        });
        return;
      }

      // Mevcut bot sayısını ve gerçek oyuncu sayısını kontrol et
      const currentBots = players.filter(p => p.isBot).length;
      const realPlayers = players.filter(p => !p.isBot).length;
      const maxPlayers = lobby?.maxPlayers || 6;
      
      // Teorik olarak eklenebilecek maksimum bot sayısı
      const maxPossibleBots = maxPlayers - realPlayers;
      
      if (currentBots >= maxPossibleBots) {
        enqueueSnackbar(`Maksimum bot sayısına ulaşıldı. En fazla ${maxPossibleBots} bot ekleyebilirsiniz.`, { 
          variant: 'warning',
          autoHideDuration: 5000
        });
        return;
      }
      
      if (players.length >= maxPlayers) {
        enqueueSnackbar('Lobi dolu, daha fazla bot eklenemez', { 
          variant: 'warning',
          autoHideDuration: 3000
        });
        return;
      }

      // API ile botu lobiye ekle - hem lobbyId hem de lobbyCode ile çalışabilir
      const response = await axiosInstance.post(`/lobbies/add-bot`, {
        lobbyId: lobby?._id,
        lobbyCode: lobbyCode
      });
      
      if (response.data.success) {
        // Sistem mesajı ekle
        const botName = response.data.bot?.name || 'Bot';
        addSystemMessage(`${botName} lobiye katıldı.`);
        
        // Socket üzerinden diğer oyunculara bildirelim
        if (socket && response.data.bot) {
          socket.emit('botAdded', {
            lobbyId: lobby?._id || response.data.lobby?._id,
            bot: response.data.bot
          });
        }
        
        // Lobi bilgilerini güncelle
        if (response.data.lobby) {
          setLobby(response.data.lobby);
        }
        
        // Güncel lobi verilerini al
        await fetchLobbyData();
        
        // Kullanıcıya bildirim göster
        enqueueSnackbar('Bot başarıyla eklendi', { 
          variant: 'success',
          autoHideDuration: 3000
        });
      } else {
        console.error("Bot ekleme başarısız oldu:", response.data);
        enqueueSnackbar(response.data.message || 'Bot eklenirken bir hata oluştu', { 
          variant: 'error',
          autoHideDuration: 3000
        });
      }
    } catch (error) {
      console.error('Bot eklenirken hata:', error);
      const errorMessage = error.response?.data?.message || 'Bot eklenirken bir hata oluştu';
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };

  // Socket bağlantı durumunu takip etmek için
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // useEffect içinde Socket.io event listener'ları
  useEffect(() => {
    if (!socket || !user) return;

    console.log("Socket bağlantısı için event listener'lar ayarlanıyor...");

    // Socket event'lerinin çalıştığından emin olmak için debug
    const socketDebug = () => {
      const connected = socket.connected;
      console.log("Socket bağlantı durumu:", connected);
      console.log("Socket ID:", socket.id);
      console.log("Socket event'leri:", socket.hasListeners('playerStatusUpdate'));
      
      // Bağlantı durumunu state'e kaydet
      setIsSocketConnected(connected);
      
      // Bağlantı durumu değiştiyse ve hazır durumu varsa kontrol et
      if (connected && lastKnownReadyState.current !== null && lobby?._id) {
        console.log("Socket bağlantısı kuruldu, hazır durumumu yeniden gönderiyorum:", lastKnownReadyState.current);
        
        // Hazır durumunu socket üzerinden yeniden gönder
        socket.emit('playerStatusUpdate', {
          lobbyId: lobby._id,
          lobbyCode: lobbyCode,
          userId: user.id,
          isReady: lastKnownReadyState.current,
          timestamp: Date.now()
        });
        
        // Kendimize özel status güncelleme event'i
        socket.emit('myStatusUpdate', {
          lobbyId: lobby._id,
          lobbyCode: lobbyCode,
          userId: user.id,
          isReady: lastKnownReadyState.current,
          timestamp: Date.now()
        });
        
        // State ve UI güncellemesi
        if (isReady !== lastKnownReadyState.current) {
          setIsReady(lastKnownReadyState.current);
        }
      }
    };

    // 3 saniyede bir soket durumunu kontrol et
    const debugInterval = setInterval(socketDebug, 3000);

    // Direkt olarak kullanılacak oyuncu durum güncellemesi fonksiyonu
    const handlePlayerStatus = (data) => {
      if (!data) {
        console.error("Socket event'inden geçersiz veri:", data);
        return;
      }
      
      // UserId kontrolü - veri formatı farklı olabilir
      let userId = data.userId;
      
      // Eğer userId yoksa farklı formatlarda kontrol et
      if (!userId && data.user) {
        userId = data.user?._id || data.user;
      }
      
      // Eğer sadece isReady ve updateTime varsa, bu muhtemelen bizim kendi güncellememiz
      if (!userId && data.isReady !== undefined && data.updateTime) {
        userId = user?.id;
        console.log("updateTime içeren veri bizim için gelmiş bir güncelleme, kendi ID'miz kullanılıyor:", user?.id);
      }
      
      // Hala userId yoksa ve farklı veri formatında olabilir
      if (!userId && data.lobbyId && (data.isReady !== undefined)) {
        // Bu durumda kendimize gelen bir güncelleme varsayalım
        userId = user?.id;
        console.log("Socket event'inden userId tespit edilemedi, kendimize ait kabul ediyoruz:", data);
      }
      
      if (!userId) {
        console.error("Socket event'inden userId belirlenemedi:", data);
        // Hata olsa bile isReady durumu güncellenmek isteniyorsa işlemi devam ettir
        if (data.isReady !== undefined) {
          userId = user?.id; // Varsayılan olarak kendi kullanıcımız için güncelleme kabul et
          console.log("Kullanıcı tanımlanamadı ama isReady bilgisi var, kendi ID'mizi kullanıyoruz:", userId);
        } else {
          return; // İşlenebilir veri yok, çık
        }
      }
      
      console.log("Socket: Oyuncu durumu güncelleme verisi alındı:", { userId, isReady: data.isReady });
      
      // UI'ı hemen güncelle - bu kısım hızlı tepki için
      setPlayers(prevPlayers => {
        const updatedPlayers = prevPlayers.map(player => {
          const playerId = player.id;
          const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
          const userIdStr = typeof userId === 'string' ? userId : String(userId || '');
          
          // ID eşleşmesi kontrolü
          if (playerIdStr === userIdStr) {
            console.log(`Socket üzerinden ${player.name} hazır durumu güncelleniyor: ${data.isReady}`);
            return { ...player, isReady: data.isReady };
          }
          return player;
        });
        
        return updatedPlayers;
      });
      
      // Kendimiz için güncelleme ise hazır durumu state'ini de güncelle
      if (userId.toString() === user?.id?.toString()) {
        console.log(`Kendi hazır durumumu socket event'inden güncelliyorum: ${data.isReady}`);
        setIsReady(data.isReady);
        lastKnownReadyState.current = data.isReady;
        
        // Hazır durum geçiş zamanını güncelleyelim
        readyStateTransitionTimeRef.current = Date.now();
      }
    };

    // Socket.io event listener'ları
    socket.on('playerStatusUpdate', handlePlayerStatus);
    socket.on('myStatusUpdate', handlePlayerStatus);
    socket.on('botAdded', handleBotAdded);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('lobbyDeleted', handleLobbyDeleted);
    socket.on('lobbyUpdated', () => {
      console.log('Socket: Lobi güncellendi, veriler yenileniyor');
      fetchLobbyData(false);
    });
    
    // Socket'e tekrar bağlan
    socket.connect();
    console.log("Socket bağlantısı yeniden kuruldu.");
    
    // Bağlantı kontrolü
    socket.on('connect', () => {
      console.log('Socket bağlantısı kuruldu:', socket.id);
      setIsSocketConnected(true);
      
      // Bağlantı sonrası kimlik doğrulama yap
      if (user?.id) {
        socket.emit('identify', user.id);
        console.log('Socket kimlik bilgisi gönderildi:', user.id);
        
        // Hazır durumunu yeniden gönder (eğer varsa)
        if (lastKnownReadyState.current !== null && lobby?._id) {
          console.log("Bağlantı sonrası hazır durumumu gönderiyorum:", lastKnownReadyState.current);
          
          // Kısa bir gecikme ile gönder (kimlik doğrulamasının tamamlanması için)
          setTimeout(() => {
            socket.emit('playerStatusUpdate', {
              lobbyId: lobby._id,
              lobbyCode: lobbyCode,
              userId: user.id,
              isReady: lastKnownReadyState.current,
              timestamp: Date.now()
            });
          }, 1000);
        }
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Socket bağlantısı koptu');
      setIsSocketConnected(false);
      
      // Son bilinen hazır durumunu kaydet
      lastKnownReadyState.current = isReady;
      console.log("Bağlantı koptuğunda son hazır durumum:", isReady);
    });

    // Her 10 saniyede bir tam yenileme yap - daha sık olsun
    const fullRefreshInterval = setInterval(() => {
      // Socket bağlantısı yoksa daha sık güncelle
      if (!isSocketConnected) {
        console.log('Socket bağlantısı yok, daha sık güncelleme yapıyorum');
      }
      
      console.log('Tam yenileme: Tüm lobi verilerini API\'den alıyorum');
      fetchLobbyData(false);
    }, 10000);

    // Cleanup fonksiyonu
    return () => {
      console.log("Socket listener'lar temizleniyor...");
      socket.off('playerStatusUpdate', handlePlayerStatus);
      socket.off('myStatusUpdate', handlePlayerStatus);
      socket.off('botAdded', handleBotAdded);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('lobbyDeleted', handleLobbyDeleted);
      socket.off('lobbyUpdated');
      socket.off('connect');
      socket.off('disconnect');
      clearInterval(fullRefreshInterval);
      clearInterval(debugInterval);
    };
  }, [socket, user, lobbyCode, navigate, enqueueSnackbar, lobby?._id, isReady]);

  // Lobiden çıkış yapma fonksiyonu
  const leaveLobby = async () => {
    try {
      if (!lobbyCode || !user?.id) {
        console.error("Lobiden çıkış için gerekli bilgiler eksik:", { lobbyCode, userId: user?.id });
        return;
      }
      
      console.log("Lobiden çıkış yapılıyor...", lobbyCode);
      
      // Socket.io üzerinden çıkış olayını tetikle
      if (socket) {
        socket.emit('leaveLobby', {
          lobbyCode: lobbyCode,
          userId: user.id
        });
      }
      
      // API'den lobiden çıkış isteği gönder
      const response = await axiosInstance.post('/lobbies/leave-by-code', {
        lobbyCode: lobbyCode
      });
      
      if (response.data.success) {
        enqueueSnackbar('Lobiden başarıyla ayrıldınız', { 
          variant: 'success',
          autoHideDuration: 3000
        });
        
        // Ana sayfaya yönlendir
        navigate('/home');
      } else {
        console.error("Lobiden çıkış başarısız:", response.data);
        enqueueSnackbar(response.data.error || 'Lobiden çıkış yapılırken bir hata oluştu', { 
          variant: 'error', 
          autoHideDuration: 3000
        });
      }
    } catch (error) {
      console.error("Lobiden çıkış hatası:", error);
      enqueueSnackbar('Lobiden çıkış yapılırken bir hata oluştu', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };

  // useEffect içinde lobi senkronizasyonu için özel bir efekt ekleyelim
  useEffect(() => {
    // Eğer lobiden playersDetail gelirse ve mevcut kullanıcı bilgisi varsa
    if (lobby?.playersDetail && user?.id) {
      console.log("Lobi güncellendi, kullanıcının hazır durumu kontrol ediliyor...");
      
      // Mevcut kullanıcının lobi içindeki bilgilerini bul
      const currentUserDetail = lobby.playersDetail.find(
        player => {
          const playerId = player.user?._id || player.user;
          const playerIdStr = typeof playerId === 'string' ? playerId : (playerId?.toString() || '');
          const userIdStr = user.id?.toString() || '';
          return playerIdStr === userIdStr;
        }
      );
      
      // Kullanıcı detayını bulduk, isReady durumunu güncelle
      if (currentUserDetail) {
        console.log("Kullanıcı detayı bulundu:", currentUserDetail);
        console.log("Database'deki hazır durumu:", currentUserDetail.isReady);
        console.log("Mevcut UI hazır durumu:", isReady);
        
        // UI ile database tutarlı değilse, update et
        if (currentUserDetail.isReady !== isReady) {
          // Geçiş süresi kontrolü - son hazır durum geçişinden itibaren belli bir süre geçtiyse güncelle
          const timeSinceLastTransition = Date.now() - readyStateTransitionTimeRef.current;
          
          // Son geçişten itibaren en az 5 saniye geçtiyse güncelle
          if (timeSinceLastTransition > 5000) {
            console.log("Hazır durumu senkronize ediliyor:", currentUserDetail.isReady);
            setIsReady(currentUserDetail.isReady);
            lastKnownReadyState.current = currentUserDetail.isReady;
            
            // Oyuncular listesinde de güncelle
            setPlayers(prevPlayers => 
              prevPlayers.map(player => 
                player.id === user.id ? { ...player, isReady: currentUserDetail.isReady } : player
              )
            );
          } else {
            console.log(`Senkronizasyon erteleniyor, son geçişten sonra sadece ${timeSinceLastTransition}ms geçti`);
          }
        }
      }
    }
  }, [lobby, user?.id]);

  // Render içinde isReady durumunu logla
  useEffect(() => {
    // Tüm log mesajlarını kaldıralım
  }, [isReady, players]);

  // Kullanıcı durumu değişikliği eventi - oyuncu hazır durumu
  const handlePlayerStatusUpdate = (data) => {
    if (!data) {
      console.error("Socket: Geçersiz oyuncu status verisi:", data);
      return;
    }
    
    // UserId değerini güvenli şekilde al
    let userId = data.userId;
    
    // Alternatif veri formatlarını kontrol et
    if (!userId && data.user) {
      userId = data.user?._id || data.user;
    }
    
    // Eğer sadece isReady ve updateTime varsa, bu muhtemelen bizim kendi güncellememiz
    if (!userId && data.isReady !== undefined && data.updateTime) {
      userId = user?.id;
      console.log("updateTime içeren veri bizim için gelmiş bir güncelleme, kendi ID'miz kullanılıyor:", user?.id);
    }
    
    // Değer hala yoksa ve hazır durumu var ise kendimiz varsayalım
    if (!userId && data.isReady !== undefined) {
      userId = user?.id;
      console.log("Socket: Kullanıcı tanımlanamadı ama isReady durumu var, kendi kullanıcımızı kullanıyoruz");
    }
    
    if (!userId) {
      console.error("Socket: Oyuncu ID'si bulunamadı:", data);
      return;
    }
    
    // isReady durumunu boolean olarak ele al (string veya boolean değer olabilir)
    const playerIsReady = data.isReady === true || data.isReady === 'true';
    
    console.log('Socket: Oyuncu durumu güncellendi', { userId, isReady: playerIsReady });
    
    // Kendi kullanıcı ID'miz değilse sadece diğer oyuncuların durumunu güncelle
    if (userId.toString() !== user?.id?.toString()) {
      // players array'ini güncelle
      setPlayers(prevPlayers => {
        // Önce oyuncunun mevcut listede olup olmadığını kontrol et
        const playerExists = prevPlayers.some(p => {
          // Farklı formatları karşılaştır (string, object ya da nested ID)
          const pId = p.id;
          const pIdStr = typeof pId === 'string' ? pId : String(pId || '');
          const uIdStr = typeof userId === 'string' ? userId : String(userId || '');
          
          return pIdStr === uIdStr || pIdStr === user?.id?.toString();
        });
        
        if (playerExists) {
          // Oyuncu varsa durumunu güncelle
          return prevPlayers.map(player => {
            const playerId = player.id;
            const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
            const userIdStr = typeof userId === 'string' ? userId : String(userId || '');
            
            if (playerIdStr === userIdStr) {
              console.log(`Oyuncu ${player.name} hazır durumu güncelleniyor: ${playerIsReady}`);
              return { ...player, isReady: playerIsReady };
            }
            return player;
          });
        } else {
          // Oyuncu yoksa, tüm lobi verilerini güncelle (oyuncuyu bulamadık)
          console.log(`Oyuncu (${userId}) listede bulunamadı, tüm lobi verilerini güncelliyorum`);
          // 250ms gecikme ile API'den veri al
          setTimeout(() => fetchLobbyData(false), 250);
          return prevPlayers;
        }
      });
    } else {
      // Kendimizi güncelliyoruz
      console.log(`Kendi hazır durumumu güncelliyorum: ${playerIsReady}`);
      setIsReady(playerIsReady);
      lastKnownReadyState.current = playerIsReady;
      
      // Oyuncular listesini de güncelle
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === user.id ? { ...player, isReady: playerIsReady } : player
        )
      );
      
      // Hazır durum geçiş zamanını güncelle
      readyStateTransitionTimeRef.current = Date.now();
    }
    
    // Her durumda 500ms sonra tam bir güncelleme yap
    setTimeout(() => fetchLobbyData(false), 500);
  };
  
  // Yeni bir oyuncu katıldı eventi - güçlendirilmiş işleme
  const handlePlayerJoined = (data) => {
    console.log('Socket: Yeni oyuncu katıldı', data);
    
    if (!data || !data.player || !data.player.id) {
      console.error('Socket: Geçersiz oyuncu verisi', data);
      return;
    }
    
    // Kendimiz değilse mesaj ekle
    if (data.player.id !== user.id) {
      // Sistem mesajı ekle
      addSystemMessage(`${data.player.name || 'Bir oyuncu'} lobiye katıldı.`);
      
      // Oyuncuyu hemen ekleyelim, sonraki polling'i beklemeden
      setPlayers(prevPlayers => {
        // Oyuncu zaten var mı kontrol et
        if (prevPlayers.some(p => p.id === data.player.id)) {
          return prevPlayers;
        }
        
        // Yeni oyuncuyu ekle
        const newPlayer = {
          id: data.player.id,
          name: data.player.name || 'Oyuncu',
          avatar: data.player.avatar || null,
          isReady: data.player.isReady || false,
          isBot: data.player.isBot || false
        };
        
        console.log('Socket üzerinden yeni oyuncu ekleniyor:', newPlayer);
        return [...prevPlayers, newPlayer];
      });
    }
    
    // Hem ekleme hem de tam güncelleme yap
    setTimeout(() => {
      console.log('Socket: Yeni oyuncu katıldı, lobi verilerini güncelliyorum');
      fetchLobbyData(false);
    }, 250);
  };

  // Bot eklenme eventi
  const handleBotAdded = (data) => {
    console.log('Socket: Bot eklendi', data);
    
    if (!data || !data.botId) {
      console.error('Socket: Geçersiz bot verisi', data);
      return;
    }
    
    addSystemMessage(`Bir bot eklendi: ${data.botName || 'Bot'}`);
    
    // Botu hemen ekle
    setPlayers(prevPlayers => {
      if (prevPlayers.some(p => p.id === data.botId)) {
        return prevPlayers;
      }
      
      const botPlayer = {
        id: data.botId,
        name: data.botName || 'Bot',
        avatar: data.botAvatar || null,
        isReady: true, // Botlar her zaman hazır
        isBot: true
      };
      return [...prevPlayers, botPlayer];
    });
    
    // Tam bir güncelleme yap
    setTimeout(() => fetchLobbyData(false), 250);
  };

  // Oyuncu çıkma eventi
  const handlePlayerLeft = (data) => {
    console.log('Socket: Oyuncu çıktı', data);
    if (data.userId) {
      // Önce oyuncu listesinden çıkar
      setPlayers(prev => prev.filter(p => p.id !== data.userId));
      // Sistem mesajı ekle
      addSystemMessage(`${data.playerName || 'Bir oyuncu'} lobiden ayrıldı.`);
      // Tam bir güncelleme yap
      setTimeout(() => fetchLobbyData(false), 250);
    }
  };
  
  // Lobi silindi eventi
  const handleLobbyDeleted = (data) => {
    console.log('Socket: Lobi silindi', data);
    enqueueSnackbar('Lobi silindi, ana sayfaya yönlendiriliyorsunuz', { 
      variant: 'info', 
      autoHideDuration: 3000 
    });
    navigate('/home');
  };

  // Yükleme durumu
  if (loading) {
    return (
      <MainLayout>
        <ThemeProvider theme={customTheme}>
          <PageContainer>
            <Box 
              display="flex" 
              flexDirection="column"
              justifyContent="center" 
              alignItems="center" 
              height="100%"
              gap={3}
            >
              <CircularProgress color="primary" size={60} thickness={4} />
              <Typography variant="h6" color="primary.light" sx={{ mt: 2 }}>
                Lobi yükleniyor...
              </Typography>
            </Box>
          </PageContainer>
        </ThemeProvider>
      </MainLayout>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <MainLayout>
        <ThemeProvider theme={customTheme}>
          <PageContainer>
            <Box 
              display="flex" 
              flexDirection="column" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
              gap={3}
            >
              <Typography variant="h5" color="error" gutterBottom>
                {error}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<BackIcon />}
                onClick={() => navigate('/home')}
              >
                Ana Sayfaya Dön
              </Button>
            </Box>
          </PageContainer>
        </ThemeProvider>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <ThemeProvider theme={customTheme}>
        <PageContainer>
          <Zoom in={true} timeout={500}>
            <LobbyInfoContainer>
              <Box display="flex" alignItems="center" gap={2}>
                <Tooltip title="Ana Sayfaya Dön">
                  <IconButton 
                    color="primary" 
                    onClick={() => navigate('/home')}
                    sx={{ 
                      background: 'rgba(74, 125, 255, 0.1)', 
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(74, 125, 255, 0.3)',
                      '&:hover': {
                        background: 'rgba(74, 125, 255, 0.2)',
                        transform: 'scale(1.1)',
                        borderColor: '#4a7dff'
                      }
                    }}
                  >
                    <BackIcon />
                  </IconButton>
                </Tooltip>
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    mb: 0.5,
                    background: 'linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {lobby?.name || 'Tombala Lobisi'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {lobby?.game?.toUpperCase() || 'BINGO'} • Bahis: {lobby?.betAmount || 100} Token
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" gap={2} alignItems="center">
                {allPlayersReady && players.length === (lobby?.maxPlayers || 6) && (
                  <Fade in={true}>
                    <StartGameButton
                      onClick={startGame}
                      startIcon={<PlayIcon />}
                      variant="contained"
                    >
                      Oyunu Başlat
                    </StartGameButton>
                  </Fade>
                )}
                
                <Tooltip title="Lobi Kodunu Kopyala">
                  <LobbyCode onClick={handleCopyLobbyCode}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#fff' }}>
                      {lobbyCode}
                    </Typography>
                    <CopyIcon fontSize="small" color="primary" />
                  </LobbyCode>
                </Tooltip>
              </Box>
            </LobbyInfoContainer>
          </Zoom>
          
          <LobbyContainer>
            <Slide direction="right" in={true} timeout={500}>
              <PlayerListContainer>
                <SectionHeader>
                  <PeopleIcon />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    flex: 1, 
                    background: 'linear-gradient(90deg, #4a7dff, #ff53f0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px'
                  }}>
                    Oyuncular ({players.length}/{lobby?.maxPlayers || 6})
                  </Typography>
                  {allPlayersReady && players.length === (lobby?.maxPlayers || 6) && (
                    <AnimatedChip 
                      label={startCountdown ? `Oyun Başlıyor... ${startCountdown}` : "Hazır"} 
                      color="success" 
                      variant="outlined" 
                      icon={<CelebrationIcon />} 
                      size="small"
                    />
                  )}
                </SectionHeader>
                
                <PlayerListContent>
                  <List sx={{ p: 1 }}>
                    {players.map((player) => {
                      const isCurrentUser = player.id === user.id;
                      
                      return (
                        <Grow 
                          in={true} 
                          key={player.id || `player-${Date.now()}-${Math.random()}`} 
                          timeout={500} 
                          style={{ transformOrigin: '0 0 0' }}
                        >
                          <StyledListItem
                            $isReady={player.isReady}
                            $isCurrentUser={isCurrentUser}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <ListItemAvatar>
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  badgeContent={
                                    player.isBot ? 
                                      <BotIcon color="info" sx={{ background: '#121228', borderRadius: '50%', p: 0.2 }} /> : 
                                      null
                                  }
                                >
                                  <Avatar 
                                    src={player.isBot ? `https://api.dicebear.com/6.x/bottts/svg?seed=${player.name}` : getPlayerAvatar(player)}
                                    alt={player.name}
                                    sx={{ 
                                      width: 45,
                                      height: 45,
                                      borderRadius: '12px',
                                      border: player.isReady 
                                        ? '2px solid #4CAF50'
                                        : player.id === user.id 
                                          ? '2px solid rgba(74, 125, 255, 0.3)'
                                          : '2px solid rgba(255, 255, 255, 0.05)',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        borderColor: '#4a7dff',
                                        transform: 'scale(1.05)'
                                      }
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      const initial = player?.name ? player.name.charAt(0).toUpperCase() : 'U';
                                      e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + initial + '</text></svg>')}`;
                                    }}
                                  />
                                </Badge>
                              </ListItemAvatar>
                              
                              <Box sx={{ ml: 2, flex: 1 }}>
                                <Typography variant="body1" sx={{ 
                                  fontWeight: 600,
                                  color: player.isBot 
                                    ? 'rgba(255, 255, 255, 0.7)' 
                                    : 'white' 
                                }}>
                                  {player.name}
                                  {player.id === user.id && (
                                    <Typography 
                                      component="span" 
                                      variant="body2" 
                                      sx={{ 
                                        ml: 1,
                                        color: '#4a7dff'
                                      }}
                                    >
                                      (Sen)
                                    </Typography>
                                  )}
                                </Typography>
                                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                                  {player.isBot 
                                    ? 'Bot Oyuncu' 
                                    : player.username || player.name
                                  }
                                </Typography>
                              </Box>
                              
                              <Box>
                                {player.isReady ? (
                                  <Tooltip title="Hazır">
                                    <Chip 
                                      icon={<ReadyIcon />} 
                                      label="Hazır" 
                                      color="success" 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ 
                                        fontWeight: 500, 
                                        boxShadow: '0 0 10px rgba(76, 175, 80, 0.3)',
                                        borderColor: 'rgba(76, 175, 80, 0.5)',
                                        background: 'rgba(76, 175, 80, 0.1)',
                                        animation: 'pulse 2s infinite'
                                      }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Hazır Değil">
                                    <Chip 
                                      icon={<NotReadyIcon />} 
                                      label="Hazır Değil" 
                                      color="error" 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ 
                                        fontWeight: 500,
                                        borderColor: 'rgba(244, 67, 54, 0.5)',
                                        background: 'rgba(244, 67, 54, 0.05)'
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            </Box>
                          </StyledListItem>
                        </Grow>
                      );
                    })}
                  </List>
                </PlayerListContent>
                
                <PlayerActions>
                  <Box display="flex" gap={2}>
                    <ReadyButton 
                      variant="contained"
                      $isReady={isReady}
                      onClick={toggleReadyStatus}
                      startIcon={isReady ? <CheckCircleOutlined /> : <CancelOutlined />}
                      sx={{
                        animation: isReady ? 'pulse 2s infinite' : 'none',
                        boxShadow: isReady 
                          ? '0 0 10px rgba(76, 175, 80, 0.3)' 
                          : 'none',
                        fontWeight: 600,
                        minWidth: 130
                      }}
                    >
                      {isReady ? 'Hazırım' : 'Hazır Değilim'}
                    </ReadyButton>
                    
                    <LeaveButton
                      variant="contained"
                      onClick={leaveLobby}
                      startIcon={<ExitIcon />}
                    >
                      Çık
                    </LeaveButton>
                  </Box>
                  
                  {players.length < (lobby?.maxPlayers || 6) && (
                    <Tooltip title="Bot oyuncu ekleyin">
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<BotIcon />}
                        onClick={addBot}
                        sx={{ 
                          flex: isMobile ? '1 1 48%' : 'initial',
                          borderRadius: 8,
                          background: 'rgba(255, 255, 255, 0.08)',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.12)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Bot Ekle
                      </Button>
                    </Tooltip>
                  )}
                </PlayerActions>
              </PlayerListContainer>
            </Slide>
            
            <Slide direction="left" in={true} timeout={700}>
              <ChatContainer>
                <SectionHeader>
                  <ChatIcon />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    background: 'linear-gradient(90deg, #4a7dff, #ff53f0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px'
                  }}>
                    Lobi Sohbeti
                  </Typography>
                </SectionHeader>
                
                <ChatMessages>
                  {messages.map((message) => (
                    <Message 
                      key={message.id} 
                      $isCurrentUser={message.sender.id === user.id}
                      $isSystem={message.sender.id === 'system'}
                    >
                      <Typography 
                        variant="caption" 
                        color="rgba(255, 255, 255, 0.7)"
                        sx={{ 
                          fontWeight: message.sender.id === 'system' ? 600 : 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {message.sender.id === 'system' ? (
                          <>
                            <InfoIcon fontSize="inherit" color="primary" /> 
                            {message.sender.name}
                          </>
                        ) : (
                          message.sender.name
                        )}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          my: 0.5,
                          color: message.sender.id === 'system' 
                            ? '#4a7dff'
                            : 'white'
                        }}
                      >
                        {message.text}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="rgba(255, 255, 255, 0.6)" 
                        align="right" 
                        display="block"
                        sx={{ opacity: 0.7 }}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Message>
                  ))}
                  <div ref={messagesEndRef} />
                </ChatMessages>
                
                <MessageInputContainer>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Mesajınızı yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    InputProps={{
                      sx: { 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        '& .MuiInputBase-input': {
                          color: 'white',
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255, 255, 255, 0.6)',
                          opacity: 1
                        },
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(74, 125, 255, 0.5)'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4a7dff'
                        }
                      }
                    }}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    sx={{ 
                      borderRadius: 8,
                      height: 40,
                      px: 2,
                      background: 'linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a8dff 0%, #ff65f0 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 5px 15px rgba(74, 125, 255, 0.3)'
                      }
                    }}
                  >
                    {isMobile ? '' : 'Gönder'}
                  </Button>
                </MessageInputContainer>
              </ChatContainer>
            </Slide>
          </LobbyContainer>
          
          <Snackbar 
            open={copySuccess} 
            autoHideDuration={2000} 
            onClose={() => setCopySuccess(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              severity="success"
              variant="filled"
              sx={{ 
                width: '100%',
                borderRadius: 3,
                fontWeight: 500
              }}
            >
              Lobi kodu kopyalandı!
            </Alert>
          </Snackbar>
        </PageContainer>
      </ThemeProvider>
    </MainLayout>
  );
}

export default LobbyPage; 