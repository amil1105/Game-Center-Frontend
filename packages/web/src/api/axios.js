import axios from 'axios';

// API Base URL'yi ortama göre ayarla
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:5000/api';

// Axios instance'ı oluştur
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// İstek gönderilmeden önce çalışacak interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // "Bearer " öneki ile standart Authorization header'ı kullan
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt alındıktan sonra çalışacak interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 (Unauthorized) hatası durumunda kullanıcıyı oturumu yenilemeye yönlendir
    if (error.response && error.response.status === 401) {
      // Token geçersiz veya süresi dolmuş
      console.error('Authorization error:', error.response.data);
      
      // Kullanıcıyı login sayfasına yönlendirebilirsin
      // window.location.href = '/login';
      
      // localStorage'dan token'ı temizle
      localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 