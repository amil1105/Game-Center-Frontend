// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Divider, 
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

  // UserContext'i React.useContext ile kullanmak yerine doğrudan değişkene atayalım
  const userContext = React.useContext(UserContext);
  const login = userContext ? userContext.login : () => {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      try {
        setIsLoading(true);
        const data = await loginUser(email, password);
        localStorage.setItem('token', data.token);
        login(data.user);
        navigate('/home');
      } catch (error) {
        alert(error.response?.data?.message || 'Giriş başarısız');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div 
        className="auth-left-side" 
        style={{ 
          backgroundImage: `url('https://cdn.dribbble.com/userupload/16528532/file/original-d7f5a5167a2bf86f6710665cf6d8b72b.png?resize=752x&vertical=center')` 
        }}
      >
        <div className="auth-game-decoration">
          <BsController />
        </div>
        <div className="auth-game-decoration">
          <BsTrophy />
        </div>
        <div className="auth-game-decoration">
          <BsPeople />
        </div>
        
        <div className="auth-content-wrapper">
          <div className="auth-logo">Game Center</div>
          <div className="auth-bonus">
            <h2>HOŞ GELDİN BONUSU</h2>
            <p>Hemen üye ol ve 1000 jeton kazan!</p>
          </div>
          
          <div className="auth-welcome-text">Oyun Zamanı!</div>
          <div className="auth-subtitle">Hesabınıza giriş yaparak eğlenceli oyunları keşfedin ve arkadaşlarınızla yarışın.</div>
          
          <div className="auth-features-list">
            <div className="auth-feature-item">
              {React.createElement(BsController, { size: 20 })}
              <span>30+ Çevrimiçi oyun</span>
            </div>
            <div className="auth-feature-item">
              {React.createElement(BsTrophy, { size: 20 })}
              <span>Haftalık turnuvalar ve ödüller</span>
            </div>
            <div className="auth-feature-item">
              {React.createElement(BsPeople, { size: 20 })}
              <span>Arkadaşlarınızla çoklu oyuncu modları</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-right-side">
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
      </div>
    </div>
  );
}

export default LoginPage;

