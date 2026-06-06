"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  content: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='search']",
    title: "Search Products",
    content: "Find products by searching for keywords or browsing categories.",
  },
  {
    target: "[data-tour='cart']",
    title: "Your Cart",
    content: "View items you've added and checkout when ready.",
  },
  {
    target: "[data-tour='wishlist']",
    title: "Wishlist",
    content: "Save products you love to view later.",
  },
  {
    target: "[data-tour='account']",
    title: "Your Account",
    content: "Manage your profile, orders, and settings.",
  },
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem("tour-completed");
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible && currentStep < TOUR_STEPS.length) {
      const target = TOUR_STEPS[currentStep].target;
      const element = document.querySelector(target) as HTMLElement;
      if (element) {
        setTargetElement(element.getBoundingClientRect());
      }
    }
  }, [currentStep, isVisible]);

  function completeTour() {
    localStorage.setItem("tour-completed", "true");
    setIsVisible(false);
  }

  function next() {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  }

  function skip() {
    completeTour();
  }

  if (!isVisible || currentStep >= TOUR_STEPS.length) return null;

  const step = TOUR_STEPS[currentStep];

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
          <h3 className="font-bold text-base md:text-lg mb-1.5 md:mb-2">{step.title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{step.content}</p>
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={skip}>
              Skip
            </Button>
            <Button size="sm" onClick={next}>
              {currentStep === TOUR_STEPS.length - 1 ? "Done" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}