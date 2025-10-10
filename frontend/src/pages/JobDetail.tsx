import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, DollarSign, Clock, Briefcase, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const JobDetail = () => {
  const { id } = useParams();
  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  // Mock job data (in real app, fetch based on id)
  const job = {
    id: 1,
    title: "Full Stack Web Developer",
    description: "Looking for an experienced full-stack developer to build a modern web application with React and Node.js. The project involves creating a responsive web platform with user authentication, real-time features, and integration with third-party APIs.",
    budget: "$5,000 - $10,000",
    duration: "2-3 months",
    location: "Remote",
    category: "Web Development",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "REST APIs", "Socket.io"],
    postedAt: "2 days ago",
    proposals: 15,
    clientName: "Tech Startup Inc.",
    clientRating: 4.8,
    requirements: [
      "5+ years of experience in full-stack development",
      "Strong portfolio demonstrating React and Node.js expertise",
      "Experience with real-time applications",
      "Good communication skills",
      "Available for regular video calls",
    ],
    projectDetails: `We are building a collaborative workspace platform that will allow teams to work together in real-time. The platform needs to support multiple users, have a clean and intuitive UI, and provide seamless real-time updates.
    
    Key features include:
    - User authentication and authorization
    - Real-time collaboration features
    - File sharing and management
    - Activity tracking and notifications
    - Integration with popular tools like Slack and Google Drive
    
    The ideal candidate will have experience building similar platforms and can work independently while maintaining regular communication with our team.`,
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Proposal submitted!",
      description: "The client will review your proposal and get back to you soon.",
    });
    setProposal("");
    setBidAmount("");
  };

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
                    <Badge variant="secondary">{job.category}</Badge>
                    <span className="text-sm text-muted-foreground">{job.postedAt}</span>
                  </div>
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="text-base">{job.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-semibold">{job.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-semibold">{job.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-semibold">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Proposals</p>
                        <p className="font-semibold">{job.proposals}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Project Details</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{job.projectDetails}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-success mt-1">•</span>
                          <span className="text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
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
                    <Button type="submit" className="w-full" size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Proposal
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
                    <p className="font-semibold">{job.clientName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{job.clientRating}</span>
                      <span className="text-sm text-muted-foreground">(42 reviews)</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jobs Posted</span>
                      <span className="font-medium">28</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hire Rate</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Spent</span>
                      <span className="font-medium">$125,000+</span>
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
