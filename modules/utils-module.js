// ========================================
// UTILITIES MODULE
// ========================================

class UtilsModule {
    constructor() {
        this.config = window.AppConfig;
    }

    // Date utilities
    formatDate(dateString, locale = 'uz-UZ') {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateTime(dateString, locale = 'uz-UZ') {
        const date = new Date(dateString);
        return date.toLocaleString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    getCurrentDateTime() {
        return new Date().toISOString();
    }

    // String utilities
    truncateText(text, maxLength = 100) {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Validation utilities
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
        return phoneRegex.test(phone);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // File utilities
    validateFileSize(file, maxSize = null) {
        const max = maxSize || this.config.storage.maxFileSize;
        return file.size <= max;
    }

    validateFileType(file, allowedTypes = null) {
        const types = allowedTypes || this.config.storage.allowedImageTypes;
        return types.includes(file.type);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    // Image utilities
    createImagePreview(file, maxWidth = 200, maxHeight = 150) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let { width, height } = img;
                    
                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Animation utilities
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = performance.now();
        
        function animate(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    fadeOut(element, duration = 300) {
        let start = performance.now();
        
        function animate(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    }

    // DOM utilities
    createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    addEventListeners(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    }

    removeEventListeners(element, events) {
        Object.entries(events).forEach(([event, handler]) => {
            element.removeEventListener(event, handler);
        });
    }

    // Storage utilities
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Network utilities
    async fetchWithTimeout(url, options = {}, timeout = null) {
        const timeoutMs = timeout || this.config.api.timeout;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async retryOperation(operation, maxAttempts = null, delay = null) {
        const attempts = maxAttempts || this.config.api.retryAttempts;
        const retryDelay = delay || this.config.api.retryDelay;
        
        for (let i = 0; i < attempts; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === attempts - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
            }
        }
    }

    // Error handling utilities
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        const errorMessage = this.getErrorMessage(error);
        this.showNotification(errorMessage, 'error');
        
        return {
            success: false,
            message: errorMessage,
            error: error
        };
    }

    getErrorMessage(error) {
        if (error.message) {
            return error.message;
        }
        
        if (typeof error === 'string') {
            return error;
        }
        
        return 'Noma\'lum xatolik yuz berdi';
    }

    // Notification utilities
    showNotification(message, type = 'info', duration = null) {
        const notificationDuration = duration || this.config.ui.toastDuration;
        
        const notification = this.createElement('div', `notification notification-${type}`);
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Добавляем стили если их нет
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    max-width: 400px;
                    animation: slideInRight 0.3s ease;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .notification-success {
                    background: #28a745;
                    color: white;
                }
                .notification-error {
                    background: #dc3545;
                    color: white;
                }
                .notification-warning {
                    background: #ffc107;
                    color: #212529;
                }
                .notification-info {
                    background: #17a2b8;
                    color: white;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 1.2rem;
                    cursor: pointer;
                    margin-left: auto;
                }
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
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Автоматическое закрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, notificationDuration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    // Debounce utility
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle utility
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Создаем глобальный экземпляр
window.UtilsModule = new UtilsModule();
