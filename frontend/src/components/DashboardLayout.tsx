import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts";
import { dashboardService } from "@/services";
import { DashboardData } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  CreditCard,
  Plus,
  History,
  Users,
  IndianRupee,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        name: "Overview",
        path: "/dashboard",
        icon: LayoutDashboard,
        description: "Dashboard overview",
      },
      {
        name: "Inbox",
        path: "/dashboard/inbox",
        icon: MessageSquare,
        description: "Messages and chat",
      },
      {
        name: "Payments",
        path: "/dashboard/payments",
        icon: CreditCard,
        description: "Payment history",
      },
    ];

    if (user?.role === "client") {
      return [
        ...baseItems.slice(0, 1), // Overview
        {
          name: "Create Job",
          path: "/dashboard/create-job",
          icon: Plus,
          description: "Post a new job",
        },
        {
          name: "My Jobs",
          path: "/dashboard/jobs",
          icon: Briefcase,
          description: "Manage your job posts",
        },
        ...baseItems.slice(1), // Inbox, Payments
      ];
    } else if (user?.role === "freelancer") {
      return [
        ...baseItems.slice(0, 1), // Overview
        {
          name: "Active Jobs",
          path: "/dashboard/active-jobs",
          icon: Briefcase,
          description: "Your current projects",
        },
        ...baseItems.slice(1), // Inbox, Payments
      ];
    }

    return baseItems;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user?.profile_picture}
                      alt={`${user?.first_name} ${user?.last_name}`}
                    />
                    <AvatarFallback>
                      {user && getUserInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {user?.first_name} {user?.last_name}
                    </h3>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Overview */}
            {dashboardData && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user?.role === "client" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Jobs Posted
                        </span>
                        <span className="font-semibold">
                          {dashboardData.stats.total_jobs_posted || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Active
                        </span>
                        <span className="font-semibold">
                          {dashboardData.stats.active_jobs || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Total Spent
                        </span>
                        <span className="font-semibold flex items-center">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {dashboardData.stats.total_spent?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                    </>
                  )}
                  {user?.role === "freelancer" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Total Earned
                        </span>
                        <span className="font-semibold flex items-center">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {dashboardData.stats.total_earned?.toLocaleString() ||
                            0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Active Jobs
                        </span>
                        <span className="font-semibold">
                          {dashboardData.stats.active_jobs || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Completed
                        </span>
                        <span className="font-semibold">
                          {dashboardData.stats.completed_jobs || 0}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {getNavItems().map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-3"
                      asChild
                    >
                      <Link to={item.path}>
                        <Icon className="mr-3 h-4 w-4" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
