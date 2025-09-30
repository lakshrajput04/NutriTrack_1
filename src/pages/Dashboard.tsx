import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Target, TrendingUp, Calendar } from "lucide-react";
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
  const weeklyData = [
    { day: "Mon", calories: 1850 },
    { day: "Tue", calories: 2100 },
    { day: "Wed", calories: 1920 },
    { day: "Thu", calories: 2050 },
    { day: "Fri", calories: 1780 },
    { day: "Sat", calories: 2200 },
    { day: "Sun", calories: 1950 },
  ];

  const macroData = [
    { name: "Protein", value: 120, fill: "hsl(142 76% 36%)" },
    { name: "Carbs", value: 250, fill: "hsl(210 100% 50%)" },
    { name: "Fats", value: 70, fill: "hsl(38 92% 50%)" },
  ];

  const userProfile = {
    name: "John Doe",
    age: 28,
    gender: "Male",
    goal: "Maintain Weight",
    targetCalories: 2000,
    currentStreak: 7,
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-4xl font-bold text-foreground">Dashboard</h1>

        {/* Profile Section */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold text-foreground">{userProfile.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <Target className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goal</p>
                  <p className="font-semibold text-foreground">{userProfile.goal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="font-semibold text-foreground">
                    {userProfile.targetCalories} cal/day
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <Calendar className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="font-semibold text-foreground">
                    {userProfile.currentStreak} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <p className="text-2xl font-bold text-primary">1,978</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Days on Track</p>
                <p className="text-2xl font-bold text-success">6/7</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm text-muted-foreground">Total Meals Logged</p>
                <p className="text-2xl font-bold text-secondary">21</p>
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
