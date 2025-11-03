// Food Analysis Service using FREE APIs and local food database
export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  confidence: number;
}

export interface MealAnalysis {
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;
}

class FoodAnalysisService {
  private foodDatabase: FoodDatabase;
  private imageAnalyzer: MockImageAnalyzer;

  constructor() {
    this.foodDatabase = new FoodDatabase();
    this.imageAnalyzer = new MockImageAnalyzer();
  }

  // Analyze image and detect food items
  async analyzeImage(imageFile: File): Promise<MealAnalysis> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      // Step 1: Upload image to Spoonacular for food detection
      const response = await fetch(`${this.baseUrl}/food/images/analyze`, {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
        },
        body: formData,
      });

      const data = await response.json();
      
      // Step 2: Get detailed nutrition for detected foods
      const foods: FoodItem[] = await Promise.all(
        data.category.probability.map(async (item: any) => {
          const nutrition = await this.getNutritionData(item.className);
          return {
            id: Math.random(),
            name: item.className,
            calories: nutrition.calories || 0,
            protein: nutrition.protein || 0,
            carbs: nutrition.carbs || 0,
            fat: nutrition.fat || 0,
            fiber: nutrition.fiber || 0,
            sugar: nutrition.sugar || 0,
            confidence: item.probability,
          };
        })
      );

      return {
        foods,
        totalCalories: foods.reduce((sum, food) => sum + food.calories, 0),
        totalProtein: foods.reduce((sum, food) => sum + food.protein, 0),
        totalCarbs: foods.reduce((sum, food) => sum + food.carbs, 0),
        totalFat: foods.reduce((sum, food) => sum + food.fat, 0),
        mealType: this.determineMealType(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Food analysis failed:', error);
      throw new Error('Failed to analyze meal. Please try again.');
    }
  }

  // Get nutrition data for a specific food item
  private async getNutritionData(foodName: string) {
    const response = await fetch(
      `${this.baseUrl}/food/ingredients/search?query=${encodeURIComponent(foodName)}&number=1&apiKey=${this.apiKey}`
    );
    const data = await response.json();
    
    if (data.results.length > 0) {
      const ingredientId = data.results[0].id;
      const nutritionResponse = await fetch(
        `${this.baseUrl}/food/ingredients/${ingredientId}/information?amount=100&unit=grams&apiKey=${this.apiKey}`
      );
      return await nutritionResponse.json();
    }
    
    return {};
  }

  // Determine meal type based on current time
  private determineMealType(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snack';
  }

  // Search recipes based on detected ingredients
  async getRecipeSuggestions(ingredients: string[]): Promise<any[]> {
    const ingredientList = ingredients.join(',');
    const response = await fetch(
      `${this.baseUrl}/recipes/findByIngredients?ingredients=${ingredientList}&number=5&apiKey=${this.apiKey}`
    );
    return await response.json();
  }
}

export default FoodAnalysisService;