import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PriceItem {
  name: string;
  current: number;
  baseline: number;
  change: number;
  label: string;
}

interface Props {
  data: { items: PriceItem[] };
}

const labelBadge = (label: string) => {
  switch (label) {
    case "spike":
      return <Badge variant="destructive">Spike</Badge>;
    case "deal":
      return <Badge variant="success">Deal</Badge>;
    default:
      return <Badge variant="secondary">Normal</Badge>;
  }
};

export const PriceWatchCard = ({ data }: Props) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-accent" />
          Price Watch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.items.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-2 pb-3 border-b last:border-0 last:pb-0">
            <div>
              <p className="font-body text-sm font-medium text-foreground">{item.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">₹{item.current}</span>
                <span className="text-xs text-muted-foreground">vs ₹{item.baseline}</span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${item.change > 0 ? 'text-destructive' : item.change < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                  {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : item.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {Math.abs(item.change)}%
                </span>
              </div>
            </div>
            {labelBadge(item.label)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
