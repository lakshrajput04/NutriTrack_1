# NutriTrack Deployment Guide - Vercel

This guide provides step-by-step instructions for deploying NutriTrack to Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with your repository
- ✅ Vercel account (free tier works)
- ✅ MongoDB Atlas database (already configured)
- ✅ Google Gemini API key
- ✅ All code committed and pushed to GitHub

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Project

#### 1.1 Update Frontend Configuration

Create/update `.env` file in the root directory:

```bash
# .env (Frontend)
VITE_GEMINI_API_KEY=AIzaSyB14jj-FgZmdjtHRiZofzYh7o5_iBQWdcU
VITE_BACKEND_URL=https://your-backend-url.vercel.app
VITE_MONGODB_URI=mongodb+srv://lakshrathi_db_user:****@cluster0.xssgiel.mongodb.net/nutritrack
```

#### 1.2 Update Backend Configuration

Ensure `backend/.env` contains:

```bash
# backend/.env
MONGODB_URI=mongodb+srv://lakshrathi_db_user:****@cluster0.xssgiel.mongodb.net/nutritrack
PORT=3001
NODE_ENV=production
GEMINI_API_KEY=AIzaSyB14jj-FgZmdjtHRiZofzYh7o5_iBQWdcU
```

#### 1.3 Create Vercel Configuration for Backend

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 1.4 Update Backend server.js for CORS

Ensure your `backend/server.js` has proper CORS configuration:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://your-frontend-url.vercel.app'  // Add after frontend deployment
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 🔧 Backend Deployment (Deploy First)

### Step 2: Deploy Backend to Vercel

#### 2.1 Sign Up/Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub repositories

#### 2.2 Import Backend Project

1. Click "Add New" → "Project"
2. Select your `NutriTrack_1` repository
3. Click "Import"

#### 2.3 Configure Backend Project

**Project Settings:**
- **Framework Preset:** Other
- **Root Directory:** `backend`
- **Build Command:** (leave empty)
- **Output Directory:** (leave empty)
- **Install Command:** `npm install`

#### 2.4 Add Environment Variables

Click "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://lakshrathi_db_user:****@cluster0.xssgiel.mongodb.net/nutritrack` |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | `AIzaSyB14jj-FgZmdjtHRiZofzYh7o5_iBQWdcU` |

**Important:** Add these to all environments (Production, Preview, Development)

#### 2.5 Deploy Backend

1. Click "Deploy"
2. Wait for deployment to complete (2-3 minutes)
3. Copy your backend URL (e.g., `https://nutritrack-backend.vercel.app`)

#### 2.6 Test Backend

Visit: `https://your-backend-url.vercel.app/health`

Should return:
```json
{
  "status": "OK",
  "mongodb": "Connected"
}
```

---

## 🎨 Frontend Deployment

### Step 3: Deploy Frontend to Vercel

#### 3.1 Update Frontend Environment Variable

Before deploying frontend, update your `.env`:

```bash
VITE_BACKEND_URL=https://your-backend-url.vercel.app
```

Commit and push this change:

```bash
git add .env
git commit -m "chore: update backend URL for production"
git push origin main
```

#### 3.2 Import Frontend Project

1. Go to Vercel Dashboard
2. Click "Add New" → "Project"
3. Select `NutriTrack_1` repository again
4. Click "Import"

#### 3.3 Configure Frontend Project

**Project Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `.` (root)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### 3.4 Add Frontend Environment Variables

Click "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `VITE_GEMINI_API_KEY` | `AIzaSyB14jj-FgZmdjtHRiZofzYh7o5_iBQWdcU` |
| `VITE_BACKEND_URL` | `https://your-backend-url.vercel.app` |
| `VITE_MONGODB_URI` | `mongodb+srv://lakshrathi_db_user:****@cluster0.xssgiel.mongodb.net/nutritrack` |

**Important:** Add to all environments

#### 3.5 Deploy Frontend

