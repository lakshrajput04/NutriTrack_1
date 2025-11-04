import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Target, TrendingUp, Calendar, LogOut, Activity as ActivityIcon, Weight, Ruler, Footprints, Flame } from "lucide-react";
import { getUser, logout } from "@/services/auth";
import { getWeeklyMeals, calculateWeeklyStats, calculateDailyTotals } from "@/services/mealService";
import { googleFitService, StepHistory } from "@/services/googleFitService";
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
  const [stepHistory, setStepHistory] = useState<StepHistory | null>(null);
  const [loadingSteps, setLoadingSteps] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
    } else {
      setUserProfile(user);
      loadDashboardData(user._id);
      
      // Check if Google Fit was just connected
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('google_fit_connected') === 'true') {
        toast.success('Google Fit connected successfully!');
        loadStepData(user._id);
        // Clean URL
        window.history.replaceState({}, '', '/dashboard');
      } else if (user.fitDataEnabled) {
        loadStepData(user._id);
      }
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

  const loadStepData = async (userId: string) => {
    setLoadingSteps(true);
    try {
      const data = await googleFitService.getStepHistory(userId);
      setStepHistory(data);
    } catch (error: any) {
      console.error('Failed to load step data:', error);
      if (error.message && !error.message.includes('not connected')) {
        toast.error('Failed to load step data');
      }
    } finally {
      setLoadingSteps(false);
    }
  };

  const handleConnectGoogleFit = () => {
    googleFitService.connectGoogleFit();
  };

  const handleDisconnectGoogleFit = async () => {
    if (!userProfile?._id) return;
    
    try {
      await googleFitService.disconnectGoogleFit(userProfile._id);
      setStepHistory(null);
      toast.success('Google Fit disconnected');
      
      // Update user profile
      const user = getUser();
      if (user) {
        user.fitDataEnabled = false;
        user.googleAccessToken = undefined;
        setUserProfile(user);
      }
    } catch (error) {
      toast.error('Failed to disconnect Google Fit');
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

        {/* Google Fit Integration Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Footprints className="h-6 w-6 text-green-600" />
                Google Fit Integration
              </CardTitle>
              {userProfile?.fitDataEnabled ? (
                <Button variant="outline" onClick={handleDisconnectGoogleFit}>
                  Disconnect
                </Button>
              ) : (
                <Button onClick={handleConnectGoogleFit} className="bg-green-600 hover:bg-green-700">
                  Connect Google Fit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingSteps && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading step data...</p>
              </div>
            )}

            {stepHistory && !loadingSteps && (
              <div>
                {/* Step Stats Summary */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <div className="rounded-lg border bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Footprints className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-muted-foreground">Total Steps (7 days)</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {stepHistory.totalSteps.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-green-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-muted-foreground">Daily Average</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {stepHistory.averageSteps.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-purple-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ActivityIcon className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-muted-foreground">Today's Steps</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {stepHistory.data[stepHistory.data.length - 1]?.steps.toLocaleString() || 0}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-orange-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-muted-foreground">Calories Burned</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {stepHistory.caloriesBurned.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Daily Step Breakdown */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground mb-3">Daily Step Count</h3>
                  {stepHistory.data.map((day) => {
                    const distance = googleFitService.calculateDistance(day.steps);
                    return (
                      <div 
                        key={day.date} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {distance.kilometers} km • {googleFitService.calculateCalories(day.steps)} cal
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            {day.steps.toLocaleString()}
                          </span>
                          <p className="text-xs text-muted-foreground">steps</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!userProfile?.fitDataEnabled && !loadingSteps && (
              <div className="text-center py-8">
                <Footprints className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Connect your Google account to automatically track your daily steps and activity levels.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your step data will help us provide more accurate calorie recommendations.
                </p>
              </div>
            )}
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
