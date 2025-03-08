const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Token'ı al (header'dan)
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Yetkilendirme hatası: Token bulunamadı' });
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Yetkilendirme hatası: Kullanıcı bulunamadı' });
    }
    
    // Kullanıcıyı request'e ekle
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    res.status(401).json({ error: 'Yetkilendirme hatası: Geçersiz token' });
  }
}; 