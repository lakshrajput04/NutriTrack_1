import { UserProfile } from '../utils/calorieCalculation';

export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  instructions: Instruction[];
  extendedIngredients: Ingredient[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  diets: string[];
  dishTypes: string[];
  cuisines: string[];
  occasions: string[];
  spoonacularScore: number;
  healthScore: number;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
  image: string;
  aisle: string;
  consistency: string;
}

export interface Instruction {
  number: number;
  step: string;
  ingredients: { id: number; name: string }[];
  equipment: { id: number; name: string }[];
}

export interface MealPlan {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  days: MealPlanDay[];
  totalCalories: number;
  totalCost: number;
  shoppingList: ShoppingListItem[];
  createdAt: string;
}

export interface MealPlanDay {
  date: string;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    snacks?: Recipe[];
  };
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  aisle: string;
  image: string;
  cost?: number;
  isChecked: boolean;
  recipeIds: number[];
}

export class RecipePlannerService {
  private apiKey: string;
  private baseUrl = 'https://api.spoonacular.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Generate meal plan based on user profile and preferences
  async generateMealPlan(
    userProfile: UserProfile,
    days: number = 7,
    preferences: {
      excludeIngredients?: string[];
      includeIngredients?: string[];
      diet?: string;
      intolerances?: string[];
      maxReadyTime?: number;
      budget?: number;
    } = {}
  ): Promise<MealPlan> {
    const params = new URLSearchParams({
      timeFrame: 'week',
      targetCalories: userProfile.dailyCalorieGoal.toString(),
      diet: preferences.diet || this.inferDietFromProfile(userProfile),
      exclude: [...userProfile.allergies, ...(preferences.excludeIngredients || [])].join(','),
      apiKey: this.apiKey,
    });

    if (preferences.intolerances?.length) {
      params.append('intolerances', preferences.intolerances.join(','));
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/mealplanner/generate?${params.toString()}`
      );
      const data = await response.json();

      // Convert API response to our MealPlan format
      const mealPlan = await this.processMealPlanData(data, userProfile, days);
      return mealPlan;
    } catch (error) {
      console.error('Meal plan generation failed:', error);
      throw new Error('Failed to generate meal plan. Please try again.');
    }
  }

  // Search recipes based on criteria
  async searchRecipes(
    query: string,
    filters: {
      diet?: string;
      intolerances?: string[];
      maxReadyTime?: number;
      minProtein?: number;
      maxCalories?: number;
      cuisine?: string;
      type?: string;
      number?: number;
    } = {}
  ): Promise<Recipe[]> {
    const params = new URLSearchParams({
      query,
      number: (filters.number || 12).toString(),
      addRecipeInformation: 'true',
      addRecipeNutrition: 'true',
      fillIngredients: 'true',
      apiKey: this.apiKey,
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && key !== 'number') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/recipes/complexSearch?${params.toString()}`
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Recipe search failed:', error);
      return [];
    }
  }

  // Get recipe recommendations based on user's recent meals and preferences
  async getRecommendations(
    userProfile: UserProfile,
    recentMeals: string[] = [],
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'
  ): Promise<Recipe[]> {
    // Calculate target calories for this meal
    const mealCalorieTargets = {
      breakfast: userProfile.dailyCalorieGoal * 0.25,
      lunch: userProfile.dailyCalorieGoal * 0.35,
      dinner: userProfile.dailyCalorieGoal * 0.35,
      snack: userProfile.dailyCalorieGoal * 0.05,
    };

    const targetCalories = mealCalorieTargets[mealType];

    const filters = {
      diet: this.inferDietFromProfile(userProfile),
      intolerances: userProfile.allergies,
      maxCalories: Math.round(targetCalories * 1.2), // 20% buffer
      minProtein: Math.round(userProfile.macroTargets.protein / 4), // Distribute protein across meals
      type: mealType === 'snack' ? undefined : mealType,
      number: 8,
    };

    // Use AI to suggest meal types based on time and preferences
    const searchQuery = this.generateSmartSearchQuery(userProfile, mealType, recentMeals);
    
    return this.searchRecipes(searchQuery, filters);
  }

