// src/api/auth.js
import axios from 'axios';

// Backend API ve statik dosyaların temel URL'si
export const BACKEND_URL = 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api/auth`;

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const registerUser = async (email, password, username) => {
  const response = await axios.post(`${API_URL}/register`, { email, password, username });
  return response.data;
};

export const getUserProfile = async (token) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateUserSettings = async (settings, token) => {
  const response = await axios.put(`${API_URL}/settings`, settings, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const uploadProfileImage = async (formData, token) => {
  console.log('Sending profile image to server');
  
  try {
    // Dosya içeriğini kontrol et
    const fileContent = formData.get('profileImage');
    if (!fileContent) {
      throw new Error('Dosya bulunamadı');
    }
    
    console.log('Form data file name:', fileContent.name);
    console.log('Form data file type:', fileContent.type);
    console.log('Form data file size:', fileContent.size);
    
    const response = await axios.post(`${API_URL}/upload-profile-image`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        // Content-Type header'ı multipart/form-data için otomatik olarak axios tarafından ayarlanacak
        // Bu şekilde manuel olarak ayarlamak hata oluşturabilir
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
      // Timeout süresini uzat
      timeout: 30000 // 30 saniye
    });
    
    console.log('Server response:', response.data);
    
    if (!response.data || !response.data.profileImage) {
      throw new Error('Sunucudan geçersiz yanıt alındı');
    }
    
    return response.data;
  } catch (error) {
    console.error('Upload profile image error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      // İstek yapıldı ancak yanıt alınamadı
      console.error('Error request:', error.request);
      throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    }
    throw error;
  }
};
