import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts";
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Freelancers from "./pages/Freelancers";
import FreelancerProfile from "./pages/FreelancerProfile";
import NotFound from "./pages/NotFound";
import { AdminDashboard } from "./admin/pages/AdminDashboard";
import { AdminJobs } from "./admin/pages/AdminJobs";
import { AdminUsers } from "./admin/pages/AdminUsers";
import AdminDisputes from "./admin/pages/AdminDisputes";
import AdminLogin from "./admin/pages/AdminLogin";
// Dashboard Components
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import JobForm from "./pages/JobForm";
import JobHistory from "./pages/JobHistory";
import ActiveJobs from "./pages/ActiveJobs";
import Inbox from "./pages/Inbox";
import ChatWindow from "./pages/ChatWindow";
import PaymentHistory from "./pages/PaymentHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />

            {/* Guest Only Routes - Redirect to dashboard if already authenticated */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route
              path="/admin/login"
              element={
                <GuestRoute>
                  <AdminLogin />
                </GuestRoute>
              }
            />

            {/* Public job and freelancer listings */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/freelancers" element={<Freelancers />} />
            <Route path="/freelancers/:id" element={<FreelancerProfile />} />

            {/* Admin Only Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <AdminRoute>
                  <AdminJobs />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/disputes"
              element={
                <AdminRoute>
                  <AdminDisputes />
                </AdminRoute>
              }
            />

            {/* Protected Routes (require authentication but any role) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />
            {/* Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Default dashboard route */}
              <Route index element={<Dashboard />} />

              {/* Client-specific routes */}
              <Route path="create-job" element={<JobForm />} />
              <Route path="jobs" element={<JobHistory />} />

              {/* Freelancer-specific routes */}
              <Route path="active-jobs" element={<ActiveJobs />} />

              {/* Shared routes */}
              <Route path="inbox" element={<Inbox />} />
              <Route path="inbox/:threadId" element={<ChatWindow />} />
              <Route path="payments" element={<PaymentHistory />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
