// Calendar Application
let currentDate = new Date();
let events = [];
let isAdmin = false;

// UPI Payment Configuration - UPDATE THESE WITH YOUR DETAILS
const UPI_CONFIG = {
    upiId: 'ramagencycsc@okaxis',  // Replace with your actual UPI ID (e.g., 9842422929@oksbi)
    name: 'RPN Travels',
    defaultNote: 'Bus booking payment'
};

// DOM Elements
const daysGrid = document.getElementById('daysGrid');
const currentMonthEl = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const eventModal = document.getElementById('eventModal');
const adminModal = document.getElementById('adminModal');
const addEventBtn = document.getElementById('addEventBtn');
const adminBtn = document.getElementById('adminBtn');
const eventForm = document.getElementById('eventForm');
const adminForm = document.getElementById('adminForm');
const eventsList = document.getElementById('eventsList');
const closeBtns = document.querySelectorAll('.close');
const cancelBtns = document.querySelectorAll('.cancel-btn');

// Navigation Elements
const calendarBtn = document.getElementById('calendarBtn');
const homeBtn = document.getElementById('homeBtn');
const travelsSection = document.getElementById('travels-section');
const calendarSection = document.getElementById('calendar-section');

// Payment Elements
const paymentModal = document.getElementById('paymentModal');
const paymentForm = document.getElementById('paymentForm');
const paymentCloseBtns = document.querySelectorAll('.payment-close');
const upiPaymentLink = document.getElementById('upiPaymentLink');
const upiLink = document.getElementById('upiLink');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    renderCalendar();
    renderEvents();
    setupEventListeners();
    setupNavigation();
    setupPayment();
    displayUPIId();
});

// Load events from localStorage
function loadEvents() {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
        events = JSON.parse(storedEvents);
    }
}

// Save events to localStorage
function saveEvents() {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

// Setup Navigation
function setupNavigation() {
    if (calendarBtn) {
        calendarBtn.addEventListener('click', () => {
            travelsSection.classList.add('hidden');
            calendarSection.classList.remove('hidden');
            renderCalendar();
            renderEvents();
        });
    }

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            calendarSection.classList.add('hidden');
            travelsSection.classList.remove('hidden');
        });
    }

    // Map Button Navigation
    const mapBtn = document.getElementById('mapBtn');
    const mapSection = document.getElementById('map-section');
    const mapHomeBtn = document.getElementById('mapHomeBtn');

    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            travelsSection.classList.add('hidden');
            if (calendarSection) calendarSection.classList.add('hidden');
            mapSection.classList.remove('hidden');
        });
    }

    if (mapHomeBtn) {
        mapHomeBtn.addEventListener('click', () => {
            mapSection.classList.add('hidden');
            travelsSection.classList.remove('hidden');
        });
    }

    // EMI Calculator Button
    const emiBtn = document.getElementById('emiBtn');
    if (emiBtn) {
        emiBtn.addEventListener('click', () => {
            window.open('EMI CALCULATOR/index.html', '_blank');
        });
    }
}

// Setup Event Listeners
function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => openModal());
    }
    
    if (adminBtn) {
        adminBtn.addEventListener('click', () => openAdminModal());
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            eventModal.style.display = 'none';
            adminModal.style.display = 'none';
        });
    });

    cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            eventModal.style.display = 'none';
            adminModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === eventModal) {
            eventModal.style.display = 'none';
        }
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    if (eventForm) {
        eventForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
}

// Change Month
function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

// Render Calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    currentMonthEl.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    daysGrid.innerHTML = '';

    const today = new Date();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayEl = createDayElement(daysInPrevMonth - i, true);
        daysGrid.appendChild(dayEl);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() &&
                       month === today.getMonth() &&
                       year === today.getFullYear();
        const dayEl = createDayElement(i, false, isToday, year, month);
        daysGrid.appendChild(dayEl);
    }

    // Next month days
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;

    for (let i = 1; i <= remainingCells; i++) {
        const dayEl = createDayElement(i, true);
        daysGrid.appendChild(dayEl);
    }
}

