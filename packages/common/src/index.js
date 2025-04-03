import { io } from 'socket.io-client';
import axios from 'axios';
import { EventEmitter } from './utils/eventEmitter';
import { 
  generateTombalaCard, 
  checkWinningCondition, 
  drawNumber,
  initializeSocket,
  generateSeededTombalaCard,
  drawSeededNumber,
  joinGameRoom,
  broadcastGameState,
  broadcastNewNumber
} from './utils/tombalaUtils';
import {
  createInitialGameState,
  updateGameState,
  createDemoPlayers,
  processCards,
  createGameSummary,
  getRandomBotName,
  getBotDelayByDifficulty,
  createBotPlayer,
  processBotPlayers,
  checkBotWinningCondition,
  determineBotClaim
} from './utils/tombalaGame';

// API URL tanımlaması
const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Socket bağlantısı
const socket = io(API_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10, // Daha fazla yeniden bağlanma denemesi
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000, // Maksimum yeniden bağlanma gecikmesi
  timeout: 20000, // Zaman aşımı süresini artır
  transports: ['websocket', 'polling'], // İlk websocket, sonra polling dene
});

// Bağlantı durumu
let connected = false;
let reconnecting = false;
let reconnectAttempts = 0;
let lastConnectionState = null;
let offlineData = {
  gameState: null,
  players: []
};

// Socket bağlantı durumunu yöneten fonksiyon
const isConnected = () => connected;

// Çevrimdışı veri yönetimi
const saveOfflineData = (key, data) => {
  offlineData[key] = data;
  try {
    localStorage.setItem('tombala_offline_data', JSON.stringify(offlineData));
  } catch (error) {
    console.error('Çevrimdışı veri kaydedilemedi:', error);
  }
};

