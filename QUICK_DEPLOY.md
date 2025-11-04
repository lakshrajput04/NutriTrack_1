# 🚀 Quick Deployment Guide for NutriTrack

Follow these steps to deploy your NutriTrack application to Vercel in under 10 minutes!

---

## ⚡ Quick Steps

### 1. Sign Up for Vercel
- Go to [vercel.com](https://vercel.com)
- Click "Sign Up" → Choose "Continue with GitHub"
- Authorize Vercel

### 2. Deploy Backend First

**Via Web Interface:**
1. Click "Add New" → "Project"
2. Select your `NutriTrack_1` repository
3. Configure:
   - **Root Directory:** `backend`
   - **Framework:** Other
4. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://lakshrathi_db_user:****@cluster0.xssgiel.mongodb.net/nutritrack
   NODE_ENV=production
   GEMINI_API_KEY=AIzaSyB14jj-FgZmdjtHRiZofzYh7o5_iBQWdcU
   ```
5. Click "Deploy"
6. **Save your backend URL** (e.g., `https://nutritrack-backend-xxx.vercel.app`)

### 3. Deploy Frontend

1. Click "Add New" → "Project" again
2. Select `NutriTrack_1` repository
3. Configure:
   - **Root Directory:** `.` (root/leave empty)
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:
   ```
   VITE_GEMINI_API_KEY=AIzaSyB14jj-FgZmdjtHRiZofzYh7o5_iBQWdcU
   VITE_BACKEND_URL=https://nutritrack-backend-xxx.vercel.app
   VITE_MONGODB_URI=mongodb+srv://lakshrathi_db_user:****@cluster0.xssgiel.mongodb.net/nutritrack
   ```
   (Replace `https://nutritrack-backend-xxx.vercel.app` with your actual backend URL from step 2)
5. Click "Deploy"

### 4. Update Backend CORS

Edit `backend/server.js` line 26:
```javascript
origin: [
  'http://localhost:8080',
  'http://localhost:5173',
  'https://your-frontend-url.vercel.app'  // Add your actual frontend URL here
],
```

Commit and push:
```bash
git add backend/server.js
git commit -m "chore: add production frontend URL to CORS"
git push origin main
```

Vercel will auto-redeploy your backend!

### 5. Test Your App

Visit your frontend URL and test:
- ✅ Login works
- ✅ Dashboard shows data
- ✅ Tracker loads recipes
- ✅ AI Meal Analyzer works
- ✅ AI Coach responds

---

## 🎉 Done!

Your app is now live! Share it:
- **Frontend:** `https://your-app-name.vercel.app`
- **Backend:** `https://your-backend-name.vercel.app`

---

## 📝 Environment Variables Reference

### Backend Variables
| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `FRONTEND_URL` | Your Vercel frontend URL (optional) |

### Frontend Variables
| Variable | Value |
|----------|-------|
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key |
| `VITE_BACKEND_URL` | Your Vercel backend URL |
| `VITE_MONGODB_URI` | Your MongoDB Atlas connection string |

---

## 🐛 Troubleshooting

**Problem:** API calls fail with CORS error
- **Solution:** Update backend CORS with your frontend URL (Step 4)

**Problem:** Build fails
- **Solution:** Check environment variables are set correctly

**Problem:** MongoDB connection fails
- **Solution:** Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access

**Problem:** Environment variables not working
- **Solution:** Make sure to add them to all environments (Production, Preview, Development)

---

## 📚 Need More Help?

See the full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**Deployment Status:** Ready to Deploy ✅
