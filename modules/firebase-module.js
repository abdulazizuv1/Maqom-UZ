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
            // Импортируем Firebase SDK
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js');
            const { getAuth } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js');
            const { getFirestore } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            const { getStorage } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js');

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
