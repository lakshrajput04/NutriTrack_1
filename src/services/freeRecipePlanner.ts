import { UserProfile } from '../utils/calorieCalculation';
import { geminiService } from './geminiService';

export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  instructions: Instruction[];
  ingredients: Ingredient[];
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
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
  aisle: string;
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
  isChecked: boolean;
  recipeIds: number[];
}

// Free recipe database (no API required)
const FREE_RECIPE_DATABASE: Recipe[] = [
  // Breakfast Recipes
  {
    id: 1,
    title: "Protein-Packed Scrambled Eggs",
    image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=300",
    readyInMinutes: 10,
    servings: 1,
    summary: "High-protein breakfast with vegetables for a nutritious start to your day.",
    instructions: [
      { number: 1, step: "Heat oil in a non-stick pan over medium heat", ingredients: [], equipment: [] },
      { number: 2, step: "Whisk eggs with salt and pepper in a bowl", ingredients: [], equipment: [] },
      { number: 3, step: "Add spinach to pan and cook until wilted", ingredients: [], equipment: [] },
      { number: 4, step: "Pour in eggs and gently scramble until set", ingredients: [], equipment: [] }
    ],
    ingredients: [
      { id: 1, name: "eggs", amount: 3, unit: "large", original: "3 large eggs", aisle: "Dairy" },
      { id: 2, name: "spinach", amount: 1, unit: "cup", original: "1 cup fresh spinach", aisle: "Produce" },
      { id: 3, name: "olive oil", amount: 1, unit: "tsp", original: "1 tsp olive oil", aisle: "Oils" }
    ],
    nutrition: { calories: 280, protein: 20, carbs: 4, fat: 20, fiber: 2 },
    diets: ["vegetarian", "low-carb", "keto"],
    dishTypes: ["breakfast"],
    cuisines: ["american"],
    difficulty: "easy",
    tags: ["high-protein", "quick", "healthy"]
  },
  {
    id: 2,
    title: "Overnight Oats with Berries",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300",
    readyInMinutes: 5,
    servings: 1,
    summary: "Make-ahead breakfast rich in fiber and antioxidants.",
    instructions: [
      { number: 1, step: "Mix oats, milk, and chia seeds in a jar", ingredients: [], equipment: [] },
      { number: 2, step: "Add honey and vanilla extract", ingredients: [], equipment: [] },
      { number: 3, step: "Top with berries and refrigerate overnight", ingredients: [], equipment: [] },
      { number: 4, step: "Enjoy cold or heat briefly in microwave", ingredients: [], equipment: [] }
    ],
    ingredients: [
      { id: 4, name: "oats", amount: 0.5, unit: "cup", original: "1/2 cup rolled oats", aisle: "Cereal" },
      { id: 5, name: "milk", amount: 0.5, unit: "cup", original: "1/2 cup milk", aisle: "Dairy" },
      { id: 6, name: "berries", amount: 0.5, unit: "cup", original: "1/2 cup mixed berries", aisle: "Produce" },
      { id: 7, name: "honey", amount: 1, unit: "tbsp", original: "1 tbsp honey", aisle: "Baking" }
    ],
    nutrition: { calories: 320, protein: 12, carbs: 58, fat: 6, fiber: 8 },
    diets: ["vegetarian"],
    dishTypes: ["breakfast"],
    cuisines: ["american"],
    difficulty: "easy",
    tags: ["make-ahead", "fiber-rich", "antioxidants"]
  },

  // Lunch Recipes
  {
    id: 3,
    title: "Grilled Chicken Salad Bowl",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300",
    readyInMinutes: 20,
    servings: 1,
    summary: "Lean protein with fresh vegetables for a balanced, satisfying meal.",
    instructions: [
      { number: 1, step: "Season chicken breast with herbs and spices", ingredients: [], equipment: [] },
      { number: 2, step: "Grill chicken for 6-7 minutes per side", ingredients: [], equipment: [] },
      { number: 3, step: "Let chicken rest, then slice", ingredients: [], equipment: [] },
      { number: 4, step: "Arrange salad greens and vegetables in bowl", ingredients: [], equipment: [] },
      { number: 5, step: "Top with sliced chicken and dressing", ingredients: [], equipment: [] }
    ],
    ingredients: [
      { id: 8, name: "chicken breast", amount: 120, unit: "g", original: "120g chicken breast", aisle: "Meat" },
      { id: 9, name: "mixed greens", amount: 2, unit: "cups", original: "2 cups mixed greens", aisle: "Produce" },
      { id: 10, name: "cherry tomatoes", amount: 0.5, unit: "cup", original: "1/2 cup cherry tomatoes", aisle: "Produce" },
      { id: 11, name: "cucumber", amount: 0.5, unit: "cup", original: "1/2 cup diced cucumber", aisle: "Produce" }
    ],
    nutrition: { calories: 280, protein: 35, carbs: 8, fat: 12, fiber: 4 },
    diets: ["low-carb", "high-protein"],
    dishTypes: ["lunch", "salad"],
    cuisines: ["mediterranean"],
    difficulty: "medium",
    tags: ["lean-protein", "fresh", "balanced"]
  },

  // Dinner Recipes
  {
    id: 4,
    title: "Baked Salmon with Vegetables",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300",
    readyInMinutes: 25,
    servings: 1,
    summary: "Omega-3 rich salmon with roasted vegetables for a complete dinner.",
    instructions: [
      { number: 1, step: "Preheat oven to 400°F (200°C)", ingredients: [], equipment: [] },
      { number: 2, step: "Place salmon and vegetables on baking sheet", ingredients: [], equipment: [] },
      { number: 3, step: "Drizzle with olive oil and seasonings", ingredients: [], equipment: [] },
      { number: 4, step: "Bake for 18-20 minutes until salmon flakes easily", ingredients: [], equipment: [] }
    ],
    ingredients: [
      { id: 12, name: "salmon fillet", amount: 150, unit: "g", original: "150g salmon fillet", aisle: "Seafood" },
      { id: 13, name: "broccoli", amount: 1, unit: "cup", original: "1 cup broccoli florets", aisle: "Produce" },
      { id: 14, name: "sweet potato", amount: 1, unit: "medium", original: "1 medium sweet potato", aisle: "Produce" },
      { id: 15, name: "olive oil", amount: 1, unit: "tbsp", original: "1 tbsp olive oil", aisle: "Oils" }
    ],
    nutrition: { calories: 420, protein: 32, carbs: 28, fat: 22, fiber: 6 },
    diets: ["low-carb", "high-protein", "omega-3"],
    dishTypes: ["dinner", "main course"],
    cuisines: ["mediterranean"],
    difficulty: "easy",
    tags: ["omega-3", "one-pan", "nutritious"]
  },

  // More recipes...
  {
    id: 5,
    title: "Quinoa Buddha Bowl",
    image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=300",
    readyInMinutes: 30,
    servings: 1,
    summary: "Complete protein quinoa with colorful vegetables and tahini dressing.",
    instructions: [
      { number: 1, step: "Cook quinoa according to package directions", ingredients: [], equipment: [] },
      { number: 2, step: "Roast vegetables in oven at 400°F for 20 minutes", ingredients: [], equipment: [] },
      { number: 3, step: "Prepare tahini dressing by mixing all ingredients", ingredients: [], equipment: [] },
      { number: 4, step: "Assemble bowl with quinoa, vegetables, and dressing", ingredients: [], equipment: [] }
    ],
    ingredients: [
      { id: 16, name: "quinoa", amount: 0.5, unit: "cup", original: "1/2 cup quinoa", aisle: "Grains" },
      { id: 17, name: "chickpeas", amount: 0.5, unit: "cup", original: "1/2 cup chickpeas", aisle: "Canned Goods" },
      { id: 18, name: "bell pepper", amount: 1, unit: "medium", original: "1 medium bell pepper", aisle: "Produce" },
      { id: 19, name: "tahini", amount: 2, unit: "tbsp", original: "2 tbsp tahini", aisle: "Condiments" }
    ],
    nutrition: { calories: 380, protein: 15, carbs: 52, fat: 14, fiber: 10 },
    diets: ["vegetarian", "vegan", "gluten-free"],
    dishTypes: ["lunch", "dinner"],
    cuisines: ["mediterranean", "middle eastern"],
    difficulty: "medium",
    tags: ["plant-based", "complete-protein", "fiber-rich"]
  }
];

