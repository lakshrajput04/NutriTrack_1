const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

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
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  dailyCalorieGoal: { type: Number, default: 2000 }
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