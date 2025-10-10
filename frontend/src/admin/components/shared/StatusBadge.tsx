import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "inactive"
  | "completed"
  | "in-progress"
  | "resolved"
  | "open";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  open: {
    label: "Open",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
