import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminDisputeService } from "@/admin/services/disputeService";
import { Dispute } from "@/admin/types";

const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolution, setResolution] = useState("");
  const [resolveAction, setResolveAction] = useState<"resolve" | "dismiss">(
    "resolve"
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchDisputes();
  }, [currentPage, statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await adminDisputeService.getDisputes(
        currentPage,
        20,
        statusFilter === "all" ? undefined : statusFilter
      );

      setDisputes(response.data.disputes);
      setCurrentPage(response.data.pagination.current_page);
      setTotalPages(response.data.pagination.total_pages);
      setTotalCount(response.data.pagination.total_count);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;

    if (resolveAction === "resolve" && !resolution.trim()) {
      toast({
        title: "Resolution Required",
        description: "Please provide resolution notes",
        variant: "destructive",
      });
      return;
    }

    try {
      await adminDisputeService.resolveDispute(selectedDispute.id, {
        action: resolveAction,
        resolution: resolution.trim() || undefined,
      });

      toast({
        title: "Success",
        description: `Dispute ${resolveAction}d successfully`,
      });

      setShowResolveDialog(false);
      setSelectedDispute(null);
      setResolution("");
      setResolveAction("resolve");

      // Refresh disputes list
      fetchDisputes();
    } catch (error) {
      console.error(`Error ${resolveAction}ing dispute:`, error);
      toast({
        title: "Error",
        description: `Failed to ${resolveAction} dispute`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: {
        variant: "outline" as const,
        className: "text-yellow-600 border-yellow-600",
        text: "Open",
      },
      resolved: {
        variant: "outline" as const,
        className: "text-green-600 border-green-600",
        text: "Resolved",
      },
      dismissed: {
        variant: "outline" as const,
        className: "text-red-600 border-red-600",
        text: "Dismissed",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.open;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dispute Management
          </h1>
          <p className="text-gray-600">Review and resolve user disputes</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {disputes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500">No disputes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card
              key={dispute.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">
                      {dispute.job.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {dispute.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(dispute.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Dispute Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Client: {dispute.client.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Freelancer: {dispute.freelancer.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(dispute.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Dispute #{dispute.id}</Badge>
                  </div>
                </div>

                {/* Resolution Details (if resolved) */}
                {dispute.resolution && (
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Resolution
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          {dispute.resolution}
                        </p>
                        {dispute.resolved_at && dispute.resolved_by && (
                          <p className="text-xs text-green-600 mt-2">
                            Resolved on {formatDate(dispute.resolved_at)} by{" "}
                            {dispute.resolved_by}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {dispute.status === "open" && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Could add view details functionality later
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Dialog
                      open={
                        showResolveDialog && selectedDispute?.id === dispute.id
                      }
                      onOpenChange={(open) => {
                        setShowResolveDialog(open);
                        if (!open) {
                          setSelectedDispute(null);
                          setResolution("");
                          setResolveAction("resolve");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setResolveAction("resolve");
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {resolveAction === "resolve"
                              ? "Resolve"
                              : "Dismiss"}{" "}
                            Dispute
                          </DialogTitle>
                          <DialogDescription>
                            {resolveAction === "resolve"
                              ? "Provide resolution notes for this dispute"
                              : "Dismiss this dispute without resolution"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="action">Action</Label>
                            <Select
                              value={resolveAction}
                              onValueChange={(value: "resolve" | "dismiss") =>
                                setResolveAction(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="resolve">Resolve</SelectItem>
                                <SelectItem value="dismiss">Dismiss</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {resolveAction === "resolve" && (
                            <div>
                              <Label htmlFor="resolution">
                                Resolution Notes *
                              </Label>
                              <Textarea
                                id="resolution"
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                placeholder="Explain how this dispute was resolved..."
                                className="min-h-[100px]"
                              />
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowResolveDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleResolveDispute}
                            className={
                              resolveAction === "resolve"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }
                          >
                            {resolveAction === "resolve"
                              ? "Resolve"
                              : "Dismiss"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setResolveAction("dismiss");
                        setShowResolveDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
