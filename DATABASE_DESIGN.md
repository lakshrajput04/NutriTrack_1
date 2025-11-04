# NutriTrack Database Design Overview

## Database Technology
**MongoDB Atlas** (Cloud-hosted NoSQL Database)
- Flexible schema design
- Scalable for growing user base
- Real-time data synchronization
- Built-in replication and backup

---

## Database Architecture

```
┌─────────────────────────────────────────────────┐
│          MongoDB Atlas (Cloud)                  │
│                                                 │
│  Database: nutritrack                          │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │   users      │  │  meallogs    │           │
│  │  Collection  │  │  Collection  │           │
│  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                     │
│         │ Referenced by   │                     │
│         │◄────────────────┘                     │
│         │                                       │
│         │ Referenced by                         │
│         │◄──────────────────────┐               │
│         │                       │               │
│  ┌──────┴───────┐  ┌───────────┴──────┐       │
│  │ chatmessages │  │   (future)       │       │
│  │  Collection  │  │  Collections     │       │
│  └──────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────┘
```

---

## Collections Overview

### 1. **users** Collection
Stores user profile information, authentication data, and Google Fit integration tokens.

### 2. **meallogs** Collection
Stores all meal entries with detailed nutritional information.

### 3. **chatmessages** Collection
Stores AI coach chat history and interactions.

---

## Detailed Schema Design

### 📋 **1. users Collection**

```javascript
{
  _id: ObjectId,                    // Auto-generated unique identifier
  
  // Basic Profile Information
  name: String (required),          // User's full name
  email: String (required, unique), // Email address (unique index)
  age: Number,                      // User's age in years
  weight: Number,                   // Weight in kilograms
  height: Number,                   // Height in centimeters
  
  // Activity & Goals
  activityLevel: String (enum),     // Activity level
    // Values: 'sedentary', 'lightly_active', 'moderately_active', 
    //         'very_active', 'extra_active'
    // Default: 'moderately_active'
  
  goals: [String],                  // Array of user goals
    // Examples: ['lose_weight', 'gain_muscle', 'maintain_health']
  
  dailyCalorieGoal: Number,         // Target daily calories
    // Default: 2000
  
  // Google Fit Integration (OAuth)
  googleId: String,                 // Google account ID
  googleAccessToken: String,        // OAuth access token (encrypted)
  googleRefreshToken: String,       // OAuth refresh token (encrypted)
  googleTokenExpiry: Date,          // Token expiration timestamp
  fitDataEnabled: Boolean,          // Whether Fit integration is active
    // Default: false
  
  // Timestamps
  createdAt: Date,                  // Account creation timestamp
  updatedAt: Date                   // Last profile update timestamp
}
```

#### Indexes:
```javascript
{ email: 1 }           // Unique index on email
{ googleId: 1 }        // Index on Google ID for OAuth lookup
{ createdAt: -1 }      // Index for sorting by registration date
```

#### Example Document:
```json
{
  "_id": "6549a1b2c3d4e5f6a7b8c9d0",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 28,
  "weight": 75,
  "height": 175,
  "activityLevel": "moderately_active",
  "goals": ["lose_weight", "improve_fitness"],
  "dailyCalorieGoal": 1800,
  "googleId": "108234567890123456789",
  "googleAccessToken": "ya29.a0AfH6SMB...",
  "googleRefreshToken": "1//0gPz7xY...",
  "googleTokenExpiry": "2025-11-05T10:30:00.000Z",
  "fitDataEnabled": true,
  "createdAt": "2025-10-15T08:20:30.000Z",
  "updatedAt": "2025-11-04T14:45:22.000Z"
}
```

---

### 🍽️ **2. meallogs Collection**

```javascript
{
  _id: ObjectId,                    // Auto-generated unique identifier
  
  // Reference to User
  userId: ObjectId (required),      // Reference to users collection
    // ref: 'User'
  
  // Food Items Array
  foods: [{
    name: String (required),        // Food/dish name
    calories: Number (required),    // Calories per serving
    protein: Number (required),     // Protein in grams
    carbs: Number (required),       // Carbohydrates in grams
    fat: Number (required),         // Fat in grams
    fiber: Number,                  // Fiber in grams (optional)
      // Default: 0
    sugar: Number,                  // Sugar in grams (optional)
      // Default: 0
    quantity: String (required)     // Serving size
      // Examples: "1 serving", "200g", "1 cup"
  }],
  
  // Meal Summary
  totalCalories: Number (required), // Sum of all food calories
  mealType: String (enum, required),// Type of meal
    // Values: 'breakfast', 'lunch', 'dinner', 'snack'
  
  date: Date,                       // When meal was consumed
    // Default: Date.now
  
  // Optional Fields
  imageUrl: String,                 // URL to meal photo (future feature)
  analysis: String,                 // AI-generated analysis text
  
  // Timestamps
  createdAt: Date,                  // When log was created
  updatedAt: Date                   // Last update to log
}
```