1. Click "Deploy"
2. Wait for build and deployment (3-5 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

---

## 🔄 Update Backend CORS

### Step 4: Update Backend for Frontend URL

#### 4.1 Update CORS Configuration

Edit `backend/server.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://your-frontend-url.vercel.app'  // Add your actual frontend URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

#### 4.2 Commit and Push

```bash
cd backend
git add server.js
git commit -m "chore: add production frontend URL to CORS"
git push origin main
```

Vercel will automatically redeploy your backend.

---

## ✅ Verification Steps

### Step 5: Test Your Deployment

#### 5.1 Test Backend Endpoints

```bash
# Health check
curl https://your-backend-url.vercel.app/health

# Test login
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

#### 5.2 Test Frontend

1. Visit your frontend URL: `https://your-app-name.vercel.app`
2. Test the following:
   - ✅ Landing page loads
   - ✅ Sign in/Login works
   - ✅ Dashboard displays user info
   - ✅ Tracker page loads recipes
   - ✅ AI Meal Analyzer works
   - ✅ AI Coach responds to messages
   - ✅ Logout functionality works

---

## 🎯 Quick Deploy Commands

### For Future Updates

After making changes to your code:

```bash
# 1. Commit changes
git add .
git commit -m "feat: your changes description"

# 2. Push to GitHub
git push origin main

# 3. Vercel automatically deploys!
# Check deployment status at https://vercel.com/dashboard
```

---

## 🔒 Security Considerations

### Step 6: Secure Your Application

#### 6.1 Environment Variables

- ✅ Never commit `.env` files to GitHub
- ✅ Use Vercel's environment variable UI
- ✅ Keep API keys secure
- ✅ Rotate keys periodically

#### 6.2 Add `.gitignore`

Ensure your `.gitignore` includes:

```
.env
.env.local
.env.production
backend/.env
node_modules/
dist/
```

#### 6.3 MongoDB Security

1. In MongoDB Atlas, go to "Network Access"
2. Add Vercel IP addresses or use `0.0.0.0/0` (less secure but works)
3. Ensure database user has appropriate permissions

---

## 🌐 Custom Domain (Optional)

### Step 7: Add Custom Domain

#### 7.1 Purchase Domain

Buy a domain from:
- Namecheap
- GoDaddy
- Google Domains
- etc.

#### 7.2 Add to Vercel

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Enter your domain name
4. Follow Vercel's DNS configuration instructions

#### 7.3 Update Environment Variables

Update `VITE_BACKEND_URL` to your custom domain if using separate domains for frontend/backend.

---

## 📊 Monitoring & Analytics

### Step 8: Monitor Your Deployment

#### 8.1 Vercel Analytics

1. Go to your project dashboard
2. Click "Analytics" tab
3. View:
   - Page views
   - Unique visitors
   - Performance metrics
   - Error rates

#### 8.2 View Logs

1. Click "Deployments"
2. Select a deployment
3. Click "View Function Logs"
4. Monitor real-time logs and errors

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Build Fails

**Error:** `Module not found`

**Solution:**
```bash
# Ensure all dependencies are in package.json
npm install --save <missing-package>
git add package.json package-lock.json
git commit -m "fix: add missing dependencies"
git push origin main
```

#### Issue 2: API Calls Fail

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Update backend CORS to include frontend URL
- Redeploy backend

#### Issue 3: Environment Variables Not Working

**Solution:**
1. Go to Vercel Project Settings
2. Click "Environment Variables"
3. Ensure variables are added to all environments
4. Redeploy the project

#### Issue 4: MongoDB Connection Fails

**Solution:**
1. Check MongoDB Atlas Network Access
2. Add `0.0.0.0/0` to IP whitelist
3. Verify connection string in environment variables
4. Check database user permissions

#### Issue 5: Build Takes Too Long

**Solution:**
- Check build logs for errors
- Optimize dependencies
- Remove unused packages
- Consider upgrading Vercel plan

---

## 📱 Mobile Optimization

### Step 9: Ensure Mobile Responsiveness

Your app is already responsive with TailwindCSS, but verify:

1. Test on different screen sizes
2. Check touch targets are large enough
3. Verify forms work on mobile keyboards
4. Test on real devices if possible

---

## 🚀 Performance Optimization

### Step 10: Optimize for Production

#### 10.1 Frontend Optimizations

```bash
# Already implemented in your Vite config:
- Code splitting
- Tree shaking
- Minification
- Gzip compression
```

#### 10.2 Backend Optimizations

Add to `backend/server.js`:

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|jpg|png|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
  next();
});
```

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] All code committed and pushed to GitHub
- [ ] Environment variables configured
- [ ] MongoDB Atlas accessible
- [ ] Gemini API key valid
- [ ] CORS configured properly
- [ ] `.gitignore` includes sensitive files

### Backend Deployment

- [ ] Backend deployed to Vercel
- [ ] Environment variables added
- [ ] Health endpoint working
- [ ] API endpoints tested
- [ ] MongoDB connection verified

### Frontend Deployment

- [ ] Frontend deployed to Vercel
- [ ] Environment variables added
- [ ] Build successful
- [ ] All pages loading
- [ ] API calls working

### Post-Deployment

- [ ] Full application tested
- [ ] Login/Signup working
- [ ] AI features functional
- [ ] Recipe search working
- [ ] Tracking functionality verified
- [ ] Mobile responsiveness checked

---

## 🎉 Congratulations!

Your NutriTrack application is now live on Vercel!

**Share your URLs:**
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-backend-name.vercel.app`

**Monitor your app:**
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com/

---

## 📞 Support

If you encounter issues:

1. Check Vercel Documentation: https://vercel.com/docs
2. MongoDB Atlas Support: https://www.mongodb.com/docs/atlas/
3. Vite Documentation: https://vitejs.dev/
4. GitHub Issues: Create an issue in your repository

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
# Commit and push
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your project
# 3. Runs tests (if configured)
# 4. Deploys to production
# 5. Sends you a deployment notification
```

---

**Last Updated:** November 4, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
