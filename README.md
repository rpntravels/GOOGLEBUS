# 🚌 RPN Travels - Google Bus with Event Calendar

A combined website for RPN Travels bus booking services with an integrated event calendar for managing bookings and events.

## Features

### RPN Travels Section
- 🚌 Bus gallery with photos
- 📋 Services information (Marriage, College Tour, Family Function, etc.)
- ✨ Feature highlights (Reliable Services, Affordable Prices, Safety First, Customer Satisfaction)
- 📞 Contact information
- 💳 **UPI Payment Integration** (Google Pay, PhonePe, PayTM)

### Event Calendar Section
- 📅 Interactive monthly calendar view
- ➕ Add events with details:
  - Purpose
  - Name
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
4. The website will open in your default browser

### Or Open Directly

Simply double-click `index.html` to open in your browser.

## Navigation

- From the **RPN Travels** homepage, click **"View Event Calendar"** to access the calendar
- From the **Calendar**, click **"🏠 Home"** to return to the travels page

## Admin Access

- Click **"Admin Login"** button in the calendar header
- Default password: `admin123`
- Once logged in, delete buttons will appear on all events
- Click **"Logout"** to exit admin mode

## File Structure

```
GOOGLEBUS/
├── index.html          # Main merged HTML file
├── styles.css          # Combined styling
├── script.js           # JavaScript functionality
├── data.json           # Data reference file
├── README.md           # This file
├── index1.html/        # Original RPN Travels folder (backup)
│   ├── index2.html
│   └── style1.css
└── next.html/          # Original Calendar folder (backup)
    ├── index.html
    ├── styles.css
    ├── script.js
    ├── data.json
    └── README.md
```

## Usage

### RPN Travels Section
- View bus photos and services
- Contact for bookings via phone or email
- Navigate to calendar for event management

### UPI Payment Section
1. **Select Payment Method**: Click on Google Pay, PhonePe, or PayTM button
2. **Enter Payment Details**:
   - Amount (₹)
   - Your Name
   - Payment Purpose (Marriage Booking, College Tour, etc.)
   - Phone Number
3. **Complete Payment**:
   - Click "Proceed to Pay"
   - Click "Open UPI App" to open your selected UPI app
   - Or scan the QR code with any UPI app
4. **Copy UPI ID**: Click the copy button to copy UPI ID for manual payment

### Calendar Section
1. **Add Event**: Click the "+ Add Event" button or click on any calendar date
2. **View Events**: All events are displayed in the events section below the calendar
3. **Navigate**: Use < and > buttons to switch between months
4. **Delete Event**: Login as admin first, then click the delete button on any event card

## Data Storage

Events and payment records are stored in your browser's **localStorage**, so they persist even after closing the browser.

## Customization

### UPI Payment Setup (IMPORTANT!)
1. Open `script.js`
2. Find the `UPI_CONFIG` section at the top (around line 6)
3. Update your UPI ID:
   ```javascript
   const UPI_CONFIG = {
       upiId: '9842422929@oksbi',  // Replace with your actual UPI ID
       name: 'RPN Travels',
       defaultNote: 'Bus booking payment'
   };
   ```
4. Common UPI ID formats:
   - PhonePe: `9842422929@phonepe`
   - Google Pay: `9842422929@oksbi` or `9842422929@okhdfcbank`
   - PayTM: `9842422929@paytm`
   - BHIM: `9842422929@upi`

### Other Customization
- **Admin Password**: Change in `script.js` (search for `admin123`)
- **Colors**: Modify CSS variables in `styles.css`
- **Contact Info**: Edit in `index.html` (contact-section)
- **Bus Images**: Update image paths in `index.html` (bus-gallery)
- **QR Code**: Replace the QR placeholder in `index.html` with your actual UPI QR code image

## Services Offered

- Tourist Bus Booking
- Marriage Events
- College Tours
- Family Functions
- Navagraham Tour
- Kovil Tour
- Thirupathi Tour
- Arupadai Tour
- Sabarimalai Tour

## Contact

- **Phone**: 9842422929, 8072560787
- **Email**: rpntravels@gmail.com, rpntravels@yahoo.com
