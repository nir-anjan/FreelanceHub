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
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  DollarSign,
  User,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import adminService, { PendingJob } from "@/services/adminService";
import { toast } from "@/hooks/use-toast";

export const AdminJobs = () => {
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load pending jobs
  const loadPendingJobs = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getPendingJobs({
        page,
        page_size: 10,
      });

      if (response.success) {
        setJobs(response.data.jobs);
        setCurrentPage(response.data.pagination.current_page);
        setTotalPages(response.data.pagination.total_pages);
      } else {
        setError("Failed to load pending jobs");
      }
    } catch (err: any) {
      console.error("Error loading pending jobs:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else {
        setError("Failed to load pending jobs. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingJobs();
  }, []);

  const handleJobAction = async (
    job: PendingJob,
    action: "approve" | "reject"
  ) => {
    setActionLoading(job.id);

    try {
      let response;
      if (action === "approve") {
        response = await adminService.approveJob(job.id);
      } else {
        response = await adminService.rejectJob(job.id);
      }

      if (response.success) {
        toast({
          title: `Job ${action}d`,
          description: `"${job.title}" has been ${action}d successfully.`,
          variant: "default",
        });

        // Remove the job from the list
        setJobs((prev) => prev.filter((j) => j.id !== job.id));
        setShowActionDialog(false);
        setSelectedJob(null);
      } else {
        toast({
          title: "Action failed",
          description: response.message || `Failed to ${action} job`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error(`Error ${action}ing job:`, err);
      toast({
        title: "Action failed",
        description: `Failed to ${action} job. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const openActionDialog = (job: PendingJob, action: "approve" | "reject") => {
    setSelectedJob(job);
    setActionType(action);
    setShowActionDialog(true);
  };

  const openJobDetails = (job: PendingJob) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading pending jobs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Moderation</h1>
          <p className="text-muted-foreground">
            Review and approve job postings before they go live
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Jobs
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting your review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                There are no pending jobs to review at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {job.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-600"
                    >
                      Pending
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Job Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{job.client.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {job.budget_min && job.budget_max
                          ? `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`
                          : job.budget_min
                          ? `$${job.budget_min.toLocaleString()}+`
                          : job.budget_max
                          ? `Up to $${job.budget_max.toLocaleString()}`
                          : "Budget not specified"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {adminService.getRelativeTime(job.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {job.category || "Uncategorized"}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openJobDetails(job)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openActionDialog(job, "approve")}
                      disabled={actionLoading === job.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === job.id && actionType === "approve" ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openActionDialog(job, "reject")}
                      disabled={actionLoading === job.id}
                    >
                      {actionLoading === job.id && actionType === "reject" ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => loadPendingJobs(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => loadPendingJobs(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}

        {/* Job Details Dialog */}
        <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedJob?.title}</DialogTitle>
              <DialogDescription>
                Posted by {selectedJob?.client.name} (
                {selectedJob?.client.username})
              </DialogDescription>
            </DialogHeader>

            {selectedJob && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Budget</h4>
                    <p className="text-sm">
                      {selectedJob.budget_min && selectedJob.budget_max
                        ? `$${selectedJob.budget_min.toLocaleString()} - $${selectedJob.budget_max.toLocaleString()}`
                        : selectedJob.budget_min
                        ? `$${selectedJob.budget_min.toLocaleString()}+`
                        : selectedJob.budget_max
                        ? `Up to $${selectedJob.budget_max.toLocaleString()}`
                        : "Budget not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Duration</h4>
                    <p className="text-sm">
                      {selectedJob.duration || "Not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Client Information</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Name:</strong> {selectedJob.client.name}
                    </p>
                    <p>
                      <strong>Username:</strong> {selectedJob.client.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedJob.client.email}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Posted</h4>
                  <p className="text-sm">
                    {adminService.formatDate(selectedJob.created_at)}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowJobDetails(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Approve Job" : "Reject Job"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "approve"
                  ? "This job will be published and made visible to freelancers."
                  : "This job will be rejected and not published. The client will be notified."}
              </DialogDescription>
            </DialogHeader>

            {selectedJob && (
              <div className="py-4">
                <p className="font-medium">{selectedJob.title}</p>
                <p className="text-sm text-muted-foreground">
                  by {selectedJob.client.name}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowActionDialog(false)}
                disabled={actionLoading !== null}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "approve" ? "default" : "destructive"}
                onClick={() =>
                  selectedJob && handleJobAction(selectedJob, actionType)
                }
                disabled={actionLoading !== null}
              >
                {actionLoading !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${actionType === "approve" ? "Approve" : "Reject"} Job`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
