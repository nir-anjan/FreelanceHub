import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "../shared/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Check,
  X,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  User,
} from "lucide-react";
import { Job } from "../../types";

interface JobCardProps {
  job: Job;
  onApprove: (jobId: string) => void;
  onReject: (jobId: string) => void;
  onViewDetails: (jobId: string) => void;
}

export const JobCard = ({
  job,
  onApprove,
  onReject,
  onViewDetails,
}: JobCardProps) => {
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    setIsLoading("approve");
    try {
      await onApprove(job.id);
    } finally {
      setIsLoading(null);
    }
  };

  const handleReject = async () => {
    setIsLoading("reject");
    try {
      await onReject(job.id);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold line-clamp-2 mb-2">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {job.description}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Client Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={job.client.avatar} alt={job.client.name} />
            <AvatarFallback>
              {job.client.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{job.client.name}</p>
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {"★".repeat(Math.floor(job.client.rating))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({job.client.rating}/5)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget */}
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-green-600">
            ${job.budget} {job.budgetType === "hourly" ? "/hr" : ""}
          </span>
          <Badge variant="outline" className="text-xs">
            {job.budgetType}
          </Badge>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {job.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 3} more
            </Badge>
          )}
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{job.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{job.postedDate}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{job.category}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t">
        <div className="flex space-x-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(job.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          {job.status === "pending" && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isLoading !== null}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isLoading === "approve" ? "Approving..." : "Approve"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Job</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve "{job.title}"? This job
                      will be visible to all freelancers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>
                      Approve Job
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isLoading !== null}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {isLoading === "reject" ? "Rejecting..." : "Reject"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Job</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject "{job.title}"? This action
                      cannot be undone and the client will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject Job
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
