// ========================================
// DATA SYNCHRONIZATION FOR MAIN SITE
// ========================================

class DataSyncModule {
    constructor() {
        this.dataManager = null;
        this.utils = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            console.log('DataSyncModule already initialized');
            return;
        }

        try {
            console.log('Initializing DataSyncModule...');
            
            // Wait for dependencies to be available
            await this.waitForDependencies();
            
            this.dataManager = window.DataManagerModule;
            this.utils = window.UtilsModule;

            console.log('DataManager available:', !!this.dataManager);
            console.log('Utils available:', !!this.utils);

            await this.dataManager.initialize();
            console.log('DataManager initialized');
            
            await this.loadAndUpdateData();
            console.log('Data loaded and updated');

            this.initialized = true;
            console.log('DataSync module initialized successfully');
            
            // Notify main app that data loading is complete
            if (window.app && typeof window.app.checkDataLoadingComplete === 'function') {
                window.app.checkDataLoadingComplete();
            }
        } catch (error) {
            console.error('DataSync initialization error:', error);
            if (this.utils) {
                this.utils.handleError(error, 'DataSyncModule.initialize');
            }
            
            // Even if there's an error, notify main app to hide loader
            if (window.app && typeof window.app.checkDataLoadingComplete === 'function') {
                window.app.checkDataLoadingComplete();
            }
        }
    }

    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            const checkDependencies = () => {
                attempts++;
                
                if (window.DataManagerModule && window.UtilsModule) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Dependencies not loaded after 5 seconds'));
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            
            checkDependencies();
        });
    }

    async loadAndUpdateData() {
        try {
            await Promise.all([
                this.updateNewsSection(),
                this.updateEmployeesSection()
            ]);
        } catch (error) {
            console.error('Error loading and updating data:', error);
        }
    }

    async updateNewsSection() {
        const newsSlider = document.getElementById('newsSlider');
        if (!newsSlider) return;

        try {
            // Show loading state
            newsSlider.innerHTML = '<div class="loading-news"><i class="fas fa-spinner fa-spin"></i> Yangiliklar yuklanmoqda...</div>';

            // Load news from Firebase
            const news = await this.dataManager.getNews(4); // Get latest 4 news

            newsSlider.innerHTML = '';

            news.forEach((newsItem, index) => {
                const newsCard = this.createNewsCard(newsItem, index);
                newsSlider.appendChild(newsCard);
            });

            // Reinitialize slider after loading data
            if (window.app && typeof window.app.setupSlider === 'function') {
                window.app.setupSlider();
            }

            // Reinitialize AOS for new elements
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        } catch (error) {
            console.error('Error updating news section:', error);
            newsSlider.innerHTML = '<div class="error-news"><i class="fas fa-exclamation-triangle"></i> Yangiliklar yuklanmadi</div>';
        }
    }

    createNewsCard(news, index) {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100);

        const categoryIcon = this.getCategoryIcon(news.category);
        const imageUrl = news.imageUrl || './img/about_us.jpg';
        
        card.innerHTML = `
            <div class="news-image">
                <img src="${imageUrl}" alt="${news.title}" loading="lazy" />
                <div class="news-category">
                    <i class="${categoryIcon}"></i>
                    <span>${news.category}</span>
                </div>
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-date">
                        <i class="far fa-calendar"></i>
                        ${this.utils.formatDate(news.date || news.createdAt)}
                    </span>
                </div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${this.utils.truncateText(news.excerpt || news.content, 120)}</p>
                <a href="#" class="news-link" onclick="dataSync.showNewsModal('${news.id}')">
                    Batafsil <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        return card;
    }

    async updateEmployeesSection() {
        console.log('updateEmployeesSection called');
        const employeesGrid = document.querySelector('.employees-grid');
        console.log('employees-grid found:', !!employeesGrid);
        
        if (!employeesGrid) {
            console.error('employees-grid element not found');
            // Try alternative selectors
            const altSelectors = [
                '#employees .employees-grid',
                '.employees .employees-grid',
                '[id="employees"] .employees-grid'
            ];
            
            for (const selector of altSelectors) {
                const altElement = document.querySelector(selector);
                if (altElement) {
                    console.log(`Found employees grid with selector: ${selector}`);
                    return this.updateEmployeesSectionWithElement(altElement);
                }
            }
            
            console.error('Could not find employees grid with any selector');
            return;
        }
        
        return this.updateEmployeesSectionWithElement(employeesGrid);
    }
    
    async updateEmployeesSectionWithElement(employeesGrid) {

        try {
            // Show loading state
            employeesGrid.innerHTML = '<div class="loading-employees"><i class="fas fa-spinner fa-spin"></i> Xodimlar yuklanmoqda...</div>';
            console.log('Loading state set for employees');

            // Load employees from Firebase
            console.log('Loading employees from Firebase...');
            const employees = await this.dataManager.getEmployees();
            console.log('Employees loaded:', employees);

            // Clear the loading state
            employeesGrid.innerHTML = '';

            if (employees && employees.length > 0) {
                console.log(`Processing ${employees.length} employees...`);
                employees.forEach((employee, index) => {
                    console.log(`Creating employee card ${index}:`, employee);
                    const employeeCard = this.createEmployeeCard(employee, index);
                    employeesGrid.appendChild(employeeCard);
                    console.log(`Employee card ${index} appended to DOM`);
                });
                console.log(`Successfully created and appended ${employees.length} employee cards`);
                
                // Check if cards are actually in the DOM
                const cardsInDOM = employeesGrid.querySelectorAll('.employee-card');
                console.log(`Cards in DOM: ${cardsInDOM.length}`);
                
                // Force a reflow to ensure the cards are visible
                employeesGrid.offsetHeight;
                
                // Check container visibility
                const containerStyle = window.getComputedStyle(employeesGrid);
                console.log(`Container display: ${containerStyle.display}, visibility: ${containerStyle.visibility}, opacity: ${containerStyle.opacity}`);
                
                // Check if any cards are visible
                const visibleCards = Array.from(cardsInDOM).filter(card => {
                    const cardStyle = window.getComputedStyle(card);
                    return cardStyle.display !== 'none' && cardStyle.visibility !== 'hidden' && cardStyle.opacity !== '0';
                });
                console.log(`Visible cards: ${visibleCards.length}`);
                
                // If no cards are visible, try to make them visible
                if (visibleCards.length === 0 && cardsInDOM.length > 0) {
                    console.log('Cards exist but are not visible, trying to fix...');
                    cardsInDOM.forEach(card => {
                        card.style.display = 'block';
                        card.style.visibility = 'visible';
                        card.style.opacity = '1';
                    });
                }
            } else {
                console.log('No employees found, showing fallback data');
                // Show fallback data if no employees found
                const fallbackEmployees = this.dataManager.getFallbackEmployees();
                fallbackEmployees.forEach((employee, index) => {
                    const employeeCard = this.createEmployeeCard(employee, index);
                    employeesGrid.appendChild(employeeCard);
                });
            }

            // Reinitialize AOS for new elements
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        } catch (error) {
            console.error('Error updating employees section:', error);
            employeesGrid.innerHTML = '<div class="error-employees"><i class="fas fa-exclamation-triangle"></i> Xodimlar yuklanmadi</div>';
        }
    }

    createEmployeeCard(employee, index) {
        console.log(`Creating employee card for:`, employee);
        
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.setAttribute('data-aos', 'flip-left');
        card.setAttribute('data-aos-delay', index * 100);

        // Ensure we have the required fields
        const employeeName = employee.name || 'Noma\'lum';
        const employeeRole = employee.role || 'Xodim';
        const imageUrl = employee.imageUrl || './img/about_us.jpg';

        console.log(`Employee card data: name=${employeeName}, role=${employeeRole}, image=${imageUrl}`);
        console.log(`Contact data: phone=${employee.phone}, email=${employee.email}`);

        // Create contact info based on available data
        let contactInfo = '';
        if (employee.phone && employee.phone.trim() !== '') {
            contactInfo += `<a href="tel:${employee.phone}" title="Telefon: ${employee.phone}"><i class="fas fa-phone"></i></a>`;
            console.log(`Added phone icon for: ${employee.phone}`);
        }
        if (employee.email && employee.email.trim() !== '') {
            contactInfo += `<a href="mailto:${employee.email}" title="Email: ${employee.email}"><i class="fas fa-envelope"></i></a>`;
            console.log(`Added email icon for: ${employee.email}`);
        }
        
        console.log(`Contact info HTML: ${contactInfo}`);

        card.innerHTML = `
            <div class="employee-image">
                <img src="${imageUrl}" alt="${employeeName}" loading="lazy" />
                ${contactInfo ? `<div class="employee-social">${contactInfo}</div>` : ''}
            </div>
            <div class="employee-info">
                <h3 class="employee-name">${employeeName}</h3>
                <p class="employee-role">
                    <i class="fas fa-briefcase"></i>
                    ${employeeRole}
                </p>
            </div>
        `;

        console.log(`Employee card HTML created:`, card.outerHTML);
        return card;
    }

    getCategoryIcon(category) {
        const icons = {
            'Festival': 'fas fa-star',
            'Ta\'lim': 'fas fa-graduation-cap',
            'Konsert': 'fas fa-music',
            'Tadbir': 'fas fa-calendar-alt',
            'E\'lon': 'fas fa-bullhorn'
        };
        return icons[category] || 'fas fa-newspaper';
    }

    async showNewsModal(newsId) {
        try {
            const news = await this.dataManager.getNewsById(newsId);
            if (!news) {
                this.utils.showNotification('Yangilik topilmadi', 'error');
                return;
            }

            this.createNewsModal(news);
        } catch (error) {
            console.error('Error showing news modal:', error);
            this.utils.showNotification('Yangilik ochilmadi', 'error');
        }
    }

    createNewsModal(news) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.news-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = this.utils.createElement('div', 'news-modal');
        modal.innerHTML = `
            <div class="news-modal-content">
                <div class="news-modal-header">
                    <h2>${news.title}</h2>
                    <button class="news-modal-close">&times;</button>
                </div>
                <div class="news-modal-body">
                    <div class="news-modal-meta">
                        <span><i class="fas fa-calendar"></i> ${this.utils.formatDate(news.date)}</span>
                        <span><i class="fas fa-tag"></i> ${news.category}</span>
                        <span><i class="fas fa-user"></i> ${news.author}</span>
                    </div>
                    <div class="news-modal-content-text">
                        ${news.content}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add styles if not exists
        if (!document.getElementById('news-modal-styles')) {
            const style = this.utils.createElement('style');
            style.id = 'news-modal-styles';
            style.textContent = `
                .news-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 2rem;
                    animation: fadeIn 0.3s ease;
                }
                .news-modal-content {
                    background: white;
                    border-radius: 15px;
                    max-width: 800px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideInUp 0.3s ease;
                }
                .news-modal-header {
                    padding: 2rem;
                    border-bottom: 2px solid var(--primary);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .news-modal-header h2 {
                    color: var(--primary);
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin: 0;
                }
                .news-modal-close {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    color: var(--text-gray);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                .news-modal-close:hover {
                    background: var(--bg-light);
                    color: var(--primary);
                }
                .news-modal-body {
                    padding: 2rem;
                }
                .news-modal-meta {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 1.5rem;
                    color: var(--text-gray);
                    font-size: 0.9rem;
                    flex-wrap: wrap;
                }
                .news-modal-content-text {
                    line-height: 1.8;
                    color: var(--text-dark);
                    font-size: 1.1rem;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInUp {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (max-width: 768px) {
                    .news-modal {
                        padding: 1rem;
                    }
                    .news-modal-header {
                        padding: 1.5rem;
                    }
                    .news-modal-header h2 {
                        font-size: 1.4rem;
                    }
                    .news-modal-body {
                        padding: 1.5rem;
                    }
                    .news-modal-meta {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Close modal functionality
        const closeBtn = modal.querySelector('.news-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Refresh data method
    async refreshData() {
        if (!this.initialized) {
            await this.initialize();
            return;
        }

        try {
            await this.loadAndUpdateData();
            this.utils.showNotification('Ma\'lumotlar yangilandi', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.utils.showNotification('Ma\'lumotlar yangilanmadi', 'error');
        }
    }
}

// Create global instance
window.DataSyncModule = new DataSyncModule();

// Add isInitialized property for external checking
Object.defineProperty(window.DataSyncModule, 'isInitialized', {
    get: function() {
        return this.initialized;
    }
});

// Make dataSync available globally for onclick handlers
window.dataSync = window.DataSyncModule;
