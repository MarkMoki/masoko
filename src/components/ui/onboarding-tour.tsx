"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { X, Search, ShoppingCart, Heart, MapPin, Store, BarChart3, Package, CreditCard, Bell, Users, Settings } from "lucide-react";

interface TourStep {
  id: string;
  target?: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  roles: ("customer" | "seller" | "admin")[];
}

const TOUR_STEPS: TourStep[] = [
  // Welcome step - all users
  {
    id: "welcome",
    title: "Welcome to maSoKo!",
    content: "Your multi-vendor marketplace for shopping from multiple sellers across Kenya.",
    icon: <Store className="h-8 w-8 text-primary" />,
    roles: ["customer", "seller", "admin"],
  },
  // Customer steps
  {
    id: "search",
    target: "[data-tour='search']",
    title: "Search Products",
    content: "Find products by searching for keywords or browsing categories. Filter by price, location, and more.",
    icon: <Search className="h-6 w-6 text-primary" />,
    roles: ["customer"],
  },
  {
    id: "map",
    target: "[data-tour='map']",
    title: "Find Nearby Stores",
    content: "Discover stores near you on the map. See what's available in your area.",
    icon: <MapPin className="h-6 w-6 text-primary" />,
    roles: ["customer"],
  },
  {
    id: "cart",
    target: "[data-tour='cart']",
    title: "Your Cart",
    content: "Add items from multiple sellers to a single cart and checkout seamlessly.",
    icon: <ShoppingCart className="h-6 w-6 text-primary" />,
    roles: ["customer"],
  },
  {
    id: "wishlist",
    target: "[data-tour='wishlist']",
    title: "Wishlist",
    content: "Save products you love to view later and get notified of price changes.",
    icon: <Heart className="h-6 w-6 text-primary" />,
    roles: ["customer"],
  },
  {
    id: "orders-customer",
    target: "[data-tour='orders']",
    title: "My Orders",
    content: "Track your orders, view order history, and manage returns.",
    icon: <Bell className="h-6 w-6 text-primary" />,
    roles: ["customer"],
  },
  // Seller steps
  {
    id: "merchant-dashboard",
    target: "[data-tour='merchant']",
    title: "Merchant Dashboard",
    content: "Manage your store, products, orders, and payments all in one place.",
    icon: <Store className="h-6 w-6 text-primary" />,
    roles: ["seller"],
  },
  {
    id: "merchant-store",
    target: "[data-tour='merchant-store']",
    title: "Manage Your Store",
    content: "Create and customize your store profile, set location on map, and manage store details.",
    icon: <Settings className="h-6 w-6 text-primary" />,
    roles: ["seller"],
  },
  {
    id: "merchant-products",
    target: "[data-tour='merchant-products']",
    title: "Product Management",
    content: "Add, edit, and manage your products. Track inventory and set pricing.",
    icon: <Package className="h-6 w-6 text-primary" />,
    roles: ["seller"],
  },
  {
    id: "merchant-orders",
    target: "[data-tour='merchant-orders']",
    title: "Order Handling",
    content: "View and manage customer orders. Update status and communicate with buyers.",
    icon: <Bell className="h-6 w-6 text-primary" />,
    roles: ["seller"],
  },
  {
    id: "merchant-payments",
    target: "[data-tour='merchant-payments']",
    title: "Payment Methods",
    content: "Set up payment methods for customers to pay for their orders.",
    icon: <CreditCard className="h-6 w-6 text-primary" />,
    roles: ["seller"],
  },
  // Admin steps
  {
    id: "admin-dashboard",
    target: "[data-tour='admin']",
    title: "Admin Dashboard",
    content: "Oversee the entire marketplace. Manage sellers, products, and platform settings.",
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    roles: ["admin"],
  },
  {
    id: "admin-sellers",
    target: "[data-tour='admin-sellers']",
    title: "Seller Management",
    content: "Create, view, and manage all sellers on the platform.",
    icon: <Users className="h-6 w-6 text-primary" />,
    roles: ["admin"],
  },
];

