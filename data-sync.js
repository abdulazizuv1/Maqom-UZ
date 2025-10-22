// ========================================
// DATA SYNCHRONIZATION FOR MAIN SITE
// ========================================

class DataSync {
    constructor() {
        this.newsData = [];
        this.employeesData = [];
        this.init();
    }

    init() {
        this.loadData();
        this.updateMainSite();
    }

    loadData() {
        // Загружаем данные из localStorage (где их сохраняет админ-панель)
        this.newsData = JSON.parse(localStorage.getItem('newsData') || '[]');
        this.employeesData = JSON.parse(localStorage.getItem('employeesData') || '[]');
        
        // Если данных нет, используем статичные данные из HTML
        if (this.newsData.length === 0) {
            this.createDefaultNews();
        }
        if (this.employeesData.length === 0) {
            this.createDefaultEmployees();
        }
    }

    createDefaultNews() {
        this.newsData = [
            {
                id: 1,
                title: 'Xalqaro Maqom Festivali',
                category: 'Festival',
                excerpt: 'Maktabimiz o\'quvchilari xalqaro festivalda qatnashdi va yuqori natijalar ko\'rsatdi.',
                content: 'Farg\'ona maqom maktab-internati o\'quvchilari Toshkentda o\'tkazilgan xalqaro maqom festivalida faol ishtirok etdilar.',
                image: '',
                date: '2025-10-20',
                author: 'Admin'
            },
            {
                id: 2,
                title: 'Yangi O\'quv Yili Boshlandi',
                category: 'Ta\'lim',
                excerpt: '2025-2026 o\'quv yili tantanali ochilish marosimi bo\'lib o\'tdi.',
                content: 'Maktabimizda yangi o\'quv yili tantanali ravishda ochildi.',
                image: '',
                date: '2025-10-15',
                author: 'Admin'
            },
            {
                id: 3,
                title: 'Ustozlar Konserti',
                category: 'Konsert',
                excerpt: 'Maktab o\'qituvchilari tomonidan maxsus konsert dasturi taqdim etildi.',
                content: 'Maktabimiz o\'qituvchilari tomonidan "Maqom san\'ati sirlari" nomli maxsus konsert dasturi taqdim etildi.',
                image: '',
                date: '2025-10-10',
                author: 'Admin'
            }
        ];
    }

    createDefaultEmployees() {
        this.employeesData = [
            {
                id: 1,
                name: 'Mamadjanov Ulug\'bek Valiyevich',
                role: 'Direktor',
                image: './img/Директор.png',
                bio: 'Maqom san\'ati bo\'yicha malakali mutaxassis',
                phone: '+998 (73) 244-43-17',
                email: 'farmaqommaktab@umail.uz'
            },
            {
                id: 2,
                name: 'Xudaynazarov Ulmasbek Kadirovich',
                role: 'O\'quv ishlari bo\'yicha direktor o\'rinbosari',
                image: './img/Зам.jpg',
                bio: 'Pedagogika fanlari bo\'yicha malakali mutaxassis',
                phone: '',
                email: ''
            },
            {
                id: 3,
                name: 'Kadirov Farxod Fozilovich',
                role: 'Ma\'navaiy-Ma\'rifiy ishlar bo\'yicha direktor o\'rinbosari',
                image: './img/Зам2.JPG',
                bio: 'Ma\'naviy-ma\'rifiy ishlar bo\'yicha tajribali mutaxassis',
                phone: '',
                email: ''
            },
            {
                id: 4,
                name: 'Mamadjanova Xafiza Sobirjonova',
                role: 'Kasbiy ta\'lim bo\'yicha direktor o\'rinbosari',
                image: './img/Директор уринбосар.png',
                bio: 'Kasbiy ta\'lim sohasida malakali mutaxassis',
                phone: '',
                email: ''
            }
        ];
    }

    updateMainSite() {
        this.updateNewsSection();
        this.updateEmployeesSection();
    }

    updateNewsSection() {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;

        newsGrid.innerHTML = '';

        // Показываем только последние 3 новости
        const recentNews = this.newsData.slice(0, 3);

        recentNews.forEach((news, index) => {
            const newsCard = this.createNewsCard(news, index);
            newsGrid.appendChild(newsCard);
        });
    }

    createNewsCard(news, index) {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100);

        const categoryIcon = this.getCategoryIcon(news.category);
        
        card.innerHTML = `
            <div class="news-image">
                <div class="news-category">
                    <i class="${categoryIcon}"></i>
                    <span>${news.category}</span>
                </div>
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-date">
                        <i class="far fa-calendar"></i>
                        ${this.formatDate(news.date)}
                    </span>
                    <span class="news-author">
                        <i class="far fa-user"></i>
                        ${news.author}
                    </span>
                </div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <a href="news-detail.html?id=${news.id}" class="news-link">
                    Batafsil <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        return card;
    }

    updateEmployeesSection() {
        const employeesGrid = document.querySelector('.employees-grid');
        if (!employeesGrid) return;

        employeesGrid.innerHTML = '';

        this.employeesData.forEach((employee, index) => {
            const employeeCard = this.createEmployeeCard(employee, index);
            employeesGrid.appendChild(employeeCard);
        });
    }

    createEmployeeCard(employee, index) {
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.setAttribute('data-aos', 'flip-left');
        card.setAttribute('data-aos-delay', index * 100);

        card.innerHTML = `
            <div class="employee-image">
                <img src="${employee.image}" alt="${employee.name}" />
                <div class="employee-social">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-telegram-plane"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
            <div class="employee-info">
                <h3 class="employee-name">${employee.name}</h3>
                <p class="employee-role">
                    <i class="fas fa-briefcase"></i>
                    ${employee.role}
                </p>
            </div>
        `;

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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showNewsModal(newsId) {
        const news = this.newsData.find(n => n.id === newsId);
        if (!news) return;

        // Создаем модальное окно для показа полной новости
        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.innerHTML = `
            <div class="news-modal-content">
                <div class="news-modal-header">
                    <h2>${news.title}</h2>
                    <button class="news-modal-close">&times;</button>
                </div>
                <div class="news-modal-body">
                    <div class="news-modal-meta">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(news.date)}</span>
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

        // Добавляем стили для модального окна
        const style = document.createElement('style');
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
            }
            .news-modal-content {
                background: white;
                border-radius: 15px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
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
            }
            .news-modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                color: var(--text-gray);
                cursor: pointer;
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
            }
            .news-modal-content-text {
                line-height: 1.8;
                color: var(--text-dark);
                font-size: 1.1rem;
            }
        `;
        document.head.appendChild(style);

        // Закрытие модального окна
        modal.querySelector('.news-modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }
}

// ========================================
// INITIALIZE DATA SYNC
// ========================================
let dataSync;

document.addEventListener('DOMContentLoaded', () => {
    dataSync = new DataSync();
    
    // Переинициализируем AOS для новых элементов
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
});