#### Indexes:
```javascript
{ userId: 1, date: -1 }    // Compound index for user's meal history
{ date: -1 }               // Index for date-based queries
{ mealType: 1 }            // Index for filtering by meal type
```

#### Example Document:
```json
{
  "_id": "6549b2c3d4e5f6a7b8c9d0e1",
  "userId": "6549a1b2c3d4e5f6a7b8c9d0",
  "foods": [
    {
      "name": "Chicken Tikka Masala",
      "calories": 450,
      "protein": 35,
      "carbs": 28,
      "fat": 18,
      "fiber": 4,
      "sugar": 6,
      "quantity": "1 serving"
    },
    {
      "name": "Basmati Rice",
      "calories": 200,
      "protein": 4,
      "carbs": 45,
      "fat": 0.5,
      "fiber": 1,
      "sugar": 0,
      "quantity": "1 cup"
    }
  ],
  "totalCalories": 650,
  "mealType": "lunch",
  "date": "2025-11-04T12:30:00.000Z",
  "analysis": "Balanced meal with good protein content. Consider adding vegetables for more fiber.",
  "createdAt": "2025-11-04T12:35:15.000Z",
  "updatedAt": "2025-11-04T12:35:15.000Z"
}
```

---

### 💬 **3. chatmessages Collection**

```javascript
{
  _id: ObjectId,                    // Auto-generated unique identifier
  
  // Reference to User
  userId: ObjectId (required),      // Reference to users collection
    // ref: 'User'
  
  // Message Content
  role: String (enum, required),    // Message sender
    // Values: 'user', 'assistant'
  
  content: String (required),       // Message text content
  
  type: String (enum),              // Type of message
    // Values: 'text', 'nutrition_analysis', 'workout_suggestion', 'meal_plan'
    // Default: 'text'
  
  // Additional Data
  metadata: Mixed,                  // Flexible field for additional data
    // Can store: meal plans, workout routines, analysis results, etc.
  
  // Timestamps
  createdAt: Date,                  // When message was sent
  updatedAt: Date                   // Last update (if edited)
}
```

#### Indexes:
```javascript
{ userId: 1, createdAt: -1 }    // Compound index for user's chat history
{ createdAt: -1 }               // Index for recent messages
```

#### Example Document:
```json
{
  "_id": "6549c3d4e5f6a7b8c9d0e1f2",
  "userId": "6549a1b2c3d4e5f6a7b8c9d0",
  "role": "user",
  "content": "Can you suggest a high-protein breakfast?",
  "type": "text",
  "metadata": null,
  "createdAt": "2025-11-04T08:15:20.000Z",
  "updatedAt": "2025-11-04T08:15:20.000Z"
}
```

```json
{
  "_id": "6549c3d4e5f6a7b8c9d0e1f3",
  "userId": "6549a1b2c3d4e5f6a7b8c9d0",
  "role": "assistant",
  "content": "Here's a high-protein breakfast suggestion...",
  "type": "meal_plan",
  "metadata": {
    "mealPlan": {
      "name": "High-Protein Breakfast",
      "items": [
        { "name": "Greek Yogurt", "protein": 20, "calories": 150 },
        { "name": "Scrambled Eggs (3)", "protein": 18, "calories": 210 },
        { "name": "Whole Wheat Toast", "protein": 8, "calories": 140 }
      ],
      "totalProtein": 46,
      "totalCalories": 500
    }
  },
  "createdAt": "2025-11-04T08:15:25.000Z",
  "updatedAt": "2025-11-04T08:15:25.000Z"
}
```

---

## Relationships & References

### User → MealLogs (One-to-Many)
```javascript
// One user can have many meal logs
User (1) ────┬───► MealLog (N)
             │
             └───► MealLog
```

**Query Example:**
```javascript
// Get all meals for a user
const meals = await MealLog.find({ userId: user._id }).sort({ date: -1 });

// Get today's meals
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayMeals = await MealLog.find({ 
  userId: user._id, 
  date: { $gte: today } 
});
```

### User → ChatMessages (One-to-Many)
```javascript
// One user can have many chat messages
User (1) ────┬───► ChatMessage (N)
             │
             └───► ChatMessage
```

