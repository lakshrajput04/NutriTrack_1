export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'nutrition' | 'exercise' | 'weight_loss' | 'hydration' | 'meditation' | 'custom';
  category: 'daily' | 'weekly' | 'monthly';
  duration: number; // in days
  startDate: string;
  endDate: string;
  goals: ChallengeGoal[];
  participants: ChallengeParticipant[];
  rewards: ChallengeReward[];
  rules: string[];
  isPublic: boolean;
  createdBy: string;
  maxParticipants?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  image?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface ChallengeGoal {
  id: string;
  type: 'calories' | 'steps' | 'water' | 'workouts' | 'weight' | 'custom';
  target: number;
  unit: string;
  description: string;
  isRequired: boolean;
}

export interface ChallengeParticipant {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: string;
  progress: ChallengeProgress[];
  totalScore: number;
  ranking: number;
  status: 'active' | 'completed' | 'dropped_out';
  achievements: string[];
}

export interface ChallengeProgress {
  date: string;
  goalId: string;
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  points: number;
}

export interface ChallengeReward {
  id: string;
  type: 'badge' | 'points' | 'discount' | 'feature_unlock';
  name: string;
  description: string;
  requirement: string;
  value?: number;
  icon?: string;
}

export interface Leaderboard {
  challengeId: string;
  participants: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  completedGoals: number;
  totalGoals: number;
  streak: number;
  badges: string[];
}

export interface UserStats {
  totalChallengesJoined: number;
  totalChallengesCompleted: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  achievements: Achievement[];
  favoriteChallengetype: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  reward?: ChallengeReward;
}

export class CommunityService {
  private baseUrl = 'your-backend-api-url';
  
  // Predefined popular challenges
  static readonly POPULAR_CHALLENGES: Omit<Challenge, 'id' | 'participants' | 'createdBy' | 'startDate' | 'endDate'>[] = [
    {
      title: "30-Day Hydration Challenge",
      description: "Drink your daily water goal every day for 30 days",
      type: "hydration",
      category: "monthly",
      duration: 30,
      goals: [
        {
          id: "hydration_goal",
          type: "water",
          target: 2.5,
          unit: "liters",
          description: "Drink at least 2.5L of water daily",
          isRequired: true
        }
      ],
      rewards: [
        {
          id: "hydration_badge",
          type: "badge",
          name: "Hydration Hero",
          description: "Completed 30-day hydration challenge",
          requirement: "Complete all 30 days"
        }
      ],
      rules: [
        "Log your water intake daily",
        "Plain water, herbal teas count",
        "Sodas and alcohol don't count",
        "Take progress photos optional"
      ],
      isPublic: true,
      difficulty: "beginner",
      tags: ["hydration", "health", "daily habit"],
      status: "upcoming"
    },
    {
      title: "7-Day Meal Prep Challenge",
      description: "Prepare healthy meals in advance for a full week",
      type: "nutrition",
      category: "weekly",
      duration: 7,
      goals: [
        {
          id: "meal_prep_goal",
          type: "custom",
          target: 7,
          unit: "days",
          description: "Prep meals for each day of the week",
          isRequired: true
        }
      ],
      rewards: [
        {
          id: "meal_prep_badge",
          type: "badge",
          name: "Prep Master",
          description: "Successfully meal prepped for a full week",
          requirement: "Complete 7 days of meal prep"
        }
      ],
      rules: [
        "Plan and prep at least 2 meals per day",
        "Share photos of your meal prep",
        "Include protein, vegetables, and complex carbs",
        "Budget tracking is optional but encouraged"
      ],
      isPublic: true,
      difficulty: "intermediate",
      tags: ["meal prep", "nutrition", "planning"],
      status: "upcoming"
    },
    {
      title: "10,000 Steps Daily",
      description: "Walk at least 10,000 steps every day for 21 days",
      type: "exercise",
      category: "daily",
      duration: 21,
      goals: [
        {
          id: "steps_goal",
          type: "steps",
          target: 10000,
          unit: "steps",
          description: "Walk 10,000 steps daily",
          isRequired: true
        }
      ],
      rewards: [
        {
          id: "walker_badge",
          type: "badge",
          name: "Step Master",
          description: "Walked 10,000 steps for 21 consecutive days",
          requirement: "Complete 21 days"
        }
      ],
      rules: [
        "Use any step tracking device/app",
        "Steps must be achieved in a single day",
        "Share your daily step count",
        "Encourage fellow participants"
      ],
      isPublic: true,
      difficulty: "intermediate",
      tags: ["walking", "cardio", "daily activity"],
      status: "upcoming"
    }
  ];

