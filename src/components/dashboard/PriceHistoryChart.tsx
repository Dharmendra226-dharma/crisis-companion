import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PriceItem {
  name: string;
  current: number;
  baseline: number;
  change: number;
  label: string;
}

interface MonitoringLog {
  price_data: { items?: PriceItem[] };
  created_at: string;
}

interface Props {
  logs: MonitoringLog[];
}

const COLORS = [
  "hsl(35, 92%, 50%)",   // accent
  "hsl(222, 47%, 40%)",  // primary lighter
  "hsl(142, 71%, 45%)",  // success
];

export const PriceHistoryChart = ({ logs }: Props) => {
  const chartData = useMemo(() => {
    if (logs.length === 0) return generateMockHistory();

    return logs
      .slice()
      .reverse()
      .map((log) => {
        const row: Record<string, string | number> = {
          time: new Date(log.created_at).toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        log.price_data?.items?.forEach((item) => {
          row[item.name] = item.current;
        });
        return row;
      });
  }, [logs]);

  const itemNames = useMemo(() => {
    if (logs.length > 0 && logs[0].price_data?.items) {
      return logs[0].price_data.items.map((i) => i.name);
    }
    return ["LPG Cylinder (14.2kg)", "Induction Stove (Avg)", "Rice (5kg)"];
  }, [logs]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-accent" />
          Price History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 32%, 91%)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`₹${value}`, undefined]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {itemNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

function generateMockHistory() {
  const now = Date.now();
  const points = 12;
  return Array.from({ length: points }, (_, i) => {
    const t = new Date(now - (points - 1 - i) * 30 * 60 * 1000);
    return {
      time: t.toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "LPG Cylinder (14.2kg)": 860 + Math.floor(Math.random() * 80 - 20),
      "Induction Stove (Avg)": 2300 + Math.floor(Math.random() * 400 - 200),
      "Rice (5kg)": 330 + Math.floor(Math.random() * 40 - 10),
    };
  });
}
