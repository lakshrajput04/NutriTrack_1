import { User, MealLog, ChatMessage, MealPlan, ChallengeParticipation, IUser, IMealLog, IChatMessage, IMealPlan } from '../models';
import DatabaseService from './database';

export class MongoDBService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  // Initialize database connection
  async initialize(): Promise<void> {
    try {
      await this.dbService.connect();
      console.log('MongoDB service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MongoDB service:', error);
      throw error;
    }
  }

  // User Operations
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(userId, updateData, { new: true });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Meal Log Operations
  async saveMealLog(mealData: Partial<IMealLog>): Promise<IMealLog> {
    try {
      const mealLog = new MealLog(mealData);
      return await mealLog.save();
    } catch (error) {
      console.error('Error saving meal log:', error);
      throw error;
    }
  }

  async getUserMealLogs(userId: string, limit: number = 50): Promise<IMealLog[]> {
    try {
      return await MealLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error fetching meal logs:', error);
      throw error;
    }
  }

  async getMealLogsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<IMealLog[]> {
    try {
      return await MealLog.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });
    } catch (error) {
      console.error('Error fetching meal logs by date range:', error);
      throw error;
    }
  }

  // Chat Message Operations
  async saveChatMessage(messageData: Partial<IChatMessage>): Promise<IChatMessage> {
    try {
      const chatMessage = new ChatMessage(messageData);
      return await chatMessage.save();
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  async getUserChatHistory(userId: string, limit: number = 100): Promise<IChatMessage[]> {
    try {
      return await ChatMessage.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  // Meal Plan Operations
  async saveMealPlan(mealPlanData: Partial<IMealPlan>): Promise<IMealPlan> {
    try {
      const mealPlan = new MealPlan(mealPlanData);
      return await mealPlan.save();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  }

  async getUserMealPlans(userId: string): Promise<IMealPlan[]> {
    try {
      return await MealPlan.find({ userId, isActive: true })
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
  }

  async getMealPlanById(planId: string): Promise<IMealPlan | null> {
    try {
      return await MealPlan.findById(planId);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      throw error;
    }
  }

  // Challenge Operations
  async joinChallenge(userId: string, challengeId: string, username: string): Promise<any> {
    try {
      const participation = new ChallengeParticipation({
        userId,
        challengeId,
        username,
        progress: [],
        totalScore: 0,
        ranking: 0
      });
      return await participation.save();
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  async getChallengeParticipants(challengeId: string): Promise<any[]> {
    try {
      return await ChallengeParticipation.find({ challengeId, isActive: true })
        .sort({ totalScore: -1 });
    } catch (error) {
      console.error('Error fetching challenge participants:', error);
      throw error;
    }
  }

  async updateChallengeProgress(userId: string, challengeId: string, progressData: any): Promise<any> {
    try {
      return await ChallengeParticipation.findOneAndUpdate(
        { userId, challengeId },
        { $push: { progress: progressData } },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  }

  // Analytics Operations
  async getUserNutritionStats(userId: string, days: number = 7): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await MealLog.aggregate([
        {
          $match: {
            userId,
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            },
            totalCalories: { $sum: "$totalCalories" },
            totalProtein: { $sum: { $sum: "$foods.protein" } },
            totalCarbs: { $sum: { $sum: "$foods.carbs" } },
            totalFat: { $sum: { $sum: "$foods.fat" } },
            mealCount: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('Error fetching nutrition stats:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      return this.dbService.getConnectionStatus();
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const mongoService = new MongoDBService();