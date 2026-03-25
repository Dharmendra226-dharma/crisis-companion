import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

interface Alert {
  id: string;
  type: string;
  message: string;
  sent_at: string;
}

interface Props {
  alerts: Alert[];
}

const typeBadge = (type: string) => {
  switch (type) {
    case "lpg":
      return <Badge variant="default">LPG</Badge>;
    case "stock":
      return <Badge variant="secondary">Stock</Badge>;
    case "price":
      return <Badge variant="warning">Price</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export const AlertsHistoryCard = ({ alerts }: Props) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-accent" />
          Alerts History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-body">
              No alerts yet. The agent will send alerts when it detects changes.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                {typeBadge(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.sent_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
