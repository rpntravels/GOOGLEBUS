# Deployment Guide

This guide will help you deploy the EMI Calculator website to various platforms.

## Prerequisites

- All project files (index.html, styles/, scripts/)
- A GitHub account (for GitHub Pages)
- Or accounts for Netlify/Vercel (optional)

---

## Method 1: GitHub Pages (Recommended)

### Step 1: Prepare Your Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it: `emi-calculator`
4. Make it **Public**
5. Click "Create repository"

### Step 2: Upload Files

**Option A: Using Git (Recommended)**
```bash
# Navigate to project folder
cd "EMI CALCULATOR"

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/emi-calculator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Option B: Upload via Web Interface**
1. In your repository, click "uploading an existing file"
2. Drag and drop all files
3. Click "Commit changes"

### Step 3: Enable GitHub Pages

1. Go to your repository Settings
2. Click "Pages" in the left sidebar
3. Under "Source", select:
   - Branch: `main` or `master`
   - Folder: `/ (root)`
4. Click "Save"
5. Wait 1-2 minutes
6. Your site will be live at: `https://YOUR_USERNAME.github.io/emi-calculator/`

---

## Method 2: Netlify (Easiest)

### Step 1: Sign Up
1. Go to [Netlify](https://www.netlify.com/)
2. Sign up with GitHub or email

### Step 2: Deploy

**Option A: Drag & Drop (No Git)**
1. Log in to Netlify
2. Go to "Sites" tab
3. Drag the entire project folder to the drop zone
4. Done! Your site is live

**Option B: Connect to GitHub**
1. Click "Add new site" → "Import an existing project"
2. Connect to GitHub
3. Select your repository
4. Build settings:
   - Build command: (leave empty)
   - Publish directory: `/` (root)
5. Click "Deploy site"

### Step 3: Customize Domain (Optional)
1. Go to "Domain settings"
2. Add custom domain or use Netlify subdomain

---

## Method 3: Vercel

### Step 1: Sign Up
1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub

### Step 2: Deploy
1. Click "Add New Project"
2. Import your GitHub repository
3. Configure:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: `/`
4. Click "Deploy"

### Step 3: Live URL
Your site will be at: `https://emi-calculator-YOUR_USERNAME.vercel.app`

---

## Method 4: Traditional Web Hosting

### Requirements:
- Web hosting account (Hostinger, Bluehost, GoDaddy, etc.)
- FTP client (FileZilla) or cPanel File Manager

### Steps:

1. **Connect via FTP**
   - Host: ftp.yourdomain.com
   - Username: your_username
   - Password: your_password

2. **Upload Files**
   - Navigate to `public_html` or `www` folder
   - Upload all project files

3. **Access Your Site**
   - Visit: `https://yourdomain.com`

---

## Method 5: Local Network (Testing)

### Using Python (Built-in)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Using Node.js
```bash
npx serve
```

### Using PHP
```bash
php -S localhost:8000
```

Then open: `http://localhost:8000`

---

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All tabs work (EMI, Ordinary, Interest, Schedule)
- [ ] Calculations are accurate
- [ ] Export functions work
- [ ] Mobile responsive design works
- [ ] No console errors

---

## Troubleshooting

### Site Not Loading
- Check file paths are correct
- Ensure `index.html` is in the root directory
- Clear browser cache

### Styles Not Loading
- Verify `styles/main.css` path in HTML
- Check CSS file exists and is uploaded

### JavaScript Not Working
- Verify all script paths in HTML
- Check browser console for errors (F12)
- Ensure all `.js` files are uploaded

### 404 Errors
- Wait a few minutes for deployment to complete
- Check file names are exact (case-sensitive)
- Verify all files are uploaded

---

## Custom Domain Setup

### GitHub Pages
1. Add `CNAME` file with your domain
2. Configure DNS at your domain registrar
3. Add domain in repository Settings → Pages

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Update DNS records as instructed

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS

---

## Performance Tips

1. **Enable Compression**: Most platforms do this automatically
2. **Use CDN**: For faster global access
3. **Minify Files**: Use online tools to minify CSS/JS
4. **Enable Caching**: Add cache headers if possible

---

## Security

- Use HTTPS (enabled by default on most platforms)
- Keep dependencies updated (if any)
- Regular backups of your code

---

## Support

If you encounter issues:
1. Check the platform's documentation
2. Search for similar issues
3. Contact platform support

---

Happy Deploying! 🚀
