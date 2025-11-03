import { UserProfile } from '../utils/calorieCalculation';
import { MealAnalysis } from './freeFoodAPI';
import { geminiService } from './geminiService';

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

export class FreeAICoachService {
  private knowledgeBase: CoachKnowledgeBase;

  constructor() {
    this.knowledgeBase = new CoachKnowledgeBase();
  }

  // Generate personalized coaching response using Google Gemini API
  async generateCoachResponse(
    userMessage: string,
    userProfile: UserProfile,
    recentMeals: MealAnalysis[],
    chatHistory: ChatMessage[]
  ): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();
    const context = this.buildUserContext(userProfile, recentMeals);
    
    // Try Gemini API first, fallback to rule-based
    try {
      const response = await geminiService.getHealthCoachResponse(userMessage, userProfile);
      if (response && response.trim()) return response;
    } catch (error) {
      console.warn('Gemini API failed, using rule-based response');
    }

    // Rule-based response system as fallback
    return this.generateRuleBasedResponse(lowerMessage, userProfile, recentMeals, context);
  }

  // Try Hugging Face free inference API
  private async tryHuggingFaceAPI(message: string, context: string): Promise<string | null> {
    try {
      // Using Hugging Face's free inference API (no API key required for basic models)
      const response = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: `Context: ${context}\nUser: ${message}\nCoach:`,
            parameters: {
              max_length: 200,
              temperature: 0.7,
              return_full_text: false
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data[0]?.generated_text?.trim() || null;
      }
    } catch (error) {
      console.warn('Hugging Face API failed:', error);
    }
    return null;
  }

  // Rule-based AI coach responses
  private generateRuleBasedResponse(
    message: string,
    userProfile: UserProfile,
    recentMeals: MealAnalysis[],
    context: any
  ): string {
    // Analyze user intent
    const intent = this.analyzeIntent(message);
    
    switch (intent) {
      case 'weight_loss':
        return this.knowledgeBase.getWeightLossAdvice(userProfile, context);
      
      case 'exercise':
        return this.knowledgeBase.getExerciseAdvice(userProfile, context);
      
      case 'nutrition':
        return this.knowledgeBase.getNutritionAdvice(userProfile, recentMeals, context);
      
      case 'motivation':
        return this.knowledgeBase.getMotivationalMessage(userProfile, context);
      
      case 'meal_planning':
        return this.knowledgeBase.getMealPlanningAdvice(userProfile, context);
      
      case 'progress':
        return this.knowledgeBase.getProgressAnalysis(userProfile, recentMeals, context);
      
      default:
        return this.knowledgeBase.getGeneralHealthAdvice(userProfile, context);
    }
  }

  // Analyze user message intent
  private analyzeIntent(message: string): string {
    const weightLossKeywords = ['lose weight', 'weight loss', 'shed pounds', 'get lean', 'cut fat'];
    const exerciseKeywords = ['workout', 'exercise', 'gym', 'training', 'fitness', 'cardio'];
    const nutritionKeywords = ['eat', 'food', 'nutrition', 'diet', 'calories', 'protein'];
    const motivationKeywords = ['motivation', 'discouraged', 'give up', 'struggling', 'hard'];
    const mealPlanKeywords = ['meal plan', 'what to eat', 'food plan', 'menu', 'recipes'];
    const progressKeywords = ['progress', 'results', 'how am i doing', 'tracking'];

    if (weightLossKeywords.some(keyword => message.includes(keyword))) return 'weight_loss';
    if (exerciseKeywords.some(keyword => message.includes(keyword))) return 'exercise';
    if (nutritionKeywords.some(keyword => message.includes(keyword))) return 'nutrition';
    if (motivationKeywords.some(keyword => message.includes(keyword))) return 'motivation';
    if (mealPlanKeywords.some(keyword => message.includes(keyword))) return 'meal_planning';
    if (progressKeywords.some(keyword => message.includes(keyword))) return 'progress';

    return 'general';
  }

  // Build user context for responses
  private buildUserContext(userProfile: UserProfile, recentMeals: MealAnalysis[]) {
    const todayCalories = recentMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
    const calorieBalance = userProfile.dailyCalorieGoal - todayCalories;
    
    return {
      goal: userProfile.goal,
      calorieBalance,
      todayCalories,
      targetCalories: userProfile.dailyCalorieGoal,
      age: userProfile.age,
      activityLevel: userProfile.activityLevel,
      mealsToday: recentMeals.length
    };
  }

  // Generate daily recommendations without external APIs
  async generateDailyRecommendations(
    userProfile: UserProfile,
    recentMeals: MealAnalysis[],
    todayCalories: number
  ): Promise<CoachRecommendation[]> {
    const recommendations: CoachRecommendation[] = [];
    const calorieDeficit = userProfile.dailyCalorieGoal - todayCalories;
    
    // Calorie-based recommendations
    if (calorieDeficit > 500) {
      recommendations.push({
        type: 'nutrition',
        title: 'Fuel Your Body',
        description: `You're ${calorieDeficit} calories below your goal. Your body needs more fuel to function optimally.`,
        actionItems: [
          'Add a protein-rich snack like Greek yogurt with nuts',
          'Include healthy fats like avocado or olive oil in your next meal',
          'Consider a banana with peanut butter for quick energy'
        ],
        priority: 'high',
        category: 'calorie_intake'
      });
    } else if (calorieDeficit < -200) {
      recommendations.push({
        type: 'exercise',
        title: 'Balance Your Intake',
        description: `You're ${Math.abs(calorieDeficit)} calories over your goal. Let's balance it out!`,
        actionItems: [
          'Take a 20-30 minute walk after dinner',
          'Choose lighter options for your remaining meals',
          'Drink more water to help with satiety'
        ],
        priority: 'medium',
        category: 'calorie_balance'
      });
    }

    // Goal-specific recommendations
    if (userProfile.goal === 'lose_weight') {
      recommendations.push({
        type: 'exercise',
        title: 'Cardio for Weight Loss',
        description: 'Cardio exercise helps create the calorie deficit needed for weight loss.',
        actionItems: [
          '30 minutes of brisk walking or cycling',
          'Try high-intensity interval training (HIIT)',
          'Take stairs instead of elevators'
        ],
        priority: 'high',
        category: 'weight_loss'
      });
    } else if (userProfile.goal === 'build_muscle') {
      recommendations.push({
        type: 'exercise',
        title: 'Strength Training Focus',
        description: 'Resistance training is essential for building and maintaining muscle mass.',
        actionItems: [
          'Include compound exercises like squats and deadlifts',
          'Progressive overload: gradually increase weights',
          'Ensure adequate protein intake (1.6-2.2g per kg body weight)'
        ],
        priority: 'high',
        category: 'muscle_building'
      });
    }

    // Hydration recommendation
    const waterGoal = this.calculateWaterIntake(userProfile);
    recommendations.push({
      type: 'hydration',
      title: 'Stay Hydrated',
      description: `Aim for ${waterGoal.toFixed(1)}L of water today for optimal health and performance.`,
      actionItems: [
        'Keep a water bottle at your desk',
        'Drink a glass of water before each meal',
        'Add lemon or cucumber for flavor variety'
      ],
      priority: 'medium',
      category: 'hydration'
    });

    // Meal timing recommendation
    if (recentMeals.length < 3) {
      recommendations.push({
        type: 'nutrition',
        title: 'Meal Consistency',
        description: 'Regular meals help maintain stable energy levels and metabolism.',
        actionItems: [
          'Aim for 3 main meals and 1-2 healthy snacks',
          'Don\'t skip breakfast - it kickstarts your metabolism',
          'Plan your meals in advance to avoid impulsive choices'
        ],
        priority: 'medium',
        category: 'meal_timing'
      });
    }

    return recommendations;
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

// Knowledge base for rule-based AI coaching
class CoachKnowledgeBase {
  getWeightLossAdvice(profile: UserProfile, context: any): string {
    const deficit = context.calorieBalance;
    
    if (deficit > 0) {
      return `Great job staying within your calorie goal! For healthy weight loss, maintain a moderate deficit of 300-500 calories daily. You currently have ${deficit} calories remaining today. Consider adding a protein-rich snack to support your metabolism while staying in a deficit.`;
    } else {
      return `Weight loss happens when we burn more calories than we consume. You're ${Math.abs(deficit)} calories over your goal today. Try incorporating more vegetables into your meals and adding a 20-30 minute walk. Remember, small consistent changes lead to lasting results!`;
    }
  }

  getExerciseAdvice(profile: UserProfile, context: any): string {
    const advice = [
      "For optimal health, aim for at least 150 minutes of moderate-intensity cardio per week, plus 2-3 strength training sessions.",
      "Start small if you're new to exercise - even 10 minutes of walking makes a difference!",
      "Mix up your routine with cardio, strength training, and flexibility work to prevent boredom and overuse injuries."
    ];

    if (profile.goal === 'lose_weight') {
      advice.push("For weight loss, focus on creating a calorie deficit through a combination of diet and exercise. Cardio helps burn calories, while strength training preserves muscle mass.");
    } else if (profile.goal === 'build_muscle') {
      advice.push("For muscle building, prioritize progressive resistance training 3-4 times per week. Don't forget adequate protein and rest for recovery!");
    }

    return advice[Math.floor(Math.random() * advice.length)];
  }

  getNutritionAdvice(profile: UserProfile, meals: MealAnalysis[], context: any): string {
    const mealCount = meals.length;
    const avgProtein = meals.reduce((sum, m) => sum + m.totalProtein, 0) / Math.max(mealCount, 1);

    if (mealCount < 3) {
      return "Try to eat regular meals throughout the day to maintain stable blood sugar and energy levels. Aim for 3 main meals with 1-2 healthy snacks if needed.";
    }

    if (avgProtein < 20) {
      return "Consider adding more protein to your meals! Good sources include lean meats, fish, eggs, beans, Greek yogurt, and nuts. Protein helps with satiety and muscle maintenance.";
    }

    return "You're doing well with your nutrition! Keep focusing on whole foods, adequate protein, and staying within your calorie goals. Remember to include plenty of vegetables for vitamins and fiber.";
  }

  getMotivationalMessage(profile: UserProfile, context: any): string {
    const messages = [
      "Every healthy choice you make is an investment in your future self. You've got this! 💪",
      "Progress isn't always linear, but consistency is key. Keep showing up for yourself every day.",
      "Remember why you started. Your health is worth every effort you're putting in.",
      "Small steps daily lead to big changes yearly. Celebrate your progress, no matter how small!",
      "You're building habits that will last a lifetime. That's something to be proud of!",
      "Setbacks are part of the journey. What matters is getting back on track - and you're here, so you're already doing that!"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  getMealPlanningAdvice(profile: UserProfile, context: any): string {
    return `Based on your ${profile.goal} goal, focus on meals that include lean protein, complex carbs, and healthy fats. With your ${context.targetCalories} calorie target, try to distribute this across 3 main meals (400-500 calories each) and 1-2 snacks (100-200 calories). Meal prep on Sundays can help you stay consistent!`;
  }

  getProgressAnalysis(profile: UserProfile, meals: MealAnalysis[], context: any): string {
    const consistency = meals.length >= 3 ? "excellent" : "good";
    const calorieAccuracy = Math.abs(context.calorieBalance) < 200 ? "right on target" : "needs adjustment";

    return `Your tracking consistency is ${consistency} today! Your calorie intake is ${calorieAccuracy}. ${
      context.calorieBalance > 0 
        ? `You have ${context.calorieBalance} calories remaining - consider a balanced snack.`
        : `You're ${Math.abs(context.calorieBalance)} calories over - a short walk could help balance things out.`
    }`;
  }

  getGeneralHealthAdvice(profile: UserProfile, context: any): string {
    const tips = [
      "Focus on building sustainable healthy habits rather than quick fixes. What you do consistently matters more than what you do occasionally.",
      "Remember the basics: eat mostly whole foods, stay hydrated, move your body daily, and get adequate sleep.",
      "Listen to your body. Rest when you need to rest, fuel when you need to fuel, and move when you need to move.",
      "Health is about more than just weight - focus on how you feel, your energy levels, and your overall well-being."
    ];

    return tips[Math.floor(Math.random() * tips.length)];
  }
}

export default FreeAICoachService;