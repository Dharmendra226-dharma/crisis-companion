import { useState } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { SignupForm } from "@/components/landing/SignupForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <HowItWorks />
      <ValueProposition />
      <SignupForm />
      <footer className="border-t py-8 text-center">
        <p className="text-sm text-muted-foreground font-body">
          © 2026 Crisis Companion Agent. Built for resilience.
        </p>
      </footer>
    </div>
  );
};

export default Index;