// Create Day Element
function createDayElement(day, isOtherMonth, isToday = false, year, month) {
    const dayEl = document.createElement('div');
    dayEl.className = `day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);

    if (!isOtherMonth && year && month) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);

        if (dayEvents.length > 0) {
            // Show booked indicator for all users
            const bookedIndicator = document.createElement('div');
            bookedIndicator.className = 'event-indicator booked-indicator';
            bookedIndicator.textContent = 'Booked';
            dayEl.appendChild(bookedIndicator);

            // Only show event details to admin
            if (isAdmin) {
                dayEvents.slice(0, 2).forEach(event => {
                    const detailIndicator = document.createElement('div');
                    detailIndicator.className = 'event-indicator admin-indicator';
                    detailIndicator.textContent = event.name;
                    dayEl.appendChild(detailIndicator);
                });

                if (dayEvents.length > 2) {
                    const more = document.createElement('div');
                    more.className = 'event-indicator admin-indicator';
                    more.textContent = `+${dayEvents.length - 2} more`;
                    dayEl.appendChild(more);
                }
            }
        }

        dayEl.addEventListener('click', () => {
            if (dayEvents.length > 0) {
                // Show existing event(s) - admin sees details, others see "Booked"
                if (dayEvents.length === 1) {
                    showEventDetails(dayEvents[0], isAdmin);
                } else {
                    showEventList(dayEvents, dateStr);
                }
            } else {
                // No event - open add event modal
                openModal(dateStr);
            }
        });
    }

    return dayEl;
}

// Open Event Modal
function openModal(date = '') {
    // Check if date already has an event
    if (date) {
        const existingEvent = events.find(e => e.date === date);
        if (existingEvent && !isAdmin) {
            alert('This date already has an event. Only admin can add multiple events on the same date.');
            return;
        }
    }
    
    document.getElementById('eventId').value = '';
    document.getElementById('purpose').value = '';
    document.getElementById('Name').value = '';
    document.getElementById('Date').value = date;
    document.getElementById('Time').value = '';
    document.getElementById('Address').value = '';
    document.getElementById('Phone').value = '';
    document.getElementById('Description').value = '';
    document.getElementById('Document').value = '';
    document.getElementById('modalTitle').textContent = 'Add Event';
    eventModal.style.display = 'block';
}

// Show Event Details (when clicking on a day with existing event)
function showEventDetails(event, isAdminMode) {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let detailsHTML = `
        <div class="event-details-view">
            <h4>${isAdminMode ? escapeHtml(event.name) : '📅 Booked'}</h4>
            ${isAdminMode && event.purpose ? `<p><strong>Purpose:</strong> ${escapeHtml(event.purpose)}</p>` : ''}
            <p class="event-date">📅 ${eventDate}</p>
            ${isAdminMode && event.time ? `<p>⏰ ${event.time}</p>` : ''}
            ${isAdminMode ? `<p>📍 ${escapeHtml(event.address)}</p>` : ''}
            ${isAdminMode ? `<p>📞 ${escapeHtml(event.phone)}</p>` : ''}
            ${isAdminMode && event.description ? `<p>📝 ${escapeHtml(event.description)}</p>` : ''}
            ${isAdminMode && event.documentName ? `
                <div class="event-document">
                    <strong>📎 Document:</strong>
                    <a href="${event.documentData}" download="${event.documentName}" class="download-link" target="_blank">
                        📄 ${escapeHtml(event.documentName)}
                    </a>
                </div>
            ` : ''}
            ${!isAdminMode ? `
                <p class="booked-message">This date is already booked. Please select another date.</p>
            ` : ''}
            ${isAdminMode ? `
                <div class="admin-event-actions">
                    <button class="edit-event-btn" onclick="editEventFromView('${event.id}')">✏️ Edit</button>
                    <button class="add-another-btn" onclick="openModal('${event.date}')">➕ Add Another Event</button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Show in a custom modal or alert
    const customModal = document.createElement('div');
    customModal.className = 'modal event-details-modal';
    customModal.innerHTML = `
        <div class="modal-content">
            <span class="close event-details-close">&times;</span>
            <h2>📋 Event Details</h2>
            ${detailsHTML}
            <div class="form-actions">
                <button type="button" class="cancel-btn close-details-btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(customModal);
    customModal.style.display = 'block';
    
    // Close handlers
    const closeBtn = customModal.querySelector('.event-details-close');
    const closeDetailsBtn = customModal.querySelector('.close-details-btn');
    
    closeBtn.addEventListener('click', () => {
        customModal.remove();
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        customModal.remove();
    });
    
    customModal.addEventListener('click', (e) => {
        if (e.target === customModal) {
            customModal.remove();
        }
    });
}

// Show Multiple Events List
function showEventList(dayEvents, dateStr) {
    const sortedEvents = [...dayEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

    let eventsHTML = '';
    
    if (isAdmin) {
        // Admin sees all event details
        eventsHTML = sortedEvents.map(event => `
            <div class="event-card-mini">
                <h4>${escapeHtml(event.name)}</h4>
                ${event.purpose ? `<p><strong>Purpose:</strong> ${escapeHtml(event.purpose)}</p>` : ''}
                ${event.time ? `<p>⏰ ${event.time}</p>` : ''}
                ${event.description ? `<p>📝 ${escapeHtml(event.description)}</p>` : ''}
                ${isAdmin ? `<button class="delete-mini-btn" onclick="deleteEvent('${event.id}')">🗑️ Delete</button>` : ''}
            </div>
        `).join('');
    } else {
        // Non-admin users only see "Booked" message
        eventsHTML = `
            <div class="booked-message-container">
                <p class="booked-message-large">📅 This date is booked</p>
                <p class="booked-submessage">Multiple events are scheduled on this date. Please select another date.</p>
            </div>
        `;
    }

    const customModal = document.createElement('div');
    customModal.className = 'modal event-details-modal';
    customModal.innerHTML = `
        <div class="modal-content">
            <span class="close event-details-close">&times;</span>
            <h2>📋 Events on ${dateStr}</h2>
            <div class="events-list-mini">
                ${eventsHTML}
            </div>
            ${isAdmin ? `<button class="add-another-btn" onclick="openModal('${dateStr}')">➕ Add Another Event</button>` : ''}
            <div class="form-actions">
                <button type="button" class="cancel-btn close-details-btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(customModal);
    customModal.style.display = 'block';
    
    // Close handlers
    const closeBtn = customModal.querySelector('.event-details-close');
    const closeDetailsBtn = customModal.querySelector('.close-details-btn');
    
    closeBtn.addEventListener('click', () => {
        customModal.remove();
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        customModal.remove();
    });
    
    customModal.addEventListener('click', (e) => {
        if (e.target === customModal) {
            customModal.remove();
        }
    });
}

// Edit Event from View
function editEventFromView(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Close any open modals
    document.querySelectorAll('.event-details-modal').forEach(m => m.remove());
    
    // Populate form with event data
    document.getElementById('eventId').value = event.id;
    document.getElementById('purpose').value = event.purpose || '';
    document.getElementById('Name').value = event.name || '';
    document.getElementById('Date').value = event.date || '';
    document.getElementById('Time').value = event.time || '';
    document.getElementById('Address').value = event.address || '';
    document.getElementById('Phone').value = event.phone || '';
    document.getElementById('Description').value = event.description || '';
    document.getElementById('Document').value = '';
    document.getElementById('modalTitle').textContent = 'Edit Event';
    eventModal.style.display = 'block';
}

// Open Admin Modal
function openAdminModal() {
    if (isAdmin) {
        // Logout
        isAdmin = false;
        adminBtn.textContent = 'Admin Login';
        adminBtn.classList.remove('logged-in');
        renderEvents();
    } else {
        document.getElementById('adminPassword').value = '';
        adminModal.style.display = 'block';
    }
}

// Handle Admin Login
function handleAdminLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;

    // Simple admin password (in production, use proper authentication)
    if (password === 'Pathu123') {
        isAdmin = true;
        adminBtn.textContent = 'Logout';
        adminBtn.classList.add('logged-in');
        adminModal.style.display = 'none';
        renderEvents();
        alert('Admin login successful!');
    } else {
        alert('Invalid password!');
    }
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('eventId').value;
    const selectedDate = document.getElementById('Date').value;
    
    // Check for duplicate date (only for new events, not updates)
    if (!id && selectedDate) {
        const existingEvent = events.find(e => e.date === selectedDate);
        if (existingEvent && !isAdmin) {
            alert('An event already exists on this date. Only admin can add multiple events on the same date.');
            return;
        }
    }
    
    // Handle file upload
    const fileInput = document.getElementById('Document');
    let fileName = '';
    let fileData = '';
    
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (file.size > maxSize) {
            alert('File size should be less than 5MB');
            return;
        }
        
        fileName = file.name;
        // Convert file to base64 for localStorage storage
        const reader = new FileReader();
        reader.onload = function(event) {
            fileData = event.target.result;
            saveEvent(id, fileData, fileName);
        };
        reader.readAsDataURL(file);
    } else {
        saveEvent(id, '', '');
    }
}

// Save Event (helper function)
function saveEvent(id, fileData, fileName) {
    const event = {
        id: id || Date.now().toString(),
        name: document.getElementById('Name').value,
        purpose: document.getElementById('purpose').value,
        date: document.getElementById('Date').value,
        time: document.getElementById('Time').value,
        address: document.getElementById('Address').value,
        phone: document.getElementById('Phone').value,
        description: document.getElementById('Description').value,
        documentName: fileName,
        documentData: fileData
    };

    if (id) {
        // Update existing event
        const index = events.findIndex(ev => ev.id === id);
        if (index !== -1) {
            events[index] = event;
        }
    } else {
        // Add new event
        events.push(event);
    }

    saveEvents();
    renderCalendar();
    renderEvents();
    eventModal.style.display = 'none';
}

// Render Events List
function renderEvents() {
    if (!eventsList) return;

    if (events.length === 0) {
        eventsList.innerHTML = '<p class="no-events">No events scheduled. Click "Add Event" to create one!</p>';
        return;
    }

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    if (isAdmin) {
        // Admin sees all event details
        eventsList.innerHTML = sortedEvents.map(event => {
            const eventDate = new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return `
                <div class="event-card">
                    <button class="delete-btn ${isAdmin ? 'visible' : ''}" onclick="deleteEvent('${event.id}')">
                        🗑️ Delete
                    </button>
                    <h4>${escapeHtml(event.name)}</h4>
                    ${event.purpose ? `<p><strong>Purpose:</strong> ${escapeHtml(event.purpose)}</p>` : ''}
                    <p class="event-date">📅 ${eventDate}</p>
                    ${event.time ? `<p>⏰ ${event.time}</p>` : ''}
                    <p>📍 ${escapeHtml(event.address)}</p>
                    <p>📞 ${escapeHtml(event.phone)}</p>
                    ${event.description ? `<p>📝 ${escapeHtml(event.description)}</p>` : ''}
                    ${event.documentName ? `
                        <div class="event-document">
                            <strong>📎 Document:</strong>
                            <a href="${event.documentData}" download="${event.documentName}" class="download-link" target="_blank">
                                📄 ${escapeHtml(event.documentName)}
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    } else {
        // Non-admin users only see booked dates without details
        eventsList.innerHTML = sortedEvents.map(event => {
            const eventDate = new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return `
                <div class="event-card booked-card">
                    <h4>📅 Booked</h4>
                    <p class="event-date">📅 ${eventDate}</p>
                    <p class="booked-submessage">Contact admin for details</p>
                </div>
            `;
        }).join('');
    }
}

// Delete Event (Admin only)
function deleteEvent(id) {
    if (!isAdmin) {
        alert('You must be logged in as admin to delete events!');
        return;
    }

    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        renderCalendar();
        renderEvents();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make deleteEvent available globally
window.deleteEvent = deleteEvent;

// ========================================
// UPI PAYMENT FUNCTIONS
// ========================================

// Setup Payment
function setupPayment() {
    // Payment modal close buttons
    paymentCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentModal.style.display = 'none';
            upiPaymentLink.classList.add('hidden');
        });
    });

    // Payment form submit
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    // Cancel button in payment modal
    const paymentCancelBtns = document.querySelectorAll('#paymentModal .cancel-btn');
    paymentCancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentModal.style.display = 'none';
            upiPaymentLink.classList.add('hidden');
        });
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
            upiPaymentLink.classList.add('hidden');
        }
    });
}

// Display UPI ID
function displayUPIId() {
    const upiIdElement = document.getElementById('upiId');
    if (upiIdElement) {
        upiIdElement.textContent = UPI_CONFIG.upiId;
    }
}

// Pay with UPI app
function payWithUPI(app) {
    if (paymentModal) {
        paymentForm.reset();
        upiPaymentLink.classList.add('hidden');
        paymentModal.style.display = 'block';
    }
}

// Handle Payment Form Submit
function handlePaymentSubmit(e) {
    e.preventDefault();

    const amount = document.getElementById('paymentAmount').value;
    const name = document.getElementById('paymentName').value;
    const purpose = document.getElementById('paymentPurpose').value;
    const phone = document.getElementById('paymentPhone').value;

    // Generate UPI payment link
    const upiUrl = generateUPILink(amount, name, purpose);

    // Show payment link section
    upiLink.href = upiUrl;
    upiPaymentLink.classList.remove('hidden');

    // Save payment details to localStorage (for admin tracking)
    savePaymentDetails(amount, name, purpose, phone);

    alert('Click "Open UPI App" to complete payment or scan the QR code with any UPI app.');
}

// Generate UPI Payment Link
function generateUPILink(amount, name, purpose) {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_CONFIG.upiId)}&pn=${encodeURIComponent(UPI_CONFIG.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(purpose + ' - ' + name)}`;
    return upiUrl;
}

// Save Payment Details to localStorage
function savePaymentDetails(amount, name, purpose, phone) {
    const payments = JSON.parse(localStorage.getItem('rpnPayments') || '[]');
    payments.push({
        id: Date.now().toString(),
        amount: amount,
        name: name,
        purpose: purpose,
        phone: phone,
        date: new Date().toISOString(),
        status: 'Pending'
    });
    localStorage.setItem('rpnPayments', JSON.stringify(payments));
}

// Copy UPI ID
function copyUPI() {
    const upiId = UPI_CONFIG.upiId;
    navigator.clipboard.writeText(upiId).then(() => {
        alert('UPI ID copied to clipboard!');
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = upiId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('UPI ID copied to clipboard!');
    });
}

// Make payment functions available globally
window.payWithUPI = payWithUPI;
window.copyUPI = copyUPI;
window.editEventFromView = editEventFromView;

// ========================================
// RPN AI CHATBOT
// ========================================

// AI Configuration
const AI_CONFIG = {
    apiEndpoint: 'http://localhost:3000/api/chat', // Backend server URL
    // For production, change to your deployed server URL:
    // apiEndpoint: 'https://your-server.com/api/chat'
    model: 'gpt-3.5-turbo',
    systemPrompt: `You are RPN AI, a helpful assistant for RPN Travels (Google Bus).
Company Info:
- Operating since 1973 (52+ years of service)
- Phone: 9842422929, 8072560787
- Email: rpntravels@gmail.com, rpntravels@yahoo.com

Services:
- Tourist bus booking for marriages, college tours, family functions
- Special tours: Navagraham Tour, Kovil Tour, Thirupathi Tour, Arupadai Tour, Sabarimalai Tour

Features:
- Reliable Services
- Affordable Prices
- Safety First
- Customer Satisfaction

Be friendly, concise, and helpful. If you don't know something, suggest contacting the company directly.`
};

// Chat state
let chatHistory = [];

// Initialize AI Chat
function setupAIChat() {
    const aiBtn = document.getElementById('rpnAiBtn');
    const aiModal = document.getElementById('aiChatModal');
    const aiClose = document.querySelector('.rpn-ai-close');
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiInput = document.getElementById('aiChatInput');
    const aiMessages = document.getElementById('aiChatMessages');

    if (!aiBtn || !aiModal) return;

    // Open chat
    aiBtn.addEventListener('click', () => {
        aiModal.style.display = 'block';
        aiInput.focus();
    });

    // Close chat
    aiClose.addEventListener('click', () => {
        aiModal.style.display = 'none';
    });

    // Send message on button click
    aiSendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === aiModal) {
            aiModal.style.display = 'none';
        }
    });
}

