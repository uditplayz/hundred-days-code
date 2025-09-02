// 100 Days of Code Challenge Tracker App
class CodingChallengeApp {
    constructor() {
        this.currentDay = 1;
        this.currentView = 'dashboard';
        this.timer = {
            isRunning: false,
            startTime: null,
            elapsed: 0,
            interval: null
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderDashboard();
        this.renderDailyTracker();
        this.renderProgress();
        this.renderProjects();
        this.renderResources();
        this.setupSettings();
        this.applyTheme();
    }

    // Data Management
    loadData() {
        // Load from localStorage or use defaults
        const savedData = localStorage.getItem('codingChallengeData');
        if (savedData) {
            this.data = JSON.parse(savedData);
        } else {
            this.data = this.getDefaultData();
        }
        
        // Update current day based on start date
        this.updateCurrentDay();
    }

    getDefaultData() {
        return {
            startDate: new Date().toISOString().split('T')[0],
            currentDay: 1,
            dailyGoal: 2,
            totalXP: 0,
            level: 1,
            streak: 0,
            totalHours: 0,
            theme: 'system',
            completedDays: [],
            dailyProgress: {},
            skills: {
                "HTML": { level: 0, max_level: 10 },
                "CSS": { level: 0, max_level: 10 },
                "JavaScript": { level: 0, max_level: 10 },
                "React": { level: 0, max_level: 10 },
                "Node.js": { level: 0, max_level: 10 },
                "Express.js": { level: 0, max_level: 10 },
                "MongoDB": { level: 0, max_level: 10 },
                "Full-Stack": { level: 0, max_level: 10 }
            },
            milestones: {},
            projects: [
                {
                    day: 25,
                    name: "Responsive Portfolio Website",
                    description: "Personal portfolio with HTML, CSS, and JavaScript",
                    technologies: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
                    difficulty: "Beginner",
                    status: "Planned"
                },
                {
                    day: 45,
                    name: "React Task Management App", 
                    description: "Full-featured task manager built with React",
                    technologies: ["React", "React Router", "Context API", "Local Storage"],
                    difficulty: "Intermediate",
                    status: "Planned"
                },
                {
                    day: 70,
                    name: "RESTful API with Authentication",
                    description: "Complete backend API with user authentication", 
                    technologies: ["Node.js", "Express", "MongoDB", "JWT", "Bcrypt"],
                    difficulty: "Advanced",
                    status: "Planned"
                },
                {
                    day: 90,
                    name: "Full-Stack MERN Application",
                    description: "Complete web application with frontend and backend",
                    technologies: ["MongoDB", "Express", "React", "Node.js", "JWT"],
                    difficulty: "Advanced", 
                    status: "Planned"
                },
                {
                    day: 100,
                    name: "Capstone Portfolio Project",
                    description: "Showcase project demonstrating all learned skills",
                    technologies: ["Full MERN Stack", "Additional libraries", "DevOps tools"],
                    difficulty: "Expert",
                    status: "Planned"
                }
            ]
        };
    }

    saveData() {
        localStorage.setItem('codingChallengeData', JSON.stringify(this.data));
    }

    updateCurrentDay() {
        const startDate = new Date(this.data.startDate);
        const today = new Date();
        const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        this.currentDay = Math.min(Math.max(daysDiff, 1), 100);
        this.data.currentDay = this.currentDay;
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation - wait for DOM to be ready
        setTimeout(() => {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const view = e.target.dataset.view;
                    if (view) {
                        this.switchView(view);
                    }
                });
            });

            // Daily Tracker
            const prevBtn = document.getElementById('prev-day');
            const nextBtn = document.getElementById('next-day');
            if (prevBtn) prevBtn.addEventListener('click', () => this.navigateDay(-1));
            if (nextBtn) nextBtn.addEventListener('click', () => this.navigateDay(1));
            
            const timerStart = document.getElementById('timer-start');
            const timerPause = document.getElementById('timer-pause');
            const timerReset = document.getElementById('timer-reset');
            const completeBtn = document.getElementById('complete-day');
            
