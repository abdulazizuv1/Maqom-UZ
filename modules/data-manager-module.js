class DataManagerModule {
    constructor() {
        this.firebase = null;
        this.utils = null;
        this.config = null;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async initialize() {
        this.firebase = window.FirebaseModule;
        this.utils = window.UtilsModule;
        this.config = window.AppConfig;

        await this.firebase.initialize();
        console.log('DataManager module initialized successfully');
    }

    // News management
    async getNews(limit = null, orderBy = 'date', orderDirection = 'desc') {
        try {
            const cacheKey = `news_${limit}_${orderBy}_${orderDirection}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const { collection, query, orderBy: fbOrderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            
            const newsRef = collection(this.firebase.getFirestore(), 'news');
            let q = query(newsRef, fbOrderBy(orderBy, orderDirection));
            
            if (limit) {
                const { limit: fbLimit } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
                q = query(newsRef, fbOrderBy(orderBy, orderDirection), fbLimit(limit));
            }

            const snapshot = await getDocs(q);
            const news = [];
            
            snapshot.forEach((doc) => {
                news.push({ id: doc.id, ...doc.data() });
            });

            // Additional client-side sorting by date to ensure proper order
            news.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt);
                const dateB = new Date(b.date || b.createdAt);
                return orderDirection === 'desc' ? dateB - dateA : dateA - dateB;
            });

            this.setCache(cacheKey, news);
            return news;
        } catch (error) {
            console.error('Error fetching news:', error);
            return this.getFallbackNews();
        }
    }

    async getNewsById(id) {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            const newsRef = doc(this.firebase.getFirestore(), 'news', id);
            const newsSnap = await getDoc(newsRef);
            
            if (newsSnap.exists()) {
                return { id: newsSnap.id, ...newsSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error fetching news by ID:', error);
            return null;
        }
    }

    async addNews(newsData) {
        try {
            // Check authentication
            const currentUser = this.firebase.getAuth().currentUser;
            if (!currentUser) {
                throw new Error('Foydalanuvchi autentifikatsiya qilinmagan');
            }
            
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            
            const newsRef = collection(this.firebase.getFirestore(), 'news');
            const docData = {
                ...newsData,
                createdAt: this.utils.getCurrentDateTime(),
                updatedAt: this.utils.getCurrentDateTime(),
                author: currentUser.email || 'Admin'
            };
            
            console.log('Adding news with user:', currentUser.email);
            const docRef = await addDoc(newsRef, docData);
            this.clearCache('news');
            
            return { id: docRef.id, ...docData };
        } catch (error) {
            console.error('Error adding news:', error);
            throw error;
        }
    }

    async updateNews(id, newsData) {
        try {
            // Check authentication
            const currentUser = this.firebase.getAuth().currentUser;
            if (!currentUser) {
                throw new Error('Foydalanuvchi autentifikatsiya qilinmagan');
            }
            
            const { doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            
            const newsRef = doc(this.firebase.getFirestore(), 'news', id);
            
            // Check if document exists
            const docSnap = await getDoc(newsRef);
            if (!docSnap.exists()) {
                throw new Error('Yangilik topilmadi. Yangi yangilik sifatida qo\'shiladi.');
            }
            
            const docData = {
                ...newsData,
                updatedAt: this.utils.getCurrentDateTime(),
                updatedBy: currentUser.email || 'Admin'
            };
            
            console.log('Updating news with user:', currentUser.email);
            await updateDoc(newsRef, docData);
            this.clearCache('news');
            
            return { id, ...docData };
        } catch (error) {
            console.error('Error updating news:', error);
            throw error;
        }
    }

    async deleteNews(id) {
        try {
            // Check authentication
            const currentUser = this.firebase.getAuth().currentUser;
            if (!currentUser) {
                throw new Error('Foydalanuvchi autentifikatsiya qilinmagan');
            }
            
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            
            const newsRef = doc(this.firebase.getFirestore(), 'news', id);
            console.log('Deleting news with user:', currentUser.email);
            await deleteDoc(newsRef);
            this.clearCache('news');
            
            return true;
        } catch (error) {
            console.error('Error deleting news:', error);
            throw error;
        }
    }

    // Employees management
    async getEmployees(limit = null, orderBy = 'createdAt', orderDirection = 'desc') {
        try {
            console.log('getEmployees called with params:', { limit, orderBy, orderDirection });
            const cacheKey = `employees_${limit}_${orderBy}_${orderDirection}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log('Returning cached employees:', cached.length);
                return cached;
            }

            console.log('Fetching employees from Firebase...');
            const { collection, query, orderBy: fbOrderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            
            const employeesRef = collection(this.firebase.getFirestore(), 'employees');
            let q = query(employeesRef, fbOrderBy(orderBy, orderDirection));
            
            if (limit) {
                const { limit: fbLimit } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
                q = query(employeesRef, fbOrderBy(orderBy, orderDirection), fbLimit(limit));
            }

            const snapshot = await getDocs(q);
            const employees = [];
            
            console.log('Firebase snapshot size:', snapshot.size);
            snapshot.forEach((doc) => {
                const employeeData = { id: doc.id, ...doc.data() };
                console.log('Employee from Firebase:', employeeData);
                employees.push(employeeData);
            });

            console.log('Total employees fetched:', employees.length);
            this.setCache(cacheKey, employees);
            return employees;
        } catch (error) {
            console.error('Error fetching employees:', error);
            console.log('Returning fallback employees');
            return this.getFallbackEmployees();
        }
    }

    async getEmployeeById(id) {
        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            const employeeRef = doc(this.firebase.getFirestore(), 'employees', id);
            const employeeSnap = await getDoc(employeeRef);
            
            if (employeeSnap.exists()) {
                return { id: employeeSnap.id, ...employeeSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error fetching employee by ID:', error);
            return null;
        }
    }

    async addEmployee(employeeData) {
        try {
            // Check authentication
            const currentUser = this.firebase.getAuth().currentUser;
            if (!currentUser) {
                throw new Error('Foydalanuvchi autentifikatsiya qilinmagan');
            }
            
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            
            const employeesRef = collection(this.firebase.getFirestore(), 'employees');
            const docData = {
                ...employeeData,
                createdAt: this.utils.getCurrentDateTime(),
                updatedAt: this.utils.getCurrentDateTime(),
                addedBy: currentUser.email || 'Admin'
            };
            
            console.log('Adding employee with user:', currentUser.email);
            const docRef = await addDoc(employeesRef, docData);
            this.clearCache('employees');
            
            return { id: docRef.id, ...docData };
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    }

    async updateEmployee(id, employeeData) {
        try {
            // Check authentication
            const currentUser = this.firebase.getAuth().currentUser;
            if (!currentUser) {
                throw new Error('Foydalanuvchi autentifikatsiya qilinmagan');
            }
            
            const { doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            
            const employeeRef = doc(this.firebase.getFirestore(), 'employees', id);
            
            // Check if document exists
            const docSnap = await getDoc(employeeRef);
            if (!docSnap.exists()) {
                throw new Error('Xodim topilmadi. Yangi xodim sifatida qo\'shiladi.');
            }
            
            const docData = {
                ...employeeData,
                updatedAt: this.utils.getCurrentDateTime(),
                updatedBy: currentUser.email || 'Admin'
            };
            
            console.log('Updating employee with user:', currentUser.email);
            await updateDoc(employeeRef, docData);
            this.clearCache('employees');
            
            return { id, ...docData };
        } catch (error) {
            console.error('Error updating employee:', error);
            throw error;
        }
    }

    async deleteEmployee(id) {
        try {
            // Check authentication
            const currentUser = this.firebase.getAuth().currentUser;
            if (!currentUser) {
                throw new Error('Foydalanuvchi autentifikatsiya qilinmagan');
            }
            
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js');
            
            const employeeRef = doc(this.firebase.getFirestore(), 'employees', id);
            console.log('Deleting employee with user:', currentUser.email);
            await deleteDoc(employeeRef);
            this.clearCache('employees');
            
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    }

    // File upload management
    async uploadFile(file, folder, fileName = null) {
        try {
            const { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js');
            
            // Check if user is authenticated
            const currentUser = this.firebase.getAuth().currentUser;
            if (!currentUser) {
                throw new Error('Foydalanuvchi autentifikatsiya qilinmagan');
            }
            
            // Validate file
            if (!this.utils.validateFileSize(file)) {
                throw new Error(`Fayl hajmi ${this.utils.formatFileSize(this.config.storage.maxFileSize)} dan katta`);
            }
            
            if (!this.utils.validateFileType(file)) {
                throw new Error('Ruxsat berilmagan fayl formati');
            }

            // Generate unique filename
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const fileExtension = file.name.split('.').pop();
            const name = fileName || `${timestamp}_${randomId}.${fileExtension}`;
            
            const storageRef = ref(this.firebase.getStorage(), `${folder}/${name}`);
            
            console.log('Uploading file to:', `${folder}/${name}`);
            console.log('User authenticated:', !!currentUser);
            
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            console.log('File uploaded successfully:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async deleteFile(fileUrl) {
        try {
            const { ref, deleteObject } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js');
            
            const fileRef = ref(this.firebase.getStorage(), fileUrl);
            await deleteObject(fileRef);
            
            console.log('File deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // Cache management
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    // Fallback data
    getFallbackNews() {
        const news = [
            {
                id: 'fallback-1',
                title: 'Xalqaro Maqom Festivali',
                category: 'Festival',
                excerpt: 'Maktabimiz o\'quvchilari xalqaro festivalda qatnashdi va yuqori natijalar ko\'rsatdi.',
                content: 'Farg\'ona maqom maktab-internati o\'quvchilari Toshkentda o\'tkazilgan xalqaro maqom festivalida faol ishtirok etdilar.',
                imageUrl: '',
                date: '2025-10-25', // Самая поздняя дата - должна быть первой
                author: 'Admin',
                createdAt: this.utils.getCurrentDateTime()
            },
            {
                id: 'fallback-2',
                title: 'Yangi O\'quv Yili Boshlandi',
                category: 'Ta\'lim',
                excerpt: '2025-2026 o\'quv yili tantanali ochilish marosimi bo\'lib o\'tdi.',
                content: 'Maktabimizda yangi o\'quv yili tantanali ravishda ochildi.',
                imageUrl: '',
                date: '2025-10-21', // Средняя дата
                author: 'Admin',
                createdAt: this.utils.getCurrentDateTime()
            },
            {
                id: 'fallback-3',
                title: 'Ustozlar Konserti',
                category: 'Konsert',
                excerpt: 'Maktab o\'qituvchilari tomonidan maxsus konsert dasturi taqdim etildi.',
                content: 'Maktabimiz o\'qituvchilari tomonidan "Maqom san\'ati sirlari" nomli maxsus konsert dasturi taqdim etildi.',
                imageUrl: '',
                date: '2025-10-17', // Самая ранняя дата - должна быть последней
                author: 'Admin',
                createdAt: this.utils.getCurrentDateTime()
            }
        ];
        
        // Sort by date in descending order (newest dates first)
        return news.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // Descending order
        });
    }

    getFallbackEmployees() {
        return [
            {
                id: 'fallback-1',
                name: 'Mamadjanov Ulug\'bek Valiyevich',
                role: 'Direktor',
                imageUrl: './img/Директор.png',
                phone: '+998 (73) 244-43-17',
                email: 'farmaqommaktab@umail.uz',
                createdAt: this.utils.getCurrentDateTime()
            },
            {
                id: 'fallback-2',
                name: 'Xudaynazarov Ulmasbek Kadirovich',
                role: 'O\'quv ishlari bo\'yicha direktor o\'rinbosari',
                imageUrl: './img/Зам.jpg',
                phone: '',
                email: '',
                createdAt: this.utils.getCurrentDateTime()
            },
            {
                id: 'fallback-3',
                name: 'Kadirov Farxod Fozilovich',
                role: 'Ma\'navaiy-Ma\'rifiy ishlar bo\'yicha direktor o\'rinbosari',
                imageUrl: './img/Зам2.JPG',
                phone: '',
                email: '',
                createdAt: this.utils.getCurrentDateTime()
            },
            {
                id: 'fallback-4',
                name: 'Mamadjanova Xafiza Sobirjonova',
                role: 'Kasbiy ta\'lim bo\'yicha direktor o\'rinbosari',
                imageUrl: './img/Директор уринбосар.png',
                phone: '',
                email: '',
                createdAt: this.utils.getCurrentDateTime()
            }
        ];
    }

    // Statistics
    async getStatistics() {
        try {
            const [news, employees] = await Promise.all([
                this.getNews(),
                this.getEmployees()
            ]);

            return {
                newsCount: news.length,
                employeesCount: employees.length,
                lastUpdate: this.utils.getCurrentDateTime()
            };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                newsCount: 0,
                employeesCount: 0,
                lastUpdate: this.utils.getCurrentDateTime()
            };
        }
    }
}

// Создаем глобальный экземпляр
window.DataManagerModule = new DataManagerModule();
