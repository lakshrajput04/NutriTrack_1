import { UserProfile } from '../utils/calorieCalculation';
import { MealAnalysis } from './foodAPI';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: 'text' | 'nutrition_analysis' | 'workout_suggestion' | 'meal_plan';
  metadata?: any;
}

export interface CoachRecommendation {
  type: 'nutrition' | 'exercise' | 'hydration' | 'sleep' | 'motivation';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export class AICoachService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1'; // or use Anthropic Claude

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Generate personalized coaching response
  async generateCoachResponse(
    userMessage: string,
    userProfile: UserProfile,
    recentMeals: MealAnalysis[],
    chatHistory: ChatMessage[]
  ): Promise<string> {
    const context = this.buildContextPrompt(userProfile, recentMeals);
    const conversationHistory = this.formatChatHistory(chatHistory);

    const prompt = `
${context}

Previous conversation:
${conversationHistory}

User: ${userMessage}

As an AI health and fitness coach, provide a helpful, personalized response. Consider:
- User's current goals and progress
- Recent nutrition intake
- Appropriate recommendations
- Motivational support
- Safety and health guidelines

Keep responses friendly, informative, and actionable. If medical advice is needed, recommend consulting healthcare professionals.

Response:`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a knowledgeable, supportive health and fitness coach.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI Coach response failed:', error);
      return this.getFallbackResponse(userMessage, userProfile);
    }
  }

  // Generate daily recommendations based on user data
  async generateDailyRecommendations(
    userProfile: UserProfile,
    recentMeals: MealAnalysis[],
    todayCalories: number
  ): Promise<CoachRecommendation[]> {
    const recommendations: CoachRecommendation[] = [];
    
    // Nutrition recommendations
    const calorieDeficit = userProfile.dailyCalorieGoal - todayCalories;
    if (calorieDeficit > 500) {
      recommendations.push({
        type: 'nutrition',
        title: 'Fuel Your Body',
        description: `You're ${calorieDeficit} calories below your goal. Consider adding a healthy snack.`,
        actionItems: [
          'Try a protein smoothie with banana',
          'Have some nuts and fruit',
          'Add healthy fats like avocado to your next meal'
        ],
        priority: 'medium',
        category: 'calorie_intake'
      });
    } else if (calorieDeficit < -200) {
      recommendations.push({
        type: 'nutrition',
        title: 'Stay On Track',
        description: `You're ${Math.abs(calorieDeficit)} calories over your goal today.`,
        actionItems: [
          'Consider a light walk after dinner',
          'Focus on vegetables for your next meal',
          'Stay hydrated to help with satiety'
        ],
        priority: 'low',
        category: 'calorie_balance'
      });
    }

    // Exercise recommendations based on goals
    if (userProfile.goal === 'lose_weight') {
      recommendations.push({
        type: 'exercise',
        title: 'Cardio Boost',
        description: 'Add some cardio to accelerate your weight loss goals.',
        actionItems: [
          '20-30 minutes of brisk walking',
          'Try interval training',
          'Take the stairs when possible'
        ],
        priority: 'high',
        category: 'weight_loss'
      });
    } else if (userProfile.goal === 'build_muscle') {
      recommendations.push({
        type: 'exercise',
        title: 'Strength Training',
        description: 'Focus on resistance training for muscle building.',
        actionItems: [
          'Include compound movements',
          'Progressive overload principle',
          'Allow adequate rest between sessions'
        ],
        priority: 'high',
        category: 'muscle_building'
      });
    }

    // Hydration reminder
    const waterGoal = this.calculateWaterIntake(userProfile);
    recommendations.push({
      type: 'hydration',
      title: 'Stay Hydrated',
      description: `Aim for ${waterGoal.toFixed(1)}L of water today.`,
      actionItems: [
        'Keep a water bottle handy',
        'Set hourly hydration reminders',
        'Eat water-rich foods like cucumber and watermelon'
      ],
      priority: 'medium',
      category: 'hydration'
    });

    return recommendations;
  }

  // Analyze nutrition patterns and provide insights
  analyzeNutritionPatterns(meals: MealAnalysis[], days: number = 7): {
    insights: string[];
    improvements: string[];
    strengths: string[];
  } {
    const totalMeals = meals.length;
    const avgCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0) / totalMeals;
    const avgProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0) / totalMeals;
    
    const insights = [
      `Average calories per meal: ${avgCalories.toFixed(0)}`,
      `Average protein per meal: ${avgProtein.toFixed(1)}g`,
      `Most common meal time: ${this.getMostCommonMealType(meals)}`
    ];

    const improvements = [];
    const strengths = [];

    if (avgProtein < 20) {
      improvements.push('Consider adding more protein-rich foods to your meals');
    } else {
      strengths.push('Good protein intake across meals');
    }

    if (avgCalories > 600) {
      improvements.push('Consider smaller portion sizes or lighter meal options');
    }

    return { insights, improvements, strengths };
  }

  // Build context prompt for AI
  private buildContextPrompt(userProfile: UserProfile, recentMeals: MealAnalysis[]): string {
    const { goal, age, gender, weight, height, activityLevel, dailyCalorieGoal } = userProfile;
    const todayCalories = recentMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);

    return `User Profile:
- Goal: ${goal}
- Age: ${age}, Gender: ${gender}
- Weight: ${weight}kg, Height: ${height}cm
- Activity Level: ${activityLevel}
- Daily Calorie Goal: ${dailyCalorieGoal}
- Today's Calories: ${todayCalories}
- Recent Meals: ${recentMeals.length} meals logged today`;
  }

  private formatChatHistory(history: ChatMessage[]): string {
    return history.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  private getFallbackResponse(userMessage: string, userProfile: UserProfile): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight')) {
      return "For healthy weight loss, focus on creating a moderate calorie deficit through a combination of nutritious eating and regular physical activity. Aim for 1-2 pounds per week.";
    }
    
    if (lowerMessage.includes('exercise') || lowerMessage.includes('workout')) {
      return "Regular exercise is key to reaching your goals! Aim for at least 150 minutes of moderate-intensity cardio per week, plus 2-3 strength training sessions.";
    }
    
    return "I'm here to help with your health and fitness journey! Feel free to ask about nutrition, exercise, meal planning, or any other health-related questions.";
  }

  private getMostCommonMealType(meals: MealAnalysis[]): string {
    const counts = meals.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'lunch';
  }

  private calculateWaterIntake(profile: UserProfile): number {
    const baseIntake = profile.weight * 0.035;
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      active: 1.3,
      very_active: 1.4,
    };
    
    return baseIntake * activityMultipliers[profile.activityLevel];
  }
}

// Predefined coaching tips and motivational messages
export const coachingTips = {
  weightLoss: [
    "Small changes lead to big results. Start with one healthy habit at a time.",
    "Focus on progress, not perfection. Every healthy choice counts!",
    "Remember: you're building a lifestyle, not following a temporary diet.",
  ],
  muscleBuilding: [
    "Consistency with training and nutrition is key to building muscle.",
    "Don't forget to prioritize rest and recovery - muscles grow during rest!",
    "Progressive overload: gradually increase weight, reps, or sets over time.",
  ],
  maintenance: [
    "Maintaining your weight is an achievement worth celebrating!",
    "Keep tracking to stay aware of your habits and patterns.",
    "Regular check-ins help you stay on track with your healthy lifestyle.",
  ],
  general: [
    "Celebrate small victories along your health journey!",
    "Listen to your body - it often knows what it needs.",
    "Healthy living is a marathon, not a sprint. Pace yourself.",
  ]
};

export default AICoachService;