**Query Example:**
```javascript
// Get chat history for a user
const chatHistory = await ChatMessage
  .find({ userId: user._id })
  .sort({ createdAt: 1 })
  .limit(50);
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Actions                         │
└────────────┬────────────────────────────────────────────┘
             │
             ├─── Login/Register ───────────────────────┐
             │                                           │
             ├─── Log Meal ──────────────────────────┐  │
             │                                        │  │
             ├─── Chat with AI Coach ──────────────┐ │  │
             │                                      │ │  │
             ├─── Connect Google Fit ───────────┐  │ │  │
             │                                   │  │ │  │
             ▼                                   ▼  ▼ ▼  ▼
┌────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Auth Routes  │  │ Meal Routes  │  │  Chat Routes    │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│         │                 │                    │          │
└─────────┼─────────────────┼────────────────────┼──────────┘
          │                 │                    │
          ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Database)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    users     │  │   meallogs   │  │chatmessages  │ │
│  │  Collection  │  │  Collection  │  │ Collection   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
          │                 │                    │
          └─────────────────┴────────────────────┘
                            │
                            ▼
          ┌───────────────────────────────────┐
          │    Analytics & Reports            │
          │  - Daily calorie tracking         │
          │  - Weekly statistics              │
          │  - Macro breakdown                │
          │  - Progress charts                │
          └───────────────────────────────────┘
```

---

## Database Operations

### **CREATE Operations**

#### 1. Create New User
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "name": "John Doe",
  "age": 25,
  "weight": 70,
  "height": 175,
  "activityLevel": "moderately_active"
}

// Creates new user document in 'users' collection
```

#### 2. Log New Meal
```javascript
POST /api/meals
{
  "userId": "user_id",
  "foods": [{ name, calories, protein, carbs, fat, quantity }],
  "totalCalories": 650,
  "mealType": "lunch",
  "date": "2025-11-04T12:30:00.000Z"
}

// Creates new meal log in 'meallogs' collection
```

#### 3. Save Chat Message
```javascript
POST /api/chat
{
  "userId": "user_id",
  "role": "user",
  "content": "Can you help me?",
  "type": "text"
}

// Creates new message in 'chatmessages' collection
```

---

### **READ Operations**

#### 1. Get User Profile
```javascript
GET /api/users/:id

// Returns complete user document with all fields
```

#### 2. Get Meal History
```javascript
GET /api/meals/:userId

// Returns array of meal logs, sorted by date (newest first)
// Includes all food items and nutritional data
```

#### 3. Get Today's Meals
```javascript
// Frontend service: getTodayMeals(userId)
// Filters meal logs where date >= today 00:00:00
```

#### 4. Get Weekly Stats
```javascript
// Frontend service: getWeeklyMeals(userId)
// Filters meal logs from last 7 days
// Calculates:
//   - Total calories
//   - Average daily calories
//   - Total meals logged
//   - Days with at least one meal
```

#### 5. Get Chat History
```javascript
GET /api/chat/:userId

// Returns array of messages, sorted by timestamp
```

---

### **UPDATE Operations**

#### 1. Update User Profile
```javascript
PUT /api/users/:id
{
  "age": 26,
  "weight": 68,
  "dailyCalorieGoal": 1900
}

// Updates user document, preserves other fields
// Sets updatedAt to current timestamp
```

#### 2. Update Google Fit Tokens
```javascript
// Automatic during OAuth refresh
// Updates: googleAccessToken, googleTokenExpiry
```

---

### **DELETE Operations**

#### 1. Disconnect Google Fit
```javascript
POST /api/fitness/disconnect/:userId

// Sets to null:
//   - googleAccessToken
//   - googleRefreshToken
//   - googleTokenExpiry
// Sets fitDataEnabled to false
```

---

## Query Patterns & Performance

### **Common Queries**

#### 1. Get User's Recent Meals
```javascript
db.meallogs.find({ 
  userId: ObjectId("user_id") 
})
.sort({ date: -1 })
.limit(10)

// Uses index: { userId: 1, date: -1 }
// Performance: O(log n) + O(10)
```

#### 2. Get Daily Calorie Total
```javascript
db.meallogs.aggregate([
  {
    $match: {
      userId: ObjectId("user_id"),
      date: { 
        $gte: ISODate("2025-11-04T00:00:00.000Z"),
        $lt: ISODate("2025-11-05T00:00:00.000Z")
      }
    }
  },
  {
    $group: {
      _id: null,
      totalCalories: { $sum: "$totalCalories" },
      mealCount: { $sum: 1 }
    }
  }
])

