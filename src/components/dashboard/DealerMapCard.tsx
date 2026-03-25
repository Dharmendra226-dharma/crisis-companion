import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface Dealer {
  name: string;
  status: string;
  queue: string;
  lat?: number;
  lng?: number;
}

interface Props {
  dealers: Dealer[];
  userLat?: number | null;
  userLng?: number | null;
}

const statusColor: Record<string, string> = {
  available: "#22c55e",
  low: "#f59e0b",
  out_of_stock: "#ef4444",
};

const statusLabel: Record<string, string> = {
  available: "Available",
  low: "Low Stock",
  out_of_stock: "Out of Stock",
};

export const DealerMapCard = ({ dealers, userLat, userLng }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const centerLat = userLat || 28.6139;
  const centerLng = userLng || 77.209;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>`,
      iconSize: [14, 14],
      className: "",
    });
    L.marker([centerLat, centerLng], { icon: userIcon })
      .addTo(map)
      .bindPopup("Your Location");

    // Dealer markers with simulated nearby positions
    dealers.forEach((dealer, i) => {
      const lat = dealer.lat || centerLat + (Math.random() - 0.5) * 0.04;
      const lng = dealer.lng || centerLng + (Math.random() - 0.5) * 0.04;
      const color = statusColor[dealer.status] || "#6b7280";
      const label = statusLabel[dealer.status] || dealer.status;

      const dealerIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        className: "",
      });

      L.marker([lat, lng], { icon: dealerIcon })
        .addTo(map)
        .bindPopup(
          `<strong>${dealer.name}</strong><br/>Status: <span style="color:${color};font-weight:600;">${label}</span><br/>Wait: ${dealer.queue}`
        );
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [dealers, centerLat, centerLng]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-accent" />
          Dealer Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="w-full h-[350px] rounded-lg overflow-hidden border" />
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          {Object.entries(statusColor).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
              {statusLabel[key]}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
