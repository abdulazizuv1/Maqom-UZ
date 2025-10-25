// ========================================
// CENTRALIZED CONFIGURATION
// ========================================
// ВНИМАНИЕ: Этот файл содержит секретные ключи!

const AppConfig = {
  firebase: {
    apiKey: "AIzaSyB_uK38bUXaLQNK5DB8jwIW3wjpSDInYb4",
    authDomain: "maqom-fergana-uz.firebaseapp.com",
    projectId: "maqom-fergana-uz",
    storageBucket: "maqom-fergana-uz.firebasestorage.app",
    messagingSenderId: "78237726033",
    appId: "1:78237726033:web:98c79d21d8183240bd0f70",
    measurementId: "G-Z4WG7ECT80"
  },

  emailjs: {
    serviceId: "service_52koja9",
    templateId: "template_fkqfggf",
    publicKey: "3tKgtODLYVUgJrBZ-",
    toEmail: "farmaqommaktab@umail.uz"
  },

  app: {
    name: "Maqom Maktab-Internati",
    version: "2.0.0",
    language: "uz",
    timezone: "Asia/Tashkent"
  },

  // Storage Settings
  storage: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },

  // API Settings
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },

  // UI Settings
  ui: {
    animationDuration: 300,
    toastDuration: 5000,
    paginationLimit: 10
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
} else {
  window.AppConfig = AppConfig;
  
  // Dispatch event to notify that config is loaded
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('appConfigLoaded'));
  }
}
