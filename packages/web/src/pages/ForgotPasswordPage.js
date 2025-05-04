import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaChevronRight } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import { SiBinance } from 'react-icons/si';
import { BsController, BsTrophy, BsPeople, BsArrowLeft } from 'react-icons/bs';
import { FaGoogle } from 'react-icons/fa';
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
  Alert,
  Collapse
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

const BackButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  left: '20px',
  color: 'white',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(-2px)',
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

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Lütfen email adresinizi girin');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Burada gerçek bir API isteği yapılacak, şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Başarı durumunu ayarla
      setSuccess(true);
    } catch (error) {
      setError('İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <Box className="auth-container">
      <BackButton onClick={handleBackToLogin} aria-label="Giriş sayfasına dön">
        <BsArrowLeft size={24} />
      </BackButton>

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
          
          <Typography variant="h4" component="div" className="auth-welcome-text">Şifrenizi mi Unuttunuz?</Typography>
          <Typography variant="body1" component="div" className="auth-subtitle">
            Endişelenmeyin! Email adresinizi girin ve şifrenizi sıfırlamak için gerekli adımları içeren bir bağlantı göndereceğiz.
          </Typography>
          
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
        <Typography variant="h4" component="h1" sx={{ 
          color: 'white', 
          fontWeight: 'bold', 
          mb: 1 
        }}>
          Şifre Sıfırlama
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          mb: 4, 
          maxWidth: '360px' 
        }}>
          Hesabınızla ilişkilendirilmiş email adresinizi girin ve şifre sıfırlama bağlantısı alın.
        </Typography>

        <Collapse in={!!error}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              bgcolor: 'rgba(211, 47, 47, 0.1)', 
              color: '#f48fb1',
              border: '1px solid rgba(211, 47, 47, 0.2)',
              width: '100%',
              maxWidth: '360px'
            }}
          >
            {error}
          </Alert>
        </Collapse>

        <Collapse in={success}>
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2, 
              bgcolor: 'rgba(46, 125, 50, 0.1)', 
              color: '#81c784',
              border: '1px solid rgba(46, 125, 50, 0.2)',
              width: '100%',
              maxWidth: '360px'
            }}
          >
            Şifre sıfırlama bağlantısı email adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
          </Alert>
        </Collapse>

        {!success && (
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
            
            <StyledButton 
              type="submit" 
              disabled={isLoading}
              endIcon={!isLoading && <FaChevronRight />}
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Şifre Sıfırlama Bağlantısı Gönder'
              )}
            </StyledButton>
          </Box>
        )}

        {success && (
          <StyledButton 
            onClick={handleBackToLogin} 
            endIcon={<FaChevronRight />}
            sx={{ width: '100%', maxWidth: '360px', mt: 2 }}
          >
            Giriş Sayfasına Dön
          </StyledButton>
        )}

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

export default ForgotPasswordPage; 