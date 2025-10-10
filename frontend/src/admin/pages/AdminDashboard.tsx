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
} from "lucide-react";

// Mock data for charts
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

const jobCompletionData = [
  { status: "Completed", count: 156, fill: "#22c55e" },
  { status: "In Progress", count: 89, fill: "#f59e0b" },
  { status: "Pending", count: 45, fill: "#ef4444" },
];

const recentActivities = [
  {
    id: 1,
    type: "job_approved",
    message: "Job 'Website Development' approved",
    time: "2 minutes ago",
    user: "John Smith",
  },
  {
    id: 2,
    type: "dispute_resolved",
    message: "Dispute #1234 resolved in favor of freelancer",
    time: "15 minutes ago",
    user: "Sarah Johnson",
  },
  {
    id: 3,
    type: "user_registered",
    message: "New freelancer registered",
    time: "1 hour ago",
    user: "Mike Wilson",
  },
  {
    id: 4,
    type: "transaction_completed",
    message: "Payment of $500 processed",
    time: "2 hours ago",
    user: "Emma Davis",
  },
];

export const AdminDashboard = () => {
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
            value="2,847"
            icon={Users}
            change={{ value: 12.5, type: "increase" }}
            color="blue"
          />
          <StatsCard
            title="Jobs Pending"
            value="12"
            icon={FileText}
            change={{ value: -8.3, type: "decrease" }}
            color="yellow"
          />
          <StatsCard
            title="Active Disputes"
            value="3"
            icon={Scale}
            change={{ value: -25.0, type: "decrease" }}
            color="red"
          />
          <StatsCard
            title="Monthly Revenue"
            value="$28,450"
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
