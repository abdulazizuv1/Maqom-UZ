// ========================================
// ADMIN PANEL WITH MODULAR ARCHITECTURE - FIXED VERSION
// ========================================

class FirebaseAdminPanel {
    constructor() {
        this.firebase = null;
        this.dataManager = null;
        this.utils = null;
        this.currentUser = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Initialize modules
            this.firebase = window.FirebaseModule;
            this.dataManager = window.DataManagerModule;
            this.utils = window.UtilsModule;

            // Check if modules are available
            if (!this.firebase || !this.dataManager || !this.utils) {
                throw new Error('Required modules not loaded');
            }

            // Initialize Firebase
            await this.firebase.initialize();
            await this.dataManager.initialize();

            this.setupEventListeners();
            await this.checkAuthState();

            this.initialized = true;
            console.log('Firebase Admin Panel initialized successfully');
        } catch (error) {
            console.error('Admin panel initialization error:', error);
            if (this.utils) {
                this.utils.handleError(error, 'FirebaseAdminPanel.init');
            } else {
                console.error('Utils module not available for error handling');
            }
        }
    }

    async checkAuthState() {
        const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js');
        
        onAuthStateChanged(this.firebase.getAuth(), (user) => {
            if (user) {
                this.currentUser = user;
                this.showDashboard();
                this.updateUserInfo();
            } else {
                this.showLogin();
            }
        });
    }

    async login(email, password) {
        const loginError = document.getElementById('loginError');
        const loginLoading = document.getElementById('loginLoading');
        const loginBtn = document.querySelector('.login-btn');

        try {
            loginError.textContent = '';
            loginLoading.classList.remove('hidden');
            loginBtn.disabled = true;

            const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js');
            await signInWithEmailAndPassword(this.firebase.getAuth(), email, password);
            console.log('Login successful');
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = this.getLoginErrorMessage(error);
        } finally {
            loginLoading.classList.add('hidden');
            loginBtn.disabled = false;
        }
    }

    getLoginErrorMessage(error) {
        let errorMessage = 'Kirish xatosi! ';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage += 'Foydalanuvchi topilmadi.';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Noto\'g\'ri parol.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Noto\'g\'ri email manzil.';
                break;
            case 'auth/too-many-requests':
                errorMessage += 'Juda ko\'p urinish. Keyinroq urinib ko\'ring.';
                break;
            case 'auth/user-disabled':
                errorMessage += 'Foydalanuvchi o\'chirilgan.';
                break;
            default:
                errorMessage += error.message;
        }
        
        return errorMessage;
    }

    async logout() {
        try {
            const { signOut } = await import('https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js');
            await signOut(this.firebase.getAuth());
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('adminDashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        this.loadData();
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userInfo').textContent = this.currentUser.email;
            document.getElementById('currentUser').textContent = this.currentUser.email;
            document.getElementById('lastLogin').textContent = this.utils.formatDateTime(new Date());
            document.getElementById('firebaseStatus').textContent = 'Faol';
        }
    }

    async loadData() {
        try {
            const [news, employees] = await Promise.all([
                this.dataManager.getNews(),
                this.dataManager.getEmployees()
            ]);
            
            // Ensure we have arrays
            const safeNews = Array.isArray(news) ? news : [];
            const safeEmployees = Array.isArray(employees) ? employees : [];
            
            this.loadNewsList(safeNews);
            this.loadEmployeesList(safeEmployees);
            this.updateStats();
        } catch (error) {
            console.error('Error loading data:', error);
            this.utils?.showNotification('Ma\'lumotlar yuklanmadi', 'error');
            
            // Load empty lists on error
            this.loadNewsList([]);
            this.loadEmployeesList([]);
        }
    }

    updateStats() {
        const newsCount = document.getElementById('newsList').children.length;
        const employeesCount = document.getElementById('employeesList').children.length;
        document.getElementById('newsCount').textContent = newsCount;
        document.getElementById('employeesCount').textContent = employeesCount;
        
        // Update news count badge
        const newsCountBadge = document.getElementById('newsCountBadge');
        if (newsCountBadge) {
            newsCountBadge.textContent = `${newsCount} yangilik`;
        }
    }

    loadNewsList(news) {
        const newsList = document.getElementById('newsList');
        const newsLoading = document.getElementById('newsLoading');
        
        if (newsLoading) {
            newsLoading.classList.add('hidden');
        }
        
        if (!Array.isArray(news) || news.length === 0) {
            newsList.innerHTML = '<div class="no-data">Yangiliklar topilmadi</div>';
            return;
        }
        
        try {
            newsList.innerHTML = news.map(item => this.createNewsItem(item).outerHTML).join('');
        } catch (error) {
            console.error('Error rendering news list:', error);
            newsList.innerHTML = '<div class="no-data">Yangiliklar yuklanmadi</div>';
        }
    }

    createNewsItem(news) {
        const item = this.utils.createElement('div', 'news-item');
        item.innerHTML = `
            <img src="${news.imageUrl || './img/about_us.jpg'}" alt="${news.title || 'News'}" class="item-image" loading="lazy" />
            <div class="item-content">
                <h3 class="item-title">${news.title || 'Sarlavha yo\'q'}</h3>
                <div class="item-meta">
                    <span><i class="fas fa-calendar"></i> ${this.utils.formatDate(news.date || new Date().toISOString())}</span>
                    <span><i class="fas fa-tag"></i> ${news.category || 'Kategoriya yo\'q'}</span>
                    <span><i class="fas fa-user"></i> ${news.author || 'Muallif yo\'q'}</span>
                </div>
                <p class="item-description">${this.utils.truncateText(news.excerpt || '', 150)}</p>
                <div class="item-actions">
                    <button class="action-btn edit-btn" onclick="firebaseAdmin.editNews('${news.id}')">
                        <i class="fas fa-edit"></i>
                        Tahrirlash
                    </button>
                    <button class="action-btn delete-btn" onclick="firebaseAdmin.deleteNews('${news.id}')">
                        <i class="fas fa-trash"></i>
                        O'chirish
                    </button>
                </div>
            </div>
        `;
        return item;
    }

    addNews() {
        this.openNewsModal();
    }

    async editNews(id) {
        try {
            const news = await this.dataManager.getNewsById(id);
            if (news) {
                this.openNewsModal(news);
            }
        } catch (error) {
            console.error('Error editing news:', error);
            this.utils.showNotification('Yangilik topilmadi', 'error');
        }
    }

    async deleteNews(id) {
        if (confirm('Bu yangilikni o\'chirishni xohlaysizmi?')) {
            try {
                await this.dataManager.deleteNews(id);
                this.utils?.showNotification('Yangilik o\'chirildi', 'success');
                await this.loadData();
            } catch (error) {
                console.error('Error deleting news:', error);
                this.utils?.showNotification('Yangilik o\'chirilmadi', 'error');
            }
        }
    }

    openNewsModal(news = null) {
        const modal = document.getElementById('newsModal');
        const title = document.getElementById('newsModalTitle');
        const form = document.getElementById('newsForm');

        if (news) {
            title.textContent = 'Yangilikni tahrirlash';
            document.getElementById('newsId').value = news.id;
            document.getElementById('newsTitle').value = news.title;
            document.getElementById('newsCategory').value = news.category;
            document.getElementById('newsExcerpt').value = news.excerpt;
            document.getElementById('newsContent').value = news.content;
            document.getElementById('newsDate').value = news.date;
            
            if (news.imageUrl) {
                document.getElementById('newsImagePreview').innerHTML = `
                    <img src="${news.imageUrl}" alt="Current image" style="max-width: 200px; max-height: 150px; border-radius: 8px;" />
                `;
            }
        } else {
            title.textContent = 'Yangi yangilik qoshish';
            form.reset();
            document.getElementById('newsDate').value = this.utils.getCurrentDate();
            document.getElementById('newsImagePreview').innerHTML = '';
        }

        modal.classList.add('active');
    }

    async saveNews(formData) {
        const id = formData.get('newsId');
        const isEdit = !!id;
        
        try {
            // Get form values directly from DOM elements
            const title = document.getElementById('newsTitle').value;
            const category = document.getElementById('newsCategory').value;
            const excerpt = document.getElementById('newsExcerpt').value;
            const content = document.getElementById('newsContent').value;
            const date = document.getElementById('newsDate').value;
            
            console.log('Form data:', { title, category, excerpt, content, date });
            
            // Upload image if selected
            let imageUrl = '';
            const imageFile = document.getElementById('newsImageFile').files[0];
            if (imageFile) {
                try {
                    imageUrl = await this.dataManager.uploadFile(imageFile, 'news');
                    console.log('Image uploaded:', imageUrl);
                } catch (uploadError) {
                    console.warn('Image upload failed, continuing without image:', uploadError);
                    // Continue without image if upload fails
                }
            }

            const newsData = {
                title: title,
                category: category,
                excerpt: excerpt,
                content: content,
                date: date,
                author: this.currentUser?.email || 'Admin'
            };

            if (imageUrl) {
                newsData.imageUrl = imageUrl;
            }

            console.log('Saving news data:', newsData);

            if (isEdit) {
                try {
                    await this.dataManager.updateNews(id, newsData);
                    this.utils?.showNotification('Yangilik yangilandi', 'success');
                } catch (updateError) {
                    console.warn('Update failed, creating new news:', updateError);
                    await this.dataManager.addNews(newsData);
                    this.utils?.showNotification('Yangilik yangi sifatida qo\'shildi', 'success');
                }
            } else {
                await this.dataManager.addNews(newsData);
                this.utils?.showNotification('Yangilik qo\'shildi', 'success');
            }

            this.closeModal('newsModal');
            await this.loadData();
        } catch (error) {
            console.error('Error saving news:', error);
            this.utils?.showNotification('Yangilik saqlanmadi', 'error');
        }
    }

    loadEmployeesList(employees) {
        const employeesList = document.getElementById('employeesList');
        const employeesLoading = document.getElementById('employeesLoading');
        
        if (employeesLoading) {
            employeesLoading.classList.add('hidden');
        }
        
        if (!Array.isArray(employees) || employees.length === 0) {
            employeesList.innerHTML = '<div class="no-data">Xodimlar topilmadi</div>';
            return;
        }
        
        try {
            employeesList.innerHTML = employees.map(emp => this.createEmployeeItem(emp).outerHTML).join('');
        } catch (error) {
            console.error('Error rendering employees list:', error);
            employeesList.innerHTML = '<div class="no-data">Xodimlar yuklanmadi</div>';
        }
    }

    createEmployeeItem(employee) {
        const item = this.utils.createElement('div', 'employee-item');
        item.innerHTML = `
            <img src="${employee.imageUrl || './img/about_us.jpg'}" alt="${employee.name || 'Employee'}" class="item-image" loading="lazy" />
            <div class="item-content">
                <h3 class="item-title">${employee.name || 'Ism yo\'q'}</h3>
                <div class="item-meta">
                    <span><i class="fas fa-briefcase"></i> ${employee.role || 'Lavozim yo\'q'}</span>
                    ${employee.phone ? `<span><i class="fas fa-phone"></i> ${employee.phone}</span>` : ''}
                    ${employee.email ? `<span><i class="fas fa-envelope"></i> ${employee.email}</span>` : ''}
                </div>
                <p class="item-description">${this.utils.truncateText(employee.bio || '', 150)}</p>
                <div class="item-actions">
                    <button class="action-btn edit-btn" onclick="firebaseAdmin.editEmployee('${employee.id}')">
                        <i class="fas fa-edit"></i>
                        Tahrirlash
                    </button>
                    <button class="action-btn delete-btn" onclick="firebaseAdmin.deleteEmployee('${employee.id}')">
                        <i class="fas fa-trash"></i>
                        O'chirish
                    </button>
                </div>
            </div>
        `;
        return item;
    }

    addEmployee() {
        this.openEmployeeModal();
    }

    async editEmployee(id) {
        try {
            const employee = await this.dataManager.getEmployeeById(id);
            if (employee) {
                this.openEmployeeModal(employee);
            }
        } catch (error) {
            console.error('Error editing employee:', error);
            this.utils.showNotification('Xodim topilmadi', 'error');
        }
    }

    async deleteEmployee(id) {
        if (confirm('Bu xodimni o\'chirishni xohlaysizmi?')) {
            try {
                await this.dataManager.deleteEmployee(id);
                this.utils?.showNotification('Xodim o\'chirildi', 'success');
                await this.loadData();
            } catch (error) {
                console.error('Error deleting employee:', error);
                this.utils?.showNotification('Xodim o\'chirilmadi', 'error');
            }
        }
    }

    openEmployeeModal(employee = null) {
        const modal = document.getElementById('employeeModal');
        const title = document.getElementById('employeeModalTitle');
        const form = document.getElementById('employeeForm');

        if (employee) {
            title.textContent = 'Xodimni tahrirlash';
            document.getElementById('employeeId').value = employee.id;
            document.getElementById('employeeName').value = employee.name;
            document.getElementById('employeeRole').value = employee.role;
            document.getElementById('employeeBio').value = employee.bio;
            document.getElementById('employeePhone').value = employee.phone;
            document.getElementById('employeeEmail').value = employee.email;
            
            if (employee.imageUrl) {
                document.getElementById('employeeImagePreview').innerHTML = `
                    <img src="${employee.imageUrl}" alt="Current image" style="max-width: 200px; max-height: 150px; border-radius: 8px;" />
                `;
            }
        } else {
            title.textContent = 'Yangi xodim qoshish';
            form.reset();
            document.getElementById('employeeImagePreview').innerHTML = '';
        }

        modal.classList.add('active');
    }

    async saveEmployee(formData) {
        const id = formData.get('employeeId');
        const isEdit = !!id;
        
        try {
            // Get form values directly from DOM elements
            const name = document.getElementById('employeeName').value;
            const role = document.getElementById('employeeRole').value;
            const bio = document.getElementById('employeeBio').value;
            const phone = document.getElementById('employeePhone').value;
            const email = document.getElementById('employeeEmail').value;
            
            console.log('Employee form data:', { name, role, bio, phone, email });
            
            // Upload image if selected
            let imageUrl = '';
            const imageFile = document.getElementById('employeeImageFile').files[0];
            if (imageFile) {
                try {
                    imageUrl = await this.dataManager.uploadFile(imageFile, 'employees');
                    console.log('Employee image uploaded:', imageUrl);
                } catch (uploadError) {
                    console.warn('Image upload failed, continuing without image:', uploadError);
                    // Continue without image if upload fails
                }
            }

            const employeeData = {
                name: name,
                role: role,
                bio: bio,
                phone: phone,
                email: email
            };

            if (imageUrl) {
                employeeData.imageUrl = imageUrl;
            }

            console.log('Saving employee data:', employeeData);

            if (isEdit) {
                try {
                    await this.dataManager.updateEmployee(id, employeeData);
                    this.utils?.showNotification('Xodim yangilandi', 'success');
                } catch (updateError) {
                    console.warn('Update failed, creating new employee:', updateError);
                    await this.dataManager.addEmployee(employeeData);
                    this.utils?.showNotification('Xodim yangi sifatida qo\'shildi', 'success');
                }
            } else {
                await this.dataManager.addEmployee(employeeData);
                this.utils?.showNotification('Xodim qo\'shildi', 'success');
            }

            this.closeModal('employeeModal');
            await this.loadData();
        } catch (error) {
            console.error('Error saving employee:', error);
            this.utils?.showNotification('Xodim saqlanmadi', 'error');
        }
    }

    // Modal Management
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn('Modal not found:', modalId);
            return;
        }
        
        modal.classList.remove('active');
        
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        const previews = modal.querySelectorAll('.file-preview');
        previews.forEach(preview => preview.innerHTML = '');
        
        // Clear any error messages
        const errorElements = modal.querySelectorAll('.error-message');
        errorElements.forEach(el => el.textContent = '');
    }

    // Event Listeners
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            this.login(email, password);
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Add buttons
        document.getElementById('addNewsBtn').addEventListener('click', () => {
            this.addNews();
        });

        document.getElementById('addEmployeeBtn').addEventListener('click', () => {
            this.addEmployee();
        });

        // Modal forms
        document.getElementById('newsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('News form submitted');
            const formData = new FormData(e.target);
            console.log('FormData entries:', Array.from(formData.entries()));
            this.saveNews(formData);
        });

        document.getElementById('employeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Employee form submitted');
            const formData = new FormData(e.target);
            console.log('Employee FormData entries:', Array.from(formData.entries()));
            this.saveEmployee(formData);
        });

        // Close modal buttons
        document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = e.target.closest('[data-modal]')?.dataset.modal || 
                               e.target.dataset.modal;
                if (modalId) {
                    this.closeModal(modalId);
                }
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // File input previews
        document.getElementById('newsImageFile').addEventListener('change', (e) => {
            this.previewImage(e.target, 'newsImagePreview');
        });

        document.getElementById('employeeImageFile').addEventListener('change', (e) => {
            this.previewImage(e.target, 'employeeImagePreview');
        });
    }

    previewImage(input, previewId) {
        const preview = document.getElementById(previewId);
        const file = input.files[0];
        
        if (file) {
            this.utils.createImagePreview(file).then(previewUrl => {
                preview.innerHTML = `
                    <img src="${previewUrl}" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 8px;" />
                `;
            }).catch(error => {
                console.error('Error creating image preview:', error);
            });
        } else {
            preview.innerHTML = '';
        }
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}Section`).classList.add('active');
    }
}

// Initialize Firebase Admin Panel
let firebaseAdmin;

document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for modules to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    firebaseAdmin = new FirebaseAdminPanel();
    await firebaseAdmin.init();
});
