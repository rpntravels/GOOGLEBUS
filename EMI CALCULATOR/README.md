# EMI Calculator Website

A comprehensive web-based EMI Calculator with multiple financial calculation tools. Built with pure HTML, CSS, and JavaScript - no build tools required!

## ✨ Features

### 1. EMI Calculator
- Calculate monthly Equated Monthly Installment (EMI)
- View total interest payable
- See total payment amount
- Visual pie chart showing principal vs interest breakdown
- Export results to text file

### 2. Ordinary Calculator
- Basic arithmetic operations (add, subtract, multiply, divide)
- Percentage calculations
- Positive/negative toggle
- Clean, intuitive interface

### 3. Interest Calculator
- Simple Interest (SI) calculation
- Compound Interest (CI) calculation
- Multiple compounding frequencies:
  - Yearly
  - Half-Yearly
  - Quarterly
  - Monthly
- Export results

### 4. Repayment Schedule
- Month-by-month loan breakdown
- Shows principal and interest components
- Outstanding balance after each payment
- Export to CSV or Text format
- Scrollable detailed table

## 📁 Project Structure

```
EMI CALCULATOR/
├── index.html            # Main HTML file
├── styles/
│   └── main.css         # All styles
├── scripts/
│   ├── main.js          # Tab navigation
│   ├── emi.js           # EMI calculator logic
│   ├── calculator.js    # Ordinary calculator logic
│   ├── interest.js      # Interest calculator logic
│   └── schedule.js      # Repayment schedule logic
├── public/              # Static assets (optional)
├── README.md            # This file
└── DEPLOYMENT.md        # Deployment guide
```

## 🚀 Quick Start

### Option 1: Open Directly (Easiest)
Simply double-click `index.html` to open in your browser!

### Option 2: Use a Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if installed)
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🌐 Deployment

### GitHub Pages

1. Create a new repository on GitHub
2. Upload all files
3. Go to Settings → Pages
4. Select branch (main/master) and save
5. Your site will be live at `https://yourusername.github.io/repo-name`

### Netlify

1. Sign up at [Netlify](https://netlify.com)
2. Drag and drop the project folder
3. Your site will be live instantly!

### Vercel

1. Sign up at [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Deploy automatically

### Traditional Web Hosting

1. Upload all files to your web server's `public_html` or `www` directory
2. Access via your domain name

## 📊 Formulas Used

### EMI Calculation
```
EMI = P × R × (1+R)^N / ((1+R)^N - 1)

Where:
- P = Principal loan amount
- R = Monthly interest rate (annual rate / 12 / 100)
- N = Loan tenure in months
```

### Simple Interest
```
SI = (P × R × T) / 100

Where:
- P = Principal amount
- R = Annual interest rate
- T = Time in years
```

### Compound Interest
```
A = P(1 + r/n)^(n×t)
CI = A - P

Where:
- P = Principal amount
- r = Annual interest rate (decimal)
- n = Compounding frequency per year
- t = Time in years
```

## 🎨 Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Beautiful gradients and smooth animations
- **Export Functionality**: Download results as text or CSV
- **No Dependencies**: Pure JavaScript, no frameworks needed
- **Fast Loading**: Lightweight and optimized
- **Offline Capable**: Works without internet after loading

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## 📝 Usage Examples

### EMI Calculator Example
- Loan Amount: ₹10,00,000
- Interest Rate: 8.5%
- Tenure: 240 months (20 years)
- **Result**: Monthly EMI ≈ ₹8,678

### Interest Calculator Example
- Principal: ₹50,000
- Rate: 7%
- Time: 5 years
- **Simple Interest**: ₹17,500
- **Compound Interest** (yearly): ₹20,128

## 🔧 Customization

### Change Colors
Edit `styles/main.css` and modify the CSS variables:

```css
:root {
  --primary-color: #4f46e5;      /* Main theme color */
  --secondary-color: #10b981;    /* Accent color */
  --background: #f8fafc;         /* Light background */
}
```

### Add Currency Symbol
Search and replace `₹` with your preferred currency symbol in all JavaScript files.

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share with others

## 📧 Support

For issues or questions, please create an issue in the repository.

---

Made with ❤️ for easy financial calculations!
