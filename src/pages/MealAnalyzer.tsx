import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, Utensils, Zap, Scale } from 'lucide-react';
import CameraCapture from '@/components/CameraCapture';
import FoodAnalysisService, { MealAnalysis, FoodItem } from '@/services/freeFoodAPI';
import { toast } from 'sonner';

const MealAnalyzer = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const foodService = new FoodAnalysisService();

  const handleImageCapture = async (file: File) => {
    setIsAnalyzing(true);
    setCapturedImage(URL.createObjectURL(file));
    
    try {
      const result = await foodService.analyzeImage(file);
      setAnalysis(result);
      toast.success('Meal analyzed successfully!');
    } catch (error) {
      toast.error('Failed to analyze meal. Please try again.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
      setShowCamera(false);
    }
  };

  const handleStartOver = () => {
    setAnalysis(null);
    setCapturedImage(null);
    setShowCamera(true);
  };

  const handleSaveMeal = () => {
    if (analysis) {
      // Save to your existing meal tracking system
      toast.success('Meal saved to your tracker!');
      setAnalysis(null);
      setCapturedImage(null);
    }
  };

  if (showCamera) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <CameraCapture
          onImageCapture={handleImageCapture}
          onCancel={() => setShowCamera(false)}
          isAnalyzing={isAnalyzing}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Meal Analyzer</h1>
          <p className="text-lg text-muted-foreground">
            Snap a photo of your meal and get instant nutrition analysis
          </p>
        </div>

        {!analysis ? (
          <Card className="text-center">
            <CardContent className="p-12">
              <Camera className="h-24 w-24 mx-auto mb-6 text-primary opacity-50" />
              <h2 className="text-2xl font-semibold mb-4">Ready to Analyze Your Meal?</h2>
              <p className="text-muted-foreground mb-6">
                Take a photo or upload an image of your meal for instant nutrition analysis
              </p>
              <Button size="lg" onClick={() => setShowCamera(true)}>
                <Camera className="mr-2 h-5 w-5" />
                Start Analysis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Image Display */}
            <Card>
              <CardHeader>
                <CardTitle>Your Meal</CardTitle>
              </CardHeader>
              <CardContent>
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Analyzed meal"
                    className="w-full rounded-lg object-cover aspect-video"
                  />
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={handleStartOver}>
                    <Camera className="mr-2 h-4 w-4" />
                    Analyze Another
                  </Button>
                  <Button onClick={handleSaveMeal}>
                    <Utensils className="mr-2 h-4 w-4" />
                    Save to Tracker
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <div className="space-y-6">
              {/* Nutrition Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-warning" />
                    Nutrition Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{analysis.totalCalories}</p>
                      <p className="text-sm text-muted-foreground">Calories</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/10 rounded-lg">
                      <p className="text-3xl font-bold text-secondary">{analysis.totalProtein.toFixed(1)}g</p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <p className="text-3xl font-bold text-accent">{analysis.totalCarbs.toFixed(1)}g</p>
                      <p className="text-sm text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-lg">
                      <p className="text-3xl font-bold text-warning">{analysis.totalFat.toFixed(1)}g</p>
                      <p className="text-sm text-muted-foreground">Fat</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Meal Type</span>
                      <Badge variant="secondary" className="capitalize">
                        {analysis.mealType}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detected Foods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Detected Foods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.foods.map((food: FoodItem) => (
                      <div key={food.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {(food.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{food.calories} cal</p>
                          <p className="text-xs text-muted-foreground">
                            P: {food.protein.toFixed(1)}g | C: {food.carbs.toFixed(1)}g | F: {food.fat.toFixed(1)}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Calories</span>
                        <span>{analysis.totalCalories} / 2000</span>
                      </div>
                      <Progress value={(analysis.totalCalories / 2000) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Protein</span>
                        <span>{analysis.totalProtein.toFixed(1)}g / 150g</span>
                      </div>
                      <Progress value={(analysis.totalProtein / 150) * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealAnalyzer;