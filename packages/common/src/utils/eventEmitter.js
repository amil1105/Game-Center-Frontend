/**
 * Basit bir EventEmitter uygulaması
 */
export class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Belirli bir olayı dinler
   * @param {string} event - Dinlenecek olay adı
   * @param {function} callback - Olay tetiklendiğinde çalıştırılacak fonksiyon
   * @returns {function} - Dinleyiciyi kaldırmak için kullanılabilecek fonksiyon
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    return () => this.off(event, callback);
  }

  /**
   * Bir olayın belirli bir dinleyicisini kaldırır
   * @param {string} event - Dinleyicinin kaldırılacağı olay adı
   * @param {function} callback - Kaldırılacak dinleyici fonksiyonu
   */
  off(event, callback) {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Bir olayı tetikler ve kayıtlı tüm dinleyicilere veri gönderir
   * @param {string} event - Tetiklenecek olay adı
   * @param {any} data - Dinleyicilere gönderilecek veri
   */
  emit(event, data) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      callback(data);
    });
  }

  /**
   * Bir olayı bir kez dinler ve tetiklendikten sonra dinleyiciyi kaldırır
   * @param {string} event - Dinlenecek olay adı
   * @param {function} callback - Olay tetiklendiğinde çalıştırılacak fonksiyon
   */
  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    
    return this.on(event, onceCallback);
  }
} 