// Efficient aggregation pipeline
```

#### 3. Get Macronutrient Breakdown
```javascript
db.meallogs.aggregate([
  {
    $match: {
      userId: ObjectId("user_id"),
      date: { $gte: weekAgo }
    }
  },
  {
    $unwind: "$foods"
  },
  {
    $group: {
      _id: null,
      totalProtein: { $sum: "$foods.protein" },
      totalCarbs: { $sum: "$foods.carbs" },
      totalFat: { $sum: "$foods.fat" }
    }
  }
])
```

---

## Data Validation

### **Schema Validation Rules**

```javascript
// MongoDB validation at collection level
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      required: ["name", "email"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        age: {
          bsonType: "int",
          minimum: 13,
          maximum: 120
        },
        weight: {
          bsonType: "number",
          minimum: 20,
          maximum: 500
        },
        dailyCalorieGoal: {
          bsonType: "int",
          minimum: 1000,
          maximum: 10000
        }
      }
    }
  }
})
```

---

## Security Considerations

### 1. **Sensitive Data Protection**
```javascript
// Google tokens stored but never exposed in API responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.googleAccessToken;
  delete user.googleRefreshToken;
  return user;
};
```

### 2. **Access Control**
```javascript
// Users can only access their own data
app.get('/api/meals/:userId', async (req, res) => {
  // Verify req.params.userId matches authenticated user
  if (req.user._id !== req.params.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  // ... proceed with query
});
```

### 3. **Input Sanitization**
```javascript
// Mongoose automatically sanitizes input
// Prevents NoSQL injection
```

---

## Scalability & Performance

### **Current Design**
- ✅ Suitable for **0-100,000 users**
- ✅ Efficient queries with proper indexes
- ✅ Document size within MongoDB limits (16MB max)

### **Indexes for Performance**
```javascript
// users collection
{ email: 1 }              // Unique, for authentication
{ googleId: 1 }           // For OAuth lookups
{ createdAt: -1 }         // For admin queries

// meallogs collection
{ userId: 1, date: -1 }   // Primary query pattern
{ date: -1 }              // For analytics
{ mealType: 1 }           // For meal type filtering

// chatmessages collection
{ userId: 1, createdAt: -1 } // Chat history
```

### **Future Optimization Strategies**

1. **Sharding** (if > 1M users)
   ```javascript
   // Shard by userId for horizontal scaling
   sh.shardCollection("nutritrack.meallogs", { userId: 1 })
   ```

2. **Archiving Old Data**
   ```javascript
   // Move meals older than 1 year to archive collection
   // Keeps active queries fast
   ```

3. **Caching Layer**
   ```javascript
   // Redis for frequently accessed data
   // - User profiles
   // - Today's meal totals
   // - Recent chat messages
   ```

---

## Backup & Recovery

### **MongoDB Atlas Features**
- ✅ **Automatic Backups**: Daily snapshots
- ✅ **Point-in-Time Recovery**: Restore to any point within backup window
- ✅ **Geo-Redundancy**: Data replicated across regions
- ✅ **Encryption**: At rest and in transit

### **Backup Strategy**
```
Daily:     Automated snapshots (retained 7 days)
Weekly:    Full backup (retained 4 weeks)
Monthly:   Archive backup (retained 12 months)
```

---

## Database Statistics

### **Current Collections**

| Collection    | Documents | Avg Size | Indexes | Purpose |
|--------------|-----------|----------|---------|---------|
| users        | Variable  | 1-2 KB   | 3       | User profiles & auth |
| meallogs     | Variable  | 2-4 KB   | 3       | Meal tracking |
| chatmessages | Variable  | 0.5-2 KB | 2       | AI coach history |

### **Growth Estimates**

**Per User (monthly):**
- Meal logs: ~90 documents (3 meals/day × 30 days)
- Chat messages: ~20-50 documents
- Storage: ~400-500 KB

**For 1,000 users:**
- Total storage: ~500 MB/month
- Total documents: ~110,000/month

---

## Summary

### ✅ **Strengths**
1. **Flexible Schema**: Easy to add new fields
2. **Scalable**: Handles growth from prototype to production
3. **Real-time Ready**: Fast queries with proper indexes
4. **Cloud-based**: Managed by MongoDB Atlas
5. **Secure**: OAuth tokens encrypted, access controlled

### 🔧 **Future Enhancements**
1. Add **recipes** collection (pre-defined meals)
2. Add **goals** collection (tracking progress)
3. Add **notifications** collection (reminders)
4. Add **friends** collection (social features)
5. Implement **data aggregation** collection for analytics

---

**Database Status**: ✅ Production-ready
**Last Updated**: November 4, 2025
**Version**: 1.0
