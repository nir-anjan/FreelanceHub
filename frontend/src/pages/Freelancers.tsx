import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FreelancerCard from "@/components/FreelancerCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import publicListingsService, {
  Freelancer,
} from "@/services/publicListingsService";

// Transform API Freelancer data to FreelancerCard props
const transformFreelancerData = (freelancer: Freelancer) => ({
  id: freelancer.id.toString(),
  name: freelancer.name || freelancer.username || "Unknown",
  title: freelancer.title || "Freelancer",
  avatar:
    freelancer.profile_picture ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${freelancer.username}`,
  rating: 4.5 + Math.random() * 0.5, // Mock rating for now
  reviewCount: Math.floor(Math.random() * 200) + 10, // Mock review count
  hourlyRate: freelancer.rate || 50,
  location: freelancer.location || "Remote",
  skills: freelancer.skills_list,
  category: freelancer.category || "General",
});

const Freelancers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRating, setSelectedRating] = useState("All Ratings");
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch freelancers from API
  const fetchFreelancers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page,
        page_size: 12,
        ...(searchQuery && { skills: searchQuery }), // Search in skills for now
        ...(selectedCategory !== "All Categories" && {
          category: selectedCategory,
        }),
      };

      const response = await publicListingsService.getAllFreelancers(filters);

      if (response.success) {
        setFreelancers(response.data.freelancers);
        setTotalPages(response.data.pagination.total_pages);
        setTotalCount(response.data.pagination.total_count);
        setCurrentPage(response.data.pagination.current_page);
      } else {
        setError("Failed to fetch freelancers");
      }
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      setError("Error loading freelancers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const fetchedCategories =
        await publicListingsService.getFreelancerCategories();
      setCategories(["All Categories", ...fetchedCategories]);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchFreelancers();
  }, []);

  // Refetch when search or category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFreelancers(1); // Reset to page 1 when filters change
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Apply client-side rating filter since API doesn't support it
  const filteredFreelancers = freelancers.filter((freelancer) => {
    const transformedData = transformFreelancerData(freelancer);
    const matchesRating =
      selectedRating === "All Ratings" ||
      (selectedRating === "4.5+" && transformedData.rating >= 4.5) ||
      (selectedRating === "4.0+" && transformedData.rating >= 4.0);

    return matchesRating;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 gradient-hero">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 py-10">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Top Freelancers
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect with talented professionals ready to bring your projects
              to life
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, title, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Ratings">All Ratings</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0+">4.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredFreelancers.length}
              </span>{" "}
              freelancers
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                Loading freelancers...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg">{error}</p>
              <Button
                onClick={() => fetchFreelancers(currentPage)}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Freelancers Grid */}
          {!loading && !error && filteredFreelancers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredFreelancers.map((freelancer) => (
                <FreelancerCard
                  key={freelancer.id}
                  {...transformFreelancerData(freelancer)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredFreelancers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No freelancers found matching your criteria.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && !error && (
            <div className="flex justify-center mt-8 gap-2">
              <Button
                variant="outline"
                onClick={() => fetchFreelancers(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchFreelancers(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Freelancers;
