// ========================================
// FIREBASE MODULE
// ========================================

class FirebaseModule {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Wait for AppConfig to be available
            await this.waitForAppConfig();

            // Импортируем Firebase SDK
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const { getStorage } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');

            // Check if AppConfig is available
            if (!window.AppConfig || !window.AppConfig.firebase) {
                throw new Error('AppConfig.firebase is not available');
            }

            // Инициализируем Firebase
            this.app = initializeApp(window.AppConfig.firebase);
            this.auth = getAuth(this.app);
            this.db = getFirestore(this.app);
            this.storage = getStorage(this.app);

            this.initialized = true;
            console.log('Firebase module initialized successfully');
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }

    async waitForAppConfig() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            const checkConfig = () => {
                attempts++;
                
                if (window.AppConfig && window.AppConfig.firebase) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('AppConfig not loaded after 5 seconds'));
                } else {
                    setTimeout(checkConfig, 100);
                }
            };
            
            checkConfig();
        });
    }

    // Auth methods
    getAuth() {
        if (!this.initialized) throw new Error('Firebase not initialized');
        return this.auth;
    }

    // Firestore methods
    getFirestore() {
        if (!this.initialized) throw new Error('Firebase not initialized');
        return this.db;
    }

    // Storage methods
    getStorage() {
        if (!this.initialized) throw new Error('Firebase not initialized');
        return this.storage;
    }

    // Helper method to get all Firebase services
    getServices() {
        if (!this.initialized) throw new Error('Firebase not initialized');
        return {
            auth: this.auth,
            db: this.db,
            storage: this.storage,
            app: this.app
        };
    }
}

// Создаем глобальный экземпляр
window.FirebaseModule = new FirebaseModule();
