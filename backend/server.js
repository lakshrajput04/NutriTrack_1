const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { google } = require('googleapis');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Check if MongoDB URI is loaded
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

console.log('🔗 MongoDB URI loaded:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'nutritrack-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
    default: 'moderately_active'
  },
  goals: [{ type: String }],
  dailyCalorieGoal: { type: Number, default: 2000 },
  // Google Fit integration fields
  googleId: { type: String },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  googleTokenExpiry: { type: Date },
  fitDataEnabled: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Meal Log Schema
const mealLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foods: [{
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    quantity: { type: String, required: true }
  }],
  totalCalories: { type: Number, required: true },
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true 
  },
  date: { type: Date, default: Date.now },
  imageUrl: { type: String },
  analysis: { type: String }
}, {
  timestamps: true
});

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'nutrition_analysis', 'workout_suggestion', 'meal_plan'],
    default: 'text'
  },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Models
const User = mongoose.model('User', userSchema);
const MealLog = mongoose.model('MealLog', mealLogSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          // Check if user exists with this email
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.googleAccessToken = accessToken;
            user.googleRefreshToken = refreshToken;
            user.fitDataEnabled = true;
            console.log('🔗 Linked Google account to existing user:', user.email);
          } else {
            // Create new user
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              fitDataEnabled: true
            });
            console.log('👤 Created new user via Google:', user.email);
          }
          await user.save();
        } else {
          // Update tokens for existing Google user
          user.googleAccessToken = accessToken;
          if (refreshToken) user.googleRefreshToken = refreshToken;
          user.fitDataEnabled = true;
          await user.save();
          console.log('🔄 Updated Google tokens for:', user.email);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        return done(error, null);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
} else {
  console.log('⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set)');
}

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Routes
// Simple email-only auth: find or create user by email
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, name, age, weight, height, activityLevel } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const derivedName = typeof name === 'string' && name.trim().length > 0
        ? name.trim()
        : email.split('@')[0];
      user = new User({
        name: derivedName,
        email,
        age: age || undefined,
        weight: weight || undefined,
        height: height || undefined,
        activityLevel: activityLevel || 'moderately_active',
        dailyCalorieGoal: 2000,
      });
      await user.save();
      console.log('👤 Created new user via auth:', user.email, user._id);
    } else {
      // Update existing user with new information if provided
      if (name) user.name = name;
      if (age) user.age = age;
      if (weight) user.weight = weight;
      if (height) user.height = height;
      if (activityLevel) user.activityLevel = activityLevel;
      await user.save();
      console.log('🔐 Existing user logged in and updated:', user.email, user._id);
    }

    return res.json({ user });
  } catch (error) {
    console.error('❌ Auth login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Serve MongoDB tester page
app.get('/tester', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'mongodb-tester.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// ============ Google OAuth & Fit API Routes ============

// Initiate Google OAuth
app.get('/auth/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.location.read'
    ],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}/dashboard?google_fit_connected=true`);
  }
);

// Helper function to refresh Google token if expired
async function getValidAccessToken(user) {
  if (!user.googleRefreshToken) {
    throw new Error('No refresh token available. Please reconnect Google Fit.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken
  });

  // Check if token is expired
  const now = new Date();
  if (user.googleTokenExpiry && user.googleTokenExpiry > now) {
    return user.googleAccessToken;
  }

  // Refresh token
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update user with new token
    user.googleAccessToken = credentials.access_token;
    user.googleTokenExpiry = new Date(credentials.expiry_date);
    await user.save();

    console.log('🔄 Refreshed Google token for:', user.email);
    return credentials.access_token;
  } catch (error) {
    console.error('❌ Failed to refresh token:', error);
    throw new Error('Failed to refresh access token. Please reconnect Google Fit.');
  }
}

// Get step count history (last 7 days)
app.get('/api/fitness/steps/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user || !user.googleAccessToken) {
      return res.status(400).json({ 
        error: 'Google Fit not connected',
        message: 'Please connect your Google account to access fitness data.'
      });
    }

    // Get valid access token (refresh if needed)
    const accessToken = await getValidAccessToken(user);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

    // Get date range (last 7 days)
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 7);
    startTime.setHours(0, 0, 0, 0);

    // Request step count data
    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta',
          dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
        }],
        bucketByTime: { durationMillis: 86400000 }, // 1 day in milliseconds
        startTimeMillis: startTime.getTime(),
        endTimeMillis: endTime.getTime()
      }
    });

    // Format the response
    const stepData = response.data.bucket.map(bucket => {
      const date = new Date(parseInt(bucket.startTimeMillis));
      const steps = bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0;
      
      return {
        date: date.toISOString().split('T')[0],
        steps: steps,
        timestamp: bucket.startTimeMillis
      };
    });

    const totalSteps = stepData.reduce((sum, day) => sum + day.steps, 0);
    const averageSteps = stepData.length > 0 ? Math.round(totalSteps / stepData.length) : 0;

    console.log(`📊 Fetched ${stepData.length} days of step data for user:`, user.email);

    res.json({
      userId: user._id,
      userName: user.name,
      period: {
        start: startTime.toISOString(),
        end: endTime.toISOString()
      },
      data: stepData,
      totalSteps: totalSteps,
      averageSteps: averageSteps,
      caloriesBurned: Math.round(totalSteps * 0.04) // Rough estimate: 0.04 cal per step
    });

  } catch (error) {
    console.error('❌ Error fetching Google Fit data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch step data',
      message: error.message 
    });
  }
});

// Get today's step count
app.get('/api/fitness/steps/today/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user || !user.googleAccessToken) {
      return res.status(400).json({ 
        error: 'Google Fit not connected'
      });
    }

    const accessToken = await getValidAccessToken(user);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta'
        }],
        startTimeMillis: startOfDay.getTime(),
        endTimeMillis: now.getTime()
      }
    });

    const steps = response.data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;

    console.log(`👟 Today's steps for ${user.email}:`, steps);

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      steps: steps,
      caloriesBurned: Math.round(steps * 0.04),
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching today\'s steps:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s steps' });
  }
});

