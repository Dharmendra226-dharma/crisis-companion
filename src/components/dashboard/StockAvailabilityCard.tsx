import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface StockItem {
  name: string;
  inStock: boolean;
  price: string;
  eta: string;
}

interface Platform {
  name: string;
  items: StockItem[];
}

interface Props {
  data: { platforms: Platform[] };
}

export const StockAvailabilityCard = ({ data }: Props) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="w-5 h-5 text-accent" />
          Stock Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.platforms.map((platform, i) => (
          <div key={i} className="pb-3 border-b last:border-0 last:pb-0">
            <p className="font-display text-sm font-semibold text-foreground mb-2">{platform.name}</p>
            {platform.items.map((item, j) => (
              <div key={j} className="flex items-center justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.price} · ETA: {item.eta}</p>
                </div>
                <Badge variant={item.inStock ? "success" : "destructive"} className="text-[10px] shrink-0">
                  {item.inStock ? "In Stock" : "Out"}
                </Badge>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
