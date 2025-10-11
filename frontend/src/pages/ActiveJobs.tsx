import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "@/services";
import { Job } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  ExternalLink,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  Building,
  User,
  MessageSquare,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ActiveJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const fetchActiveJobs = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardService.getActiveJobs();
      if (response.success) {
        setJobs(response.data.jobs);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load active jobs",
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
        color: "bg-blue-100 text-blue-800",
      },
      in_progress: {
        variant: "secondary" as const,
        icon: Clock,
        label: "In Progress",
        color: "bg-yellow-100 text-yellow-800",
      },
      completed: {
        variant: "default" as const,
        icon: CheckCircle,
        label: "Completed",
        color: "bg-green-100 text-green-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
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

  const getClientInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
            Active Projects
          </h1>
          <p className="text-muted-foreground mt-2">
            Your current projects and job applications
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/jobs">
            <ExternalLink className="h-4 w-4 mr-2" />
            Browse Jobs
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Projects
                </p>
                <p className="text-2xl font-bold">{jobs.length}</p>
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
          <CardTitle>Project Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active projects</h3>
              <p className="text-muted-foreground mb-4">
                Start applying to jobs to see your active projects here.
              </p>
              <Button asChild>
                <Link to="/jobs">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse Available Jobs
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
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>

                          {/* Client Info */}
                          {job.client && (
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getClientInitials(job.client.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {job.client.name}
                                </p>
                                {job.client.company_name && (
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <Building className="h-3 w-3 mr-1" />
                                    {job.client.company_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Started {formatDate(job.created_at)}</span>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
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
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          Project ID: #{job.id}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Client
                          </Button>
                          <Button size="sm">View Details</Button>
                        </div>
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

export default ActiveJobs;
