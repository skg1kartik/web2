// Chat functionality
let chatHistory = [];
let isTyping = false;

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load chat history for both users and guests
    const userId = currentUser ? currentUser.id : 'guest';
    const savedHistory = localStorage.getItem(`chatHistory_${userId}`);
    if (savedHistory) {
        try {
            chatHistory = JSON.parse(savedHistory);
        } catch (e) {
            chatHistory = [];
        }
    } else {
        chatHistory = [];
    }
});

function checkAuthAndOpenChat() {
    openChat();
    
    // Show sign-in prompt occasionally for guests
    if (!getCurrentUser() && Math.random() < 0.3) {
        setTimeout(() => {
            showMessage('💡 Sign up to save your chat history and track your progress over time!', 'success');
        }, 3000);
    }
}

function openChat() {
    document.getElementById('chatModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) chatInput.focus();
    }, 300);
    
    if (chatHistory.length === 0) {
        addWelcomeMessage();
    }
}

function closeChat() {
    document.getElementById('chatModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function addWelcomeMessage() {
    const userName = currentUser ? currentUser.name.split(' ')[0] : 'there';
    const welcomeMessages = [
        `Hello ${userName}! I'm here to listen and support you. How are you feeling today? This is a safe space to share whatever is on your mind. 💙`,
        `Hi ${userName}! I'm glad you're here. This is a judgment-free space where you can share anything that's on your mind. How can I support you today? 🤗`,
        `Welcome ${userName}! I want you to know that reaching out takes courage, and I'm here to listen. What would you like to talk about? 🌟`
    ];
    
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    addMessage(randomWelcome, 'bot');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (message && !isTyping) {
        addMessage(message, 'user');
        chatHistory.push({type: 'user', message: message, timestamp: new Date()});
        input.value = '';
        
        showTypingIndicator();
        
        setTimeout(() => {
            hideTypingIndicator();
            const response = generateAIResponse(message);
            addMessage(response, 'bot');
            chatHistory.push({type: 'bot', message: response, timestamp: new Date()});
            
            // Save chat history for both users and guests
            const userId = currentUser ? currentUser.id : 'guest';
            localStorage.setItem(`chatHistory_${userId}`, JSON.stringify(chatHistory.slice(-50)));
        }, 1500 + Math.random() * 1000);
    }
}

function showTypingIndicator() {
    isTyping = true;
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.style.cssText = `
        max-width: 80%;
        padding: 1rem 1.5rem;
        border-radius: 16px;
        line-height: 1.5;
        animation: messageSlide 0.3s ease-out;
        background: white;
        color: #374151;
        align-self: flex-start;
        border: 1px solid #e5e7eb;
        border-bottom-left-radius: 6px;
        display: flex;
        align-items: center;
        gap: 4px;
    `;
    
    typingDiv.innerHTML = `
        <div style="display: flex; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: typing 1.4s infinite ease-in-out;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: typing 1.4s infinite ease-in-out; animation-delay: -0.32s;"></span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; animation: typing 1.4s infinite ease-in-out; animation-delay: -0.16s;"></span>
        </div>
    `;
    
    // Add typing animation CSS
    if (!document.getElementById('typing-animation-style')) {
        const style = document.createElement('style');
        style.id = 'typing-animation-style';
        style.textContent = `
            @keyframes typing {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
            @keyframes messageSlide {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    const userName = currentUser ? currentUser.name.split(' ')[0] : '';
    
    // Crisis keywords detection
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'die', 'overdose', 'want to die', 'no point'];
    if (crisisKeywords.some(keyword => message.includes(keyword))) {
        return `🚨 ${userName}, I'm really concerned about you right now. Please reach out for immediate help: National Suicide Prevention Lifeline: 988, or text HOME to 741741. You matter, and there are people who want to help you through this. Are you in a safe place right now?`;
    }
    
    // Anxiety-related responses
    const anxietyKeywords = ['anxious', 'anxiety', 'panic', 'worried', 'stress', 'overwhelmed', 'nervous', 'scared'];
    if (anxietyKeywords.some(keyword => message.includes(keyword))) {
        const anxietyResponses = [
            `🌸 ${userName}, anxiety can feel overwhelming, but you're not alone in this. Try the 5-4-3-2-1 grounding technique: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. What's causing you the most worry right now?`,
            `💙 I hear that you're feeling anxious, ${userName}. That's a very real and valid feeling. Sometimes it helps to focus on your breathing - try breathing in for 4 counts, holding for 4, and out for 6. What situations tend to trigger your anxiety?`,
            `🤗 ${userName}, anxiety can make everything feel urgent and scary. Remember that feelings are temporary, even when they feel overwhelming. Have you tried any coping strategies that have helped you before?`
        ];
        return anxietyResponses[Math.floor(Math.random() * anxietyResponses.length)];
    }
    
    // Depression-related responses
    const depressionKeywords = ['depressed', 'sad', 'hopeless', 'empty', 'worthless', 'tired', 'exhausted', 'lonely', 'numb'];
    if (depressionKeywords.some(keyword => message.includes(keyword))) {
        const depressionResponses = [
            `💙 ${userName}, I'm sorry you're feeling this way. Depression can make everything feel heavy and difficult. Your feelings are valid, and it's okay to not be okay. Have you been able to do any small self-care activities today, even something as simple as drinking water?`,
            `🤗 Thank you for sharing something so personal with me, ${userName}. Depression can feel isolating, but you're taking a brave step by reaching out. Even small steps count. What's one tiny thing that used to bring you even a little joy?`,
            `🌟 ${userName}, I want you to know that what you're experiencing is real, and you deserve support. Depression lies to us about our worth. You matter, and your life has value. Have you been able to connect with any professional support?`
        ];
        return depressionResponses[Math.floor(Math.random() * depressionResponses.length)];
    }
    
    // Positive/gratitude responses
    const positiveKeywords = ['better', 'good', 'happy', 'grateful', 'thankful', 'improving', 'great', 'amazing'];
    if (positiveKeywords.some(keyword => message.includes(keyword))) {
        const positiveResponses = [
            `🌟 ${userName}, I'm so glad to hear you're feeling better! That's wonderful. What do you think has been helping you feel this way?`,
            `😊 It's beautiful to hear some positivity from you, ${userName}. These moments are worth celebrating, even the small ones. What's been going well for you?`,
            `💚 Thank you for sharing something positive with me, ${userName}. It's important to acknowledge and appreciate these feelings when they come. How can you nurture this positive feeling?`
        ];
        return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    }
    
    // Default empathetic responses
    const defaultResponses = [
        `💙 Thank you for sharing that with me, ${userName}. Your feelings are completely valid. Can you tell me more about what's been on your mind?`,
        `🤗 I hear you, ${userName}, and I want you to know that it's okay to feel this way. You're taking a brave step by reaching out. What would help you feel a little better right now?`,
        `🌸 That sounds really challenging, ${userName}. You're not alone in feeling this way. Have you been able to talk to anyone else about this?`,
        `💚 I appreciate you trusting me with this, ${userName}. It takes courage to open up. What kind of support do you think would be most helpful for you?`,
        `🌟 Your feelings matter, and so do you, ${userName}. Sometimes just talking about things can help lighten the load. Is there anything specific that's been weighing on you lately?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        max-width: 80%;
        padding: 1rem 1.5rem;
        border-radius: 16px;
        line-height: 1.5;
        animation: messageSlide 0.3s ease-out;
        ${sender === 'user' ? 
            'background: linear-gradient(135deg, #10b981, #059669); color: white; align-self: flex-end; border-bottom-right-radius: 6px;' : 
            'background: white; color: #374151; align-self: flex-start; border: 1px solid #e5e7eb; border-bottom-left-radius: 6px;'
        }
    `;
    messageDiv.textContent = text;
    
    const timestamp = document.createElement('div');
    timestamp.style.cssText = `
        font-size: 0.75rem;
        opacity: 0.6;
        margin-top: 0.25rem;
    `;
    timestamp.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    messageDiv.appendChild(timestamp);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}