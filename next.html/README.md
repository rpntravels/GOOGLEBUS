# 📅 Event Calendar Application

A beautiful, interactive calendar application with event management features.

## Features

- 📅 Interactive monthly calendar view
- ➕ Add events with details:
  - Event name
  - Date & time
  - Address
  - Phone number
  - Description
- 👤 Admin-protected delete functionality
- 💾 Local storage persistence
- 📱 Responsive design
- 🎨 Modern gradient UI

## Quick Start

### Using Live Server (Recommended)

1. Install the **Live Server** extension in VS Code
2. Right-click on `index.html`
3. Select **"Open with Live Server"**
4. The calendar will open in your default browser

### Or Open Directly

Simply double-click `index.html` to open in your browser.

## Admin Access

- Click **"Admin Login"** button in the header
- Default password: `admin123`
- Once logged in, delete buttons will appear on all events
- Click **"Logout"** to exit admin mode

## File Structure

```
CALENDER/
├── index.html      # Main HTML file
├── styles.css      # Styling
├── script.js       # JavaScript functionality
├── data.json       # Data reference file
└── README.md       # This file
```

## Usage

1. **Add Event**: Click the "+ Add Event" button or click on any calendar date
2. **View Events**: All events are displayed in the events section below the calendar
3. **Navigate**: Use < and > buttons to switch between months
4. **Delete Event**: Login as admin first, then click the delete button on any event card

## Data Storage

Events are stored in your browser's **localStorage**, so they persist even after closing the browser.

## Customization

- **Admin Password**: Change in `script.js` (search for `admin123`)
- **Colors**: Modify CSS variables in `styles.css`
- **Fields**: Edit the form in `index.html` and corresponding JS in `script.js`
