import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Users, Search, ShoppingCart, ChefHat, Bookmark } from 'lucide-react';
import { Recipe, MealPlan, FreeRecipePlannerService } from '@/services/freeRecipePlanner';
import { UserDataService } from '@/utils/calorieCalculation';
import { toast } from 'sonner';

const RecipePlanner = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPlans, setSavedPlans] = useState<Record<string, MealPlan>>({});
  
  const plannerService = new FreeRecipePlannerService();

  useEffect(() => {
    loadInitialRecipes();
    loadSavedMealPlans();
  }, []);

  const loadInitialRecipes = async () => {
    try {
      const initialRecipes = await plannerService.searchRecipes('', {});
      setRecipes(initialRecipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    }
  };

  const loadSavedMealPlans = () => {
    const saved = plannerService.getSavedMealPlans();
    setSavedPlans(saved);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInitialRecipes();
      return;
    }

    try {
      const searchResults = await plannerService.searchRecipes(searchQuery, {});
      setRecipes(searchResults);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    }
  };

  const generateMealPlan = async () => {
    const userProfile = UserDataService.loadProfile();
    if (!userProfile) {
      toast.error('Please set up your profile first!');
      return;
    }

    setIsGenerating(true);
    try {
      const newMealPlan = await plannerService.generateMealPlan(userProfile, 7);
      setMealPlan(newMealPlan);
      toast.success('Meal plan generated successfully!');
    } catch (error) {
      toast.error('Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveMealPlan = () => {
    if (!mealPlan) return;

    plannerService.saveMealPlan(mealPlan);
    loadSavedMealPlans();
    toast.success('Meal plan saved!');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const formatMealPlanDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRecipe(recipe)}>
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img 
          src={recipe.image} 
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop';
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            {recipe.readyInMinutes} min
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-1">{recipe.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.summary}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
          </span>
          <span className={`font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <p className="font-bold text-primary">{recipe.nutrition.calories}</p>
            <p className="text-muted-foreground">cal</p>
          </div>
          <div>
            <p className="font-bold text-secondary">{recipe.nutrition.protein.toFixed(0)}g</p>
            <p className="text-muted-foreground">protein</p>
          </div>
          <div>
            <p className="font-bold text-accent">{recipe.nutrition.carbs.toFixed(0)}g</p>
            <p className="text-muted-foreground">carbs</p>
          </div>
          <div>
            <p className="font-bold text-warning">{recipe.nutrition.fat.toFixed(0)}g</p>
            <p className="text-muted-foreground">fat</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {recipe.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Recipe Planner</h1>
          <p className="text-lg text-muted-foreground">
            Discover healthy recipes and create personalized meal plans
          </p>
        </div>

        <Tabs defaultValue="recipes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipes">Browse Recipes</TabsTrigger>
            <TabsTrigger value="meal-plan">Generate Meal Plan</TabsTrigger>
            <TabsTrigger value="saved">Saved Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search recipes by name, ingredient, or cuisine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {recipes.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recipes found. Try a different search term.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="meal-plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Generate Weekly Meal Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Create a personalized 7-day meal plan based on your goals and preferences
                  </p>
                  <Button onClick={generateMealPlan} disabled={isGenerating} size="lg">
                    {isGenerating ? 'Generating...' : 'Generate Meal Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Meal Plan */}
            {mealPlan && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your 7-Day Meal Plan</CardTitle>
                    <Button onClick={saveMealPlan} variant="outline">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Save Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Plan Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{Math.round(mealPlan.totalCalories / 7)}</p>
                        <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-secondary">{mealPlan.days.length}</p>
                        <p className="text-sm text-muted-foreground">Days</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-accent">{mealPlan.shoppingList.length}</p>
                        <p className="text-sm text-muted-foreground">Ingredients</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-warning">
                          {mealPlan.days.reduce((sum, day) => 
                            sum + Object.values(day.meals).flat().filter(Boolean).length, 0
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Meals</p>
                      </div>
                    </div>

                    {/* Daily Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {mealPlan.days.map((day, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{formatMealPlanDate(day.date)}</CardTitle>
                            <p className="text-sm text-muted-foreground">{day.totalCalories} calories</p>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {day.meals.breakfast && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Breakfast:</span>
                                <span className="text-sm text-muted-foreground">{day.meals.breakfast.title}</span>
                              </div>
                            )}
                            {day.meals.lunch && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Lunch:</span>
                                <span className="text-sm text-muted-foreground">{day.meals.lunch.title}</span>
                              </div>
                            )}
                            {day.meals.dinner && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Dinner:</span>
                                <span className="text-sm text-muted-foreground">{day.meals.dinner.title}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Shopping List */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Shopping List
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(
                            mealPlan.shoppingList.reduce((acc, item) => {
                              if (!acc[item.aisle]) acc[item.aisle] = [];
                              acc[item.aisle].push(item);
                              return acc;
                            }, {} as Record<string, typeof mealPlan.shoppingList>)
                          ).map(([aisle, items]) => (
                            <div key={aisle}>
                              <h4 className="font-semibold mb-2">{aisle}</h4>
                              <ul className="space-y-1">
                                {items.map((item) => (
                                  <li key={item.id} className="text-sm text-muted-foreground">
                                    {item.amount} {item.unit} {item.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {Object.keys(savedPlans).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No saved meal plans yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generate a meal plan and save it to see it here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(savedPlans).map((plan) => (
                  <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {plan.days.length}-Day Meal Plan
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                          <p className="font-bold text-primary">{Math.round(plan.totalCalories / plan.days.length)}</p>
                          <p className="text-muted-foreground">Avg Daily Cal</p>
                        </div>
                        <div>
                          <p className="font-bold text-secondary">{plan.shoppingList.length}</p>
                          <p className="text-muted-foreground">Ingredients</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => setMealPlan(plan)}
                      >
                        View Plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Recipe Detail Modal */}
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedRecipe.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <img 
                    src={selectedRecipe.image} 
                    alt={selectedRecipe.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{selectedRecipe.readyInMinutes} min</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{selectedRecipe.servings} servings</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <ChefHat className="h-4 w-4" />
                      <span className={`text-sm ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                        {selectedRecipe.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <p className="font-bold text-primary">{selectedRecipe.nutrition.calories}</p>
                      <p className="text-muted-foreground">calories</p>
                    </div>
                    <div>
                      <p className="font-bold text-secondary">{selectedRecipe.nutrition.protein.toFixed(0)}g</p>
                      <p className="text-muted-foreground">protein</p>
                    </div>
                    <div>
                      <p className="font-bold text-accent">{selectedRecipe.nutrition.carbs.toFixed(0)}g</p>
                      <p className="text-muted-foreground">carbs</p>
                    </div>
                    <div>
                      <p className="font-bold text-warning">{selectedRecipe.nutrition.fat.toFixed(0)}g</p>
                      <p className="text-muted-foreground">fat</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Ingredients</h3>
                    <ul className="space-y-1">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {ingredient.original}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <ol className="space-y-2">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{instruction.number}. </span>
                          {instruction.step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {selectedRecipe.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RecipePlanner;