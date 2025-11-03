import { Link, useLocation } from "react-router-dom";
import { Activity, Home, FileText, Calculator, LayoutDashboard, Menu, X, Camera, MessageCircle, Calendar, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/features", label: "Features", icon: FileText },
    { path: "/tracker", label: "Tracker", icon: Activity },
    { path: "/meal-analyzer", label: "AI Analyzer", icon: Camera },
    { path: "/ai-coach", label: "AI Coach", icon: MessageCircle },
    { path: "/recipe-planner", label: "Meal Plans", icon: Calendar },
    { path: "/community", label: "Challenges", icon: Trophy },
    { path: "/bmi", label: "BMI", icon: Calculator },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">NutriTrack</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.path) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Sign In Button */}
          <div className="hidden md:block">
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-6">
                  {/* Mobile Logo */}
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 pb-4 border-b"
                    onClick={handleLinkClick}
                  >
                    <Activity className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold text-foreground">NutriTrack</span>
                  </Link>

                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={handleLinkClick}
                          className={`flex items-center gap-3 text-lg font-medium transition-colors hover:text-primary p-2 rounded-md ${
                            isActive(item.path) 
                              ? "text-primary bg-primary/10" 
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile Sign In Button */}
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link to="/login" onClick={handleLinkClick}>
                        Sign In
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
