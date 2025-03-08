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
    console.log('Form data file name:', fileContent.name);
    console.log('Form data file type:', fileContent.type);
    console.log('Form data file size:', fileContent.size);
    
    const response = await axios.post(`${API_URL}/upload-profile-image`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload profile image error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};
