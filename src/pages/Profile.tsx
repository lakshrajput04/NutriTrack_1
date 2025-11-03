import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Target, Activity, Heart, Save, Calculator } from 'lucide-react';
import { UserProfile, CalorieCalculationService, UserDataService } from '@/utils/calorieCalculation';
import { toast } from 'sonner';

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: `user_${Date.now()}`,
    name: '',
    email: '',
    age: 25,
    gender: 'other',
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    goal: 'maintain_weight',
    targetWeight: 70,
    weeklyGoal: 0.5,
    dietaryRestrictions: [],
    allergies: [],
    preferences: {
      cuisineTypes: [],
      avoidedIngredients: [],
      mealPrepTime: 30
    },
    dailyCalorieGoal: 2000,
    macroTargets: {
      protein: 125,
      carbs: 250,
      fat: 67
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load existing profile if available
    const savedProfile = UserDataService.loadProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    } else {
      setIsEditing(true); // Show edit mode for new users
    }
  }, []);

  const handleSave = () => {
    // Calculate updated goals based on profile
    const updatedProfile = CalorieCalculationService.updateProfileWithGoals(profile);
    setProfile(updatedProfile);
    
    // Save to local storage
    UserDataService.saveProfile(updatedProfile);
    
    setIsEditing(false);
    toast.success('Profile saved successfully!');
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const calculateBMI = () => {
    const heightInM = profile.height / 100;
    return (profile.weight / (heightInM * heightInM)).toFixed(1);
  };

  const getIdealWeightRange = () => {
    return CalorieCalculationService.calculateIdealWeightRange(profile.height);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-warning' };
    if (bmi < 25) return { category: 'Normal', color: 'text-success' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-warning' };
    return { category: 'Obese', color: 'text-destructive' };
  };

  const waterIntake = CalorieCalculationService.calculateWaterIntake(profile);
  const bmi = parseFloat(calculateBMI());
  const bmiInfo = getBMICategory(bmi);
  const idealWeight = getIdealWeightRange();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Your Profile</h1>
          <p className="text-lg text-muted-foreground">
            Personalize your nutrition journey with custom goals and preferences
          </p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profile.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profile.height}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profile.weight}
                      onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Health & Fitness Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Primary Goal</Label>
                    <Select
                      value={profile.goal}
                      onValueChange={(value) => handleInputChange('goal', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose_weight">Lose Weight</SelectItem>
                        <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                        <SelectItem value="gain_weight">Gain Weight</SelectItem>
                        <SelectItem value="build_muscle">Build Muscle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity">Activity Level</Label>
                    <Select
                      value={profile.activityLevel}
                      onValueChange={(value) => handleInputChange('activityLevel', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                        <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                        <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (2x/day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(profile.goal === 'lose_weight' || profile.goal === 'gain_weight') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                        <Input
                          id="targetWeight"
                          type="number"
                          value={profile.targetWeight || ''}
                          onChange={(e) => handleInputChange('targetWeight', parseInt(e.target.value))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weeklyGoal">Weekly Goal (kg/week)</Label>
                        <Input
                          id="weeklyGoal"
                          type="number"
                          step="0.1"
                          value={profile.weeklyGoal || ''}
                          onChange={(e) => handleInputChange('weeklyGoal', parseFloat(e.target.value))}
                          disabled={!isEditing}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Calculated Goals Display */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3">Calculated Daily Targets</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{profile.dailyCalorieGoal}</p>
                      <p className="text-sm text-muted-foreground">Calories</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">{profile.macroTargets.protein.toFixed(0)}g</p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">{profile.macroTargets.carbs.toFixed(0)}g</p>
                      <p className="text-sm text-muted-foreground">Carbs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">{profile.macroTargets.fat.toFixed(0)}g</p>
                      <p className="text-sm text-muted-foreground">Fat</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Dietary Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Dietary Restrictions</Label>
                  <div className="flex flex-wrap gap-2">
                    {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo'].map((diet) => (
                      <Badge
                        key={diet}
                        variant={profile.dietaryRestrictions.includes(diet) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (!isEditing) return;
                          const current = profile.dietaryRestrictions;
                          const updated = current.includes(diet)
                            ? current.filter(d => d !== diet)
                            : [...current, diet];
                          handleInputChange('dietaryRestrictions', updated);
                        }}
                      >
                        {diet}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <div className="flex flex-wrap gap-2">
                    {['nuts', 'shellfish', 'eggs', 'dairy', 'soy', 'fish'].map((allergy) => (
                      <Badge
                        key={allergy}
                        variant={profile.allergies.includes(allergy) ? "destructive" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (!isEditing) return;
                          const current = profile.allergies;
                          const updated = current.includes(allergy)
                            ? current.filter(a => a !== allergy)
                            : [...current, allergy];
                          handleInputChange('allergies', updated);
                        }}
                      >
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mealPrepTime">Max Meal Prep Time (minutes)</Label>
                  <Input
                    id="mealPrepTime"
                    type="number"
                    value={profile.preferences.mealPrepTime}
                    onChange={(e) => handleInputChange('preferences', {
                      ...profile.preferences,
                      mealPrepTime: parseInt(e.target.value)
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Health Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{bmi}</p>
                    <p className={`text-lg font-semibold ${bmiInfo.color}`}>{bmiInfo.category}</p>
                    <p className="text-sm text-muted-foreground">BMI</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ideal Weight Range:</span>
                      <span className="font-medium">{idealWeight.min} - {idealWeight.max} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Water Goal:</span>
                      <span className="font-medium">{waterIntake.toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BMR:</span>
                      <span className="font-medium">{CalorieCalculationService.calculateBMR(profile).toFixed(0)} cal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TDEE:</span>
                      <span className="font-medium">{CalorieCalculationService.calculateTDEE(profile).toFixed(0)} cal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Weekly Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm">Exercise</h4>
                    <p className="text-sm text-muted-foreground">
                      {profile.goal === 'lose_weight' && '150 min cardio + 2-3 strength sessions'}
                      {profile.goal === 'build_muscle' && '3-4 strength sessions + light cardio'}
                      {profile.goal === 'maintain_weight' && '150 min moderate exercise + strength'}
                      {profile.goal === 'gain_weight' && '3 strength sessions + minimal cardio'}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm">Nutrition Focus</h4>
                    <p className="text-sm text-muted-foreground">
                      {profile.goal === 'lose_weight' && 'High protein, moderate carbs, healthy fats'}
                      {profile.goal === 'build_muscle' && 'High protein, adequate carbs for energy'}
                      {profile.goal === 'maintain_weight' && 'Balanced macros, whole foods'}
                      {profile.goal === 'gain_weight' && 'Calorie surplus with quality nutrients'}
                    </p>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm">Hydration</h4>
                    <p className="text-sm text-muted-foreground">
                      Aim for {waterIntake.toFixed(1)}L daily, more on active days
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save/Edit Button */}
        <div className="flex justify-center mt-8">
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="lg">
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
              {UserDataService.loadProfile() && (
                <Button variant="outline" onClick={() => setIsEditing(false)} size="lg">
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="lg">
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;