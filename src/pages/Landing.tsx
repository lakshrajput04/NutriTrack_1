import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, TrendingUp, Target, BarChart3, Star } from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Activity,
      title: "Track Meals",
      description: "Log your daily meals and monitor calorie intake with ease",
    },
    {
      icon: Target,
      title: "Set Goals",
      description: "Define personalized nutrition goals and track your progress",
    },
    {
      icon: TrendingUp,
      title: "Get Insights",
      description: "Receive intelligent suggestions based on your eating patterns",
    },
    {
      icon: BarChart3,
      title: "Visualize Progress",
      description: "See your journey through beautiful charts and statistics",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fitness Enthusiast",
      content: "NutriTrack has completely transformed how I approach nutrition. The tracking is so simple!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Professional Athlete",
      content: "The insights and visualizations help me optimize my diet for peak performance.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "Busy Professional",
      content: "Finally, a nutrition app that's easy to use and actually helps me stay on track.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <h1 className="mb-6 text-4xl font-bold text-primary-foreground md:text-6xl">
              Your Journey to Better Nutrition Starts Here
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90 md:text-xl">
              Track calories, set goals, and achieve your health objectives with NutriTrack's
              intelligent nutrition management platform.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/tracker">Start Tracking</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" asChild>
                <Link to="/features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to make nutrition tracking effortless
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group transition-all hover:shadow-medium animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Loved by Thousands
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our users have to say about NutriTrack
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <CardContent className="p-6">
                  <div className="mb-4 flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mb-4 text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-hero">
            <CardContent className="p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
                Ready to Transform Your Nutrition?
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/90">
                Join thousands of users achieving their health goals with NutriTrack
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/tracker">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;