const loadOfflineData = () => {
  try {
    const savedData = localStorage.getItem('tombala_offline_data');
    if (savedData) {
      offlineData = JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Çevrimdışı veri yüklenemedi:', error);
  }
  return offlineData;
};

// Event Emitter oluşturma
const eventEmitter = new EventEmitter();

// Socket olaylarını dinleme ve yönetme
socket.on('connect', () => {
  connected = true;
  reconnecting = false;
  reconnectAttempts = 0;
  lastConnectionState = 'connected';
  eventEmitter.emit('connectionChange', true);
  eventEmitter.emit('connection', { status: 'connected' });
  console.log('Socket.io bağlantısı kuruldu');
});

socket.on('disconnect', (reason) => {
  connected = false;
  lastConnectionState = 'disconnected';
  eventEmitter.emit('connectionChange', false);
  eventEmitter.emit('connection', { status: 'disconnected', reason });
  console.warn(`Socket.io bağlantısı kesildi: ${reason}`);
});

socket.on('reconnect_attempt', (attempt) => {
  reconnecting = true;
  reconnectAttempts = attempt;
  eventEmitter.emit('connection', { status: 'reconnecting', attempt });
  console.log(`Socket.io yeniden bağlanma denemesi: ${attempt}`);
});

socket.on('reconnect', (attemptNumber) => {
  connected = true;
  reconnecting = false;
  lastConnectionState = 'connected';
  eventEmitter.emit('connectionChange', true);
  eventEmitter.emit('connection', { status: 'reconnected', attempt: attemptNumber });
  console.log(`Socket.io yeniden bağlandı. Deneme sayısı: ${attemptNumber}`);
  
  // Yeniden bağlandığında, çevrimdışıyken biriken verileri senkronize et
  syncOfflineData();
});

socket.on('reconnect_error', (error) => {
  reconnecting = true;
  eventEmitter.emit('connection', { status: 'reconnect_error', error });
  console.error('Socket.io yeniden bağlanma hatası:', error);
});

socket.on('reconnect_failed', () => {
  reconnecting = false;
  eventEmitter.emit('connection', { status: 'reconnect_failed' });
  console.error('Socket.io yeniden bağlanma başarısız oldu, maksimum deneme sayısına ulaşıldı');
});

socket.on('error', (error) => {
  eventEmitter.emit('error', error);
  console.error('Socket.io hatası:', error);
});

// Çevrimdışı verileri senkronize etme
const syncOfflineData = async () => {
  if (!connected) return;
  
  const offlineData = loadOfflineData();
  
  // Oyun durumunu senkronize et
  if (offlineData.gameState) {
    try {
      await tombalaService.saveGameStatus(
        offlineData.gameState.id || `game_${Date.now()}`,
        offlineData.gameState
      );
      console.log('Çevrimdışı oyun durumu senkronize edildi');
    } catch (error) {
      console.error('Oyun durumu senkronizasyonu başarısız:', error);
    }
  }
  
  // Diğer çevrimdışı veri senkronizasyonları burada yapılabilir
};

// Player servisi
const playerService = {
  getPlayers: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/players`);
      return response.data;
    } catch (error) {
      console.error('Oyuncular getirilemedi:', error);
      // Çevrimdışı modu etkinleştir
      return { 
        data: offlineData.players || [], 
        success: false, 
        message: 'Oyuncular getirilemedi',
        offline: true
      };
    }
  },
  
  getActivePlayers: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/players/active`);
      // Başarılı yanıtı önbelleğe al
      if (response.data && response.data.data) {
        saveOfflineData('players', response.data.data);
      }
      return response.data;
    } catch (error) {
      console.error('Aktif oyuncular getirilemedi:', error);
      // Hata durumunda önbelleğe alınmış verileri kullan
      const offlineData = loadOfflineData();
      return { 
        data: offlineData.players || [], 
        success: false, 
        message: 'Aktif oyuncular getirilemedi',
        offline: true
      };
    }
  },
  
  updatePlayerStatus: async (playerId, status) => {
    try {
      const response = await axios.put(`${API_URL}/api/players/${playerId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Oyuncu durumu güncellenemedi:', error);
      // Bağlantı hatası durumunda çevrimdışı modda işlemi gerçekleştir
      eventEmitter.emit('playerStatusUpdated', { playerId, status, offline: true });
      return { success: false, offline: true };
    }
  }
};

// Tombala servisi
const tombalaService = {
  getGameState: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tombala/state`);
      // Başarılı yanıtı önbelleğe al
      if (response.data) {
        saveOfflineData('gameState', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Oyun durumu getirilemedi:', error);
      // Çevrimdışı veriyi döndür
      const offlineData = loadOfflineData();
      return offlineData.gameState || createInitialGameState();
    }
  },
  
  claimCinko: async (type, cardId) => {
    try {
      const response = await axios.post(`${API_URL}/api/tombala/claim`, { type, cardId });
      return response.data;
    } catch (error) {
      console.error('Çinko talebi başarısız:', error);
      // Çevrimdışı durumda yerel olarak işle
      eventEmitter.emit('cinkoStatus', { type, cardId, offline: true });
      return { success: false, offline: true };
    }
  },
  
  startNewGame: async () => {
    try {
      const response = await axios.post(`${API_URL}/api/tombala/new-game`);
      return response.data;
    } catch (error) {
      console.error('Yeni oyun başlatılamadı:', error);
      // Çevrimdışı durumda yerel oyun başlat
      const newGameState = createInitialGameState();
      saveOfflineData('gameState', newGameState);
      eventEmitter.emit('gameStarted', { offline: true });
      return { success: true, offline: true, data: newGameState };
    }
  },
  
  getPlayerCards: async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/api/tombala/cards?gameId=${gameId}`);
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Oyuncu kartları getirilemedi:', error);
      // Bağlantı hatası durumunda offline modu etkinleştir
      const newCard = { id: 'player_card', numbers: generateTombalaCard() };
      return { 
        data: [newCard], 
        success: false, 
        offline: true 
      };
    }
  },
  
  saveGameStatus: async (gameId, gameData) => {
    try {
      // Yerel depolama için her zaman oyun durumunu kaydet
      saveOfflineData('gameState', gameData);
      
      // Bağlantı varsa sunucuya gönder
      if (connected) {
        const response = await axios.post(`${API_URL}/api/tombala/status`, { gameId, ...gameData });
        return response.data;
      } else {
        // Bağlantı yoksa sonraki senkronizasyona kadar beklet
        console.log('Oyun durumu çevrimdışı kaydedildi, bağlantı kurulduğunda senkronize edilecek');
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Oyun durumu kaydedilemedi:', error);
      return { success: false, message: 'Oyun durumu kaydedilemedi', offline: true };
    }
  },
  
  saveGameResult: async (gameId, resultData) => {
    try {
      // Yerel depolama için oyun sonucunu kaydet
      saveOfflineData('gameResult', resultData);
      
      // Bağlantı varsa sunucuya gönder
      if (connected) {
        const response = await axios.post(`${API_URL}/api/tombala/result`, { gameId, ...resultData });
        return response.data;
      } else {
        console.log('Oyun sonucu çevrimdışı kaydedildi, bağlantı kurulduğunda senkronize edilecek');
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Oyun sonucu kaydedilemedi:', error);
      return { success: false, message: 'Oyun sonucu kaydedilemedi', offline: true };
    }
  }
};

// Dışa aktarılan modüller
export {
  isConnected,
  eventEmitter,
  playerService,
  tombalaService,
  socket,
  generateTombalaCard,
  checkWinningCondition,
  drawNumber,
  initializeSocket,
  // Yeni tombalaUtils.js fonksiyonları
  generateSeededTombalaCard,
  drawSeededNumber,
  joinGameRoom,
  broadcastGameState,
  broadcastNewNumber,
  // Yeni tombalaGame.js fonksiyonları
  createInitialGameState,
  updateGameState,
  createDemoPlayers,
  processCards,
  createGameSummary,
  getRandomBotName,
  getBotDelayByDifficulty,
  createBotPlayer,
  processBotPlayers,
  checkBotWinningCondition,
  determineBotClaim,
  // Çevrimdışı veri yönetimi fonksiyonları
  saveOfflineData,
  loadOfflineData,
  syncOfflineData
}; 