import { useState } from "react";
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
import { Plus, Coffee, UtensilsCrossed, Moon, Apple } from "lucide-react";
import { toast } from "sonner";

interface Meal {
  id: number;
  type: string;
  food: string;
  calories: number;
}

const Tracker = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealType, setMealType] = useState("");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");

  const calorieGoal = 2000;
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const progressPercentage = Math.min((totalCalories / calorieGoal) * 100, 100);

  const suggestedFoods = [
    { name: "Grilled Chicken Salad", calories: 350, icon: Apple },
    { name: "Quinoa Bowl", calories: 420, icon: UtensilsCrossed },
    { name: "Greek Yogurt Parfait", calories: 180, icon: Coffee },
    { name: "Salmon with Vegetables", calories: 480, icon: UtensilsCrossed },
  ];

  const handleAddMeal = () => {
    if (!mealType || !foodName || !calories) {
      toast.error("Please fill in all fields");
      return;
    }

    const newMeal: Meal = {
      id: Date.now(),
      type: mealType,
      food: foodName,
      calories: parseInt(calories),
    };

    setMeals([...meals, newMeal]);
    setMealType("");
    setFoodName("");
    setCalories("");
    toast.success("Meal logged successfully!");
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
                    <p className="text-2xl font-bold text-primary">32g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-secondary">45g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold text-warning">18g</p>
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
