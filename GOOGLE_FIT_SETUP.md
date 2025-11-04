# Google Fit Integration Setup Guide

## Overview
This guide will help you set up Google Fit API integration to track user step counts and activity data in NutriTrack.

---

## Prerequisites
- Google Cloud Console account
- NutriTrack backend and frontend running
- MongoDB connected

---

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"** or select existing project
4. Name it "NutriTrack" (or your preferred name)
5. Click **Create**

### 1.2 Enable Google Fitness API
1. In the left sidebar, navigate to **APIs & Services → Library**
2. Search for **"Fitness API"**
3. Click on **"Fitness API"**
4. Click **"Enable"**

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services → OAuth consent screen**
2. Select **External** (for testing) or **Internal** (for organization)
3. Click **Create**

#### Fill in required information:
- **App name**: NutriTrack
- **User support email**: Your email
- **App logo**: (Optional)
- **Application home page**: http://localhost:8080
- **Authorized domains**: localhost (for development)
- **Developer contact information**: Your email

4. Click **Save and Continue**

#### Add Scopes:
1. Click **Add or Remove Scopes**
2. Manually add these scopes:
   ```
   https://www.googleapis.com/auth/fitness.activity.read
   https://www.googleapis.com/auth/fitness.location.read
   ```
3. Click **Update**
4. Click **Save and Continue**

#### Test Users (for External):
1. Click **Add Users**
2. Add your email address for testing
3. Click **Save and Continue**

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Select **Web application**
4. Name it "NutriTrack Web Client"

#### Configure:
- **Authorized JavaScript origins**:
  ```
  http://localhost:3001
  http://localhost:8080
  ```

- **Authorized redirect URIs**:
  ```
  http://localhost:3001/auth/google/callback
  ```

5. Click **Create**
6. **IMPORTANT**: Copy your **Client ID** and **Client Secret**

---

## Step 2: Configure Backend

### 2.1 Update .env File
Open `backend/.env` and update with your credentials:

```env
# Google OAuth & Fit API Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
FRONTEND_URL=http://localhost:8080
SESSION_SECRET=generate_a_random_secret_key_here
```

### 2.2 Generate Session Secret
Run this command to generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `SESSION_SECRET`.

### 2.3 Restart Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB Atlas
🚀 Server running on port 3001
```

---

## Step 3: Test the Integration

### 3.1 Start Frontend
```bash
npm run dev
```

### 3.2 Login to NutriTrack
1. Open http://localhost:8080
2. Login with your account

### 3.3 Connect Google Fit
1. Go to Dashboard
2. You'll see "Google Fit Integration" card
3. Click **"Connect Google Fit"**
4. You'll be redirected to Google OAuth
5. Sign in with your Google account
6. Grant permissions:
   - View your fitness activity data
   - View your location data
7. Click **Allow**
8. You'll be redirected back to Dashboard

### 3.4 View Step Data
After successful connection, you should see:
- Total Steps (last 7 days)
- Daily Average Steps
- Today's Steps
- Calories Burned
- Daily breakdown with dates

---

## Step 4: Verify Backend API

Test the endpoints manually:

### Health Check
```bash
curl http://localhost:3001/health
```

### Get Step History (replace USER_ID)
```bash
curl http://localhost:3001/api/fitness/steps/YOUR_USER_ID
```

### Get Today's Steps
```bash
curl http://localhost:3001/api/fitness/steps/today/YOUR_USER_ID
```

---

## Troubleshooting

### Issue: "Google OAuth not configured"
**Solution**: Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env` and restart backend.

### Issue: "Redirect URI mismatch"
**Solution**: 
1. Check Google Console → Credentials → Your OAuth Client
2. Ensure redirect URI exactly matches: `http://localhost:3001/auth/google/callback`
3. No trailing slashes

### Issue: "Access blocked: This app's request is invalid"
**Solution**: 
1. Go to OAuth consent screen
2. Add your email to "Test users"
3. Make sure app is not in production mode if using External

### Issue: "No step data available"
**Solution**: 
1. Ensure you have Google Fit app installed on your phone
2. Walk around for a few minutes
3. Open Google Fit app to sync data
4. Refresh NutriTrack dashboard

### Issue: "Failed to fetch step data"
**Solution**: 
1. Check browser console for errors
2. Verify Fitness API is enabled in Google Cloud Console
3. Check that scopes include `fitness.activity.read`

---

## API Rate Limits

Google Fit API has rate limits:
- **10,000 requests per day** (default)
- **100 requests per 100 seconds per user**

For production, request quota increase if needed.

---

## Production Deployment

### Update OAuth Settings
1. Add production domain to Google Cloud Console:
   - Authorized JavaScript origins: `https://your-domain.com`
   - Authorized redirect URIs: `https://your-domain.com/auth/google/callback`

2. Update `.env` for production:
   ```env
   GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
   FRONTEND_URL=https://your-domain.com
   NODE_ENV=production
   ```

3. Change OAuth consent screen to "In Production" when ready

---

## Features Implemented

✅ **OAuth 2.0 Authentication** with Google
✅ **Automatic Token Refresh** when expired
✅ **7-Day Step History** retrieval
✅ **Today's Step Count** real-time
✅ **Calorie Calculation** from steps (0.04 cal/step)
✅ **Distance Calculation** (0.762 meters/step)
✅ **Connect/Disconnect** functionality
✅ **User-friendly Dashboard UI**
✅ **Error Handling** and loading states

---

## Security Best Practices

1. ✅ **Never commit .env files** to git (already in .gitignore)
2. ✅ **Use HTTPS in production**
3. ✅ **Implement CORS properly** (already configured)
4. ✅ **Store tokens in database** (not localStorage)
5. ✅ **Use httpOnly session cookies**
6. ✅ **Validate all user inputs**
7. ✅ **Implement rate limiting** (recommended for production)

---

## Next Steps

1. **Get Google OAuth credentials** from Cloud Console
2. **Update backend/.env** with your credentials
3. **Restart backend server**
4. **Test the integration** on Dashboard
5. **Walk around** to generate step data
6. **Verify data appears** in Dashboard

---

## Support

If you encounter issues:
1. Check Google Cloud Console logs
2. Check backend terminal for error messages
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure MongoDB connection is active

---

## API Documentation

### Backend Endpoints

#### `GET /auth/google`
Initiate Google OAuth flow

#### `GET /auth/google/callback`
OAuth callback endpoint (redirects to frontend)

#### `GET /api/fitness/steps/:userId`
Get 7-day step history
- **Response**: 
  ```json
  {
    "userId": "...",
    "userName": "...",
    "period": { "start": "...", "end": "..." },
    "data": [
      { "date": "2025-11-04", "steps": 8543, "timestamp": "..." }
    ],
    "totalSteps": 56789,
    "averageSteps": 8113,
    "caloriesBurned": 2271
  }
  ```

#### `GET /api/fitness/steps/today/:userId`
Get today's step count
- **Response**:
  ```json
  {
    "date": "2025-11-04",
    "steps": 5432,
    "caloriesBurned": 217,
    "timestamp": "..."
  }
  ```

#### `POST /api/fitness/disconnect/:userId`
Disconnect Google Fit
- **Response**: `{ "message": "Google Fit disconnected successfully" }`

---

**Status**: ✅ Ready to use (pending Google OAuth credentials)
**Last Updated**: November 4, 2025
