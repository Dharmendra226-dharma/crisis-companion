import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; pincode: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", description: "Please enter your PIN code manually.", variant: "destructive" });
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const pincode = data.address?.postcode || "Unknown";
          setLocation({ lat: latitude, lng: longitude, pincode });
          toast({ title: "Location detected!", description: `PIN code: ${pincode}` });
        } catch {
          setLocation({ lat: latitude, lng: longitude, pincode: "Unknown" });
        }
        setLocationLoading(false);
      },
      () => {
        toast({ title: "Location access denied", description: "You can still sign up — we'll use a default region.", variant: "destructive" });
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        navigate(`/dashboard?uid=${existing.id}`);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .insert({
          email,
          latitude: location?.lat || null,
          longitude: location?.lng || null,
          pincode: location?.pincode || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Send welcome email
      try {
        await supabase.functions.invoke("send-welcome-email", {
          body: { to: email, type: "welcome" },
        });
      } catch (emailErr) {
        console.error("Welcome email failed:", emailErr);
      }

      navigate(`/dashboard?uid=${data.id}`);
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signup" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Get Started
            </h2>
            <p className="text-muted-foreground font-body">
              Enter your email and allow location access for personalized alerts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base"
            />

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 gap-2"
              onClick={handleGetLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : location ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {location ? `Located: ${location.pincode}` : "Allow Location"}
            </Button>

            <Button
              type="submit"
              variant="hero"
              className="w-full h-12 text-base"
              disabled={loading || !email}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Alerts →"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
