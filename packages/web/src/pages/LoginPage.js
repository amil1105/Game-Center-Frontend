// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash, FaChevronRight } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { BsController, BsTrophy, BsPeople } from 'react-icons/bs';
import { UserContext } from '../context/UserContext';
import { loginUser } from '../api/auth';
import '../styles/Auth.css';

// Material UI imports
import { 
  TextField, 
  Button, 
  IconButton, 
  InputAdornment,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: '56px',
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#7C4DFF',
      boxShadow: '0 0 20px rgba(124, 77, 255, 0.2)',
    },
    '& input': {
      padding: '16px 14px',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.7)',
        opacity: 1,
      },
    },
    '& .MuiInputAdornment-root': {
      marginLeft: '12px',
      marginRight: '12px',
      color: 'rgba(255, 255, 255, 0.5)',
    },
  },
  '& legend': { 
    display: 'none' 
  },
  '& fieldset': { 
    top: 0 
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  width: '100%',
  height: '60px',
  borderRadius: '16px',
  background: 'linear-gradient(45deg, #7C4DFF 0%, #ff53f0 100%)',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 'bold',
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: '0 10px 20px rgba(124, 77, 255, 0.3)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 30px rgba(124, 77, 255, 0.4)',
  },
  '&:active': {
    transform: 'translateY(1px)',
  },
  '&.Mui-disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.4)',
  },
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  margin: '0 10px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-3px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
  },
}));

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // UserContext'i React.useContext ile kullanmak yerine doğrudan değişkene atayalım
  const userContext = React.useContext(UserContext);
  const { login, user, checkAuth } = userContext || {};

  // Sayfa yüklendiğinde oturum durumunu kontrol et
  useEffect(() => {
    const checkAuthStatus = async () => {
      // LocalStorage'dan token'ı kontrol et
      const token = localStorage.getItem('token');
      
      // Token varsa ve kullanıcı oturumda ise ana sayfaya yönlendir
      if (token && user) {
        console.log("LoginPage: Kullanıcı zaten giriş yapmış, ana sayfaya yönlendiriliyor");
        navigate('/home');
        return;
      }
      
      // Token var ama kullanıcı bilgisi yoksa checkAuth ile token doğrulama yap
      if (token && !user) {
        try {
          console.log("LoginPage: Token var, checkAuth ile doğrulanıyor");
          const isAuthenticated = await checkAuth();
          
          if (isAuthenticated) {
            console.log("LoginPage: Token doğrulandı, ana sayfaya yönlendiriliyor");
            navigate('/home');
          }
        } catch (error) {
          console.error("LoginPage: Token doğrulama hatası:", error);
          // Token geçersizse localStorage'dan temizle
          localStorage.removeItem('token');
        }
      }
    };
    
    checkAuthStatus();
  }, [navigate, user, checkAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      try {
        setIsLoading(true);
        console.log("LoginPage: Giriş yapılıyor...", email);
        
        const data = await loginUser(email, password);
        console.log("LoginPage: Giriş başarılı, token alındı, bilgiler:", data);
        
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        
        // Kullanıcı bilgilerini ayarla
        login(data.user);
        
        // Yönlendirilecek URL'yi belirle
        let redirectPath = '/home';
        let lobbyCode = null;
        
        // Eğer state varsa ve from bilgisi içeriyorsa, o sayfaya yönlendir
        if (location.state) {
          if (location.state.from) {
            redirectPath = location.state.from;
            console.log("LoginPage: Kullanıcı şu sayfadan yönlendirildi:", location.state.from);
          }
          
          // Eğer lobbyCode bilgisi varsa, bunu kaydet
          if (location.state.lobbyCode) {
            lobbyCode = location.state.lobbyCode;
            console.log("LoginPage: Lobi kodu bilgisi bulundu:", lobbyCode);
            
            // localStorage'a da kaydet (geçici)
            try {
              localStorage.setItem('tombala_lobbyId', lobbyCode);
              localStorage.setItem('tombala_lobbyTimestamp', Date.now());
            } catch (e) {
              console.warn("LoginPage: localStorage hatası:", e);
            }
          }
        }
        
        console.log("LoginPage: Giriş başarılı, yönlendiriliyor:", redirectPath);
        
        // Küçük bir gecikmeyle yönlendir (token ve login işlemlerinin tamamlanması için)
        setTimeout(() => {
          navigate(redirectPath);
        }, 300);
      } catch (error) {
        console.error("LoginPage: Giriş hatası:", error);
        let errorMessage = 'Giriş başarısız';
        
        if (error.response) {
          errorMessage = error.response.data?.message || errorMessage;
          console.error("LoginPage: Sunucu hatası:", error.response.data);
        }
        
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Lütfen email ve şifre alanlarını doldurun');
    }
  };

  return (
    <Box className="auth-container">
      <Box 
        className="auth-left-side" 
        style={{ 
          backgroundImage: `url('https://cdn.dribbble.com/userupload/16528532/file/original-d7f5a5167a2bf86f6710665cf6d8b72b.png?resize=752x&vertical=center')` 
        }}
      >
        <Box className="auth-game-decoration">
          <BsController />
        </Box>
        <Box className="auth-game-decoration">
          <BsTrophy />
        </Box>
        <Box className="auth-game-decoration">
          <BsPeople />
        </Box>
        
        <Box className="auth-content-wrapper">
          <Typography 
            variant="h6" 
            component="div" 
            className="auth-logo"
            sx={{
              background: 'linear-gradient(45deg, #7C4DFF, #5f52e8)',
              color: 'transparent',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              fontWeight: 700,
              fontSize: '2.5rem',
              filter: 'drop-shadow(0 0 10px rgba(124, 77, 255, 0.5))',
              letterSpacing: '0.5px',
              mb: 3
            }}
          >
            Game Center
          </Typography>
          <Box className="auth-bonus">
            <Typography variant="h2" component="h2">OYUN MERKEZİ PLATFORMU</Typography>
            <Typography variant="body1" component="p">Gerçek zamanlı çok oyunculu oyunların keyfini çıkarın!</Typography>
          </Box>
          
          <Typography variant="h4" component="div" className="auth-welcome-text">Oyun Zamanı!</Typography>
          <Typography variant="body1" component="div" className="auth-subtitle">Hesabınıza giriş yaparak eğlenceli oyunları keşfedin ve arkadaşlarınızla yarışın.</Typography>
          
          <Box className="auth-features-list">
            <Box className="auth-feature-item">
              {React.createElement(BsController, { size: 20 })}
              <Typography variant="span" component="span">Tombala, Okey ve Daha Fazlası</Typography>
            </Box>
            <Box className="auth-feature-item">
              {React.createElement(BsTrophy, { size: 20 })}
              <Typography variant="span" component="span">Gerçek Zamanlı Turnuvalar</Typography>
            </Box>
            <Box className="auth-feature-item">
              {React.createElement(BsPeople, { size: 20 })}
              <Typography variant="span" component="span">Arkadaşlarınızla Oynayın</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Box className="auth-right-side">
        <Box component="form" className="auth-form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: '360px' }}>
          <StyledTextField
            fullWidth
            margin="normal"
            placeholder="Email adresiniz"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            hiddenLabel
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaEnvelope />
                </InputAdornment>
              ),
            }}
          />
          
          <StyledTextField
            fullWidth
            margin="normal"
            placeholder="Şifreniz"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            hiddenLabel
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaLock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Box className="auth-forgot-password" sx={{ alignSelf: 'flex-end', mt: 1, mb: 2 }}>
            <Link to="/forgot-password">Şifremi Unuttum</Link>
          </Box>
          
          <StyledButton 
            type="submit" 
            disabled={isLoading}
            endIcon={!isLoading && <FaChevronRight />}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Giriş Yap'
            )}
          </StyledButton>
        </Box>

        <Box className="auth-divider" sx={{ width: '100%', maxWidth: '360px', my: 3, position: 'relative' }}>
          <Typography variant="body2" sx={{ 
            bgcolor: '#0d0e20', 
            px: 2, 
            color: 'rgba(255, 255, 255, 0.6)',
            position: 'relative',
            zIndex: 1
          }}>
            veya bu yöntemlerle giriş yap
          </Typography>
        </Box>

        <Box className="auth-social-buttons" sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <SocialButton>
            <FaGoogle />
          </SocialButton>
          <SocialButton>
            <FaTelegramPlane />
          </SocialButton>
          <SocialButton>
            <SiBinance />
          </SocialButton>
        </Box>

        <Typography className="auth-bottom-text" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Hesabınız yok mu?
          <Link to="/register" style={{ 
            color: '#7C4DFF', 
            marginLeft: '5px',
            textDecoration: 'none',
            fontWeight: 'bold',
            position: 'relative'
          }}>
            Kayıt Ol
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default LoginPage;

