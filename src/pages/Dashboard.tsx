import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Target, TrendingUp, Calendar, LogOut, Activity as ActivityIcon, Weight, Ruler } from "lucide-react";
import { getUser, logout } from "@/services/auth";
import { getWeeklyMeals, calculateWeeklyStats, calculateDailyTotals } from "@/services/mealService";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [macroData, setMacroData] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
    } else {
      setUserProfile(user);
      loadDashboardData(user._id);
    }
  }, [navigate]);

  const loadDashboardData = async (userId: string) => {
    try {
      setLoading(true);
      const meals = await getWeeklyMeals(userId);
      
      // Calculate weekly stats
      const stats = calculateWeeklyStats(meals);
      setWeeklyStats(stats);
      
      // Generate weekly calorie data
      const last7Days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayMeals = meals.filter(meal => {
          const mealDate = new Date(meal.date);
          return mealDate >= date && mealDate < nextDay;
        });
        
        const dailyCalories = dayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        
        last7Days.push({
          day: dayNames[date.getDay()],
          calories: dailyCalories,
          date: date.toLocaleDateString()
        });
      }
      
      setWeeklyData(last7Days);
      
      // Calculate total macros for the week
      const totals = calculateDailyTotals(meals);
      setMacroData([
        { name: "Protein", value: Math.round(totals.protein), fill: "hsl(142 76% 36%)" },
        { name: "Carbs", value: Math.round(totals.carbs), fill: "hsl(210 100% 50%)" },
        { name: "Fats", value: Math.round(totals.fats), fill: "hsl(38 92% 50%)" },
      ]);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set empty data on error
      setWeeklyData([
        { day: "Mon", calories: 0 },
        { day: "Tue", calories: 0 },
        { day: "Wed", calories: 0 },
        { day: "Thu", calories: 0 },
        { day: "Fri", calories: 0 },
        { day: "Sat", calories: 0 },
        { day: "Sun", calories: 0 },
      ]);
      setMacroData([
        { name: "Protein", value: 0, fill: "hsl(142 76% 36%)" },
        { name: "Carbs", value: 0, fill: "hsl(210 100% 50%)" },
        { name: "Fats", value: 0, fill: "hsl(38 92% 50%)" },
      ]);
      setWeeklyStats({ totalMeals: 0, avgDailyCalories: 0, daysLogged: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!userProfile || loading) {
    return null;
  }

  const getActivityLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      sedentary: "Sedentary",
      lightly_active: "Lightly Active",
      moderately_active: "Moderately Active",
      very_active: "Very Active",
      extra_active: "Extra Active"
    };
    return labels[level] || level;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold text-foreground">{userProfile.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground text-sm">{userProfile.email}</p>
                </div>
              </div>

              {userProfile.age && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold text-foreground">{userProfile.age} years</p>
                  </div>
                </div>
              )}

              {userProfile.weight && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                    <Weight className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-semibold text-foreground">{userProfile.weight} kg</p>
                  </div>
                </div>
              )}

              {userProfile.height && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                    <Ruler className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="font-semibold text-foreground">{userProfile.height} cm</p>
                  </div>
                </div>
              )}

              {userProfile.activityLevel && (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                    <ActivityIcon className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Activity</p>
                    <p className="font-semibold text-foreground text-sm">{getActivityLevelLabel(userProfile.activityLevel)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Goal</p>
                  <p className="font-semibold text-foreground">
                    {userProfile.dailyCalorieGoal || 2000} cal
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Weekly Calorie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Calorie Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Macronutrient Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Macronutrient Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={macroData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Progress Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Progress Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Average Daily Calories</p>
                <p className="text-2xl font-bold text-primary">
                  {weeklyStats ? weeklyStats.avgDailyCalories.toLocaleString() : '0'}
                </p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Days Logged</p>
                <p className="text-2xl font-bold text-success">
                  {weeklyStats ? `${weeklyStats.daysLogged}/7` : '0/7'}
                </p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Total Meals Logged</p>
                <p className="text-2xl font-bold text-secondary">
                  {weeklyStats ? weeklyStats.totalMeals : '0'}
                </p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