  // Create a new challenge
  async createChallenge(challenge: Omit<Challenge, 'id' | 'participants' | 'status'>): Promise<Challenge> {
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge_${Date.now()}`,
      participants: [],
      status: 'upcoming'
    };

    // Save to local storage for demo purposes
    const saved = this.getSavedChallenges();
    saved[newChallenge.id] = newChallenge;
    localStorage.setItem('nutritrack_challenges', JSON.stringify(saved));

    return newChallenge;
  }

  // Get available challenges
  async getAvailableChallenges(
    filters: {
      type?: string;
      difficulty?: string;
      status?: string;
      category?: string;
    } = {}
  ): Promise<Challenge[]> {
    const saved = this.getSavedChallenges();
    let challenges = Object.values(saved);

    // Add popular challenges if none exist
    if (challenges.length === 0) {
      challenges = await this.initializePopularChallenges();
    }

    // Apply filters
    if (filters.type) {
      challenges = challenges.filter(c => c.type === filters.type);
    }
    if (filters.difficulty) {
      challenges = challenges.filter(c => c.difficulty === filters.difficulty);
    }
    if (filters.status) {
      challenges = challenges.filter(c => c.status === filters.status);
    }
    if (filters.category) {
      challenges = challenges.filter(c => c.category === filters.category);
    }

    return challenges.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  // Join a challenge
  async joinChallenge(challengeId: string, userId: string, username: string): Promise<boolean> {
    const saved = this.getSavedChallenges();
    const challenge = saved[challengeId];
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
      throw new Error('Challenge is full');
    }

    if (challenge.participants.some(p => p.userId === userId)) {
      throw new Error('Already joined this challenge');
    }

    const newParticipant: ChallengeParticipant = {
      userId,
      username,
      joinedAt: new Date().toISOString(),
      progress: [],
      totalScore: 0,
      ranking: challenge.participants.length + 1,
      status: 'active',
      achievements: []
    };

    challenge.participants.push(newParticipant);
    saved[challengeId] = challenge;
    localStorage.setItem('nutritrack_challenges', JSON.stringify(saved));

    return true;
  }

  // Update progress for a challenge
  async updateProgress(
    challengeId: string,
    userId: string,
    goalId: string,
    value: number
  ): Promise<ChallengeProgress> {
    const saved = this.getSavedChallenges();
    const challenge = saved[challengeId];
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) {
      throw new Error('Not a participant of this challenge');
    }

    const goal = challenge.goals.find(g => g.id === goalId);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const today = new Date().toISOString().split('T')[0];
    const existingProgress = participant.progress.find(p => p.date === today && p.goalId === goalId);

    const isCompleted = value >= goal.target;
    const points = isCompleted ? this.calculatePoints(goal, challenge.difficulty) : 0;

    const progressUpdate: ChallengeProgress = {
      date: today,
      goalId,
      currentValue: value,
      targetValue: goal.target,
      isCompleted,
      points
    };

    if (existingProgress) {
      // Update existing progress
      const index = participant.progress.indexOf(existingProgress);
      participant.progress[index] = progressUpdate;
    } else {
      // Add new progress
      participant.progress.push(progressUpdate);
    }

    // Recalculate total score
    participant.totalScore = participant.progress.reduce((sum, p) => sum + p.points, 0);

    // Update rankings
    this.updateRankings(challenge);

    saved[challengeId] = challenge;
    localStorage.setItem('nutritrack_challenges', JSON.stringify(saved));

    return progressUpdate;
  }

  // Get leaderboard for a challenge
  async getLeaderboard(challengeId: string): Promise<Leaderboard> {
    const saved = this.getSavedChallenges();
    const challenge = saved[challengeId];
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const entries: LeaderboardEntry[] = challenge.participants
      .map(participant => {
        const completedGoals = participant.progress.filter(p => p.isCompleted).length;
        const totalGoals = challenge.goals.length * challenge.duration;
        const streak = this.calculateStreak(participant.progress);

        return {
          userId: participant.userId,
          username: participant.username,
          avatar: participant.avatar,
          score: participant.totalScore,
          rank: participant.ranking,
          completedGoals,
          totalGoals,
          streak,
          badges: participant.achievements
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return {
      challengeId,
      participants: entries,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get user's challenge statistics
  async getUserStats(userId: string): Promise<UserStats> {
    const saved = this.getSavedChallenges();
    const challenges = Object.values(saved);
    
    const userChallenges = challenges.filter(c => 
      c.participants.some(p => p.userId === userId)
    );

    const completedChallenges = userChallenges.filter(c => {
      const participant = c.participants.find(p => p.userId === userId);
      return participant?.status === 'completed';
    });

    const totalPoints = userChallenges.reduce((sum, challenge) => {
      const participant = challenge.participants.find(p => p.userId === userId);
      return sum + (participant?.totalScore || 0);
    }, 0);

    // Calculate type frequency
    const typeCount = userChallenges.reduce((acc, challenge) => {
      acc[challenge.type] = (acc[challenge.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteType = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'nutrition';

    return {
      totalChallengesJoined: userChallenges.length,
      totalChallengesCompleted: completedChallenges.length,
      totalPoints,
      currentStreak: 0, // Would need daily tracking
      longestStreak: 0, // Would need historical data
      badges: [], // Would be populated from completed challenges
      achievements: [], // Would be calculated based on progress
      favoriteChallengetype: favoriteType
    };
  }

  // Private helper methods
  private getSavedChallenges(): Record<string, Challenge> {
    const saved = localStorage.getItem('nutritrack_challenges');
    return saved ? JSON.parse(saved) : {};
  }

  private async initializePopularChallenges(): Promise<Challenge[]> {
    const challenges: Challenge[] = [];
    
    for (const template of CommunityService.POPULAR_CHALLENGES) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7)); // Start within next week
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + template.duration);

      const challenge: Challenge = {
        ...template,
        id: `challenge_${Date.now()}_${Math.random()}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        participants: [],
        createdBy: 'system',
        status: startDate > new Date() ? 'upcoming' : 'active'
      };

      challenges.push(challenge);
    }

    // Save initialized challenges
    const saved = this.getSavedChallenges();
    challenges.forEach(challenge => {
      saved[challenge.id] = challenge;
    });
    localStorage.setItem('nutritrack_challenges', JSON.stringify(saved));

    return challenges;
  }

  private calculatePoints(goal: ChallengeGoal, difficulty: string): number {
    const basePoints = goal.isRequired ? 10 : 5;
    const difficultyMultiplier = {
      'beginner': 1,
      'intermediate': 1.5,
      'advanced': 2
    };

    return Math.round(basePoints * (difficultyMultiplier[difficulty as keyof typeof difficultyMultiplier] || 1));
  }

  private updateRankings(challenge: Challenge): void {
    challenge.participants.sort((a, b) => b.totalScore - a.totalScore);
    challenge.participants.forEach((participant, index) => {
      participant.ranking = index + 1;
    });
  }

  private calculateStreak(progress: ChallengeProgress[]): number {
    const sortedProgress = progress
      .filter(p => p.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (const p of sortedProgress) {
      const progressDate = new Date(p.date);
      const daysDiff = Math.floor((currentDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = progressDate;
      } else {
        break;
      }
    }

    return streak;
  }
}

export default CommunityService;