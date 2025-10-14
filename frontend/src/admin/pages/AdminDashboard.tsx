import { useState, useEffect } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { StatsCard } from "../components/shared/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  FileText,
  Scale,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import adminService, {
  AdminStats,
  RecentJob,
  RecentPayment,
} from "@/services/adminService";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for charts (keeping for now until we have more historical data)
  const revenueData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 22000 },
    { month: "May", revenue: 25000 },
    { month: "Jun", revenue: 28000 },
  ];

  const userGrowthData = [
    { month: "Jan", users: 120 },
    { month: "Feb", users: 180 },
    { month: "Mar", users: 250 },
    { month: "Apr", users: 320 },
    { month: "May", users: 410 },
    { month: "Jun", users: 520 },
  ];

  // Load admin overview data
  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await adminService.getOverview();

        if (response.success) {
          setStats(response.data.stats);
          setRecentJobs(response.data.recent_activity.recent_jobs);
          setRecentPayments(response.data.recent_activity.recent_payments);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err: any) {
        console.error("Error loading admin overview:", err);
        if (err.response?.status === 403) {
          setError("Access denied. Admin privileges required.");
        } else if (err.response?.status === 401) {
          setError("Authentication required. Please log in again.");
        } else {
          setError("Failed to load dashboard data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  // Generate job completion data from stats
  const jobCompletionData = stats
    ? [
        { status: "Open", count: stats.open_jobs, fill: "#3b82f6" },
        { status: "Pending", count: stats.pending_jobs, fill: "#f59e0b" },
        {
          status: "Total",
          count: stats.total_jobs,
          fill: "#22c55e",
        },
      ]
    : [];

  // Combine recent activities
  const recentActivities = [
    ...recentJobs.map((job) => ({
      id: `job-${job.id}`,
      type: "job_created",
      message: `New job '${job.title}' created`,
      time: adminService.getRelativeTime(job.created_at),
      user: job.client,
    })),
    ...recentPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      type: "payment_processed",
      message: `Payment of ${adminService.formatCurrency(
        payment.amount
      )} processed`,
      time: adminService.getRelativeTime(payment.created_at),
      user: payment.client,
    })),
  ]
    .sort((a, b) => {
      // Sort by most recent first (approximate, since we're using relative time)
      return a.time.localeCompare(b.time);
    })
    .slice(0, 4);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <Alert>
          <AlertDescription>No dashboard data available.</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard. Here's what's happening on your
            platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.total_users.toLocaleString()}
            icon={Users}
            change={{ value: 12.5, type: "increase" }}
            color="blue"
          />
          <StatsCard
            title="Jobs Pending"
            value={stats.pending_jobs.toString()}
            icon={FileText}
            change={{
              value: stats.pending_jobs > 5 ? 10 : -5,
              type: stats.pending_jobs > 5 ? "increase" : "decrease",
            }}
            color="yellow"
          />
          <StatsCard
            title="Active Disputes"
            value={stats.open_disputes.toString()}
            icon={Scale}
            change={{
              value: stats.open_disputes > 3 ? 5 : -10,
              type: stats.open_disputes > 3 ? "increase" : "decrease",
            }}
            color="red"
          />
          <StatsCard
            title="Monthly Revenue"
            value={adminService.formatCurrency(stats.monthly_revenue)}
            icon={DollarSign}
            change={{ value: 15.2, type: "increase" }}
            color="green"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Revenue
              </CardTitle>
              <CardDescription>
                Revenue growth over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Growth
              </CardTitle>
              <CardDescription>
                New user registrations over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, "New Users"]} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Job Completion Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Job Status
              </CardTitle>
              <CardDescription>Current job completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={jobCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest actions and events on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
