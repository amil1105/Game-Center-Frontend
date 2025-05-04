// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash, FaChevronRight } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { BsController, BsTrophy, BsPeople } from 'react-icons/bs';
import { registerUser } from '../api/auth';
import '../styles/Auth.css';

// Material UI imports
import { 
  TextField, 
  Button, 
  IconButton, 
  InputAdornment, 
  Typography,
  Box,
  CircularProgress,
  Checkbox,
  FormControlLabel
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

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.5)',
  '&.Mui-checked': {
    color: '#7C4DFF',
  },
}));

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }
    
    if (!accepted) {
      alert('Lütfen kullanım koşullarını kabul edin ve 18 yaşından büyük olduğunuzu onaylayın.');
      return;
    }

    if (username && email && password) {
      try {
        setIsLoading(true);
        await registerUser(email, password, username);
        navigate('/login');
      } catch (error) {
        alert(error.response?.data?.message || 'Kayıt işlemi başarısız');
      } finally {
        setIsLoading(false);
      }
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
          {React.createElement(BsController)}
        </Box>
        <Box className="auth-game-decoration">
          {React.createElement(BsTrophy)}
        </Box>
        <Box className="auth-game-decoration">
          {React.createElement(BsPeople)}
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
          
          <Typography variant="h4" component="div" className="auth-welcome-text">Maceraya Katıl!</Typography>
          <Typography variant="body1" component="div" className="auth-subtitle">Ücretsiz kayıt olarak eğlenceli oyunlara hemen başlayın.</Typography>
          
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
            placeholder="Kullanıcı adınız"
            variant="outlined"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            hiddenLabel
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaUser />
                </InputAdornment>
              ),
            }}
          />
          
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
          
          <StyledTextField
            fullWidth
            margin="normal"
            placeholder="Şifrenizi tekrar girin"
            variant="outlined"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <FormControlLabel
            control={
              <StyledCheckbox 
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                name="terms"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Kullanım koşullarını kabul ediyorum ve 18 yaşından büyüğüm
              </Typography>
            }
            sx={{ mt: 2, mb: 2 }}
          />
          
          <StyledButton 
            type="submit" 
            disabled={isLoading}
            endIcon={!isLoading && <FaChevronRight />}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Kayıt Ol'
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
            veya bu yöntemlerle kayıt ol
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
          Hesabınız var mı?
          <Link to="/login" style={{ 
            color: '#7C4DFF', 
            marginLeft: '5px',
            textDecoration: 'none',
            fontWeight: 'bold',
            position: 'relative'
          }}>
            Giriş Yap
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default RegisterPage;

