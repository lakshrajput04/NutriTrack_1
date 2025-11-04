import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  goals?: string[];
  dailyCalorieGoal?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
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
export interface IMealLog extends Document {
  userId: string;
  foods: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    quantity: string;
  }>;
  totalCalories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: Date;
  imageUrl?: string;
  analysis?: string;
  createdAt: Date;
}

const mealLogSchema = new Schema<IMealLog>({
  userId: { type: String, required: true },
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
export interface IChatMessage extends Document {
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'nutrition_analysis' | 'workout_suggestion' | 'meal_plan';
  metadata?: any;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  userId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'nutrition_analysis', 'workout_suggestion', 'meal_plan'],
    default: 'text'
  },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Meal Plan Schema
export interface IMealPlan extends Document {
  userId: string;
  name: string;
  description?: string;
  days: Array<{
    date: string;
    meals: {
      breakfast?: any;
      lunch?: any;
      dinner?: any;
      snacks?: any[];
    };
    totalCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  totalCalories: number;
  shoppingList: Array<{
    ingredient: string;
    amount: string;
    category: string;
    purchased: boolean;
  }>;
  isActive: boolean;
  createdAt: Date;
}

const mealPlanSchema = new Schema<IMealPlan>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  days: [{
    date: { type: String, required: true },
    meals: {
      breakfast: { type: Schema.Types.Mixed },
      lunch: { type: Schema.Types.Mixed },
      dinner: { type: Schema.Types.Mixed },
      snacks: [{ type: Schema.Types.Mixed }]
    },
    totalCalories: { type: Number, required: true },
    macros: {
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true }
    }
  }],
  totalCalories: { type: Number, required: true },
  shoppingList: [{
    ingredient: { type: String, required: true },
    amount: { type: String, required: true },
    category: { type: String, default: 'Other' },
    purchased: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Challenge Participation Schema
export interface IChallengeParticipation extends Document {
  userId: string;
  challengeId: string;
  username: string;
  joinedAt: Date;
  progress: Array<{
    date: string;
    goalId: string;
    value: number;
    completed: boolean;
  }>;
  totalScore: number;
  ranking: number;
  isActive: boolean;
}

const challengeParticipationSchema = new Schema<IChallengeParticipation>({
  userId: { type: String, required: true },
  challengeId: { type: String, required: true },
  username: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  progress: [{
    date: { type: String, required: true },
    goalId: { type: String, required: true },
    value: { type: Number, required: true },
    completed: { type: Boolean, default: false }
  }],
  totalScore: { type: Number, default: 0 },
  ranking: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Create and export models
export const User = mongoose.model<IUser>('User', userSchema);
export const MealLog = mongoose.model<IMealLog>('MealLog', mealLogSchema);
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
export const MealPlan = mongoose.model<IMealPlan>('MealPlan', mealPlanSchema);
export const ChallengeParticipation = mongoose.model<IChallengeParticipation>('ChallengeParticipation', challengeParticipationSchema);