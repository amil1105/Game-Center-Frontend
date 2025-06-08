import React, { useState, useEffect, useRef, useCallback, useContext, useMemo, Suspense, lazy } from 'react';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel as MuiFormControlLabel,
  Radio,
  DialogContentText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axios';
import MainLayout from '../components/Layout/MainLayout';
import { QRCodeSVG } from 'qrcode.react';
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
  PlayArrow as PlayIcon,
  Share as ShareIcon,
  Link as LinkIcon,
  MoreVert as MoreVertIcon,
  ContentCopy,
  Settings as SettingsIcon,
  MusicNote as MusicNoteIcon,
  VolumeOff as VolumeOffIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  VideogameAsset as GameIcon,
  Close as CloseIcon,
  NotificationsActive as NotificationIcon,
  Notifications as NotificationOffIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  FaFacebook, 
  FaTwitter, 
  FaWhatsapp, 
  FaTelegram, 
  FaDiscord, 
  FaInstagram,
  FaLink,
  FaEnvelope
} from 'react-icons/fa';

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
  shouldForwardProp: (prop) => !['$isReady', '$isCurrentUser', '$isOwner'].includes(prop)
})(({ theme, $isReady, $isCurrentUser, $isOwner }) => ({
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
  if (!player) return null;
  
  try {
    // Avatar URL'sini oluşturmak için tüm olası yolları kontrol et
    let avatar = player.avatar || 
                player.profileImage || 
                (player.user?.profileImage) || 
                (typeof player.user === 'object' && player.user?.avatar);
    
    // Önbellekleme için timestamp ekle (URL cache problemini önler)
    if (avatar && typeof avatar === 'string') {
      // Halihazırda bir query string var mı kontrol et
      if (avatar.includes('?')) {
        avatar = `${avatar}&_t=${Date.now()}`;
      } else {
        avatar = `${avatar}?_t=${Date.now()}`;
      }
    }
    
    if (!avatar) {
    // Kullanıcı adının baş harfini içeren bir SVG döndür
    const initial = player?.name ? player.name.charAt(0).toUpperCase() : 'U';
      const color = stringToColor(player?.name || 'Oyuncu');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150">
        <rect width="100" height="100" fill="${color}" />
        <text x="50" y="56" font-size="50" text-anchor="middle" dominant-baseline="middle" 
          font-family="Arial" fill="white" font-weight="bold">${initial}</text>
      </svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    return avatar;
  } catch (error) {
    console.error("Avatar oluşturma hatası:", error);
    // Hata durumunda basit bir varsayılan avatar döndür
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="56" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white" font-weight="bold">?</text></svg>')}`;
  }
}

// İsimden renk üretmek için yardımcı fonksiyon
function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  // Koyu bir renk oluşturmak için karıştırma
  color = mixColors(color, '#2a2c4e', 0.5);

  return color;
}

// İki rengi belirli bir oranda karıştırmak için yardımcı fonksiyon
function mixColors(color1, color2, weight) {
  function d2h(d) { return d.toString(16).padStart(2, '0'); }
  function h2d(h) { return parseInt(h, 16); }
  
  let color = "#";
  for(let i = 1; i <= 5; i += 2) {
    const v1 = h2d(color1.substr(i, 2));
    const v2 = h2d(color2.substr(i, 2));
    let val = Math.floor(v2 + weight * (v1 - v2));
    val = val > 255 ? 255 : val;
    color += d2h(val);
  }
  return color;
}

// Host ID bulucu fonksiyon
const getHostId = (creator) => {
  if (!creator) return '';
  if (typeof creator === 'object' && creator._id) return creator._id.toString();
  return creator.toString();
};

// Kullanıcının lobi sahibi olup olmadığını kontrol eden yardımcı fonksiyon
const isUserHost = (lobby, userId) => {
  if (!lobby || !userId) return false;
  
  // Olası tüm ID alanlarını kontrol et
  const hostId = getHostId(lobby.creator);
  const createdById = lobby.createdBy ? lobby.createdBy.toString() : '';
  const ownerId = lobby.owner ? lobby.owner.toString() : '';
  const userIdStr = userId.toString();
  
  return userIdStr === hostId || userIdStr === createdById || userIdStr === ownerId;
};

// Kendi Avatar bileşenimizi tanımlayalım - hata durumlarını daha iyi yönetecek
const PlayerAvatar = ({ player, isOwner, isReady, isCurrentUser, isHostViewing, onKickPlayer }) => {
  const [error, setError] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  
  // İsimden renk üreten fonksiyon
  const getColorFromName = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };
  
  // SVG avatar oluşturma fonksiyonu
  const generateAvatarSvg = (name) => {
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    const color = getColorFromName(name || 'Oyuncu');
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150">
      <rect width="100" height="100" fill="${color}" />
      <text x="50" y="56" font-size="50" text-anchor="middle" dominant-baseline="middle" 
        font-family="Arial" fill="white" font-weight="bold">${initial}</text>
    </svg>`;
    
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };
  
  // Kaynak avatarı işleme fonksiyonu
  useEffect(() => {
    if (!player) return;
    
    try {
      if (error) {
        // Hata durumunda SVG avatar kullan
        setAvatarSrc(generateAvatarSvg(player.name));
        return;
      }
      
      // Bot avatarı
      if (player.isBot) {
        setAvatarSrc(`https://api.dicebear.com/6.x/bottts/svg?seed=${player.name || 'Bot'}&_t=${Date.now()}`);
        return;
  }
      
      // Normal avatar yolu
      let avatarUrl = player.avatar || player.profileImage || null;
      
      if (!avatarUrl) {
        // Avatar yoksa SVG oluştur
        setAvatarSrc(generateAvatarSvg(player.name));
        return;
      }
      
      // Cache busting ekle
      if (typeof avatarUrl === 'string' && !avatarUrl.startsWith('data:')) {
        if (avatarUrl.includes('?')) {
          avatarUrl = `${avatarUrl}&_t=${Date.now()}`;
        } else {
          avatarUrl = `${avatarUrl}?_t=${Date.now()}`;
        }
      }
      
      setAvatarSrc(avatarUrl);
    } catch (err) {
      console.error('Avatar oluşturma hatası:', err);
      setError(true);
      setAvatarSrc(generateAvatarSvg(player?.name));
    }
  }, [player, error]);
  
  // Avatar dış kenarlık rengini belirleme
  const getBorderColor = () => {
    if (isOwner) return '#FFD700'; // Altın rengi (lobi sahibi)
    if (isReady) return '#4CAF50'; // Yeşil (hazır)
    if (isCurrentUser) return 'rgba(74, 125, 255, 0.3)'; // Mavi (kendisi)
    return 'rgba(255, 255, 255, 0.05)'; // Varsayılan
  };
  
  // Avatar gölgesini belirleme
  const getBoxShadow = () => {
    if (isOwner) return '0 0 10px rgba(255, 215, 0, 0.5)';
    return 'none';
  };
  
  // Kick işlemi için tıklama işleyicisi
  const handleKickClick = () => {
    if (isHostViewing && !isCurrentUser && !isOwner && onKickPlayer) {
      onKickPlayer(player);
    }
  };

  // Sadece host için ve kendi veya host olmayan oyuncular için kick işlemi göster
  const showKickAction = isHostViewing && !isCurrentUser && !isOwner;
  
  return (
    <Box
      component="div"
      sx={{
        width: 45,
        height: 45,
        borderRadius: '12px',
        border: `2px solid ${getBorderColor()}`,
        transition: 'all 0.3s ease',
        boxShadow: getBoxShadow(),
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: '#1e2044',
        cursor: showKickAction ? 'pointer' : 'default',
        '&:hover': {
          borderColor: isOwner ? '#FFD700' : '#4a7dff',
          transform: 'scale(1.05)'
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleKickClick}
    >
      {avatarSrc ? (
        <Box
          component="img"
          src={avatarSrc}
          alt={player?.name || 'Oyuncu'}
          onError={() => setError(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: showKickAction && isHovering ? 'brightness(0.4)' : 'none',
          }}
        />
      ) : (
        <Box
          component="div"
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: getColorFromName(player?.name || 'Oyuncu'),
            filter: showKickAction && isHovering ? 'brightness(0.4)' : 'none',
          }}
        >
          <Typography variant="h6" color="white" fontWeight="bold">
            {player?.name ? player.name.charAt(0).toUpperCase() : 'U'}
          </Typography>
        </Box>
      )}
      
      {/* Kick işlemi göster  - X işareti */}
      {showKickAction && isHovering && (
        <Box
          component="div"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(244, 67, 54, 0.3)',
            zIndex: 2,
            borderRadius: '10px'
          }}
        >
          <CloseIcon sx={{ color: '#F44336', fontSize: 24, fontWeight: 'bold' }} />
        </Box>
      )}
    </Box>
  );
};

