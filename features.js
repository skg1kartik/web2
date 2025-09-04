// Features functionality
let breathingInterval;
let isBreathing = false;
let breathingPhase = 'inhale';
let breathingCount = 0;

// Load feature modals when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadFeatureModals();
});

function loadFeatureModals() {
    const container = document.getElementById('feature-modals-container');
    if (container) {
        container.innerHTML = getFeatureModalsHTML();
    }
}

// Mindfulness functions
function openMindfulness() {
    document.getElementById('mindfulnessModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeMindfulness() {
    document.getElementById('mindfulnessModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    stopBreathing();
}

function startBreathing() {
    if (isBreathing) return;
    
    isBreathing = true;
    breathingPhase = 'inhale';
    breathingCount = 0;
    
    const startBtn = document.getElementById('startBreathing');
    const stopBtn = document.getElementById('stopBreathing');
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    
    if (!startBtn || !stopBtn || !circle || !text) return;
    
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    function breathingCycle() {
        if (!isBreathing) return;
        
        switch(breathingPhase) {
            case 'inhale':
                text.textContent = 'Breathe In';
                circle.className = 'breathing-circle inhale';
                setTimeout(() => {
                    if (isBreathing) {
                        breathingPhase = 'hold';
                        breathingCycle();
                    }
                }, 4000);
                break;
                
            case 'hold':
                text.textContent = 'Hold';
                circle.className = 'breathing-circle';
                setTimeout(() => {
                    if (isBreathing) {
                        breathingPhase = 'exhale';
                        breathingCycle();
                    }
                }, 7000);
                break;
                
            case 'exhale':
                text.textContent = 'Breathe Out';
                circle.className = 'breathing-circle exhale';
                setTimeout(() => {
                    if (isBreathing) {
                        breathingCount++;
                        breathingPhase = 'inhale';
                        if (breathingCount < 10) {
                            breathingCycle();
                        } else {
                            stopBreathing();
                            
                            // Track breathing session (for both users and guests)
                            const userId = currentUser ? currentUser.id : 'guest';
                            const sessions = parseInt(localStorage.getItem(`breathingSessions_${userId}`) || '0');
                            localStorage.setItem(`breathingSessions_${userId}`, (sessions + 1).toString());
                            
                            // Show sign-in prompt occasionally for guests
                            if (!currentUser && Math.random() < 0.4) {
                                setTimeout(() => {
                                    showMessage('🧘 Sign up to track your mindfulness progress and set daily meditation goals!', 'success');
                                }, 1000);
                            }
                            
                            showMessage('Great job! You completed a full breathing session. 🌟', 'success');
                        }
                    }
                }, 8000);
                break;
        }
    }
    
    breathingCycle();
}

function stopBreathing() {
    isBreathing = false;
    
    const startBtn = document.getElementById('startBreathing');
    const stopBtn = document.getElementById('stopBreathing');
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    if (circle) circle.className = 'breathing-circle';
    if (text) text.textContent = 'Click Start';
}

// Other feature functions
function openTherapistFinder() {
    document.getElementById('therapistModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    showTherapistSearchForm();
}

function closeTherapistFinder() {
    document.getElementById('therapistModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openResources() {
    document.getElementById('resourcesModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    populateResources();
}

function closeResources() {
    document.getElementById('resourcesModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openSupportGroups() {
    document.getElementById('supportGroupsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    populateSupportGroups();
}

function closeSupportGroups() {
    document.getElementById('supportGroupsModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openCrisisSupport() {
    document.getElementById('crisisModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCrisisSupport() {
    document.getElementById('crisisModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Therapist finder functionality
function showTherapistSearchForm() {
    const resultsContainer = document.getElementById('therapistResults');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: #f8fafc; border-radius: 12px; margin-bottom: 2rem;">
            <h3 style="color: #1f2937; margin-bottom: 1rem;">🔍 Find Mental Health Professionals</h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">Enter your location and preferences to find licensed therapists in your area</p>
            
            <div style="max-width: 500px; margin: 0 auto;">
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="locationInput" placeholder="Enter your city, state, or ZIP code" 
                           style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="specialtyInput" placeholder="Specialty (e.g., anxiety, depression, trauma)" 
                           style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <input type="text" id="insuranceInput" placeholder="Insurance provider (optional)" 
                           style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;">
                </div>
                <button onclick="searchTherapists()" class="btn-primary" style="width: 100%; padding: 0.875rem;">
                    🔍 Search Therapists
                </button>
            </div>
        </div>
        
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem;">
            <h4 style="color: #1f2937; margin-bottom: 1rem;">📋 How to Find the Right Therapist</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <div>
                    <h5 style="color: #059669; margin-bottom: 0.5rem;">🎯 Consider Your Needs</h5>
                    <p style="color: #6b7280; font-size: 0.9rem;">Think about what you want to work on - anxiety, depression, relationships, trauma, etc.</p>
                </div>
                <div>
                    <h5 style="color: #059669; margin-bottom: 0.5rem;">💳 Check Insurance</h5>
                    <p style="color: #6b7280; font-size: 0.9rem;">Verify if the therapist accepts your insurance or offers sliding scale fees.</p>
                </div>
                <div>
                    <h5 style="color: #059669; margin-bottom: 0.5rem;">📍 Location & Format</h5>
                    <p style="color: #6b7280; font-size: 0.9rem;">Decide if you prefer in-person, online, or hybrid therapy sessions.</p>
                </div>
                <div>
                    <h5 style="color: #059669; margin-bottom: 0.5rem;">🤝 Personal Fit</h5>
                    <p style="color: #6b7280; font-size: 0.9rem;">It's okay to try a few therapists to find someone you feel comfortable with.</p>
                </div>
            </div>
        </div>
    `;
}

function searchTherapists() {
    const locationInput = document.getElementById('locationInput');
    const specialtyInput = document.getElementById('specialtyInput');
    const insuranceInput = document.getElementById('insuranceInput');
    
    if (!locationInput) {
        showMessage('Search form not found. Please try again.', 'error');
        return;
    }
    
    const location = locationInput.value.trim();
    const specialty = specialtyInput ? specialtyInput.value.trim() : '';
    const insurance = insuranceInput ? insuranceInput.value.trim() : '';
    
    if (!location) {
        showMessage('Please enter your location to search for therapists.', 'error');
        return;
    }
    
    // Show loading state
    const button = event && event.target ? event.target : document.querySelector('button[onclick="searchTherapists()"]');
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading-spinner"></span> Searching...';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            showTherapistSearchResults(location, specialty, insurance);
        }, 2000);
    } else {
        setTimeout(() => {
            showTherapistSearchResults(location, specialty, insurance);
        }, 1000);
    }
}

function showTherapistSearchResults(location, specialty, insurance) {
    const resultsContainer = document.getElementById('therapistResults');
    if (!resultsContainer) return;
    
    const searchParams = new URLSearchParams();
    if (location) searchParams.append('location', location);
    if (specialty) searchParams.append('specialty', specialty);
    if (insurance) searchParams.append('insurance', insurance);
    
    const psychologyTodayUrl = `https://www.psychologytoday.com/us/therapists?${searchParams.toString()}`;
    
    resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h3 style="color: #1f2937; margin-bottom: 1rem;">🎯 Search Results for "${location}"</h3>
            <p style="color: #6b7280; margin-bottom: 2rem;">We've prepared personalized search links for you on trusted therapist directories</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                    <h4 style="color: #059669; margin-bottom: 1rem;">🔍 Psychology Today</h4>
                    <p style="color: #6b7280; margin-bottom: 1rem; font-size: 0.9rem;">Search therapists in ${location}${specialty ? ` specializing in ${specialty}` : ''}</p>
                    <a href="${psychologyTodayUrl}" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 0.75rem 1.5rem;">
                        Search Now →
                    </a>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                    <h4 style="color: #059669; margin-bottom: 1rem;">💻 Online Therapy</h4>
                    <p style="color: #6b7280; margin-bottom: 1rem; font-size: 0.9rem;">Connect with licensed therapists online from anywhere</p>
                    <a href="https://www.betterhelp.com" target="_blank" class="btn-secondary" style="display: inline-block; text-decoration: none; padding: 0.75rem 1.5rem;">
                        Try BetterHelp →
                    </a>
                </div>
                
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                    <h4 style="color: #059669; margin-bottom: 1rem;">💰 Affordable Options</h4>
                    <p style="color: #6b7280; margin-bottom: 1rem; font-size: 0.9rem;">Find therapists offering sliding scale or reduced fees</p>
                    <a href="https://www.openpathcollective.org" target="_blank" class="btn-secondary" style="display: inline-block; text-decoration: none; padding: 0.75rem 1.5rem;">
                        Open Path →
                    </a>
                </div>
            </div>
            
            <button onclick="showTherapistSearchForm()" class="btn-secondary" style="margin-top: 1rem;">
                ← Search Again
            </button>
        </div>
    `;
    
    showMessage(`🎯 Found therapist directories for ${location}! Click the links above to browse available professionals.`, 'success');
}

function populateResources() {
    const container = document.getElementById('resourcesContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #059669; margin-bottom: 1rem;">📖 Educational Resources</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="https://www.nimh.nih.gov" target="_blank" style="color: #374151; text-decoration: none;">• NIMH - Mental Health Information</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="https://www.mentalhealth.gov" target="_blank" style="color: #374151; text-decoration: none;">• MentalHealth.gov</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="https://www.nami.org" target="_blank" style="color: #374151; text-decoration: none;">• NAMI - National Alliance on Mental Illness</a></li>
                </ul>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #059669; margin-bottom: 1rem;">📱 Mental Health Apps</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;">• Headspace - Meditation & Mindfulness</li>
                    <li style="margin-bottom: 0.75rem;">• Calm - Sleep & Relaxation</li>
                    <li style="margin-bottom: 0.75rem;">• Sanvello - Anxiety & Depression</li>
                </ul>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #059669; margin-bottom: 1rem;">📚 Self-Help Books</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;">• "Feeling Good" by David D. Burns</li>
                    <li style="margin-bottom: 0.75rem;">• "The Anxiety and Worry Workbook" by David A. Clark</li>
                    <li style="margin-bottom: 0.75rem;">• "Mind Over Mood" by Dennis Greenberger</li>
                </ul>
            </div>
        </div>
    `;
}

function populateSupportGroups() {
    const container = document.getElementById('supportGroupsContent');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #059669; margin-bottom: 1rem;">🌐 Online Support Groups</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;"><a href="https://www.7cups.com" target="_blank" style="color: #374151; text-decoration: none;">• 7 Cups - Free Emotional Support</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="https://www.supportgroups.com" target="_blank" style="color: #374151; text-decoration: none;">• SupportGroups.com</a></li>
                    <li style="margin-bottom: 0.75rem;"><a href="https://www.reddit.com/r/mentalhealth" target="_blank" style="color: #374151; text-decoration: none;">• Reddit Mental Health Communities</a></li>
                </ul>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #059669; margin-bottom: 1rem;">🏢 Local Support Groups</h4>
                <p style="color: #6b7280; margin-bottom: 1rem;">Find in-person support groups in your area:</p>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;">• Contact your local NAMI chapter</li>
                    <li style="margin-bottom: 0.75rem;">• Check community centers</li>
                    <li style="margin-bottom: 0.75rem;">• Ask your healthcare provider</li>
                </ul>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem;">
                <h4 style="color: #059669; margin-bottom: 1rem;">🎯 Specialized Groups</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.75rem;">• Anxiety and Depression Association</li>
                    <li style="margin-bottom: 0.75rem;">• PTSD Support Groups</li>
                    <li style="margin-bottom: 0.75rem;">• Grief and Loss Support</li>
                </ul>
            </div>
        </div>
    `;
}

function getFeatureModalsHTML() {
    return `
        <!-- Mindfulness Modal -->
        <div class="modal" id="mindfulnessModal">
            <div class="modal-container" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="color: #1f2937; font-size: 1.8rem; font-weight: 700;">🧘 Mindfulness & Breathing Exercises</h2>
                    <button class="modal-close" onclick="closeMindfulness()" aria-label="Close">×</button>
                </div>
                <div style="padding: 2rem;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <p style="color: #6b7280; font-size: 1.1rem;">Take a moment to center yourself with guided breathing exercises</p>
                    </div>
                    
                    <!-- Breathing Exercise -->
                    <div style="text-align: center; margin-bottom: 3rem;">
                        <h3 style="color: #1f2937; margin-bottom: 1rem;">4-7-8 Breathing Technique</h3>
                        <div id="breathingCircle" class="breathing-circle" style="width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); margin: 2rem auto; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; font-weight: 600; transition: all 4s ease-in-out; box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);">
                            <span id="breathingText">Click Start</span>
                        </div>
                        <div style="text-align: center; margin-top: 2rem;">
                            <button id="startBreathing" onclick="startBreathing()" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-weight: 600; cursor: pointer; margin: 0 0.5rem; transition: all 0.3s ease;">Start Breathing</button>
                            <button id="stopBreathing" onclick="stopBreathing()" disabled style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 1rem 2rem; border-radius: 12px; font-weight: 600; cursor: pointer; margin: 0 0.5rem; transition: all 0.3s ease; opacity: 0.6;">Stop</button>
                        </div>
                        <p style="color: #6b7280; margin-top: 1rem; max-width: 400px; margin-left: auto; margin-right: auto;">
                            Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. This technique helps reduce anxiety and promote relaxation.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Therapist Finder Modal -->
        <div class="modal" id="therapistModal">
            <div class="modal-container" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="color: #1f2937; font-size: 1.8rem; font-weight: 700;">👥 Find Mental Health Professionals</h2>
                    <button class="modal-close" onclick="closeTherapistFinder()" aria-label="Close">×</button>
                </div>
                <div style="padding: 2rem;">
                    <div id="therapistResults">
                        <!-- Results will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Resources Modal -->
        <div class="modal" id="resourcesModal">
            <div class="modal-container" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="color: #1f2937; font-size: 1.8rem; font-weight: 700;">📚 Mental Health Resources</h2>
                    <button class="modal-close" onclick="closeResources()" aria-label="Close">×</button>
                </div>
                <div style="padding: 2rem;">
                    <div id="resourcesContent">
                        <!-- Resources will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Support Groups Modal -->
        <div class="modal" id="supportGroupsModal">
            <div class="modal-container" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="color: #1f2937; font-size: 1.8rem; font-weight: 700;">🤝 Support Groups & Communities</h2>
                    <button class="modal-close" onclick="closeSupportGroups()" aria-label="Close">×</button>
                </div>
                <div style="padding: 2rem;">
                    <div id="supportGroupsContent">
                        <!-- Support groups will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Crisis Support Modal -->
        <div class="modal" id="crisisModal">
            <div class="modal-container" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 style="color: #1f2937; font-size: 1.8rem; font-weight: 700;">🚨 Crisis Support & Emergency Resources</h2>
                    <button class="modal-close" onclick="closeCrisisSupport()" aria-label="Close">×</button>
                </div>
                <div style="padding: 2rem;">
                    <!-- Emergency Warning -->
                    <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
                        <h3 style="color: #991b1b; font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem;">🚨 If you're in immediate danger, call 911 now</h3>
                        <p style="color: #7f1d1d; font-weight: 500; line-height: 1.6;">If you're having thoughts of suicide or self-harm, please reach out for help immediately. You are not alone, and there are people who want to help you.</p>
                    </div>

                    <!-- Crisis Hotlines -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border: 2px solid #f87171; border-radius: 12px; padding: 1.5rem; text-align: center;">
                            <div style="font-size: 1.2rem; font-weight: 700; color: #991b1b; margin-bottom: 0.5rem;">National Suicide Prevention Lifeline</div>
                            <div style="font-size: 2rem; font-weight: 800; color: #dc2626; margin: 1rem 0; letter-spacing: 2px;">988</div>
                            <div style="color: #7f1d1d; font-weight: 500; margin-bottom: 1rem;">24/7 free and confidential support for people in distress</div>
                            <a href="tel:988" style="background: #dc2626; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block;">Call Now</a>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #fee2e2, #fecaca); border: 2px solid #f87171; border-radius: 12px; padding: 1.5rem; text-align: center;">
                            <div style="font-size: 1.2rem; font-weight: 700; color: #991b1b; margin-bottom: 0.5rem;">Crisis Text Line</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: #dc2626; margin: 1rem 0;">Text HOME to 741741</div>
                            <div style="color: #7f1d1d; font-weight: 500; margin-bottom: 1rem;">24/7 crisis support via text message</div>
                            <a href="sms:741741?body=HOME" style="background: #dc2626; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-block;">Text Now</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}