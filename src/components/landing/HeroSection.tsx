import { Shield, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  const scrollToSignup = () => {
    document.getElementById("signup")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20" />
      <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-sm font-medium text-accent">Monitoring Active</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
            Stay Ahead of{" "}
            <span className="text-accent">Supply Crises</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 font-body mb-10 max-w-2xl mx-auto">
            Get real-time alerts for LPG availability, essential goods stock, and price spikes — personalized to your PIN code.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={scrollToSignup} className="text-base px-8 py-6">
              <Bell className="w-5 h-5" />
              Get Alerts
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={scrollToSignup}
            >
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-primary-foreground/60 text-sm font-body">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>PIN code personalized</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Only actionable alerts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
