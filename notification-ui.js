// Notification System UI Components
// Provides user interface for managing exam reminders and notifications

class NotificationUI {
    constructor(notificationSystem) {
        this.system = notificationSystem;
        this.init();
    }

    init() {
        this.injectCSS();
        this.createNotificationCenter();
    }

    // Inject CSS styles for notification components
    injectCSS() {
        if (document.getElementById('notification-ui-styles')) return;

        const css = `
      /* Notification Permission Prompt */
      .notification-prompt {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }
      
      .prompt-content {
        background: var(--card-bg);
        color: var(--text-color);
        padding: 30px;
        border-radius: 12px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
      
      .prompt-content h4 {
        margin: 0 0 15px 0;
        color: var(--section-title);
        font-size: 20px;
      }
      
      .prompt-content p {
        margin: 0 0 20px 0;
        line-height: 1.5;
        opacity: 0.9;
      }
      
      .prompt-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      
      .btn-primary {
        background: var(--btn-bg);
        color: var(--btn-text);
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
      }
      
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      .btn-secondary {
        background: transparent;
        color: var(--text-color);
        border: 1px solid var(--border-color);
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .btn-secondary:hover {
        background: var(--input-bg);
      }
      
      /* In-Site Notifications */
      .in-site-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        color: var(--text-color);
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        max-width: 350px;
        z-index: 9999;
        animation: slideInRight 0.4s ease;
        border-left: 4px solid var(--btn-bg);
      }
      
      .notification-content {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        gap: 12px;
      }
      
      .notification-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .notification-text {
        flex: 1;
      }
      
      .notification-text strong {
        display: block;
        margin-bottom: 4px;
        color: var(--section-title);
        font-size: 14px;
      }
      
      .notification-text p {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        opacity: 0.9;
      }
      
      .notification-close {
        background: none;
        border: none;
        color: var(--text-color);
        font-size: 18px;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.3s;
        flex-shrink: 0;
      }
      
      .notification-close:hover {
        opacity: 1;
      }
      
      /* Success Messages */
      .success-message {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        animation: slideInUp 0.4s ease;
      }
      
      /* Notification Center Button */
      .notification-center-btn {
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: var(--btn-bg);
        color: var(--btn-text);
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transition: all 0.3s;
      }
      
      .notification-center-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
      }
      
      .notification-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
      
      /* Notification Center Panel */
      .notification-center {
        position: fixed;
        top: 0;
        right: -400px;
        width: 380px;
        height: 100vh;
        background: var(--card-bg);
        color: var(--text-color);
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        transition: right 0.3s ease;
        overflow-y: auto;
      }
      
      .notification-center.open {
        right: 0;
      }
      
      .notification-center-header {
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .notification-center-header h3 {
        margin: 0;
        color: var(--section-title);
      }
      
      .close-center {
        background: none;
        border: none;
        color: var(--text-color);
        font-size: 24px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.3s;
      }
      
      .close-center:hover {
        opacity: 1;
      }
      
      .notification-tabs {
        display: flex;
        border-bottom: 1px solid var(--border-color);
      }
      
      .notification-tab {
        flex: 1;
        padding: 12px;
        background: none;
        border: none;
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s;
        font-size: 14px;
      }
      
      .notification-tab.active {
        background: var(--btn-bg);
        color: var(--btn-text);
      }
      
      .notification-list {
        padding: 15px;
      }
      
      .notification-item {
        background: var(--input-bg);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        border-left: 3px solid var(--btn-bg);
        transition: all 0.3s;
      }
      
      .notification-item:hover {
        transform: translateX(5px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .notification-item h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: var(--section-title);
      }
      
      .notification-item p {
        margin: 0 0 8px 0;
        font-size: 13px;
        opacity: 0.8;
      }
      
      .notification-item .date {
        font-size: 12px;
        color: var(--btn-bg);
        font-weight: 600;
      }
      
      .add-reminder-form {
        padding: 20px;
        border-top: 1px solid var(--border-color);
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-color);
      }
      
      .form-group input,
      .form-group select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--input-bg);
        color: var(--text-color);
        font-size: 14px;
      }
      
      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: var(--btn-bg);
        box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1);
      }
      
      .add-reminder-btn {
        width: 100%;
        background: var(--btn-bg);
        color: var(--btn-text);
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
      }
      
      .add-reminder-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideInUp {
        from { transform: translate(-50%, 100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
      
      /* Mobile Responsive */
      @media (max-width: 768px) {
        .notification-center {
          width: 100%;
          right: -100%;
        }
        
        .in-site-notification {
          left: 10px;
          right: 10px;
          max-width: none;
        }
        
        .notification-center-btn {
          bottom: 80px;
          right: 15px;
        }
      }
    `;

        const style = document.createElement('style');
        style.id = 'notification-ui-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Create notification center UI
    createNotificationCenter() {
        // Add notification center button
        const centerBtn = document.createElement('button');
        centerBtn.className = 'notification-center-btn';
        centerBtn.innerHTML = '🔔';
        centerBtn.title = 'Notification Center';

        // Add badge for unread notifications
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.style.display = 'none';
        centerBtn.appendChild(badge);

        document.body.appendChild(centerBtn);

        // Create notification center panel
        const centerPanel = document.createElement('div');
        centerPanel.className = 'notification-center';
        centerPanel.innerHTML = `
      <div class="notification-center-header">
        <h3>📚 Study Reminders</h3>
        <button class="close-center">×</button>
      </div>
      
      <div class="notification-tabs">
        <button class="notification-tab active" data-tab="upcoming">Upcoming</button>
        <button class="notification-tab" data-tab="add">Add Reminder</button>
        <button class="notification-tab" data-tab="settings">Settings</button>
      </div>
      
      <div class="notification-content-area">
        <div id="upcoming-tab" class="tab-content">
          <div class="notification-list" id="upcoming-list"></div>
        </div>
        
        <div id="add-tab" class="tab-content" style="display: none;">
          <div class="add-reminder-form">
            <div class="form-group">
              <label for="exam-name">Exam Name</label>
              <input type="text" id="exam-name" placeholder="e.g., Mid-term Exam">
            </div>
            <div class="form-group">
              <label for="exam-subject">Subject</label>
              <select id="exam-subject">
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Web Technology">Web Technology</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="exam-date">Exam Date</label>
              <input type="date" id="exam-date">
            </div>
            <div class="form-group">
              <label for="exam-time">Exam Time</label>
              <input type="time" id="exam-time" value="09:00">
            </div>
            <button class="add-reminder-btn" id="add-reminder">📅 Add Reminder</button>
          </div>
        </div>
        
        <div id="settings-tab" class="tab-content" style="display: none;">
          <div class="add-reminder-form">
            <div class="form-group">
              <label>
                <input type="checkbox" id="enable-notifications"> Enable Notifications
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="night-mode"> Quiet Hours (10 PM - 7 AM)
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" id="browser-notifications"> Browser Notifications
              </label>
            </div>
            <button class="add-reminder-btn" id="save-settings">💾 Save Settings</button>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(centerPanel);

        // Event listeners
        this.setupEventListeners(centerBtn, centerPanel);
        this.updateUpcomingList();
        this.updateBadge();
    }

    setupEventListeners(centerBtn, centerPanel) {
        // Toggle notification center
        centerBtn.addEventListener('click', () => {
            centerPanel.classList.toggle('open');
        });

        // Close notification center
        centerPanel.querySelector('.close-center').addEventListener('click', () => {
            centerPanel.classList.remove('open');
        });

        // Tab switching
        centerPanel.querySelectorAll('.notification-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Add reminder form
        document.getElementById('add-reminder').addEventListener('click', () => {
            this.handleAddReminder();
        });

        // Settings form
        document.getElementById('save-settings').addEventListener('click', () => {
            this.handleSaveSettings();
        });

        // Load current settings
        this.loadCurrentSettings();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.notification-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';

        if (tabName === 'upcoming') {
            this.updateUpcomingList();
        }
    }

    handleAddReminder() {
        const name = document.getElementById('exam-name').value.trim();
        const subject = document.getElementById('exam-subject').value;
        const date = document.getElementById('exam-date').value;
        const time = document.getElementById('exam-time').value;

        if (!name || !subject || !date) {
            alert('Please fill in all required fields!');
            return;
        }

        const examDateTime = new Date(`${date}T${time}`);
        if (examDateTime <= new Date()) {
            alert('Please select a future date and time!');
            return;
        }

        this.system.addExamReminder({
            name: name,
            subject: subject,
            date: examDateTime,
            time: time
        });

        // Clear form
        document.getElementById('exam-name').value = '';
        document.getElementById('exam-subject').value = '';
        document.getElementById('exam-date').value = '';
        document.getElementById('exam-time').value = '09:00';

        // Switch to upcoming tab
        this.switchTab('upcoming');
    }

    handleSaveSettings() {
        const settings = {
            enabled: document.getElementById('enable-notifications').checked,
            nightMode: document.getElementById('night-mode').checked,
            browserNotifications: document.getElementById('browser-notifications').checked
        };

        this.system.updateSettings(settings);

        // Show success message
        this.system.showSuccessMessage('⚙️ Settings saved successfully!');
    }

    loadCurrentSettings() {
        const settings = this.system.settings;
        document.getElementById('enable-notifications').checked = settings.enabled;
        document.getElementById('night-mode').checked = settings.nightMode;
        document.getElementById('browser-notifications').checked = settings.browserNotifications;
    }

    updateUpcomingList() {
        const upcomingEvents = this.system.getUpcomingEvents();
        const listEl = document.getElementById('upcoming-list');

        if (upcomingEvents.length === 0) {
            listEl.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; opacity: 0.7;">
          <div style="font-size: 48px; margin-bottom: 15px;">📅</div>
          <p>No upcoming exams or events.</p>
          <p style="font-size: 13px;">Add a reminder to get started!</p>
        </div>
      `;
            return;
        }

        listEl.innerHTML = upcomingEvents.map(event => {
            const timeLeft = this.getTimeUntil(event.date);
            return `
        <div class="notification-item">
          <h4>${event.name}</h4>
          <p><strong>Subject:</strong> ${event.subject || 'General'}</p>
          <p><strong>Time Left:</strong> ${timeLeft}</p>
          <div class="date">${this.formatDate(event.date)}</div>
        </div>
      `;
        }).join('');
    }

    updateBadge() {
        const upcomingCount = this.system.getUpcomingEvents(7).length; // Next 7 days
        const badge = document.querySelector('.notification-badge');

        if (upcomingCount > 0) {
            badge.textContent = upcomingCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    getTimeUntil(date) {
        const now = new Date();
        const diff = date - now;

        if (diff < 0) return 'Past due';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize UI when notification system is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.notificationSystem) {
        window.notificationUI = new NotificationUI(window.notificationSystem);
    }
});