export class FreeRecipePlannerService {
  private recipes: Recipe[];

  constructor() {
    this.recipes = FREE_RECIPE_DATABASE;
  }

  // Generate meal plan based on user profile - enhanced with Gemini AI
  async generateMealPlan(
    userProfile: UserProfile,
    days: number = 7,
    preferences: {
      excludeIngredients?: string[];
      includeIngredients?: string[];
      diet?: string;
      maxReadyTime?: number;
    } = {}
  ): Promise<MealPlan> {
    // Try Gemini API for intelligent meal planning
    try {
      const mealPlanPreferences = {
        dietType: preferences.diet || 'balanced',
        calories: userProfile.dailyCalorieGoal,
        meals: 3,
        allergies: preferences.excludeIngredients || [],
        preferences: preferences.includeIngredients || []
      };

      const geminiMealPlan = await geminiService.generateMealPlan(mealPlanPreferences);
      
      if (geminiMealPlan && geminiMealPlan.meals.length > 0) {
        // Convert Gemini format to our MealPlan format
        const mealPlanDays: MealPlanDay[] = [];
        let totalCalories = 0;

        for (let day = 0; day < days; day++) {
          const dayMeals = {
            breakfast: undefined as Recipe | undefined,
            lunch: undefined as Recipe | undefined,
            dinner: undefined as Recipe | undefined,
            snacks: [] as Recipe[]
          };
          let dayCalories = 0;
          let dayProtein = 0;
          let dayCarbs = 0;
          let dayFat = 0;

          // Assign meals based on Gemini recommendations
          geminiMealPlan.meals.forEach((meal, index) => {
            const rotatedMeal = geminiMealPlan.meals[(index + day) % geminiMealPlan.meals.length];
            const recipe: Recipe = {
              id: day * 10 + index,
              title: rotatedMeal.name,
              image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80`,
              readyInMinutes: rotatedMeal.prepTime,
              servings: 1,
              summary: `Delicious ${rotatedMeal.name} with balanced nutrition`,
              instructions: rotatedMeal.instructions.map((step, stepIndex) => ({
                number: stepIndex + 1,
                step: step,
                ingredients: [],
                equipment: []
              })),
              ingredients: rotatedMeal.ingredients.map((ingredient, ingIndex) => ({
                id: ingIndex + 1,
                name: ingredient,
                amount: 1,
                unit: 'piece',
                original: ingredient,
                aisle: 'General'
              })),
              nutrition: {
                calories: rotatedMeal.calories,
                protein: rotatedMeal.nutrition.protein,
                carbs: rotatedMeal.nutrition.carbs,
                fat: rotatedMeal.nutrition.fat,
                fiber: rotatedMeal.nutrition.fiber
              },
              diets: [mealPlanPreferences.dietType],
              dishTypes: [rotatedMeal.type],
              cuisines: ['international'],
              tags: [rotatedMeal.type, 'healthy'],
              difficulty: 'easy'
            };

            // Assign to appropriate meal slot
            if (rotatedMeal.type === 'breakfast' && !dayMeals.breakfast) {
              dayMeals.breakfast = recipe;
            } else if (rotatedMeal.type === 'lunch' && !dayMeals.lunch) {
              dayMeals.lunch = recipe;
            } else if (rotatedMeal.type === 'dinner' && !dayMeals.dinner) {
              dayMeals.dinner = recipe;
            } else {
              dayMeals.snacks.push(recipe);
            }
            
            dayCalories += rotatedMeal.calories;
            dayProtein += rotatedMeal.nutrition.protein;
            dayCarbs += rotatedMeal.nutrition.carbs;
            dayFat += rotatedMeal.nutrition.fat;
          });

          mealPlanDays.push({
            date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            meals: dayMeals,
            totalCalories: dayCalories,
            macros: {
              protein: dayProtein,
              carbs: dayCarbs,
              fat: dayFat
            }
          });

          totalCalories += dayCalories;
        }

        return {
          id: Date.now().toString(),
          userId: userProfile.id || 'user',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          days: mealPlanDays,
          totalCalories: totalCalories,
          shoppingList: [], // Generate shopping list from recipes
          createdAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Gemini meal plan generation failed, using local algorithm');
    }

    // Fallback to local meal plan generation
    const filteredRecipes = this.filterRecipes(userProfile, preferences);
    const mealPlanDays: MealPlanDay[] = [];
    let totalCalories = 0;

    // Calculate target calories per meal
    const dailyTarget = userProfile.dailyCalorieGoal;
    const breakfastTarget = dailyTarget * 0.25;
    const lunchTarget = dailyTarget * 0.35;
    const dinnerTarget = dailyTarget * 0.35;
    const snackTarget = dailyTarget * 0.05;

    for (let i = 0; i < days; i++) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() + i);

      // Select recipes for each meal
      const breakfast = this.selectRecipeByType(filteredRecipes, ['breakfast'], breakfastTarget);
      const lunch = this.selectRecipeByType(filteredRecipes, ['lunch'], lunchTarget);
      const dinner = this.selectRecipeByType(filteredRecipes, ['dinner'], dinnerTarget);
      const snacks = [this.selectRecipeByType(filteredRecipes, ['snack'], snackTarget)].filter(Boolean);

      const dayCalories = (breakfast?.nutrition.calories || 0) + 
                         (lunch?.nutrition.calories || 0) + 
                         (dinner?.nutrition.calories || 0) + 
                         snacks.reduce((sum, snack) => sum + snack.nutrition.calories, 0);

      const dayMacros = {
        protein: (breakfast?.nutrition.protein || 0) + 
                (lunch?.nutrition.protein || 0) + 
                (dinner?.nutrition.protein || 0) + 
                snacks.reduce((sum, snack) => sum + snack.nutrition.protein, 0),
        carbs: (breakfast?.nutrition.carbs || 0) + 
               (lunch?.nutrition.carbs || 0) + 
               (dinner?.nutrition.carbs || 0) + 
               snacks.reduce((sum, snack) => sum + snack.nutrition.carbs, 0),
        fat: (breakfast?.nutrition.fat || 0) + 
             (lunch?.nutrition.fat || 0) + 
             (dinner?.nutrition.fat || 0) + 
             snacks.reduce((sum, snack) => sum + snack.nutrition.fat, 0)
      };

      mealPlanDays.push({
        date: dayDate.toISOString().split('T')[0],
        meals: {
          breakfast: breakfast || undefined,
          lunch: lunch || undefined,
          dinner: dinner || undefined,
          snacks: snacks.length > 0 ? snacks : undefined
        },
        totalCalories: dayCalories,
        macros: dayMacros
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
      shoppingList: [],
      createdAt: new Date().toISOString()
    };

    mealPlan.shoppingList = this.generateShoppingList(mealPlan);
    return mealPlan;
  }

  // Search recipes with filters - enhanced with Gemini API
  async searchRecipes(
    query: string,
    filters: {
      diet?: string;
      maxReadyTime?: number;
      dishType?: string;
      maxCalories?: number;
      minProtein?: number;
    } = {}
  ): Promise<Recipe[]> {
    // Try Gemini API for enhanced recipe recommendations
    try {
      const dietaryPreferences = filters.diet ? [filters.diet] : [];
      const geminiRecipes = await geminiService.generateRecipeRecommendations(query, dietaryPreferences);
      
      if (geminiRecipes && geminiRecipes.length > 0) {
        // Convert Gemini format to our Recipe format
        const convertedRecipes: Recipe[] = geminiRecipes.map(recipe => ({
          id: parseInt(recipe.id.replace(/\D/g, '')) || Math.floor(Math.random() * 10000),
          title: recipe.name,
          image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80`,
          readyInMinutes: recipe.prepTime + recipe.cookTime,
          servings: recipe.servings,
          summary: recipe.description,
          instructions: recipe.instructions.map((step, index) => ({
            number: index + 1,
            step: step,
            ingredients: [],
            equipment: []
          })),
          ingredients: recipe.ingredients.map((ingredient, index) => ({
            id: index + 1,
            name: ingredient,
            amount: 1,
            unit: 'piece',
            original: ingredient,
            aisle: 'General'
          })),
          nutrition: {
            calories: recipe.calories,
            protein: recipe.nutrition.protein,
            carbs: recipe.nutrition.carbs,
            fat: recipe.nutrition.fat,
            fiber: recipe.nutrition.fiber
          },
          diets: dietaryPreferences,
          dishTypes: [filters.dishType || 'main course'],
          cuisines: ['international'],
          tags: recipe.tags,
          difficulty: recipe.difficulty
        }));

        // Apply additional filters to Gemini results
        let filteredResults = convertedRecipes;
        
        if (filters.maxReadyTime) {
          filteredResults = filteredResults.filter(recipe => 
            recipe.readyInMinutes <= filters.maxReadyTime!
          );
        }

        if (filters.maxCalories) {
          filteredResults = filteredResults.filter(recipe => 
            recipe.nutrition.calories <= filters.maxCalories!
          );
        }

        if (filters.minProtein) {
          filteredResults = filteredResults.filter(recipe => 
            recipe.nutrition.protein >= filters.minProtein!
          );
        }

        return filteredResults;
      }
    } catch (error) {
      console.warn('Gemini recipe search failed, using local database');
    }

    // Fallback to local recipe search
    let results = this.recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(query.toLowerCase()) ||
      recipe.summary.toLowerCase().includes(query.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    // Apply filters
    if (filters.diet) {
      results = results.filter(recipe => 
        recipe.diets.includes(filters.diet!)
      );
    }

    if (filters.maxReadyTime) {
      results = results.filter(recipe => 
        recipe.readyInMinutes <= filters.maxReadyTime!
      );
    }

    if (filters.dishType) {
      results = results.filter(recipe => 
        recipe.dishTypes.includes(filters.dishType!)
      );
    }

    if (filters.maxCalories) {
      results = results.filter(recipe => 
        recipe.nutrition.calories <= filters.maxCalories!
      );
    }

    if (filters.minProtein) {
      results = results.filter(recipe => 
        recipe.nutrition.protein >= filters.minProtein!
      );
    }

    return results;
  }

  // Get recipe recommendations
  async getRecommendations(
    userProfile: UserProfile,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'
  ): Promise<Recipe[]> {
    const filtered = this.filterRecipes(userProfile, {});
    return filtered.filter(recipe => 
      recipe.dishTypes.includes(mealType)
    ).slice(0, 6);
  }

  // Generate shopping list from meal plan
  generateShoppingList(mealPlan: MealPlan): ShoppingListItem[] {
    const ingredientMap = new Map<string, ShoppingListItem>();

    mealPlan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (Array.isArray(meal)) {
          meal.forEach(recipe => this.addIngredientsToMap(recipe, ingredientMap));
        } else if (meal) {
          this.addIngredientsToMap(meal, ingredientMap);
        }
      });
    });

    return Array.from(ingredientMap.values()).sort((a, b) => a.aisle.localeCompare(b.aisle));
  }

  // Save and load meal plans locally
  saveMealPlan(mealPlan: MealPlan): void {
    const saved = this.getSavedMealPlans();
    saved[mealPlan.id] = mealPlan;
    localStorage.setItem('nutritrack_meal_plans', JSON.stringify(saved));
  }

  getSavedMealPlans(): Record<string, MealPlan> {
    const saved = localStorage.getItem('nutritrack_meal_plans');
    return saved ? JSON.parse(saved) : {};
  }

  // Private helper methods
  private filterRecipes(userProfile: UserProfile, preferences: any): Recipe[] {
    let filtered = [...this.recipes];

    // Filter by dietary restrictions
    if (userProfile.dietaryRestrictions.length > 0) {
      filtered = filtered.filter(recipe => 
        userProfile.dietaryRestrictions.every(restriction => 
          recipe.diets.includes(restriction)
        )
      );
    }

    // Filter by allergies
    if (userProfile.allergies.length > 0) {
      filtered = filtered.filter(recipe => 
        !recipe.ingredients.some(ingredient => 
          userProfile.allergies.some(allergy => 
            ingredient.name.toLowerCase().includes(allergy.toLowerCase())
          )
        )
      );
    }

    // Filter by preferences
    if (preferences.maxReadyTime) {
      filtered = filtered.filter(recipe => 
        recipe.readyInMinutes <= preferences.maxReadyTime
      );
    }

    if (preferences.excludeIngredients?.length > 0) {
      filtered = filtered.filter(recipe => 
        !recipe.ingredients.some(ingredient => 
          preferences.excludeIngredients.some((excluded: string) => 
            ingredient.name.toLowerCase().includes(excluded.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }

  private selectRecipeByType(recipes: Recipe[], types: string[], targetCalories: number): Recipe | null {
    const candidates = recipes.filter(recipe => 
      recipe.dishTypes.some(type => types.includes(type))
    );

    if (candidates.length === 0) return null;

    // Find recipe closest to target calories
    candidates.sort((a, b) => 
      Math.abs(a.nutrition.calories - targetCalories) - 
      Math.abs(b.nutrition.calories - targetCalories)
    );

    return candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
  }

  private addIngredientsToMap(recipe: Recipe, ingredientMap: Map<string, ShoppingListItem>): void {
    recipe.ingredients.forEach(ingredient => {
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
          aisle: ingredient.aisle,
          isChecked: false,
          recipeIds: [recipe.id]
        });
      }
    });
  }
}

export default FreeRecipePlannerService;