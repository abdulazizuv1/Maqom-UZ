// ========================================
// EMAILJS MODULE
// ========================================

class EmailJSModule {
    constructor() {
        this.initialized = false;
        this.config = null;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Загружаем EmailJS SDK
            if (typeof emailjs === 'undefined') {
                await this.loadEmailJSSDK();
            }

            this.config = window.AppConfig.emailjs;
            
            // Инициализируем EmailJS
            emailjs.init(this.config.publicKey);
            
            this.initialized = true;
            console.log('EmailJS module initialized successfully');
        } catch (error) {
            console.error('EmailJS initialization error:', error);
            throw error;
        }
    }

    async loadEmailJSSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async sendEmail(formData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const emailData = {
                user_name: formData.user_name || '',
                user_phone: formData.user_phone || '',
                user_email: formData.user_email || '',
                message: formData.message || '',
                to_email: this.config.toEmail
            };

            console.log('Sending email with data:', emailData);

            const response = await emailjs.send(
                this.config.serviceId,
                this.config.templateId,
                emailData
            );

            console.log('Email sent successfully:', response);
            return {
                success: true,
                message: 'Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog\'lanamiz.',
                response: response
            };
        } catch (error) {
            console.error('Email sending error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error),
                error: error
            };
        }
    }

    getErrorMessage(error) {
        let errorMessage = 'Xatolik yuz berdi. ';
        
        if (error.status === 400) {
            errorMessage += 'Iltimos, barcha maydonlarni to\'ldiring va qaytadan urinib ko\'ring.';
        } else if (error.status === 401) {
            errorMessage += 'Xavfsizlik xatosi. Iltimos, administrator bilan bog\'laning.';
        } else if (error.status === 403) {
            errorMessage += 'Ruxsat berilmagan. Iltimos, administrator bilan bog\'laning.';
        } else if (error.status === 429) {
            errorMessage += 'Juda ko\'p so\'rov yuborildi. Iltimos, biroz kutib qaytadan urinib ko\'ring.';
        } else {
            errorMessage += 'Iltimos, qaytadan urinib ko\'ring.';
        }
        
        return errorMessage;
    }

    validateFormData(formData) {
        const errors = [];

        if (!formData.user_name || formData.user_name.trim().length < 2) {
            errors.push('Ism kamida 2 ta belgidan iborat bo\'lishi kerak');
        }

        if (!formData.user_email || !this.isValidEmail(formData.user_email)) {
            errors.push('To\'g\'ri email manzil kiriting');
        }

        if (!formData.user_phone || formData.user_phone.trim().length < 9) {
            errors.push('Telefon raqami kamida 9 ta raqamdan iborat bo\'lishi kerak');
        }

        if (!formData.message || formData.message.trim().length < 10) {
            errors.push('Xabar kamida 10 ta belgidan iborat bo\'lishi kerak');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    formatPhoneNumber(phone) {
        // Форматирование узбекского номера телефона
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.startsWith('998')) {
            return `+${cleaned}`;
        } else if (cleaned.startsWith('8')) {
            return `+998${cleaned.substring(1)}`;
        } else if (cleaned.length === 9) {
            return `+998${cleaned}`;
        }
        
        return phone;
    }

    showToast(message, type = 'success') {
        // Создаем уведомление
        const toast = document.createElement('div');
        toast.className = `email-toast email-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Добавляем стили если их нет
        if (!document.getElementById('email-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'email-toast-styles';
            style.textContent = `
                .email-toast {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    animation: slideInRight 0.3s ease;
                    max-width: 400px;
                }
                .email-toast-success {
                    background: #28a745;
                    color: white;
                }
                .email-toast-error {
                    background: #dc3545;
                    color: white;
                }
                .email-toast-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
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

        document.body.appendChild(toast);

        // Удаляем через 5 секунд
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Создаем глобальный экземпляр
window.EmailJSModule = new EmailJSModule();
