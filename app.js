// Application Data and State
class ChallengeTracker {
    constructor() {
        this.currentDay = 1;
        this.completedDays = new Set();
        this.totalXP = 0;
        this.currentStreak = 0;
        this.totalHours = 0;
        this.notes = {};
        this.completedTasks = {};
        this.achievements = new Set();
        
        // Timer state
        this.timerState = {
            minutes: 25,
            seconds: 0,
            isRunning: false,
            totalSeconds: 1500, // 25 minutes
            remainingSeconds: 1500
        };
        
        this.timerInterval = null;
        this.currentTheme = 'system';
        
        this.loadData();
        this.initializeApp();
    }

    // Data Management
    loadData() {
        const saved = localStorage.getItem('codeChallenge');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentDay = data.currentDay || 1;
            this.completedDays = new Set(data.completedDays || []);
            this.totalXP = data.totalXP || 0;
            this.currentStreak = data.currentStreak || 0;
            this.totalHours = data.totalHours || 0;
            this.notes = data.notes || {};
            this.completedTasks = data.completedTasks || {};
            this.achievements = new Set(data.achievements || []);
            this.currentTheme = data.currentTheme || 'system';
        }
    }

    saveData() {
        const data = {
            currentDay: this.currentDay,
            completedDays: Array.from(this.completedDays),
            totalXP: this.totalXP,
            currentStreak: this.currentStreak,
            totalHours: this.totalHours,
            notes: this.notes,
            completedTasks: this.completedTasks,
            achievements: Array.from(this.achievements),
            currentTheme: this.currentTheme
        };
        localStorage.setItem('codeChallenge', JSON.stringify(data));
    }

    // App Initialization
    initializeApp() {
        this.setupNavigation();
        this.setupTimer();
        this.setupSettings();
        this.setupDailyTracker();
        this.applyTheme();
        this.updateAllViews();
    }

    // Navigation System
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav__link');
        const views = document.querySelectorAll('.view');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetView = link.dataset.view;
                
                // Update navigation
                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
                
                // Update views
                views.forEach(view => view.classList.remove('active'));
                document.getElementById(targetView).classList.add('active');
                
                // Update view content
                this.updateView(targetView);
            });
        });
    }

    // Update specific view content
    updateView(viewName) {
        switch (viewName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'daily-tracker':
                this.updateDailyTracker();
                break;
            case 'progress':
                this.updateProgress();
                break;
            case 'projects':
                this.updateProjects();
                break;
            case 'resources':
                this.updateResources();
                break;
        }
    }

    // Dashboard Updates
    updateDashboard() {
        // Update progress ring
        const progressFill = document.querySelector('.progress-ring-fill');
        const currentDaySpan = document.querySelector('.current-day');
        const progress = (this.completedDays.size / 100) * 534.07;
        
        progressFill.style.strokeDashoffset = 534.07 - progress;
        currentDaySpan.textContent = this.completedDays.size;

        // Update stats
        document.getElementById('current-xp').textContent = this.totalXP.toLocaleString();
        document.getElementById('current-level').textContent = Math.floor(this.totalXP / 1000) + 1;
        document.getElementById('current-streak').textContent = this.currentStreak;
        document.getElementById('total-hours').textContent = this.totalHours;

        // Update current phase
        const currentPhase = this.getCurrentPhase();
        document.getElementById('current-phase-name').textContent = currentPhase.name;
        document.getElementById('current-phase-description').textContent = currentPhase.topics;
        
        const phaseProgress = this.getPhaseProgress(currentPhase);
        document.getElementById('current-phase-progress').style.width = `${phaseProgress.percentage}%`;
        document.getElementById('phase-progress-current').textContent = phaseProgress.completed;
        document.getElementById('phase-progress-total').textContent = phaseProgress.total;

        // Update achievements
        this.updateRecentAchievements();
    }

    // Daily Tracker Updates
    updateDailyTracker() {
        const dayData = this.getDayData(this.currentDay);
        
        document.getElementById('tracker-current-day').textContent = this.currentDay;
        document.getElementById('daily-topic').textContent = dayData.topic;
        document.getElementById('daily-difficulty').textContent = dayData.difficulty;
        document.getElementById('daily-time').textContent = `${dayData.estimated_hours} hours`;
        document.getElementById('project-description').textContent = dayData.project;

        // Update subtopics
        const subtopicsList = document.getElementById('daily-subtopics');
        subtopicsList.innerHTML = dayData.subtopics.map(subtopic => `<li>${subtopic}</li>`).join('');

        // Update tasks
        this.updateDailyTasks();
        
        // Update complete day button
        const completeBtn = document.getElementById('complete-day');
        completeBtn.textContent = `Complete Day ${this.currentDay} 🎉`;
        completeBtn.disabled = this.completedDays.has(this.currentDay);
        
        // Update navigation buttons
        document.getElementById('prev-day').disabled = this.currentDay <= 1;
        document.getElementById('next-day').disabled = this.currentDay >= 100;

        // Load notes
        document.getElementById('daily-notes').value = this.notes[this.currentDay] || '';
    }

    updateDailyTasks() {
        const tasksList = document.getElementById('daily-tasks');
        const dayTasks = this.completedTasks[this.currentDay] || [];
        
        tasksList.innerHTML = curriculum.tasks.map((task, index) => {
            const isCompleted = dayTasks.includes(index);
            return `
                <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-index="${index}">
                    <div class="task-checkbox ${isCompleted ? 'checked' : ''}" data-task-index="${index}">
                        ${isCompleted ? '✓' : ''}
                    </div>
                    <div class="task-info">
                        <div class="task-text">${task.task}</div>
                        <div class="task-time">${task.estimated_time}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add task completion listeners
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const taskIndex = parseInt(e.target.dataset.taskIndex);
                this.toggleTask(taskIndex);
            });
        });
    }

    // Setup Daily Tracker interactions
    setupDailyTracker() {
        // Day navigation
        document.getElementById('prev-day').addEventListener('click', () => {
            if (this.currentDay > 1) {
                this.currentDay--;
                this.updateDailyTracker();
                this.saveData();
            }
        });

        document.getElementById('next-day').addEventListener('click', () => {
            if (this.currentDay < 100) {
                this.currentDay++;
                this.updateDailyTracker();
                this.saveData();
            }
        });

        // Complete day button
        document.getElementById('complete-day').addEventListener('click', () => {
            this.completeDay();
        });

        // Notes auto-save
        document.getElementById('daily-notes').addEventListener('input', (e) => {
            this.notes[this.currentDay] = e.target.value;
            this.saveData();
        });
    }

    // Task Management
    toggleTask(taskIndex) {
        if (!this.completedTasks[this.currentDay]) {
            this.completedTasks[this.currentDay] = [];
        }

        const dayTasks = this.completedTasks[this.currentDay];
        const taskCompleted = dayTasks.includes(taskIndex);

        if (taskCompleted) {
            this.completedTasks[this.currentDay] = dayTasks.filter(t => t !== taskIndex);
        } else {
            dayTasks.push(taskIndex);
            this.addXP(50); // 50 XP per task
        }

        this.updateDailyTasks();
        this.updateDashboard();
        this.saveData();
    }

    completeDay() {
        if (this.completedDays.has(this.currentDay)) return;

        this.completedDays.add(this.currentDay);
        this.addXP(200); // 200 XP for completing a day
        this.updateStreak();
        this.checkAchievements();
        
        if (this.currentDay < 100) {
            this.currentDay++;
        }
        
        this.updateAllViews();
        this.saveData();
    }

    // Timer System
    setupTimer() {
        document.getElementById('timer-start').addEventListener('click', () => {
            this.startTimer();
        });

        document.getElementById('timer-pause').addEventListener('click', () => {
            this.pauseTimer();
        });

        document.getElementById('timer-reset').addEventListener('click', () => {
            this.resetTimer();
        });
    }

    startTimer() {
        if (this.timerState.isRunning) return;

        this.timerState.isRunning = true;
        document.getElementById('timer-start').textContent = 'Running...';
        document.getElementById('timer-start').disabled = true;
        document.getElementById('timer-pause').disabled = false;

        this.timerInterval = setInterval(() => {
            this.timerState.remainingSeconds--;
            
            if (this.timerState.remainingSeconds <= 0) {
                this.timerComplete();
                return;
            }
            
            this.updateTimerDisplay();
        }, 1000);
    }

    pauseTimer() {
        this.timerState.isRunning = false;
        clearInterval(this.timerInterval);
        
        document.getElementById('timer-start').textContent = 'Start';
        document.getElementById('timer-start').disabled = false;
        document.getElementById('timer-pause').disabled = true;
    }

    resetTimer() {
        this.pauseTimer();
        this.timerState.remainingSeconds = this.timerState.totalSeconds;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerState.remainingSeconds / 60);
        const seconds = this.timerState.remainingSeconds % 60;
        
        document.getElementById('timer-display').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update timer progress ring
        const progress = 1 - (this.timerState.remainingSeconds / this.timerState.totalSeconds);
        const circumference = 2 * Math.PI * 70;
        const strokeDashoffset = circumference - (progress * circumference);
        
        document.querySelector('.timer-progress').style.strokeDashoffset = strokeDashoffset;
    }

    timerComplete() {
        this.pauseTimer();
        this.resetTimer();
        
        // Award XP and time
        this.addXP(100); // 100 XP for completing a pomodoro
        this.totalHours += 0.5; // 25 minutes = 0.42 hours, rounded to 0.5
        
        // Show completion notification
        document.getElementById('timer-label').textContent = '🎉 Session Complete!';
        setTimeout(() => {
            document.getElementById('timer-label').textContent = 'Focus Time';
        }, 3000);
        
        this.updateDashboard();
        this.saveData();
    }

    // Progress View Updates
    updateProgress() {
        this.generateCalendar();
        this.updatePhaseProgress();
        this.updateMilestones();
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';

        for (let day = 1; day <= 100; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            if (this.completedDays.has(day)) {
                dayElement.classList.add('completed');
            } else if (day === this.currentDay) {
                dayElement.classList.add('current');
            } else {
                dayElement.classList.add('future');
            }
            
            dayElement.addEventListener('click', () => {
                this.currentDay = day;
                this.updateDailyTracker();
                // Switch to daily tracker view
                document.querySelector('.nav__link[data-view="daily-tracker"]').click();
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }

    updatePhaseProgress() {
        const phasesList = document.getElementById('phases-progress');
        phasesList.innerHTML = '';

        curriculum.phases.forEach((phase, index) => {
            const [start, end] = phase.days.split('-').map(Number);
            const completed = Array.from(this.completedDays).filter(day => day >= start && day <= end).length;
            const total = end - start + 1;
            const percentage = (completed / total) * 100;

            const phaseElement = document.createElement('div');
            phaseElement.className = 'phase-item';
            phaseElement.innerHTML = `
                <div class="phase-item-header">
                    <div class="phase-item-name">${phase.name}</div>
                    <div class="phase-item-days">${phase.days}</div>
                </div>
                <div class="phase-description">${phase.topics}</div>
                <div class="phase-item-progress">
                    <div class="phase-progress-bar">
                        <div class="phase-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="phase-progress-text">${completed} / ${total} days</div>
                </div>
            `;
            
            phasesList.appendChild(phaseElement);
        });
    }

    updateMilestones() {
        const milestonesList = document.getElementById('milestones-list');
        milestonesList.innerHTML = '';

        Object.entries(curriculum.milestones).forEach(([name, milestone]) => {
            const isUnlocked = this.completedDays.has(milestone.day) || this.achievements.has(name);
            
            const milestoneElement = document.createElement('div');
            milestoneElement.className = `milestone-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            milestoneElement.innerHTML = `
                <div class="milestone-badge">${milestone.badge}</div>
                <div class="milestone-info">
                    <h4>${name}</h4>
                    <p class="milestone-description">${milestone.description}</p>
                </div>
                <div class="milestone-xp">+${milestone.xp} XP</div>
            `;
            
            milestonesList.appendChild(milestoneElement);
        });
    }

    // Projects View
    updateProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = '';

        curriculum.projects.forEach(project => {
            const isCompleted = this.completedDays.has(project.day);
            
            const projectElement = document.createElement('div');
            projectElement.className = 'card project-card';
            projectElement.innerHTML = `
                <div class="card__body">
                    <div class="project-header">
                        <h3 class="project-name">${project.name}</h3>
                        <div class="project-day">Day ${project.day}</div>
                    </div>
                    <p class="project-description">${project.description}</p>
                    <div class="project-technologies">
                        ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="project-difficulty difficulty-badge">${project.difficulty}</div>
                    ${isCompleted ? '<div class="status status--success">✅ Completed</div>' : ''}
                </div>
            `;
            
            projectsGrid.appendChild(projectElement);
        });
    }

    // Resources View
    updateResources() {
        const resourcesContent = document.getElementById('resources-content');
        resourcesContent.innerHTML = '';

        const resources = {
            'Phase 1: Web Fundamentals': {
                'Documentation': [
                    'MDN Web Docs - HTML',
                    'MDN Web Docs - CSS', 
                    'MDN Web Docs - JavaScript'
                ],
                'Tutorials': [
                    'freeCodeCamp - Responsive Web Design',
                    'CSS-Tricks Complete Guide',
                    'JavaScript.info'
                ],
                'Tools': [
                    'VS Code',
                    'Chrome DevTools',
                    'Codepen'
                ]
            },
            'Phase 2: Advanced Frontend': {
                'Documentation': [
                    'React Official Docs',
                    'ES6 Features Guide',
                    'Webpack Documentation'
                ],
                'Tutorials': [
                    'React Tutorial - Official',
                    'Modern JavaScript Course',
                    'Advanced CSS Techniques'
                ],
                'Tools': [
                    'Create React App',
                    'Node.js',
                    'npm/yarn'
                ]
            },
            'Phase 3: Backend & APIs': {
                'Documentation': [
                    'Node.js Documentation',
                    'Express.js Guide',
                    'MongoDB Manual'
                ],
                'Tutorials': [
                    'Node.js Complete Course',
                    'RESTful API Design',
                    'Database Design Patterns'
                ],
                'Tools': [
                    'Postman',
                    'MongoDB Compass',
                    'Heroku CLI'
                ]
            },
            'Phase 4: Full-Stack Integration': {
                'Documentation': [
                    'MERN Stack Guide',
                    'Authentication Best Practices',
                    'Deployment Guides'
                ],
                'Tutorials': [
                    'Full-Stack Development',
                    'JWT Authentication',
                    'Production Deployment'
                ],
                'Tools': [
                    'Git & GitHub',
                    'Docker',
                    'AWS/Netlify/Vercel'
                ]
            },
            'Phase 5: Advanced Topics & Portfolio': {
                'Documentation': [
                    'Advanced React Patterns',
                    'Performance Optimization',
                    'Portfolio Best Practices'
                ],
                'Tutorials': [
                    'System Design Basics',
                    'Code Review Guidelines',
                    'Career Development'
                ],
                'Tools': [
                    'Testing Frameworks',
                    'CI/CD Pipelines',
                    'Analytics Tools'
                ]
            }
        };

        Object.entries(resources).forEach(([phaseName, categories]) => {
            const phaseElement = document.createElement('div');
            phaseElement.className = 'resources-phase';
            phaseElement.innerHTML = `
                <h2 class="resources-phase-title">${phaseName}</h2>
                <div class="resources-grid">
                    ${Object.entries(categories).map(([category, items]) => `
                        <div class="resource-category">
                            <h4>${category}</h4>
                            <div class="resource-list">
                                ${items.map(item => `<a href="#" class="resource-item" target="_blank">${item}</a>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            resourcesContent.appendChild(phaseElement);
        });
    }

    // Settings
    setupSettings() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('change', (e) => {
            this.currentTheme = e.target.value;
            this.applyTheme();
            this.saveData();
        });

        // Export data
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        // Reset progress
        document.getElementById('reset-progress').addEventListener('click', () => {
            document.getElementById('reset-modal').classList.remove('hidden');
        });

        // Modal handlers
        document.getElementById('modal-overlay').addEventListener('click', () => {
            document.getElementById('reset-modal').classList.add('hidden');
        });

        document.getElementById('cancel-reset').addEventListener('click', () => {
            document.getElementById('reset-modal').classList.add('hidden');
        });

        document.getElementById('confirm-reset').addEventListener('click', () => {
            this.resetAllProgress();
            document.getElementById('reset-modal').classList.add('hidden');
        });
    }

    applyTheme() {
        document.getElementById('theme-toggle').value = this.currentTheme;
        
        if (this.currentTheme === 'system') {
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', this.currentTheme);
        }
    }

    exportData() {
        const data = {
            exportDate: new Date().toISOString(),
            currentDay: this.currentDay,
            completedDays: Array.from(this.completedDays),
            totalXP: this.totalXP,
            currentStreak: this.currentStreak,
            totalHours: this.totalHours,
            notes: this.notes,
            completedTasks: this.completedTasks,
            achievements: Array.from(this.achievements)
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `100-days-code-challenge-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    resetAllProgress() {
        localStorage.removeItem('codeChallenge');
        this.currentDay = 1;
        this.completedDays = new Set();
        this.totalXP = 0;
        this.currentStreak = 0;
        this.totalHours = 0;
        this.notes = {};
        this.completedTasks = {};
        this.achievements = new Set();
        this.updateAllViews();
    }

    // Helper Methods
    getDayData(day) {
        // Find the closest curriculum entry
        const curriculumItem = curriculum.curriculum.find(item => item.day === day) || 
                               curriculum.curriculum.find(item => item.day <= day) ||
                               curriculum.curriculum[0];
        
        return curriculumItem;
    }

    getCurrentPhase() {
        const currentPhaseIndex = Math.floor((this.currentDay - 1) / 20);
        return curriculum.phases[Math.min(currentPhaseIndex, curriculum.phases.length - 1)];
    }

    getPhaseProgress(phase) {
        const [start, end] = phase.days.split('-').map(Number);
        const completed = Array.from(this.completedDays).filter(day => day >= start && day <= end).length;
        const total = end - start + 1;
        
        return {
            completed,
            total,
            percentage: (completed / total) * 100
        };
    }

    addXP(amount) {
        this.totalXP += amount;
    }

    updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        // Simple streak logic - increment if completing consecutive days
        if (this.completedDays.size > 0) {
            this.currentStreak++;
        }
    }

    checkAchievements() {
        Object.entries(curriculum.milestones).forEach(([name, milestone]) => {
            if (this.completedDays.has(milestone.day) && !this.achievements.has(name)) {
                this.achievements.add(name);
                this.addXP(milestone.xp);
            }
        });
    }

    updateRecentAchievements() {
        const achievementsContainer = document.getElementById('recent-achievements');
        const recentAchievements = Array.from(this.achievements).slice(-3);
        
        if (recentAchievements.length === 0) {
            achievementsContainer.innerHTML = '<div class="achievement-placeholder">Complete your first day to unlock achievements!</div>';
            return;
        }
        
        achievementsContainer.innerHTML = recentAchievements.map(achievementName => {
            const milestone = curriculum.milestones[achievementName];
            return `
                <div class="achievement-item">
                    <div class="achievement-badge">${milestone.badge}</div>
                    <div class="achievement-info">
                        <h4>${achievementName}</h4>
                        <p class="achievement-description">${milestone.description}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateAllViews() {
        this.updateDashboard();
        this.updateDailyTracker();
        this.updateProgress();
        this.updateProjects();
        this.updateResources();
    }
}

// Curriculum Data
const curriculum = {
    "curriculum": [
        {"day": 1, "topic": "HTML Fundamentals", "subtopics": ["HTML structure", "Basic tags", "Document setup"], "project": "Create your first HTML page", "difficulty": "Beginner", "phase": "Phase 1: Web Fundamentals", "estimated_hours": 2},
        {"day": 2, "topic": "HTML Elements & Attributes", "subtopics": ["Semantic HTML", "Attributes", "Forms basics"], "project": "Personal info form", "difficulty": "Beginner", "phase": "Phase 1: Web Fundamentals", "estimated_hours": 2},
        {"day": 25, "topic": "Phase 1 Project", "subtopics": ["Integration", "Testing", "Documentation"], "project": "Complete responsive website with JS", "difficulty": "Intermediate", "phase": "Phase 1: Web Fundamentals", "estimated_hours": 3},
        {"day": 45, "topic": "Phase 2 Project", "subtopics": ["Integration", "Optimization", "Documentation"], "project": "Complete React application", "difficulty": "Advanced", "phase": "Phase 2: Advanced Frontend", "estimated_hours": 4},
        {"day": 70, "topic": "Phase 3 Project", "subtopics": ["Integration", "Deployment prep", "Review"], "project": "Complete backend application", "difficulty": "Advanced", "phase": "Phase 3: Backend & APIs", "estimated_hours": 4},
        {"day": 90, "topic": "Phase 4 Project", "subtopics": ["Integration", "Testing", "Documentation"], "project": "Complete MERN application", "difficulty": "Advanced", "phase": "Phase 4: Full-Stack Integration", "estimated_hours": 4},
        {"day": 100, "topic": "Celebration & Next Steps", "subtopics": ["Portfolio review", "Achievement reflection", "Career planning"], "project": "100 Days Completion Showcase", "difficulty": "Advanced", "phase": "Phase 5: Advanced Topics & Portfolio", "estimated_hours": 4}
    ],
    "milestones": {
        "Week 1 Champion": {"day": 7, "description": "Complete first week of HTML/CSS", "badge": "🏆", "xp": 100},
        "JavaScript Explorer": {"day": 20, "description": "Master JavaScript fundamentals", "badge": "🔍", "xp": 200},
        "Frontend Warrior": {"day": 25, "description": "Complete Phase 1 - Web Fundamentals", "badge": "⚔️", "xp": 500},
        "React Ninja": {"day": 40, "description": "Master React fundamentals", "badge": "🥷", "xp": 300},
        "Frontend Master": {"day": 45, "description": "Complete Phase 2 - Advanced Frontend", "badge": "🎯", "xp": 750},
        "Backend Explorer": {"day": 55, "description": "Learn Node.js and databases", "badge": "🚀", "xp": 400},
        "API Architect": {"day": 65, "description": "Build complete APIs", "badge": "🏗️", "xp": 600},
        "Backend Master": {"day": 70, "description": "Complete Phase 3 - Backend & APIs", "badge": "🛡️", "xp": 1000},
        "Full-Stack Hero": {"day": 85, "description": "Deploy complete MERN application", "badge": "🦸", "xp": 800},
        "Integration Expert": {"day": 90, "description": "Complete Phase 4 - Full-Stack Integration", "badge": "🔗", "xp": 1200},
        "Code Master": {"day": 100, "description": "Complete 100 Days of Code Challenge!", "badge": "👑", "xp": 2000}
    },
    "phases": [
        {"name": "Phase 1: Web Fundamentals", "days": "1-25", "topics": "HTML, CSS, JavaScript basics, responsive design"},
        {"name": "Phase 2: Advanced Frontend", "days": "26-45", "topics": "ES6+, React, advanced JavaScript, state management"},
        {"name": "Phase 3: Backend & APIs", "days": "46-70", "topics": "Node.js, Express, databases, REST APIs"},
        {"name": "Phase 4: Full-Stack Integration", "days": "71-90", "topics": "MERN stack, authentication, deployment"},
        {"name": "Phase 5: Advanced Topics & Portfolio", "days": "91-100", "topics": "Advanced patterns, DevOps, portfolio completion"}
    ],
    "projects": [
        {"day": 25, "name": "Responsive Portfolio Website", "description": "Personal portfolio with HTML, CSS, and JavaScript", "technologies": ["HTML5", "CSS3", "JavaScript", "Responsive Design"], "difficulty": "Beginner"},
        {"day": 45, "name": "React Task Management App", "description": "Full-featured task manager built with React", "technologies": ["React", "React Router", "Context API", "Local Storage"], "difficulty": "Intermediate"},
        {"day": 70, "name": "RESTful API with Authentication", "description": "Complete backend API with user authentication", "technologies": ["Node.js", "Express", "MongoDB", "JWT", "Bcrypt"], "difficulty": "Advanced"},
        {"day": 90, "name": "Full-Stack MERN Application", "description": "Complete web application with frontend and backend", "technologies": ["MongoDB", "Express", "React", "Node.js", "JWT"], "difficulty": "Advanced"},
        {"day": 100, "name": "Capstone Portfolio Project", "description": "Showcase project demonstrating all learned skills", "technologies": ["Full MERN Stack", "Additional libraries", "DevOps tools"], "difficulty": "Expert"}
    ],
    "tasks": [
        {"task": "Review daily topic", "estimated_time": "30 min", "completed": false},
        {"task": "Watch tutorial/read documentation", "estimated_time": "45 min", "completed": false},
        {"task": "Code along with examples", "estimated_time": "60 min", "completed": false},
        {"task": "Build daily project", "estimated_time": "90 min", "completed": false},
        {"task": "Test and debug", "estimated_time": "30 min", "completed": false},
        {"task": "Document learning", "estimated_time": "15 min", "completed": false},
        {"task": "Update progress", "estimated_time": "10 min", "completed": false}
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.challengeTracker = new ChallengeTracker();
});
