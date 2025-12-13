// Academic Calendar - JavaScript Logic
// Manages calendar data, rendering, and interactions

class AcademicCalendar {
    constructor() {
        this.calendarData = this.initializeCalendarData();
        this.currentYear = 2024;
        this.init();
    }

    // Initialize the calendar system
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderCalendars();
            this.hideLoadingState();
        });
    }

    // Comprehensive academic calendar data for 2024-25
    initializeCalendarData() {
        return {
            // September 2024
            "2024-09": {
                monthName: "September 2024",
                events: [
                    { date: 1, title: "Commencement of Classes", type: "feedback", description: "New academic year begins" },
                    { date: 5, title: "Teacher's Day", type: "holiday", description: "National holiday celebrating educators" },
                    { date: 15, title: "Course Registration Deadline", type: "feedback", description: "Last date for course enrollment" },
                    { date: 20, title: "First Internal Assessment", type: "exam", description: "IA-1 for all subjects" },
                    { date: 25, title: "Library Orientation", type: "feedback", description: "Introduction to library resources" }
                ]
            },
            // October 2024
            "2024-10": {
                monthName: "October 2024",
                events: [
                    { date: 2, title: "Gandhi Jayanti", type: "holiday", description: "National holiday" },
                    { date: 10, title: "Mid-Semester Break Begins", type: "holiday", description: "One week break" },
                    { date: 17, title: "Classes Resume", type: "feedback", description: "Mid-semester break ends" },
                    { date: 24, title: "Diwali Celebration", type: "holiday", description: "Festival of lights" },
                    { date: 30, title: "Project Proposal Submission", type: "feedback", description: "Final year project proposals due" }
                ]
            },
            // November 2024
            "2024-11": {
                monthName: "November 2024",
                events: [
                    { date: 1, title: "Diwali Holiday", type: "holiday", description: "Extended Diwali celebration" },
                    { date: 8, title: "Second Internal Assessment", type: "exam", description: "IA-2 for all subjects" },
                    { date: 15, title: "Attendance Display", type: "marks", description: "Mid-semester attendance published" },
                    { date: 20, title: "Technical Fest Begins", type: "feedback", description: "Annual technical festival" },
                    { date: 25, title: "Industry Expert Lectures", type: "feedback", description: "Guest lectures by industry professionals" }
                ]
            },
            // December 2024
            "2024-12": {
                monthName: "December 2024",
                events: [
                    { date: 5, title: "Third Internal Assessment", type: "exam", description: "IA-3 for all subjects" },
                    { date: 12, title: "Internal Marks Display", type: "marks", description: "All internal assessment marks published" },
                    { date: 20, title: "Winter Break Begins", type: "holiday", description: "Winter vacation starts" },
                    { date: 25, title: "Christmas Day", type: "holiday", description: "Christmas celebration" },
                    { date: 31, title: "New Year's Eve", type: "holiday", description: "Year-end celebration" }
                ]
            },
            // January 2025
            "2025-01": {
                monthName: "January 2025",
                events: [
                    { date: 1, title: "New Year's Day", type: "holiday", description: "New Year celebration" },
                    { date: 8, title: "Classes Resume", type: "feedback", description: "Winter break ends" },
                    { date: 15, title: "Semester Exam Registration", type: "feedback", description: "End semester exam registration opens" },
                    { date: 26, title: "Republic Day", type: "holiday", description: "National holiday" },
                    { date: 30, title: "Course Feedback Collection", type: "feedback", description: "Student feedback for courses" }
                ]
            },
            // February 2025
            "2025-02": {
                monthName: "February 2025",
                events: [
                    { date: 5, title: "Practical Exams Begin", type: "exam", description: "Laboratory and practical assessments" },
                    { date: 12, title: "Project Presentations", type: "feedback", description: "Final year project presentations" },
                    { date: 18, title: "Practical Exam Results", type: "marks", description: "Practical exam marks published" },
                    { date: 25, title: "Study Leave Begins", type: "feedback", description: "Preparation time for end semester exams" }
                ]
            },
            // March 2025
            "2025-03": {
                monthName: "March 2025",
                events: [
                    { date: 3, title: "End Semester Exams Begin", type: "exam", description: "Final theory examinations start" },
                    { date: 8, title: "International Women's Day", type: "feedback", description: "Celebrating women's achievements" },
                    { date: 15, title: "Holi Celebration", type: "holiday", description: "Festival of colors" },
                    { date: 25, title: "End Semester Exams End", type: "exam", description: "Final theory examinations conclude" },
                    { date: 30, title: "Summer Break Begins", type: "holiday", description: "Semester break starts" }
                ]
            },
            // April 2025
            "2025-04": {
                monthName: "April 2025",
                events: [
                    { date: 10, title: "Semester Results Published", type: "marks", description: "End semester exam results announced" },
                    { date: 15, title: "Re-evaluation Applications", type: "feedback", description: "Last date for re-evaluation requests" },
                    { date: 20, title: "Summer Internship Begins", type: "feedback", description: "Industrial training starts" },
                    { date: 25, title: "Next Semester Registration", type: "feedback", description: "Course registration for next semester" }
                ]
            }
        };
    }

    // Render all calendar months
    renderCalendars() {
        const container = document.getElementById('calendar-container');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.calendarData).forEach(([monthKey, monthData]) => {
            const monthSection = this.createMonthSection(monthKey, monthData);
            container.appendChild(monthSection);
        });
    }

    // Create a complete month section with calendar and events
    createMonthSection(monthKey, monthData) {
        const section = document.createElement('section');
        section.className = 'calendar-month';
        section.id = `month-${monthKey}`;

        const [year, month] = monthKey.split('-').map(Number);

        section.innerHTML = `
      <div class="month-header">
        <h3>${monthData.monthName}</h3>
      </div>
      <div class="month-content">
        <div class="calendar-grid-container">
          ${this.generateCalendarGrid(year, month, monthData.events)}
        </div>
        <div class="events-panel">
          <h4>📋 Events This Month</h4>
          <div class="events-list" id="events-${monthKey}">
            ${this.generateEventsList(monthData.events, monthKey)}
          </div>
        </div>
      </div>
    `;

        return section;
    }

    // Generate calendar grid for a specific month
    generateCalendarGrid(year, month, events) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Create events map for quick lookup
        const eventsMap = {};
        events.forEach(event => {
            eventsMap[event.date] = event;
        });

        let gridHTML = `
      <div class="calendar-grid">
        <div class="calendar-header-row">
          <div class="day-header">Sun</div>
          <div class="day-header">Mon</div>
          <div class="day-header">Tue</div>
          <div class="day-header">Wed</div>
          <div class="day-header">Thu</div>
          <div class="day-header">Fri</div>
          <div class="day-header">Sat</div>
        </div>
        <div class="calendar-body">
    `;

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            gridHTML += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const event = eventsMap[day];
            const hasEvent = event ? 'has-event' : '';
            const eventType = event ? event.type : '';
            const eventTitle = event ? event.title : '';

            gridHTML += `
        <div class="calendar-day ${hasEvent} ${eventType}" 
             data-date="${day}" 
             data-month="${year}-${month.toString().padStart(2, '0')}"
             title="${eventTitle}"
             onclick="academicCalendar.highlightEvent('${year}-${month.toString().padStart(2, '0')}', ${day})">
          <span class="day-number">${day}</span>
          ${event ? `<div class="event-indicator ${event.type}"></div>` : ''}
        </div>
      `;
        }

        gridHTML += `
        </div>
      </div>
    `;

        return gridHTML;
    }

    // Generate events list for the sidebar
    generateEventsList(events, monthKey) {
        return events.map(event => `
      <div class="event-item ${event.type}" id="event-${monthKey}-${event.date}">
        <div class="event-date">
          <span class="event-day">${event.date}</span>
          <span class="event-suffix">${this.getDateSuffix(event.date)}</span>
        </div>
        <div class="event-details">
          <h5 class="event-title">${event.title}</h5>
          <p class="event-description">${event.description}</p>
          <span class="event-type-badge ${event.type}">${this.getEventTypeLabel(event.type)}</span>
        </div>
      </div>
    `).join('');
    }

    // Get ordinal suffix for dates (1st, 2nd, 3rd, etc.)
    getDateSuffix(day) {
        if (day >= 11 && day <= 13) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    // Get human-readable event type labels
    getEventTypeLabel(type) {
        const labels = {
            'holiday': '🔴 Holiday',
            'exam': '🟢 Exam',
            'marks': '🔵 Marks',
            'feedback': '🟡 Event'
        };
        return labels[type] || '📅 Event';
    }

    // Highlight corresponding event when calendar date is clicked
    highlightEvent(monthKey, day) {
        // Remove previous highlights
        document.querySelectorAll('.event-item.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });

        // Highlight the clicked event
        const eventElement = document.getElementById(`event-${monthKey}-${day}`);
        if (eventElement) {
            eventElement.classList.add('highlighted');

            // Smooth scroll to the event
            eventElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Show feedback message
            this.showFeedbackMessage(`📅 Viewing: ${eventElement.querySelector('.event-title').textContent}`);
        }
    }

    // Show feedback message
    showFeedbackMessage(message) {
        const feedback = document.createElement('div');
        feedback.className = 'calendar-feedback';
        feedback.textContent = message;

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }

    // Hide loading state
    hideLoadingState() {
        const loadingEl = document.getElementById('calendar-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    // Get events for a specific month (utility function)
    getEventsForMonth(monthKey) {
        return this.calendarData[monthKey]?.events || [];
    }

    // Get all upcoming events (utility function)
    getUpcomingEvents(limit = 5) {
        const today = new Date();
        const allEvents = [];

        Object.entries(this.calendarData).forEach(([monthKey, monthData]) => {
            const [year, month] = monthKey.split('-').map(Number);
            monthData.events.forEach(event => {
                const eventDate = new Date(year, month - 1, event.date);
                if (eventDate >= today) {
                    allEvents.push({
                        ...event,
                        fullDate: eventDate,
                        monthKey: monthKey
                    });
                }
            });
        });

        return allEvents
            .sort((a, b) => a.fullDate - b.fullDate)
            .slice(0, limit);
    }

    // Search events by keyword (utility function)
    searchEvents(keyword) {
        const results = [];
        const searchTerm = keyword.toLowerCase();

        Object.entries(this.calendarData).forEach(([monthKey, monthData]) => {
            monthData.events.forEach(event => {
                if (event.title.toLowerCase().includes(searchTerm) ||
                    event.description.toLowerCase().includes(searchTerm)) {
                    results.push({
                        ...event,
                        monthKey: monthKey,
                        monthName: monthData.monthName
                    });
                }
            });
        });

        return results;
    }
}

// Initialize the Academic Calendar
const academicCalendar = new AcademicCalendar();

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AcademicCalendar;
}