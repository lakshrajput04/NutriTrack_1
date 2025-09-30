import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

const BMI = () => {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState("");
  const [advice, setAdvice] = useState("");

  const calculateBMI = () => {
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);

    if (heightInMeters > 0 && weightInKg > 0) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(parseFloat(bmiValue.toFixed(1)));

      let cat = "";
      let adv = "";

      if (bmiValue < 18.5) {
        cat = "Underweight";
        adv =
          "You may need to gain weight. Consider consulting with a healthcare provider for personalized nutrition advice.";
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        cat = "Normal Weight";
        adv =
          "Great! You're in a healthy weight range. Maintain your current lifestyle with balanced nutrition and regular exercise.";
      } else if (bmiValue >= 25 && bmiValue < 30) {
        cat = "Overweight";
        adv =
          "Consider adopting a balanced diet and increasing physical activity. Small lifestyle changes can make a big difference.";
      } else {
        cat = "Obese";
        adv =
          "It's recommended to consult with a healthcare provider to develop a safe and effective weight management plan.";
      }

      setCategory(cat);
      setAdvice(adv);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Underweight":
        return "text-warning";
      case "Normal Weight":
        return "text-success";
      case "Overweight":
        return "text-warning";
      case "Obese":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground">BMI Calculator</h1>
            <p className="text-lg text-muted-foreground">
              Calculate your Body Mass Index and get health insights
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Calculate Your BMI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="e.g., 170"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={calculateBMI} className="w-full">
                Calculate BMI
              </Button>

              {bmi !== null && (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Your BMI
                    </p>
                    <p className="mb-2 text-5xl font-bold text-primary">{bmi}</p>
                    <p className={`text-xl font-semibold ${getCategoryColor(category)}`}>
                      {category}
                    </p>
                  </div>

                  <Card className="bg-muted">
                    <CardContent className="p-6">
                      <h3 className="mb-2 font-semibold text-foreground">Health Advice</h3>
                      <p className="text-muted-foreground">{advice}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 font-semibold text-foreground">
                        BMI Categories
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Underweight:</span>
                          <span className="font-medium">Less than 18.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Normal weight:</span>
                          <span className="font-medium">18.5 - 24.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Overweight:</span>
                          <span className="font-medium">25 - 29.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Obese:</span>
                          <span className="font-medium">30 or greater</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BMI;
