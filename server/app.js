// Cron job için gerekli modülleri import et
const cron = require('node-cron');
const Lobby = require('./models/Lobby');

// Lobi durumunu kontrol eden cron job (her 5 dakikada bir çalışır)
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Lobi durumu kontrol ediliyor...');
    
    // 1. Normal lobilerin 8 saat sonra otomatik kapanması
    // Not: Bu işlem MongoDB TTL indeksi ile otomatik olarak yapılıyor (Lobby modelinde tanımlandı)
    // Ancak status'ü 'finished' olarak işaretlemek için ek bir kontrol yapıyoruz
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
    await Lobby.updateMany(
      { 
        isEventLobby: false, 
        createdAt: { $lt: eightHoursAgo },
        status: { $ne: 'finished' }
      },
      { 
        $set: { status: 'finished' } 
      }
    );
    
    // 2. Etkinlik lobilerinin bitiş tarihine göre durumunu güncelleme
    const now = new Date();
    
    // Bitiş tarihi geçmiş etkinlik lobilerini 'finished' olarak işaretle
    await Lobby.updateMany(
      { 
        isEventLobby: true, 
        'eventDetails.endDate': { $lt: now },
        status: { $ne: 'finished' }
      },
      { 
        $set: { status: 'finished' } 
      }
    );
    
    // Başlama tarihi gelmiş etkinlik lobilerini 'playing' olarak işaretle
    await Lobby.updateMany(
      { 
        isEventLobby: true, 
        'eventDetails.startDate': { $lt: now },
        'eventDetails.endDate': { $gt: now },
        status: 'waiting'
      },
      { 
        $set: { status: 'playing' } 
      }
    );
    
    console.log('Lobi durumu güncellendi');
  } catch (error) {
    console.error('Lobi durumu güncellenirken hata:', error);
  }
}); 