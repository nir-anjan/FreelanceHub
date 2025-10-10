import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, DollarSign, Clock } from "lucide-react";

// Mock job data
const jobs = [
  {
    id: 1,
    title: "Full Stack Web Developer",
    description: "Looking for an experienced full-stack developer to build a modern web application with React and Node.js.",
    budget: "$5,000 - $10,000",
    duration: "2-3 months",
    location: "Remote",
    category: "Web Development",
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    postedAt: "2 days ago",
  },
  {
    id: 2,
    title: "UI/UX Designer for Mobile App",
    description: "Need a creative designer to design user interfaces for a fintech mobile application.",
    budget: "$3,000 - $5,000",
    duration: "1-2 months",
    location: "Remote",
    category: "Design",
    skills: ["Figma", "UI Design", "Mobile Design", "Prototyping"],
    postedAt: "1 day ago",
  },
  {
    id: 3,
    title: "Content Writer - Tech Blog",
    description: "Seeking an experienced tech writer to create engaging blog posts about AI and machine learning.",
    budget: "$500 - $1,000",
    duration: "Ongoing",
    location: "Remote",
    category: "Writing",
    skills: ["Content Writing", "SEO", "Technical Writing"],
    postedAt: "3 days ago",
  },
  {
    id: 4,
    title: "Python Developer for Data Analysis",
    description: "Need a Python expert to analyze large datasets and create visualization dashboards.",
    budget: "$4,000 - $7,000",
    duration: "1 month",
    location: "Remote",
    category: "Data Science",
    skills: ["Python", "Pandas", "Data Visualization", "SQL"],
    postedAt: "1 week ago",
  },
  {
    id: 5,
    title: "Social Media Marketing Manager",
    description: "Looking for a creative marketer to manage our social media presence and grow our audience.",
    budget: "$2,000 - $4,000",
    duration: "3 months",
    location: "Remote",
    category: "Marketing",
    skills: ["Social Media", "Content Strategy", "Analytics"],
    postedAt: "5 days ago",
  },
  {
    id: 6,
    title: "WordPress Developer",
    description: "Need an experienced WordPress developer to customize and optimize our e-commerce website.",
    budget: "$1,500 - $3,000",
    duration: "1 month",
    location: "Remote",
    category: "Web Development",
    skills: ["WordPress", "WooCommerce", "PHP", "CSS"],
    postedAt: "4 days ago",
  },
];

const categories = ["All", "Web Development", "Design", "Writing", "Data Science", "Marketing"];

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Search Section */}
        <section className="gradient-hero py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Find Your Next Project</h1>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse thousands of freelance jobs and start building your career today
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 shadow-card"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b bg-background/95 backdrop-blur sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> jobs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="h-full shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary">{job.category}</Badge>
                      <span className="text-sm text-muted-foreground">{job.postedAt}</span>
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{job.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-success" />
                        <span className="font-medium">{job.budget}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{job.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