// Send message to AI
async function sendMessage() {
    const aiInput = document.getElementById('aiChatInput');
    const aiMessages = document.getElementById('aiChatMessages');
    const message = aiInput.value.trim();

    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    aiInput.value = '';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'rpn-ai-typing';
    typingIndicator.textContent = 'AI is typing...';
    aiMessages.appendChild(typingIndicator);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    try {
        // Call backend API
        const response = await fetch(AI_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                history: chatHistory
            })
        });

        const data = await response.json();

        typingIndicator.remove();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to get response');
        }

        const aiResponse = data.response;
        addMessage(aiResponse, 'ai');

        // Update chat history
        chatHistory.push({ role: 'user', content: message });
        chatHistory.push({ role: 'assistant', content: aiResponse });

        // Keep history manageable
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(-10);
        }

    } catch (error) {
        typingIndicator.remove();
        console.error('AI Error:', error);
        // Fallback to local responses if backend is unavailable
        const fallbackResponse = getFallbackResponse(message);
        addMessage(fallbackResponse, 'ai');
    }
}

// Add message to chat UI
function addMessage(content, sender) {
    const aiMessages = document.getElementById('aiChatMessages');

    const messageEl = document.createElement('div');
    messageEl.className = `rpn-ai-message ${sender}-message`;

    const contentEl = document.createElement('div');
    contentEl.className = 'rpn-ai-message-content';
    contentEl.textContent = content;

    messageEl.appendChild(contentEl);
    aiMessages.appendChild(messageEl);

    // Scroll to bottom
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

// Fallback responses when API key is not set
function getFallbackResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        return 'Hello! Welcome to RPN Travels. How can I assist you today?';
    } else if (lowerMsg.includes('book') || lowerMsg.includes('booking')) {
        return 'For bus bookings, please call us at 9842422929 or 8072560787. We offer buses for marriages, college tours, family functions, and various pilgrimage tours!';
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rate')) {
        return 'For pricing information, please contact us directly at 9842422929. We offer competitive and affordable prices!';
    } else if (lowerMsg.includes('tour') || lowerMsg.includes('package')) {
        return 'We offer special tour packages including Navagraham Tour, Kovil Tour, Thirupathi Tour, Arupadai Tour, and Sabarimalai Tour. Call 9842422929 for details!';
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('number')) {
        return 'You can reach us at 9842422929 or 8072560787. Email: rpntravels@gmail.com';
    } else if (lowerMsg.includes('email')) {
        return 'Our email addresses are rpntravels@gmail.com and rpntravels@yahoo.com';
    } else if (lowerMsg.includes('since') || lowerMsg.includes('year') || lowerMsg.includes('experience')) {
        return 'RPN Travels has been providing reliable transportation services since 1973 - over 52 years of trusted service!';
    } else if (lowerMsg.includes('payment') || lowerMsg.includes('pay')) {
        return 'We accept UPI payments (Google Pay, PhonePe, PayTM). Look for the payment section on our website or contact us for details.';
    } else if (lowerMsg.includes('thank')) {
        return 'You\'re welcome! Feel free to ask if you have any more questions. Safe travels with RPN Travels!';
    } else {
        return 'Thank you for your query! For detailed information, please contact us at 9842422929 or visit our website. We\'re here to help!';
    }
}

// Initialize AI Chat on page load
document.addEventListener('DOMContentLoaded', () => {
    setupAIChat();
});