            if (timerStart) timerStart.addEventListener('click', () => this.startTimer());
            if (timerPause) timerPause.addEventListener('click', () => this.pauseTimer());
            if (timerReset) timerReset.addEventListener('click', () => this.resetTimer());
            if (completeBtn) completeBtn.addEventListener('click', () => this.completeDay());

            // Task checkboxes
            document.querySelectorAll('.task-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', () => this.updateTaskProgress());
            });

            // Settings
            const startDateInput = document.getElementById('start-date');
            const dailyGoalInput = document.getElementById('daily-goal');
            const themeSelect = document.getElementById('theme-select');
            const exportBtn = document.getElementById('export-data');
            const resetBtn = document.getElementById('reset-progress');
            const closeAchievement = document.getElementById('close-achievement');
            
            if (startDateInput) {
                startDateInput.addEventListener('change', (e) => {
                    this.data.startDate = e.target.value;
                    this.updateCurrentDay();
                    this.saveData();
                    this.renderDashboard();
                });
            }

            if (dailyGoalInput) {
                dailyGoalInput.addEventListener('change', (e) => {
                    this.data.dailyGoal = parseInt(e.target.value);
                    this.saveData();
                });
            }

            if (themeSelect) {
                themeSelect.addEventListener('change', (e) => {
                    this.data.theme = e.target.value;
                    this.applyTheme();
                    this.saveData();
                });
            }

            if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
            if (resetBtn) resetBtn.addEventListener('click', () => this.resetProgress());

            // Modal
            if (closeAchievement) {
                closeAchievement.addEventListener('click', () => {
                    document.getElementById('achievement-modal').classList.add('hidden');
                });
            }
        }, 100);
    }

    // Navigation
    switchView(viewName) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNavItem = document.querySelector(`[data-view="${viewName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        const activeView = document.getElementById(`${viewName}-view`);
        if (activeView) {
            activeView.classList.add('active');
        }

        this.currentView = viewName;

        // Re-render view-specific content
        if (viewName === 'progress') {
            this.renderProgress();
        } else if (viewName === 'projects') {
            this.renderProjects();
        } else if (viewName === 'resources') {
            this.renderResources();
        } else if (viewName === 'daily') {
            this.renderDailyTracker();
        }
    }

    // Dashboard Rendering
    renderDashboard() {
        // Update progress ring
        const progressPercent = (this.currentDay / 100) * 100;
        const progressCircle = document.getElementById('progress-circle');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 50;
            const offset = circumference - (progressPercent / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }

        // Update current day
        const currentDayEl = document.getElementById('current-day');
        if (currentDayEl) currentDayEl.textContent = this.currentDay;

        // Update level and XP
        const level = Math.floor(this.data.totalXP / 1000) + 1;
        const xpInLevel = this.data.totalXP % 1000;
        const userLevelEl = document.getElementById('user-level');
        const userXpEl = document.getElementById('user-xp');
        const xpProgressEl = document.getElementById('xp-progress');
        
        if (userLevelEl) userLevelEl.textContent = level;
        if (userXpEl) userXpEl.textContent = this.data.totalXP;
        if (xpProgressEl) xpProgressEl.style.width = `${(xpInLevel / 1000) * 100}%`;

        // Update streak
        const streakEl = document.getElementById('streak-count');
        if (streakEl) streakEl.textContent = this.data.streak;

        // Update total hours
        const totalHoursEl = document.getElementById('total-hours');
        if (totalHoursEl) totalHoursEl.textContent = Math.floor(this.data.totalHours);

        // Update current phase
        const phaseInfo = this.getCurrentPhase();
        const phaseTitleEl = document.getElementById('phase-title');
        const phaseDescEl = document.getElementById('phase-description');
        const phaseTextEl = document.getElementById('phase-progress-text');
        const phaseBarEl = document.getElementById('phase-progress-bar');
        
        if (phaseTitleEl) phaseTitleEl.textContent = phaseInfo.name;
        if (phaseDescEl) phaseDescEl.textContent = phaseInfo.description;
        if (phaseTextEl) phaseTextEl.textContent = `Day ${this.currentDay} of ${phaseInfo.endDay}`;
        
        const phaseProgress = ((this.currentDay - phaseInfo.startDay + 1) / phaseInfo.duration) * 100;
        if (phaseBarEl) phaseBarEl.style.width = `${Math.min(phaseProgress, 100)}%`;

        // Update achievements
        this.renderRecentAchievements();
    }

    getCurrentPhase() {
        if (this.currentDay <= 25) return { name: "Phase 1: Web Fundamentals", description: "HTML, CSS, JavaScript basics, responsive design", startDay: 1, endDay: 25, duration: 25 };
        if (this.currentDay <= 45) return { name: "Phase 2: Advanced Frontend", description: "ES6+, DOM manipulation, React fundamentals", startDay: 26, endDay: 45, duration: 20 };
        if (this.currentDay <= 70) return { name: "Phase 3: Backend & APIs", description: "Node.js, Express, databases, API development", startDay: 46, endDay: 70, duration: 25 };
        if (this.currentDay <= 90) return { name: "Phase 4: Full-Stack Integration", description: "MERN stack projects, authentication, deployment", startDay: 71, endDay: 90, duration: 20 };
        return { name: "Phase 5: Advanced Topics & Portfolio", description: "Advanced concepts, optimization, portfolio completion", startDay: 91, endDay: 100, duration: 10 };
    }

    renderRecentAchievements() {
        const achievementsContainer = document.getElementById('achievements-list');
        if (!achievementsContainer) return;
        
        const earnedAchievements = Object.entries(this.getMilestones())
            .filter(([_, milestone]) => milestone.day <= this.currentDay && this.data.milestones[milestone.day])
            .slice(-3);

        if (earnedAchievements.length === 0) {
            achievementsContainer.innerHTML = '<div class="achievement-placeholder"><p>Complete your first day to unlock achievements! 🏆</p></div>';
            return;
        }

        achievementsContainer.innerHTML = earnedAchievements.map(([name, milestone]) => `
            <div class="achievement-item">
                <div class="achievement-badge">${milestone.badge}</div>
                <div class="achievement-info">
                    <h4>${name}</h4>
                    <p>${milestone.description}</p>
                </div>
            </div>
        `).join('');
    }

    // Daily Tracker
    renderDailyTracker() {
        const dayData = this.getDayData(this.currentDay);
        
        const elements = {
            'daily-day-number': this.currentDay,
            'daily-topic': dayData.topic,
            'daily-hours': dayData.estimated_hours,
            'daily-project': dayData.project
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });

        const difficultyEl = document.getElementById('daily-difficulty');
        if (difficultyEl) {
            difficultyEl.textContent = dayData.difficulty;
            difficultyEl.className = `difficulty-badge ${dayData.difficulty}`;
        }

        // Update subtopics
        const subtopicsList = document.getElementById('daily-subtopics');
        if (subtopicsList) {
            subtopicsList.innerHTML = dayData.subtopics.map(subtopic => `<li>${subtopic}</li>`).join('');
        }

        // Load daily progress
        this.loadDailyProgress();

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-day');
        const nextBtn = document.getElementById('next-day');
        if (prevBtn) prevBtn.disabled = this.currentDay <= 1;
        if (nextBtn) nextBtn.disabled = this.currentDay >= 100;
    }

    getDayData(day) {
        const sampleDays = {
            1: { topic: "HTML Fundamentals", subtopics: ["HTML structure", "Basic tags", "Document setup"], project: "Create your first HTML page", difficulty: "Beginner", estimated_hours: 2 },
            2: { topic: "HTML Elements & Attributes", subtopics: ["Semantic HTML", "Attributes", "Forms basics"], project: "Personal info form", difficulty: "Beginner", estimated_hours: 2 },
            15: { topic: "JavaScript Basics", subtopics: ["Variables", "Functions", "Control flow"], project: "Interactive calculator", difficulty: "Beginner", estimated_hours: 3 },
            25: { topic: "Phase 1 Project", subtopics: ["Integration", "Testing", "Documentation"], project: "Complete responsive website", difficulty: "Intermediate", estimated_hours: 4 },
            35: { topic: "React Components", subtopics: ["JSX", "Props", "State"], project: "Component library", difficulty: "Intermediate", estimated_hours: 3 },
            45: { topic: "Phase 2 Project", subtopics: ["Integration", "Optimization", "Documentation"], project: "Complete React application", difficulty: "Advanced", estimated_hours: 4 },
            55: { topic: "Node.js & Express", subtopics: ["Server setup", "Routing", "Middleware"], project: "RESTful API", difficulty: "Advanced", estimated_hours: 4 },
            70: { topic: "Phase 3 Project", subtopics: ["Integration", "Deployment prep", "Review"], project: "Complete backend application", difficulty: "Advanced", estimated_hours: 4 },
            85: { topic: "MERN Integration", subtopics: ["Frontend-Backend connection", "Authentication", "Deployment"], project: "Full-stack app", difficulty: "Advanced", estimated_hours: 5 },
            100: { topic: "Celebration & Next Steps", subtopics: ["Portfolio review", "Achievement reflection", "Career planning"], project: "100 Days Completion Showcase", difficulty: "Expert", estimated_hours: 5 }
        };

        return sampleDays[day] || {
            topic: `Day ${day} Learning`,
            subtopics: ["Study materials", "Practice exercises", "Project work"],
            project: `Day ${day} project`,
            difficulty: "Intermediate",
            estimated_hours: 2
        };
    }

    navigateDay(direction) {
        const newDay = this.currentDay + direction;
        if (newDay >= 1 && newDay <= 100) {
            this.currentDay = newDay;
            this.renderDailyTracker();
        }
    }

    loadDailyProgress() {
        const dayProgress = this.data.dailyProgress[this.currentDay] || {};
        
        // Load task completion
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            const task = checkbox.dataset.task;
            checkbox.checked = dayProgress.tasks?.[task] || false;
        });

        // Load reflection data
        const elements = ['understanding-rating', 'daily-challenges', 'daily-notes'];
        elements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = dayProgress[id.replace('daily-', '').replace('-rating', '')] || '';
            }
        });

        // Load time
        const dailyTime = dayProgress.time || 0;
        this.updateDailyTimeDisplay(dailyTime);
    }

    updateTaskProgress() {
        const dayProgress = this.data.dailyProgress[this.currentDay] || { tasks: {} };
        
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            const task = checkbox.dataset.task;
            dayProgress.tasks[task] = checkbox.checked;
        });

        this.data.dailyProgress[this.currentDay] = dayProgress;
        this.saveData();
    }

    // Timer Functions
    startTimer() {
        if (!this.timer.isRunning) {
            this.timer.isRunning = true;
            this.timer.startTime = Date.now() - this.timer.elapsed;
            this.timer.interval = setInterval(() => this.updateTimer(), 1000);
            
            const startBtn = document.getElementById('timer-start');
            const pauseBtn = document.getElementById('timer-pause');
            if (startBtn) startBtn.textContent = 'Resume';
            if (pauseBtn) pauseBtn.disabled = false;
        }
    }

    pauseTimer() {
        if (this.timer.isRunning) {
            this.timer.isRunning = false;
            clearInterval(this.timer.interval);
            
            const startBtn = document.getElementById('timer-start');
            const pauseBtn = document.getElementById('timer-pause');
            if (startBtn) startBtn.textContent = 'Resume';
            if (pauseBtn) pauseBtn.disabled = true;
        }
    }

    resetTimer() {
        this.timer.isRunning = false;
        this.timer.elapsed = 0;
        clearInterval(this.timer.interval);
        
        const timerDisplay = document.getElementById('timer-display');
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        
        if (timerDisplay) timerDisplay.textContent = '00:00:00';
        if (startBtn) startBtn.textContent = 'Start';
        if (pauseBtn) pauseBtn.disabled = true;
    }

    updateTimer() {
        if (this.timer.isRunning) {
            this.timer.elapsed = Date.now() - this.timer.startTime;
            const time = new Date(this.timer.elapsed);
            const hours = String(Math.floor(this.timer.elapsed / 3600000)).padStart(2, '0');
            const minutes = String(time.getUTCMinutes()).padStart(2, '0');
            const seconds = String(time.getUTCSeconds()).padStart(2, '0');
            
            const timerDisplay = document.getElementById('timer-display');
            if (timerDisplay) {
                timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
            }
        }
    }

    updateDailyTimeDisplay(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const dailyTimeEl = document.getElementById('daily-total-time');
        if (dailyTimeEl) {
            dailyTimeEl.textContent = `${hours}h ${minutes}m`;
        }
    }

    completeDay() {
        // Save reflection data
        const dayProgress = this.data.dailyProgress[this.currentDay] || { tasks: {} };
        
        const understandingEl = document.getElementById('understanding-rating');
        const challengesEl = document.getElementById('daily-challenges');
        const notesEl = document.getElementById('daily-notes');
        
        if (understandingEl) dayProgress.understanding = understandingEl.value;
        if (challengesEl) dayProgress.challenges = challengesEl.value;
        if (notesEl) dayProgress.notes = notesEl.value;
        
        dayProgress.completed = true;
        dayProgress.completedDate = new Date().toISOString();

        // Add timer time to daily total
        const timerMinutes = Math.floor(this.timer.elapsed / 60000);
        dayProgress.time = (dayProgress.time || 0) + timerMinutes;

        this.data.dailyProgress[this.currentDay] = dayProgress;

        // Update stats
        if (!this.data.completedDays.includes(this.currentDay)) {
            this.data.completedDays.push(this.currentDay);
            this.data.totalHours += (dayProgress.time || 0) / 60;
            this.updateStreak();
            this.updateSkills();
            this.checkMilestones();
        }

        this.saveData();
        this.showToast('Day completed successfully! 🎉', 'success');
        this.renderDashboard();
        
        // Move to next day if not at end
        if (this.currentDay < 100) {
            this.currentDay++;
            this.renderDailyTracker();
        }
    }

    updateStreak() {
        // Simple streak calculation - consecutive completed days
        let streak = 0;
        for (let i = this.currentDay; i >= 1; i--) {
            if (this.data.completedDays.includes(i)) {
                streak++;
            } else {
                break;
            }
        }
        this.data.streak = streak;
    }

    updateSkills() {
        // Update skills based on current day/phase
        const skills = this.data.skills;
        if (this.currentDay <= 25) {
            skills.HTML.level = Math.min(skills.HTML.level + 0.5, skills.HTML.max_level);
            skills.CSS.level = Math.min(skills.CSS.level + 0.5, skills.CSS.max_level);
            skills.JavaScript.level = Math.min(skills.JavaScript.level + 0.3, skills.JavaScript.max_level);
        } else if (this.currentDay <= 45) {
            skills.JavaScript.level = Math.min(skills.JavaScript.level + 0.7, skills.JavaScript.max_level);
            skills.React.level = Math.min(skills.React.level + 0.8, skills.React.max_level);
        } else if (this.currentDay <= 70) {
            skills["Node.js"].level = Math.min(skills["Node.js"].level + 0.6, skills["Node.js"].max_level);
            skills["Express.js"].level = Math.min(skills["Express.js"].level + 0.6, skills["Express.js"].max_level);
            skills.MongoDB.level = Math.min(skills.MongoDB.level + 0.5, skills.MongoDB.max_level);
        } else {
            skills["Full-Stack"].level = Math.min(skills["Full-Stack"].level + 0.8, skills["Full-Stack"].max_level);
        }
    }

    checkMilestones() {
        const milestones = this.getMilestones();
        Object.entries(milestones).forEach(([name, milestone]) => {
            if (milestone.day === this.currentDay && !this.data.milestones[milestone.day]) {
                this.data.milestones[milestone.day] = true;
                this.data.totalXP += milestone.xp;
                this.showAchievement(name, milestone);
            }
        });
    }

    getMilestones() {
        return {
            "Week 1 Champion": { day: 7, description: "Complete first week of HTML/CSS", badge: "🏆", xp: 100 },
            "JavaScript Explorer": { day: 20, description: "Master JavaScript fundamentals", badge: "🔍", xp: 200 },
            "Frontend Warrior": { day: 25, description: "Complete Phase 1 - Web Fundamentals", badge: "⚔️", xp: 500 },
            "React Ninja": { day: 40, description: "Master React fundamentals", badge: "🥷", xp: 300 },
            "Frontend Master": { day: 45, description: "Complete Phase 2 - Advanced Frontend", badge: "🎯", xp: 750 },
            "Backend Explorer": { day: 55, description: "Learn Node.js and databases", badge: "🚀", xp: 400 },
            "API Architect": { day: 65, description: "Build complete APIs", badge: "🏗️", xp: 600 },
            "Backend Master": { day: 70, description: "Complete Phase 3 - Backend & APIs", badge: "🛡️", xp: 1000 },
            "Full-Stack Hero": { day: 85, description: "Deploy complete MERN application", badge: "🦸", xp: 800 },
            "Integration Expert": { day: 90, description: "Complete Phase 4 - Full-Stack Integration", badge: "🔗", xp: 1200 },
            "Code Master": { day: 100, description: "Complete 100 Days of Code Challenge!", badge: "👑", xp: 2000 }
        };
    }

    showAchievement(name, milestone) {
        const modal = document.getElementById('achievement-modal');
        const details = document.getElementById('achievement-details');
        
        if (modal && details) {
            details.innerHTML = `
                <div class="achievement-badge">${milestone.badge}</div>
                <h3>${name}</h3>
                <p>${milestone.description}</p>
                <p class="milestone-xp">+${milestone.xp} XP</p>
            `;
            
            modal.classList.remove('hidden');
        }
    }

    // Progress View
    renderProgress() {
        this.renderProgressCalendar();
        this.renderPhasesProgress();
        this.renderSkillsChart();
        this.renderAllMilestones();
    }

    renderProgressCalendar() {
        const calendar = document.getElementById('progress-calendar');
        if (!calendar) return;
        
        let html = '';
        
        for (let day = 1; day <= 100; day++) {
            let className = 'calendar-day incomplete';
            if (this.data.completedDays.includes(day)) {
                className = 'calendar-day completed';
            } else if (day === this.currentDay) {
                className = 'calendar-day current';
            }
            
            html += `<div class="${className}" title="Day ${day}">${day}</div>`;
        }
        
        calendar.innerHTML = html;
    }

    renderPhasesProgress() {
        const phases = [
            { name: "Phase 1: Web Fundamentals", days: "1-25", start: 1, end: 25 },
            { name: "Phase 2: Advanced Frontend", days: "26-45", start: 26, end: 45 },
            { name: "Phase 3: Backend & APIs", days: "46-70", start: 46, end: 70 },
            { name: "Phase 4: Full-Stack Integration", days: "71-90", start: 71, end: 90 },
            { name: "Phase 5: Advanced Topics & Portfolio", days: "91-100", start: 91, end: 100 }
        ];

        const container = document.getElementById('phases-chart');
        if (!container) return;
        
        container.innerHTML = phases.map(phase => {
            const completedInPhase = this.data.completedDays.filter(day => day >= phase.start && day <= phase.end).length;
            const totalInPhase = phase.end - phase.start + 1;
            const progress = (completedInPhase / totalInPhase) * 100;

            return `
                <div class="phase-item">
                    <div class="phase-info">
                        <div class="phase-name">${phase.name}</div>
                        <div class="phase-days">Days ${phase.days} (${completedInPhase}/${totalInPhase} completed)</div>
                    </div>
                    <div class="phase-progress-bar">
                        <div class="phase-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSkillsChart() {
        const canvas = document.getElementById('skills-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const skills = this.data.skills;
        
        if (window.skillsChart) {
            window.skillsChart.destroy();
        }
        
        window.skillsChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(skills),
                datasets: [{
                    label: 'Skill Level',
                    data: Object.values(skills).map(skill => skill.level),
                    backgroundColor: 'rgba(31, 184, 205, 0.2)',
                    borderColor: '#1FB8CD',
                    borderWidth: 2,
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#1FB8CD',
                    pointHoverBackgroundColor: '#FFC185',
                    pointHoverBorderColor: '#FFC185'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderAllMilestones() {
        const milestones = this.getMilestones();
        const container = document.getElementById('all-milestones');
        if (!container) return;
        
        container.innerHTML = Object.entries(milestones).map(([name, milestone]) => {
            const isEarned = this.data.milestones[milestone.day] || false;
            const className = isEarned ? 'milestone-item earned' : 'milestone-item';
            
            return `
                <div class="${className}">
                    <div class="milestone-badge">${milestone.badge}</div>
                    <div class="milestone-details">
                        <h4>${name}</h4>
                        <p>${milestone.description}</p>
                        <div class="milestone-xp">Day ${milestone.day} • ${milestone.xp} XP</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Projects View
    renderProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;
        
        container.innerHTML = this.data.projects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-day">Day ${project.day}</div>
                    <div class="project-status ${project.status}">${project.status}</div>
                </div>
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-technologies">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="difficulty-badge ${project.difficulty}">${project.difficulty}</div>
            </div>
        `).join('');
    }

    // Resources View
    renderResources() {
        const resources = {
            "Phase 1: Web Fundamentals": {
                documentation: ["MDN Web Docs - HTML", "MDN Web Docs - CSS", "MDN Web Docs - JavaScript"],
                tutorials: ["freeCodeCamp - Responsive Web Design", "The Odin Project - Foundations", "JavaScript.info"],
                practice: ["Frontend Mentor challenges", "Codepen.io for experiments", "CSS Grid Garden", "Flexbox Froggy"],
                tools: ["VS Code", "Chrome DevTools", "Git & GitHub", "Figma (for design)"]
            },
            "Phase 2: Advanced Frontend": {
                documentation: ["React Documentation", "ES6+ Features Guide", "Webpack Documentation"],
                tutorials: ["React Tutorial by React Team", "Modern JavaScript Course", "React Router Tutorial"],
                practice: ["React projects on GitHub", "CodeSandbox experiments", "LeetCode JavaScript problems"],
                tools: ["Create React App", "React Developer Tools", "ESLint & Prettier", "Vite"]
            },
            "Phase 3: Backend & APIs": {
                documentation: ["Node.js Documentation", "Express.js Guide", "MongoDB Manual"],
                tutorials: ["Node.js Crash Course", "Building RESTful APIs", "Database Design Basics"],
                practice: ["API challenges", "Database exercises", "Authentication tutorials"],
                tools: ["Postman", "MongoDB Compass", "Nodemon", "JWT.io"]
            },
            "Phase 4: Full-Stack Integration": {
                documentation: ["MERN Stack Guide", "Deployment Best Practices", "Testing Documentation"],
                tutorials: ["Full-Stack Project Tutorials", "Authentication Implementation", "Production Deployment"],
                practice: ["Full-stack challenges", "Integration exercises", "Performance optimization"],
                tools: ["Heroku", "Netlify", "Jest", "Cypress"]
            },
            "Phase 5: Advanced Topics": {
                documentation: ["Advanced React Patterns", "Performance Optimization", "Security Best Practices"],
                tutorials: ["Advanced JavaScript Concepts", "System Design Basics", "Portfolio Development"],
                practice: ["Advanced coding challenges", "System design exercises", "Code review practice"],
                tools: ["Lighthouse", "Webpack Bundle Analyzer", "GitHub Actions", "Docker"]
            }
        };

        const container = document.getElementById('resources-content');
        if (!container) return;
        
        container.innerHTML = Object.entries(resources).map(([phase, categories]) => `
            <div class="resource-phase">
                <h2>${phase}</h2>
                <div class="resource-categories">
                    ${Object.entries(categories).map(([category, items]) => `
                        <div class="resource-category">
                            <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                            <ul class="resource-list">
                                ${items.map(item => `<li><a href="#" target="_blank">${item}</a></li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Settings
    setupSettings() {
        const startDateEl = document.getElementById('start-date');
        const dailyGoalEl = document.getElementById('daily-goal');
        const themeSelectEl = document.getElementById('theme-select');
        
        if (startDateEl) startDateEl.value = this.data.startDate;
        if (dailyGoalEl) dailyGoalEl.value = this.data.dailyGoal;
        if (themeSelectEl) themeSelectEl.value = this.data.theme;
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = '100-days-progress.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showToast('Progress data exported successfully!', 'success');
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.data = this.getDefaultData();
            this.currentDay = 1;
            this.saveData();
            this.renderDashboard();
            this.renderDailyTracker();
            this.showToast('Progress reset successfully!', 'success');
        }
    }

    applyTheme() {
        const theme = this.data.theme;
        if (theme === 'system') {
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
        }
    }

    // Utility Functions
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codingApp = new CodingChallengeApp();
});