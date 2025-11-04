import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Coffee, UtensilsCrossed, Moon, Apple, Search, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { loadRecipes, searchRecipes, Recipe } from "@/services/recipeService";
import { saveMealLog, getTodayMeals } from "@/services/mealService";
import { getUser } from "@/services/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Meal {
  id: number;
  type: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const Tracker = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealType, setMealType] = useState("");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Recipe browser state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(true);

  const calorieGoal = userProfile?.dailyCalorieGoal || 2000;
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);
  const progressPercentage = Math.min((totalCalories / calorieGoal) * 100, 100);

  // Check authentication and load user
  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
    } else {
      setUserProfile(user);
      loadTodayMeals(user._id);
    }
  }, [navigate]);

  // Load today's meals
  const loadTodayMeals = async (userId: string) => {
    try {
      setLoadingMeals(true);
      const todayMeals = await getTodayMeals(userId);
      
      // Convert backend meal logs to Meal format
      const convertedMeals = todayMeals.map(mealLog => ({
        id: Date.now() + Math.random(),
        type: mealLog.mealType,
        food: mealLog.foods.map(f => f.name).join(', '),
        calories: mealLog.totalCalories,
        protein: mealLog.foods.reduce((sum, f) => sum + f.protein, 0),
        carbs: mealLog.foods.reduce((sum, f) => sum + f.carbs, 0),
        fats: mealLog.foods.reduce((sum, f) => sum + f.fat, 0),
      }));
      
      setMeals(convertedMeals);
    } catch (error) {
      console.error('Failed to load meals:', error);
    } finally {
      setLoadingMeals(false);
    }
  };

  // Load recipes on mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoadingRecipes(true);
        const data = await loadRecipes();
        setRecipes(data);
        setFilteredRecipes(data);
      } catch (error) {
        console.error('Failed to load recipes:', error);
        toast.error('Failed to load recipes');
      } finally {
        setLoadingRecipes(false);
      }
    };
    
    fetchRecipes();
  }, []);

  // Filter recipes based on search
  useEffect(() => {
    const results = searchRecipes(recipes, recipeSearch);
    setFilteredRecipes(results);
  }, [recipeSearch, recipes]);

  const suggestedFoods = [
    { name: "Grilled Chicken Salad", calories: 350, icon: Apple },
    { name: "Quinoa Bowl", calories: 420, icon: UtensilsCrossed },
    { name: "Greek Yogurt Parfait", calories: 180, icon: Coffee },
    { name: "Salmon with Vegetables", calories: 480, icon: UtensilsCrossed },
  ];

  const handleAddMeal = async () => {
    if (!mealType || !foodName || !calories) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!userProfile) {
      toast.error("Please login to log meals");
      navigate("/login");
      return;
    }

    try {
      const calorieValue = parseInt(calories);
      
      // Save to backend
      await saveMealLog({
        userId: userProfile._id,
        foods: [{
          name: foodName,
          calories: calorieValue,
          protein: 0,
          carbs: 0,
          fat: 0,
          quantity: "1 serving"
        }],
        totalCalories: calorieValue,
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        date: new Date().toISOString()
      });

      // Update local state
      const newMeal: Meal = {
        id: Date.now(),
        type: mealType,
        food: foodName,
        calories: calorieValue,
        protein: 0,
        carbs: 0,
        fats: 0,
      };

      setMeals([...meals, newMeal]);
      setMealType("");
      setFoodName("");
      setCalories("");
      toast.success("Meal logged successfully!");
    } catch (error) {
      console.error('Failed to save meal:', error);
      toast.error("Failed to save meal. Please try again.");
    }
  };

  const handleAddRecipe = async (recipe: Recipe) => {
    if (!mealType) {
      toast.error("Please select a meal type first");
      return;
    }

    if (!userProfile) {
      toast.error("Please login to log meals");
      navigate("/login");
      return;
    }

    try {
      const calorieValue = Math.round(recipe.calories);
      const proteinValue = Math.round(recipe.protein);
      const carbsValue = Math.round(recipe.carbs);
      const fatsValue = Math.round(recipe.fats);
      
      // Save to backend
      await saveMealLog({
        userId: userProfile._id,
        foods: [{
          name: recipe.name,
          calories: calorieValue,
          protein: proteinValue,
          carbs: carbsValue,
          fat: fatsValue,
          fiber: Math.round(recipe.fibre || 0),
          sugar: Math.round(recipe.freeSugar || 0),
          quantity: "1 serving"
        }],
        totalCalories: calorieValue,
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        date: new Date().toISOString()
      });

      // Update local state
      const newMeal: Meal = {
        id: Date.now(),
        type: mealType,
        food: recipe.name,
        calories: calorieValue,
        protein: proteinValue,
        carbs: carbsValue,
        fats: fatsValue,
      };

      setMeals([...meals, newMeal]);
      toast.success(`Added ${recipe.name} to ${mealType}!`);
    } catch (error) {
      console.error('Failed to save recipe:', error);
      toast.error("Failed to save recipe. Please try again.");
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return <Coffee className="h-5 w-5" />;
      case "lunch":
        return <UtensilsCrossed className="h-5 w-5" />;
      case "dinner":
        return <Moon className="h-5 w-5" />;
      default:
        return <Apple className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-4xl font-bold text-foreground">Calorie Tracker</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Meal Logging Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Your Meal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meal-type">Meal Type</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger id="meal-type">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="recipes">Browse Recipes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manual" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="food-name">Food Name</Label>
                      <Input
                        id="food-name"
                        placeholder="e.g., Grilled Chicken Salad"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        placeholder="e.g., 350"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                      />
                    </div>

                    <Button onClick={handleAddMeal} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Meal
                    </Button>
                  </TabsContent>

                  <TabsContent value="recipes" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipe-search">Search Indian Recipes</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="recipe-search"
                          placeholder="Search for dishes..."
                          value={recipeSearch}
                          onChange={(e) => setRecipeSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-2">
                      {loadingRecipes ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Loading recipes...
                        </div>
                      ) : filteredRecipes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No recipes found. Try a different search.
                        </div>
                      ) : (
                        filteredRecipes.slice(0, 50).map((recipe, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                                <ChefHat className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">
                                  {recipe.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {Math.round(recipe.calories)} cal | P: {Math.round(recipe.protein)}g | C: {Math.round(recipe.carbs)}g | F: {Math.round(recipe.fats)}g
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddRecipe(recipe)}
                              disabled={!mealType}
                              className="ml-2 flex-shrink-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                    {filteredRecipes.length > 50 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Showing first 50 results. Refine your search to see more.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Meal List */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No meals logged yet. Start tracking your nutrition!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {getMealIcon(meal.type)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground capitalize">
                              {meal.type}
                            </p>
                            <p className="text-sm text-muted-foreground">{meal.food}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{meal.calories}</p>
                          <p className="text-xs text-muted-foreground">calories</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Summary */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {totalCalories} / {calorieGoal} cal
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round(totalProtein)}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-secondary">{Math.round(totalCarbs)}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-warning">{Math.round(totalFats)}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    {totalCalories < calorieGoal
                      ? `You have ${calorieGoal - totalCalories} calories remaining for today.`
                      : "You've reached your daily calorie goal!"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Food Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Suggested Foods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedFoods.map((food, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <food.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.calories} calories
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