function RoadmapDiagram({ steps }: { steps: TourStep[] }) {
  return (
    <div className="relative mt-4 max-h-60 overflow-y-auto">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-3">
        {steps.map((step, index) => {
          return (
            <div key={step.id} className="relative flex items-start gap-3">
              <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-background border-primary">
                <span className="text-xs font-semibold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2">
                  {step.icon}
                  <h4 className="font-medium text-sm">{step.title}</h4>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{step.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDontShowAgain, setShowDontShowAgain] = useState(false);

  const steps = useMemo(() => {
    if (userRole === "admin") {
      return TOUR_STEPS.filter(s => s.roles.includes("admin"));
    }
    if (userRole === "seller") {
      return TOUR_STEPS.filter(s => s.roles.includes("seller"));
    }
    return TOUR_STEPS.filter(s => s.roles.includes("customer"));
  }, [userRole]);

  useEffect(() => {
    async function initTour() {
      try {
        const session = await fetch("/api/auth/me").then(r => r.json());
        if (session?.user) {
          setUserId(session.user.id);
          setUserRole(session.role);
          
          const dontShowKey = `tour-dont-show-${session.role}-${session.user.id}`;
          const dontShow = localStorage.getItem(dontShowKey);
          
          if (!dontShow) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
          }
        } else {
          setUserRole("customer");
          const timer = setTimeout(() => setIsVisible(true), 1000);
          return () => clearTimeout(timer);
        }
      } catch {
        setUserRole("customer");
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    }
    initTour();
  }, []);

  useEffect(() => {
    if (isVisible && currentStep < steps.length) {
      const target = steps[currentStep].target;
      if (target) {
        const element = document.querySelector(target) as HTMLElement;
        if (element) {
          setTargetElement(element.getBoundingClientRect());
        }
      } else {
        setTargetElement(null);
      }
    }
  }, [currentStep, isVisible, steps]);

  function completeTour() {
    if (userRole && userId) {
      localStorage.setItem(`tour-completed-${userRole}-${userId}`, "true");
    }
    if (showDontShowAgain && userRole && userId) {
      localStorage.setItem(`tour-dont-show-${userRole}-${userId}`, "true");
    }
    setIsVisible(false);
  }

  function next() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  }

  function skip() {
    completeTour();
  }

  if (!isVisible || currentStep >= steps.length) return null;

  const step = steps[currentStep];

  if (step.id === "welcome") {
    const tourSteps = steps.slice(1);
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
          <CardHeader className="pb-3">
            <button
              onClick={skip}
              className="absolute right-3 top-3 rounded-lg p-1 hover:bg-accent transition-colors"
              aria-label="Close tour"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex justify-center mb-2">{step.icon}</div>
            <CardTitle className="text-center">{step.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <p className="text-sm text-muted-foreground text-center mb-3">{step.content}</p>
            <p className="text-xs font-medium text-center mb-2">Your roadmap for {userRole === "admin" ? "Admin" : userRole === "seller" ? "Seller" : "Shopping"}:</p>
            <RoadmapDiagram steps={tourSteps} />
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
              <Checkbox 
                id="dont-show" 
                checked={showDontShowAgain}
                onChange={(e) => setShowDontShowAgain(e.target.checked)}
              />
              <label htmlFor="dont-show" className="text-xs text-muted-foreground cursor-pointer">
                Don&apos;t show this tour again
              </label>
            </div>
            <div className="flex justify-end mt-3">
              <Button size="sm" onClick={next}>
                Start Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!step.target) return null;

  const tourStepsCount = steps.length - 1;
  const currentTourStep = currentStep;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={skip}>
      {targetElement && (
        <div
          className="absolute rounded-lg bg-background p-3 md:p-4 shadow-xl max-w-xs"
          style={{
            top: targetElement.bottom + 10,
            left: Math.min(targetElement.left, window.innerWidth - 260),
          }}
        >
          <button
            onClick={skip}
            className="absolute right-1.5 top-1.5 md:right-2 md:top-2"
            aria-label="Close tour"
          >
            <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            {step.icon}
            <h3 className="font-bold text-base md:text-lg">{step.title}</h3>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{step.content}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Step {currentTourStep} of {tourStepsCount}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={skip}>
                Skip
              </Button>
              <Button size="sm" onClick={next}>
                {currentTourStep === tourStepsCount ? "Done" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}