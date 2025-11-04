import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY || '');
    // Use gemini-2.0-flash for fast text generation
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async analyzeFood(foodDescription: string, imageBase64?: string): Promise<{
    foods: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugar: number;
      sodium: number;
      quantity: string;
    }>;
    totalCalories: number;
    analysis: string;
  }> {
    try {
      const prompt = `
        Analyze this food: "${foodDescription}"
        
        Please provide a detailed nutritional analysis in JSON format with this exact structure:
        {
          "foods": [
            {
              "name": "food name",
              "calories": number,
              "protein": number (grams),
              "carbs": number (grams),
              "fat": number (grams),
              "fiber": number (grams),
              "sugar": number (grams),
              "sodium": number (mg),
              "quantity": "estimated portion size"
            }
          ],
          "totalCalories": number,
          "analysis": "Brief nutritional analysis and health insights"
        }
        
        If multiple foods are detected, include each as a separate object in the foods array.
        Provide realistic nutritional values based on standard serving sizes.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData;
      }
      
      // Fallback if JSON parsing fails
      return this.createFallbackFoodAnalysis(foodDescription);
    } catch (error) {
      console.error('Gemini food analysis error:', error);
      return this.createFallbackFoodAnalysis(foodDescription);
    }
  }

  async getHealthCoachResponse(message: string, userProfile?: any): Promise<string> {
    try {
      const contextPrompt = userProfile ? `
        User Profile Context:
        - Age: ${userProfile.age}
        - Weight: ${userProfile.weight}kg
        - Height: ${userProfile.height}cm
        - Activity Level: ${userProfile.activityLevel}
        - Goals: ${userProfile.goals?.join(', ')}
        - Dietary Preferences: ${userProfile.dietaryPreferences?.join(', ')}
      ` : '';

      const prompt = `
        You are a professional health and fitness coach. Respond to this user message with helpful, personalized advice.
        
        ${contextPrompt}
        
        User Message: "${message}"
        
        Please provide:
        1. A helpful, encouraging response
        2. Practical advice tailored to their profile
        3. Keep it conversational and supportive
        4. Limit response to 2-3 paragraphs
        
        Focus on nutrition, fitness, wellness, and healthy lifestyle habits.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini coach response error:', error);
      return this.getFallbackCoachResponse(message);
    }
  }

  async generateMealPlan(preferences: {
    dietType?: string;
    calories?: number;
    meals?: number;
    allergies?: string[];
    preferences?: string[];
  }): Promise<{
    meals: Array<{
      name: string;
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      calories: number;
      ingredients: string[];
      instructions: string[];
      prepTime: number;
      nutrition: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
      };
    }>;
    totalCalories: number;
    analysis: string;
  }> {
    try {
      const prompt = `
        Generate a daily meal plan with these preferences:
        - Diet Type: ${preferences.dietType || 'balanced'}
        - Target Calories: ${preferences.calories || 2000}
        - Number of Meals: ${preferences.meals || 3}
        - Allergies to Avoid: ${preferences.allergies?.join(', ') || 'none'}
        - Food Preferences: ${preferences.preferences?.join(', ') || 'none'}
        
        Please provide a meal plan in JSON format with this exact structure:
        {
          "meals": [
            {
              "name": "meal name",
              "type": "breakfast|lunch|dinner|snack",
              "calories": number,
              "ingredients": ["ingredient1", "ingredient2"],
              "instructions": ["step1", "step2"],
              "prepTime": number (minutes),
              "nutrition": {
                "protein": number (grams),
                "carbs": number (grams),
                "fat": number (grams),
                "fiber": number (grams)
              }
            }
          ],
          "totalCalories": number,
          "analysis": "Brief analysis of the meal plan's nutritional balance"
        }
        
        Create balanced, healthy meals that meet the calorie target and dietary preferences.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData;
      }
      
      // Fallback if JSON parsing fails
      return this.createFallbackMealPlan(preferences);
    } catch (error) {
      console.error('Gemini meal plan error:', error);
      return this.createFallbackMealPlan(preferences);
    }
  }

  async generateRecipeRecommendations(query: string, dietaryPreferences?: string[]): Promise<Array<{
    id: string;
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    calories: number;
    nutrition: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    tags: string[];
  }>> {
    try {
      const prompt = `
        Generate 3 recipe recommendations for: "${query}"
        
        Consider these dietary preferences: ${dietaryPreferences?.join(', ') || 'none'}
        
        Please provide recipes in JSON format with this exact structure:
        [
          {
            "id": "unique-id",
            "name": "recipe name",
            "description": "brief description",
            "ingredients": ["ingredient1", "ingredient2"],
            "instructions": ["step1", "step2"],
            "prepTime": number (minutes),
            "cookTime": number (minutes),
            "servings": number,
            "difficulty": "easy|medium|hard",
            "calories": number (per serving),
            "nutrition": {
              "protein": number (grams),
              "carbs": number (grams),
              "fat": number (grams),
              "fiber": number (grams)
            },
            "tags": ["tag1", "tag2"]
          }
        ]
        
        Create diverse, healthy recipes that are practical to make.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData;
      }
      
      // Fallback if JSON parsing fails
      return this.createFallbackRecipes(query);
    } catch (error) {
      console.error('Gemini recipe recommendations error:', error);
      return this.createFallbackRecipes(query);
    }
  }

  // Fallback methods for when Gemini API fails
  private createFallbackFoodAnalysis(foodDescription: string) {
    return {
      foods: [{
        name: foodDescription,
        calories: 200,
        protein: 15,
        carbs: 25,
        fat: 8,
        fiber: 3,
        sugar: 5,
        sodium: 300,
        quantity: "1 serving"
      }],
      totalCalories: 200,
      analysis: "Nutritional analysis unavailable. Please try again or enter food details manually."
    };
  }

  private getFallbackCoachResponse(message: string): string {
    const responses = [
      "That's a great question about your health journey! Remember, consistency is key to achieving your goals.",
      "I appreciate you sharing that with me. Focus on making small, sustainable changes each day.",
      "Your dedication to improving your health is admirable. Keep up the good work!",
      "Thanks for checking in! Remember to stay hydrated and listen to your body.",
      "That's an important aspect of wellness. Consider consulting with a healthcare professional for personalized advice."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private createFallbackMealPlan(preferences: any) {
    return {
      meals: [
        {
          name: "Healthy Breakfast Bowl",
          type: "breakfast" as const,
          calories: 350,
          ingredients: ["oats", "berries", "yogurt", "nuts"],
          instructions: ["Mix oats with yogurt", "Add berries and nuts"],
          prepTime: 5,
          nutrition: { protein: 15, carbs: 45, fat: 12, fiber: 8 }
        }
      ],
      totalCalories: 350,
      analysis: "Meal plan generation unavailable. This is a sample healthy meal."
    };
  }

  private createFallbackRecipes(query: string) {
    return [
      {
        id: "sample-recipe",
        name: "Healthy " + query,
        description: "A nutritious and delicious recipe",
        ingredients: ["fresh ingredients", "herbs", "spices"],
        instructions: ["Prepare ingredients", "Cook according to preference"],
        prepTime: 15,
        cookTime: 20,
        servings: 2,
        difficulty: "easy" as const,
        calories: 300,
        nutrition: { protein: 20, carbs: 30, fat: 10, fiber: 5 },
        tags: ["healthy", "quick"]
      }
    ];
  }

  // Health check method
  async isApiWorking(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("Hello, respond with 'API Working'");
      const response = await result.response;
      return response.text().includes('API Working');
    } catch (error) {
      console.error('Gemini API health check failed:', error);
      return false;
    }
  }
}

export const geminiService = new GeminiService();