// ========================================
// SECURITY MONITORING SYSTEM
// ========================================

class SecurityMonitor {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.alertThresholds = {
            failedLogins: 5,
            suspiciousActivity: 3,
            timeWindow: 15 * 60 * 1000 // 15 minutes
        };
        this.init();
    }

    init() {
        this.loadLogs();
        this.setupEventListeners();
        this.startMonitoring();
        this.setupPeriodicChecks();
    }

    loadLogs() {
        const saved = localStorage.getItem('securityLogs');
        if (saved) {
            this.logs = JSON.parse(saved);
        }
    }

    saveLogs() {
        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        localStorage.setItem('securityLogs', JSON.stringify(this.logs));
    }

    log(event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href,
            ip: this.getClientIP()
        };

        this.logs.push(logEntry);
        this.saveLogs();

        // Check for security alerts
        this.checkSecurityAlerts(event, logEntry);
    }

    getClientIP() {
        // This is a placeholder - in production, you'd get this from your server
        return 'client-ip-placeholder';
    }

    checkSecurityAlerts(event, logEntry) {
        const recentLogs = this.getRecentLogs(this.alertThresholds.timeWindow);
        
        // Check for multiple failed logins
        const failedLogins = recentLogs.filter(log => 
            log.event === 'Failed login attempt'
        ).length;

        if (failedLogins >= this.alertThresholds.failedLogins) {
            this.triggerAlert('Multiple failed login attempts detected', {
                count: failedLogins,
                timeWindow: this.alertThresholds.timeWindow
            });
        }

        // Check for suspicious activity
        const suspiciousEvents = recentLogs.filter(log => 
            log.event === 'DevTools opened' || 
            log.event === 'Suspicious activity detected'
        ).length;

        if (suspiciousEvents >= this.alertThresholds.suspiciousActivity) {
            this.triggerAlert('Suspicious activity detected', {
                count: suspiciousEvents,
                timeWindow: this.alertThresholds.timeWindow
            });
        }
    }

    getRecentLogs(timeWindow) {
        const cutoff = Date.now() - timeWindow;
        return this.logs.filter(log => 
            new Date(log.timestamp).getTime() > cutoff
        );
    }

    triggerAlert(message, details) {
        console.warn('SECURITY ALERT:', message, details);
        
        // Log the alert
        this.log('Security Alert', {
            message: message,
            details: details
        });

        // In production, you might want to send this to a monitoring service
        // this.sendAlertToServer(message, details);
    }

    setupEventListeners() {
        // Monitor for DevTools
        let devtools = false;
        const threshold = 160;

        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools) {
                    devtools = true;
                    this.log('DevTools opened');
                }
            } else {
                devtools = false;
            }
        }, 500);

        // Monitor for suspicious keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'u') ||
                (e.ctrlKey && e.key === 's')) {
                this.log('Suspicious keyboard shortcut', {
                    key: e.key,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey
                });
            }
        });

        // Monitor for right-click
        document.addEventListener('contextmenu', (e) => {
            this.log('Right-click detected', {
                target: e.target.tagName,
                x: e.clientX,
                y: e.clientY
            });
        });

        // Monitor for page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.log('Page visibility changed', {
                hidden: document.hidden,
                visibilityState: document.visibilityState
            });
        });

        // Monitor for window focus/blur
        window.addEventListener('focus', () => {
            this.log('Window focused');
        });

        window.addEventListener('blur', () => {
            this.log('Window blurred');
        });

        // Monitor for console usage
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => {
            this.log('Console.log called', { arguments: args });
            originalLog.apply(console, args);
        };

        console.warn = (...args) => {
            this.log('Console.warn called', { arguments: args });
            originalWarn.apply(console, args);
        };

        console.error = (...args) => {
            this.log('Console.error called', { arguments: args });
            originalError.apply(console, args);
        };
    }

    startMonitoring() {
        // Log initial access
        this.log('Admin panel accessed', {
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        });

        // Monitor for iframe embedding attempts
        if (window !== window.top) {
            this.log('Potential iframe embedding detected');
        }

        // Monitor for suspicious user agents
        const userAgent = navigator.userAgent.toLowerCase();
        const suspiciousPatterns = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'
        ];

        for (const pattern of suspiciousPatterns) {
            if (userAgent.includes(pattern)) {
                this.log('Suspicious user agent detected', {
                    userAgent: navigator.userAgent,
                    pattern: pattern
                });
                break;
            }
        }
    }

    setupPeriodicChecks() {
        // Check for session timeout every minute
        setInterval(() => {
            const lastActivity = localStorage.getItem('lastActivity');
            const now = Date.now();
            const sessionTimeout = 30 * 60 * 1000; // 30 minutes

            if (lastActivity && (now - parseInt(lastActivity)) > sessionTimeout) {
                this.log('Session timeout detected');
                // Auto-logout could be implemented here
            }
        }, 60000);

        // Update last activity on user interaction
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                localStorage.setItem('lastActivity', Date.now().toString());
            }, true);
        });
    }

    getSecurityReport() {
        const now = Date.now();
        const last24Hours = now - (24 * 60 * 60 * 1000);
        const recentLogs = this.logs.filter(log => 
            new Date(log.timestamp).getTime() > last24Hours
        );

        const report = {
            totalEvents: recentLogs.length,
            failedLogins: recentLogs.filter(log => log.event === 'Failed login attempt').length,
            devToolsOpened: recentLogs.filter(log => log.event === 'DevTools opened').length,
            suspiciousActivity: recentLogs.filter(log => log.event.includes('Suspicious')).length,
            securityAlerts: recentLogs.filter(log => log.event === 'Security Alert').length,
            lastActivity: localStorage.getItem('lastActivity'),
            sessionDuration: this.getSessionDuration()
        };

        return report;
    }

    getSessionDuration() {
        const sessionStart = localStorage.getItem('sessionStart');
        if (sessionStart) {
            return Date.now() - parseInt(sessionStart);
        }
        return 0;
    }

    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('securityLogs');
    }

    // Method to send alerts to server (implement as needed)
    sendAlertToServer(message, details) {
        // Implementation would depend on your backend setup
        console.log('Alert would be sent to server:', message, details);
    }
}

// Initialize security monitor
const securityMonitor = new SecurityMonitor();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityMonitor;
} else {
    window.SecurityMonitor = SecurityMonitor;
    window.securityMonitor = securityMonitor;
}
