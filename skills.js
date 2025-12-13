// Skill Development Hub - JavaScript Logic
// Manages skill categories, data, and dynamic rendering

class SkillDevelopmentHub {
    constructor() {
        this.skillsData = this.initializeSkillsData();
        this.init();
    }

    // Initialize the skills hub
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.renderSkillCategories();
            this.hideLoadingState();
        });
    }

    // Comprehensive skills data organized by categories
    initializeSkillsData() {
        return {
            "Programming & CS Fundamentals": {
                icon: "💻",
                description: "Master programming languages and computer science concepts",
                skills: [
                    {
                        name: "Python Programming",
                        description: "Learn Python from basics to advanced concepts",
                        link: "https://www.codecademy.com/learn/learn-python-3",
                        tags: ["🔥 Popular", "Beginner Friendly"],
                        platform: "Codecademy"
                    },
                    {
                        name: "Java Programming",
                        description: "Complete Java development course",
                        link: "https://www.oracle.com/java/technologies/javase/codecademy.html",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "Oracle"
                    },
                    {
                        name: "Data Structures & Algorithms",
                        description: "Master DSA for coding interviews",
                        link: "https://www.geeksforgeeks.org/data-structures/",
                        tags: ["⭐ Recommended for Placements", "🔥 Popular"],
                        platform: "GeeksforGeeks"
                    },
                    {
                        name: "C++ Programming",
                        description: "Learn C++ for competitive programming",
                        link: "https://www.learncpp.com/",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "LearnCpp"
                    },
                    {
                        name: "Object-Oriented Programming",
                        description: "Understand OOP concepts with practical examples",
                        link: "https://www.coursera.org/learn/object-oriented-programming",
                        tags: ["Beginner Friendly"],
                        platform: "Coursera"
                    },
                    {
                        name: "System Design Basics",
                        description: "Learn how to design scalable systems",
                        link: "https://www.educative.io/courses/grokking-the-system-design-interview",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "Educative"
                    }
                ]
            },
            "Web Development": {
                icon: "🌐",
                description: "Build modern websites and web applications",
                skills: [
                    {
                        name: "HTML & CSS Fundamentals",
                        description: "Master the building blocks of web development",
                        link: "https://www.freecodecamp.org/learn/responsive-web-design/",
                        tags: ["Beginner Friendly", "🔥 Popular"],
                        platform: "freeCodeCamp"
                    },
                    {
                        name: "JavaScript Essentials",
                        description: "Learn modern JavaScript for web development",
                        link: "https://javascript.info/",
                        tags: ["🔥 Popular", "⭐ Recommended for Placements"],
                        platform: "JavaScript.info"
                    },
                    {
                        name: "React.js Development",
                        description: "Build interactive UIs with React",
                        link: "https://reactjs.org/tutorial/tutorial.html",
                        tags: ["⭐ Recommended for Placements", "🔥 Popular"],
                        platform: "React Official"
                    },
                    {
                        name: "Node.js Backend",
                        description: "Server-side JavaScript development",
                        link: "https://nodejs.org/en/learn/",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "Node.js Official"
                    },
                    {
                        name: "Full Stack Web Development",
                        description: "Complete web development bootcamp",
                        link: "https://www.theodinproject.com/",
                        tags: ["🔥 Popular", "Beginner Friendly"],
                        platform: "The Odin Project"
                    },
                    {
                        name: "Bootstrap & Responsive Design",
                        description: "Create responsive websites quickly",
                        link: "https://getbootstrap.com/docs/5.3/getting-started/introduction/",
                        tags: ["Beginner Friendly"],
                        platform: "Bootstrap"
                    }
                ]
            },
            "Cybersecurity": {
                icon: "🔒",
                description: "Protect systems and learn ethical hacking",
                skills: [
                    {
                        name: "Ethical Hacking Basics",
                        description: "Learn penetration testing fundamentals",
                        link: "https://www.cybrary.it/course/ethical-hacking/",
                        tags: ["🔥 Popular", "⭐ Recommended for Placements"],
                        platform: "Cybrary"
                    },
                    {
                        name: "Network Security",
                        description: "Secure networks and understand vulnerabilities",
                        link: "https://www.coursera.org/learn/network-security",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "Coursera"
                    },
                    {
                        name: "Web Application Security",
                        description: "Secure web applications from common attacks",
                        link: "https://portswigger.net/web-security",
                        tags: ["🔥 Popular"],
                        platform: "PortSwigger"
                    },
                    {
                        name: "Cryptography Fundamentals",
                        description: "Understand encryption and security protocols",
                        link: "https://www.khanacademy.org/computing/computer-science/cryptography",
                        tags: ["Beginner Friendly"],
                        platform: "Khan Academy"
                    },
                    {
                        name: "Linux Security",
                        description: "Secure Linux systems and servers",
                        link: "https://www.edx.org/course/introduction-to-linux",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "edX"
                    }
                ]
            },
            "Data & Analytics": {
                icon: "📊",
                description: "Analyze data and extract meaningful insights",
                skills: [
                    {
                        name: "SQL Database Management",
                        description: "Master database queries and management",
                        link: "https://www.w3schools.com/sql/",
                        tags: ["⭐ Recommended for Placements", "🔥 Popular"],
                        platform: "W3Schools"
                    },
                    {
                        name: "Python for Data Science",
                        description: "Use Python for data analysis and visualization",
                        link: "https://www.kaggle.com/learn/python",
                        tags: ["🔥 Popular", "⭐ Recommended for Placements"],
                        platform: "Kaggle"
                    },
                    {
                        name: "Excel Advanced Techniques",
                        description: "Master Excel for data analysis",
                        link: "https://www.microsoft.com/en-us/education/students/excel",
                        tags: ["Beginner Friendly", "⭐ Recommended for Placements"],
                        platform: "Microsoft"
                    },
                    {
                        name: "Power BI Dashboard",
                        description: "Create interactive business dashboards",
                        link: "https://powerbi.microsoft.com/en-us/learning/",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "Microsoft"
                    },
                    {
                        name: "Google Analytics",
                        description: "Analyze website traffic and user behavior",
                        link: "https://analytics.google.com/analytics/academy/",
                        tags: ["🔥 Popular"],
                        platform: "Google"
                    },
                    {
                        name: "Tableau Visualization",
                        description: "Create stunning data visualizations",
                        link: "https://www.tableau.com/learn/training",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "Tableau"
                    }
                ]
            },
            "AI / Machine Learning": {
                icon: "🤖",
                description: "Build intelligent systems and AI applications",
                skills: [
                    {
                        name: "Machine Learning Basics",
                        description: "Introduction to ML algorithms and concepts",
                        link: "https://www.coursera.org/learn/machine-learning",
                        tags: ["🔥 Popular", "⭐ Recommended for Placements"],
                        platform: "Coursera"
                    },
                    {
                        name: "Python for AI",
                        description: "Use Python libraries for AI development",
                        link: "https://www.kaggle.com/learn/intro-to-machine-learning",
                        tags: ["🔥 Popular"],
                        platform: "Kaggle"
                    },
                    {
                        name: "Deep Learning Fundamentals",
                        description: "Neural networks and deep learning",
                        link: "https://www.deeplearning.ai/courses/",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "DeepLearning.AI"
                    },
                    {
                        name: "TensorFlow Development",
                        description: "Build ML models with TensorFlow",
                        link: "https://www.tensorflow.org/learn",
                        tags: ["🔥 Popular"],
                        platform: "TensorFlow"
                    },
                    {
                        name: "Natural Language Processing",
                        description: "Process and understand human language",
                        link: "https://www.nltk.org/book/",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "NLTK"
                    },
                    {
                        name: "Computer Vision",
                        description: "Teach computers to see and understand images",
                        link: "https://opencv.org/courses/",
                        tags: ["🔥 Popular"],
                        platform: "OpenCV"
                    }
                ]
            },
            "Placement & Career Skills": {
                icon: "🎯",
                description: "Prepare for interviews and build career skills",
                skills: [
                    {
                        name: "Coding Interview Prep",
                        description: "Practice coding problems for tech interviews",
                        link: "https://leetcode.com/",
                        tags: ["⭐ Recommended for Placements", "🔥 Popular"],
                        platform: "LeetCode"
                    },
                    {
                        name: "System Design Interview",
                        description: "Prepare for system design rounds",
                        link: "https://www.educative.io/courses/grokking-the-system-design-interview",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "Educative"
                    },
                    {
                        name: "Resume Building",
                        description: "Create ATS-friendly professional resumes",
                        link: "https://www.canva.com/resumes/",
                        tags: ["Beginner Friendly", "⭐ Recommended for Placements"],
                        platform: "Canva"
                    },
                    {
                        name: "LinkedIn Profile Optimization",
                        description: "Build a strong professional LinkedIn presence",
                        link: "https://www.linkedin.com/learning/",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "LinkedIn Learning"
                    },
                    {
                        name: "Mock Interviews",
                        description: "Practice interviews with AI and experts",
                        link: "https://www.pramp.com/",
                        tags: ["🔥 Popular", "⭐ Recommended for Placements"],
                        platform: "Pramp"
                    },
                    {
                        name: "Aptitude & Reasoning",
                        description: "Prepare for placement aptitude tests",
                        link: "https://www.indiabix.com/",
                        tags: ["⭐ Recommended for Placements"],
                        platform: "IndiaBIX"
                    },
                    {
                        name: "Communication Skills",
                        description: "Improve verbal and written communication",
                        link: "https://www.coursera.org/learn/wharton-communication-skills",
                        tags: ["Beginner Friendly", "⭐ Recommended for Placements"],
                        platform: "Coursera"
                    },
                    {
                        name: "Git & GitHub",
                        description: "Version control for collaborative development",
                        link: "https://github.com/skills/introduction-to-github",
                        tags: ["⭐ Recommended for Placements", "Beginner Friendly"],
                        platform: "GitHub"
                    }
                ]
            }
        };
    }

    // Render all skill categories
    renderSkillCategories() {
        const container = document.getElementById('skills-container');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.skillsData).forEach(([categoryName, categoryData]) => {
            const categorySection = this.createCategorySection(categoryName, categoryData);
            container.appendChild(categorySection);
        });
    }

    // Create a category section with skills
    createCategorySection(categoryName, categoryData) {
        const section = document.createElement('section');
        section.className = 'skills-category';

        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
      <h3>${categoryData.icon} ${categoryName}</h3>
      <p class="category-description">${categoryData.description}</p>
    `;

        const skillsGrid = document.createElement('div');
        skillsGrid.className = 'skills-grid';

        categoryData.skills.forEach(skill => {
            const skillCard = this.createSkillCard(skill);
            skillsGrid.appendChild(skillCard);
        });

        section.appendChild(header);
        section.appendChild(skillsGrid);

        return section;
    }

    // Create individual skill card
    createSkillCard(skill) {
        const card = document.createElement('div');
        card.className = 'skill-card';

        const tagsHtml = skill.tags.map(tag =>
            `<span class="skill-tag ${this.getTagClass(tag)}">${tag}</span>`
        ).join('');

        card.innerHTML = `
      <div class="skill-card-content">
        <div class="skill-header">
          <h4 class="skill-name">${skill.name}</h4>
          <div class="skill-tags">${tagsHtml}</div>
        </div>
        <p class="skill-description">${skill.description}</p>
        <div class="skill-footer">
          <span class="skill-platform">📚 ${skill.platform}</span>
          <button class="learn-btn" onclick="skillHub.openSkillLink('${skill.link}', '${skill.name}')">
            Learn Now →
          </button>
        </div>
      </div>
    `;

        return card;
    }

    // Get CSS class for different tag types
    getTagClass(tag) {
        if (tag.includes('⭐')) return 'tag-recommended';
        if (tag.includes('🔥')) return 'tag-popular';
        if (tag.includes('Beginner')) return 'tag-beginner';
        return 'tag-default';
    }

    // Open skill link in new tab
    openSkillLink(link, skillName) {
        // Track the click (optional analytics)
        console.log(`Opening skill: ${skillName} - ${link}`);

        // Open in new tab
        window.open(link, '_blank', 'noopener,noreferrer');

        // Optional: Show feedback message
        this.showFeedbackMessage(`Opening ${skillName}... 🚀`);
    }

    // Show feedback message
    showFeedbackMessage(message) {
        const feedback = document.createElement('div');
        feedback.className = 'skill-feedback';
        feedback.textContent = message;

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }

    // Hide loading state
    hideLoadingState() {
        const loadingEl = document.getElementById('skills-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }

    // Search skills (future enhancement)
    searchSkills(query) {
        const results = [];
        Object.entries(this.skillsData).forEach(([categoryName, categoryData]) => {
            categoryData.skills.forEach(skill => {
                if (skill.name.toLowerCase().includes(query.toLowerCase()) ||
                    skill.description.toLowerCase().includes(query.toLowerCase())) {
                    results.push({ ...skill, category: categoryName });
                }
            });
        });
        return results;
    }

    // Get skills by tag (future enhancement)
    getSkillsByTag(tag) {
        const results = [];
        Object.entries(this.skillsData).forEach(([categoryName, categoryData]) => {
            categoryData.skills.forEach(skill => {
                if (skill.tags.some(t => t.includes(tag))) {
                    results.push({ ...skill, category: categoryName });
                }
            });
        });
        return results;
    }
}

// Initialize the Skill Development Hub
const skillHub = new SkillDevelopmentHub();

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillDevelopmentHub;
}