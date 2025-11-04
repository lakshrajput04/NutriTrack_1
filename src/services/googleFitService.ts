const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface StepData {
  date: string;
  steps: number;
  timestamp: string;
}

export interface StepHistory {
  userId: string;
  userName: string;
  period: {
    start: string;
    end: string;
  };
  data: StepData[];
  totalSteps: number;
  averageSteps: number;
  caloriesBurned: number;
}

export interface TodaySteps {
  date: string;
  steps: number;
  caloriesBurned: number;
  timestamp: string;
}

export const googleFitService = {
  /**
   * Initiate Google Fit OAuth connection
   * Opens Google OAuth popup/redirect
   */
  connectGoogleFit: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  /**
   * Get step count history for the last 7 days
   */
  getStepHistory: async (userId: string): Promise<StepHistory> => {
    const response = await fetch(`${API_URL}/api/fitness/steps/${userId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch step history' }));
      throw new Error(error.message || error.error);
    }
    
    return response.json();
  },

  /**
   * Get today's step count
   */
  getTodaySteps: async (userId: string): Promise<TodaySteps> => {
    const response = await fetch(`${API_URL}/api/fitness/steps/today/${userId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch today\'s steps' }));
      throw new Error(error.message || error.error);
    }
    
    return response.json();
  },

  /**
   * Disconnect Google Fit from user account
   */
  disconnectGoogleFit: async (userId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/fitness/disconnect/${userId}`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to disconnect Google Fit' }));
      throw new Error(error.message || error.error);
    }
  },

  /**
   * Check if user has Google Fit connected
   */
  isConnected: (user: any): boolean => {
    return user?.fitDataEnabled === true && !!user?.googleAccessToken;
  },

  /**
   * Calculate estimated calories burned from steps
   * Average: 0.04 calories per step
   */
  calculateCalories: (steps: number): number => {
    return Math.round(steps * 0.04);
  },

  /**
   * Calculate estimated distance from steps
   * Average: 0.762 meters per step (2.5 feet)
   */
  calculateDistance: (steps: number): { meters: number; kilometers: number; miles: number } => {
    const meters = steps * 0.762;
    return {
      meters: Math.round(meters),
      kilometers: Math.round((meters / 1000) * 10) / 10,
      miles: Math.round((meters / 1609.34) * 10) / 10
    };
  }
};
