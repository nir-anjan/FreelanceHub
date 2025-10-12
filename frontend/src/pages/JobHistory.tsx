import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "@/services";
import { Job } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Plus,
  Calendar,
  IndianRupee,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const JobHistory: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobHistory();
  }, []);

  const fetchJobHistory = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getJobHistory();
      if (response.success) {
        setJobs(response.data.jobs);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error fetching job history:", error);
      toast({
        title: "Error",
        description: "Failed to load job history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: {
        variant: "default" as const,
        icon: Clock,
        label: "Open",
        className: undefined as string | undefined,
      },
      pending: {
        variant: "secondary" as const,
        icon: AlertCircle,
        label: "Pending Approval",
        className:
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300",
      },
      in_progress: {
        variant: "secondary" as const,
        icon: Users,
        label: "In Progress",
        className: undefined as string | undefined,
      },
      completed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Completed",
        className: undefined as string | undefined,
      },
      cancelled: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Cancelled",
        className: undefined as string | undefined,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`flex items-center space-x-1 ${config.className || ""}`}
      >
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
    if (min) return `₹${min.toLocaleString()}+`;
    if (max) return `Up to ₹${max.toLocaleString()}`;
    return "Not specified";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Briefcase className="h-8 w-8 mr-3" />
            My Jobs
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your job postings and track applications
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/create-job">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Jobs
                </p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">
                  {jobs.filter((job) => job.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Open
                </p>
                <p className="text-2xl font-bold">
                  {jobs.filter((job) => job.status === "open").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-2xl font-bold">
                  {jobs.filter((job) => job.status === "in_progress").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold">
                  {jobs.filter((job) => job.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first job posting to find talented
                freelancers.
              </p>
              <Button asChild>
                <Link to="/dashboard/create-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Job Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Posted {formatDate(job.created_at)}</span>
                            </div>
                            {job.category && (
                              <Badge variant="outline">{job.category}</Badge>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>

                      {/* Job Description */}
                      <p className="text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>

                      {/* Job Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Budget</p>
                            <p className="text-sm text-muted-foreground">
                              {formatBudget(job.budget_min, job.budget_max)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Proposals</p>
                            <p className="text-sm text-muted-foreground">
                              {job.proposals_count} received
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">
                              {job.duration || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.skills && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.split(",").map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end space-x-2 pt-2 border-t">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {job.status === "open" && (
                          <Button variant="outline" size="sm">
                            Edit Job
                          </Button>
                        )}
                        {job.proposals_count > 0 && (
                          <Button size="sm">
                            View Proposals ({job.proposals_count})
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobHistory;
