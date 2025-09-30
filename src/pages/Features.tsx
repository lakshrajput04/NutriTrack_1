import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Zap, Shield, Users, Clock, TrendingUp } from "lucide-react";

const Features = () => {
  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast Tracking",
      description: "Log your meals in seconds with our intuitive interface and smart suggestions",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your health data is encrypted and secure. We never share your information",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a community of health-conscious individuals on the same journey",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Track your nutrition anytime, anywhere with our mobile-friendly platform",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Detailed charts and insights help you understand your nutrition patterns",
    },
    {
      icon: Check,
      title: "Goal Achievement",
      description: "Set realistic goals and track your progress with visual milestones",
    },
  ];

  const faqs = [
    {
      question: "How accurate is the calorie tracking?",
      answer:
        "Our database contains nutritional information for thousands of foods, regularly updated to ensure accuracy. You can also manually adjust values for custom meals.",
    },
    {
      question: "Can I track macronutrients?",
      answer:
        "Yes! NutriTrack automatically calculates and tracks your protein, carbohydrates, and fat intake alongside calories.",
    },
    {
      question: "Is there a mobile app?",
      answer:
        "Currently, NutriTrack is a responsive web application that works seamlessly on all devices. A dedicated mobile app is in development.",
    },
    {
      question: "How do I set my calorie goals?",
      answer:
        "Visit your dashboard to set personalized calorie and macronutrient goals based on your age, weight, activity level, and objectives.",
    },
    {
      question: "Can I export my data?",
      answer:
        "Yes, you can export your nutrition data in CSV format from your dashboard for further analysis or record-keeping.",
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
            Powerful Features for Your Success
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to take control of your nutrition journey
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="group transition-all hover:shadow-medium animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs Section */}
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Features;
