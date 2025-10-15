import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts";
import { dashboardService } from "@/services";
import { DashboardData } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Plus,
  MessageSquare,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  IndianRupee,
  Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = "Good day";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    return `${greeting}, ${user?.first_name}!`;
  };

  const getQuickActions = () => {
    if (user?.role === "client") {
      return [
        {
          title: "Post a New Job",
          description: "Find a freelancer for your project",
          icon: Plus,
          href: "/dashboard/create-job",
          variant: "default" as const,
        },
        {
          title: "View My Jobs",
          description: "Manage your posted jobs",
          icon: Briefcase,
          href: "/dashboard/jobs",
          variant: "outline" as const,
        },
        {
          title: "Messages",
          description: "Communicate with freelancers",
          icon: MessageSquare,
          href: "/dashboard/inbox",
          variant: "outline" as const,
        },
        {
          title: "Payment History",
          description: "View your payment transactions",
          icon: CreditCard,
          href: "/dashboard/payments",
          variant: "outline" as const,
        },
      ];
    } else {
      return [
        {
          title: "Browse Jobs",
          description: "Find your next project opportunity",
          icon: Briefcase,
          href: "/jobs",
          variant: "default" as const,
        },
        {
          title: "Active Projects",
          description: "Manage your current work",
          icon: Clock,
          href: "/dashboard/active-jobs",
          variant: "outline" as const,
        },
        {
          title: "Messages",
          description: "Communicate with clients",
          icon: MessageSquare,
          href: "/dashboard/inbox",
          variant: "outline" as const,
        },
        {
          title: "Earnings",
          description: "View your payment history",
          icon: CreditCard,
          href: "/dashboard/payments",
          variant: "outline" as const,
        },
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {getWelcomeMessage()}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your{" "}
          {user?.role === "client" ? "projects" : "freelance work"} today.
        </p>
      </div>

      {/* Stats Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user?.role === "client" && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Jobs Posted
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.stats.total_jobs_posted || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time job postings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Jobs
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.stats.active_jobs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently in progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Jobs
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.stats.completed_jobs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully finished
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Spent
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{dashboardData.stats.total_spent?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time spending
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {user?.role === "freelancer" && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Earned
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{dashboardData.stats.total_earned?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time earnings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.stats.active_jobs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently working on
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Jobs
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.stats.completed_jobs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully finished
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Success Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">
                    Project completion rate
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Get started with these common tasks
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getQuickActions().map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.href}
                  variant={action.variant}
                  className="h-auto p-4 flex flex-col items-center justify-center space-y-2 overflow-hidden"
                  asChild
                >
                  <Link to={action.href}>
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your latest{" "}
            {user?.role === "client"
              ? "job postings and applications"
              : "job applications and messages"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to show</p>
            <p className="text-sm">
              {user?.role === "client"
                ? "Start by posting your first job!"
                : "Browse available jobs to get started!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
