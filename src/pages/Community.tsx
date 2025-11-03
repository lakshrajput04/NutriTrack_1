import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Users, Calendar, Target, Medal, Star, TrendingUp, Droplets, Activity } from 'lucide-react';
import { Challenge, Leaderboard, CommunityService } from '@/services/communityService';
import { UserDataService } from '@/utils/calorieCalculation';
import { toast } from 'sonner';

const Community = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  
  const communityService = new CommunityService();
  const userProfile = UserDataService.loadProfile();

  useEffect(() => {
    loadChallenges();
    loadUserChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const availableChallenges = await communityService.getAvailableChallenges();
      setChallenges(availableChallenges);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const loadUserChallenges = async () => {
    if (!userProfile) return;

    try {
      const allChallenges = await communityService.getAvailableChallenges();
      const joined = allChallenges.filter(challenge => 
        challenge.participants.some(p => p.userId === userProfile.id)
      );
      setUserChallenges(joined);
    } catch (error) {
      console.error('Failed to load user challenges:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!userProfile) {
      toast.error('Please set up your profile first!');
      return;
    }

    setIsJoining(true);
    try {
      await communityService.joinChallenge(challengeId, userProfile.id, userProfile.name || 'Anonymous');
      toast.success('Successfully joined challenge!');
      loadChallenges();
      loadUserChallenges();
    } catch (error: any) {
      toast.error(error.message || 'Failed to join challenge');
    } finally {
      setIsJoining(false);
    }
  };

  const loadLeaderboard = async (challengeId: string) => {
    try {
      const leaderboardData = await communityService.getLeaderboard(challengeId);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'hydration': return <Droplets className="h-5 w-5" />;
      case 'exercise': return <Activity className="h-5 w-5" />;
      case 'nutrition': return <Target className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'upcoming': return 'bg-secondary text-secondary-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-success';
      case 'intermediate': return 'text-warning';
      case 'advanced': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isUserJoined = (challenge: Challenge) => {
    return userProfile && challenge.participants.some(p => p.userId === userProfile.id);
  };

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {getChallengeIcon(challenge.type)}
            </div>
            <div>
              <h3 className="font-semibold">{challenge.title}</h3>
              <p className="text-sm text-muted-foreground">{challenge.category} challenge</p>
            </div>
          </div>
          <Badge className={getStatusColor(challenge.status)}>
            {challenge.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-2 font-medium">{challenge.duration} days</span>
          </div>
          <div>
            <span className="text-muted-foreground">Participants:</span>
            <span className="ml-2 font-medium">{challenge.participants.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Difficulty:</span>
            <span className={`ml-2 font-medium ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Ends:</span>
            <span className="ml-2 font-medium">{formatDate(challenge.endDate)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {challenge.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              setSelectedChallenge(challenge);
              loadLeaderboard(challenge.id);
            }}
            variant="outline"
          >
            View Details
          </Button>
          {!isUserJoined(challenge) && challenge.status === 'upcoming' ? (
            <Button
              onClick={() => joinChallenge(challenge.id)}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join'}
            </Button>
          ) : isUserJoined(challenge) ? (
            <Button disabled variant="secondary">
              Joined
            </Button>
          ) : (
            <Button disabled variant="outline">
              {challenge.status === 'completed' ? 'Completed' : 'Unavailable'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const UserChallengeCard = ({ challenge }: { challenge: Challenge }) => {
    const userParticipant = challenge.participants.find(p => p.userId === userProfile?.id);
    const progressPercentage = userParticipant ? (userParticipant.totalScore / (challenge.goals.length * challenge.duration * 10)) * 100 : 0;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{challenge.title}</h3>
            <Badge className={getStatusColor(challenge.status)}>
              {challenge.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{userParticipant?.totalScore || 0} points</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Rank:</span>
              <span className="ml-2 font-medium">#{userParticipant?.ranking || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Days left:</span>
              <span className="ml-2 font-medium">{getDaysRemaining(challenge.endDate)}</span>
            </div>
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setSelectedChallenge(challenge);
              loadLeaderboard(challenge.id);
            }}
          >
            View Progress
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Community Challenges</h1>
          <p className="text-lg text-muted-foreground">
            Join health challenges, compete with others, and achieve your goals together
          </p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Challenges</TabsTrigger>
            <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>

            {challenges.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No challenges available at the moment.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back soon for new challenges!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-challenges" className="space-y-6">
            {!userProfile ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Set up your profile to join challenges!</p>
                  <Button onClick={() => window.location.href = '/profile'}>
                    Create Profile
                  </Button>
                </CardContent>
              </Card>
            ) : userChallenges.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't joined any challenges yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Browse available challenges and join one to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userChallenges.map((challenge) => (
                  <UserChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.filter(c => c.participants.length > 0).map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {challenge.participants.length} participants
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {challenge.participants
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .slice(0, 3)
                        .map((participant, index) => (
                          <div key={participant.userId} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              {index === 0 ? (
                                <Medal className="h-4 w-4 text-warning" />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{participant.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {participant.totalScore} points
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        loadLeaderboard(challenge.id);
                      }}
                    >
                      View Full Leaderboard
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Challenge Detail Modal */}
        <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedChallenge && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getChallengeIcon(selectedChallenge.type)}
                    {selectedChallenge.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedChallenge.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Goals</h3>
                    <div className="space-y-2">
                      {selectedChallenge.goals.map((goal) => (
                        <div key={goal.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm">{goal.description}</span>
                          <Badge variant={goal.isRequired ? "default" : "outline"}>
                            {goal.target} {goal.unit}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Rules</h3>
                    <ul className="space-y-1">
                      {selectedChallenge.rules.map((rule, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Rewards</h3>
                    <div className="space-y-2">
                      {selectedChallenge.rewards.map((reward) => (
                        <div key={reward.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                          <Star className="h-4 w-4 text-warning" />
                          <div>
                            <p className="text-sm font-medium">{reward.name}</p>
                            <p className="text-xs text-muted-foreground">{reward.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {leaderboard && (
                    <div>
                      <h3 className="font-semibold mb-2">Leaderboard</h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {leaderboard.participants.map((participant, index) => (
                          <div key={participant.userId} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">#{participant.rank}</span>
                              <span className="text-sm">{participant.username}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{participant.score} pts</p>
                              <p className="text-xs text-muted-foreground">
                                {participant.completedGoals}/{participant.totalGoals} goals
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isUserJoined(selectedChallenge) && selectedChallenge.status === 'upcoming' && (
                    <Button
                      className="w-full"
                      onClick={() => joinChallenge(selectedChallenge.id)}
                      disabled={isJoining}
                    >
                      {isJoining ? 'Joining...' : 'Join Challenge'}
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Community;