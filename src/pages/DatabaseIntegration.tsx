import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Database, Users, MessageCircle, UtensilsCrossed, Server, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface DatabaseStats {
  users: number;
  meals: number;
  chats: number;
  collections: string[];
  database: string;
  timestamp: string;
}

const DatabaseIntegration = () => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderately_active',
    goals: '',
    dailyCalorieGoal: ''
  });

  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    checkServerStatus();
    loadStats();
    loadUsers();
  }, []);

  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      setServerStatus(data.mongodb === 'Connected' ? 'connected' : 'disconnected');
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const seedData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/seed`, { method: 'POST' });
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Sample data seeded successfully!');
        loadStats();
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to seed data');
      }
    } catch (error) {
      toast.error('Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in name and email');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...newUser,
        age: newUser.age ? parseInt(newUser.age) : undefined,
        weight: newUser.weight ? parseFloat(newUser.weight) : undefined,
        height: newUser.height ? parseFloat(newUser.height) : undefined,
        goals: newUser.goals ? newUser.goals.split(',').map(g => g.trim()) : [],
        dailyCalorieGoal: newUser.dailyCalorieGoal ? parseInt(newUser.dailyCalorieGoal) : 2000
      };

      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`User created: ${result.name}`);
        setNewUser({
          name: '', email: '', age: '', weight: '', height: '',
          activityLevel: 'moderately_active', goals: '', dailyCalorieGoal: ''
        });
        loadStats();
        loadUsers();
      } else {
        toast.error(result.error || 'Failed to create user');
      }
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const addSampleMeal = async (userId: string) => {
    setLoading(true);
    try {
      const mealData = {
        userId,
        foods: [
          {
            name: 'Grilled Chicken Breast',
            calories: 300,
            protein: 25,
            carbs: 0,
            fat: 15,
            fiber: 0,
            sugar: 0,
            quantity: '150g'
          },
          {
            name: 'Brown Rice',
            calories: 220,
            protein: 5,
            carbs: 45,
            fat: 2,
            fiber: 4,
            sugar: 1,
            quantity: '100g'
          }
        ],
        totalCalories: 520,
        mealType: 'lunch',
        analysis: 'Balanced meal with good protein content'
      };

      const response = await fetch(`${API_BASE}/api/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData)
      });

      if (response.ok) {
        toast.success('Meal log added successfully!');
        loadStats();
      } else {
        toast.error('Failed to add meal log');
      }
    } catch (error) {
      toast.error('Failed to add meal log');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Server className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🍃 MongoDB Database Integration</h1>
          <p className="text-lg text-muted-foreground">
            Live connection to MongoDB Atlas with real-time data operations
          </p>
        </div>

        {/* Server Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <p className="font-medium">
                    Backend Server: {serverStatus === 'connected' ? 'Connected' : 'Disconnected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    MongoDB Atlas: {serverStatus === 'connected' ? '✅ Active' : '❌ Not Connected'}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor()}>
                {serverStatus.toUpperCase()}
              </Badge>
            </div>
            
            {serverStatus === 'disconnected' && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  Backend server is not running. Please start the server with: <code>node backend/server.js</code>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Database Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.users || 0}</div>
              <p className="text-xs text-muted-foreground">registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meal Logs</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.meals || 0}</div>
              <p className="text-xs text-muted-foreground">food entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats?.chats || 0}</div>
              <p className="text-xs text-muted-foreground">ai conversations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <Database className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.collections?.length || 0}</div>
              <p className="text-xs text-muted-foreground">database tables</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Operations */}
        <Tabs defaultValue="operations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="operations">Data Operations</TabsTrigger>
            <TabsTrigger value="create">Create User</TabsTrigger>
            <TabsTrigger value="users">View Users</TabsTrigger>
          </TabsList>

          <TabsContent value="operations">
            <Card>
              <CardHeader>
                <CardTitle>Database Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={seedData} 
                    disabled={loading || serverStatus !== 'connected'}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Database className="h-6 w-6" />
                    <span>Seed Sample Data</span>
                    <span className="text-xs opacity-75">Add 3 users + meals + chats</span>
                  </Button>

                  <Button 
                    onClick={() => {loadStats(); loadUsers();}} 
                    disabled={loading || serverStatus !== 'connected'}
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span>Refresh Data</span>
                    <span className="text-xs opacity-75">Reload stats and users</span>
                  </Button>
                </div>

                {stats && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Database Info:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Database: <code>nutritrack</code></div>
                      <div>Last Updated: {new Date(stats.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Collections:</p>
                      <div className="flex gap-1 mt-1">
                        {stats.collections.map(collection => (
                          <Badge key={collection} variant="outline" className="text-xs">
                            {collection}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newUser.age}
                      onChange={(e) => setNewUser({...newUser, age: e.target.value})}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={newUser.weight}
                      onChange={(e) => setNewUser({...newUser, weight: e.target.value})}
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={newUser.height}
                      onChange={(e) => setNewUser({...newUser, height: e.target.value})}
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity">Activity Level</Label>
                    <Select value={newUser.activityLevel} onValueChange={(value) => setNewUser({...newUser, activityLevel: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                        <SelectItem value="extra_active">Extra Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goals">Goals (comma separated)</Label>
                    <Input
                      id="goals"
                      value={newUser.goals}
                      onChange={(e) => setNewUser({...newUser, goals: e.target.value})}
                      placeholder="weight_loss, muscle_gain"
                    />
                  </div>
                  <div>
                    <Label htmlFor="calories">Daily Calorie Goal</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={newUser.dailyCalorieGoal}
                      onChange={(e) => setNewUser({...newUser, dailyCalorieGoal: e.target.value})}
                      placeholder="2000"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={createUser} 
                  disabled={loading || serverStatus !== 'connected'}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create User in MongoDB
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users in Database ({users.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found. Create some users or seed sample data first.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">{user.activityLevel}</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addSampleMeal(user._id)}
                              disabled={loading}
                            >
                              Add Sample Meal
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div>Email: {user.email}</div>
                          <div>Age: {user.age || 'N/A'}</div>
                          <div>Weight: {user.weight || 'N/A'}kg</div>
                          <div>Height: {user.height || 'N/A'}cm</div>
                        </div>
                        {user.goals && user.goals.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">Goals: </span>
                            {user.goals.map((goal: string, index: number) => (
                              <Badge key={index} variant="secondary" className="mr-1 text-xs">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DatabaseIntegration;