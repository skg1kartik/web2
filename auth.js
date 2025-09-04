// Authentication functions

function openAuth(tab = 'login') {
    document.getElementById('authModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    switchAuthTab(tab);
    
    setTimeout(() => {
        const firstInput = document.querySelector(`#${tab}Form input`);
        if (firstInput) firstInput.focus();
    }, 300);
}

function closeAuth() {
    document.getElementById('authModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    clearAuthMessages();
}

function switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        
        // Update tab styles
        loginTab.style.background = 'white';
        loginTab.style.color = '#059669';
        loginTab.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        registerTab.style.background = 'transparent';
        registerTab.style.color = '#6b7280';
        registerTab.style.boxShadow = 'none';
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        
        // Update tab styles
        registerTab.style.background = 'white';
        registerTab.style.color = '#059669';
        registerTab.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        loginTab.style.background = 'transparent';
        loginTab.style.color = '#6b7280';
        loginTab.style.boxShadow = 'none';
    }
    
    clearAuthMessages();
}

function clearAuthMessages() {
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    if (loginMessage) loginMessage.innerHTML = '';
    if (registerMessage) registerMessage.innerHTML = '';
}

function showAuthMessage(message, type, formType) {
    const messageDiv = document.getElementById(`${formType}Message`);
    if (messageDiv) {
        messageDiv.innerHTML = `<div class="message-alert message-${type}">${message}</div>`;
    }
}

// Form handlers
function handleLogin(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('loginSubmit');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!emailInput || !passwordInput || !submitBtn) {
        showMessage('Form elements not found. Please refresh the page.', 'error');
        return;
    }
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Signing In...';
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            setCurrentUser({
                id: user.id,
                name: user.name,
                email: user.email,
                loginTime: new Date()
            });
            closeAuth();
            showMessage(`Welcome back, ${user.name}! 🎉`, 'success');
        } else {
            showAuthMessage('Invalid email or password. Please try again.', 'error', 'login');
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In';
    }, 1500);
}

function handleRegister(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('registerSubmit');
    const nameInput = document.getElementById('registerName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !submitBtn) {
        showMessage('Form elements not found. Please refresh the page.', 'error');
        return;
    }
    
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match.', 'error', 'register');
        return;
    }
    
    if (password.length < 8) {
        showAuthMessage('Password must be at least 8 characters long.', 'error', 'register');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating Account...';
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showAuthMessage('An account with this email already exists.', 'error', 'register');
        } else {
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                password: password,
                createdAt: new Date()
            };
            
            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            setCurrentUser({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                loginTime: new Date()
            });
            
            closeAuth();
            showMessage(`Welcome to Psych2Day, ${name}! Your account has been created successfully. 🎉`, 'success');
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
    }, 2000);
}

function socialLogin(provider) {
    showMessage(`${provider} login is not available in this demo. Please use email registration.`, 'error');
}

function showForgotPassword() {
    showMessage('Password reset functionality would be implemented in the full version.', 'success');
}