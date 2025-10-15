import { useState, useEffect } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Users,
  Eye,
  Calendar,
  Mail,
  Phone,
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import adminService, { AdminUser } from "@/services/adminService";
import { toast } from "@/hooks/use-toast";

export const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Load users
  const loadUsers = async (page: number = 1, role?: string) => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page,
        page_size: 20,
        ...(role && role !== "all" && { role }),
      };

      const response = await adminService.getUsers(filters);

      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.total_pages);
        setCurrentPage(response.data.pagination.current_page);
      } else {
        setError(response.message || "Failed to load users");
      }
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, roleFilter === "all" ? undefined : roleFilter);
  }, [roleFilter]);

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      client: "default",
      freelancer: "secondary",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || "outline"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage and view all platform users
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({users.length})
            </CardTitle>
            <CardDescription>
              View and manage all users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="freelancer">Freelancers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-center">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            No users found
                          </h3>
                          <p className="text-muted-foreground">
                            No users match the current filter criteria.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.role === "client" && user.client_data && (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <Building className="h-3 w-3" />
                                <span>
                                  {user.client_data.company_name || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Briefcase className="h-3 w-3" />
                                <span>
                                  {user.client_data.total_jobs_posted} jobs
                                  posted
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="h-3 w-3" />
                                <span>
                                  {user.client_data.completed_jobs} completed
                                </span>
                              </div>
                            </div>
                          )}
                          {user.role === "freelancer" &&
                            user.freelancer_data && (
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-sm">
                                  <Briefcase className="h-3 w-3" />
                                  <span>
                                    {user.freelancer_data.title || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <DollarSign className="h-3 w-3" />
                                  <span>
                                    ₹{user.freelancer_data.rate || "N/A"}/hr
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>
                                    {user.freelancer_data.total_jobs_done} jobs
                                    done
                                  </span>
                                </div>
                              </div>
                            )}
                          {user.role === "admin" && (
                            <div className="text-sm text-muted-foreground">
                              Platform Administrator
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{formatDate(user.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(user)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    loadUsers(
                      currentPage - 1,
                      roleFilter === "all" ? undefined : roleFilter
                    )
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    loadUsers(
                      currentPage + 1,
                      roleFilter === "all" ? undefined : roleFilter
                    )
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Details - {selectedUser?.username}
              </DialogTitle>
              <DialogDescription>
                Detailed information about this user
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Username
                      </label>
                      <p className="text-sm">{selectedUser.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="text-sm">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Full Name
                      </label>
                      <p className="text-sm">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone
                      </label>
                      <p className="text-sm">
                        {selectedUser.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Role
                      </label>
                      <div className="mt-1">
                        {getRoleBadge(selectedUser.role)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            selectedUser.is_active ? "default" : "secondary"
                          }
                        >
                          {selectedUser.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Joined
                      </label>
                      <p className="text-sm">
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Login
                      </label>
                      <p className="text-sm">
                        {selectedUser.last_login
                          ? formatDate(selectedUser.last_login)
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role-specific Information */}
                {selectedUser.role === "freelancer" &&
                  selectedUser.freelancer_data && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Freelancer Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Title
                          </label>
                          <p className="text-sm">
                            {selectedUser.freelancer_data.title ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Category
                          </label>
                          <p className="text-sm">
                            {selectedUser.freelancer_data.category ||
                              "Not specified"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Hourly Rate
                          </label>
                          <p className="text-sm">
                            {selectedUser.freelancer_data.rate
                              ? `₹₹{selectedUser.freelancer_data.rate}/hr`
                              : "Not set"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Location
                          </label>
                          <p className="text-sm">
                            {selectedUser.freelancer_data.location ||
                              "Not specified"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Skills
                          </label>
                          <p className="text-sm">
                            {selectedUser.freelancer_data.skills ||
                              "No skills listed"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Bio
                          </label>
                          <p className="text-sm">
                            {selectedUser.freelancer_data.bio ||
                              "No bio provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Jobs Completed
                          </label>
                          <p className="text-sm font-semibold text-green-600">
                            {selectedUser.freelancer_data.total_jobs_done}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {selectedUser.role === "client" && selectedUser.client_data && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Client Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Company Name
                        </label>
                        <p className="text-sm">
                          {selectedUser.client_data.company_name ||
                            "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Jobs Posted
                        </label>
                        <p className="text-sm font-semibold text-blue-600">
                          {selectedUser.client_data.total_jobs_posted}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Jobs Completed
                        </label>
                        <p className="text-sm font-semibold text-green-600">
                          {selectedUser.client_data.completed_jobs}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUserDetails(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
