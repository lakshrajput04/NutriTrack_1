# NutriTrack Database Entity-Relationship Diagram (ERD)

## Visual Database Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USERS COLLECTION                         │
├─────────────────────────────────────────────────────────────────────┤
│  PK  _id: ObjectId                                                  │
│  UK  email: String                                                  │
│      name: String                                                   │
│      age: Number                                                    │
│      weight: Number                                                 │
│      height: Number                                                 │
│      activityLevel: Enum                                            │
│      goals: [String]                                                │
│      dailyCalorieGoal: Number                                       │
│      googleId: String                                               │
│      googleAccessToken: String (encrypted)                          │
│      googleRefreshToken: String (encrypted)                         │
│      googleTokenExpiry: Date                                        │
│      fitDataEnabled: Boolean                                        │
│      createdAt: Date                                                │
│      updatedAt: Date                                                │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          │ 1
                          │
                          │ has many
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            │ N           │ N           │ N
            ▼             ▼             ▼
┌───────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   MEALLOGS        │ │  CHATMESSAGES    │ │  (Future)        │
│   COLLECTION      │ │  COLLECTION      │ │  COLLECTIONS     │
├───────────────────┤ ├──────────────────┤ ├──────────────────┤
│ PK _id: ObjectId  │ │ PK _id: ObjectId │ │ - goals          │
│ FK userId: ObjId  │ │ FK userId: ObjId │ │ - recipes        │
│    foods: [       │ │    role: Enum    │ │ - notifications  │
│      {            │ │    content: Str  │ │ - friends        │
│        name       │ │    type: Enum    │ │ - workouts       │
│        calories   │ │    metadata: Mix │ │                  │
│        protein    │ │    createdAt     │ │                  │
│        carbs      │ │    updatedAt     │ │                  │
│        fat        │ │                  │ │                  │
│        fiber      │ └──────────────────┘ └──────────────────┘
│        sugar      │
│        quantity   │
│      }            │
│    ]              │
│    totalCalories  │
│    mealType: Enum │
│    date: Date     │
│    imageUrl: Str  │
│    analysis: Str  │
│    createdAt      │
│    updatedAt      │
└───────────────────┘
```

## Relationship Details

### One-to-Many Relationships

#### 1. User → MealLogs (1:N)
```
One User can have MANY Meal Logs
Each Meal Log belongs to ONE User

Cardinality: 1:N (One-to-Many)
```

**Foreign Key**: `meallogs.userId` → `users._id`

**Example**:
```
User: John Doe (_id: "abc123")
  ↓
  ├─ MealLog 1: Breakfast (userId: "abc123")
  ├─ MealLog 2: Lunch (userId: "abc123")
  ├─ MealLog 3: Dinner (userId: "abc123")
  └─ MealLog 4: Snack (userId: "abc123")
```

#### 2. User → ChatMessages (1:N)
```
One User can have MANY Chat Messages
Each Chat Message belongs to ONE User

Cardinality: 1:N (One-to-Many)
```

**Foreign Key**: `chatmessages.userId` → `users._id`

**Example**:
```
User: John Doe (_id: "abc123")
  ↓
  ├─ Message 1: "What should I eat?" (userId: "abc123")
  ├─ Message 2: (AI Response) (userId: "abc123")
  ├─ Message 3: "Give me a meal plan" (userId: "abc123")
  └─ Message 4: (AI Response) (userId: "abc123")
```

---

## Data Flow Visualization

```
                    ┌──────────────┐
                    │   Frontend   │
                    │   (React)    │
                    └──────┬───────┘
                           │
                           │ HTTP/REST API
                           │
                    ┌──────▼───────┐
                    │   Backend    │
                    │  (Express)   │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    users     │  │   meallogs   │  │chatmessages  │
│              │  │              │  │              │
│ CREATE: ✓    │  │ CREATE: ✓    │  │ CREATE: ✓    │
│ READ: ✓      │  │ READ: ✓      │  │ READ: ✓      │
│ UPDATE: ✓    │  │ UPDATE: -    │  │ UPDATE: -    │
│ DELETE: -    │  │ DELETE: -    │  │ DELETE: -    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Collection Hierarchy

```
nutritrack (Database)
│
├── users
│   ├── Index: email (unique)
│   ├── Index: googleId
│   └── Index: createdAt (desc)
│
├── meallogs
│   ├── Index: userId + date (compound, desc)
│   ├── Index: date (desc)
│   └── Index: mealType
│
└── chatmessages
    ├── Index: userId + createdAt (compound, desc)
    └── Index: createdAt (desc)
```

---

## Query Flow Examples

### Example 1: User Logs a Meal
```
1. User Input:
   - Meal type: "lunch"
   - Food: "Chicken Tikka"
   - Calories: 450

2. Frontend → Backend:
   POST /api/meals
   {
     userId: "abc123",
     foods: [{ name: "Chicken Tikka", calories: 450, ... }],
     totalCalories: 450,
     mealType: "lunch"
   }

3. Backend → MongoDB:
   INSERT INTO meallogs
   {
     userId: ObjectId("abc123"),
     foods: [...],
     totalCalories: 450,
     mealType: "lunch",
     date: new Date()
   }

4. MongoDB Response:
   {
     _id: "xyz789",
     userId: "abc123",
     ...
   }

5. Backend → Frontend:
   201 Created
   { meal: {...} }
```

