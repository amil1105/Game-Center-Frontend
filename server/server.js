// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// CORS yapılandırması - tüm kaynaklardan gelen isteklere izin ver
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json());

// Statik dosyaları sunmak için - yetkilendirme olmadan erişilebilir
console.log('Statik dosya dizini:', path.join(__dirname, '../public'));
app.use('/img', express.static(path.join(__dirname, '../public/img')));

// Özellikle uploads klasörünü statik olarak herkese açık yap
const uploadsPath = path.join(__dirname, '../public/img/uploads');
app.use('/img/uploads', express.static(uploadsPath));

// Yükleme dizini kontrolü ve oluşturma
const uploadDir = path.join(__dirname, '../public/img/uploads/profile-pictures');
if (!fs.existsSync(uploadDir)) {
  console.log('Yükleme dizini oluşturuluyor:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Test endpoint'i ve dosya yollarını kontrol etmek için
app.get('/test', (req, res) => {
  res.json({ message: 'Server çalışıyor!' });
});

app.get('/file-test', (req, res) => {
  const files = [];
  try {
    if (fs.existsSync(uploadDir)) {
      const dirFiles = fs.readdirSync(uploadDir);
      files.push(...dirFiles.map(file => `/img/uploads/profile-pictures/${file}`));
    }
  } catch (error) {
    console.error('Dosyalar listelenirken hata:', error);
  }
  
  res.json({ 
    message: 'Dosya testi',
    uploadDir,
    exists: fs.existsSync(uploadDir),
    files
  });
});

// MongoDB Bağlantısı
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // API Endpoint'leri için yönlendirme
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/protected', require('./routes/protected'));
    app.use('/api/lobbies', require('./routes/lobbies'));
    
    // Server'ı başlat
    const PORT = 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
