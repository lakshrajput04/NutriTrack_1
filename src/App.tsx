import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import Features from "./pages/Features";
import Tracker from "./pages/Tracker";
import BMI from "./pages/BMI";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MealAnalyzer from "./pages/MealAnalyzer";
import Profile from "./pages/Profile";
import AICoach from "./pages/AICoach";
import RecipePlanner from "./pages/RecipePlanner";
import Community from "./pages/Community";
import APITester from "./pages/APITester";
import DatabaseIntegration from "./pages/DatabaseIntegration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/meal-analyzer" element={<MealAnalyzer />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/recipe-planner" element={<RecipePlanner />} />
          <Route path="/community" element={<Community />} />
          <Route path="/api-tester" element={<APITester />} />
          <Route path="/database" element={<DatabaseIntegration />} />
          <Route path="/bmi" element={<BMI />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
