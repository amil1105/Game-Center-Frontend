import React, { useState, useEffect, useRef, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaUser, FaGlobe, FaBell, FaPalette, FaImage, FaUpload, FaCamera, FaArrowLeft } from 'react-icons/fa';
import { getUserProfile, updateUserSettings, uploadProfileImage, BACKEND_URL } from '../api/auth';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Avatar, 
  Select as MuiSelect, 
  MenuItem, 
  FormControl, 
  FormControlLabel, 
  Switch as MuiSwitch
} from '@mui/material';

// Animasyonlar
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shine = keyframes`
  0% {
    background-position: -100px;
  }
  40%, 100% {
    background-position: 140px;
  }
`;

const SettingsContainer = styled(Box)`
  padding: 40px;
  color: white;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled(Box)`
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const BackButton = styled(Button)`
  background: rgba(74, 125, 255, 0.1);
  border: none;
  color: #4a7dff;
  font-size: 20px;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    background: rgba(74, 125, 255, 0.2);
    transform: translateX(-5px);
  }
`;

const SettingsGrid = styled(Box)`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsNav = styled(Box)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 15px;
  padding: 20px;
  height: fit-content;
`;

const NavItem = styled(Box)`
  padding: 15px;
  margin: 5px 0;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  background: ${props => props.$active ? 'linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%)' : 'transparent'};
  transform: translateX(${props => props.$active ? '5px' : '0'});
  box-shadow: ${props => props.$active ? '0 5px 15px rgba(74, 125, 255, 0.2)' : 'none'};

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%)' : 'rgba(74, 125, 255, 0.1)'};
    transform: translateX(5px);
  }

  svg {
    font-size: 1.2rem;
    color: ${props => props.$active ? 'white' : '#4a7dff'};
  }
`;

const SettingsContent = styled(Box)`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4a7dff 0%, #ff53f0 100%);
  }
`;

const FormGroup = styled(Box)`
  margin-bottom: 25px;
`;

const StyledTextField = styled(TextField)`
  width: 100%;

  & .MuiInputBase-root {
    background: rgba(26, 27, 38, 0.5);
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s;
  }

  & .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.1);
  }

  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #4a7dff;
    box-shadow: 0 0 0 3px rgba(74, 125, 255, 0.1);
  }
  
  & .MuiInputLabel-root {
    color: #6c7293;
  }
  
  & .MuiInputLabel-root.Mui-focused {
    color: #4a7dff;
  }
`;

const StyledSelect = styled(MuiSelect)`
  width: 100%;
  background: rgba(26, 27, 38, 0.5);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
  
  & .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #4a7dff;
    box-shadow: 0 0 0 3px rgba(74, 125, 255, 0.1);
  }
  
  & .MuiSelect-icon {
    color: white;
  }
`;

const Switch = styled(MuiSwitch)`
  & .MuiSwitch-switchBase {
    color: white;
  }

  & .MuiSwitch-switchBase.Mui-checked {
    color: #4a7dff;
  }

  & .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track {
    background-color: #4a7dff;
  }

  & .MuiSwitch-track {
    background-color: #2a2c4e;
  }
`;

const SaveButton = styled(Button)`
  background: linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
  position: relative;
  overflow: hidden;

  &:hover {
    background-image: linear-gradient(145deg, #5a8dff 0%, #7a6aff 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(74, 125, 255, 0.3);
  }

  &:disabled {
    background: #2a2c4e;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::before {
    transform: translateX(100%);
  }
`;

const ImagePreview = styled(Box)`
  width: 150px;
  height: 150px;
  border-radius: 75px;
  background: #1a1b38;
  margin-bottom: 15px;
  overflow: hidden;
  position: relative;
  border: 4px solid #2a2c4e;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  animation: ${pulse} 3s infinite;

  & .MuiAvatar-root {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: #4a7dff;

    & .MuiAvatar-root {
      transform: scale(1.05);
    }

    .upload-overlay {
      opacity: 1;
    }
  }
`;

const UploadOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  border-radius: 50%;
`;

const UploadIcon = styled(Box)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #4a7dff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const FileInput = styled('input')`
  display: none;
`;

const UploadButton = styled(Button)`
  background-color: transparent;
  color: #4a7dff;
  border: 1px solid #4a7dff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;

  &:hover {
    background-color: rgba(74, 125, 255, 0.1);
  }

  & svg {
    font-size: 1rem;
  }
`;

const ImageUploadProgress = styled(Box)`
  width: 100%;
  height: 6px;
  background: #2a2c4e;
  border-radius: 3px;
  margin-top: 10px;
  margin-bottom: 15px;
  overflow: hidden;
  display: ${props => props.$uploading ? 'block' : 'none'};

  &::before {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$progress}%;
    background: #4a7dff;
    transition: width 0.3s ease;
  }
`;

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    profileImage: '',
    language: 'tr',
    theme: 'dark',
    notifications: {
      email: true,
      push: true
    }
  });
  
  const fileInputRef = useRef(null);
  const { updateUserData, user: contextUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Current user in context:', contextUser);
  }, [contextUser]);

  // URL parametrelerinden sekme değerini kontrol et
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile', 'language', 'notifications', 'theme'].includes(tabParam)) {
      setActiveTab(tabParam);
      console.log('Tab set from URL parameter:', tabParam);
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        console.log('Fetching user data for settings page...');
        const userData = await getUserProfile(token);
        console.log('User data received in settings:', userData);
        
        // _id'yi id olarak da ekle
        const userWithId = {
          ...userData,
          id: userData._id || userData.id // id yoksa _id kullan, o da yoksa null olacak
        };
        
        setUser(userWithId);
        
        // Daha sonra erişim için userData'yı localStorage'a kaydet
        localStorage.setItem('userData', JSON.stringify(userWithId));
        setLoading(false);  // Loading durumunu güncelle
        
        // Profil resmi yolunu düzeltme (zaten BACKEND_URL içerip içermediğini kontrol et)
        let profileImageUrl = userData.profileImage || '';
        if (profileImageUrl && !profileImageUrl.includes('http')) {
          profileImageUrl = combineUrls(BACKEND_URL, profileImageUrl);
          console.log('Updated profile image URL with backend URL:', profileImageUrl);
        }
        
        setFormData({
          username: userData.username || '',
          profileImage: profileImageUrl,
          language: userData.language || 'tr',
          theme: userData.theme || 'dark',
          notifications: userData.notifications || {
            email: true,
            push: true
          }
        });
        
        console.log('Form data set with profile image:', profileImageUrl);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        toast.error('Kullanıcı bilgileri alınamadı');
      }
    };

    fetchUser();
  }, []);

  // Profil resmini izleyen bir effect ekleyelim
  useEffect(() => {
    if (formData.profileImage) {
      console.log('Current profile image in form data:', formData.profileImage);
      
      // Önbellek sorunlarını gidermek için resmi önceden yükle
      const img = new Image();
      img.src = formData.profileImage;
      img.onload = () => console.log('Profile image preloaded in settings page:', formData.profileImage);
      img.onerror = (err) => console.error('Failed to preload image in settings:', err);
    }
  }, [formData.profileImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (type) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleProfileImageClick = () => {
    console.log('Profile image click button clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('File input triggered');
    } else {
      console.error('File input reference is not available');
    }
  };

  // URL'leri birleştirmek için yardımcı fonksiyon
  const combineUrls = (baseUrl, relativePath) => {
    if (!relativePath) return baseUrl;
    
    if (relativePath.startsWith('/')) {
      return baseUrl.endsWith('/') 
        ? `${baseUrl.slice(0, -1)}${relativePath}`
        : `${baseUrl}${relativePath}`;
    } else {
      return baseUrl.endsWith('/')
        ? `${baseUrl}${relativePath}`
        : `${baseUrl}/${relativePath}`;
    }
  };

  const handleFileChange = async (e) => {
    console.log('File input changed', e);
    
    if (!e.target.files || e.target.files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    const file = e.target.files[0];
    console.log('Selected file:', file.name, file.type, file.size);
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'tan küçük olmalıdır');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Sadece .jpg, .jpeg, .png ve .gif dosyaları yüklenebilir');
      return;
    }

    // Kullanıcıya görsel geri bildirim
    toast.loading('Profil resmi yükleniyor...', { id: 'upload-toast' });
    
    setUploading(true);
    setUploadProgress(0);

    // Dosyayı FormData olarak hazırla
    const formData = new FormData();
    formData.append('profileImage', file);
    
    console.log('FormData created with file');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        setUploading(false);
        return;
      }

      // Animasyon için yapay ilerleme
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      console.log('Uploading file to server...', token.substring(0, 10) + '...');
      
      try {
        const response = await uploadProfileImage(formData, token);
        console.log('Upload response:', response);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        toast.dismiss('upload-toast');
        
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 500);

        // Cache busting için timestamp ekleyelim
        const timestamp = new Date().getTime();
        
        // Backend'den gelen göreceli URL'yi tam URL'ye dönüştür
        const profileImagePath = response.profileImage;
        // URL'leri düzgün bir şekilde birleştir
        const baseUrl = combineUrls(BACKEND_URL, profileImagePath);
        const fullProfileImageUrl = `${baseUrl}?t=${timestamp}`;
        
        console.log('Full profile image URL:', fullProfileImageUrl);

        // Profil resmini ve kullanıcı state'ini güncelle
        setFormData(prev => ({
          ...prev,
          profileImage: fullProfileImageUrl
        }));
        
        setUser(prev => ({
          ...prev,
          profileImage: fullProfileImageUrl
        }));

        // UserContext'i tamamen güncelleyerek bütün uygulamadaki avatar görüntülerinin güncellenmesini sağla
        const updatedUserData = {
          ...contextUser,
          profileImage: fullProfileImageUrl
        };
        console.log('Updating user context with new data:', updatedUserData);
        updateUserData(updatedUserData);
        
        // Görüntü başarıyla yüklendiğinde bildirim ver
        toast.success('Profil resmi başarıyla güncellendi');
        
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        clearInterval(progressInterval);
        setUploading(false);
        setUploadProgress(0);
        toast.dismiss('upload-toast');
        toast.error('Profil resmi yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Profil resmi yüklenirken hata:', error);
      console.error('Detaylı hata:', error.response?.data);
      setUploading(false);
      toast.dismiss('upload-toast');
      toast.error(error.response?.data?.error || 'Profil resmi yüklenirken bir hata oluştu');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum açmanız gerekiyor');
        return;
      }

      const updatedUser = await updateUserSettings(formData, token);

      setUser(updatedUser);
      
      // UserContext'i tamamen güncelleyerek bütün uygulamadaki kullanıcı bilgilerinin güncellenmesini sağla
      const updatedUserData = {
        ...contextUser,
        ...updatedUser
      };
      console.log('Updating user context with new data after settings update:', updatedUserData);
      updateUserData(updatedUserData);
      
      toast.success('Ayarlar başarıyla güncellendi');
    } catch (error) {
      console.error('Ayarlar güncellenirken hata:', error);
      toast.error('Ayarlar güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <Typography variant="h2" sx={{ marginBottom: 2 }}>Profil Ayarları</Typography>
            <FormGroup>
              <Typography variant="body2" component="label" sx={{ display: 'block', marginBottom: 1, color: '#6c7293' }}>
                Profil Resmi
              </Typography>
              <ImagePreview>
                <Avatar 
                  className="profile-image"
                  src={formData.profileImage || `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + (formData.username ? formData.username.charAt(0).toUpperCase() : 'U') + '</text></svg>')}`} 
                  alt="Profil" 
                  sx={{ width: '100%', height: '100%' }}
                  onLoad={() => console.log('Settings page profile image loaded successfully:', formData.profileImage)}
                  onError={(e) => {
                    console.log('Error loading image in settings page:', e.target.src);
                    e.target.onerror = null;
                    const initial = formData.username ? formData.username.charAt(0).toUpperCase() : 'U';
                    e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + initial + '</text></svg>')}`;
                  }}
                />
                <UploadOverlay className="upload-overlay" onClick={handleProfileImageClick}>
                  <UploadIcon>
                    <FaCamera />
                  </UploadIcon>
                </UploadOverlay>
              </ImagePreview>
              
              <FileInput 
                type="file" 
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif" 
                onChange={handleFileChange}
              />
              
              <UploadButton variant="outlined" onClick={handleProfileImageClick} startIcon={<FaUpload />}>
                Profil Resmi Yükle
              </UploadButton>
              
              <ImageUploadProgress $uploading={uploading} $progress={uploadProgress} />
            </FormGroup>
            <FormGroup>
              <Typography variant="body2" component="label" sx={{ display: 'block', marginBottom: 1, color: '#6c7293' }}>
                Kullanıcı Adı
              </Typography>
              <StyledTextField
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
              />
            </FormGroup>
          </>
        );

      case 'language':
        return (
          <>
            <Typography variant="h2" sx={{ marginBottom: 2 }}>Dil ve Bölge</Typography>
            <FormGroup>
              <Typography variant="body2" component="label" sx={{ display: 'block', marginBottom: 1, color: '#6c7293' }}>
                Dil
              </Typography>
              <FormControl fullWidth>
                <StyledSelect
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  variant="outlined"
                >
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </StyledSelect>
              </FormControl>
            </FormGroup>
          </>
        );

      case 'notifications':
        return (
          <>
            <Typography variant="h2" sx={{ marginBottom: 2 }}>Bildirim Ayarları</Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#6c7293' }}>
                    E-posta Bildirimleri
                  </Typography>
                }
              />
            </FormGroup>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#6c7293' }}>
                    Push Bildirimleri
                  </Typography>
                }
              />
            </FormGroup>
          </>
        );

      case 'theme':
        return (
          <>
            <Typography variant="h2" sx={{ marginBottom: 2 }}>Görünüm Ayarları</Typography>
            <FormGroup>
              <Typography variant="body2" component="label" sx={{ display: 'block', marginBottom: 1, color: '#6c7293' }}>
                Tema
              </Typography>
              <FormControl fullWidth>
                <StyledSelect
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  variant="outlined"
                >
                  <MenuItem value="dark">Koyu Tema</MenuItem>
                  <MenuItem value="light">Açık Tema</MenuItem>
                </StyledSelect>
              </FormControl>
            </FormGroup>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <SettingsContainer>
        <SettingsGrid>
          <SettingsNav>
            <NavItem 
              $active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
            >
              <FaUser /> Profil
            </NavItem>
            <NavItem 
              $active={activeTab === 'language'} 
              onClick={() => setActiveTab('language')}
            >
              <FaGlobe /> Dil ve Bölge
            </NavItem>
            <NavItem 
              $active={activeTab === 'notifications'} 
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell /> Bildirimler
            </NavItem>
            <NavItem 
              $active={activeTab === 'theme'} 
              onClick={() => setActiveTab('theme')}
            >
              <FaPalette /> Görünüm
            </NavItem>
          </SettingsNav>

          <SettingsContent>
            <Box component="form" onSubmit={handleSubmit}>
              {renderContent()}
              <SaveButton type="submit" disabled={loading} variant="contained">
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </SaveButton>
            </Box>
          </SettingsContent>
        </SettingsGrid>
      </SettingsContainer>
    </MainLayout>
  );
}

export default SettingsPage; 