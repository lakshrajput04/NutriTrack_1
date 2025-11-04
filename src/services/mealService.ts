export interface MealFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  quantity: string;
}

export interface MealLog {
  _id: string;
  userId: string;
  foods: MealFood[];
  totalCalories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  imageUrl?: string;
  analysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealLogDTO {
  userId: string;
  foods: MealFood[];
  totalCalories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date?: string;
  imageUrl?: string;
  analysis?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export async function saveMealLog(mealData: CreateMealLogDTO): Promise<MealLog> {
  const res = await fetch(`${BACKEND_URL}/api/meals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mealData),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to save meal' }));
    throw new Error(error.error || `Failed to save meal (${res.status})`);
  }

  return res.json();
}

export async function getMealLogs(userId: string): Promise<MealLog[]> {
  const res = await fetch(`${BACKEND_URL}/api/meals/${userId}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch meals' }));
    throw new Error(error.error || `Failed to fetch meals (${res.status})`);
  }

  return res.json();
}

export async function getMealLogsForDateRange(
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<MealLog[]> {
  const allMeals = await getMealLogs(userId);
  
  return allMeals.filter(meal => {
    const mealDate = new Date(meal.date);
    return mealDate >= startDate && mealDate <= endDate;
  });
}

export async function getTodayMeals(userId: string): Promise<MealLog[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getMealLogsForDateRange(userId, today, tomorrow);
}

export async function getWeeklyMeals(userId: string): Promise<MealLog[]> {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return getMealLogsForDateRange(userId, weekAgo, today);
}

export function calculateDailyTotals(meals: MealLog[]) {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.totalCalories,
      protein: totals.protein + meal.foods.reduce((sum, food) => sum + food.protein, 0),
      carbs: totals.carbs + meal.foods.reduce((sum, food) => sum + food.carbs, 0),
      fats: totals.fats + meal.foods.reduce((sum, food) => sum + food.fat, 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

export function calculateWeeklyStats(meals: MealLog[]) {
  const dayMap = new Map<string, number>();
  
  meals.forEach(meal => {
    const dateKey = new Date(meal.date).toLocaleDateString();
    dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + meal.totalCalories);
  });
  
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const avgCalories = dayMap.size > 0 ? Math.round(totalCalories / dayMap.size) : 0;
  
  return {
    totalMeals: meals.length,
    avgDailyCalories: avgCalories,
    totalCalories,
    daysLogged: dayMap.size,
  };
}
