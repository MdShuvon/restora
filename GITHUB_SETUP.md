# 🚀 GitHub Push Guide for Restora

## Prerequisites

- Git installed on your machine
- GitHub account created
- Your project folder ready

---

## Step 1: Initialize Git Repository

```bash
cd "d:\Java Project\Java Project\My javaaa\restora-vercel"

# Initialize git
git init

# Configure git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 2: Create GitHub Repository

1. Go to **github.com** → Sign in
2. Click **+ New Repository** (top right)
3. Enter repository name: `restora`
4. Add description: "🍽️ Modern restaurant management system"
5. Choose **Public** (to showcase your work)
6. **DO NOT** initialize with README (we already have one)
7. Click **Create repository**

---

## Step 3: Add Files to Git

```bash
# Check git status
git status

# Add all files
git add .

# Verify files are staged
git status
```

---

## Step 4: Create Initial Commit

```bash
git commit -m "🎉 Initial commit: Restora restaurant management system

- Public storefront with best-seller showcase
- Customer ordering system with PDF receipts
- Admin dashboard for menu & order management
- Responsive design with modern UI
- Local server for development
- Ready for deployment to Railway.app or Render.com"
```

---

## Step 5: Connect to GitHub

```bash
# Copy the HTTPS URL from your GitHub repository page
# It looks like: https://github.com/yourusername/restora.git

# Then run:
git remote add origin https://github.com/yourusername/restora.git

# Verify connection
git remote -v
```

---

## Step 6: Push to GitHub

```bash
# Rename branch to 'main' (GitHub default)
git branch -M main

# Push your code
git push -u origin main

# You'll be prompted for GitHub credentials
# Use your GitHub username and personal access token
```

### Create Personal Access Token (if needed):

1. GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Select `repo` scope
4. Copy token (save it!)
5. Use as password when git asks

---

## Step 7: Verify on GitHub

1. Go to your GitHub repository page
2. Refresh to see all files
3. Check that README.md displays correctly
4. Click through the files to verify

---

## 📊 Project Structure on GitHub

```
restora/
├── 📄 README.md                 # Main documentation
├── 📄 LICENSE                   # MIT License
├── 📄 CONTRIBUTING.md           # Contribution guide
├── 📄 package.json              # Project metadata
├── 📄 .gitignore                # Git ignore rules
├── 🖥️  server.js                # Node.js server
├── 🏠 index.html                # Home page
├── 🛒 customer.html             # Customer ordering
├── 👨‍💼 restaurant.html            # Admin dashboard
├── 🎨 styles.css                # Global styles
├── 📁 api/
│   ├── menu.js                  # Menu API
│   └── orders.js                # Orders API
└── 📁 .github/
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

---

## 🔄 Making Future Changes

After initial push, you can update with:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "description of changes"

# Push to GitHub
git push origin main
```

---

## 📌 Quick Commands Reference

```bash
# Check status
git status

# See commit history
git log --oneline

# Undo last commit (before push)
git reset --soft HEAD^

# Pull latest from GitHub
git pull origin main

# Create a new branch for features
git checkout -b feature/new-feature

# Push new branch
git push origin feature/new-feature
```

---

## ✅ You're Done!

Your project is now on GitHub! 🎉

### Next Steps:

1. **Share the link:** https://github.com/yourusername/restora
2. **Add to portfolio/resume**
3. **Consider deploying** to Railway.app or Render.com
4. **Ask for feedback** from friends/colleagues
5. **Add more features** and push updates

---

## 🎯 GitHub Best Practices

- ✅ Write clear commit messages
- ✅ Use meaningful branch names
- ✅ Keep README updated
- ✅ Use issues for tracking bugs
- ✅ Link PRs to issues
- ✅ Document new features

---

**Happy coding! 🚀**
