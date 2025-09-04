// Community functionality

function checkAuthAndOpenCommunity() {
    openCommunity();
    
    // Show sign-in prompt occasionally for guests
    if (!getCurrentUser() && Math.random() < 0.4) {
        setTimeout(() => {
            showMessage('🌟 Create an account to connect with others, share your story, and build meaningful relationships in our safe community!', 'success');
        }, 2000);
    }
}

function openCommunity() {
    showMessage('🌟 Community features are coming soon! Connect with others who understand your journey in a safe, moderated environment.', 'success');
}