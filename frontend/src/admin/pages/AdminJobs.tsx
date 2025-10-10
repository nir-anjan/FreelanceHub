import { useState } from "react";
import { AdminLayout } from "../components/layout/AdminLayout";
import { JobCard } from "../components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Job } from "../types";

// Mock data
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Full-Stack Web Developer for E-commerce Platform",
    description:
      "Looking for an experienced full-stack developer to build a modern e-commerce platform with React, Node.js, and PostgreSQL. The project includes user authentication, payment integration, and admin dashboard.",
    budget: 5000,
    budgetType: "fixed" as const,
    client: {
      name: "Sarah Johnson",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.8,
    },
    category: "Web Development",
    skills: ["React", "Node.js", "PostgreSQL", "Stripe API", "AWS"],
    duration: "2-3 months",
    location: "Remote",
    postedDate: "2 days ago",
    status: "pending" as const,
  },
  {
    id: "2",
    title: "Mobile App UI/UX Design",
    description:
      "Need a talented designer to create modern, user-friendly mobile app designs for iOS and Android. Should include wireframes, mockups, and interactive prototypes.",
    budget: 75,
    budgetType: "hourly" as const,
    client: {
      name: "Mike Chen",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.6,
    },
    category: "UI/UX Design",
    skills: ["Figma", "Adobe XD", "Mobile Design", "Prototyping"],
    duration: "3-4 weeks",
    location: "Remote",
    postedDate: "1 day ago",
    status: "pending" as const,
  },
  {
    id: "3",
    title: "Content Writer for Tech Blog",
    description:
      "Seeking an experienced content writer to create engaging articles about technology trends, software development, and digital marketing.",
    budget: 50,
    budgetType: "hourly" as const,
    client: {
      name: "Emma Davis",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.9,
    },
    category: "Content Writing",
    skills: ["Technical Writing", "SEO", "Research", "WordPress"],
    duration: "Ongoing",
    location: "Remote",
    postedDate: "3 hours ago",
    status: "approved" as const,
  },
  {
    id: "4",
    title: "Logo Design for Startup",
    description:
      "Looking for a creative logo designer to create a modern, professional logo for our tech startup. Should include multiple concepts and revisions.",
    budget: 800,
    budgetType: "fixed" as const,
    client: {
      name: "David Wilson",
      avatar: "/placeholder-avatar.jpg",
      rating: 4.4,
    },
    category: "Graphic Design",
    skills: ["Logo Design", "Adobe Illustrator", "Brand Identity"],
    duration: "1-2 weeks",
    location: "Remote",
    postedDate: "5 days ago",
    status: "rejected" as const,
  },
];

export const AdminJobs = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const handleApprove = async (jobId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: "approved" as const } : job
      )
    );

    toast({
      title: "Job Approved",
      description: "The job has been approved successfully.",
    });
  };

  const handleReject = async (jobId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: "rejected" as const } : job
      )
    );

    toast({
      title: "Job Rejected",
      description: "The job has been rejected.",
      variant: "destructive",
    });
  };

  const handleViewDetails = (jobId: string) => {
    // Navigate to job details or open modal
    console.log("View details for job:", jobId);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || job.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusCounts = () => {
    return {
      pending: jobs.filter((job) => job.status === "pending").length,
      approved: jobs.filter((job) => job.status === "approved").length,
      rejected: jobs.filter((job) => job.status === "rejected").length,
    };
  };

  const statusCounts = getStatusCounts();
  const categories = [...new Set(jobs.map((job) => job.category))];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Jobs Management
            </h1>
            <p className="text-muted-foreground">
              Review and approve job postings from clients
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              Pending
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{statusCounts.approved}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-800">
              Approved
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{statusCounts.rejected}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-800">
              Rejected
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs, clients, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-muted-foreground mb-4">
              <Search className="h-full w-full" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