  // Generate shopping list from meal plan
  generateShoppingList(mealPlan: MealPlan): ShoppingListItem[] {
    const ingredientMap = new Map<string, ShoppingListItem>();

    mealPlan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (Array.isArray(meal)) {
          // Handle snacks array
          meal.forEach(snack => this.addIngredientsToMap(snack, ingredientMap));
        } else if (meal) {
          // Handle single meal
          this.addIngredientsToMap(meal, ingredientMap);
        }
      });
    });

    return Array.from(ingredientMap.values()).sort((a, b) => a.aisle.localeCompare(b.aisle));
  }

  // Get recipe details including nutrition and instructions
  async getRecipeDetails(recipeId: number): Promise<Recipe> {
    const response = await fetch(
      `${this.baseUrl}/recipes/${recipeId}/information?includeNutrition=true&apiKey=${this.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipe details');
    }
    
    return await response.json();
  }

  // Get similar recipes
  async getSimilarRecipes(recipeId: number, number: number = 6): Promise<Recipe[]> {
    const response = await fetch(
      `${this.baseUrl}/recipes/${recipeId}/similar?number=${number}&apiKey=${this.apiKey}`
    );
    
    const similarIds = await response.json();
    const recipes = await Promise.all(
      similarIds.map((similar: any) => this.getRecipeDetails(similar.id))
    );
    
    return recipes;
  }

  // Save meal plan to local storage
  saveMealPlan(mealPlan: MealPlan): void {
    const saved = this.getSavedMealPlans();
    saved[mealPlan.id] = mealPlan;
    localStorage.setItem('nutritrack_meal_plans', JSON.stringify(saved));
  }

  // Load saved meal plans
  getSavedMealPlans(): Record<string, MealPlan> {
    const saved = localStorage.getItem('nutritrack_meal_plans');
    return saved ? JSON.parse(saved) : {};
  }

  // Private helper methods
  private inferDietFromProfile(profile: UserProfile): string {
    // Infer diet type from dietary restrictions and preferences
    if (profile.dietaryRestrictions.includes('vegetarian')) return 'vegetarian';
    if (profile.dietaryRestrictions.includes('vegan')) return 'vegan';
    if (profile.dietaryRestrictions.includes('ketogenic')) return 'ketogenic';
    if (profile.dietaryRestrictions.includes('paleo')) return 'paleo';
    if (profile.goal === 'lose_weight') return 'whole30'; // High protein, low carb
    return ''; // No specific diet
  }

  private generateSmartSearchQuery(
    profile: UserProfile,
    mealType: string,
    recentMeals: string[]
  ): string {
    const baseQueries = {
      breakfast: ['oatmeal', 'eggs', 'smoothie', 'yogurt', 'toast'],
      lunch: ['salad', 'soup', 'sandwich', 'bowl', 'wrap'],
      dinner: ['chicken', 'fish', 'pasta', 'rice', 'vegetables'],
      snack: ['nuts', 'fruit', 'protein', 'healthy', 'low calorie'],
    };

    const queries = baseQueries[mealType as keyof typeof baseQueries] || baseQueries.lunch;
    
    // Avoid recently eaten meals
    const availableQueries = queries.filter(query => 
      !recentMeals.some(recent => recent.toLowerCase().includes(query))
    );

    // Add goal-specific modifiers
    let modifiers: string[] = [];
    if (profile.goal === 'lose_weight') {
      modifiers = ['healthy', 'low calorie', 'high protein'];
    } else if (profile.goal === 'build_muscle') {
      modifiers = ['high protein', 'post workout'];
    }

    const selectedQuery = availableQueries[Math.floor(Math.random() * availableQueries.length)];
    const selectedModifier = modifiers[Math.floor(Math.random() * modifiers.length)];

    return selectedModifier ? `${selectedModifier} ${selectedQuery}` : selectedQuery;
  }

  private async processMealPlanData(
    apiData: any,
    userProfile: UserProfile,
    days: number
  ): Promise<MealPlan> {
    const mealPlanDays: MealPlanDay[] = [];
    let totalCalories = 0;

    // Process each day from API response
    for (let i = 0; i < days; i++) {
      const dayData = apiData.week[Object.keys(apiData.week)[i]];
      if (!dayData) continue;

      const dayMeals: any = {};
      let dayCalories = 0;
      let dayMacros = { protein: 0, carbs: 0, fat: 0 };

      // Process meals for each day
      for (const [mealType, mealData] of Object.entries(dayData.meals)) {
        if (Array.isArray(mealData)) {
          // Handle multiple items (like snacks)
          dayMeals[mealType] = await Promise.all(
            mealData.map(async (item: any) => {
              const recipe = await this.getRecipeDetails(item.id);
              dayCalories += recipe.nutrition.calories;
              dayMacros.protein += recipe.nutrition.protein;
              dayMacros.carbs += recipe.nutrition.carbs;
              dayMacros.fat += recipe.nutrition.fat;
              return recipe;
            })
          );
        } else if (mealData) {
          // Handle single meal
          const recipe = await this.getRecipeDetails(mealData.id);
          dayMeals[mealType] = recipe;
          dayCalories += recipe.nutrition.calories;
          dayMacros.protein += recipe.nutrition.protein;
          dayMacros.carbs += recipe.nutrition.carbs;
          dayMacros.fat += recipe.nutrition.fat;
        }
      }

      mealPlanDays.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        meals: dayMeals,
        totalCalories: dayCalories,
        macros: dayMacros,
      });

      totalCalories += dayCalories;
    }

    const mealPlan: MealPlan = {
      id: `plan_${Date.now()}`,
      userId: userProfile.id,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      days: mealPlanDays,
      totalCalories,
      totalCost: 0, // Would need cost API integration
      shoppingList: [],
      createdAt: new Date().toISOString(),
    };

    mealPlan.shoppingList = this.generateShoppingList(mealPlan);
    return mealPlan;
  }

  private addIngredientsToMap(recipe: Recipe, ingredientMap: Map<string, ShoppingListItem>): void {
    recipe.extendedIngredients?.forEach(ingredient => {
      const key = ingredient.name.toLowerCase();
      
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.amount += ingredient.amount;
        existing.recipeIds.push(recipe.id);
      } else {
        ingredientMap.set(key, {
          id: `ingredient_${ingredient.id}`,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          aisle: ingredient.aisle || 'Other',
          image: ingredient.image || '',
          isChecked: false,
          recipeIds: [recipe.id],
        });
      }
    });
  }
}

export default RecipePlannerService;