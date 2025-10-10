import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Scale,
  Users,
  CreditCard,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    count: null,
  },
  {
    title: "Jobs Pending",
    href: "/admin/jobs",
    icon: FileText,
    count: 12, // Mock count
  },
  {
    title: "Disputes",
    href: "/admin/disputes",
    icon: Scale,
    count: 3, // Mock count
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    count: null,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
    count: null,
  },
];

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Mobile Close Button */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <h2 className="text-lg font-semibold">Navigation</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted"
                )}
                asChild
              >
                <Link to={item.href} onClick={() => onClose()}>
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.count && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className="ml-auto h-5 px-2 text-xs"
                    >
                      {item.count}
                    </Badge>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>FreelanceMarketplace</p>
          <p>Admin Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:bg-background">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r bg-background">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
