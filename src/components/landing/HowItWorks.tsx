import { MapPin, Activity, Send } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Detect Your Location",
    description: "We use your PIN code to find nearby supply sources and dealers.",
  },
  {
    icon: Activity,
    title: "Monitor Supply + Prices",
    description: "Our agent checks LPG, groceries, and essentials every 30 minutes.",
  },
  {
    icon: Send,
    title: "Send Smart Alerts",
    description: "Get notified only when something important changes — no noise.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">
            Three simple steps to stay informed about supply disruptions in your area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center group"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <step.icon className="w-7 h-7 text-accent" />
              </div>
              <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center md:static md:mx-auto md:mb-3 md:w-7 md:h-7 md:text-xs">
                {index + 1}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm font-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
