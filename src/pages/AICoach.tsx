import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User, Heart, Zap, Target, Droplets } from 'lucide-react';
import { ChatMessage, CoachRecommendation, FreeAICoachService } from '@/services/freeAICoach';
import { UserDataService } from '@/utils/calorieCalculation';
import { toast } from 'sonner';

const AICoach = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CoachRecommendation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const coachService = new FreeAICoachService();

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI Health & Fitness Coach. I'm here to help you achieve your goals with personalized advice on nutrition, exercise, and motivation. What would you like to talk about today?",
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages([welcomeMessage]);

    // Load daily recommendations
    loadDailyRecommendations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDailyRecommendations = async () => {
    const userProfile = UserDataService.loadProfile();
    if (!userProfile) return;

    try {
      // Mock recent meals for demo
      const recentMeals: any[] = [];
      const todayCalories = 0;

      const dailyRecs = await coachService.generateDailyRecommendations(
        userProfile,
        recentMeals,
        todayCalories
      );
      setRecommendations(dailyRecs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userProfile = UserDataService.loadProfile();
    if (!userProfile) {
      toast.error('Please set up your profile first!');
      return;
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Mock recent meals for demo
      const recentMeals: any[] = [];
      
      const response = await coachService.generateCoachResponse(
        inputMessage,
        userProfile,
        recentMeals,
        messages
      );

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response. Please try again.');
      console.error('Coach response failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'nutrition': return <Zap className="h-4 w-4" />;
      case 'exercise': return <Target className="h-4 w-4" />;
      case 'hydration': return <Droplets className="h-4 w-4" />;
      case 'motivation': return <Heart className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const quickQuestions = [
    "How can I lose weight safely?",
    "What exercises should I do?",
    "I'm feeling unmotivated, help!",
    "What should I eat for breakfast?",
    "How much water should I drink?",
    "I missed my workout, what now?"
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Health & Fitness Coach</h1>
          <p className="text-lg text-muted-foreground">
            Get personalized advice and motivation for your health journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Chat with Your Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`flex-1 space-y-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            {message.content}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="inline-block rounded-lg bg-muted px-3 py-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse"></div>
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-75"></div>
                              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-150"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <div className="p-4 border-t">
                    <p className="text-sm font-medium mb-2">Quick questions to get started:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quickQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-2 px-3 text-left justify-start"
                          onClick={() => setInputMessage(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything about nutrition, exercise, or motivation..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Set up your profile to get personalized recommendations!
                  </p>
                ) : (
                  recommendations.map((rec, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start gap-2 mb-2">
                        {getRecommendationIcon(rec.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{rec.title}</h4>
                          <Badge variant={getPriorityColor(rec.priority)} className="text-xs mt-1">
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                      <ul className="space-y-1">
                        {rec.actionItems.slice(0, 2).map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="text-primary">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coach Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  <span>Nutrition guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Exercise recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-destructive" />
                  <span>Motivation & support</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-secondary" />
                  <span>24/7 availability</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Be specific about your questions for better advice</p>
                <p>• Share your current challenges and goals</p>
                <p>• Ask for meal ideas, workout plans, or motivation</p>
                <p>• Check back daily for new recommendations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;