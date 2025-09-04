// Global variables
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadModals();
});

function initializeApp() {
    currentUser = getCurrentUser();
    updateUIForUser();
    
    // Load saved mood for both users and guests
    const userId = currentUser ? currentUser.id : 'guest';
    const savedMood = localStorage.getItem(`userMood_${userId}`);
    if (savedMood) {
        try {
            const moodData = JSON.parse(savedMood);
            const moodBtn = document.querySelector(`[data-mood="${moodData.mood}"]`);
            if (moodBtn) {
                moodBtn.classList.add('selected');
            }
        } catch (e) {
            console.log('Could not load saved mood');
        }
    }
}

function setupEventListeners() {
    // Navigation scroll listener
    window.addEventListener('scroll', updateActiveNavigation);
    
    // Navigation link handlers
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const targetId = href.substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                hideProfile();
                setTimeout(() => {
                    scrollToSection(targetId);
                }, 100);
            }
        });
    });

    // Global click handler for modals and dropdowns
    window.onclick = function(event) {
        handleGlobalClick(event);
    };

    // Global keyboard handler
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });
}

function handleGlobalClick(event) {
    const modals = ['chatModal', 'authModal', 'mindfulnessModal', 'therapistModal', 'resourcesModal', 'supportGroupsModal', 'crisisModal', 'communityModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (modalId === 'mindfulnessModal') stopBreathing();
        }
    });
    
    // Close user dropdown when clicking outside
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
}

function closeAllModals() {
    const modals = ['chatModal', 'authModal', 'mindfulnessModal', 'therapistModal', 'resourcesModal', 'supportGroupsModal', 'crisisModal', 'communityModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (modalId === 'mindfulnessModal') stopBreathing();
        }
    });
}

// User management functions
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateUIForUser();
}

