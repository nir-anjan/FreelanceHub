import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  color?: "blue" | "green" | "yellow" | "red";
  className?: string;
}

const colorConfig = {
  blue: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    changeBg: "bg-blue-50",
  },
  green: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    changeBg: "bg-green-50",
  },
  yellow: {
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    changeBg: "bg-yellow-50",
  },
  red: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    changeBg: "bg-red-50",
  },
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  change,
  color = "blue",
  className,
}: StatsCardProps) => {
  const config = colorConfig[color];

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full", config.iconBg)}>
          <Icon className={cn("h-4 w-4", config.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <span
              className={cn(
                "px-2 py-1 rounded-full",
                change.type === "increase"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {change.type === "increase" ? "+" : ""}
              {change.value}%
            </span>
            <span>from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
