import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import publicListingsService, {
  JobDetail as JobDetailType,
} from "@/services/publicListingsService";
import chatService from "@/services/chatService";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [job, setJob] = useState<JobDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) {
        setError("Job ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await publicListingsService.getJobById(parseInt(id));

        if (response.success) {
          setJob(response.data);
        } else {
          setError(response.message || "Failed to fetch job details");
        }
      } catch (err: any) {
        console.error("Error fetching job details:", err);
        if (err.response?.status === 404) {
          setError("Job not found or no longer available");
        } else {
          setError("Error loading job details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!job || !proposal.trim() || !bidAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingProposal(true);

      // Create proposal chat thread
      const chatResponse = await chatService.createProposalChat(job.id);

      // Here you would also submit the actual proposal to your proposals API
      // For now, we'll just show success and redirect to chat

      toast({
        title: "Proposal submitted!",
        description: chatResponse.created
          ? "Your proposal has been submitted and a chat has been started with the client."
          : "Your proposal has been submitted. Continue the conversation in chat.",
      });

      // Clear form
      setProposal("");
      setBidAmount("");

      // Redirect to chat after a short delay
      setTimeout(() => {
        navigate(chatResponse.redirect_url);
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting proposal:", error);

      let errorMessage = "Failed to submit proposal. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading job details...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No job found
  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Job not found.</AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{job.category}</Badge>
                      {job.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300">
                          Pending Approval
                        </Badge>
                      )}
                      {job.status === "open" && (
                        <Badge variant="default">Open</Badge>
                      )}
                      {job.status === "in_progress" && (
                        <Badge variant="secondary">In Progress</Badge>
                      )}
                      {job.status === "completed" && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Completed
                        </Badge>
                      )}
                      {job.status === "cancelled" && (
                        <Badge variant="destructive">Cancelled</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {publicListingsService.getRelativeTime(job.created_at)}
                    </span>
                  </div>
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="text-base">
                    {job.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-semibold">
                          {publicListingsService.formatBudget(
                            job.budget_min,
                            job.budget_max
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="font-semibold">{job.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Location
                        </p>
                        <p className="font-semibold">Remote</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Proposals
                        </p>
                        <p className="font-semibold">{job.proposals_count}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      Project Details
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {job.project_details || job.description}
                    </p>
                  </div>

                  <Separator />

                  {job.requirements && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        Requirements
                      </h3>
                      <div className="text-muted-foreground whitespace-pre-line">
                        {job.requirements}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      Skills Required
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_list.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Proposal Form */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Submit a Proposal</CardTitle>
                  <CardDescription>
                    Stand out from other freelancers by writing a great proposal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitProposal} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bid">Your Bid Amount ($)</Label>
                      <Input
                        id="bid"
                        type="number"
                        placeholder="5000"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proposal">Cover Letter</Label>
                      <Textarea
                        id="proposal"
                        placeholder="Explain why you're the best fit for this project..."
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        rows={8}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={submittingProposal}
                    >
                      {submittingProposal ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Proposal
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">About the Client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold">{job.client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{job.client.username}
                    </p>
                    {job.client.company_name &&
                      job.client.company_name !== job.client.name && (
                        <p className="text-sm text-muted-foreground">
                          {job.client.company_name}
                        </p>
                      )}
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Member Since
                      </span>
                      <span className="font-medium">
                        {new Date(job.client.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact</span>
                      <span className="font-medium">{job.client.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">Tips for Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>Write a personalized cover letter</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>Highlight relevant experience</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>Include portfolio samples</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>Be realistic with your bid</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetail;
