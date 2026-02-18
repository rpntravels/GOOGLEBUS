// Calendar Application
let currentDate = new Date();
let events = [];
let isAdmin = false;

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    renderCalendar();
    renderEvents();
    setupEventListeners();
    setupNavigation();
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

        dayEvents.slice(0, 3).forEach(event => {
            const indicator = document.createElement('div');
            indicator.className = 'event-indicator';
            indicator.textContent = event.name;
            dayEl.appendChild(indicator);
        });

        if (dayEvents.length > 3) {
            const more = document.createElement('div');
            more.className = 'event-indicator';
            more.textContent = `+${dayEvents.length - 3} more`;
            dayEl.appendChild(more);
        }

        dayEl.addEventListener('click', () => openModal(dateStr));
    }

    return dayEl;
}

// Open Event Modal
function openModal(date = '') {
    document.getElementById('eventId').value = '';
    document.getElementById('purpose').value = '';
    document.getElementById('Name').value = '';
    document.getElementById('Date').value = date;
    document.getElementById('Time').value = '';
    document.getElementById('Address').value = '';
    document.getElementById('Phone').value = '';
    document.getElementById('Description').value = '';
    document.getElementById('modalTitle').textContent = 'Add Event';
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
    if (password === 'admin123') {
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
    const event = {
        id: id || Date.now().toString(),
        name: document.getElementById('Name').value,
        purpose: document.getElementById('purpose').value,
        date: document.getElementById('Date').value,
        time: document.getElementById('Time').value,
        address: document.getElementById('Address').value,
        phone: document.getElementById('Phone').value,
        description: document.getElementById('Description').value
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
            </div>
        `;
    }).join('');
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
