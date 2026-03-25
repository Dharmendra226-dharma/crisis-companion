import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { LpgStatusCard } from "@/components/dashboard/LpgStatusCard";
import { StockAvailabilityCard } from "@/components/dashboard/StockAvailabilityCard";
import { DealerMapCard } from "@/components/dashboard/DealerMapCard";
import { PriceWatchCard } from "@/components/dashboard/PriceWatchCard";
import { PriceHistoryChart } from "@/components/dashboard/PriceHistoryChart";
import { AlertsHistoryCard } from "@/components/dashboard/AlertsHistoryCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

interface MonitoringLog {
  lpg_status: any;
  stock_status: any;
  price_data: any;
  ai_insights: any;
  created_at: string;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  sent_at: string;
}

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get("uid");

  const [user, setUser] = useState<UserData | null>(null);
  const [latestLog, setLatestLog] = useState<MonitoringLog | null>(null);
  const [priceLogs, setPriceLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      navigate("/");
      return;
    }
    fetchData();
  }, [uid]);

  const fetchData = async () => {
    if (!uid) return;
    setLoading(true);

    const [userRes, logRes, priceLogsRes, alertRes] = await Promise.all([
      supabase.from("users").select("*").eq("id", uid).single(),
      supabase.from("monitoring_logs").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(1),
      supabase.from("monitoring_logs").select("price_data, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(30),
      supabase.from("alerts").select("*").eq("user_id", uid).order("sent_at", { ascending: false }).limit(20),
    ]);

    if (userRes.data) setUser(userRes.data as UserData);
    if (logRes.data && logRes.data.length > 0) setLatestLog(logRes.data[0] as MonitoringLog);
    if (priceLogsRes.data) setPriceLogs(priceLogsRes.data);
    if (alertRes.data) setAlerts(alertRes.data as Alert[]);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  // Default/mock data when no monitoring logs exist yet
  const lpgStatus = latestLog?.lpg_status || {
    dealers: [
      { name: "HP Gas Agency - Sector 12", status: "available", queue: "~15 min" },
      { name: "Bharat Gas - Main Road", status: "low", queue: "~45 min" },
      { name: "Indane Gas Centre", status: "out_of_stock", queue: "N/A" },
    ],
  };

  const stockStatus = latestLog?.stock_status || {
    platforms: [
      { name: "Blinkit", items: [{ name: "Induction Stove (Prestige)", inStock: true, price: "₹2,499", eta: "10 min" }] },
      { name: "Zepto", items: [{ name: "Induction Stove (Pigeon)", inStock: false, price: "₹1,899", eta: "N/A" }] },
      { name: "Amazon", items: [{ name: "Induction Cooktop (Philips)", inStock: true, price: "₹2,999", eta: "2 days" }] },
    ],
  };

  const priceData = latestLog?.price_data || {
    items: [
      { name: "LPG Cylinder (14.2kg)", current: 903, baseline: 860, change: 5.0, label: "spike" },
      { name: "Induction Stove (Avg)", current: 2299, baseline: 2499, change: -8.0, label: "deal" },
      { name: "Rice (5kg)", current: 350, baseline: 340, change: 2.9, label: "normal" },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-display text-xl font-bold text-foreground">Crisis Companion</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <UserInfoCard user={user} lastUpdated={latestLog?.created_at} />
          </div>

          <div className="lg:col-span-1">
            <LpgStatusCard data={lpgStatus} />
          </div>

          <div className="lg:col-span-1">
            <StockAvailabilityCard data={stockStatus} />
          </div>

          <div className="lg:col-span-1">
            <PriceWatchCard data={priceData} />
          </div>

          <div className="lg:col-span-2">
            <DealerMapCard
              dealers={lpgStatus.dealers}
              userLat={user.latitude}
              userLng={user.longitude}
            />
          </div>

          <div className="lg:col-span-1">
            <PriceHistoryChart logs={priceLogs} />
          </div>

          <div className="lg:col-span-3">
            <AlertsHistoryCard alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
