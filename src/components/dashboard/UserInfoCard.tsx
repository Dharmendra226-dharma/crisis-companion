import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Clock } from "lucide-react";

interface Props {
  user: { email: string; pincode: string | null; created_at: string };
  lastUpdated?: string;
}

export const UserInfoCard = ({ user, lastUpdated }: Props) => {
  return (
    <Card className="bg-primary text-primary-foreground border-0">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 opacity-70" />
            <span className="font-body text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 opacity-70" />
            <span className="font-body text-sm">{user.pincode || "Not set"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 opacity-70" />
            <span className="font-body text-sm">
              Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Awaiting first scan"}
            </span>
          </div>
          <Badge variant="success" className="ml-auto">Active</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
