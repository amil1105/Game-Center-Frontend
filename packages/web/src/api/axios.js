import axios from 'axios';

// API Base URL'yi ortama göre ayarla
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:5000';  // /api ön ekini kaldırdık

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
    
    // URL'de "/api/api/" gibi çift api önekinin olmaması için kontrol ekleyelim
    if (config.url && config.url.startsWith('/api/') && config.baseURL.endsWith('/api')) {
      // baseURL zaten /api ile bitiyorsa, url'deki /api/ önekini kaldır
      config.url = config.url.substring(4);
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
    
    // Bağlantı hatası oluştuğunda otomatik yeniden deneme ekleyelim
    const originalRequest = error.config;
    
    // Eğer bağlantı reddedildi hatası varsa ve daha önce yeniden denenmemişse tekrar dene
    if (error.code === 'ERR_NETWORK' && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Bağlantı hatası, istek yeniden deneniyor...');
      
      // 2 saniye bekleyip tekrar dene
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(axiosInstance(originalRequest));
        }, 2000);
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 