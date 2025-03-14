import React, { useState, useEffect, useRef, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaUser, FaGlobe, FaBell, FaPalette, FaImage, FaUpload, FaCamera, FaArrowLeft } from 'react-icons/fa';
import { getUserProfile, updateUserSettings, uploadProfileImage, BACKEND_URL } from '../api/auth';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';

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

const SettingsContainer = styled.div`
  padding: 40px;
  color: white;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  p {
    color: #6c7293;
  }
`;

const BackButton = styled.button`
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

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsNav = styled.div`
  background: linear-gradient(145deg, #1e2044 0%, #171934 100%);
  border-radius: 15px;
  padding: 20px;
  height: fit-content;
`;

const NavItem = styled.div`
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

const SettingsContent = styled.div`
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

const FormGroup = styled.div`
  margin-bottom: 25px;

  label {
    display: block;
    margin-bottom: 8px;
    color: #6c7293;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(26, 27, 38, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #4a7dff;
    background: rgba(74, 125, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(74, 125, 255, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  background: rgba(26, 27, 38, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4a7dff;
    background: rgba(74, 125, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(74, 125, 255, 0.1);
  }

  option {
    background: #1a1b38;
    color: white;
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #2a2c4e;
    transition: .4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: #4a7dff;
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(145deg, #4a7dff 0%, #6a5aff 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
  position: relative;
  overflow: hidden;

  &:hover {
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

const ImagePreview = styled.div`
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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: #4a7dff;

    img {
      transform: scale(1.05);
    }

    .upload-overlay {
      opacity: 1;
    }
  }
`;

const UploadOverlay = styled.div`
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

const UploadIcon = styled.div`
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

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
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

  svg {
    font-size: 1rem;
  }
`;

const ImageUploadProgress = styled.div`
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
  const { updateUserData } = useContext(UserContext);
  const navigate = useNavigate();

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
        
        setUser(userData);
        
        // Profil resmi yolunu düzeltme (zaten BACKEND_URL içerip içermediğini kontrol et)
        let profileImageUrl = userData.profileImage || '';
        if (profileImageUrl && !profileImageUrl.includes('http')) {
          profileImageUrl = `${BACKEND_URL}${profileImageUrl}`;
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
        const fullProfileImageUrl = `${BACKEND_URL}${profileImagePath}?t=${timestamp}`;
        
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

        // UserContext'i güncelle
        updateUserData({ profileImage: fullProfileImageUrl });

        // Tarayıcı önbelleğini temizlemek için görüntüyü önceden yükle
        const preloadImage = new Image();
        preloadImage.src = fullProfileImageUrl;
        preloadImage.onload = () => {
          console.log('Image preloaded successfully');
          
          // Görüntü başarıyla yüklendiğinde önbelleği temizle ve gerekirse sayfayı yenile
          toast.success('Profil resmi başarıyla güncellendi');
          
          // Sayfayı yenile yerine doğrudan DOM'u güncelle
          const profileImages = document.querySelectorAll('.profile-image');
          profileImages.forEach(img => {
            img.src = fullProfileImageUrl;
          });
        };
        
        preloadImage.onerror = (err) => {
          console.error('Error preloading image:', err);
          toast.error('Profil resmi yüklenirken bir sorun oluştu');
        };
        
        // Test için: Resmi göstermeye çalış
        console.log('Try to open image at:', fullProfileImageUrl);
        
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
      
      // UserContext'i güncelle
      updateUserData(updatedUser);
      
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
            <h2>Profil Ayarları</h2>
            <FormGroup>
              <label>Profil Resmi</label>
              <ImagePreview>
                <img 
                  className="profile-image"
                  src={formData.profileImage || `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150"><rect width="100" height="100" fill="#2a2c4e"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" fill="white">' + (formData.username ? formData.username.charAt(0).toUpperCase() : 'U') + '</text></svg>')}`} 
                  alt="Profil" 
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
              
              <UploadButton type="button" onClick={handleProfileImageClick}>
                <FaUpload /> Profil Resmi Yükle
              </UploadButton>
              
              <ImageUploadProgress $uploading={uploading} $progress={uploadProgress} />
            </FormGroup>
            <FormGroup>
              <label>Kullanıcı Adı</label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </FormGroup>
          </>
        );

      case 'language':
        return (
          <>
            <h2>Dil ve Bölge</h2>
            <FormGroup>
              <label>Dil</label>
              <Select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </Select>
            </FormGroup>
          </>
        );

      case 'notifications':
        return (
          <>
            <h2>Bildirim Ayarları</h2>
            <FormGroup>
              <label>E-posta Bildirimleri</label>
              <Switch>
                <input
                  type="checkbox"
                  checked={formData.notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                <span></span>
              </Switch>
            </FormGroup>
            <FormGroup>
              <label>Push Bildirimleri</label>
              <Switch>
                <input
                  type="checkbox"
                  checked={formData.notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
                <span></span>
              </Switch>
            </FormGroup>
          </>
        );

      case 'theme':
        return (
          <>
            <h2>Görünüm Ayarları</h2>
            <FormGroup>
              <label>Tema</label>
              <Select
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
              >
                <option value="dark">Koyu Tema</option>
                <option value="light">Açık Tema</option>
              </Select>
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
            <form onSubmit={handleSubmit}>
              {renderContent()}
              <SaveButton type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </SaveButton>
            </form>
          </SettingsContent>
        </SettingsGrid>
      </SettingsContainer>
    </MainLayout>
  );
}

export default SettingsPage; 