// Disconnect Google Fit
app.post('/api/fitness/disconnect/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.googleAccessToken = null;
    user.googleRefreshToken = null;
    user.googleTokenExpiry = null;
    user.fitDataEnabled = false;
    await user.save();

    console.log('🔌 Google Fit disconnected for:', user.email);

    res.json({ message: 'Google Fit disconnected successfully' });
  } catch (error) {
    console.error('❌ Error disconnecting Google Fit:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Fit' });
  }
});

// ============ End Google Fit Routes ============

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    console.log('📥 POST /api/users payload:', req.body);
    const user = new User(req.body);
    await user.save();
    console.log('✅ Created user:', user.email, user._id);
    res.status(201).json(user);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create meal log
app.post('/api/meals', async (req, res) => {
  try {
    const mealLog = new MealLog(req.body);
    await mealLog.save();
    res.status(201).json(mealLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get meal logs for a user
app.get('/api/meals/:userId', async (req, res) => {
  try {
    const meals = await MealLog.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(meals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create chat message
app.post('/api/chat', async (req, res) => {
  try {
    const chatMessage = new ChatMessage(req.body);
    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get chat history for a user
app.get('/api/chat/:userId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Seed sample data
app.post('/api/seed', async (req, res) => {
  try {
    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: 28,
        weight: 75,
        height: 180,
        activityLevel: 'moderately_active',
        goals: ['weight_loss', 'muscle_gain'],
        dailyCalorieGoal: 2200
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        age: 32,
        weight: 65,
        height: 165,
        activityLevel: 'very_active',
        goals: ['maintenance', 'fitness'],
        dailyCalorieGoal: 2000
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        age: 35,
        weight: 85,
        height: 175,
        activityLevel: 'lightly_active',
        goals: ['weight_loss'],
        dailyCalorieGoal: 1800
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    
    // Create sample meal logs
    const sampleMeals = [
      {
        userId: createdUsers[0]._id,
        foods: [
          {
            name: 'Grilled Chicken Breast',
            calories: 300,
            protein: 25,
            carbs: 0,
            fat: 15,
            fiber: 0,
            sugar: 0,
            quantity: '150g'
          },
          {
            name: 'Brown Rice',
            calories: 220,
            protein: 5,
            carbs: 45,
            fat: 2,
            fiber: 4,
            sugar: 1,
            quantity: '100g'
          }
        ],
        totalCalories: 520,
        mealType: 'lunch',
        analysis: 'Balanced meal with good protein content'
      },
      {
        userId: createdUsers[1]._id,
        foods: [
          {
            name: 'Greek Yogurt',
            calories: 150,
            protein: 15,
            carbs: 12,
            fat: 8,
            fiber: 0,
            sugar: 10,
            quantity: '200g'
          },
          {
            name: 'Mixed Berries',
            calories: 80,
            protein: 1,
            carbs: 18,
            fat: 0.5,
            fiber: 8,
            sugar: 14,
            quantity: '100g'
          }
        ],
        totalCalories: 230,
        mealType: 'breakfast',
        analysis: 'Healthy breakfast with probiotics and antioxidants'
      }
    ];

    const createdMeals = await MealLog.insertMany(sampleMeals);

    // Create sample chat messages
    const sampleChats = [
      {
        userId: createdUsers[0]._id,
        role: 'user',
        content: 'How can I lose weight effectively?',
        type: 'text'
      },
      {
        userId: createdUsers[0]._id,
        role: 'assistant',
        content: 'To lose weight effectively, focus on creating a calorie deficit through a combination of proper nutrition and regular exercise. Based on your profile, I recommend reducing your daily intake by 300-500 calories and incorporating both cardio and strength training.',
        type: 'text'
      }
    ];

    const createdChats = await ChatMessage.insertMany(sampleChats);

    res.json({
      message: 'Sample data seeded successfully!',
      data: {
        users: createdUsers.length,
        meals: createdMeals.length,
        chats: createdChats.length
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const mealCount = await MealLog.countDocuments();
    const chatCount = await ChatMessage.countDocuments();
    
    res.json({
      users: userCount,
      meals: mealCount,
      chats: chatCount,
      collections: ['users', 'meallogs', 'chatmessages'],
      database: 'nutritrack',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌱 Seed data: http://localhost:${PORT}/api/seed`);
  console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('📦 MongoDB connection closed');
  process.exit(0);
});