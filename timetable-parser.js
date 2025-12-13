// Exam Timetable Parser and Integration
// Automatically detects and schedules notifications from exam timetables

class TimetableParser {
    constructor(notificationSystem) {
        this.system = notificationSystem;
        this.supportedFormats = ['csv', 'json', 'text'];
    }

    // Parse different timetable formats
    async parseTimetable(file) {
        const fileType = this.detectFileType(file);

        try {
            switch (fileType) {
                case 'csv':
                    return await this.parseCSV(file);
                case 'json':
                    return await this.parseJSON(file);
                case 'text':
                    return await this.parseText(file);
                default:
                    throw new Error('Unsupported file format');
            }
        } catch (error) {
            console.error('Timetable parsing error:', error);
            throw error;
        }
    }

    detectFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const mimeType = file.type;

        if (extension === 'csv' || mimeType === 'text/csv') return 'csv';
        if (extension === 'json' || mimeType === 'application/json') return 'json';
        if (extension === 'txt' || mimeType === 'text/plain') return 'text';

        return 'unknown';
    }

    async parseCSV(file) {
        const text = await this.readFileAsText(file);
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const exams = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const exam = {};

            headers.forEach((header, index) => {
                exam[header] = values[index] || '';
            });

            // Map common column names
            const mappedExam = this.mapExamData(exam);
            if (mappedExam) {
                exams.push(mappedExam);
            }
        }

        return exams;
    }

    async parseJSON(file) {
        const text = await this.readFileAsText(file);
        const data = JSON.parse(text);

        // Handle different JSON structures
        let exams = [];

        if (Array.isArray(data)) {
            exams = data.map(exam => this.mapExamData(exam)).filter(Boolean);
        } else if (data.exams && Array.isArray(data.exams)) {
            exams = data.exams.map(exam => this.mapExamData(exam)).filter(Boolean);
        } else if (data.timetable && Array.isArray(data.timetable)) {
            exams = data.timetable.map(exam => this.mapExamData(exam)).filter(Boolean);
        }

        return exams;
    }

    async parseText(file) {
        const text = await this.readFileAsText(file);
        const lines = text.split('\n').filter(line => line.trim());

        const exams = [];

        for (const line of lines) {
            const exam = this.parseTextLine(line);
            if (exam) {
                exams.push(exam);
            }
        }

        return exams;
    }

    parseTextLine(line) {
        // Try to extract exam information from various text formats
        const patterns = [
            // Format: "Subject Name - DD/MM/YYYY HH:MM"
            /^(.+?)\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})/,
            // Format: "DD/MM/YYYY HH:MM - Subject Name"
            /^(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})\s*-\s*(.+)/,
            // Format: "Subject: Date Time"
            /^(.+?):\s*(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}:\d{2})/
        ];

        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                let subject, date, time;

                if (pattern === patterns[0] || pattern === patterns[2]) {
                    [, subject, date, time] = match;
                } else {
                    [, date, time, subject] = match;
                }

                return {
                    name: `${subject.trim()} Exam`,
                    subject: subject.trim(),
                    date: this.parseDate(date),
                    time: time
                };
            }
        }

        return null;
    }

    mapExamData(rawExam) {
        // Map various column names to standard format
        const mapping = {
            // Subject mappings
            subject: ['subject', 'course', 'paper', 'module', 'topic'],
            // Date mappings
            date: ['date', 'exam_date', 'examdate', 'day'],
            // Time mappings
            time: ['time', 'exam_time', 'examtime', 'hour'],
            // Name mappings
            name: ['name', 'exam_name', 'examname', 'title', 'description']
        };

        const exam = {};

        // Find subject
        exam.subject = this.findValue(rawExam, mapping.subject);
        if (!exam.subject) return null;

        // Find date
        const dateStr = this.findValue(rawExam, mapping.date);
        if (!dateStr) return null;

        exam.date = this.parseDate(dateStr);
        if (!exam.date) return null;

        // Find time
        exam.time = this.findValue(rawExam, mapping.time) || '09:00';

        // Find or generate name
        exam.name = this.findValue(rawExam, mapping.name) || `${exam.subject} Exam`;

        return exam;
    }

    findValue(obj, keys) {
        for (const key of keys) {
            if (obj[key] && obj[key].toString().trim()) {
                return obj[key].toString().trim();
            }
        }
        return null;
    }

    parseDate(dateStr) {
        // Try different date formats
        const formats = [
            // DD/MM/YYYY
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
            // MM/DD/YYYY
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
            // YYYY-MM-DD
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
            // DD-MM-YYYY
            /^(\d{1,2})-(\d{1,2})-(\d{4})$/
        ];

        for (let i = 0; i < formats.length; i++) {
            const match = dateStr.match(formats[i]);
            if (match) {
                let day, month, year;

                if (i === 0 || i === 3) { // DD/MM/YYYY or DD-MM-YYYY
                    [, day, month, year] = match;
                } else if (i === 1) { // MM/DD/YYYY (assume US format if ambiguous)
                    [, month, day, year] = match;
                } else { // YYYY-MM-DD
                    [, year, month, day] = match;
                }

                const date = new Date(year, month - 1, day);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }

        // Try native Date parsing as fallback
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    }

    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }

    // Import timetable and create notifications
    async importTimetable(file) {
        try {
            const exams = await this.parseTimetable(file);

            if (exams.length === 0) {
                throw new Error('No valid exam entries found in the timetable');
            }

            let imported = 0;
            const errors = [];

            for (const exam of exams) {
                try {
                    // Combine date and time
                    const [hours, minutes] = exam.time.split(':');
                    const examDateTime = new Date(exam.date);
                    examDateTime.setHours(parseInt(hours), parseInt(minutes));

                    // Only add future exams
                    if (examDateTime > new Date()) {
                        this.system.addExamReminder({
                            name: exam.name,
                            subject: exam.subject,
                            date: examDateTime,
                            time: exam.time
                        });
                        imported++;
                    }
                } catch (error) {
                    errors.push(`${exam.subject}: ${error.message}`);
                }
            }

            return {
                success: true,
                imported: imported,
                total: exams.length,
                errors: errors
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate sample timetable for testing
    generateSampleTimetable() {
        const subjects = [
            'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
            'Data Structures', 'Web Technology', 'Database Systems'
        ];

        const sampleExams = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 7); // Start from next week

        subjects.forEach((subject, index) => {
            const examDate = new Date(startDate);
            examDate.setDate(examDate.getDate() + (index * 2)); // Every 2 days

            sampleExams.push({
                subject: subject,
                date: examDate.toISOString().split('T')[0], // YYYY-MM-DD format
                time: '09:00',
                name: `${subject} Final Exam`
            });
        });

        return sampleExams;
    }

    // Create downloadable sample timetable
    downloadSampleTimetable(format = 'csv') {
        const sampleData = this.generateSampleTimetable();
        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
            case 'csv':
                content = 'Subject,Date,Time,Name\n' +
                    sampleData.map(exam =>
                        `${exam.subject},${exam.date},${exam.time},${exam.name}`
                    ).join('\n');
                filename = 'sample_exam_timetable.csv';
                mimeType = 'text/csv';
                break;

            case 'json':
                content = JSON.stringify({ exams: sampleData }, null, 2);
                filename = 'sample_exam_timetable.json';
                mimeType = 'application/json';
                break;

            case 'text':
                content = sampleData.map(exam =>
                    `${exam.subject} - ${exam.date} ${exam.time}`
                ).join('\n');
                filename = 'sample_exam_timetable.txt';
                mimeType = 'text/plain';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize timetable parser
window.timetableParser = new TimetableParser(window.notificationSystem);