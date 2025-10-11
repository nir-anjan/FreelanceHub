import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, DollarSign, Clock } from "lucide-react";
import publicListingsService, { Job } from "@/services/publicListingsService";

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch jobs from API
  const fetchJobs = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page,
        page_size: 12,
        ...(searchTerm && { skills: searchTerm }), // Search in skills for now
        ...(selectedCategory !== "All" && { category: selectedCategory }),
      };

      const response = await publicListingsService.getAllJobs(filters);

      if (response.success) {
        setJobs(response.data.jobs);
        setTotalPages(response.data.pagination.total_pages);
        setTotalCount(response.data.pagination.total_count);
        setCurrentPage(response.data.pagination.current_page);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Error loading jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await publicListingsService.getJobCategories();
      setCategories(["All", ...fetchedCategories]);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchJobs();
  }, []);

  // Refetch when search or category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(1); // Reset to page 1 when filters change
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const filteredJobs = jobs; // Jobs are already filtered by the API

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Search Section */}
        <section className="gradient-hero py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Find Your Next Project
            </h1>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse thousands of freelance jobs and start building your career
              today
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
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
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
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredJobs.length}
              </span>{" "}
              jobs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="h-full shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary">
                        {job.category || "Uncategorized"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {publicListingsService.getRelativeTime(job.created_at)}
                      </span>
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {job.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-success" />
                        <span className="font-medium">
                          {publicListingsService.formatBudget(
                            job.budget_min,
                            job.budget_max
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{job.duration || "Duration not specified"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Remote</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.skills_list.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill.trim()}
                        </Badge>
                      ))}
                      {job.skills_list.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills_list.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => fetchJobs(currentPage)} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No jobs found matching your criteria.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && !error && (
            <div className="flex justify-center mt-8 gap-2">
              <Button
                variant="outline"
                onClick={() => fetchJobs(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchJobs(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
