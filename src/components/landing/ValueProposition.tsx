import { Zap, Target, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    icon: Zap,
    title: "Proactive Alerts",
    description: "Know about shortages and price spikes before they impact you. Our AI monitors 24/7.",
  },
  {
    icon: Target,
    title: "Personalized to Your PIN Code",
    description: "Every alert is relevant to your exact location — nearby dealers, local stores, regional prices.",
  },
  {
    icon: ShieldCheck,
    title: "No Spam, Only Useful Updates",
    description: "We only email when something actually changed. No daily digests, no marketing noise.",
  },
];

export const ValueProposition = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Crisis Companion?
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">
            Built for people who need reliable information during supply disruptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {values.map((val) => (
            <Card key={val.title} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  <val.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                  {val.title}
                </h3>
                <p className="text-muted-foreground text-sm font-body leading-relaxed">
                  {val.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