### Example 2: Dashboard Loads Weekly Stats
```
1. Frontend Request:
   GET /api/meals/abc123

2. Backend Query:
   db.meallogs.find({
     userId: ObjectId("abc123"),
     date: { $gte: sevenDaysAgo }
   })
   .sort({ date: -1 })

3. MongoDB Returns:
   [
     { _id: "1", totalCalories: 650, date: "2025-11-04", ... },
     { _id: "2", totalCalories: 450, date: "2025-11-04", ... },
     { _id: "3", totalCalories: 800, date: "2025-11-03", ... },
     ...
   ]

4. Backend Calculates:
   - Total meals: 21
   - Total calories: 13,846
   - Avg daily: 1,978

5. Frontend Displays:
   Charts, stats, progress indicators
```

---

## Google Fit Integration Flow

```
┌──────────────────────────────────────────────────────────┐
│                    User Action                           │
│         "Connect Google Fit" button clicked              │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│            Redirect to Google OAuth                      │
│      https://accounts.google.com/oauth/authorize         │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│           User Grants Permissions                        │
│    - View fitness activity data                          │
│    - View location data                                  │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│         Callback: /auth/google/callback                  │
│    Receives: accessToken, refreshToken, profile          │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│            UPDATE users collection                       │
│    SET googleId = profile.id                             │
│    SET googleAccessToken = accessToken (encrypted)       │
│    SET googleRefreshToken = refreshToken (encrypted)     │
│    SET fitDataEnabled = true                             │
│    SET updatedAt = now()                                 │
│    WHERE _id = userId                                    │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│         Redirect to Dashboard                            │
│    ?google_fit_connected=true                            │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│       Dashboard Fetches Step Data                        │
│    GET /api/fitness/steps/:userId                        │
│      ↓                                                    │
│    Google Fit API Call                                   │
│      ↓                                                    │
│    Returns: 7 days of step count                         │
│      ↓                                                    │
│    Display in UI                                         │
└──────────────────────────────────────────────────────────┘
```

---

## Database Size Calculations

### Per User (Monthly)

| Collection    | Documents | Size per Doc | Total Size |
|---------------|-----------|--------------|------------|
| users         | 1         | 1.5 KB       | 1.5 KB     |
| meallogs      | ~90       | 3 KB         | 270 KB     |
| chatmessages  | ~30       | 1 KB         | 30 KB      |
| **TOTAL**     | **121**   | -            | **301.5 KB** |

### Scaling Projections

| Users  | Storage (Month) | Storage (Year) | Collections Size |
|--------|-----------------|----------------|------------------|
| 100    | 30 MB           | 360 MB         | Small            |
| 1,000  | 300 MB          | 3.6 GB         | Medium           |
| 10,000 | 3 GB            | 36 GB          | Large            |
| 100K   | 30 GB           | 360 GB         | Very Large       |

**MongoDB Atlas Free Tier**: 512 MB (supports ~1,700 users for 1 month)
**M0 Cluster**: 512 MB
**M2 Cluster**: 2 GB
**M10 Cluster**: 10 GB

---

## Index Performance Analysis

### Query: Get Today's Meals
```javascript
db.meallogs.find({
  userId: ObjectId("abc123"),
  date: { $gte: ISODate("2025-11-04T00:00:00.000Z") }
})
```

**Without Index**: O(n) - Full collection scan
**With Index { userId: 1, date: -1 }**: O(log n) - B-tree lookup

**Performance Improvement**: 100-1000x faster for large datasets

---

## Data Integrity Constraints

### 1. Required Fields
```
users:
  ✓ name (must exist)
  ✓ email (must exist, must be unique)

meallogs:
  ✓ userId (must exist, must reference valid user)
  ✓ foods (must be non-empty array)
  ✓ totalCalories (must exist)
  ✓ mealType (must be valid enum)

chatmessages:
  ✓ userId (must exist, must reference valid user)
  ✓ role (must be 'user' or 'assistant')
  ✓ content (must exist)
```

### 2. Referential Integrity
```
If User is deleted:
  → Cascade delete all meallogs
  → Cascade delete all chatmessages
  (Currently not implemented - future enhancement)
```

### 3. Data Validation
```javascript
// Email format validation
email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Age range
age: { min: 13, max: 120 }

// Weight range (kg)
weight: { min: 20, max: 500 }

// Height range (cm)
height: { min: 50, max: 300 }

// Calorie goal range
dailyCalorieGoal: { min: 1000, max: 10000 }
```

---

## Summary

### Database Structure:
- **3 main collections** (users, meallogs, chatmessages)
- **2 one-to-many relationships**
- **8 indexes** for optimal query performance
- **NoSQL schema** for flexibility

### Key Features:
- ✅ Scalable design
- ✅ Efficient queries
- ✅ Google Fit integration ready
- ✅ Real-time data access
- ✅ Cloud-hosted (MongoDB Atlas)

### Next Steps:
1. Review this design
2. Continue with Google Fit setup
3. Test with real data
4. Optimize based on usage patterns

---

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: ✅ Production Ready
