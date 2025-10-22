// ========================================
// MAIN APPLICATION
// ========================================

class MaqomSchoolApp {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.slidesPerView = 3;
        this.autoSlideInterval = null;
        this.isTransitioning = false;
        this.isDataLoaded = false;
        this.loaderTimeout = null;
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupLoader();
        this.setupNavigation();
        this.setupSlider();
        this.setupContactForm();
        this.setupScrollEffects();
        this.setupFooter();
        this.setupResizeHandler();
        this.setupDataLoading();
        
        console.log('Maqom School App initialized successfully');
    }

    // ========================================
    // PAGE LOADER
    // ========================================
    
    setupLoader() {
        this.pageLoader = document.getElementById('pageLoader');
        if (!this.pageLoader) {
            console.warn('Page loader element not found');
            return;
        }
        
        // Set minimum loading time for better UX
        this.loaderTimeout = setTimeout(() => {
            this.hideLoader();
        }, 2000);
        
        // Listen for data loading completion
        this.setupDataLoadingListeners();
    }
    
    setupDataLoadingListeners() {
        // Listen for window load event
        window.addEventListener('load', () => {
            this.checkDataLoadingComplete();
        });
        
        // Listen for images load
        const images = document.querySelectorAll('img');
        let loadedImages = 0;
        
        if (images.length > 0) {
            images.forEach(img => {
                if (img.complete) {
                    loadedImages++;
                } else {
                    img.addEventListener('load', () => {
                        loadedImages++;
                        this.checkDataLoadingComplete();
                    });
                    img.addEventListener('error', () => {
                        loadedImages++;
                        this.checkDataLoadingComplete();
                    });
                }
            });
        }
        
        // Check if all images are already loaded
        if (loadedImages === images.length) {
            this.checkDataLoadingComplete();
        }
    }
    
    checkDataLoadingComplete() {
        // Check if data sync is complete
        if (window.DataSyncModule && window.DataSyncModule.isInitialized) {
            this.hideLoader();
        } else {
            // Wait a bit more for data loading
            setTimeout(() => {
                this.hideLoader();
            }, 1000);
        }
    }
    
    hideLoader() {
        if (this.isDataLoaded) return;
        
        this.isDataLoaded = true;
        
        if (this.loaderTimeout) {
            clearTimeout(this.loaderTimeout);
        }
        
        if (this.pageLoader) {
            this.pageLoader.classList.add('hidden');
            
            // Remove loader from DOM after animation
            setTimeout(() => {
                if (this.pageLoader) {
                    this.pageLoader.remove();
                }
            }, 800);
        }
        
        console.log('Page loader hidden');
    }
    
    showLoader() {
        if (this.pageLoader) {
            this.pageLoader.classList.remove('hidden');
        }
    }

    // ========================================
    // NAVIGATION
    // ========================================
    
    setupNavigation() {
        const navbar = document.getElementById('navbar');
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        menuToggle?.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks?.classList.toggle('active');
        });

        // Smooth scroll for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close mobile menu if open
                    navLinks?.classList.remove('active');
                    menuToggle?.classList.remove('active');
                    
                    // Smooth scroll to target
                    const headerOffset = 90;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks?.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuToggle?.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle?.classList.remove('active');
            }
        });
    }

    // ========================================
    // NEWS SLIDER
    // ========================================
    
    setupSlider() {
        const slider = document.getElementById('newsSlider');
        const prevBtn = document.getElementById('newsPrevBtn');
        const nextBtn = document.getElementById('newsNextBtn');
        const indicatorsContainer = document.getElementById('newsIndicators');
        
        if (!slider || !prevBtn || !nextBtn || !indicatorsContainer) {
            console.warn('Slider elements not found');
            return;
        }

        // Get all news cards
        const newsCards = slider.querySelectorAll('.news-card');
        if (newsCards.length === 0) {
            console.warn('No news cards found');
            return;
        }

        // Calculate slides
        this.updateSlidesPerView();
        this.totalSlides = Math.ceil(newsCards.length / this.slidesPerView);
        
        // Create indicators
        this.createSliderIndicators(indicatorsContainer);
        
        // Setup controls
        prevBtn.addEventListener('click', () => this.prevSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Setup touch/swipe support
        this.setupTouchSupport(slider);
        
        // Setup hover pause
        this.setupHoverPause(slider);
        
        // Start auto-slide
        this.startAutoSlide();
        
        // Initial update
        this.updateSlider();
    }

    updateSlidesPerView() {
        const width = window.innerWidth;
        if (width <= 768) {
            this.slidesPerView = 1;
        } else if (width <= 1024) {
            this.slidesPerView = 2;
        } else {
            this.slidesPerView = 3;
        }
    }

    createSliderIndicators(container) {
        container.innerHTML = '';
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'slider-indicator';
            indicator.setAttribute('data-slide', i);
            indicator.setAttribute('aria-label', `Slide ${i + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(i));
            container.appendChild(indicator);
        }
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : this.totalSlides - 1;
        this.updateSlider();
        this.resetAutoSlide();
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.currentSlide = this.currentSlide < this.totalSlides - 1 ? this.currentSlide + 1 : 0;
        this.updateSlider();
        this.resetAutoSlide();
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide) return;
        this.currentSlide = index;
        this.updateSlider();
        this.resetAutoSlide();
    }

    updateSlider() {
        const slider = document.getElementById('newsSlider');
        const prevBtn = document.getElementById('newsPrevBtn');
        const nextBtn = document.getElementById('newsNextBtn');
        const indicators = document.querySelectorAll('.slider-indicator');
        
        if (!slider) return;

        this.isTransitioning = true;

        // Calculate transform
        const slideWidth = 100 / this.slidesPerView;
        const translateX = -this.currentSlide * slideWidth;
        
        // Apply transform
        slider.style.transform = `translateX(${translateX}%)`;

        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        // Update button states
        if (prevBtn) {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
        }
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }

        // Reset transition flag
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    setupTouchSupport(slider) {
        let startX = 0;
        let startY = 0;
        let isDragging = false;

        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.stopAutoSlide();
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
        }, { passive: true });

        slider.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only trigger if horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            this.startAutoSlide();
        });
    }

    setupHoverPause(slider) {
        const sliderContainer = slider.closest('.news-slider-wrapper');
        if (!sliderContainer) return;
        
        sliderContainer.addEventListener('mouseenter', () => {
            this.stopAutoSlide();
        });

        sliderContainer.addEventListener('mouseleave', () => {
            this.startAutoSlide();
        });
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }

    // ========================================
    // CONTACT FORM
    // ========================================
    
    setupContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactSubmit(form);
        });
    }

    async handleContactSubmit(form) {
        const submitBtn = form.querySelector('.form-submit');
        const originalHTML = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Yuborilmoqda...</span>';
            submitBtn.disabled = true;

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Simulate API call (replace with actual API endpoint)
            await this.simulateAPICall(data);

            // Success message
            this.showNotification('Xabar muvaffaqiyatli yuborildi!', 'success');
            form.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.', 'error');
        } finally {
            // Restore button
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    }

    simulateAPICall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data:', data);
                resolve();
            }, 1500);
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#0a672b' : '#dc3545'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.8rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // ========================================
    // SCROLL EFFECTS
    // ========================================
    
    setupScrollEffects() {
        // Animate elements on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        const elements = document.querySelectorAll('.stat-card, .news-card, .employee-card, .feature-item');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // ========================================
    // FOOTER
    // ========================================
    
    setupFooter() {
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    // ========================================
    // RESIZE HANDLER
    // ========================================
    
    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const oldSlidesPerView = this.slidesPerView;
                this.updateSlidesPerView();
                
                // Recalculate if slides per view changed
                if (oldSlidesPerView !== this.slidesPerView) {
                    const slider = document.getElementById('newsSlider');
                    const newsCards = slider?.querySelectorAll('.news-card');
                    
                    if (newsCards && newsCards.length > 0) {
                        this.totalSlides = Math.ceil(newsCards.length / this.slidesPerView);
                        this.currentSlide = Math.min(this.currentSlide, this.totalSlides - 1);
                        
                        // Recreate indicators
                        const indicatorsContainer = document.getElementById('newsIndicators');
                        if (indicatorsContainer) {
                            this.createSliderIndicators(indicatorsContainer);
                        }
                        
                        this.updateSlider();
                    }
                }
            }, 250);
        });
    }

    // ========================================
    // DATA LOADING
    // ========================================
    
    async setupDataLoading() {
        try {
            console.log('setupDataLoading called');
            
            // Wait for all modules to be available
            await this.waitForModules();
            
            if (window.DataSyncModule) {
                console.log('DataSyncModule found, initializing...');
                await window.DataSyncModule.initialize();
                console.log('Data loading initialized successfully');
                
                // Mark data as loaded and hide loader
                this.checkDataLoadingComplete();
            } else {
                console.warn('DataSyncModule not available');
                // Hide loader even if data sync is not available
                this.checkDataLoadingComplete();
            }
        } catch (error) {
            console.error('Error initializing data loading:', error);
            // Hide loader even if there's an error
            this.checkDataLoadingComplete();
        }
    }

    async waitForModules() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            const checkModules = () => {
                attempts++;
                
                if (window.DataSyncModule && window.DataManagerModule && window.FirebaseModule && window.UtilsModule) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.warn('Some modules not loaded after 5 seconds, continuing anyway');
                    resolve(); // Continue even if some modules are missing
                } else {
                    setTimeout(checkModules, 100);
                }
            };
            
            checkModules();
        });
    }
}

// ========================================
// ANIMATIONS
// ========================================

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

const app = new MaqomSchoolApp();

// Make app globally available for other modules
window.app = app;