function updateUIForUser() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.getElementById('userAvatar');
    
    if (currentUser) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';
        userAvatar.textContent = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('chatHistory');
    updateUIForUser();
    hideProfile();
    showMessage('You have been signed out successfully.', 'success');
    
    // Close dropdown
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Profile functions
function openProfile() {
    if (!getCurrentUser()) {
        showMessage('🔐 Sign up to create your personal profile and track your mental health journey!', 'success');
        setTimeout(() => openAuth('register'), 1000);
        return;
    }
    
    showProfile();
    
    // Close dropdown
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

function showProfile() {
    // Hide other sections
    document.getElementById('home').style.display = 'none';
    document.getElementById('features').style.display = 'none';
    document.getElementById('mood').style.display = 'none';
    document.getElementById('community').style.display = 'none';
    
    // Show profile section
    document.getElementById('profile').style.display = 'block';
    
    // Update profile info
    updateProfileInfo();
    generateMoodTracker();
    updateStatistics();
    updateRecentActivity();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideProfile() {
    // Show main sections
    document.getElementById('home').style.display = 'block';
    document.getElementById('features').style.display = 'block';
    document.getElementById('mood').style.display = 'block';
    document.getElementById('community').style.display = 'block';
    
    // Hide profile section
    document.getElementById('profile').style.display = 'none';
}

function updateProfileInfo() {
    if (!currentUser) return;
    
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileAvatar) {
        profileAvatar.textContent = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (profileName) {
        profileName.textContent = currentUser.name;
    }
    if (profileEmail) {
        profileEmail.textContent = currentUser.email;
    }
}

function generateMoodTracker() {
    const trackerContainer = document.getElementById('moodTracker');
    if (!trackerContainer) return;
    
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const userId = currentUser ? currentUser.id : 'guest';
    const moodHistory = getUserMoodData();
    
    let html = '';
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = moodHistory[dateStr];
        const isToday = day === today.getDate();
        
        html += `
            <div class="tracker-day ${isToday ? 'today' : ''} ${dayData ? 'has-data' : ''}" 
                 onclick="selectDayMood('${dateStr}')">
                <div class="day-number">${day}</div>
                <div class="day-mood">${dayData ? dayData.emoji : ''}</div>
            </div>
        `;
    }
    
    trackerContainer.innerHTML = html;
}

function getUserMoodData() {
    const userId = currentUser ? currentUser.id : 'guest';
    const moodHistory = localStorage.getItem(`moodHistory_${userId}`);
    return moodHistory ? JSON.parse(moodHistory) : {};
}

function updateStatistics() {
    const userId = currentUser ? currentUser.id : 'guest';
    const moodHistory = getUserMoodData();
    const chatHistory = JSON.parse(localStorage.getItem(`chatHistory_${userId}`) || '[]');
    const breathingSessions = parseInt(localStorage.getItem(`breathingSessions_${userId}`) || '0');
    
    // Calculate statistics
    const totalDays = Object.keys(moodHistory).length;
    const chatSessions = Math.ceil(chatHistory.length / 10); // Approximate sessions
    const streakDays = calculateStreak(moodHistory);
    
    // Update UI
    const totalDaysEl = document.getElementById('totalDays');
    const chatSessionsEl = document.getElementById('chatSessions');
    const breathingSessionsEl = document.getElementById('breathingSessions');
    const streakDaysEl = document.getElementById('streakDays');
    
    if (totalDaysEl) totalDaysEl.textContent = totalDays;
    if (chatSessionsEl) chatSessionsEl.textContent = chatSessions;
    if (breathingSessionsEl) breathingSessionsEl.textContent = breathingSessions;
    if (streakDaysEl) streakDaysEl.textContent = streakDays;
}

function calculateStreak(moodHistory) {
    const dates = Object.keys(moodHistory).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const daysDiff = Math.floor((new Date(today) - new Date(date)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function updateRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;
    
    const userId = currentUser ? currentUser.id : 'guest';
    const moodHistory = getUserMoodData();
    const recentMoods = Object.entries(moodHistory)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .slice(0, 5);
    
    if (recentMoods.length === 0) {
        activityContainer.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 2rem;">
                <p>No recent activity yet. Start by tracking your mood!</p>
            </div>
        `;
        return;
    }
    
    const html = recentMoods.map(([date, data]) => {
        const dateObj = new Date(date);
        const timeAgo = getTimeAgo(dateObj);
        
        return `
            <div class="activity-item">
                <div class="activity-info">
                    <div class="activity-icon">${data.emoji}</div>
                    <div class="activity-text">Mood tracked: ${data.mood}</div>
                </div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
    
    activityContainer.innerHTML = html;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

function scrollToMoodTracker() {
    hideProfile();
    setTimeout(() => {
        scrollToSection('mood');
    }, 100);
}

// Mood tracking
function selectMood(mood, emoji) {
    document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.closest('.mood-btn').classList.add('selected');
    
    const today = new Date().toISOString().split('T')[0];
    const userId = currentUser ? currentUser.id : 'guest';
    const moodData = {
        mood: mood,
        emoji: emoji,
        timestamp: new Date(),
        userId: userId
    };
    
    // Save current mood (for both users and guests)
    localStorage.setItem(`userMood_${userId}`, JSON.stringify(moodData));
    
    // Save to mood history
    const moodHistory = getUserMoodData();
    moodHistory[today] = moodData;
    localStorage.setItem(`moodHistory_${userId}`, JSON.stringify(moodHistory));
    
    showMoodFeedback(mood, emoji);
    
    // Show sign-in prompt occasionally for guests
    if (!currentUser && Math.random() < 0.4) {
        setTimeout(() => {
            showMessage('🌟 Create an account to track your mood patterns over time and get personalized insights!', 'success');
        }, 2000);
    }
}

function showMoodFeedback(mood, emoji) {
    const messages = {
        amazing: "That's wonderful! Keep riding that positive wave! 🌟",
        happy: "So glad you're feeling good today! 😊",
        okay: "That's perfectly fine. Some days are just okay, and that's normal. 💙",
        sad: "I'm sorry you're feeling sad. Remember, it's okay to feel this way. You're not alone. 🤗",
        anxious: "Anxiety can be tough. Try some deep breathing exercises. You've got this! 🌸",
        angry: "It's okay to feel angry sometimes. Let's find healthy ways to process these feelings. 💪"
    };
    
    const feedback = messages[mood] || "Thank you for sharing how you're feeling.";
    showMessage(`${emoji} ${feedback}`, 'success');
}

// Utility functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) return;
    
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 80;
    const elementPosition = element.offsetTop - headerHeight - 20;
    
    window.scrollTo({
        top: Math.max(0, elementPosition),
        behavior: 'smooth'
    });
}

function showMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#d1fae5' : '#fee2e2'};
        color: ${type === 'success' ? '#065f46' : '#991b1b'};
        border: 1px solid ${type === 'success' ? '#a7f3d0' : '#fca5a5'};
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 500;
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    `;
    messageDiv.textContent = text;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 4000);
}

function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    let current = '';
    sections.forEach(section => {
        if (section.style.display !== 'none') {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Load modals dynamically
function loadModals() {
    const modalsContainer = document.getElementById('modals-container');
    if (modalsContainer) {
        modalsContainer.innerHTML = getModalsHTML();
    }
}

function getModalsHTML() {
    return `
        <!-- Auth Modal -->
        <div class="modal" id="authModal">
            <div class="modal-container" style="max-width: 400px;">
                <button class="modal-close" onclick="closeAuth()" aria-label="Close">×</button>
                <div class="modal-header">
                    <div class="auth-tabs" style="display: flex; margin-bottom: 1rem; background: #f9fafb; border-radius: 8px; padding: 4px;">
                        <button class="auth-tab active" id="loginTab" onclick="switchAuthTab('login')" style="flex: 1; padding: 0.75rem; text-align: center; background: transparent; border: none; border-radius: 6px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.3s ease;">Sign In</button>
                        <button class="auth-tab" id="registerTab" onclick="switchAuthTab('register')" style="flex: 1; padding: 0.75rem; text-align: center; background: transparent; border: none; border-radius: 6px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.3s ease;">Sign Up</button>
                    </div>
                </div>
                
                <!-- Login Form -->
                <div class="auth-form" id="loginForm" style="padding: 2rem;">
                    <div id="loginMessage"></div>
                    <form onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label" for="loginEmail">Email Address</label>
                            <input type="email" id="loginEmail" class="form-input" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" class="form-input" placeholder="Enter your password" required>
                        </div>
                        <button type="submit" class="form-submit" id="loginSubmit">
                            Sign In
                        </button>
                    </form>
                </div>
                
                <!-- Register Form -->
                <div class="auth-form" id="registerForm" style="display: none; padding: 2rem;">
                    <div id="registerMessage"></div>
                    <form onsubmit="handleRegister(event)">
                        <div class="form-group">
                            <label class="form-label" for="registerName">Full Name</label>
                            <input type="text" id="registerName" class="form-input" placeholder="Enter your full name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="registerEmail">Email Address</label>
                            <input type="email" id="registerEmail" class="form-input" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="registerPassword">Password</label>
                            <input type="password" id="registerPassword" class="form-input" placeholder="Create a password (min 8 characters)" required minlength="8">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" class="form-input" placeholder="Confirm your password" required>
                        </div>
                        <button type="submit" class="form-submit" id="registerSubmit">
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Chat Modal -->
        <div class="modal" id="chatModal">
            <div class="modal-container" style="height: 600px; display: flex; flex-direction: column;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 1.5rem; border-radius: 16px 16px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 1.2rem; font-weight: 600;">💙 AI Support Companion</h3>
                    <button class="modal-close" onclick="closeChat()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0.25rem; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" aria-label="Close chat">×</button>
                </div>
                <div id="chatMessages" style="flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; background: #fafafa;">
                    <!-- Messages will be added here dynamically -->
                </div>
                <div style="padding: 1.5rem; border-top: 1px solid #e5e7eb; display: flex; gap: 1rem; background: white;">
                    <input type="text" id="chatInput" placeholder="Type your message here..." onkeypress="handleKeyPress(event)" style="flex: 1; padding: 0.875rem 1rem; border: 1px solid #d1d5db; border-radius: 12px; font-size: 1rem; outline: none; transition: all 0.3s ease; background: #fafafa;" aria-label="Chat message input">
                    <button onclick="sendMessage()" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 0.875rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;" aria-label="Send message">Send</button>
                </div>
            </div>
        </div>
    `;
}