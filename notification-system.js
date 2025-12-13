// Smart Notification System for LastMinuteHub
// Helps students stay organized with exam reminders and academic alerts

class SmartNotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('lmh_notifications') || '[]');
        this.settings = JSON.parse(localStorage.getItem('lmh_notification_settings') || JSON.stringify({
            enabled: true,
            browserNotifications: false,
            nightMode: true, // Don't send notifications between 10 PM - 7 AM
            reminderIntervals: [7, 3, 1, 0.04], // days (0.04 = 1 hour)
            subjects: []
        }));
        this.userName = localStorage.getItem('userName') || 'Student';
        this.checkInterval = null;

        this.init();
    }

    async init() {
        console.log('🔔 Smart Notification System initialized');
        await this.requestNotificationPermission();
        this.startBackgroundChecker();
        this.cleanupOldNotifications();
    }

    // Request browser notification permission politely
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            // Show a friendly in-site prompt first
            this.showPermissionPrompt();
        } else if (Notification.permission === 'granted') {
            this.settings.browserNotifications = true;
            this.saveSettings();
        }
    }

    showPermissionPrompt() {
        const promptHtml = `
      <div id="notification-permission-prompt" class="notification-prompt">
        <div class="prompt-content">
          <h4>📚 Stay on Top of Your Studies!</h4>
          <p>Get timely reminders for exams and important deadlines. We'll help you never miss anything important!</p>
          <div class="prompt-buttons">
            <button id="enable-notifications" class="btn btn-primary">Enable Notifications</button>
            <button id="maybe-later" class="btn btn-secondary">Maybe Later</button>
          </div>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', promptHtml);

        document.getElementById('enable-notifications').addEventListener('click', async () => {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.settings.browserNotifications = true;
                this.saveSettings();
                this.showSuccessMessage('🎉 Great! You\'ll now receive helpful study reminders.');
            }
            document.getElementById('notification-permission-prompt').remove();
        });

        document.getElementById('maybe-later').addEventListener('click', () => {
            document.getElementById('notification-permission-prompt').remove();
        });
    }

    // Add exam reminder
    addExamReminder(examData) {
        const exam = {
            id: Date.now(),
            name: examData.name,
            subject: examData.subject,
            date: new Date(examData.date),
            time: examData.time,
            type: 'exam',
            created: new Date(),
            reminders: this.settings.reminderIntervals.map(days => ({
                days: days,
                sent: false,
                scheduledTime: new Date(new Date(examData.date).getTime() - (days * 24 * 60 * 60 * 1000))
            }))
        };

        this.notifications.push(exam);
        this.saveNotifications();

        this.showSuccessMessage(`📅 Exam reminder set for ${exam.name}! You'll get alerts 7 days, 3 days, 1 day, and 1 hour before.`);
        return exam.id;
    }

    // Add academic calendar event
    addCalendarEvent(eventData) {
        const event = {
            id: Date.now(),
            name: eventData.name,
            type: eventData.type, // 'semester-start', 'internal-exam', 'holiday', etc.
            date: new Date(eventData.date),
            description: eventData.description || '',
            created: new Date(),
            reminders: [{
                days: 1,
                sent: false,
                scheduledTime: new Date(new Date(eventData.date).getTime() - (24 * 60 * 60 * 1000))
            }]
        };

        this.notifications.push(event);
        this.saveNotifications();
        return event.id;
    }

    // Background checker that runs every minute
    startBackgroundChecker() {
        this.checkInterval = setInterval(() => {
            this.checkPendingNotifications();
        }, 60000); // Check every minute

        // Also check immediately
        this.checkPendingNotifications();
    }

    checkPendingNotifications() {
        if (!this.settings.enabled) return;

        const now = new Date();

        // Check if it's night time (10 PM - 7 AM)
        if (this.settings.nightMode) {
            const hour = now.getHours();
            if (hour >= 22 || hour < 7) return;
        }

        this.notifications.forEach(notification => {
            notification.reminders.forEach(reminder => {
                if (!reminder.sent && now >= reminder.scheduledTime) {
                    this.sendNotification(notification, reminder);
                    reminder.sent = true;
                }
            });
        });

        this.saveNotifications();
    }

    sendNotification(notification, reminder) {
        const message = this.generateNotificationMessage(notification, reminder);

        // Try browser notification first
        if (this.settings.browserNotifications && Notification.permission === 'granted') {
            new Notification(`📚 ${notification.name}`, {
                body: message,
                icon: 'assets/logo.png',
                badge: 'assets/logo.png',
                tag: `exam-${notification.id}`,
                requireInteraction: false
            });
        }

        // Always show in-site notification as backup
        this.showInSiteNotification(notification, message);

        console.log(`🔔 Notification sent: ${message}`);
    }

    generateNotificationMessage(notification, reminder) {
        const studentName = this.userName !== 'Student' ? this.userName : 'there';
        const timeLeft = this.getTimeLeftText(reminder.days);

        const messages = {
            exam: {
                7: `Hey ${studentName}! 📚 Your ${notification.subject} exam "${notification.name}" is in 1 week. Time to start preparing! 💪`,
                3: `Hi ${studentName}! ⏰ Only 3 days left for your ${notification.subject} exam. Focus mode activated! 🎯`,
                1: `${studentName}, tomorrow is your ${notification.subject} exam! 📖 Final revision time - you've got this! ✨`,
                0.04: `${studentName}! 🚨 Your ${notification.subject} exam starts in 1 hour. Take a deep breath and give your best! 🌟`
            },
            default: `📅 Reminder: ${notification.name} is ${timeLeft}. Stay organized! 📚`
        };

        if (notification.type === 'exam' && messages.exam[reminder.days]) {
            return messages.exam[reminder.days];
        }

        return messages.default;
    }

    getTimeLeftText(days) {
        if (days >= 1) {
            return `in ${Math.ceil(days)} day${days > 1 ? 's' : ''}`;
        } else {
            const hours = Math.ceil(days * 24);
            return `in ${hours} hour${hours > 1 ? 's' : ''}`;
        }
    }

    showInSiteNotification(notification, message) {
        const notificationEl = document.createElement('div');
        notificationEl.className = 'in-site-notification';
        notificationEl.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">📚</div>
        <div class="notification-text">
          <strong>${notification.name}</strong>
          <p>${message}</p>
        </div>
        <button class="notification-close">×</button>
      </div>
    `;

        document.body.appendChild(notificationEl);

        // Auto remove after 8 seconds
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.remove();
            }
        }, 8000);

        // Manual close
        notificationEl.querySelector('.notification-close').addEventListener('click', () => {
            notificationEl.remove();
        });

        // Add to notification history
        this.addToNotificationHistory(notification, message);
    }

    addToNotificationHistory(notification, message) {
        const history = JSON.parse(localStorage.getItem('lmh_notification_history') || '[]');
        history.unshift({
            id: Date.now(),
            notification: notification.name,
            message: message,
            timestamp: new Date(),
            read: false
        });

        // Keep only last 50 notifications
        if (history.length > 50) {
            history.splice(50);
        }

        localStorage.setItem('lmh_notification_history', JSON.stringify(history));
    }

    // Get upcoming events for calendar display
    getUpcomingEvents(days = 30) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

        return this.notifications
            .filter(n => n.date >= now && n.date <= futureDate)
            .sort((a, b) => a.date - b.date);
    }

    // Clean up old notifications
    cleanupOldNotifications() {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        this.notifications = this.notifications.filter(n => n.date >= oneWeekAgo);
        this.saveNotifications();
    }

    // Settings management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('lmh_notification_settings', JSON.stringify(this.settings));
    }

    saveNotifications() {
        localStorage.setItem('lmh_notifications', JSON.stringify(this.notifications));
    }

    showSuccessMessage(message) {
        const successEl = document.createElement('div');
        successEl.className = 'success-message';
        successEl.textContent = message;
        document.body.appendChild(successEl);

        setTimeout(() => successEl.remove(), 4000);
    }

    // Public API methods
    disable() {
        this.settings.enabled = false;
        this.saveSettings();
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }

    enable() {
        this.settings.enabled = true;
        this.saveSettings();
        this.startBackgroundChecker();
    }

    // Remove specific notification
    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
    }

    // Get notification statistics
    getStats() {
        const total = this.notifications.length;
        const upcoming = this.getUpcomingEvents().length;
        const history = JSON.parse(localStorage.getItem('lmh_notification_history') || '[]');

        return {
            totalReminders: total,
            upcomingEvents: upcoming,
            notificationsSent: history.length,
            enabled: this.settings.enabled
        };
    }
}

// Initialize the notification system
window.notificationSystem = new SmartNotificationSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartNotificationSystem;
}