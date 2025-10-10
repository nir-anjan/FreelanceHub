import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWindow from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, ArrowLeft, Mail, Award } from "lucide-react";

// Mock data for freelancer profiles
const mockFreelancers: Record<string, any> = {
  "1": {
    id: "1",
    name: "Sarah Johnson",
    title: "Senior Full Stack Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 85,
    location: "San Francisco, USA",
    category: "Web Development",
    skills: [
      "React",
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "AWS",
      "Docker",
      "GraphQL",
    ],
    bio: "I'm a passionate full-stack developer with over 8 years of experience building scalable web applications. I specialize in React, Node.js, and cloud infrastructure. I've worked with startups and enterprises alike, helping them bring their digital products to life.\n\nMy approach is collaborative and iterative. I believe in writing clean, maintainable code and delivering projects on time. Whether you need a new application built from scratch or help optimizing an existing system, I'm here to help.",
    completedProjects: 156,
    portfolio: [
      {
        id: 1,
        title: "E-commerce Platform",
        image:
          "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=400",
      },
      {
        id: 2,
        title: "SaaS Dashboard",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      },
      {
        id: 3,
        title: "Mobile Banking App",
        image:
          "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400",
      },
      {
        id: 4,
        title: "Healthcare Portal",
        image:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
      },
      {
        id: 5,
        title: "Social Media Platform",
        image:
          "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
      },
      {
        id: 6,
        title: "Real Estate Website",
        image:
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
      },
    ],
    reviews: [
      {
        id: 1,
        clientName: "Michael Chen",
        rating: 5,
        comment:
          "Sarah is an exceptional developer. She delivered our e-commerce platform ahead of schedule and the code quality is outstanding. Highly recommend!",
        date: "2 weeks ago",
      },
      {
        id: 2,
        clientName: "Emily Rodriguez",
        rating: 5,
        comment:
          "Working with Sarah was a pleasure. She understood our requirements perfectly and provided valuable suggestions throughout the project.",
        date: "1 month ago",
      },
      {
        id: 3,
        clientName: "David Park",
        rating: 4,
        comment:
          "Great communication and technical skills. The project was completed successfully with minor revisions needed.",
        date: "2 months ago",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Michael Chen",
    title: "UI/UX Designer & Brand Strategist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 75,
    location: "New York, USA",
    category: "Design",
    skills: [
      "UI/UX Design",
      "Figma",
      "Adobe XD",
      "Prototyping",
      "Brand Identity",
      "Design Systems",
    ],
    bio: "Award-winning designer with a passion for creating intuitive and beautiful digital experiences. I've helped over 50 companies transform their digital presence through thoughtful design.\n\nMy process starts with understanding your users and business goals. From there, I craft design solutions that not only look great but also drive results. Let's create something amazing together!",
    completedProjects: 98,
    portfolio: [
      {
        id: 1,
        title: "Mobile App Design",
        image:
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400",
      },
      {
        id: 2,
        title: "Brand Identity",
        image:
          "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
      },
      {
        id: 3,
        title: "Website Redesign",
        image:
          "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400",
      },
    ],
    reviews: [
      {
        id: 1,
        clientName: "Sarah Williams",
        rating: 5,
        comment:
          "Michael's design work exceeded our expectations. The UI is beautiful and our users love it!",
        date: "3 weeks ago",
      },
    ],
  },
};

const FreelancerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const freelancer = mockFreelancers[id || "1"] || mockFreelancers["1"];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-accent text-accent"
            : "fill-muted text-muted"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/50 to-white">
      <Header />

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-12">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/freelancers")}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Freelancers
          </Button>

          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-primary/10">
                  <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                  <AvatarFallback className="text-3xl">
                    {freelancer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-grow text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                    {freelancer.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-4">
                    {freelancer.title}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {renderStars(freelancer.rating)}
                      <span className="ml-2 font-medium text-foreground">
                        {freelancer.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({freelancer.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{freelancer.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-accent" />
                      <span className="text-sm text-muted-foreground">
                        {freelancer.completedProjects} projects completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3">
                  <div className="text-center md:text-right">
                    <div className="text-3xl font-bold text-primary">
                      ${freelancer.hourlyRate}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per hour
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full md:w-auto"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Hire Me
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                About Me
              </h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {freelancer.bio}
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((skill: string) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-4 py-2 text-sm font-medium"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Section */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Portfolio
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {freelancer.portfolio.map((item: any) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer overflow-hidden rounded-xl bg-muted"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4 bg-card">
                      <h3 className="font-medium text-foreground">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Client Reviews
              </h2>
              <div className="space-y-6">
                {freelancer.reviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="border border-border rounded-xl p-6 bg-card/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {review.clientName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {review.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        freelancerName={freelancer.name}
        freelancerAvatar={freelancer.avatar}
      />
    </div>
  );
};

export default FreelancerProfile;
