import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel } from "lucide-react";

interface Dealer {
  name: string;
  status: string;
  queue: string;
}

interface Props {
  data: { dealers: Dealer[] };
}

const statusBadge = (status: string) => {
  switch (status) {
    case "available":
      return <Badge variant="success">Available</Badge>;
    case "low":
      return <Badge variant="warning">Low Stock</Badge>;
    case "out_of_stock":
      return <Badge variant="destructive">Out of Stock</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const LpgStatusCard = ({ data }: Props) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Fuel className="w-5 h-5 text-accent" />
          LPG Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.dealers.map((dealer, i) => (
          <div key={i} className="flex items-start justify-between gap-2 pb-3 border-b last:border-0 last:pb-0">
            <div>
              <p className="font-body text-sm font-medium text-foreground">{dealer.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Wait: {dealer.queue}</p>
            </div>
            {statusBadge(dealer.status)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