function LobbyPage() {
  const { lobbyCode } = useParams();
  const [lobby, setLobby] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [startCountdown, setStartCountdown] = useState(null);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false);
  const [isLoadingJoin, setIsLoadingJoin] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const messagesEndRef = useRef(null);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    soundsEnabled: true
  });
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [sounds, setSounds] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [lobbyNotFound, setLobbyNotFound] = useState(false); // Lobi bulunamadı durumu
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Bildirim ayarı
  const [soundsEnabled, setSoundsEnabled] = useState(true); // Ses ayarı
  const [error, setError] = useState(null); // Hata mesajı
  const [copySuccess, setCopySuccess] = useState(false); // Kopyalama başarılı durumu
  
  // Diğer state'ler...
  
  // Bildirim sistemi için eklenen state'ler
  const [isTabActive, setIsTabActive] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const [originalTitle, setOriginalTitle] = useState(document.title);
  
  // Ses dosyaları için referanslar
  const joinSoundRef = useRef(null);
  const readySoundRef = useRef(null);
  const startGameSoundRef = useRef(null);
  const messageSoundRef = useRef(null);
  
  // Ayarlar için eklenen state'ler
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState(0); // Yeni tab state'i
  const [lobbySettings, setLobbySettings] = useState({
    // Lobi ayarları
    name: 'Tombala Lobisi',
    maxPlayers: 6,
    
    // Oyun ayarları
    gameSpeed: 'normal',
    enableMusic: true,
    enableVoiceChat: false,
    roundTime: 60,
    pointsToWin: 100,
    manualNumberDrawPermission: 'host-only' // 'host-only' veya 'all-players'
  });
  
  // Sosyal Medya Paylaşım özellikleri için state'ler
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [shareLinkType, setShareLinkType] = useState('code'); // 'code' veya 'url'
  const [shareSuccessMessage, setShareSuccessMessage] = useState('');
  
  // Atılma durumu için state tanımı
  const [kickedDialogOpen, setKickedDialogOpen] = useState(false);
  
  const socketRef = useRef(null);
  const pollingRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#4a7dff',
      },
      secondary: {
        main: '#ff53f0',
      },
      background: {
        default: '#0f1123',
        paper: '#161a30',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    }
  }), []);
  
  // Socket.io bağlantısı
  useMemo(() => {
    // Socket.io client oluştur
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true
    });
    return socketRef.current;
  }, []);
  
  // Socket kimlik bilgisi tanımlama
  useEffect(() => {
    if (socketRef.current && user?.id) {
      console.log("Socket kimlik tanımlama gönderiliyor", user.id);
      socketRef.current.emit('identify', user.id);
      
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
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [socketRef.current, user?.id, lobbyCode, lobby]);
  
  // Polling mekanizması için polling intervalini kısaltalım ve zorunlu güncelleme ekleyelim
  const pollingIntervalRef = useRef(null);
  // Hazır durum geçişlerini takip etmek için
  const readyStateTransitionTimeRef = useRef(0);
  // Son değerleri saklama referansları
  const lastKnownReadyState = useRef(null);
  const hasClientSideReadyUpdate = useRef(false);
  // Son API isteği zamanını takip etmek için
  const lastApiRequestTimeRef = useRef(0);
  // API istekleri arasında minimum süre (ms)
  const API_REQUEST_THROTTLE = 5000; // 5 saniye

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
          
          if (!response.data) {
            console.error("Lobi verisi alınamadı");
          setLoading(false);
          return;
        }
        
          // Lobi bilgisini set et
          setLobby(response.data);
          
          // Lobi sahibi ID'sini belirle
          const hostId = getHostId(response.data.creator);
          console.log("Lobi sahibi ID:", hostId);
          
          // Tüm oyuncuları kontrol et - players ve playersDetail dizilerini birleştir
          let allPlayers = [];
          const playerIds = new Set();
          
          // Önce players dizisinden bilgileri topla
        if (response.data.players && Array.isArray(response.data.players)) {
            response.data.players.forEach(player => {
            const playerId = player._id || player.id;
              if (playerId) {
                const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId);
                
                // ID'yi daha önce görmediysen ekle
                if (!playerIds.has(playerIdStr)) {
                  allPlayers.push({
                    id: playerIdStr,
                    name: player.username || player.name || 'Oyuncu',
                    avatar: player.profileImage || player.avatar || null,
                    isReady: player.isReady || false,
                    isBot: player.isBot || false,
                    isOwner: String(response.data.createdBy) === String(getHostId(response.data.creator)) || String(response.data.owner) === String(getHostId(response.data.creator))
                  });
                  
                  playerIds.add(playerIdStr);
                }
              }
            });
          }
          
          // Sonra playersDetail dizisinden bilgileri topla
          if (response.data.playersDetail && Array.isArray(response.data.playersDetail)) {
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
                    name: player.name || (player.user?.username) || 'Oyuncu',
                    avatar: player.avatar || (typeof player.user === 'object' ? player.user?.profileImage || player.user?.avatar : null),
                    isReady: player.isReady || false,
                    isBot: player.isBot || false,
                    isOwner: String(response.data.createdBy) === String(getHostId(response.data.creator)) || String(response.data.owner) === String(getHostId(response.data.creator))
                  });
                  
                  playerIds.add(playerIdStr);
                }
              }
            });
          }
          
          // Kendimizi ekleyelim
          if (user?.id && !playerIds.has(user.id)) {
            allPlayers.push({
              id: user.id,
            name: user.username || 'Oyuncu',
            avatar: user.profileImage,
              isReady: false,
              isBot: false,
              isOwner: String(user.id) === String(hostId) // Lobi sahibi kontrolü
            });
          }
          
          // Oturup hazır durumuzu güncelle
          const currentUserInLobby = response.data.playersDetail?.find(p => {
            const pId = p.user?._id || p.user || '';
            return pId.toString() === user.id.toString();
          }) || response.data.players?.find(p => (p._id || p.id).toString() === user.id.toString());
          
          if (currentUserInLobby) {
            setIsReady(currentUserInLobby.isReady || false);
          }
          
          // Oyuncular listesini güncelle ve tüm hazır durumlarını yansıt
          console.log("Oyuncular ve host durumları:", allPlayers.map(p => ({
            name: p.name,
            isOwner: p.isOwner,
            id: p.id
          })));
          setPlayers(allPlayers);
          
          // Son olarak lobiye katılma durumunu kontrol et
          if (response.data.createdBy === user.id || response.data.owner === user.id) {
            setHasJoinedLobby(true);
        } else {
            const amIInLobby = allPlayers.some(p => p.id === user.id);
            if (amIInLobby) {
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
    
    // Polling sıklığını 5 saniyeye çıkaralım (2 saniye yerine)
    if (!pollingIntervalRef.current) {
      console.log('Polling başlatılıyor...');
      
      pollingIntervalRef.current = setInterval(() => {
        // Son API isteğinden beri geçen süreyi kontrol et
        const timeSinceLastRequest = Date.now() - lastApiRequestTimeRef.current;
        
        // Eğer son istekten beri yeterli süre geçmediyse, isteği atla
        if (timeSinceLastRequest < API_REQUEST_THROTTLE) {
          console.log(`Son API isteğinden beri sadece ${timeSinceLastRequest}ms geçti, istek atlanıyor`);
          return;
        }
        
        // Hazır durum geçişinden itibaren belirli bir süre geçtiyse zorunlu güncelleme yap
        const timeSinceLastTransition = Date.now() - readyStateTransitionTimeRef.current;
        const shouldOverride = timeSinceLastTransition > 5000; // 5 saniyeden fazla geçtiyse
        
        // Güncellenme zamanına göre override değerini ayarla
        fetchLobbyData(shouldOverride);
      }, 5000); // 5 saniyede bir güncelle (2 saniye yerine)
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
        
        // Lobinin durumunu kontrol et - eğer durum "waiting" değilse katılma
        if (lobbyResponse.data.status !== 'waiting') {
          console.log("Lobi bekleme durumunda değil, katılma işlemi iptal ediliyor");
          enqueueSnackbar('Bu lobiye şu anda katılamazsınız, oyun zaten başlamış veya bitmiş.', { 
            variant: 'warning',
            autoHideDuration: 3000
          });
          
          // Mevcut lobi durumunu güncelle (oyun seyretme gibi özellikleri aktif etmek için)
          setLobby(lobbyResponse.data);
          return;
        }

        // Lobi dolu mu kontrol et
        if (lobbyResponse.data.players && lobbyResponse.data.players.length >= lobbyResponse.data.maxPlayers) {
          console.log("Lobi dolu, katılma işlemi iptal ediliyor");
          enqueueSnackbar('Bu lobi dolu, katılamazsınız.', { 
            variant: 'warning',
            autoHideDuration: 3000
          });
          
          // Mevcut lobi durumunu güncelle
          setLobby(lobbyResponse.data);
          return;
        }
        
        // Zaten katılmış mıyım kontrol et
        const alreadyJoined = lobbyResponse.data.players?.some(player => {
          const playerId = player._id || player.id || player;
          const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
          return playerIdStr === user.id;
        });
        
        if (alreadyJoined) {
          console.log("Bu lobiye zaten katılmışım, tekrar katılma işlemini atlıyorum");
          setHasJoinedLobby(true);
          setLobby(lobbyResponse.data);
          
          // Tam bir güncelleme için hemen çağır
          await fetchLobbyData(false);
          return;
        }
        
        // Lobi bilgisini güncelle
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
              isOwner: String(lobbyResponse.data.createdBy) === String(getHostId(lobbyResponse.data.creator)) || String(lobbyResponse.data.owner) === String(getHostId(lobbyResponse.data.creator))
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
            
            // Avatar bilgisini güvenli şekilde çıkar
            let avatarUrl = null;
            
            // Doğrudan avatar alanı
            if (player.avatar) {
              avatarUrl = player.avatar;
            } 
            // Eğer user nesnesi varsa onun profileImage veya avatar alanı
            else if (typeof player.user === 'object') {
              avatarUrl = player.user.profileImage || player.user.avatar || null;
            }
            
            return {
              id: playerIdStr,
              name: player.name || player.user?.username || `Oyuncu #${playerIdStr?.substring(0, 6) || 'Bilinmeyen'}`,
              avatar: avatarUrl,
              isReady: player.isReady || false,
              isBot: player.isBot || false,
              isOwner: String(lobbyResponse.data.createdBy) === String(getHostId(lobbyResponse.data.creator)) || String(lobbyResponse.data.owner) === String(getHostId(lobbyResponse.data.creator))
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
            isOwner: String(user.id) === String(getHostId(lobby?.creator)) || String(lobby?.owner) === String(getHostId(lobby?.creator))
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
      console.log("API'ye katılma isteği gönderiliyor:", { 
        lobbyCode, 
        playerId: user.id,
        playerName: user.username || 'Oyuncu' 
      });
      
      try {
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
        if (socketRef.current) {
          socketRef.current.emit('playerJoined', {
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
        // Hata detaylarını logla
        if (error.response && error.response.data) {
          console.error("Sunucu hata detayları:", error.response.data);
          enqueueSnackbar(`Lobiye katılırken hata: ${error.response.data.error || error.message}`, { 
            variant: 'error',
            autoHideDuration: 3000
          });
        } else {
          enqueueSnackbar('Lobiye katılırken bir hata oluştu', { 
            variant: 'error',
            autoHideDuration: 3000
          });
        }
        
        // Uzaktan hata ayıklama için ek bilgiler
        console.log("Katılma isteği yapılandırması:", {
          url: `/lobbies/join`,
          data: {
            lobbyCode: lobbyCode,
            playerId: user.id,
            playerName: user.username || 'Oyuncu'
          },
          headers: axiosInstance.defaults.headers
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

  // useEffect içinde lobiye katılma işlemini çağıralım - sadece bir kez katılma işlemini çalıştırmak için
  useEffect(() => {
    // Katılma işlemlerinin kontrolü için bir bayrak kullanacağız
    let isJoiningAttempted = false;
    
    if (lobbyCode && user?.id && socketRef.current) {
      console.log("Lobiye katılma işlemi başlatılıyor...");
      
      // Lobi bilgisi var mı kontrol et
      if (!lobby) {
        console.log("Henüz lobi verisi yok, katılma işlemi ertelendi");
        return;
      }
      
      // Eğer lobi zaten inceleniyorsa tekrar kaydolmamıza gerek yok
      const creatorId = lobby.creator?._id || lobby.creator;
      const isLobbyOwner = user.id === creatorId || 
                           lobby.createdBy === user.id || 
                           lobby.owner === user.id;
      
      if (isLobbyOwner) {
        console.log("Ben lobi sahibiyim, ayrıca katılma işlemi gereksiz.");
        setHasJoinedLobby(true); // Lobi sahibi olarak katılmış sayılırız
        return;
      }
      
      // Zaten players listesinde olup olmadığımızı kontrol et - client tarafında
      const isAlreadyInPlayersList = players.some(p => p.id === user.id);
      
      if (isAlreadyInPlayersList) {
        console.log("Oyuncu listesinde zaten varım, katılma işlemi atlanıyor");
        setHasJoinedLobby(true);
        return;
      }
      
      // Zaten players veya playersDetail listesinde olup olmadığımızı kontrol et - backend verisi
      let isInLobbyData = false;
      
      if (lobby.players) {
        isInLobbyData = lobby.players.some(player => {
          const playerId = player._id || player.id || player;
          return playerId && playerId.toString() === user.id.toString();
        });
      }
      
      if (!isInLobbyData && lobby.playersDetail) {
        isInLobbyData = lobby.playersDetail.some(playerDetail => {
          if (!playerDetail.user) return false;
          const userId = typeof playerDetail.user === 'object' 
            ? playerDetail.user._id || playerDetail.user.id
            : playerDetail.user;
          return userId && userId.toString() === user.id.toString();
        });
      }
      
      if (isInLobbyData) {
        console.log("Lobi verisinde zaten varım, katılma işlemi atlanıyor");
        setHasJoinedLobby(true);
        return;
      }
      
      // Lobinin oyun durumunu kontrol et, eğer playing ise katılma
      if (lobby.status !== 'waiting') {
        console.log("Lobi oyun durumunda, katılma işlemi yapılamaz");
        enqueueSnackbar('Bu lobiye şu anda katılamazsınız, oyun zaten başlamış.', { 
          variant: 'warning',
          autoHideDuration: 3000
        });
        return;
      }
      
      // Lobi dolu mu kontrol et
      if (lobby.players && lobby.maxPlayers && lobby.players.length >= lobby.maxPlayers) {
        console.log(`Lobi dolu (${lobby.players.length}/${lobby.maxPlayers}), katılma işlemi iptal ediliyor`);
        enqueueSnackbar('Bu lobi dolu, katılamazsınız.', { 
          variant: 'warning',
          autoHideDuration: 3000
        });
        return;
      }
      
      // Henüz katılmadıysak ve katılma işlemi halihazırda yapılmadıysa, lobiye katıl
      if (!hasJoinedLobby && !isJoiningAttempted) {
        console.log("Socket ve kullanıcı bilgileri hazır, lobiye katılıyorum");
        isJoiningAttempted = true; // Sadece bir kere denemek için
        
        // Async olarak çalıştığı için trycatch içinde olmalı
        try {
      registerPlayerToLobby();
        } catch (error) {
          console.error("Lobiye katılma işlemi sırasında hata:", error);
          // Kritik hata durumunda bile temizlik işlemleri çalışsın
          isJoiningAttempted = false;
    }
    }
    }
    
    return () => {
      // Cleanup
      isJoiningAttempted = false;
    };
  }, [lobbyCode, user?.id, lobby, hasJoinedLobby, socketRef.current, players]);

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
      
      // Ses çal (kendi durumunda değişiklik olsa bile diğer oyuncular için sesli bildirim)
      playSound('ready');
      
      // Sonra API'ye hazır durumunu gönderiyoruz
      const response = await axiosInstance.post(`/lobbies/player-ready`, {
        lobbyId: lobby._id, 
        isReady: newReadyState
      });
      
      if (response.data && response.data.success) {
        // Socket üzerinden diğer oyunculara bildirelim
        if (socketRef.current) {
          // Herkesin görebilmesi için önce socket event'ini gönder
          const socketData = {
            lobbyId: lobby._id,
            lobbyCode: lobbyCode,
            userId: user.id,
            isReady: newReadyState,
            timestamp: Date.now()
          };
          
          socketRef.current.emit('playerStatusUpdate', socketData);
          
          // Kendimize özel status güncelleme event'i
          socketRef.current.emit('myStatusUpdate', socketData);
        }
        
        // 5 saniye sonra client-side güncellemeyi sıfırla
        setTimeout(() => {
          hasClientSideReadyUpdate.current = false;
        }, 5000);
        
        // Polling sırasında hazır durumunu ezmeyi engellemek için geçici olarak polling'i durdur
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          
          // 4 saniye sonra polling'i yeniden başlat
          setTimeout(() => {
            if (!pollingIntervalRef.current) {
              startPolling();
            }
          }, 4000);
        }
        
        // UI'da hazır durumun doğru göründüğünden emin ol
        setTimeout(() => {
          if (isReady !== newReadyState) {
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
      
      // Son API isteği zamanını güncelle
      lastApiRequestTimeRef.current = Date.now();
      
      // Client tarafında güncelleme varsa ve override true değilse, işlemi atla
      if (hasClientSideReadyUpdate.current && !overrideReady) {
        return;
      }
      
      // Mevcut hazır durumu koru
      const currentReadyState = isReady;
      
      // Bağlantı durumunu önceden bilinen hazır durumunu güncelle
      if (currentReadyState !== null) {
        lastKnownReadyState.current = currentReadyState;
      }
      
      try {
        const response = await axiosInstance.get(`/lobbies/code/${lobbyCode}`);
        
        if (!response.data) {
          console.error('API yanıtı geçersiz');
          return;
        }
        
        // Lobi sahibi ID'sini belirle
        const hostId = getHostId(response.data.creator);
        
        // API yanıtında kendi hazır durumumu kontrol et ve logla
        const apiPlayerData = response.data.players?.find(p => (p._id || p.id) === user?.id) || 
                              response.data.playersDetail?.find(p => {
                                const playerId = p.user?._id || p.user;
                                return playerId === user?.id || 
                                       (typeof playerId === 'object' && playerId?._id === user?.id);
                              });
                              
        if (apiPlayerData) {
          // Eğer socket bağlantısı kopuksa veya override true ise ve database yanıtı güvenilir ise
          if (apiPlayerData.isReady !== undefined && (overrideReady || !isSocketConnected)) {
            // Database'den gelen hazır durumu kullan
            const databaseReadyState = apiPlayerData.isReady;
            
            if (databaseReadyState !== currentReadyState) {
              setIsReady(databaseReadyState);
              lastKnownReadyState.current = databaseReadyState;
              
              // Oyuncular listesinde de güncelle
              setPlayers(prevPlayers => 
                prevPlayers.map(player => 
                  player.id === user.id ? { ...player, isReady: databaseReadyState } : player
                )
              );
            }
          }
        }
        
        // Lobi bilgisini güncelle
        setLobby(response.data);
        
        // Lobi sahibi mi kontrol et
        const isLobbyOwner = String(response.data.createdBy) === String(hostId) || String(response.data.owner) === String(hostId);
        
        // Lobi sahibiyse katılmış olarak işaretle
        if (isLobbyOwner && !hasJoinedLobby) {
          setHasJoinedLobby(true);
        }
        
        // API'den oyuncu bilgilerini al
        let apiPlayers = [];
        let foundApiPlayers = false;
        
        // ÖNCE playersDetail dizisini kontrol et (daha güvenilir bilgiler içerir)
        if (response.data.playersDetail && Array.isArray(response.data.playersDetail) && response.data.playersDetail.length > 0) {
          apiPlayers = response.data.playersDetail;
          foundApiPlayers = true;
        }
        // Sonra players dizisiyle çalış
        else if (response.data.players && Array.isArray(response.data.players) && response.data.players.length > 0) {
          apiPlayers = response.data.players;
          foundApiPlayers = true;
        }
        
        // API'den oyuncu bilgisi bulunamadıysa mevcut oyuncuları koru
        if (!foundApiPlayers || apiPlayers.length === 0) {
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
              
              // Durum değiştiyse ve override yapılması gerekiyorsa local state'i güncelle
              if (apiReadyStatus !== currentReadyState && overrideReady) {
                setIsReady(apiReadyStatus);
                lastKnownReadyState.current = apiReadyStatus;
              }
              
              return {
                id: user?.id,
                name: user?.username || player.name || 'Oyuncu',
                avatar: user?.profileImage || null,
                isReady: overrideReady ? apiReadyStatus : currentReadyState,
                isBot: false,
                isOwner: String(user?.id) === String(hostId) // Lobi sahibi kontrolü
              };
            }
            
            // Diğer oyuncuları ekle
            const existingPlayer = players.find(p => p.id === playerIdStr);
            return {
              id: playerIdStr,
              name: player.name || player.user?.username || (existingPlayer?.name || `Oyuncu #${playerIdStr?.substring(0, 6) || 'Bilinmeyen'}`),
              avatar: player.avatar || (typeof player.user === 'object' ? player.user?.profileImage || player.user?.avatar : null) || (existingPlayer?.avatar || null),
              isReady: player.isReady || false,
              isBot: player.isBot || false,
              isOwner: String(playerIdStr) === String(hostId) // Lobi sahibi kontrolü
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
                  isOwner: String(user?.id) === String(hostId) // Lobi sahibi kontrolü
                };
              }
              
              // Detail'den hazır durumu almadıysak, bu durumu kullan
              currentUserReadyState = apiReadyStatus; // Kullanıcı hazır durumunu kaydet
              
              // Durum değiştiyse ve override yapılması gerekiyorsa local state'i güncelle
              if (apiReadyStatus !== currentReadyState && overrideReady) {
                setIsReady(apiReadyStatus);
                lastKnownReadyState.current = apiReadyStatus;
              }
              
              return {
                id: user?.id,
                name: user?.username || player.username || player.name || 'Oyuncu',
                avatar: user?.profileImage || player.profileImage || player.avatar || null,
                isReady: overrideReady ? apiReadyStatus : currentReadyState,
                isBot: false,
                isOwner: String(user?.id) === String(hostId) // Lobi sahibi kontrolü
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
              isOwner: String(playerIdStr) === String(hostId) // Lobi sahibi kontrolü
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
              isReady: finalReadyState, // Hazır durumu kontrolünü sağlamlaştır
              isOwner: String(user?.id) === String(hostId) // Lobi sahibi kontrolü
            });
            playerIds.add(user.id);
          } else {
            uniquePlayers.push({
              id: user.id,
              name: user.username || 'Oyuncu',
              avatar: user.profileImage,
              isReady: currentReadyState, // Kendi hazır durumunu koru
              isBot: false,
              isOwner: String(user.id) === String(hostId) // Lobi sahibi kontrolü
            });
            playerIds.add(user.id);
          }
        }
        
        // Sonra diğer oyuncuları ekle
        for (const player of allProcessedPlayers) {
          if (!player || !player.id) continue;
          
          // Zaten eklenmiş oyuncuları atla
          if (playerIds.has(player.id)) continue;
          
          uniquePlayers.push({
            ...player,
            isOwner: String(player.id) === String(hostId) // Lobi sahibi kontrolü
          });
          playerIds.add(player.id);
        }
        
        // Oyuncuları güncelle
        const playersWithCachedAvatars = uniquePlayers.map(player => {
          if (!player) return player;
        
          // Avatar önbellekleme işlemi uygula
          const cachedPlayer = { ...player };
          
          // Bot için DiceBear avatarı kullan
          if (cachedPlayer.isBot) {
            cachedPlayer.avatar = `https://api.dicebear.com/6.x/bottts/svg?seed=${cachedPlayer.name || 'Bot'}&_t=${Date.now()}`;
          } 
          // Normal avatar işleme
          else if (cachedPlayer.avatar && typeof cachedPlayer.avatar === 'string' && !cachedPlayer.avatar.startsWith('data:')) {
            // Önbellekleme için timestamp ekle
            if (cachedPlayer.avatar.includes('?')) {
              cachedPlayer.avatar = `${cachedPlayer.avatar}&_t=${Date.now()}`;
            } else {
              cachedPlayer.avatar = `${cachedPlayer.avatar}?_t=${Date.now()}`;
            }
          }
          
          return cachedPlayer;
        });
        
        setPlayers(playersWithCachedAvatars);
        
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
        // API 404 hatası (lobi bulunamadı) - kullanıcıya bildirim yap
        if (apiError.response && apiError.response.status === 404) {
          console.error('Lobi bulunamadı (404):', lobbyCode);
          setLobbyNotFound(true); // Lobi bulunamadı durumu için state kullan
          enqueueSnackbar('Lobi artık mevcut değil veya silinmiş.', {
            variant: 'error',
            autoHideDuration: 5000
          });
          
          // Otomatik yönlendirme yapma - kullanıcı kendisi aksiyona geçsin
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
          
          // Kullanıcıya izinsiz erişim bilgisi veriyoruz, otomatik yönlendirme yapmıyoruz
          setError('Bu lobiye erişim izniniz yok. Lobi şifreli olabilir veya girişiniz lobi sahibi tarafından engellenmiş olabilir.');
          return;
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
        setPlayers(prevPlayers => {
          if (!prevPlayers.some(p => p.id === user.id)) {
            return [...prevPlayers, {
              id: user.id,
              name: user.username || 'Oyuncu',
              avatar: user.profileImage,
              isReady: isReady, // Mevcut hazır durumunu koru
              isBot: false,
              isOwner: String(lobby?.createdBy) === String(getHostId(lobby?.creator)) || String(lobby?.owner) === String(getHostId(lobby?.creator))
            }];
          }
          return prevPlayers;
        });
      }
      
      // Polling olmadan tekrar denemek için 20 saniye sonra manuel güncelleme
      setTimeout(() => {
        try {
          fetchLobbyData(false);
        } catch (retryError) {
          console.error("Yeniden deneme başarısız oldu:", retryError);
        }
      }, 20000); // 20 saniye (10 saniye yerine)
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
      
      // Ses çal
      playSound('message');
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
  
  // Lobi kodunu kopyala ve paylaş menüsünü aç
  const handleCopyLobbyCode = () => {
    if (lobbyCode) {
      navigator.clipboard.writeText(lobbyCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShareLink(`${window.location.origin}/lobby/${lobbyCode}`);
      setShareDialogOpen(true);
    }
  };

  // Sosyal medya paylaşım menüsünü aç/kapat
  const handleShareMenuOpen = (event) => {
    setShareMenuAnchorEl(event.currentTarget);
    // Paylaşım linkini oluştur
    const lobbyURL = `${window.location.origin}/lobby/${lobbyCode}`;
    setShareLink(lobbyURL);
  };

  const handleShareMenuClose = () => {
    setShareMenuAnchorEl(null);
  };

  // Paylaşım seçenekleri
  const handleShare = (platform) => {
    const lobbyName = lobby?.name || 'Tombala Lobisi';
    const lobbyURL = `${window.location.origin}/lobby/${lobbyCode}`;
    const shareText = `${lobbyName} lobisine katılmak için davetiyem! 🎮`;
    
    let shareURL = '';
    
    switch(platform) {
      case 'facebook':
        shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lobbyURL)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        shareURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(lobbyURL)}`;
        break;
      case 'whatsapp':
        shareURL = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + lobbyURL)}`;
        break;
      case 'telegram':
        shareURL = `https://t.me/share/url?url=${encodeURIComponent(lobbyURL)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        shareURL = `mailto:?subject=${encodeURIComponent('Lobi Davetiyesi - ' + lobbyName)}&body=${encodeURIComponent(shareText + '\n\n' + lobbyURL)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(lobbyURL);
        handleShareMenuClose();
        setShareSuccessMessage('Link kopyalandı!');
        setTimeout(() => setShareSuccessMessage(''), 2000);
        return;
      default:
        break;
    }
    
    if (shareURL) {
      window.open(shareURL, '_blank', 'noopener,noreferrer');
    }
    
    handleShareMenuClose();
  };

  // Paylaşım diyaloğunu kapat
  const handleShareDialogClose = () => {
    setShareDialogOpen(false);
  };

  // Oyunu başlat
  const startGame = () => {
    console.log("Oyun başlatılıyor...");
    console.log("Lobi verileri:", lobby);
    
    // Sistem mesajı ekle
    addSystemMessage('Oyun başlatılıyor...');
    
    // Bildirim ve ses çal
    playSound('startGame');
    sendNotification(
      'Oyun Başlıyor!',
      'Lobide oyun başlatıldı, hazırlanın!',
      '/game-logo.png'
    );
    
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
            if (socketRef.current) {
              socketRef.current.emit('lobbyStatusUpdated', {
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
      
      // Oyun tipini belirle
      console.log("Lobi game:", lobby?.game);
      console.log("Lobi adı:", lobby?.name);
      
      // Lobi game değerini küçük harfe çevir (eğer varsa)
      const gameTypeLower = lobby?.game?.toLowerCase() || "";
      const nameLower = lobby?.name?.toLowerCase() || "";
      
      // Mayın tarlası kontrolü - kesin eşleşme veya içerik kontrolü yap
      const isMineSweeper = 
        gameTypeLower === 'mines' || 
        gameTypeLower === 'minesweeper' ||
        gameTypeLower === 'mayın' || 
        gameTypeLower === 'mayintarlasi' ||
        nameLower === 'mines' ||
        nameLower === 'mayın tarlası' ||
        nameLower.includes('mayın') ||
        nameLower.includes('mayin') ||
        nameLower.includes('mines');
      
      console.log("İsMineSweeper kontrolü:", {
        gameType: gameTypeLower,
        gameTypeChecks: gameTypeLower === 'mines' || gameTypeLower === 'minesweeper' || gameTypeLower === 'mayın' || gameTypeLower === 'mayintarlasi',
        nameLower: nameLower,
        nameChecks: nameLower === 'mines' || nameLower === 'mayın tarlası' || nameLower.includes('mayın') || nameLower.includes('mayin') || nameLower.includes('mines'),
        finalDecision: isMineSweeper
      });
      
      // Oyun tipine göre localStorage'a farklı bilgiler kaydet
      try {
        if (isMineSweeper) {
          console.log("Mayın Tarlası için localStorage ayarlanıyor...");
          localStorage.setItem('mines_playerId', currentUser.id);
          localStorage.setItem('mines_lobbyId', lobby?._id || "");
          localStorage.setItem('mines_lobbyCode', lobbyCode);
          localStorage.setItem('mines_timestamp', Date.now());
          localStorage.setItem('mines_lobbyName', lobby?.name || "Mayın Tarlası Lobisi");
        } else {
          console.log("Tombala için localStorage ayarlanıyor...");
          localStorage.setItem('tombala_playerId', currentUser.id);
          localStorage.setItem('tombala_lobbyId', lobby?._id || "");
          localStorage.setItem('tombala_lobbyCode', lobbyCode);
          localStorage.setItem('tombala_timestamp', Date.now());
          localStorage.setItem('tombala_lobbyName', lobby?.name || "Tombala Lobisi");
        }
      } catch (e) {
        console.warn('localStorage hatası:', e);
      }
      
      // Oyun başlatılırken socket üzerinden bildirim gönder (eğer socket bağlantısı varsa)
      if (socketRef.current) {
        console.log("Socket üzerinden oyun başlatma bildirimi gönderiliyor, oyun tipi:", isMineSweeper ? 'mines' : 'tombala');
        socketRef.current.emit('gameStarted', {
          lobbyId: lobby?._id || lobbyCode,
          startedBy: currentUser.id,
          status: 'playing', // Status bilgisini de ekleyelim
          gameType: isMineSweeper ? 'mines' : 'tombala'
        });
      }
      
      // Oyun tipine göre yönlendirme yap
      if (isMineSweeper) {
        console.log("Mayın Tarlası oyununa yönlendiriliyor...");
        navigate(`/game/mines/${lobbyCode}`);
      } else {
        console.log("Tombala oyununa yönlendiriliyor...");
        navigate(`/game/tombala/${lobbyCode}`);
      }
      
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

      // Yeniden deneme için fonksiyon
      const attemptAddBot = async (retryCount = 0, maxRetries = 3) => {
        try {
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
            if (socketRef.current && response.data.bot) {
              socketRef.current.emit('botAdded', {
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
            
            return true;
          } else {
            throw new Error(response.data.message || 'Bot eklenirken bir hata oluştu');
          }
        } catch (error) {
          // Server hatası (500) ise ve yeniden deneme hakkımız varsa tekrar dene
          if (error.response?.status === 500 && retryCount < maxRetries) {
            console.log(`Bot ekleme başarısız oldu (${error.message}), ${retryCount + 1}/${maxRetries} kez yeniden deneniyor...`);
            
            // Kullanıcıya bildirim göster
            if (retryCount === 0) {
              enqueueSnackbar('Sunucu hatası nedeniyle bot eklenemedi. Yeniden deneniyor...', {
                variant: 'info',
                autoHideDuration: 2000
              });
            }
            
            // 1 saniye bekle ve tekrar dene
            await new Promise(resolve => setTimeout(resolve, 1000));
            return attemptAddBot(retryCount + 1, maxRetries);
          }
          
          // Maksimum deneme sayısına ulaşıldı veya başka bir hata oluştu
          throw error;
        }
      };
      
      // Bot eklemeyi dene
      await attemptAddBot();
      
    } catch (error) {
      console.error('Bot eklenirken hata:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Bot eklenirken bir hata oluştu';
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
    if (!socketRef.current || !user) return;

    // Socket event'lerinin çalıştığından emin olmak için debug
    const socketDebug = () => {
      const connected = socketRef.current.connected;
      setIsSocketConnected(connected);
      
      // Bağlantı durumu değiştiyse ve hazır durumu varsa kontrol et
      if (connected && lastKnownReadyState.current !== null && lobby?._id) {
        // Hazır durumunu socket üzerinden yeniden gönder
        socketRef.current.emit('playerStatusUpdate', {
          lobbyId: lobby._id,
          lobbyCode: lobbyCode,
          userId: user.id,
          isReady: lastKnownReadyState.current,
          timestamp: Date.now()
        });
        
        // Kendimize özel status güncelleme event'i
        socketRef.current.emit('myStatusUpdate', {
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

    // 10 saniyede bir soket durumunu kontrol et (3 saniye yerine)
    const debugInterval = setInterval(socketDebug, 10000);

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
      }
      
      // Hala userId yoksa ve farklı veri formatında olabilir
      if (!userId && data.lobbyId && (data.isReady !== undefined)) {
        // Bu durumda kendimize gelen bir güncelleme varsayalım
        userId = user?.id;
      }
      
      if (!userId) {
        console.error("Socket event'inden userId belirlenemedi:", data);
        // Hata olsa bile isReady durumu güncellenmek isteniyorsa işlemi devam ettir
        if (data.isReady !== undefined) {
          userId = user?.id; // Varsayılan olarak kendi kullanıcımız için güncelleme kabul et
        } else {
          return; // İşlenebilir veri yok, çık
        }
      }
      
      // UI'ı hemen güncelle - bu kısım hızlı tepki için
      setPlayers(prevPlayers => {
        const updatedPlayers = prevPlayers.map(player => {
          const playerId = player.id;
          const playerIdStr = typeof playerId === 'string' ? playerId : String(playerId || '');
          const userIdStr = typeof userId === 'string' ? userId : String(userId || '');
          
          // ID eşleşmesi kontrolü
          if (playerIdStr === userIdStr) {
            return { ...player, isReady: data.isReady };
          }
          return player;
        });
        
        return updatedPlayers;
      });
      
      // Kendimiz için güncelleme ise hazır durumu state'ini de güncelle
      if (userId.toString() === user?.id?.toString()) {
        setIsReady(data.isReady);
        lastKnownReadyState.current = data.isReady;
        
        // Hazır durum geçiş zamanını güncelleyelim
        readyStateTransitionTimeRef.current = Date.now();
      }
    };

    // Bildirim için genişletilmiş handler
    const handlePlayerStatusWithNotification = (data) => {
      handlePlayerStatus(data); // Mevcut handler çağrılıyor
      
      // Bildirim ekle
      if (data.userId && data.userId !== user.id) {
        const playerName = players.find(p => p.id === data.userId)?.name || 'Bir oyuncu';
        const isReadyStatus = data.isReady === true || data.isReady === 'true';
        
        playSound('ready');
        sendNotification(
          'Oyuncu Durumu Değişti',
          `${playerName} ${isReadyStatus ? 'hazır' : 'hazır değil'}.`
        );
      }
    };

    // Socket.io event listener'ları
    socketRef.current.on('playerStatusUpdate', handlePlayerStatusWithNotification);
    socketRef.current.on('myStatusUpdate', handlePlayerStatus);
    socketRef.current.on('botAdded', handleBotAdded);
    socketRef.current.on('playerJoined', handlePlayerJoined);
    socketRef.current.on('playerLeft', handlePlayerLeft);
    socketRef.current.on('playerKicked', handlePlayerKicked);
    socketRef.current.on('lobbyDeleted', handleLobbyDeleted);
    socketRef.current.on('lobbyUpdated', () => {
      fetchLobbyData(false);
    });
    
    // Yeni mesaj geldiğinde bildirim ve ses
    socketRef.current.on('newMessage', (data) => {
      // Yeni mesaj bildirimi ekleyin
      if (data.sender.id !== user.id) { // Kendi mesajımız değilse
        playSound('message');
        sendNotification(
          `Yeni Mesaj: ${data.sender.name}`,
          data.text
        );
      }
    });
    
    // Oyun başlatıldığında bildirim
    socketRef.current.on('gameStarted', (data) => {
      playSound('startGame');
      sendNotification(
        'Oyun Başlıyor!', 
        'Tombala oyunu için hazırlanın, oyun başladı!'
      );
    });
    
    // Socket'e tekrar bağlan
    socketRef.current.connect();
    
    // Bağlantı kontrolü
    socketRef.current.on('connect', () => {
      setIsSocketConnected(true);
      
      // Bağlantı sonrası kimlik doğrulama yap
      if (user?.id) {
        socketRef.current.emit('identify', user.id);
        
        // Hazır durumunu yeniden gönder (eğer varsa)
        if (lastKnownReadyState.current !== null && lobby?._id) {
          // Kısa bir gecikme ile gönder (kimlik doğrulamasının tamamlanması için)
          setTimeout(() => {
            socketRef.current.emit('playerStatusUpdate', {
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
    
    socketRef.current.on('disconnect', () => {
      setIsSocketConnected(false);
      
      // Son bilinen hazır durumunu kaydet
      lastKnownReadyState.current = isReady;
    });

    // Her 30 saniyede bir tam yenileme yap (10 saniye yerine)
    const fullRefreshInterval = setInterval(() => {
      // Socket bağlantısı yoksa daha sık güncelle
      if (!isSocketConnected) {
        fetchLobbyData(false);
      }
    }, 30000); // 30 saniyede bir (10 saniye yerine)

    // Cleanup fonksiyonu - bildirim sistemi için güncellenmiş
    return () => {
      socketRef.current.off('playerStatusUpdate', handlePlayerStatusWithNotification);
      socketRef.current.off('myStatusUpdate', handlePlayerStatus);
      socketRef.current.off('botAdded', handleBotAdded);
      socketRef.current.off('playerJoined', handlePlayerJoined);
      socketRef.current.off('playerLeft', handlePlayerLeft);
      socketRef.current.off('playerKicked', handlePlayerKicked);
      socketRef.current.off('lobbyDeleted', handleLobbyDeleted);
      socketRef.current.off('lobbyUpdated');
      socketRef.current.off('connect');
      socketRef.current.off('disconnect');
      socketRef.current.off('newMessage');
      socketRef.current.off('gameStarted');
      clearInterval(fullRefreshInterval);
      clearInterval(debugInterval);
    };
  }, [socketRef.current, user, lobbyCode, navigate, enqueueSnackbar, lobby?._id, isReady, players]);

  // Lobiden çıkış yapma fonksiyonu
  const leaveLobby = async () => {
    try {
      if (!lobbyCode || !user?.id) {
        console.error("Lobiden çıkış için gerekli bilgiler eksik:", { lobbyCode, userId: user?.id });
        return;
      }
      
      console.log("Lobiden çıkış yapılıyor...", lobbyCode);
      
      // Socket.io üzerinden çıkış olayını tetikle
      if (socketRef.current) {
        socketRef.current.emit('leaveLobby', {
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
  
  // Yeni bir oyuncu katıldı eventi - güçlendirilmiş işleme ve bildirim sistemi eklenmiş hali
  const handlePlayerJoined = (data) => {
    if (!data || !data.player || !data.player.id) {
      console.error('Socket: Geçersiz oyuncu verisi', data);
      return;
    }
    
    // Kendimiz değilse mesaj ekle ve bildirim gönder
    if (data.player.id !== user.id) {
      // Sistem mesajı ekle
      addSystemMessage(`${data.player.name || 'Bir oyuncu'} lobiye katıldı.`);
      
      // Bildirim ve ses çal
      playSound('join');
      sendNotification(
        'Yeni Oyuncu Katıldı', 
        `${data.player.name || 'Bir oyuncu'} lobiye katıldı.`,
        data.player.avatar || '/avatar-default.png'
      );
      
      // Oyuncuyu hemen ekleyelim, sonraki polling'i beklemeden
      setPlayers(prevPlayers => {
        // Oyuncu zaten var mı kontrol et
        if (prevPlayers.some(p => p.id === data.player.id)) {
          return prevPlayers;
        }
        
        // Avatar URL'sini önbellekleme ile hazırla
        let avatarUrl = data.player.avatar || data.player.profileImage || null;
        
        // Avatar URL'sine önbellekleme parametresi ekle
        if (avatarUrl && typeof avatarUrl === 'string' && !avatarUrl.startsWith('data:')) {
          if (avatarUrl.includes('?')) {
            avatarUrl = `${avatarUrl}&_t=${Date.now()}`;
          } else {
            avatarUrl = `${avatarUrl}?_t=${Date.now()}`;
          }
        }
        
        // Yeni oyuncuyu ekle
        const newPlayer = {
          id: data.player.id,
          name: data.player.name || 'Oyuncu',
          avatar: avatarUrl,
          isReady: data.player.isReady || false,
          isBot: data.player.isBot || false
        };
        
        return [...prevPlayers, newPlayer];
      });
    }
    
    // Hem ekleme hem de tam güncelleme yap
    setTimeout(() => {
      fetchLobbyData(false);
    }, 250);
  };

  // Bot eklenme eventi - bildirim sistemi eklenmiş hali
  const handleBotAdded = (data) => {
    console.log('Socket: Bot eklendi', data);
    
    if (!data || !data.botId) {
      console.error('Socket: Geçersiz bot verisi', data);
      return;
    }
    
    const botName = data.botName || 'Bot';
    addSystemMessage(`Bir bot eklendi: ${botName}`);
    
    // Bildirim ve ses çal
    playSound('join');
    sendNotification(
      'Bot Eklendi', 
      `${botName} lobiye eklendi.`,
      data.botAvatar || `https://api.dicebear.com/6.x/bottts/svg?seed=${botName}`
    );
    
    // Botu hemen ekle
    setPlayers(prevPlayers => {
      if (prevPlayers.some(p => p.id === data.botId)) {
        return prevPlayers;
      }
      
      // Bot avatarı için DiceBear kullanılıyor - önbellekleme ile
      const botAvatar = data.botAvatar || 
        `https://api.dicebear.com/6.x/bottts/svg?seed=${botName || 'Bot'}&_t=${Date.now()}`;
      
      const botPlayer = {
        id: data.botId,
        name: botName,
        avatar: botAvatar,
        isReady: true, // Botlar her zaman hazır
        isBot: true
      };
      return [...prevPlayers, botPlayer];
    });
    
    // Tam bir güncelleme yap
    setTimeout(() => fetchLobbyData(false), 250);
  };

  // Oyuncu çıkma eventi - bildirim sistemi ile güncellenmiş
  const handlePlayerLeft = (data) => {
    console.log('Socket: Oyuncu çıktı', data);
    if (data.userId) {
      const playerName = data.playerName || players.find(p => p.id === data.userId)?.name || 'Bir oyuncu';
      
      // Önce oyuncu listesinden çıkar
      setPlayers(prev => prev.filter(p => p.id !== data.userId));
      
      // Sistem mesajı ekle
      addSystemMessage(`${playerName} lobiden ayrıldı.`);
      
      // Bildirim ve ses çal
      playSound('message');
      sendNotification(
        'Oyuncu Ayrıldı', 
        `${playerName} lobiden ayrıldı.`
      );
      
      // Tam bir güncelleme yap
      setTimeout(() => fetchLobbyData(false), 250);
    }
  };
  
  // Oyuncu atılma eventi - bildirim sistemi ile güncellenmiş
  const handlePlayerKicked = (data) => {
    console.log('Socket: Oyuncu atıldı', data);
    if (data.playerId) {
      // Eğer kendimiz atıldıysak ana sayfaya yönlendir
      if (data.playerId === user.id) {
        enqueueSnackbar('Lobi sahibi tarafından lobiden atıldınız.', { 
          variant: 'warning',
          autoHideDuration: 5000 
        });
        
        // Ses çal
        playSound('message');
        
        // Kullanıcı atıldığında gösterilecek diyaloğu aç
        setKickedDialogOpen(true);
        return;
      }
      
      const playerName = data.playerName || players.find(p => p.id === data.playerId)?.name || 'Bir oyuncu';
      
      // Oyuncu listesinden atılan oyuncuyu çıkar
      setPlayers(prev => prev.filter(p => p.id !== data.playerId));
      
      // Sistem mesajı ekle
      addSystemMessage(`${playerName} lobiden atıldı.`);
      
      // Bildirim ve ses çal
      playSound('message');
      sendNotification(
        'Oyuncu Atıldı', 
        `${playerName} lobiden atıldı.`
      );
      
      // Tam bir güncelleme yap
      setTimeout(() => fetchLobbyData(false), 250);
    }
  };
  
  // Lobi silindi eventi
  const handleLobbyDeleted = (data) => {
    console.log('Socket: Lobi silindi', data);
    enqueueSnackbar('Lobi silindi veya kapatıldı.', { 
      variant: 'info', 
      autoHideDuration: 5000 
    });
    
    // Ana sayfaya otomatik yönlendirme yerine lobbyNotFound göster
    setLobbyNotFound(true);
  };

  // Bildirimleri sıfırlama fonksiyonu
  const resetNotifications = () => {
    if (pendingNotifications > 0) {
      setPendingNotifications(0);
      document.title = originalTitle;
    }
  };
  
  // Sekme aktif/pasif durum kontrolü için useEffect
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsTabActive(isVisible);
      
      // Sekme aktif olduğunda, bekleyen bildirimleri sıfırla
      if (isVisible) {
        resetNotifications();
      }
    };
    
    // Sayfa ilk yüklendiğinde orijinal başlığı kaydet
    setOriginalTitle(document.title);
    
    // Sekme değişikliği olayını dinle
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Temizleme fonksiyonu
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Sayfa kapanırken başlığı sıfırla
      document.title = originalTitle;
    };
  }, [pendingNotifications]);
  
  // Ses dosyalarını yüklemek için useEffect
  useEffect(() => {
    // Ses dosyaları için daha güvenli kod
    const loadSoundFile = (path) => {
      try {
        // Tüm olası yolları dene
        const possiblePaths = [
          `/sounds/${path}`,                    // Ana web sunucusundan
          `${process.env.PUBLIC_URL}/sounds/${path}`, // React public dizininden
          `/public/sounds/${path}`,             // Göreceli yoldan
          `./sounds/${path}`                    // Mevcut dizinden
        ];
        
        // İlk bir ses dosyası oluştur
        const audio = new Audio();
        
        // Her bir yolu dene
        for (const soundPath of possiblePaths) {
          try {
            audio.src = soundPath;
            // Test et - tüm tarayıcılar preload'u desteklemez
            audio.preload = 'auto';
            console.log(`Ses dosyası yükleme denemesi: ${soundPath}`);
            
            // Preload işlemi başarılıysa bu yolu kullan
            audio.addEventListener('canplaythrough', () => {
              console.log(`Ses dosyası başarıyla yüklendi: ${soundPath}`);
            });
            
            // Hata durumunda diğer yolu dene
            audio.addEventListener('error', () => {
              console.warn(`Ses dosyası yüklenemedi: ${soundPath}`);
            });
            
            return audio;
          } catch (e) {
            console.warn(`Ses dosyası yükleme hatası (${soundPath}):`, e);
          }
        }
        
        // Hiçbir yol çalışmadıysa null dön
        console.error(`Hiçbir ses dosyası yolu çalışmadı: ${path}`);
        return null;
      } catch (e) {
        console.error(`Ses dosyası oluşturma hatası:`, e);
        return null;
      }
    };

    // Ses dosyalarını yükle
    joinSoundRef.current = loadSoundFile('join.mp3');
    readySoundRef.current = loadSoundFile('ready.mp3');
    startGameSoundRef.current = loadSoundFile('start-game.mp3');
    messageSoundRef.current = loadSoundFile('message.mp3');
    
    console.log('Ses dosyaları yüklemeye çalışıldı', { 
      joinSound: Boolean(joinSoundRef.current),
      readySound: Boolean(readySoundRef.current),
      startGameSound: Boolean(startGameSoundRef.current),
      messageSound: Boolean(messageSoundRef.current)
    });

    // Temizleme fonksiyonu
    return () => {
      // Ses dosyalarını temizle
      [joinSoundRef, readySoundRef, startGameSoundRef, messageSoundRef].forEach(soundRef => {
        if (soundRef.current) {
          soundRef.current.pause();
          soundRef.current.src = '';
          soundRef.current = null;
        }
      });
    };
  }, []);
  
  // Bildirim izin durumunu kontrol et - daha güvenli hale getirelim
  useEffect(() => {
    const checkNotificationPermission = () => {
      if (!('Notification' in window)) {
        console.log('Bu tarayıcı bildirimleri desteklemiyor.');
        setNotificationsEnabled(false);
        
        // settings state'ini de güncelle
        setSettings(prev => ({
          ...prev,
          notificationsEnabled: false
        }));
        
        return;
      }

      console.log('Bildirim izni durumu:', Notification.permission);
      setNotificationPermission(Notification.permission);
      
      // İzin granted ise bildirimleri etkinleştir
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
        
        // settings state'ini de güncelle
        setSettings(prev => ({
          ...prev,
          notificationsEnabled: true
        }));
      } else {
        // Kullanıcı daha önce denied demiş olabilir
        setNotificationsEnabled(false);
        
        // settings state'ini de güncelle
        setSettings(prev => ({
          ...prev,
          notificationsEnabled: false
        }));
      }
    };
    
    checkNotificationPermission();
    
   
  }, []);
  
  // Bildirim gönderme fonksiyonu - hata yönetimini güçlendirelim
  const sendNotification = (title, message, icon = '/logo.png') => {
    console.log('Bildirim gönderiliyor:', { title, message, icon, isTabActive });
    
    // Sekme aktifse ve bildirim ayarı açıksa sadece sesli bildirim ver
    if (isTabActive) {
      console.log('Sekme aktif, bildirim gösterilmedi');
      return;
    }
    
    // Sekme bildirimi güncelle
    setPendingNotifications(prev => {
      const newCount = prev + 1;
      document.title = `(${newCount}) ${originalTitle || 'Game Center'}`;
      console.log(`Sekme başlığı güncellendi: (${newCount}) ${originalTitle || 'Game Center'}`);
      return newCount;
    });
    
    // Tarayıcı bildirimi gönder (izin verilmişse)
    if (notificationsEnabled && notificationPermission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: message,
          icon: icon || '/logo.png'
        });
        
        // Bildirime tıklandığında sekmeyi aktif et
        notification.onclick = () => {
          window.focus();
          notification.close();
          resetNotifications();
          console.log('Bildirime tıklandı, sekme aktifleştirildi');
        };
        
        console.log('Tarayıcı bildirimi gönderildi:', title);
        
        // 5 saniye sonra bildirimi otomatik kapat
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Bildirim gösterme hatası:', error);
        
        // Fallback olarak alert() kullanılabilir (isteğe bağlı)
        // alert(`${title}: ${message}`);
        
        // Bildirimleri default kapalı yap
        setNotificationsEnabled(false);
        
        // settings state'ini de güncelle
        setSettings(prevSettings => ({
          ...prevSettings,
          notificationsEnabled: false
        }));
        
        enqueueSnackbar('Bildirimler gösterilemiyor, lütfen tarayıcı izinlerini kontrol edin', { 
          variant: 'warning',
          autoHideDuration: 5000
        });
      }
    } else {
      console.log('Bildirimler etkin değil veya izin yok:', { 
        notificationsEnabled, 
        permission: notificationPermission 
      });
    }
  };
  
  // Ses çalma fonksiyonu - hata yönetimini iyileştirelim
  const playSound = (soundType) => {
    console.log(`Ses çalmaya çalışılıyor: ${soundType}`, { soundsEnabled });
    
    if (!soundsEnabled) {
      console.log('Ses ayarı kapalı, ses çalınmadı');
      return;
    }
    
    try {
      let sound = null;
      
      switch (soundType) {
        case 'join':
          sound = joinSoundRef.current;
          break;
        case 'ready':
          sound = readySoundRef.current;
          break;
        case 'startGame':
          sound = startGameSoundRef.current;
          break;
        case 'message':
          sound = messageSoundRef.current;
          break;
        default:
          console.warn(`Bilinmeyen ses tipi: ${soundType}`);
          return;
      }
      
      if (sound) {
        console.log(`Ses çalmaya hazır: ${soundType}`);
        sound.currentTime = 0;
        
        // Ses çalma işleminin sonucunu bekle
        const playPromise = sound.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Ses çalındı: ${soundType}`);
            })
            .catch(err => {
              console.error(`Ses çalma hatası (${soundType}):`, err);
              
              // Kullanıcı etkileşimi gerekebilir (mobil tarayıcılarda)
              if (err.name === 'NotAllowedError') {
                console.warn('Ses çalma işlemi kullanıcı etkileşimi gerektirebilir');
                // Sessiz modu etkinleştir ve bilgilendir
                setSoundsEnabled(false);
                enqueueSnackbar('Ses çalınamıyor, lütfen bir buton tıklayın ve tekrar deneyin', { 
                  variant: 'warning',
                  autoHideDuration: 5000
                });
              }
            });
        }
      } else {
        console.error(`Ses dosyası bulunamadı: ${soundType}`);
        setSoundsEnabled(false);
        
        // settings state'ini de güncelle
        setSettings(prevSettings => ({
          ...prevSettings,
          soundsEnabled: false
        }));
      }
    } catch (error) {
      console.error(`Ses çalma hatası (${soundType}):`, error);
      setSoundsEnabled(false);
      
      // settings state'ini de güncelle
      setSettings(prevSettings => ({
        ...prevSettings,
        soundsEnabled: false
      }));
    }
  };

  // Bildirim ve ses ayarlarını değiştirme fonksiyonu - güçlendirilmiş
  const toggleNotifications = () => {
    if (!('Notification' in window)) {
      enqueueSnackbar('Bu tarayıcı bildirimleri desteklemiyor', {
        variant: 'error',
        autoHideDuration: 5000
      });
      return;
    }
    
    if (!notificationsEnabled && notificationPermission !== 'granted') {
      requestNotificationPermission();
    } else {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      
      // settings state'ini de güncelle
      setSettings(prev => ({
        ...prev,
        notificationsEnabled: newState
      }));
      
      // Durumu kaydet (localStorage veya başka bir yöntemle kalıcı hale getirilebilir)
      try {
        localStorage.setItem('notificationsEnabled', JSON.stringify(newState));
      } catch (e) {
        console.error("localStorage hatası:", e);
      }
      
      enqueueSnackbar(`Bildirimler ${newState ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`, {
        variant: 'info',
        autoHideDuration: 2000
      });
      
      // Test bildirim
      if (newState) {
        setTimeout(() => {
          sendNotification('Bildirim Testi', 'Bildirimler başarıyla etkinleştirildi!');
        }, 500);
      }
    }
  };
  
  const toggleSounds = () => {
    const newState = !soundsEnabled;
    setSoundsEnabled(newState);
    
    // settings state'ini de güncelle
    setSettings(prev => ({
      ...prev,
      soundsEnabled: newState
    }));
    
    // Durumu kaydet (localStorage veya başka bir yöntemle kalıcı hale getirilebilir)
    try {
      localStorage.setItem('soundsEnabled', JSON.stringify(newState));
    } catch (e) {
      console.error("localStorage hatası:", e);
    }
    
    enqueueSnackbar(`Sesler ${newState ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`, {
      variant: 'info',
      autoHideDuration: 2000
    });
    
    // Test ses
    if (newState) {
      setTimeout(() => {
        playSound('message');
      }, 500);
    }
  };
  
  // Bildirim izni iste - güçlendirilmiş
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Bu tarayıcı bildirimleri desteklemiyor.');
      enqueueSnackbar('Bu tarayıcı bildirimleri desteklemiyor', {
        variant: 'error',
        autoHideDuration: 5000
      });
      return;
    }
    
    try {
      console.log('Bildirim izni isteniyor...');
      const permission = await Notification.requestPermission();
      console.log('Bildirim izni yanıtı:', permission);
      
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // settings state'ini de güncelle
        setSettings(prev => ({
          ...prev,
          notificationsEnabled: true
        }));
        
        // Durumu kaydet
        try {
          localStorage.setItem('notificationsEnabled', 'true');
        } catch (e) {
          console.error("localStorage hatası:", e);
        }
        
        enqueueSnackbar('Bildirimler başarıyla etkinleştirildi!', {
          variant: 'success',
          autoHideDuration: 3000
        });
        
        // Test bildirim
        setTimeout(() => {
          sendNotification('Bildirim Testi', 'Bildirimler başarıyla etkinleştirildi!');
        }, 500);
      } else if (permission === 'denied') {
        setNotificationsEnabled(false);
        
        // settings state'ini de güncelle
        setSettings(prev => ({
          ...prev,
          notificationsEnabled: false
        }));
        
        // Durumu kaydet
        try {
          localStorage.setItem('notificationsEnabled', 'false');
        } catch (e) {
          console.error("localStorage hatası:", e);
        }
        
        enqueueSnackbar('Bildirim izni reddedildi. Bildirim ayarlarından izin vermeniz gerekiyor.', {
          variant: 'warning',
          autoHideDuration: 5000
        });
      } else {
        // default veya başka bir durum - default olarak kapalı
        setNotificationsEnabled(false);
        
        // settings state'ini de güncelle
        setSettings(prev => ({
          ...prev,
          notificationsEnabled: false
        }));
      }
    } catch (error) {
      console.error('Bildirim izni isteme hatası:', error);
      setNotificationsEnabled(false);
      
      // settings state'ini de güncelle
      setSettings(prev => ({
        ...prev,
        notificationsEnabled: false
      }));
      
      enqueueSnackbar('Bildirim izni alınamadı, bir hata oluştu', {
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  };
  
  // LocalStorage'dan ayarları yüklemek için kullanacağımız effect
  useEffect(() => {
    try {
      // Bildirim ayarlarını yükle
      const storedNotifications = localStorage.getItem('notificationsEnabled');
      const storedSounds = localStorage.getItem('soundsEnabled');
      
      if (storedNotifications !== null) {
        const notificationValue = JSON.parse(storedNotifications);
        setNotificationsEnabled(notificationValue);
        
        // settings state'ini de güncelle
        setSettings(prev => ({
          ...prev,
          notificationsEnabled: notificationValue
        }));
      }
      
      if (storedSounds !== null) {
        const soundValue = JSON.parse(storedSounds);
        setSoundsEnabled(soundValue);
        
        // settings state'ini de güncelle
        setSettings(prev => ({
          ...prev,
          soundsEnabled: soundValue
        }));
      }
      
      console.log('LocalStorage ayarları yüklendi:', { 
        notificationsEnabled: storedNotifications, 
        soundsEnabled: storedSounds 
      });
    } catch (e) {
      console.error("LocalStorage okuma hatası:", e);
    }
  }, []);

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
  
  // Lobi bulunamadı durumu
  if (lobbyNotFound) {
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
              p={4}
              textAlign="center"
            >
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Lobi Bulunamadı
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 3 }}>
                Aradığınız lobi artık mevcut değil veya silinmiş olabilir. Lobinin sahibi lobiyi kapatmış ya da sistem tarafından otomatik temizlenmiş olabilir.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/home')}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: '50px',
                    fontWeight: 'bold'
                  }}
                >
                  Ana Sayfaya Dön
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: '50px',
                  }}
                >
                  Yeniden Dene
                </Button>
              </Box>
            </Box>
          </PageContainer>
        </ThemeProvider>
      </MainLayout>
    );
  }
  
  // Ayarlar diyaloğu için gerekli fonksiyonları ekleyelim
  const handleSettingsDialogOpen = () => {
    // Mevcut lobi ayarlarını al
    if (lobby) {
      setLobbySettings({
        // Lobi ayarları
        name: lobby.name || 'Tombala Lobisi',
        maxPlayers: lobby.maxPlayers || 6
      });
    }
    setSettingsDialogOpen(true);
  };

  const handleSettingsDialogClose = () => {
    setSettingsDialogOpen(false);
  };

  const handleSettingsChange = (event) => {
    const { name, value, checked, type } = event.target;
    // Checkbox için checked, diğer input tipleri için value kullan
    const newValue = type === 'checkbox' ? checked : value;
    
    setLobbySettings((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const saveSettings = async () => {
    try {
      if (!lobby?._id) {
        enqueueSnackbar('Lobi bilgisi bulunamadı', { 
          variant: 'error', 
          autoHideDuration: 3000 
        });
        return;
      }

      // İstek gönderilmeden önce kontrolleri yap
      if (!lobbySettings.name || lobbySettings.name.trim() === '') {
        enqueueSnackbar('Lobi adı boş olamaz', { 
          variant: 'error', 
          autoHideDuration: 3000 
        });
        return;
      }

      // Number olarak dönüştürme
      const maxPlayersNum = parseInt(lobbySettings.maxPlayers, 10);

      if (!maxPlayersNum || maxPlayersNum < 2 || maxPlayersNum > 100) {
        enqueueSnackbar('Oyuncu sayısı 2-100 arasında olmalıdır', { 
          variant: 'error', 
          autoHideDuration: 3000 
        });
        return;
      }

      // Mevcut oyuncu sayısı kontrolü - lobideki oyuncu sayısından düşük olamaz
      if (players.length > maxPlayersNum) {
        enqueueSnackbar(`Lobide şu anda ${players.length} oyuncu var. Maksimum oyuncu sayısı daha yüksek olmalıdır.`, { 
          variant: 'error', 
          autoHideDuration: 3000 
        });
        return;
      }

      console.log("Lobi ayarları gönderiliyor:", {
        name: lobbySettings.name,
        maxPlayers: maxPlayersNum
      });

      // Değişen ayarları belirle - sadece değişenleri gönder
      const updatedSettings = {};
      
      if (lobbySettings.name !== lobby.name) {
        updatedSettings.name = lobbySettings.name;
      }
      
      if (maxPlayersNum !== lobby.maxPlayers) {
        updatedSettings.maxPlayers = maxPlayersNum;
      }
      
      // Herhangi bir değişiklik yoksa çık
      if (Object.keys(updatedSettings).length === 0) {
        enqueueSnackbar('Değişiklik yapılmadı', { 
          variant: 'info', 
          autoHideDuration: 3000 
        });
        handleSettingsDialogClose();
        return;
      }

      // API'ye ayarları gönder
      const response = await axiosInstance.put(`/lobbies/${lobby._id}`, updatedSettings);

      if (response.data) {
        // Lobi bilgilerini güncelle
        setLobby({
          ...lobby,
          ...updatedSettings
        });

        // Başarı mesajı göster
        enqueueSnackbar('Lobi ayarları güncellendi', { 
          variant: 'success', 
          autoHideDuration: 3000 
        });

        // Socket üzerinden diğer oyunculara bildir
        if (socketRef.current) {
          socketRef.current.emit('lobbyUpdated', {
            lobbyId: lobby._id,
            lobbyCode: lobby.lobbyCode,
            settings: updatedSettings
          });
        }

        // Diyaloğu kapat
        handleSettingsDialogClose();
        
        // API'den tüm lobi verilerini yeniden çek
        await fetchLobbyData(true);
      }
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      console.error('Hata detayları:', error.response?.data);
      
      // Hata cevabını detaylı bir şekilde kontrol et ve kullanıcıya anlamlı mesaj göster
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'Ayarlar kaydedilemedi';
                         
      enqueueSnackbar('Ayarlar kaydedilemedi: ' + errorMessage, { 
        variant: 'error', 
        autoHideDuration: 5000 
      });
    }
  };
  
  // Oyuncuları lobiden atma (kick) fonksiyonu - sadece lobi sahibi kullanabilir
  const kickPlayer = async (playerToKick) => {
    if (!isUserHost(lobby, user.id)) {
      console.error("Sadece lobi sahibi oyuncuları atabilir!");
      enqueueSnackbar('Bu işlemi yapabilmek için lobi sahibi olmanız gerekiyor.', { 
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    // Kendini atamaz
    if (playerToKick.id === user.id) {
      console.error("Kendinizi atamazsınız!");
      enqueueSnackbar('Kendinizi lobiden atamazsınız.', { 
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    // Başka bir lobi sahibini atamaz
    if (playerToKick.isOwner) {
      console.error("Lobi sahibini atamazsınız!");
      enqueueSnackbar('Lobi sahibini lobiden atamazsınız.', { 
        variant: 'error',
        autoHideDuration: 3000
      });
      return;
    }

    try {
      console.log(`${playerToKick.name} adlı oyuncuyu lobiden atmak için istek gönderiliyor...`);
      
      // API isteği için parametreler hazırlama
      const requestData = {
        lobbyId: lobby._id,
        lobbyCode: lobby.lobbyCode,
        playerId: playerToKick.id,
        isBot: playerToKick.isBot || false
      };
      
      console.log('Atma isteği verileri:', requestData);
      
      // Atma API'sini çağır
      const response = await axiosInstance.post('/lobbies/kick-player', requestData);
      
      console.log('Atma işlemi yanıtı:', response.data);
      
      if (response.data.success) {
        // Başarılı atma işlemi
        enqueueSnackbar(`${playerToKick.name} lobiden atıldı.`, { 
          variant: 'success',
          autoHideDuration: 3000
        });
        
        // Oyuncu listesinden manuel olarak oyuncuyu kaldır (socket eventi beklemeden)
        setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerToKick.id));
        
        // Socket olayı ile diğer oyuncuları bilgilendirmek için lobiyi anlık günceller
        setTimeout(() => fetchLobbyData(false), 250);
      } else {
        // Başarısız atma işlemi
        enqueueSnackbar(response.data.message || 'Oyuncu atma işlemi başarısız oldu.', { 
          variant: 'error',
          autoHideDuration: 3000
        });
      }
    } catch (error) {
      console.error('Oyuncu atma işlemi sırasında hata:', error);
      enqueueSnackbar('Oyuncu atma işlemi sırasında bir hata oluştu.', { 
        variant: 'error',
        autoHideDuration: 3000
      });
    }
  };
  
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
                    {lobby?.game?.toUpperCase() || 'BINGO'}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" gap={2} alignItems="center">
                {/* Bildirim ayarları için yeni butonlar */}
                <Tooltip title={notificationsEnabled ? "Bildirimleri Kapat" : "Bildirimleri Aç"}>
                  <IconButton
                    onClick={toggleNotifications}
                    sx={{
                      background: notificationsEnabled ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      transition: 'all 0.3s ease',
                      border: notificationsEnabled ? 
                        '1px solid rgba(76, 175, 80, 0.3)' : 
                        '1px solid rgba(244, 67, 54, 0.3)',
                      p: 1,
                      '&:hover': {
                        background: notificationsEnabled ? 
                          'rgba(76, 175, 80, 0.2)' : 
                          'rgba(244, 67, 54, 0.2)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {notificationsEnabled ? (
                      <NotificationIcon sx={{ color: '#4CAF50' }} />
                    ) : (
                      <NotificationOffIcon sx={{ color: '#F44336' }} />
                    )}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={soundsEnabled ? "Sesleri Kapat" : "Sesleri Aç"}>
                  <IconButton
                    onClick={toggleSounds}
                    sx={{
                      background: soundsEnabled ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
                      transition: 'all 0.3s ease',
                      border: soundsEnabled ? 
                        '1px solid rgba(76, 175, 80, 0.3)' : 
                        '1px solid rgba(244, 67, 54, 0.3)',
                      p: 1,
                      '&:hover': {
                        background: soundsEnabled ? 
                          'rgba(76, 175, 80, 0.2)' : 
                          'rgba(244, 67, 54, 0.2)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {soundsEnabled ? (
                      <MusicNoteIcon sx={{ color: '#4CAF50' }} />
                    ) : (
                      <VolumeOffIcon sx={{ color: '#F44336' }} />
                    )}
                  </IconButton>
                </Tooltip>
                
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
                
                {/* Mevcut butonlar devam ediyor */}
                {lobby && user && (isUserHost(lobby, user.id) || players.some(p => p.id === user.id && p.isOwner)) && (
                  <Tooltip title="Lobi Ayarları">
                    <IconButton
                      onClick={handleSettingsDialogOpen}
                      sx={{
                        background: 'rgba(74, 125, 255, 0.1)', 
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(74, 125, 255, 0.3)',
                        p: 1,
                        '&:hover': {
                          background: 'rgba(74, 125, 255, 0.2)',
                          transform: 'scale(1.1)',
                          borderColor: '#4a7dff'
                        }
                      }}
                    >
                      <SettingsIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                )}
                
                <Tooltip title="Lobi Kodunu Kopyala">
                  <LobbyCode onClick={handleCopyLobbyCode}>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#fff' }}>
                      {lobbyCode}
                    </Typography>
                    <CopyIcon fontSize="small" color="primary" />
                  </LobbyCode>
                </Tooltip>
                
                <Tooltip title="Lobi Bağlantısını Paylaş">
                  <IconButton
                    onClick={handleShareMenuOpen}
                    sx={{
                      background: 'rgba(74, 125, 255, 0.1)', 
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(74, 125, 255, 0.3)',
                      p: 1,
                      '&:hover': {
                        background: 'rgba(74, 125, 255, 0.2)',
                        transform: 'scale(1.1)',
                        borderColor: '#4a7dff'
                      }
                    }}
                  >
                    <ShareIcon color="primary" />
                  </IconButton>
                </Tooltip>
              </Box>
            </LobbyInfoContainer>
          </Zoom>
          
          {/* Bildirim Ayarları Diyaloğu - daha sonra eklenebilir */}
          
          {/* Paylaşım Menüsü */}
          <Menu
            anchorEl={shareMenuAnchorEl}
            open={Boolean(shareMenuAnchorEl)}
            onClose={handleShareMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                background: 'rgba(30, 32, 68, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: 1
              }
            }}
          >
            <MenuItem onClick={() => handleShare('facebook')} sx={{ gap: 2, borderRadius: '8px', mb: 0.5 }}>
              <FaFacebook color="#1877F2" size={20} />
              <Typography>Facebook</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleShare('twitter')} sx={{ gap: 2, borderRadius: '8px', mb: 0.5 }}>
              <FaTwitter color="#1DA1F2" size={20} />
              <Typography>Twitter</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleShare('whatsapp')} sx={{ gap: 2, borderRadius: '8px', mb: 0.5 }}>
              <FaWhatsapp color="#25D366" size={20} />
              <Typography>WhatsApp</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleShare('telegram')} sx={{ gap: 2, borderRadius: '8px', mb: 0.5 }}>
              <FaTelegram color="#0088cc" size={20} />
              <Typography>Telegram</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleShare('email')} sx={{ gap: 2, borderRadius: '8px', mb: 0.5 }}>
              <FaEnvelope color="#FF5722" size={20} />
              <Typography>E-posta</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleShare('copy')} sx={{ gap: 2, borderRadius: '8px' }}>
              <FaLink color="#4a7dff" size={20} />
              <Typography>Linki Kopyala</Typography>
            </MenuItem>
          </Menu>
          
          {/* Paylaşım Diyaloğu */}
          <Dialog
            open={shareDialogOpen}
            onClose={handleShareDialogClose}
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, #23244d 0%, #181a2f 100%)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px 0 rgba(74,125,255,0.15), 0 1.5px 8px 0 #4a7dff30',
                border: '1.5px solid rgba(74,125,255,0.15)',
                width: { xs: '90%', sm: '400px' },
                maxWidth: '500px',
                overflow: 'visible',
                p: 0
              }
            }}
          >
            <DialogTitle
              sx={{
                borderBottom: 'none',
                pb: 2,
                background: 'linear-gradient(90deg, #4a7dff, #ff53f0)',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: 0.5
              }}
            >
                Lobi Davetiyesini Paylaş
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 2, overflow: 'visible', maxHeight: 'none' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.8)' }}>
                  Lobi bağlantısı:
                </Typography>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  background: 'rgba(74,125,255,0.08)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #4a7dff40',
                  boxShadow: '0 0 8px #4a7dff30',
                  mb: 2
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      flex: 1, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#4a7dff',
                      fontWeight: 600
                    }}
                  >
                    {shareLink}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      setShareSuccessMessage('Link kopyalandı!');
                      setTimeout(() => setShareSuccessMessage(''), 2000);
                    }}
                    sx={{ color: '#4a7dff', transition: 'all 0.2s', '&:hover': { color: '#ff53f0', background: 'rgba(255,255,255,0.08)' } }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
                {/* QR Kod Alanı */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <QRCodeSVG 
                    value={shareLink} 
                    size={96} 
                    bgColor="#23244d" 
                    fgColor="#4a7dff" 
                    style={{ borderRadius: 8 }}
                  />
              </Box>
              </Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.8)' }}>
                Sosyal medyada paylaş:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                <IconButton onClick={() => handleShare('facebook')} sx={{ backgroundColor: 'rgba(24, 119, 242, 0.12)', p: 1.5, transition: 'all 0.3s', '&:hover': { backgroundColor: 'rgba(24, 119, 242, 0.22)', transform: 'scale(1.1)' } }}>
                  <FaFacebook color="#1877F2" size={24} />
                </IconButton>
                <IconButton onClick={() => handleShare('twitter')} sx={{ backgroundColor: 'rgba(29, 161, 242, 0.12)', p: 1.5, transition: 'all 0.3s', '&:hover': { backgroundColor: 'rgba(29, 161, 242, 0.22)', transform: 'scale(1.1)' } }}>
                  <FaTwitter color="#1DA1F2" size={24} />
                </IconButton>
                <IconButton onClick={() => handleShare('whatsapp')} sx={{ backgroundColor: 'rgba(37, 211, 102, 0.12)', p: 1.5, transition: 'all 0.3s', '&:hover': { backgroundColor: 'rgba(37, 211, 102, 0.22)', transform: 'scale(1.1)' } }}>
                  <FaWhatsapp color="#25D366" size={24} />
                </IconButton>
                <IconButton onClick={() => handleShare('telegram')} sx={{ backgroundColor: 'rgba(0, 136, 204, 0.12)', p: 1.5, transition: 'all 0.3s', '&:hover': { backgroundColor: 'rgba(0, 136, 204, 0.22)', transform: 'scale(1.1)' } }}>
                  <FaTelegram color="#0088cc" size={24} />
                </IconButton>
                <IconButton onClick={() => handleShare('email')} sx={{ backgroundColor: 'rgba(255, 87, 34, 0.12)', p: 1.5, transition: 'all 0.3s', '&:hover': { backgroundColor: 'rgba(255, 87, 34, 0.22)', transform: 'scale(1.1)' } }}>
                  <FaEnvelope color="#FF5722" size={24} />
                </IconButton>
              </Box>
              {shareSuccessMessage && (
                <Box sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CheckIcon fontSize="small" color="success" />
                  <Typography variant="body2" color="success.main">
                    {shareSuccessMessage}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
              <Button
                onClick={handleShareDialogClose}
                variant="outlined"
                sx={{ borderRadius: '8px', borderColor: 'rgba(255,255,255,0.2)', width: '100%', fontWeight: 600, color: '#fff', background: 'rgba(74,125,255,0.08)', '&:hover': { background: 'rgba(74,125,255,0.15)' } }}
              >
                KAPAT
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Ayarlar Diyaloğu */}
          <Dialog
            open={settingsDialogOpen}
            onClose={handleSettingsDialogClose}
            PaperProps={{
              sx: {
                background: 'rgba(30, 32, 68, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: { xs: '95%', sm: '500px' },
                maxWidth: '600px',
                overflow: 'visible', // scroll'u engelle
                maxHeight: 'none'   // yükseklik kısıtlamasını kaldır
              }
            }}
          >
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              pb: 2
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(90deg, #4a7dff, #ff53f0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <SettingsIcon />
                Ayarlar
              </Typography>

              {/* Tab Butonları */}
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
              }}>
                <Button 
                  onClick={() => setActiveSettingsTab(0)}
                  sx={{ 
                    flex: 1, 
                    pb: 1,
                    fontWeight: 600,
                    color: '#4a7dff',
                    borderBottom: '2px solid #4a7dff'
                  }}
                >
                  Lobi Ayarları
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent
                  sx={{ 
                pt: 3,
                pb: 2,
                overflow: 'visible', // scroll'u engelle
                maxHeight: 'none'    // yükseklik kısıtlamasını kaldır
                  }}
                >
              <Box
                  sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  background: 'linear-gradient(135deg, #23244d 0%, #181a2f 100%)',
                  borderRadius: 4,
                  boxShadow: '0 8px 32px 0 rgba(74,125,255,0.10), 0 1.5px 8px 0 #4a7dff30',
                  p: 4,
                  mt: 2,
                  mb: 2,
                  border: '1.5px solid rgba(74,125,255,0.15)',
                  position: 'relative',
                  overflow: 'visible', // scroll'u engelle
                  maxHeight: 'none',  // yükseklik kısıtlamasını kaldır
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 8,
                    background: 'linear-gradient(90deg, #4a7dff 0%, #ff53f0 100%)',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    opacity: 0.7
                    }
                  }}
                >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <GameIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
                    Lobi Ayarları
                  </Typography>
                </Box>

                {/* Lobi Adı */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Lobi Adı
                  </Typography>
                  <TextField
                    fullWidth
                    name="name"
                    value={lobbySettings.name}
                    onChange={handleSettingsChange}
                    variant="outlined"
                    size="medium"
                    placeholder="Lobi adını girin"
                  sx={{ 
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 3,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 18,
                        boxShadow: '0 0 0 2px #4a7dff20',
                        transition: 'box-shadow 0.2s',
                    '&:hover': {
                          boxShadow: '0 0 0 3px #4a7dff60',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 3px #ff53f080',
                          borderColor: '#ff53f0',
                        },
                        '& input': {
                          color: '#fff',
                        },
                        '&::placeholder': {
                          color: '#fff',
                          opacity: 1
                        }
                      }
                    }}
                    inputProps={{ maxLength: 32 }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                    Lobi adınız diğer oyuncular tarafından görülecek.
                  </Typography>
                </Box>

                {/* Maksimum Oyuncu Sayısı */}
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Maksimum Oyuncu Sayısı
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    name="maxPlayers"
                    value={lobbySettings.maxPlayers}
                    onChange={handleSettingsChange}
                    variant="outlined"
                    size="medium"
                  sx={{ 
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 3,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 18,
                        boxShadow: '0 0 0 2px #4a7dff20',
                        transition: 'box-shadow 0.2s',
                    '&:hover': {
                          boxShadow: '0 0 0 3px #4a7dff60',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 0 0 3px #ff53f080',
                          borderColor: '#ff53f0',
                        },
                        '& input': {
                          color: '#fff',
                        },
                        '& .MuiSelect-select': {
                          color: '#fff',
                        }
                      }
                    }}
                  >
                    {[2, 4, 6, 8, 10, 12, 16, 20, 30, 50, 100].map((option) => (
                      <MenuItem key={option} value={option} sx={{ color: '#4a7dff', fontWeight: 600 }}>
                        {option} Oyuncu
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                    Lobiye katılabilecek maksimum oyuncu sayısı.
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 0, display: 'flex', gap: 2 }}>
              <Button 
                onClick={handleSettingsDialogClose}
                variant="outlined" 
                sx={{ 
                  flex: 1,
                  borderRadius: '8px',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={saveSettings}
                variant="contained"
                color="primary" 
                sx={{ 
                  flex: 2,
                  borderRadius: '8px',
                  background: 'linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a8dff 0%, #ff65f0 100%)',
                    boxShadow: '0 5px 15px rgba(74, 125, 255, 0.3)'
                  }
                }}
              >
                Kaydet
              </Button>
            </DialogActions>
          </Dialog>
          
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
                            $isOwner={player.isOwner}
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
                                  <PlayerAvatar 
                                    player={player}
                                    isOwner={player.isOwner}
                                    isReady={player.isReady}
                                    isCurrentUser={player.id === user.id}
                                    isHostViewing={isUserHost(lobby, user.id)}
                                    onKickPlayer={kickPlayer}
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
                                    : player.isOwner
                                      ? <Box component="span" sx={{ 
                                          color: '#FFD700',
                                          fontWeight: 600,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5
                                        }}>
                                          <CelebrationIcon fontSize="small" />
                                          Host
                                        </Box>
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
          
          {/* Kullanıcı atıldığında gösterilecek diyalog */}
          <Dialog
            open={kickedDialogOpen}
            onClose={() => {}}
            PaperProps={{
              sx: {
                background: 'rgba(30, 32, 68, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: { xs: '95%', sm: '500px' },
                maxWidth: '600px',
              }
            }}
          >
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              pb: 2
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#F44336',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <InfoIcon />
                Lobiden Atıldınız
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 3, pb: 2 }}>
              <Box
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  alignItems: 'center'
                }}
              >
                <CloseIcon sx={{ color: '#F44336', fontSize: 80 }} />
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                  Lobi sahibi tarafından lobiden atıldınız. Ana sayfaya yönlendiriliyorsunuz.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
              <Button
                onClick={() => navigate('/home')}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ 
                  borderRadius: '8px',
                  background: 'linear-gradient(45deg, #4a7dff 0%, #ff53f0 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a8dff 0%, #ff65f0 100%)',
                    boxShadow: '0 5px 15px rgba(74, 125, 255, 0.3)'
                  }
                }}
              >
                Ana Sayfaya Dön
              </Button>
            </DialogActions>
          </Dialog>
        </PageContainer>
      </ThemeProvider>
    </MainLayout>
  );
}

export default LobbyPage; 