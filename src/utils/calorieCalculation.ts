export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle';
  targetWeight?: number; // kg
  weeklyGoal?: number; // kg per week
  dietaryRestrictions: string[];
  allergies: string[];
  preferences: {
    cuisineTypes: string[];
    avoidedIngredients: string[];
    mealPrepTime: number; // minutes
  };
  dailyCalorieGoal: number;
  macroTargets: {
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
  };
  createdAt: string;
  updatedAt: string;
}

export class CalorieCalculationService {
  // Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
  static calculateBMR(profile: UserProfile): number {
    const { weight, height, age, gender } = profile;
    
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  // Calculate Total Daily Energy Expenditure (TDEE)
  static calculateTDEE(profile: UserProfile): number {
    const bmr = this.calculateBMR(profile);
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    return bmr * activityMultipliers[profile.activityLevel];
  }

  // Calculate daily calorie goal based on user's goal
  static calculateDailyCalorieGoal(profile: UserProfile): number {
    const tdee = this.calculateTDEE(profile);
    const weeklyGoal = profile.weeklyGoal || 0.5; // default 0.5kg per week
    
    switch (profile.goal) {
      case 'lose_weight':
        // 1kg fat = 7700 calories, so weekly deficit needed
        const weeklyDeficit = weeklyGoal * 7700;
        const dailyDeficit = weeklyDeficit / 7;
        return Math.max(tdee - dailyDeficit, 1200); // Minimum 1200 calories
      
      case 'gain_weight':
        const weeklysurplus = weeklyGoal * 7700;
        const dailySurplus = weeklysurplus / 7;
        return tdee + dailySurplus;
      
      case 'build_muscle':
        return tdee + 300; // Slight surplus for muscle building
      
      case 'maintain_weight':
      default:
        return tdee;
    }
  }

  // Calculate macro targets based on goals
  static calculateMacroTargets(profile: UserProfile, dailyCalories: number) {
    let proteinRatio: number;
    let fatRatio: number;
    let carbRatio: number;

    switch (profile.goal) {
      case 'lose_weight':
        proteinRatio = 0.30; // Higher protein for satiety and muscle preservation
        fatRatio = 0.25;
        carbRatio = 0.45;
        break;
      
      case 'build_muscle':
        proteinRatio = 0.30; // High protein for muscle building
        fatRatio = 0.25;
        carbRatio = 0.45;
        break;
      
      case 'gain_weight':
        proteinRatio = 0.20;
        fatRatio = 0.30;
        carbRatio = 0.50;
        break;
      
      default: // maintain_weight
        proteinRatio = 0.25;
        fatRatio = 0.25;
        carbRatio = 0.50;
    }

    return {
      protein: (dailyCalories * proteinRatio) / 4, // 4 calories per gram
      carbs: (dailyCalories * carbRatio) / 4, // 4 calories per gram
      fat: (dailyCalories * fatRatio) / 9, // 9 calories per gram
    };
  }

  // Update user profile with calculated goals
  static updateProfileWithGoals(profile: UserProfile): UserProfile {
    const dailyCalorieGoal = this.calculateDailyCalorieGoal(profile);
    const macroTargets = this.calculateMacroTargets(profile, dailyCalorieGoal);

    return {
      ...profile,
      dailyCalorieGoal,
      macroTargets,
      updatedAt: new Date().toISOString(),
    };
  }

  // Calculate recommended water intake (in liters)
  static calculateWaterIntake(profile: UserProfile): number {
    const baseIntake = profile.weight * 0.035; // 35ml per kg body weight
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      active: 1.3,
      very_active: 1.4,
    };
    
    return baseIntake * activityMultipliers[profile.activityLevel];
  }

  // Calculate ideal weight range based on BMI
  static calculateIdealWeightRange(height: number): { min: number; max: number } {
    const heightInMeters = height / 100;
    const minWeight = 18.5 * heightInMeters * heightInMeters;
    const maxWeight = 24.9 * heightInMeters * heightInMeters;
    
    return {
      min: Math.round(minWeight * 10) / 10,
      max: Math.round(maxWeight * 10) / 10,
    };
  }
}

// Local storage service for user data
export class UserDataService {
  private static readonly STORAGE_KEY = 'nutritrack_user_profile';

  static saveProfile(profile: UserProfile): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
  }

  static loadProfile(): UserProfile | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  static clearProfile(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.loadProfile();
    if (!current) return null;

    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    const profileWithGoals = CalorieCalculationService.updateProfileWithGoals(updated);
    
    this.saveProfile(profileWithGoals);
    return profileWithGoals;
  }
}