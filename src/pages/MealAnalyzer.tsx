import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Utensils, Zap, Scale, Sparkles, Loader2 } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { toast } from 'sonner';

const MealAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [foodDescription, setFoodDescription] = useState('');

  const handleAnalyze = async () => {
    if (!foodDescription.trim()) {
      toast.error('Please enter a food description');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await geminiService.analyzeFood(foodDescription);
      setAnalysis(result);
      toast.success('Food analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze food. Please try again.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartOver = () => {
    setAnalysis(null);
    setFoodDescription('');
  };

  const handleSaveMeal = () => {
    if (analysis) {
      toast.success('Meal saved to your tracker!');
      setAnalysis(null);
      setFoodDescription('');
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-primary" />
            AI Meal Analyzer
          </h1>
          <p className="text-lg text-muted-foreground">
            Describe your meal and get instant AI-powered nutrition analysis
          </p>
        </div>

        {!analysis ? (
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Meal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="food-description">What did you eat?</Label>
                <Textarea
                  id="food-description"
                  placeholder="e.g., Grilled chicken breast with brown rice and steamed broccoli"
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Be as detailed as possible for more accurate analysis
                </p>
              </div>

              <Button 
                size="lg" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !foodDescription.trim()}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze with AI
                  </>
                )}
              </Button>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Example Descriptions
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>2 scrambled eggs with whole wheat toast and avocado</li>
                  <li>Paneer tikka masala with naan and dal</li>
                  <li>Grilled salmon 200g with quinoa and mixed vegetables</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrition Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold mb-2">Your Meal:</h3>
                    <p className="text-muted-foreground">{foodDescription}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Calories</p>
                        <p className="text-3xl font-bold">{analysis.totalCalories}</p>
                      </div>
                    </div>
                  </div>

                  {analysis.analysis && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h3 className="font-semibold mb-2">AI Insights</h3>
                      <p className="text-sm text-muted-foreground">{analysis.analysis}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutritional Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.foods.map((food: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{food.name}</h3>
                          <p className="text-sm text-muted-foreground">{food.quantity}</p>
                        </div>
                        <Badge variant="secondary" className="text-lg">{food.calories} cal</Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Protein</p>
                          <p className="text-lg font-semibold text-primary">{food.protein}g</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                          <p className="text-lg font-semibold text-secondary">{food.carbs}g</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Fat</p>
                          <p className="text-lg font-semibold text-orange-600">{food.fat}g</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Fiber</p>
                          <p className="text-lg font-semibold text-green-600">{food.fiber}g</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleStartOver} className="flex-1">
                Analyze Another Meal
              </Button>
              <Button onClick={handleSaveMeal} className="flex-1">
                <Scale className="mr-2 h-4 w-4" />
                Save to Tracker
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealAnalyzer;
